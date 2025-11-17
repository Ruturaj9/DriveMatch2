import React, { useState, useContext, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { Moon, Sun } from "lucide-react";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // ⭐ Updated nav items (History + Favorites only when logged in)
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: "Insights", path: "/insights" },

    // Show only when logged in
    ...(isAuthenticated
      ? [
          { name: "Favorites", path: "/favorites" },
          { name: "History", path: "/history" },
        ]
      : []),

    { name: "About", path: "/about" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-black/60 border-neutral-700 shadow-[0_4px_18px_rgba(0,0,0,0.55)]"
            : "bg-white/70 border-neutral-300 shadow-[0_4px_10px_rgba(0,0,0,0.06)]"
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-3 md:py-4">

        {/* BRAND */}
        <Link
          to="/"
          className="text-2xl md:text-3xl font-bold tracking-tight 
          bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 bg-clip-text 
          hover:opacity-90 transition-opacity pt-2 pb-1 inline-block"
        >
          DriveMatch
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-8">

          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative font-medium text-[15px] tracking-wide transition-all
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-neutral-500 hover:text-blue-600"
                }
                after:content-[''] after:absolute after:left-0 after:-bottom-[3px] after:h-[2px]
                after:bg-blue-600 after:rounded-full after:w-0 hover:after:w-full after:transition-all`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
              ${
                theme === "dark"
                  ? "border-neutral-500 bg-neutral-800 hover:bg-orange-950 hover:border-orange-300 hover:shadow-[0_0_24px_rgba(250,204,21,2)]"
                  : "border-neutral-500 bg-neutral-200 hover:bg-stone-600 hover:border-white hover:shadow-[0_0_24px_rgba(0,0,0,2)]"
              }
              backdrop-blur-md active:scale-95`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-orange-300 transition-transform duration-500 hover:rotate-[360deg]" />
            ) : (
              <Moon className="w-5 h-6 text-neutral-600 transition-transform duration-500 hover:rotate-[360deg] hover:text-white/80" />
            )}
          </button>

          {/* ⭐ LOGIN / LOGOUT BUTTON */}
          <div className="flex flex-col items-center">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition"
              >
                Login
              </Link>
            ) : (
              <>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-red-500 text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
                <span className="text-xs mt-1 opacity-80">
                  {user?.username}
                </span>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
