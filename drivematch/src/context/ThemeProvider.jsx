// src/context/ThemeProvider.jsx
import { useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") || "dark";
  });

  // Apply theme instantly
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;               // <html data-theme="dark">
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="transition-colors duration-300">{children}</div>
    </ThemeContext.Provider>
  );
};
