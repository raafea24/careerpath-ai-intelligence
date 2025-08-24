import React, { useEffect, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { getInitialTheme } from "../hooks/useTheme";

// ThemeProvider component
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme changes to document element
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes and add the active one
    root.classList.remove("dark", "light");
    root.classList.add(theme);

    // Save in localStorage
    localStorage.setItem("theme", theme);
    
    console.log(`[ThemeProvider] Theme set to: ${theme}`);
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => {
    console.log('[ThemeProvider] Toggling theme...');
    setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark");
  };

  // Expose theme state and toggle function
  const value = {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
