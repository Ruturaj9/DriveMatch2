import { useCallback, useState } from "react";
import { ToastContext } from "./ToastContext";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Show toast
  const showToast = useCallback((message, duration = 2500) => {
    const id = Math.random().toString(36).slice(2);

    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {createPortal(
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999]">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="px-4 py-2 rounded-lg shadow-lg bg-blue-60 text-white text-sm"
              >
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
