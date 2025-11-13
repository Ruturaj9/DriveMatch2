import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import ChatAssistant from "../components/ChatAssistant";
import { ThemeContext } from "../context/ThemeContext";

const Layout = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 
        ${theme === "dark" ? "bg-neutral-10 text-neutral-90" : "bg-neutral-98 text-neutral-20"}`}
    >
      {/* Navbar */}
      <Navbar />

      {/* Page Transition Wrapper */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="pt-20"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* Floating Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

export default Layout;
