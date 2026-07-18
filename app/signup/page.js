"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import PageWrapper from "../components/PageWrapper";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMessage(data.message || "Signup failed");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.includes("successfully");

  return (
    <PageWrapper>
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
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Create Account
          </h2>
          <p className="text-xs text-gray-400">
            Join thousands of developers and content distribution leaders.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                  placeholder="John Doe"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
                <input
                  id="signup-email"
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
              <label htmlFor="signup-password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
                <input
                  id="signup-password"
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
                <UserPlus className="h-4 w-4" />
                Sign Up
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-purple-400 hover:text-purple-300"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
    </PageWrapper>
  );
};

export default Signup;
