"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Heart, Send, Sparkles } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="border-t border-purple-500/10 bg-slate-950/80 text-gray-400 py-16 relative overflow-hidden">
      {/* Footer Ambient Background Light */}
      <div className="absolute bottom-[-15rem] left-[10%] w-[30rem] h-[30rem] bg-purple-900/10 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand and Description */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-md shadow-purple-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                BitLinks
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Simplifying the web, one connection at a time. Create lightning-fast short links, track real-time analytics, and make a big impact with your content.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[
                { icon: <Github className="h-5 w-5" />, href: "https://github.com", name: "GitHub" },
                { icon: <Twitter className="h-5 w-5" />, href: "https://twitter.com", name: "Twitter" },
                { icon: <Linkedin className="h-5 w-5" />, href: "https://linkedin.com", name: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h4 className="font-bold text-white text-base tracking-wide uppercase">Company</h4>
            <ul className="space-y-3.5 text-sm">
              {[
                { name: "Home", href: "/" },
                { name: "Shorten URL", href: "/shorten" },
                { name: "About Us", href: "/about" },
                { name: "Contact Support", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-purple-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h4 className="font-bold text-white text-base tracking-wide uppercase">Newsletter</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Subscribe to get updates on feature releases and link strategies.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-100 placeholder:text-gray-600 transition-all duration-300"
              />
              <button
                type="submit"
                className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-green-400 animate-pulse">
                Thanks for subscribing! 🚀
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-sm text-center sm:text-left text-gray-500">
            &copy; {currentYear} BitLinks. All rights reserved.
          </p>
          <p className="text-sm flex items-center gap-1.5 text-gray-500">
            Made with <Heart className="h-4 w-4 text-pink-500 animate-pulse fill-pink-500" /> for developers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
