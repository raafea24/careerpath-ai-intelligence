import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

function ProgressRing({ percentage }) {
  // SVG progress ring for roadmap completion
  const radius = 36;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2} className="block mx-auto">
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#6366f1"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="font-bold text-lg fill-indigo-600"
      >
        {percentage}%
      </text>
    </svg>
  );
}


export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      setLoading(true);
      try {
        // Get the logged-in user's email
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
        const email = session.user.email;
        // Fetch dashboard data from backend
        const res = await fetch(`http://127.0.0.1:8000/api/dashboard?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!cancelled) setDashboard(data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDashboard();
    return () => { cancelled = true; };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <span className="text-lg text-gray-700 dark:text-gray-200 animate-fade-in">Loading dashboard...</span>
        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    );
  }
  if (!dashboard || !dashboard.profile) {
    return (
      <div className="py-12 px-4 bg-white min-h-screen dark:bg-gray-900 transition-colors duration-300">
        <h2 className="text-3xl font-bold mb-4 text-center text-black dark:text-white">
          Welcome to Your Dashboard
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
          No profile found. Please complete the onboarding process.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/onboarding")}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }

  const { welcome_message, profile, progress, kanban, gamification, last_updated } = dashboard;


  // Color helpers for task status
  const statusColor = (status) => {
    if (status === "done") return "text-green-600 bg-green-50 border-green-200";
    if (status === "in_progress") return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <div className={
      `relative py-10 px-2 sm:px-6 min-h-screen transition-colors duration-300 ` +
      (theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50')
    }>
      {/* Welcome Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-8 flex flex-col items-center gap-2 hover:shadow-2xl transition group relative overflow-hidden">
          <div className="absolute -top-8 -left-8 opacity-10 text-9xl select-none pointer-events-none group-hover:opacity-20 transition">🌍</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 dark:text-indigo-300 mb-1 text-center drop-shadow-lg">
            {welcome_message}
          </h2>
          <div className="text-lg text-gray-500 dark:text-gray-300 text-center mb-2">
            Your journey to becoming a <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.career_goal}</span> continues…
          </div>
        </div>
      </div>

      {/* Main Grid */}
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-lg p-6 hover:shadow-2xl transition group relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-10 text-8xl select-none pointer-events-none group-hover:opacity-20 transition">👤</div>
            <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">Profile</h3>
            <div className="flex flex-col gap-1 text-gray-700 dark:text-gray-200">
              <span><b>Name:</b> {profile.name}</span>
              <span><b>Level:</b> {profile.level}</span>
              <span><b>Skills:</b> {profile.skills && profile.skills.join(", ")}</span>
            </div>
            <div className="mt-6 flex flex-col items-center">
              <ProgressRing percentage={progress.percentage} />
              <span className="text-xs text-gray-400 mt-1">Roadmap Completion</span>
            </div>
          </div>

          {/* Gamification Panel */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">Gamification</h3>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold text-indigo-600 dark:text-indigo-300">XP:</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mx-2">
                <div className="bg-indigo-500 dark:bg-indigo-400 h-2.5 rounded-full" style={{ width: `${Math.min(gamification.xp_points, 100)}%` }}></div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-300">{gamification.xp_points} XP</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {gamification.badges && gamification.badges.map((badge, idx) => (
                <span key={badge + idx} className="inline-flex items-center px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-full text-xs font-semibold shadow-sm">
                  🏅 {badge}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-orange-500 text-lg">🔥</span>
              <span>{gamification.streak} day learning streak</span>
              <span className="ml-4 text-indigo-600 dark:text-indigo-300 font-semibold">Level {gamification.level}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">Achievements: {gamification.achievements && gamification.achievements.join(", ")}</div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">Career Roadmap</h3>
            <div className="flex flex-col gap-4">
              {progress.milestones.map((ms) => (
                <div key={ms.title} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 mb-2 hover:shadow-md transition">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-bold text-lg ${ms.completed ? 'text-green-600 dark:text-green-400' : 'text-indigo-700 dark:text-indigo-200'}`}>{ms.title}</span>
                    {ms.completed ? <span className="ml-2 text-green-500 dark:text-green-300">✅</span> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ms.tasks.map((task, idx) => (
                      <span
                        key={task.title + idx}
                        className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${statusColor(task.status)} transition`}
                      >
                        {task.status === 'done' && <span className="mr-1">✅</span>}
                        {task.status === 'in_progress' && <span className="mr-1">⏳</span>}
                        {task.status === 'backlog' && <span className="mr-1">📌</span>}
                        {task.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 shadow-lg p-6 hover:shadow-2xl transition">
            <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">Kanban Board</h3>
            <div className="flex flex-col md:flex-row gap-4">
              {['backlog', 'in_progress', 'done'].map((col) => (
                <div key={col} className="flex-1">
                  <h4 className={`font-semibold mb-2 capitalize ${col === 'done' ? 'text-green-600 dark:text-green-400' : col === 'in_progress' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>{col.replace('_', ' ')}</h4>
                  <div className="flex flex-col gap-2">
                    {kanban[col].map((item, idx) => (
                      <div
                        key={item + idx}
                        className={`rounded-lg px-3 py-2 shadow-sm bg-white dark:bg-gray-900 border-l-4 ${col === 'done' ? 'border-green-500 dark:border-green-400' : col === 'in_progress' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-400 dark:border-gray-600'} hover:bg-indigo-50 dark:hover:bg-gray-800 transition`}
                      >
                        {col === 'done' && <span className="mr-1">✅</span>}
                        {col === 'in_progress' && <span className="mr-1">⏳</span>}
                        {col === 'backlog' && <span className="mr-1">📌</span>}
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Roadmap Generator Panel */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-lg p-6 hover:shadow-2xl transition flex flex-col items-center">
            <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">AI Roadmap Generator</h3>
            <button
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition mb-2"
              // onClick={handleGenerateRoadmap} // TODO: connect to backend AI API
              disabled
            >
              Generate / Update Career Roadmap (Coming Soon)
            </button>
            <div className="text-xs text-gray-400 dark:text-gray-300">When you generate a new roadmap, it will appear here automatically.</div>
          </div>
        </div>
      </div>
  <div className="text-xs text-gray-400 dark:text-gray-300 text-right mt-8">Last updated: {last_updated}</div>
    </div>
  );
}