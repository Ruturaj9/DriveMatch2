import { useState, useContext, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { Moon, Sun, Menu, X } from "lucide-react";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
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
      className={`
        sticky top-0 z-50 backdrop-blur-lg border-b transition-all duration-300
        ${
          theme === "dark"
            ? "bg-[rgba(10,10,10,0.75)] border-neutral-30"
            : "bg-[rgba(255,255,255,0.75)] border-neutral-90"
        }
        shadow-lg
      `}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-3">

        {/* Logo */}
        <Link
          to="/"
          className="relative text-2xl md:text-3xl font-bold tracking-tight group"
        >
          <span className="bg-gradient-to-r from-blue-50 via-blue-60 to-purple-60 bg-clip-text text-transparent">
            DriveMatch
          </span>

          {/* Glow effect */}
          <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-40 transition-all bg-gradient-to-r from-blue-50 via-blue-60 to-purple-60 rounded-lg"></div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">

          {/* Links */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `
                    relative font-medium text-[15px] tracking-wide transition-all
                    ${
                      isActive
                        ? "text-blue-60"
                        : "text-neutral-40 hover:text-blue-60"
                    }
                    after:content-[''] after:absolute after:left-0 after:-bottom-[3px]
                    after:h-[2px] after:bg-blue-60 after:rounded-full after:w-0
                    hover:after:w-full after:transition-all
                  `
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              w-10 h-10 flex items-center justify-center rounded-full transition-all border backdrop-blur-md
              ${
                theme === "dark"
                  ? "bg-neutral-20 border-neutral-40 hover:bg-neutral-30 hover:border-blue-50"
                  : "bg-neutral-95 border-neutral-70 hover:bg-neutral-85 hover:border-blue-50"
              }
              active:scale-95
            `}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-50" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-40" />
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg active:scale-95 transition-all"
        >
          {menuOpen ? (
            <X className="w-6 h-6 text-neutral-40 dark:text-neutral-90" />
          ) : (
            <Menu className="w-6 h-6 text-neutral-40 dark:text-neutral-90" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className={`
            md:hidden px-6 py-4 space-y-4 transition-all duration-300 border-t backdrop-blur-xl
            ${
              theme === "dark"
                ? "bg-[rgba(10,10,10,0.75)] border-neutral-30"
                : "bg-[rgba(255,255,255,0.75)] border-neutral-90"
            }
          `}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                  block font-medium text-[16px] py-1
                  ${
                    isActive
                      ? "text-blue-60"
                      : "text-neutral-40 hover:text-blue-60"
                  }
                `
              }
            >
              {item.name}
            </NavLink>
          ))}

          <button
            onClick={toggleTheme}
            className={`
              w-full py-2 rounded-lg flex items-center justify-center gap-2 border transition-all
              ${
                theme === "dark"
                  ? "bg-neutral-20 border-neutral-40 hover:bg-neutral-30 hover:border-blue-50"
                  : "bg-neutral-95 border-neutral-70 hover:bg-neutral-85 hover:border-blue-50"
              }
            `}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-5 h-5 text-yellow-50" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-neutral-40" /> Dark Mode
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
