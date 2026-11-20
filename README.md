# CareerPath AI

## Intelligent Career Discovery & Skill Development Platform

CareerPath AI is a full-stack career intelligence platform that helps users convert their existing experience into a structured profile, understand their current skills, explore relevant career directions, and organize a practical development roadmap.

The repository combines a React experience, a FastAPI service, Supabase-backed authentication and persistence, CV extraction, Gemini-assisted analysis, and a LangGraph workflow for multi-stage career reasoning.

## Implemented capabilities

- Supabase email/password and Google authentication flows in the React frontend
- Guided profile onboarding and Supabase profile persistence
- PDF and DOCX CV upload with structured text extraction
- Gemini-assisted CV parsing with deterministic fallback extraction
- Skills categorization and Chart.js visualizations
- Career and job recommendation interface components
- FastAPI profile, dashboard, and CV-processing endpoints
- Dashboard retrieval of stored roadmap progress, Kanban state, and gamification fields
- LangGraph nodes for CV parsing, skill-gap analysis, career recommendations, and roadmap generation
- Local parsing cache with generated cache content excluded from version control
- Responsive navigation, protected routes, error handling, and light/dark presentation

## Architecture

```text
React + Vite
  |-- Supabase Auth and profile persistence
  |-- CV upload and dashboard requests
  v
FastAPI
  |-- PDF/DOCX extraction
  |-- Gemini parsing with rule-based fallback
  |-- Supabase user and roadmap access
  v
LangGraph workflow module
  |-- CV/profile normalization
  |-- Skill-gap analysis
  |-- Career-path recommendations
  `-- Personalized roadmap generation
```

The LangGraph workflow is implemented as a backend module with asynchronous entry points for CV text and profile data. It is not currently mounted as a public FastAPI route, so live end-to-end LangGraph, Gemini, and roadmap-generation execution remains an external integration step.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Chart.js |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| AI orchestration | LangGraph, LangChain, Google Gemini |
| Document processing | PyPDF2, python-docx, multipart uploads |
| Identity and persistence | Supabase Auth, PostgreSQL, Supabase client SDKs |

## Repository structure

```text
backend/
  main.py                 FastAPI application and API routes
  langgraph_workflow.py   Multi-stage career analysis workflow
  ai_helpers.py           Gemini and fallback CV parsing
  file_processing.py      PDF and DOCX text extraction
  cache_utils.py          Local runtime cache utilities
  requirements.txt        Python dependencies
frontend/
  src/                    React pages, components, contexts, and providers
  supabaseClient.js       Environment-configured Supabase browser client
  package.json            Frontend dependencies and scripts
```

## Local configuration

Requirements:

- Python 3.10 or newer
- Node.js 20.19 or newer
- A Gemini API key
- A Supabase project

Clone the repository:

```bash
git clone https://github.com/raafea24/careerpath-ai-intelligence.git
cd careerpath-ai-intelligence
```

Create `backend/.env` from `backend/.env.example`:

```env
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The service-role key is server-only. Never expose it through a `VITE_` variable or commit either environment file.

Install and run the backend:

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
uvicorn main:app --reload
```

Install and run the frontend in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The current frontend API calls expect FastAPI at `http://127.0.0.1:8000`.

## API surface

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/user/profile` | Create or update a structured user profile |
| `GET` | `/api/dashboard` | Retrieve the profile and stored roadmap state |
| `POST` | `/api/upload-cv` | Extract and parse PDF or DOCX CV content |

## Persistence contract

The current implementation references Supabase `profiles`, `users`, and `roadmaps` tables. The frontend stores authenticated profile and CV-derived data in `profiles`; FastAPI reads and updates `users` and reads roadmap JSON from `roadmaps`.

Database migration files are not present in the source repository. A compatible Supabase schema and row-level security policies must therefore be configured separately before persistence can be verified.

## Security and privacy

- Secrets are loaded from ignored environment files.
- Uploaded CVs, generated samples, parsing caches, test outputs, and virtual environments are excluded from Git.
- The privileged Supabase service-role key is restricted to the backend configuration.
- Gemini parsing failures do not return raw model output.
- Runtime persistence may contain personal profile and CV data; production deployments must enforce suitable Supabase row-level security, retention, and access policies.

## Verification status

This publication preserves the last committed functional frontend/backend baseline and the implemented LangGraph workflow module. The source repository contained incomplete zero-byte work-in-progress modules; those placeholders and generated test artifacts are intentionally not published as implemented features.

Tests, builds, migrations, external API calls, and deployments were not executed during publication. Live Gemini behavior, Supabase policies/schema compatibility, LangGraph-to-FastAPI integration, roadmap persistence, and progress updates remain unverified.

## License

Licensed under the [MIT License](LICENSE). Existing Git commit authorship is retained in the sanitized history.
