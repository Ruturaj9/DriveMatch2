// src/context/ThemeContext.jsx
import { createContext } from "react";

export const ThemeContext = createContext({
  theme: "dark",         // default: dark
  toggleTheme: () => {},
});
