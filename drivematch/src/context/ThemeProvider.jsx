// src/context/ThemeProvider.jsx
import { useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Your existing system: Save + set attribute
    root.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    // ⭐ IMPORTANT: Sync Tailwind's dark mode ⭐
    // This enables the "dark:" classes across the whole app
    root.classList.toggle("dark", theme === "dark");

  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="transition-colors duration-300">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
