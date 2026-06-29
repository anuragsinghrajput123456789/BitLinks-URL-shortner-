"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, Sparkles, HelpCircle, Check } from "lucide-react";

const ContactPage = () => {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    setSuccess(true);
    setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 grid-bg py-20 px-4 sm:px-6 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-[15%] left-[15%] w-[25rem] h-[25rem] bg-purple-600/5 rounded-full blur-3xl -z-10 animate-blob" />
      <div className="absolute bottom-[15%] right-[15%] w-[30rem] h-[30rem] bg-pink-600/5 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000" />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-bold uppercase tracking-wider"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Support & Inquiries
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Get In <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-neon-glow">Touch</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Have questions about link limits, APIs, or integration? Message our core team and we'll reply as soon as possible.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Information (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-8 shadow-xl">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Contact Information
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <Mail className="text-purple-400 h-5 w-5" />,
                    title: "Email Support",
                    lines: ["support@bitlinks.io", "api@bitlinks.io"]
                  },
                  {
                    icon: <Phone className="text-pink-400 h-5 w-5" />,
                    title: "Phone Hotlines",
                    lines: ["+1 (555) 123-4567", "+1 (555) 987-6543"]
                  },
                  {
                    icon: <MapPin className="text-cyan-400 h-5 w-5" />,
                    title: "Offices Location",
                    lines: ["123 Tech Street, Suite 500", "San Francisco, CA 94107"]
                  },
                  {
                    icon: <Clock className="text-yellow-400 h-5 w-5" />,
                    title: "Operating Hours",
                    lines: ["Monday - Friday: 9:00 AM - 6:00 PM EST", "Saturday: Closed"]
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-200">{item.title}</h3>
                      {item.lines.map((line, lIdx) => (
                        <p key={lIdx} className="text-xs text-gray-400 mt-0.5">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-purple-500/20 shadow-xl relative">
              <h2 className="text-xl font-black text-white mb-6">Send a Message</h2>
              
              <form onSubmit={handleSendMessage} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lastName" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="subject" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300"
                    placeholder="General Inquiry / Support / Business"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="message" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300 resize-none"
                    placeholder="Enter details of your message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-98 disabled:opacity-75 transition-all duration-300 cursor-pointer"
                >
                  {sending ? (
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-4"
                  >
                    <div className="h-16 w-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/10">
                      <Check className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white">Message Transmitted!</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                      Your inquiry has been logged successfully. A member of our support team will reach out to you shortly.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;