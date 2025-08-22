import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { supabase } from "../../supabaseClient";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const validate = () => {
    let newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!validateEmail(form.email)) newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Password is required";
    if (mode === "signup") {
      if (!form.confirm) newErrors.confirm = "Confirm your password";
      else if (form.password !== form.confirm)
        newErrors.confirm = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitting(true);
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (error) {
          setErrors({ general: error.message });
        } else {
          setMessage("Account created! Please check your email to verify before logging in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            setErrors({ general: "Please verify your email before logging in." });
          } else {
            setErrors({ general: error.message });
          }
        } else {
          setMessage("Login successful! Redirecting...");
          setTimeout(() => {
            navigate("/onboarding");
          }, 1200);
        }
      }
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      setErrors({ general: error.message });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6 gap-2">
          <button
            className={`px-4 py-2 rounded-l-lg font-semibold transition ${
              mode === "login"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => { setMode("login"); setMessage(""); setErrors({}); }}
            disabled={submitting}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg font-semibold transition ${
              mode === "signup"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => { setMode("signup"); setMessage(""); setErrors({}); }}
            disabled={submitting}
          >
            Signup
          </button>
        </div>
        {message && <div className="mb-4 text-green-600 text-center font-semibold">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={`transition focus:ring-2 focus:ring-indigo-600 ${
              errors.email ? "border-red-500 bg-red-50 dark:bg-red-900" : ""
            }`}
            autoComplete="email"
            required
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email}</p>
          )}
          <FormInput
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className={`transition focus:ring-2 focus:ring-indigo-600 ${
              errors.password ? "border-red-500 bg-red-50 dark:bg-red-900" : ""
            }`}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password}</p>
          )}
          {mode === "signup" && (
            <>
              <FormInput
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`transition focus:ring-2 focus:ring-indigo-600 ${
                  errors.confirm ? "border-red-500 bg-red-50 dark:bg-red-900" : ""
                }`}
                autoComplete="new-password"
                required
              />
              {errors.confirm && (
                <p className="text-red-600 text-sm">{errors.confirm}</p>
              )}
            </>
          )}
          {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
          <Button
            type="submit"
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow transition ${
              submitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={submitting}
          >
            {submitting
              ? mode === "login"
                ? "Signing in..."
                : "Signing up..."
              : mode === "login"
              ? "Login"
              : "Signup"}
          </Button>
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          <Button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-3 px-6 rounded-lg shadow transition"
            disabled={submitting}
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <g>
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.63 2.7 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.42 17.56 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.17 5.36-4.62 7.01l7.1 5.53C43.93 37.13 46.1 31.32 46.1 24.55z"/>
                <path fill="#FBBC05" d="M10.67 28.29a14.5 14.5 0 010-8.58l-7.98-6.2A23.97 23.97 0 000 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z"/>
                <path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.14-5.58l-7.1-5.53c-1.98 1.33-4.5 2.13-8.04 2.13-6.44 0-11.87-3.92-13.33-9.29l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </g>
            </svg>
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </Button>
        </form>
      </div>
    </div>
  );
}