"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, Check, Search, Calendar, BarChart2, MousePointerClick, TrendingUp, CalendarDays, ExternalLink, Plus, RefreshCw, AlertCircle
} from "lucide-react";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, click_high, click_low
  const [copiedId, setCopiedId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/urls");
      const data = await res.json();

      if (data.success) {
        setUrls(data.urls);
      } else if (data.message === "Unauthorized" || data.message === "Invalid token") {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (shorturl, id) => {
    try {
      const fullUrl = `${window.location.protocol}//${window.location.host}/${shorturl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  // Compute aggregate stats
  const totalLinks = urls.length;
  const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const maxClicks = urls.length > 0 ? Math.max(...urls.map(u => u.clicks || 0)) : 0;
  const mostPopular = urls.length > 0 ? [...urls].sort((a,b) => (b.clicks || 0) - (a.clicks || 0))[0] : null;

  // Filter and Sort URLs
  const filteredUrls = urls
    .filter(url => 
      url.shorturl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.url.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "click_high") return (b.clicks || 0) - (a.clicks || 0);
      if (sortBy === "click_low") return (a.clicks || 0) - (b.clicks || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Loading Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 grid-bg py-12 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute top-[10%] left-[10%] w-[25rem] h-[25rem] bg-purple-600/5 rounded-full blur-3xl -z-10 animate-blob" />
      <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-cyan-600/5 rounded-full blur-3xl -z-10 animate-blob animation-delay-4000" />

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Dashboard Title Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Creator Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage and audit your short link connectivity pipelines.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchUrls}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition-all"
              title="Refresh Stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <a
              href="/shorten"
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4.5 w-4.5" />
              Create Link
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Card 1: Total Links */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Links</span>
              <p className="text-2xl font-black text-white">{totalLinks}</p>
            </div>
            <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total Clicks */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Aggregate Traffic</span>
              <p className="text-2xl font-black text-white">{totalClicks} Clicks</p>
            </div>
            <div className="h-10 w-10 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Most Active Link */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 flex items-center justify-between">
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Most Popular Link</span>
              <p className="text-sm font-mono font-bold text-cyan-400 truncate">
                {mostPopular ? `/${mostPopular.shorturl}` : "None"}
              </p>
              <p className="text-xs text-gray-500">
                {mostPopular ? `${mostPopular.clicks || 0} hits` : "0 hits"}
              </p>
            </div>
            <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="glass-panel rounded-3xl border border-slate-850 overflow-hidden shadow-2xl">
          
          {/* List Toolbar */}
          <div className="p-6 border-b border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
              <input
                type="text"
                placeholder="Search custom alias or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-200 transition-all"
              />
            </div>

            {/* Sort select */}
            <div className="flex gap-2 items-center w-full md:w-auto justify-end">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
              >
                <option value="newest">Newest Created</option>
                <option value="oldest">Oldest Created</option>
                <option value="click_high">Highest Clicks</option>
                <option value="click_low">Lowest Clicks</option>
              </select>
            </div>
          </div>

          {/* List Content */}
          <div className="divide-y divide-slate-900/50">
            {filteredUrls.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-4">
                <AlertCircle className="h-10 w-10 text-gray-600 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-base">No links resolved</p>
                  <p className="text-sm text-gray-500">Create a short URL or adjust your filters above.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-900/60">
                {filteredUrls.map((url) => {
                  const clickPercentage = maxClicks > 0 ? ((url.clicks || 0) / maxClicks) * 100 : 0;
                  return (
                    <motion.li
                      key={url._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-6 py-5 hover:bg-slate-900/25 transition relative group overflow-hidden"
                    >
                      {/* Click Traffic Visual Overlay Bar */}
                      <div 
                        style={{ width: `${clickPercentage}%` }}
                        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500/10 to-pink-500/30 -z-10 group-hover:from-purple-500/20 group-hover:to-pink-500/40 transition-all duration-500"
                      />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        {/* URL Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-extrabold text-purple-400 group-hover:text-purple-300 transition-colors">
                              /{url.shorturl}
                            </span>
                            <a
                              href={`${window.location.protocol}//${window.location.host}/${url.shorturl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-cyan-400 p-1 transition-colors"
                              title="Visit Live"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-sm sm:max-w-md md:max-w-xl">
                            {url.url}
                          </p>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                          
                          {/* Metrics */}
                          <div className="flex flex-col sm:items-end">
                            <div className="flex items-center gap-1">
                              <MousePointerClick className="h-3.5 w-3.5 text-pink-400" />
                              <span className="text-xs font-black text-gray-200 uppercase tracking-wider">
                                {url.clicks || 0} hits
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(url.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="h-6 w-[1px] bg-slate-900 hidden sm:block" />

                          {/* Quick Copy Action */}
                          <button
                            onClick={() => copyToClipboard(url.shorturl, url._id)}
                            className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            {copiedId === url._id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-green-400" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
