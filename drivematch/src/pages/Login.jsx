// src/pages/Login.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const { theme } = useContext(ThemeContext);
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login | signup

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (msg, error = false) => {
    const t = document.createElement("div");
    t.textContent = msg;
    t.className =
      `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999]
       ${error ? "bg-red-600" : "bg-blue-600"} text-white`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || (mode === "signup" && !form.username)) {
      showToast("Please fill all fields", true);
      return;
    }

    let res;
    if (mode === "login") {
      res = await login({
        email: form.email,
        password: form.password,
      });
    } else {
      res = await signup({
        username: form.username,
        email: form.email,
        password: form.password,
      });
    }

    if (!res.success) {
      showToast(res.message || "Error", true);
    } else {
      showToast(
        mode === "login" ? "Logged in!" : "Account created & logged in!"
      );
      setTimeout(() => navigate("/"), 700);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-6 transition-colors duration-300
        ${theme === "dark" ? "bg-neutral-10 text-white" : "bg-neutral-98 text-neutral-900"}
      `}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl shadow-xl border
          ${
            theme === "dark"
              ? "bg-neutral-20 border-neutral-40"
              : "bg-white border-neutral-200"
          }
        `}
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {mode === "login" ? "Login" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* USERNAME — only visible in signup */}
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium">Username</label>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className={`mt-1 w-full px-4 py-2 rounded-lg border outline-none transition
                  ${
                    theme === "dark"
                      ? "bg-neutral-30 border-neutral-50 text-white"
                      : "bg-neutral-99 border-neutral-400 text-black"
                  }
                  focus:ring-2 focus:ring-blue-60
                `}
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className={`mt-1 w-full px-4 py-2 rounded-lg border outline-none transition
                ${
                  theme === "dark"
                    ? "bg-neutral-30 border-neutral-50 text-white"
                    : "bg-neutral-99 border-neutral-400 text-black"
                }
                focus:ring-2 focus:ring-blue-60
              `}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className={`mt-1 w-full px-4 py-2 rounded-lg border outline-none transition
                ${
                  theme === "dark"
                    ? "bg-neutral-30 border-neutral-50 text-white"
                    : "bg-neutral-99 border-neutral-400 text-black"
                }
                focus:ring-2 focus:ring-blue-60
              `}
            />
          </div>

          {/* SUBMIT BTN */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* SWITCH LOGIN <-> SIGNUP */}
        <p className="mt-4 text-sm text-center">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </>
          )}
        </p>

        {/* Toast animation */}
        <style>{`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            10%, 90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(10px); }
          }
          .animate-fade-in-out {
            animation: fadeInOut 2.5s ease forwards;
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default Login;
