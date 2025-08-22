import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

 function TagInput({ tags, setTags }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput("");
    }
  };
  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-indigo-600 text-white rounded-full flex items-center gap-2"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-white hover:text-gray-200"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
          placeholder="Add a skill and press Enter"
          className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [tags, setTags] = useState([]);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("manual");
  const [cvName, setCvName] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    education: "",
    experience: "",
    projects: "",
    interests: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const navigate = useNavigate();

  // Load user profile if exists
  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      setLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          navigate("/login");
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("name,email,education,experience,projects,interests,skills")
          .eq("id", session.user.id)
          .single();
        if (!cancelled && data) {
          setForm({
            name: data.name || "",
            email: data.email || "",
            education: data.education || "",
            experience: data.experience || "",
            projects: data.projects || "",
            interests: data.interests || "",
          });
          setTags(data.skills || []);
        }
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setSaveMsg("Could not load profile. Showing blank onboarding form.");
        }
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, [navigate]);

  const steps = [
    "Personal Info",
    "Education",
    "Work Experience",
    "Skills",
    "Projects",
    "Interests",
  ];

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvName(file.name);
      // Optionally: handle CV file upload and parsing here
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!form.name.trim()) {
        newErrors.name = "Name is required.";
      }
      if (!form.email.trim()) {
        newErrors.email = "Email is required.";
      }
    } else if (step === 2) {
      if (!form.education.trim()) {
        newErrors.education = "Education is required.";
      }
    } else if (step === 3) {
      if (!form.experience.trim()) {
        newErrors.experience = "Work experience is required.";
      }
    } else if (step === 4) {
      if (tags.length === 0) {
        newErrors.skills = "Please add at least one skill.";
      }
    } else if (step === 5) {
      if (!form.projects.trim()) {
        newErrors.projects = "Projects are required.";
      }
    } else if (step === 6) {
      if (!form.interests.trim()) {
        newErrors.interests = "Interests are required.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaveMsg("Session expired. Please log in again.");
      setSaving(false);
      return;
    }
    const profileData = {
      name: form.name,
      email: form.email,
      education: form.education,
      experience: form.experience,
      projects: form.projects,
      interests: form.interests,
      skills: tags,
    };
    const result = await sendProfileToBackend(profileData);
    if (result.error) {
      setSaveMsg("Failed to save. Please try again.");
    } else {
      setSaveMsg("Profile saved! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 1200);
    }
    setSaving(false);
  };

  async function sendProfileToBackend(profileData) {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const result = await response.json();
      console.log('Backend response:', result);
      return result;
    } catch (error) {
      console.error('Error sending profile to backend:', error);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"><span className="text-lg text-gray-700 dark:text-gray-200">Loading profile...</span></div>;
  }
  // Progress bar calculation
  const progress = Math.round((step / steps.length) * 100);
  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-lg animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight">Onboarding</h2>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {/* Step Indicator */}
        <div className="flex justify-between mb-6 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {steps.map((label, idx) => (
            <div key={label} className={`flex-1 text-center ${step === idx + 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{label}</div>
          ))}
        </div>
        <div className="flex justify-center mb-6 gap-2">
          <button
            className={`px-4 py-2 rounded-l-lg font-semibold transition ${
              mode === "manual"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setMode("manual")}
            disabled={saving}
          >
            Manual Input
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg font-semibold transition ${
              mode === "cv"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setMode("cv")}
            disabled={saving}
          >
            Upload CV
          </button>
        </div>
        {mode === "cv" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block mb-2 font-medium text-gray-900 dark:text-gray-100">
                Upload your CV (PDF/Word)
              </label>
              <div className="flex items-center gap-2">
                <label className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleCvChange}
                  />
                  Choose File
                </label>
                <span className="text-gray-600 dark:text-gray-300 text-sm truncate max-w-[120px]">
                  {cvName || "No file selected"}
                </span>
              </div>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              Or{" "}
              <button
                className="underline"
                onClick={() => setMode("manual")}
                disabled={saving}
              >
                enter details manually
              </button>
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">CV parsing will be available soon. For now, use manual entry.</div>
          </div>
        )}
        {mode === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.name
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Name"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.email
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Email"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Education
                  </label>
                  <input
                    name="education"
                    value={form.education}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.education
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Education"
                    required
                  />
                  {errors.education && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.education}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Work Experience
                  </label>
                  <input
                    name="experience"
                    value={form.experience}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.experience
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Work Experience"
                    required
                  />
                  {errors.experience && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.experience}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Skills
                  </label>
                  <TagInput tags={tags} setTags={setTags} />
                  {errors.skills && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.skills}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Projects
                  </label>
                  <input
                    name="projects"
                    value={form.projects}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.projects
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Projects"
                    required
                  />
                  {errors.projects && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.projects}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Interests
                  </label>
                  <input
                    name="interests"
                    value={form.interests}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.interests
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Interests"
                    required
                  />
                  {errors.interests && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.interests}
                    </p>
                  )}
                </div>
                <div className="text-center text-green-600 font-semibold mt-4">
                  All done! Click Submit to finish.
                </div>
              </div>
            )}
            <div className="flex justify-between mt-8 gap-2">
              <button
                type="button"
                onClick={prev}
                disabled={step === 1 || saving}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  step === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Back
              </button>
              {step < steps.length ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
                  disabled={saving}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Submit"}
                </button>
              )}
            </div>
            {saveMsg && <div className="mt-4 text-green-600 text-center font-semibold animate-fade-in">{saveMsg}</div>}
        {/* Subtle fade-in animation */}
        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
          </form>
        )}
      </div>
    </section>
  );
}