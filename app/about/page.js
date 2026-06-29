"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bolt, BarChart2, Shield, Link2, Sparkles, ArrowUpRight, Compass, Users, CheckCircle, Github, Linkedin } from "lucide-react";

const NetworkSvg = () => (
  <svg className="w-full h-auto text-purple-500 max-w-md mx-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.2)]" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="200" cy="150" r="10" fill="#a855f7" />
    <circle cx="80" cy="80" r="6" fill="#f43f5e" />
    <circle cx="320" cy="80" r="6" fill="#06b6d4" />
    <circle cx="80" cy="220" r="6" fill="#06b6d4" />
    <circle cx="320" cy="220" r="6" fill="#f43f5e" />
    
    <path d="M80 80 L200 150" stroke="url(#gradient-pink-purple)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
    <path d="M320 80 L200 150" stroke="url(#gradient-cyan-purple)" strokeWidth="2" strokeDasharray="5,5" />
    <path d="M80 220 L200 150" stroke="url(#gradient-cyan-purple)" strokeWidth="2" />
    <path d="M320 220 L200 150" stroke="url(#gradient-pink-purple)" strokeWidth="2" />
    
    <path d="M80 80 L80 220" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <path d="M320 80 L320 220" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    
    <defs>
      <linearGradient id="gradient-pink-purple" x1="80" y1="80" x2="200" y2="150" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="gradient-cyan-purple" x1="320" y1="80" x2="200" y2="150" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06b6d4" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </svg>
);

const AboutPage = () => {
  return (
    <div className="bg-slate-950 text-gray-100 min-h-screen grid-bg py-20 px-4">
      {/* Backdrops */}
      <div className="absolute top-[10%] right-[10%] w-[25rem] h-[25rem] bg-purple-600/5 rounded-full blur-3xl -z-10 animate-blob" />
      <div className="absolute bottom-[20%] left-[10%] w-[30rem] h-[30rem] bg-cyan-600/5 rounded-full blur-3xl -z-10 animate-blob animation-delay-4000" />

      <main className="max-w-7xl mx-auto space-y-32">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-bold uppercase tracking-wider mx-auto"
          >
            <Compass className="h-3.5 w-3.5" />
            Our Journey & Vision
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            About <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-neon-glow">BitLinks</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-400 leading-relaxed"
          >
            We believe in the power of simplicity. BitLinks was born to solve digital clutter, providing developers, creators, and marketers with lightning-fast routing and transparent, real-time analytics.
          </motion.p>
        </section>

        {/* Our Mission Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="text-purple-400 h-6 w-6" /> Our Mission
            </h2>
            <p className="text-gray-400 leading-relaxed">
              In a cluttered internet, long, multi-parameter URLs create friction. Our mission is to bridge connections smoothly by offering robust, secure short links that build click-through confidence and detailed traffic metrics.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Whether you are evaluating social campaigns, mapping marketing channels, or dispersing docs to friends, BitLinks eliminates friction.
            </p>

            <div className="space-y-3">
              {[
                "100% Secure SSL routing certificates.",
                "Real-time click audits and geographic statistics.",
                "Zero bloated redirect delays. Lightning speed response."
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="text-cyan-400 h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold text-gray-300">{bullet}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-8 rounded-3xl border border-slate-800 flex items-center justify-center shadow-xl"
          >
            <NetworkSvg />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Why Choose BitLinks?</h2>
            <p className="text-sm text-gray-400">Our ecosystem is structured around three foundational pillars.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Bolt className="text-yellow-400 h-6 w-6" />,
                title: "Lightning Fast",
                description: "Our routing nodes process requests instantly, ensuring your audience reaches their targets without buffering delays."
              },
              {
                icon: <BarChart2 className="text-purple-400 h-6 w-6" />,
                title: "Detailed Analytics",
                description: "Inspect performance graphs, geolocation hits, device models, and click timelines in a beautiful unified dashboard."
              },
              {
                icon: <Shield className="text-cyan-400 h-6 w-6" />,
                title: "Secure & Reliable",
                description: "Built on resilient serverless structures offering guaranteed 99.99% system uptime, secured with HTTPS encryption."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-purple-500/30 transition-all duration-300 space-y-6"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Meet the Builder Section */}
        <section className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Meet the Architect</h2>
            <p className="text-sm text-gray-400">The developer behind the design and engineering of BitLinks.</p>
          </div>

          <div className="max-w-2xl mx-auto glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/20 shadow-xl text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-1 shadow-lg shadow-purple-500/30 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <Users className="h-10 w-10 text-purple-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Anurag Singh</h3>
              <p className="text-purple-400 text-sm font-semibold">Full Stack Developer & Systems Designer</p>
            </div>
            <p className="text-gray-405 text-sm leading-relaxed max-w-md mx-auto">
              Building scalable, futuristic applications with elegant user interfaces and robust code. Connect with me for inquiries, collaboration, or system designs.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <a
                href="https://github.com/anuragsinghrajput123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-gray-300 hover:text-white px-5 py-2.5 rounded-xl transition-all"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/anurag-singh-09629b22a/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-gray-300 hover:text-white px-5 py-2.5 rounded-xl transition-all"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/20 shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto"
        >
          {/* Internal Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10" />

          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to shorten your links?
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8">
            Create an account to track clicks, download custom QRs, and manage your assets directly inside your personal developer dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shorten"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-all duration-300"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white font-bold px-8 py-3 rounded-xl transition-all duration-300"
            >
              Contact Support <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

      </main>
    </div>
  );
};

export default AboutPage;
