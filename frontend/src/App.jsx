import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeContext";
import DarkModeToggle from "./components/DarkModeToggle";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
 import { supabase } from "../supabaseClient";
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute';

function AppLayout({ children }) {
  const [session, setSession] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutMsg, setLogoutMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutMsg("");
    try {
      await supabase.auth.signOut();
      setLogoutMsg("Logged out successfully. Redirecting...");
      setTimeout(() => {
        setLoggingOut(false);
        setLogoutMsg("");
        navigate('/login');
      }, 1200);
    } catch {
      setLogoutMsg("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <header className="py-0.5 px-6 bg-indigo-600 text-white flex justify-between items-center shadow">
        <img src="/images/logo.png" alt="Career Compass Logo" className="h-24 max-h-full" />
        <nav className="flex gap-4 items-center">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/onboarding" className="hover:underline">Onboarding</Link>
          {!session && <Link to="/login" className="hover:underline">Login</Link>}
          {!session && <Link to="/signup" className="hover:underline">Signup</Link>}
          {session && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold shadow hover:bg-gray-100 transition border border-indigo-200 disabled:opacity-60"
              disabled={loggingOut}
            >
              {loggingOut ? (
                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
              )}
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          )}
        </nav>
        <DarkModeToggle className="ml-4" />
      </header>
      {logoutMsg && (
        <div className="w-full text-center py-2 bg-green-100 text-green-700 font-semibold shadow-inner">{logoutMsg}</div>
      )}
      <main className="flex-1">{children}</main>
      <footer className="py-4 px-6 bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-300 text-sm">
        &copy; {new Date().getFullYear()} Career Compass. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
}