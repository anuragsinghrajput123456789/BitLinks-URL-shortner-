"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, Github, Sparkles, Flame, Bolt, Link2, Copy, Check, BarChart2, Shield, Eye, Trash2, ArrowRight,
  Globe, TrendingUp
} from "lucide-react";
import { toast } from "../lib/toastState";
import PageWrapper from "./components/PageWrapper";

export default function Home() {
  const [recentLinks, setRecentLinks] = useState([]);

  // Load recent links from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("bitlinks_recent");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Normalize and ensure all items have a unique id
          const normalized = parsed.map((item, idx) => ({
            ...item,
            id: item.id || `recent-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          }));
          setRecentLinks(normalized);
          localStorage.setItem("bitlinks_recent", JSON.stringify(normalized));
        } else {
          localStorage.removeItem("bitlinks_recent");
        }
      } catch (e) {
        console.error("Failed to parse recent links:", e);
      }
    }
  }, []);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Short link copied to clipboard! 📋");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error("Failed to copy link.");
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("bitlinks_recent");
    setRecentLinks([]);
    toast.success("Recent guest session history cleared.");
  };

  return (
    <PageWrapper>
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-gray-100 grid-bg pt-10 pb-20">
      
      {/* 🌈 Floating Neon Blobs */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10rem] right-[-10rem] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10rem] left-[-10rem] w-[35rem] h-[35rem] bg-pink-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-[30%] left-[45%] w-[25rem] h-[25rem] bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <section className="py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Hero: Headline & Pitch */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-400 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              Empowering digital creators
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight"
            >
              Shorten links. <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-neon-glow">
                Amplify impact.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              BitLinks is a futuristic URL shortener built for developers and creators. Create clean, memorable, and secure links with instant redirects and detailed statistics. ⚡
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/shorten"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-all duration-300"
              >
                <Rocket className="h-5 w-5" />
                Advanced Creator Panel
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-600 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
            </motion.div>
          </div>

          {/* Right Hero: Animated Marketing Cards */}
          <div className="lg:col-span-5 w-full relative h-[450px] flex items-center justify-center">
            {/* Ambient Background Glow behind cards */}
            <div className="absolute w-[20rem] h-[20rem] bg-purple-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute w-[18rem] h-[18rem] bg-pink-600/5 rounded-full blur-3xl -z-10" />

            <div className="relative w-full max-w-sm space-y-5">
              
              {/* Card 1: Link Preview */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  y: [0, -6, 0]
                }}
                transition={{ 
                  opacity: { duration: 0.6, delay: 0.1 },
                  x: { duration: 0.6, delay: 0.1 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.03, zIndex: 30 }}
                className="glass-panel p-5 rounded-2xl border border-purple-500/20 shadow-xl bg-slate-950/80 cursor-pointer relative z-10"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Live Short Link</span>
                  </div>
                  <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">Active</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-pink-400 font-mono">bitlinks.io/nextjs-15</p>
                  <p className="text-[11px] text-slate-400 truncate">https://nextjs.org/blog/next-15-release-details</p>
                </div>
              </motion.div>

              {/* Card 2: Analytics & Click Traffic */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  y: [0, 6, 0]
                }}
                transition={{ 
                  opacity: { duration: 0.6, delay: 0.3 },
                  x: { duration: 0.6, delay: 0.3 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.03, zIndex: 30 }}
                className="glass-panel p-5 rounded-2xl border border-pink-500/20 shadow-xl bg-slate-950/80 cursor-pointer relative z-20 sm:translate-x-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">Clicks Monitor</span>
                  <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                    <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-green-400">+18.4%</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-white">4,821</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Redirects</p>
                  </div>
                  
                  {/* Miniature Animated Graph Bars */}
                  <div className="flex items-end gap-1.5 h-12 pb-1">
                    {[30, 60, 45, 90, 75].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        className="w-2.5 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Geolocation Pings */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  y: [0, -4, 0]
                }}
                transition={{ 
                  opacity: { duration: 0.6, delay: 0.5 },
                  x: { duration: 0.6, delay: 0.5 },
                  y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.03, zIndex: 30 }}
                className="glass-panel p-5 rounded-2xl border border-cyan-500/20 shadow-xl bg-slate-950/80 cursor-pointer relative z-10"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-3">Geographic Audits</span>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Globe className="h-3.5 w-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>United States</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">Just now</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Globe className="h-3.5 w-3.5 text-pink-400" />
                      <span>Tokyo, Japan</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">2 mins ago</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* RECENT LINKS / GUEST HISTORY */}
        <AnimatePresence>
          {recentLinks.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-6 mb-16"
            >
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                    <Flame className="h-5 w-5 text-pink-400" />
                    Recent Short Links (Guest Session)
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear History
                  </button>
                </div>
                <div className="space-y-3.5">
                  {recentLinks.map((link, index) => (
                    <motion.div
                      key={link.id ? `${link.id}-${index}` : `recent-${index}`}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/30 transition-all duration-300"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={link.fullShort}
                          target="_blank"
                          className="font-mono text-sm font-bold text-purple-400 hover:underline flex items-center gap-1.5"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          /{link.short}
                        </Link>
                        <p className="text-xs text-gray-500 truncate mt-1 max-w-[20rem] sm:max-w-md">
                          {link.original}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleCopy(link.fullShort)}
                          className="flex items-center gap-1 text-xs font-bold bg-slate-950 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl transition-all"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </button>
                        <Link
                          href={link.fullShort}
                          target="_blank"
                          className="flex items-center gap-1 text-xs font-bold bg-purple-600/20 border border-purple-500/20 hover:bg-purple-600/30 text-purple-300 px-3.5 py-2 rounded-xl transition-all"
                        >
                          Visit <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* STATS BANNER */}
        <section className="py-12 border-y border-slate-900 bg-slate-950/40 backdrop-blur-sm rounded-3xl px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-28">
          {[
            { metric: "1.2M+", label: "Links Shortened" },
            { metric: "45M+", label: "Redirects Tracked" },
            { metric: "99.99%", label: "Uptime SLA" },
            { metric: "<10ms", label: "Redirect Speed" },
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.metric}
              </p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* FEATURES GRID */}
        <section className="py-12 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Speed & Insight
            </h2>
            <p className="text-sm text-gray-400">
              Discover why top builders and content distributors choose BitLinks to power their connectivity requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Bolt className="text-yellow-400 h-6 w-6" />,
                title: "Lightning Redirects",
                description: "Optimized server redirections based on direct database checks ensuring user hops are executed in fractions of milliseconds.",
                badge: "FAST",
                borderGlow: "hover:shadow-yellow-500/10 hover:border-yellow-500/30"
              },
              {
                icon: <BarChart2 className="text-purple-400 h-6 w-6" />,
                title: "Real-time Metrics",
                description: "Monitor click frequencies, timestamps, user locations, and referring sites directly inside your dashboard panel.",
                badge: "ANALYTICS",
                borderGlow: "hover:shadow-purple-500/10 hover:border-purple-500/30"
              },
              {
                icon: <Shield className="text-cyan-400 h-6 w-6" />,
                title: "Enterprise Protection",
                description: "Full SSL certifications across all short URLs, securing routing from browser intercepts and ensuring client endpoints are verified.",
                badge: "SECURE",
                borderGlow: "hover:shadow-cyan-500/10 hover:border-cyan-500/30"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`glass-panel p-8 rounded-3xl border border-slate-800 transition-all duration-300 flex flex-col justify-between ${feature.borderGlow}`}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <span className="text-[10px] font-black text-gray-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {feature.badge}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </main>
    </PageWrapper>
  );
}