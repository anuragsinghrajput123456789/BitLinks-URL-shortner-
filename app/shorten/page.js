"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Link2, Sparkles, QrCode, Download, Copy, Check, Info } from "lucide-react";
import { toast } from "../../lib/toastState";
import PageWrapper from "../components/PageWrapper";

const Page = () => {
  const [url, setUrl] = useState("");
  const [shorturl, setShorturl] = useState("");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [host, setHost] = useState("bitlinks.io");

  // Local QR Code Generator
  useEffect(() => {
    if (!generated) {
      setQrDataUrl("");
      return;
    }
    // Generate displayed QR Code at 300x300 locally
    import("qrcode").then((qr) => {
      const isLocal = generated.includes("localhost") || generated.includes("127.0.0.1") || generated.includes("::1");
      const qrValue = isLocal ? url : generated;
      qr.toDataURL(qrValue, { width: 300, margin: 2, errorCorrectionLevel: "M" })
        .then((urlData) => {
          setQrDataUrl(urlData);
        })
        .catch((err) => {
          console.error("Failed to generate local QR Code:", err);
          toast.error("Failed to render QR Code.");
        });
    });
  }, [generated, url]);

  useEffect(() => {
    if (process.env.APP_URL) {
      try {
        setHost(new URL(process.env.APP_URL).host);
      } catch (e) {
        if (typeof window !== "undefined") {
          setHost(window.location.host);
        }
      }
    } else if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
  }, []);

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
    if (loading) return; // Prevent duplicate submissions

    const trimmedUrl = url.trim();
    const trimmedAlias = shorturl.trim();

    if (!trimmedUrl || !trimmedAlias) {
      toast.error("Please fill both fields before generating.");
      return;
    }

    // Alias Validation: only alphanumeric, dashes, and underscores
    const aliasRegex = /^[a-zA-Z0-9_-]+$/;
    if (!aliasRegex.test(trimmedAlias)) {
      toast.error("Custom alias can only contain letters, numbers, hyphens, and underscores.");
      return;
    }

    // URL Validation & Auto-prepend Protocol
    let finalUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
      setUrl(finalUrl);
    }

    try {
      const parsedUrl = new URL(finalUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        toast.error("Unsupported URL protocol. Only http:// and https:// are supported.");
        return;
      }
      const hostname = parsedUrl.hostname;
      if (!hostname || (hostname !== "localhost" && !hostname.includes("."))) {
        toast.error("Invalid URL. Hostname must be a valid domain or localhost.");
        return;
      }
    } catch (_) {
      toast.error("Please enter a valid HTTP or HTTPS URL.");
      return;
    }

    setLoading(true);
    setGenerated("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl, shorturl: trimmedAlias }),
      });

      const result = await response.json();

      if (result.success) {
        setGenerated(result.shortUrl);
        toast.success("Short URL generated successfully 🎉");

        // Sync with dashboard history
        const saved = localStorage.getItem("bitlinks_recent") || "[]";
        try {
          const recent = JSON.parse(saved);
          const recentArray = Array.isArray(recent) ? recent : [];
          const newLink = {
            id: Date.now(),
            original: finalUrl,
            short: trimmedAlias,
            fullShort: result.shortUrl,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem("bitlinks_recent", JSON.stringify([newLink, ...recentArray.slice(0, 4)]));
        } catch (e) {
          console.error("Local storage sync error:", e);
        }
      } else {
        if (result.message && result.message.toLowerCase().includes("exist")) {
          toast.error("Short URL alias already exists! 🚨");
        } else {
          toast.error(result.message || "Failed to generate short URL.");
        }
      }
    } catch (error) {
      console.error("[POST /api/generate Client] [ERROR] Failed to generate short URL:", error);
      toast.error("Could not connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      toast.success("Short URL copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error("Failed to copy URL to clipboard.");
    }
  };

  const downloadQR = async () => {
    setQrLoading(true);
    try {
      const qr = await import("qrcode");
      const isLocal = generated.includes("localhost") || generated.includes("127.0.0.1") || generated.includes("::1");
      const qrValue = isLocal ? url : generated;
      // Generate a high-resolution (1000x1000) QR Code locally for download
      const highResDataUrl = await qr.toDataURL(qrValue, {
        width: 1000,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      const a = document.createElement("a");
      a.href = highResDataUrl;
      a.download = `qrcode-${shorturl || "alias"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("High-resolution QR Code downloaded! 📲");
    } catch (err) {
      console.error("Failed to download QR code:", err);
      toast.error("QR Code download failed.");
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <PageWrapper>
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
            <label htmlFor="original-url" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Original URL
            </label>
            <input
              id="original-url"
              value={url}
              onChange={handleUrlChange}
              className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-300"
              type="url"
              placeholder="https://example.com/your-long-url"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="custom-short-path" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Custom Short Path
            </label>
            <div className="flex items-center w-full bg-slate-900/60 border border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all duration-300 overflow-hidden">
              <span className="pl-4 text-xs sm:text-sm font-mono text-slate-500 select-none">
                {host}/
              </span>
              <input
                id="custom-short-path"
                value={shorturl}
                onChange={(e) => setShorturl(e.target.value)}
                className="w-full pl-1 pr-4 py-4 bg-transparent border-none focus:outline-none text-sm font-mono text-gray-100 placeholder-slate-500"
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
          {generated && (
            <motion.div
              key="shorten-panel-output"
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
                  {qrDataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="h-[150px] w-[150px]"
                    />
                  ) : (
                    <div className="h-[150px] w-[150px] flex items-center justify-center bg-slate-900 rounded-xl">
                      <Loader2 className="animate-spin h-6 w-6 text-purple-500" />
                    </div>
                  )}
                </div>
                <button
                  onClick={downloadQR}
                  disabled={qrLoading || !qrDataUrl}
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
    </PageWrapper>
  );
};

export default Page;
