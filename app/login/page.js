"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          // Dispatch custom event to notify Navbar of state change
          window.dispatchEvent(new Event("auth-change"));
        }
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.includes("successful");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-gray-100 grid-bg px-4 py-12">
      {/* Background glowing blobs */}
      <div className="absolute top-[20%] right-[20%] w-[20rem] h-[20rem] bg-purple-600/5 rounded-full blur-3xl -z-10 animate-blob" />
      <div className="absolute bottom-[20%] left-[20%] w-[22rem] h-[22rem] bg-pink-600/5 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/20 shadow-2xl relative"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-md shadow-purple-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="text-xs text-gray-400">
            Sign in to continue managing your URL connections.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                  placeholder="john@example.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600 hover:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-98 disabled:opacity-75 transition-all duration-300 cursor-pointer"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-xl border text-xs text-center font-semibold flex items-center justify-center gap-1.5 ${
                isSuccess
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {isSuccess ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-purple-400 hover:text-purple-300"
            >
              Sign Up Free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
