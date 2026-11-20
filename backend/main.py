
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request, Query, status, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from supabase import create_client, Client

# Import our custom modules
from file_processing import extract_text_from_file
from ai_helpers import parse_cv_text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only! Use specific origins in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Profile(BaseModel):
    name: str
    email: str
    education: str    # needed
    experience: str
    projects: str
    interests: str
    skills: List[str]

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# --- Add POST endpoint to save user profile ---
@app.post("/api/user/profile")
async def save_profile(profile: Profile):
    print("Received profile request")
    try:
        # Check if user already exists (by email)
        existing = supabase.table("users").select("*").eq("email", profile.email).execute()
        user_data = None
        if existing.data and len(existing.data) > 0:
            user_data = existing.data[0]
        if user_data:
            print("User already exists, updating profile.")
            update_result = supabase.table("users").update({
                "name": profile.name,
                "profile_data": profile.dict()
            }).eq("email", profile.email).execute()
            print("Profile update completed")
            return JSONResponse({"status": "updated", "profile": profile.dict()}, status_code=status.HTTP_200_OK)
        # Insert new user
        result = supabase.table("users").insert({
            "name": profile.name,
            "email": profile.email,
            "profile_data": profile.dict()
        }).execute()
        print("Profile insert completed")
        if result.data:
            return JSONResponse({"status": "success", "profile": profile.dict()}, status_code=status.HTTP_201_CREATED)
        else:
            print("Supabase insert error:", result.error)
            return JSONResponse({"status": "error", "message": "Failed to insert user profile.", "error": str(result.error)}, status_code=500)
    except Exception as e:
        print("Exception during Supabase insert:", e)
        return JSONResponse({"status": "error", "message": "Exception occurred while saving profile.", "error": str(e)}, status_code=500)


@app.get("/api/dashboard")
async def get_dashboard(email: str):
    # Fetch user profile
    user_result = supabase.table("users").select("*").eq("email", email).execute()
    user = None
    if user_result.data and len(user_result.data) > 0:
        user = user_result.data[0]
    if not user:
        return {"error": "User not found"}

    # Fetch roadmap
    roadmap_result = supabase.table("roadmaps").select("*").eq("user_id", user["id"]).execute()
    roadmap = None
    if roadmap_result.data and len(roadmap_result.data) > 0:
        roadmap = roadmap_result.data[0]["roadmap_data"] if "roadmap_data" in roadmap_result.data[0] else None

    # Build dashboard response (fill with real or fallback data)
    dashboard = {
        "user_id": user["id"],
        "welcome_message": f"Welcome back, {user['name']}! 🚀",
        "profile": {
            "name": user["name"],
            "career_goal": user["profile_data"].get("career_goal", "Not set"),
            "skills": user["profile_data"].get("skills", []),
            "level": user["profile_data"].get("level", "Beginner")
        },
        "progress": roadmap["progress"] if roadmap else {"percentage": 0, "milestones": []},
        "kanban": roadmap["kanban"] if roadmap else {"backlog": [], "in_progress": [], "done": []},
        "gamification": roadmap["gamification"] if roadmap else {"xp_points": 0, "badges": [], "streak": 0, "level": 1, "achievements": []},
        "last_updated": roadmap_result.data[0]["updated_at"] if roadmap_result.data and "updated_at" in roadmap_result.data[0] else None
    }
    return dashboard

# Import the caching utilities
from cache_utils import get_cache_key, get_from_cache, save_to_cache

# CV Upload and Parsing Endpoint
@app.post("/api/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    """
    Upload and parse a CV file (PDF or DOCX).

    This endpoint extracts text from the uploaded file and uses AI to parse it into structured data.
    """
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    try:
        # Extract text from file
        print("Extracting text from uploaded CV...")
        extracted_text = await extract_text_from_file(file)

        if not extracted_text or len(extracted_text) < 50:  # Basic validation
            print("Insufficient text extracted, using fallback methods")
            # Still attempt fallback extraction even with limited text
            fallback_data = {
                "name": "Name not detected",
                "email": "Email not detected",
                "phone": "Phone not detected",
                "skills": ["Insufficient document text"],
                "education": "Could not extract education information",
                "work_experience": "Could not extract work experience",
                "projects": "Could not extract projects",
                "interests": ["Document processing issue"]
            }
            return {
                "status": "success",
                "data": fallback_data,
                "source": "fallback_extraction"
            }

        # Check cache first
        cache_key = get_cache_key(extracted_text)
        cached_result = get_from_cache(cache_key)

        if cached_result:
            print("Using cached CV parsing result")
            return {
                "status": "success",
                "data": cached_result,
                "source": "cache"
            }

        # Parse the extracted text
        print("Parsing CV text with AI...")
        parsed_cv = await parse_cv_text(extracted_text)

        # Handle different response formats
        if "api_error" in parsed_cv:
            # This is the fallback data from our extraction methods
            print(f"Using fallback data due to API error: {parsed_cv['api_error']}")
            result_data = parsed_cv.get("parsed_data", {})
            save_to_cache(cache_key, result_data)
            return {
                "status": "success",
                "data": result_data,
                "source": "fallback",
                "message": parsed_cv.get("message", "Using basic extraction due to API limits")
            }
        elif "error" in parsed_cv:
            # Still return what we have instead of raising an exception
            print(f"Error in parsing: {parsed_cv['error']}")
            fallback_data = {
                "name": extract_name(extracted_text),
                "email": extract_email(extracted_text),
                "phone": extract_phone(extracted_text),
                "skills": extract_skills(extracted_text),
                "education": extract_education(extracted_text),
                "work_experience": extract_experience(extracted_text),
                "projects": extract_projects(extracted_text),
                "interests": extract_interests(extracted_text)
            }
            return {
                "status": "partial",
                "data": fallback_data,
                "error": parsed_cv["error"]
            }
        else:
            # Successful parsing
            save_to_cache(cache_key, parsed_cv)
            return {
                "status": "success",
                "data": parsed_cv
            }
    except Exception as e:
        print(f"Error processing CV: {e}")
        # Instead of failing, return a fallback response
        try:
            # Still try to extract basic info
            from ai_helpers import (extract_name, extract_email, extract_phone, extract_skills,
                                  extract_education, extract_experience, extract_projects, extract_interests)

            fallback_data = {
                "name": extract_name(extracted_text if 'extracted_text' in locals() else ""),
                "email": extract_email(extracted_text if 'extracted_text' in locals() else ""),
                "phone": extract_phone(extracted_text if 'extracted_text' in locals() else ""),
                "skills": extract_skills(extracted_text if 'extracted_text' in locals() else ""),
                "education": extract_education(extracted_text if 'extracted_text' in locals() else ""),
                "work_experience": extract_experience(extracted_text if 'extracted_text' in locals() else ""),
                "projects": extract_projects(extracted_text if 'extracted_text' in locals() else ""),
                "interests": extract_interests(extracted_text if 'extracted_text' in locals() else "")
            }

            return {
                "status": "error_with_fallback",
                "data": fallback_data,
                "error": str(e)
            }
        except:
            # If even fallback fails, just return the error
            raise HTTPException(status_code=500, detail=str(e))
