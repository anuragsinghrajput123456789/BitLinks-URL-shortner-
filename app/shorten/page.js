"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Link2, Sparkles, QrCode, Download, Copy, Check, Info } from "lucide-react";

const Page = () => {
  const [url, setUrl] = useState("");
  const [shorturl, setShorturl] = useState("");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  // Auto-fill random alias if user types URL but leaves alias blank
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (val && !shorturl) {
      const randomAlias = Math.random().toString(36).substring(2, 8);
      setShorturl(randomAlias);
    }
  };

  const generate = async (e) => {
    e.preventDefault();
    if (!url || !shorturl) {
      setMessage("Please fill both fields before generating.");
      return;
    }

    setLoading(true);
    setMessage("");
    setGenerated("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, shorturl }),
      });

      const result = await response.json();

      if (result.success) {
        const fullLink = `${
          process.env.NEXT_PUBLIC_HOST || window.location.origin
        }/${shorturl}`;
        setGenerated(fullLink);
        setMessage("Short URL generated successfully 🎉");

        // Sync with dashboard history if needed
        const saved = localStorage.getItem("bitlinks_recent") || "[]";
        try {
          const recent = JSON.parse(saved);
          const newLink = {
            id: Date.now(),
            original: url,
            short: shorturl,
            fullShort: fullLink,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem("bitlinks_recent", JSON.stringify([newLink, ...recent.slice(0, 4)]));
        } catch (e) {
          console.error("Local storage sync error", e);
        }
      } else {
        setMessage(result.message || "Failed to generate short URL.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const downloadQR = async () => {
    setQrLoading(true);
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        generated
      )}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `qrcode-${shorturl || "alias"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download QR code", err);
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 text-gray-100 grid-bg py-20 px-4">
      {/* Glow Backdrops */}
      <div className="absolute top-[20%] left-[20%] w-[20rem] h-[20rem] bg-purple-600/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[20%] right-[20%] w-[22rem] h-[22rem] bg-pink-600/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-purple-500/20 shadow-2xl relative"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="text-purple-400 h-6 w-6 animate-pulse" />
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-neon-glow">
            Shortener Panel
          </h1>
        </div>

        <p className="text-gray-400 text-center text-sm mb-8">
          Enter your long URL and choose a custom short path alias below.
        </p>

        <form onSubmit={generate} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Original URL
            </label>
            <input
              value={url}
              onChange={handleUrlChange}
              className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300"
              type="url"
              placeholder="https://example.com/your-long-url"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Custom Short Path
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xs font-mono text-gray-600">
                bitlinks.io/
              </span>
              <input
                value={shorturl}
                onChange={(e) => setShorturl(e.target.value)}
                className="w-full pl-24 pr-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono transition-all duration-300"
                type="text"
                placeholder="alias"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/20 flex justify-center items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Generating link...
              </>
            ) : (
              <>
                <Link2 size={20} />
                Generate Link
              </>
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center text-sm font-semibold mt-4 ${
                message.includes("successfully") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </motion.p>
          )}

          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="bg-slate-950/60 border border-purple-500/20 p-6 rounded-2xl mt-8 space-y-6"
            >
              <div className="space-y-2">
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wider text-center">
                  Your New Short Link
                </p>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={generated}
                    className="bg-transparent border-none text-sm font-mono text-pink-400 w-full focus:outline-none"
                  />
                  <button
                    onClick={copyLink}
                    className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* QR Code Segment */}
              <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-900 gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      generated
                    )}`}
                    alt="QR Code"
                    className="h-[150px] w-[150px]"
                  />
                </div>
                <button
                  onClick={downloadQR}
                  disabled={qrLoading}
                  className="flex items-center gap-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {qrLoading ? (
                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download QR Code
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Page;
