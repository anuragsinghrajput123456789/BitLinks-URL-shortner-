"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { toast } from "../../lib/toastState";

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toast.subscribe((message, type) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => {
          let bgClass = "bg-slate-900 border-slate-800 text-gray-100";
          let Icon = Info;
          let iconColor = "text-blue-400";

          if (t.type === "success") {
            bgClass = "bg-slate-900/95 border-emerald-500/30 text-emerald-50 shadow-lg shadow-emerald-950/20";
            Icon = CheckCircle2;
            iconColor = "text-emerald-400";
          } else if (t.type === "error") {
            bgClass = "bg-slate-900/95 border-rose-500/30 text-rose-50 shadow-lg shadow-rose-950/20";
            Icon = AlertCircle;
            iconColor = "text-rose-400";
          } else if (t.type === "warning") {
            bgClass = "bg-slate-900/95 border-amber-500/30 text-amber-50 shadow-lg shadow-amber-950/20";
            Icon = AlertTriangle;
            iconColor = "text-amber-400";
          }

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-md ${bgClass} transition-all duration-300`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
                <span className="text-sm font-semibold tracking-wide">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
