"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, Github, Sparkles, Flame, Bolt, Link2, Copy, Check, BarChart2, Shield, Eye, Trash2, ArrowRight
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shorturl, setShorturl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState([]);

  // Load recent links from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("bitlinks_recent");
    if (saved) {
      try {
        setRecentLinks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent links");
      }
    }
  }, []);

  // Auto-fill a random custom short URL if user starts typing a long URL but hasn't entered an alias
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (val && !shorturl) {
      // Generate a random 6-character string
      const randomAlias = Math.random().toString(36).substring(2, 8);
      setShorturl(randomAlias);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url || !shorturl) {
      setMessage("Please enter a URL and an alias.");
      return;
    }

    setLoading(true);
    setMessage("");
    setGeneratedUrl("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, shorturl }),
      });

      const result = await response.json();

      if (result.success) {
        const fullShortUrl = `${
          process.env.NEXT_PUBLIC_HOST || window.location.origin
        }/${shorturl}`;
        
        setGeneratedUrl(fullShortUrl);
        setMessage("Short link created! 🎉");

        // Save to guest history in localStorage
        const newLink = {
          id: Date.now(),
          original: url,
          short: shorturl,
          fullShort: fullShortUrl,
          createdAt: new Date().toISOString(),
        };

        const updatedHistory = [newLink, ...recentLinks.slice(0, 4)];
        setRecentLinks(updatedHistory);
        localStorage.setItem("bitlinks_recent", JSON.stringify(updatedHistory));

        setUrl("");
        setShorturl("");
      } else {
        setMessage(result.message || "Something went wrong. Alias might be taken.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("bitlinks_recent");
    setRecentLinks([]);
  };

  return (
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

          {/* Right Hero: Instant Shortener Form */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md glass-panel rounded-3xl p-8 border border-purple-500/20 relative shadow-2xl"
            >
              <div className="absolute top-[-0.75rem] right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-black px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Flame className="h-3 w-3 fill-slate-950" /> INSTANT WIDGET
              </div>

              <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-purple-400" />
                Create a Short Link
              </h2>

              <form onSubmit={handleShorten} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Long URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={url}
                    onChange={handleUrlChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Custom Alias
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xs font-mono text-gray-600">
                      bitlinks.io/
                    </span>
                    <input
                      type="text"
                      placeholder="alias"
                      value={shorturl}
                      onChange={(e) => setShorturl(e.target.value)}
                      required
                      className="w-full pl-24 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono transition-all duration-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-75 transition-all duration-300 cursor-pointer"
                >
                  {loading ? (
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Bolt className="h-4 w-4" />
                      Shorten Now
                    </>
                  )}
                </button>
              </form>

              {/* Success/Error Message */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 p-3 rounded-xl border text-sm text-center font-medium ${
                      generatedUrl
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {message}
                  </motion.div>
                )}

                {/* Shortened URL Output Container */}
                {generatedUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-3"
                  >
                    <p className="text-xs font-semibold text-purple-300">Your shortened link is ready!</p>
                    <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                      <input
                        type="text"
                        readOnly
                        value={generatedUrl}
                        className="bg-transparent border-none text-xs font-mono text-pink-400 w-full focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(generatedUrl)}
                        className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
                  {recentLinks.map((link) => (
                    <motion.div
                      key={link.id}
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
  );
}