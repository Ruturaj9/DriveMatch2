import React, { useState, useContext, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: "Insights", path: "/insights" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav
      className={`sticky top-0 backdrop-blur-md border-b transition duration-700 ease-in-out
        ${
          theme === "dark"
            ? "bg-black/60 border-neutral-700 shadow-[0_4px_18px_rgba(0,0,0,0.55)]"
            : "bg-white/70 border-neutral-300 shadow-[0_4px_10px_rgba(0,0,0,0.06)]"
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center ">
        {/* 🚗 BRAND */}
        <Link
          to="/"
          className="text-2xl md:text-3xl font-bold  
          bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 bg-clip-text 
          hover:opacity-90 transition-opacity px-2 py-1 "
        >
          DriveMatch
        </Link>

        {/* 🔗 NAV LINKS + THEME */}
        <div className="flex items-center gap-6 m-4 p-6">
          {/* NAVIGATION LINKS */}
          <div className="flex items-center gap-8 ">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group relative font-medium text-[15px] tracking-wide px-4 py-2 transition-all
                  ${
                    isActive
                      ? "text-red-100"
                      : "text-neutral-600 hover:text-blue-600"
                  }
                  `
                }
              >
                {item.name}

                {/* UNDERLINE ANIMATION */}
                <span
                  className={`
                    absolute left-1/2 -bottom-3 h-[2px] w-0 bg-blue-600 rounded-full 
                    transition-all duration-300 
                    group-hover:w-full group-hover:left-0
                    ${location.pathname === item.path ? "w-full left-0" : ""}
                  `}
                ></span>
              </NavLink>
            ))}
          </div>

          {/* 🌙 / ☀️ THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`ml-2 flex items-center justify-center w-10 h-10 rounded-full border transition-all
              ${
                theme === "dark"
                  ? "border-neutral-500 bg-neutral-800 hover:bg-yellow-400 hover:border-yellow-300 hover:shadow-[0_0_12px_rgba(250,204,21,0.60)]"
                  : "border-neutral-400 bg-neutral-100 hover:bg-neutral-200 hover:border-blue-600 hover:shadow-[0_0_12px_rgba(23,23,23,0.20)]"
              }
              backdrop-blur-md active:scale-95`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-300 transition-transform duration-500 hover:rotate-[360deg]" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-600 transition-transform duration-500 hover:rotate-[360deg]" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
