import { useTheme } from "./ThemeContext";

export default function DarkModeToggle({ className = "" }) {
  const { dark, setDark } = useTheme();
  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setDark((d) => !d)}
      className={`p-2 rounded-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-500 shadow ${className}`}
      style={{ transition: 'background 0.5s, color 0.5s' }}
    >
      {dark ? (
        // Sun icon
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/>
        </svg>
      ) : (
        // Moon icon
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
        </svg>
      )}
    </button>
  );
}