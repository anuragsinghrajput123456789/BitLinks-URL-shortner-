"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, LayoutDashboard, LogOut, LogIn, UserPlus, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      localStorage.removeItem("user");
    }

    // Custom event listener to update user state if logged in elsewhere
    const handleAuthChange = () => {
      try {
        const updatedUser = localStorage.getItem("user");
        setUser(updatedUser ? JSON.parse(updatedUser) : null);
      } catch (e) {
        console.error("Failed to parse updated user:", e);
        setUser(null);
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login";
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shorten", href: "/shorten" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-slate-950/70 backdrop-blur-md text-white shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-md shadow-purple-500/30"
          >
            <Link2 className="h-5 w-5 text-white" />
          </motion.div>
          <span className="font-extrabold text-2xl tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent group-hover:text-neon-glow transition-all duration-300">
            BitLinks
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name} className="relative">
                <Link
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-all duration-300 relative py-2 ${
                    isActive ? "text-pink-400" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}

          <div className="h-4 w-[1px] bg-slate-800 mx-2" />

          {/* Desktop Auth Buttons */}
          <li className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 border border-purple-500/30 px-4 py-2 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 transition-all duration-300"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-rose-900/20 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-xl bg-slate-900/50 transition-all duration-300"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-gray-300 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-slate-900 bg-slate-950/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-2.5 px-4 rounded-xl text-base font-semibold transition-all ${
                      isActive 
                        ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" 
                        : "text-gray-300 hover:bg-slate-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div className="h-[1px] bg-slate-900 my-4" />

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 px-4 pb-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-purple-500/30 text-purple-400 bg-purple-500/5 font-semibold text-center"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-center"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-700 text-gray-300 font-semibold text-center bg-slate-900/50"
                    >
                      <LogIn className="h-5 w-5" />
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-center"
                    >
                      <UserPlus className="h-5 w-5" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

