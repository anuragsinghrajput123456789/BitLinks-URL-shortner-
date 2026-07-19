"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, Check, Search, Calendar, BarChart2, MousePointerClick, TrendingUp, CalendarDays, ExternalLink, Plus, RefreshCw, AlertCircle, QrCode, Download, Loader2,
  Trash2, Edit, Share2, ToggleLeft, ToggleRight, X, ChevronLeft, ChevronRight, Filter, Settings, FileSpreadsheet, User, MoreVertical, PlusCircle, CheckSquare, 
  Square, Eye, EyeOff, Tag, Clock, HelpCircle, Activity, LayoutDashboard, LogOut, ChevronDown, ListFilter, SlidersHorizontal, Info, Globe, Sparkles, Twitter, Send
} from "lucide-react";
import { toast } from "../../lib/toastState";
import PageWrapper from "../components/PageWrapper";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, click_high, click_low
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive, expired
  const [tagFilter, setTagFilter] = useState("all"); // all, or specific tag
  const [copiedId, setCopiedId] = useState(null);
  
  // Selection / Bulk states
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Pagination & QR states
  const [currentPage, setCurrentPage] = useState(1);
  const [previewQrId, setPreviewQrId] = useState(null);
  const [qrDataUrls, setQrDataUrls] = useState({});
  const [qrLoading, setQrLoading] = useState(false);
  
  // User context
  const [user, setUser] = useState(null);
  const [host, setHost] = useState("bitlinks.io");

  // Sidebar Collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const nextVal = !prev;
      localStorage.setItem("sidebar_collapsed", String(nextVal));
      return nextVal;
    });
  };

  // Modal / Drawer state
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit
  const [editId, setEditId] = useState(null);
  
  // URL Form state
  const [formUrl, setFormUrl] = useState("");
  const [formAlias, setFormAlias] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Confirm Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null); // single ID or "bulk"

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetUrl, setShareTargetUrl] = useState(null);

  const router = useRouter();

  // Load Host Url config
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host);
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to parse user details:", e);
      }
    }
  }, []);

  const fetchUrls = useCallback(async () => {
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
      console.error("Failed to load URLs:", error);
      toast.error("Could not load URL history.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Server logout failed:", err);
    }
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login";
  }, []);

  const copyToClipboard = useCallback(async (fullShortUrl, id) => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopiedId(id);
      toast.success("Short URL copied to clipboard! 📋");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error("Failed to copy link.");
    }
  }, []);

  const toggleQrPreview = useCallback(async (id, fullShortUrl) => {
    if (previewQrId === id) {
      setPreviewQrId(null);
      return;
    }

    setPreviewQrId(id);
    if (qrDataUrls[id]) return;

    setQrLoading(true);
    try {
      const qr = await import("qrcode");
      const dataUrl = await qr.toDataURL(fullShortUrl, { width: 250, margin: 1, errorCorrectionLevel: "M" });
      setQrDataUrls(prev => ({ ...prev, [id]: dataUrl }));
    } catch (err) {
      console.error("Failed to generate QR preview:", err);
      toast.error("Failed to generate QR Code preview.");
    } finally {
      setQrLoading(false);
    }
  }, [previewQrId, qrDataUrls]);

  const downloadQr = useCallback(async (shorturl, fullShortUrl) => {
    try {
      const qr = await import("qrcode");
      const highResDataUrl = await qr.toDataURL(fullShortUrl, {
        width: 1000,
        margin: 2,
        errorCorrectionLevel: "H"
      });
      const a = document.createElement("a");
      a.href = highResDataUrl;
      a.download = `qrcode-${shorturl}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("High-resolution QR Code downloaded! 📲");
    } catch (err) {
      console.error("Failed to download QR code:", err);
      toast.error("QR Code download failed.");
    }
  }, []);

  // Inline active status toggling (Optimistic UI)
  const toggleUrlActiveStatus = useCallback(async (item) => {
    const originalStatus = item.isActive;
    const targetStatus = !originalStatus;

    // Optimistically update UI
    setUrls(prev => prev.map(u => u._id === item._id ? { ...u, isActive: targetStatus } : u));

    try {
      const res = await fetch("/api/user/urls", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, isActive: targetStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update link status");
      }
      toast.success(`Link successfully ${targetStatus ? "enabled" : "disabled"}!`);
    } catch (err) {
      console.error("Failed to toggle link status:", err);
      toast.error(err.message || "Failed to update link status");
      // Rollback on failure
      setUrls(prev => prev.map(u => u._id === item._id ? { ...u, isActive: originalStatus } : u));
    }
  }, []);

  // Single URL deletion
  const handleDeleteSingle = useCallback(async (id) => {
    try {
      const res = await fetch("/api/user/urls", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setUrls(prev => prev.filter(u => u._id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        toast.success("URL deleted successfully.");
      } else {
        toast.error(data.message || "Failed to delete link.");
      }
    } catch (err) {
      console.error("Delete failure:", err);
      toast.error("An error occurred while deleting the link.");
    }
  }, []);

  // Bulk deletion
  const handleDeleteBulk = useCallback(async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/user/urls", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setUrls(prev => prev.filter(u => !selectedIds.includes(u._id)));
        setSelectedIds([]);
        toast.success("Selected URLs deleted successfully.");
      } else {
        toast.error(data.message || "Failed to delete selected links.");
      }
    } catch (err) {
      console.error("Bulk delete failure:", err);
      toast.error("An error occurred during bulk deletion.");
    }
  }, [selectedIds]);

  // Bulk active/inactive toggle
  const handleBulkStatusChange = useCallback(async (targetActiveState) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/user/urls", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, isActive: targetActiveState }),
      });
      const data = await res.json();
      if (data.success) {
        setUrls(prev => prev.map(u => selectedIds.includes(u._id) ? { ...u, isActive: targetActiveState } : u));
        toast.success(`Selected URLs successfully ${targetActiveState ? "enabled" : "disabled"}!`);
        setSelectedIds([]);
      } else {
        toast.error(data.message || "Failed to update selected links.");
      }
    } catch (err) {
      console.error("Bulk status change failure:", err);
      toast.error("An error occurred during status update.");
    }
  }, [selectedIds]);

  // Bulk copy to clipboard
  const handleBulkCopy = useCallback(async () => {
    if (selectedIds.length === 0) return;
    const selectedUrls = urls.filter(u => selectedIds.includes(u._id)).map(u => u.fullShortUrl).join("\n");
    try {
      await navigator.clipboard.writeText(selectedUrls);
      toast.success(`${selectedIds.length} links copied to clipboard! 📋`);
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk copy failure:", err);
      toast.error("Failed to copy links.");
    }
  }, [selectedIds, urls]);

  // Bulk CSV Export
  const handleBulkExport = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selectedUrls = urls.filter(u => selectedIds.includes(u._id));
    
    const rows = [
      ["Short URL", "Original URL", "Clicks", "Status", "Created At", "Expiration", "Description", "Tags"]
    ];
    
    selectedUrls.forEach(u => {
      const isExpired = u.expiresAt && new Date() > new Date(u.expiresAt);
      const status = !u.isActive ? "Inactive" : (isExpired ? "Expired" : "Active");
      const tagsStr = u.tags ? u.tags.join("; ") : "";
      const expiration = u.expiresAt ? new Date(u.expiresAt).toISOString().split('T')[0] : "None";
      rows.push([
        u.fullShortUrl,
        u.url,
        u.clicks || 0,
        status,
        new Date(u.createdAt).toISOString().split('T')[0],
        expiration,
        u.description || "",
        tagsStr
      ]);
    });
    
    const csvContent = rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bitlinks-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully! 📊");
    setSelectedIds([]);
  }, [selectedIds, urls]);

  // Modal actions
  const openCreateModal = () => {
    setModalMode("create");
    setEditId(null);
    setFormUrl("");
    setFormAlias("");
    setFormDescription("");
    setFormExpiresAt("");
    setFormTags("");
    setFormIsActive(true);
    setIsUrlModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setEditId(item._id);
    setFormUrl(item.url);
    setFormAlias(item.shorturl);
    setFormDescription(item.description || "");
    setFormExpiresAt(item.expiresAt ? new Date(item.expiresAt).toISOString().split('T')[0] : "");
    setFormTags(item.tags ? item.tags.join(", ") : "");
    setFormIsActive(item.isActive !== false);
    setIsUrlModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formSubmitting) return;

    const trimmedUrl = formUrl.trim();
    const trimmedAlias = formAlias.trim();

    if (!trimmedUrl) {
      toast.error("Original URL is required.");
      return;
    }

    const aliasRegex = /^[a-zA-Z0-9_-]*$/;
    if (trimmedAlias && !aliasRegex.test(trimmedAlias)) {
      toast.error("Alias can only contain letters, numbers, hyphens, and underscores.");
      return;
    }

    setFormSubmitting(true);
    const payload = {
      url: trimmedUrl,
      shorturl: trimmedAlias,
      description: formDescription,
      expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
      tags: formTags.split(",").map(t => t.trim()).filter(Boolean),
      isActive: formIsActive
    };

    try {
      if (modalMode === "create") {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("URL generated successfully!");
          fetchUrls();
          setIsUrlModalOpen(false);
        } else {
          toast.error(result.message || "Failed to generate short URL.");
        }
      } else {
        // Edit update
        const response = await fetch("/api/user/urls", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        const result = await response.json();
        if (result.success) {
          toast.success("URL updated successfully!");
          fetchUrls();
          setIsUrlModalOpen(false);
        } else {
          toast.error(result.message || "Failed to update URL.");
        }
      }
    } catch (err) {
      console.error("Form submit error:", err);
      toast.error("Failed to connect to the server.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDeleteConfirmation = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    setIsDeleteModalOpen(false);
    if (deleteTargetId === "bulk") {
      await handleDeleteBulk();
    } else if (deleteTargetId) {
      await handleDeleteSingle(deleteTargetId);
    }
    setDeleteTargetId(null);
  };

  const openShareModal = (item) => {
    setShareTargetUrl(item);
    setIsShareModalOpen(true);
  };

  // Compile aggregate stats (memoized)
  const stats = useMemo(() => {
    const totalLinks = urls.length;
    const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
    const activeLinksCount = urls.filter(u => {
      const isExpired = u.expiresAt && new Date() > new Date(u.expiresAt);
      return u.isActive !== false && !isExpired;
    }).length;
    const activeRate = totalLinks > 0 ? Math.round((activeLinksCount / totalLinks) * 100) : 0;
    const mostPopular = urls.length > 0 ? [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0] : null;
    return { totalLinks, totalClicks, activeRate, mostPopular };
  }, [urls]);

  // Extract unique tags for filtering (memoized)
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set();
    urls.forEach(u => {
      if (u.tags && Array.isArray(u.tags)) {
        u.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [urls]);

  // Filter and Sort URLs (memoized)
  const filteredUrls = useMemo(() => {
    return urls
      .filter(url => {
        // Search Term match
        const matchesSearch = 
          url.shorturl.toLowerCase().includes(searchTerm.toLowerCase()) ||
          url.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (url.description && url.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Status filter match
        const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
        let matchesStatus = true;
        if (statusFilter === "active") {
          matchesStatus = url.isActive !== false && !isExpired;
        } else if (statusFilter === "inactive") {
          matchesStatus = url.isActive === false;
        } else if (statusFilter === "expired") {
          matchesStatus = !!isExpired;
        }

        // Tag filter match
        let matchesTag = true;
        if (tagFilter !== "all") {
          matchesTag = url.tags && url.tags.includes(tagFilter);
        }

        return matchesSearch && matchesStatus && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === "click_high") return (b.clicks || 0) - (a.clicks || 0);
        if (sortBy === "click_low") return (a.clicks || 0) - (b.clicks || 0);
        return 0;
      });
  }, [urls, searchTerm, sortBy, statusFilter, tagFilter]);

  // Pagination calculations
  const itemsPerPage = 8;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, statusFilter, tagFilter]);

  const totalPages = Math.ceil(filteredUrls.length / itemsPerPage);

  const paginatedUrls = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUrls.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUrls, currentPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedUrls.map(u => u._id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedUrls.map(u => u._id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const isAllPageRowsSelected = useMemo(() => {
    if (paginatedUrls.length === 0) return false;
    return paginatedUrls.every(u => selectedIds.includes(u._id));
  }, [paginatedUrls, selectedIds]);

  if (loading && urls.length === 0) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-[70vh] bg-slate-950 text-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Initializing Portal...</span>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-950 text-gray-100 grid-bg relative overflow-hidden flex flex-col md:flex-row">
        
        {/* Background glowing mesh */}
        <div className="absolute top-[10%] left-[10%] w-[25rem] h-[25rem] bg-purple-600/5 rounded-full blur-3xl -z-10 animate-blob" />
        <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-cyan-600/5 rounded-full blur-3xl -z-10 animate-blob animation-delay-4000" />

        {/* SIDEBAR - DESKTOP */}
        <aside className={`border-r border-slate-900 bg-slate-950/60 backdrop-blur-md hidden md:flex flex-col justify-between shrink-0 transition-all duration-300 z-10 ${
          isSidebarCollapsed ? "w-20 p-4 items-center" : "w-64 p-6"
        }`}>
          <div className={`space-y-8 w-full ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
            <div className={`flex items-center w-full ${isSidebarCollapsed ? "flex-col justify-center gap-4" : "justify-between gap-2.5"}`}>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-md shadow-purple-500/20 shrink-0">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
                {!isSidebarCollapsed && (
                  <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    BitLinks
                  </span>
                )}
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-gray-400 hover:text-white transition-colors cursor-pointer hidden md:block"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            <nav className="space-y-1.5 w-full">
              <Link 
                href="/dashboard"
                title="Console Panel"
                className={`flex items-center rounded-xl font-bold transition-all text-sm bg-purple-500/10 text-purple-400 border border-purple-500/20 ${
                  isSidebarCollapsed ? "p-3.5 justify-center" : "gap-3 px-4 py-3"
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                {!isSidebarCollapsed && <span>Console Panel</span>}
              </Link>
              <Link 
                href="/shorten"
                title="Shorten Link"
                className={`flex items-center rounded-xl text-gray-400 hover:text-white hover:bg-slate-900 transition-all text-sm ${
                  isSidebarCollapsed ? "p-3.5 justify-center" : "gap-3 px-4 py-3"
                }`}
              >
                <PlusCircle className="h-5 w-5" />
                {!isSidebarCollapsed && <span>Shorten Link</span>}
              </Link>
              <Link 
                href="/about"
                title="System Docs"
                className={`flex items-center rounded-xl text-gray-400 hover:text-white hover:bg-slate-900 transition-all text-sm ${
                  isSidebarCollapsed ? "p-3.5 justify-center" : "gap-3 px-4 py-3"
                }`}
              >
                <Info className="h-5 w-5" />
                {!isSidebarCollapsed && <span>System Docs</span>}
              </Link>
            </nav>
          </div>

          <div className={`space-y-4 w-full ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`}>
            {user && (
              <div 
                title={`${user.name} (${user.email})`}
                className={`flex items-center rounded-xl bg-slate-900/50 border border-slate-800 w-full ${
                  isSidebarCollapsed ? "p-2 justify-center" : "gap-3 p-3"
                }`}
              >
                <div className="h-9 w-9 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-md shadow-purple-900/40">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className={`flex items-center rounded-xl text-sm font-semibold text-red-400 hover:text-red-350 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all cursor-pointer w-full ${
                isSidebarCollapsed ? "p-3.5 justify-center" : "gap-2.5 px-4 py-3 text-left"
              }`}
            >
              <LogOut className="h-5 w-5" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* MAIN CONTAINER */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-10 z-10 space-y-10">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-900">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest font-bold">
                <span>Console</span>
                <span>/</span>
                <span className="text-purple-400">Workspace</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mt-1">
                Link Infrastructure
              </h1>
              {user && (
                <p className="text-gray-400 text-sm mt-1">Welcome back, {user.name}. Audit, monitor, and deploy redirect routes.</p>
              )}
            </div>
            
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Short Link
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Deployments</span>
                <p className="text-xl sm:text-2xl font-black text-white">{stats.totalLinks}</p>
              </div>
              <div className="h-9 w-9 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                <CalendarDays className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block">Aggregate Traffic</span>
                <p className="text-xl sm:text-2xl font-black text-white">{stats.totalClicks}</p>
              </div>
              <div className="h-9 w-9 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center shrink-0">
                <MousePointerClick className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block">Active Ratio</span>
                <p className="text-xl sm:text-2xl font-black text-white">{stats.activeRate}%</p>
              </div>
              <div className="h-9 w-9 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block">Popular Slug</span>
                <p className="text-xs sm:text-sm font-mono font-bold text-cyan-400 truncate">
                  {stats.mostPopular ? `/${stats.mostPopular.shorturl}` : "N/A"}
                </p>
                <p className="text-[10px] text-gray-500">
                  {stats.mostPopular ? `${stats.mostPopular.clicks || 0} hits` : "0 hits"}
                </p>
              </div>
              <div className="h-9 w-9 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          {/* URL Management Console */}
          <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl space-y-4">
            
            {/* List Controls / Filters */}
            <div className="p-6 border-b border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col xl:flex-row justify-between items-center gap-4">
              
              {/* Search */}
              <div className="relative w-full xl:w-80">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search alias, URL, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search short URLs or destination URLs"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-200 transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
                
                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5">
                  <ListFilter className="h-3.5 w-3.5 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Links</option>
                    <option value="inactive">Inactive Links</option>
                    <option value="expired">Expired Links</option>
                  </select>
                </div>

                {/* Tag Filter */}
                <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5">
                  <Tag className="h-3.5 w-3.5 text-gray-500" />
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="bg-transparent border-none text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Tags</option>
                    {allUniqueTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                {/* Sorting */}
                <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest Created</option>
                    <option value="oldest">Oldest Created</option>
                    <option value="click_high">Highest Traffic</option>
                    <option value="click_low">Lowest Traffic</option>
                  </select>
                </div>

                <button 
                  onClick={fetchUrls}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition-all cursor-pointer"
                  title="Reload Workspace"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

              </div>
            </div>

            {/* Bulk Selection Bar */}
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-3.5 bg-purple-500/10 border-b border-purple-500/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm"
                >
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <CheckSquare className="h-4 w-4" />
                    <span>{selectedIds.length} link{selectedIds.length > 1 ? "s" : ""} selected</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleBulkCopy}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy Links
                    </button>
                    <button
                      onClick={handleBulkExport}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-green-400 hover:bg-green-500/5 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 hover:bg-amber-500/5 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => openDeleteConfirmation("bulk")}
                      className="px-3.5 py-1.5 rounded-xl bg-red-950/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-xs text-gray-500 hover:text-gray-300 font-semibold px-2 cursor-pointer"
                    >
                      Deselect
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List Table Content */}
            <div className="overflow-x-auto relative">
              {filteredUrls.length === 0 ? (
                /* EMPTY STATE Redesigned */
                <div className="py-20 text-center px-4 space-y-6 max-w-md mx-auto">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-purple-400 shadow-xl shadow-purple-950/20">
                    <Globe className="h-10 w-10 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">No Link Endpoints Resolved</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Deploy your first short link destination, tag your assets, or adjust the search filter criteria to monitor traffic.
                    </p>
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Deploy First Link
                  </button>
                </div>
              ) : (
                /* PREMIUM TABLE LAYOUT */
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-900/60 bg-slate-950/25 text-xs font-bold text-gray-500 uppercase tracking-wider select-none">
                      <th className="py-4 px-6 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isAllPageRowsSelected}
                          onChange={handleSelectAll}
                          className="rounded border-slate-800 bg-slate-900 text-purple-600 focus:ring-purple-500/20 focus:ring-2 cursor-pointer h-4 w-4"
                        />
                      </th>
                      <th className="py-4 px-6 min-w-[200px]">Short Link</th>
                      <th className="py-4 px-6 min-w-[300px]">Destination URL</th>
                      <th className="py-4 px-6 w-28 text-center">Clicks</th>
                      <th className="py-4 px-6 w-32">Created</th>
                      <th className="py-4 px-6 w-36">Expiration</th>
                      <th className="py-4 px-6 w-24 text-center">Status</th>
                      <th className="py-4 px-6 w-28 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {paginatedUrls.map((url, idx) => {
                      const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
                      const isSelected = selectedIds.includes(url._id);
                      
                      return (
                        <tr 
                          key={url._id || `row-${idx}`}
                          className={`hover:bg-slate-900/10 transition-all ${
                            isSelected ? "bg-purple-900/5" : ""
                          }`}
                        >
                          {/* Selector */}
                          <td className="py-4 px-6 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(url._id, e.target.checked)}
                              className="rounded border-slate-800 bg-slate-900 text-purple-600 focus:ring-purple-500/20 focus:ring-2 cursor-pointer h-4 w-4"
                            />
                          </td>

                          {/* Short Link / Alias */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 group/link">
                              <span className="font-mono text-sm font-bold text-purple-400 truncate max-w-[180px]" title={url.fullShortUrl}>
                                {host}/{url.shorturl}
                              </span>
                              <div className="flex items-center gap-1 opacity-60 group-hover/link:opacity-100 transition-opacity">
                                <button
                                  onClick={() => copyToClipboard(url.fullShortUrl, url._id)}
                                  className="text-gray-400 hover:text-white transition-colors p-1"
                                  title="Copy Short Link"
                                >
                                  {copiedId === url._id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                                <a
                                  href={url.fullShortUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-cyan-400 p-1 transition-colors"
                                  title="Visit Redirect URL"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Target Destination */}
                          <td className="py-4 px-6">
                            <div className="space-y-1 max-w-sm md:max-w-md lg:max-w-lg">
                              <p className="text-xs text-gray-300 font-semibold truncate hover:text-white transition-colors duration-200" title={url.url}>
                                <a href={url.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-purple-350">
                                  {url.url}
                                </a>
                              </p>
                              {url.description && (
                                <p className="text-[11px] text-gray-550 italic truncate" title={url.description}>{url.description}</p>
                              )}
                              
                              {/* Tags badge lists */}
                              {url.tags && url.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {url.tags.map(tag => (
                                    <span 
                                      key={tag}
                                      onClick={() => setTagFilter(tag)}
                                      className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-purple-400 px-2 py-0.5 rounded-full hover:border-purple-500/30 transition-all cursor-pointer"
                                    >
                                      <Tag className="h-2 w-2" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Traffic visits */}
                          <td className="py-4 px-6 text-center">
                            <div className="inline-flex items-center gap-1 text-sm font-bold text-gray-200">
                              <MousePointerClick className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                              <span>{url.clicks || 0}</span>
                            </div>
                          </td>

                          {/* Created At */}
                          <td className="py-4 px-6">
                            <span className="text-xs text-gray-400 font-semibold">
                              {new Date(url.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Expiration column */}
                          <td className="py-4 px-6">
                            {url.expiresAt ? (
                              <div className={`flex items-center gap-1.5 ${isExpired ? "text-rose-450" : "text-gray-300"}`}>
                                <Clock className="h-3.5 w-3.5 text-gray-500" />
                                <span className="text-xs font-semibold">{new Date(url.expiresAt).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-xs font-normal">Infinite Life</span>
                            )}
                          </td>

                          {/* Status Inline Toggle */}
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => toggleUrlActiveStatus(url)}
                              className="text-gray-400 hover:text-white p-1 transition-all cursor-pointer bg-transparent border-none"
                              title={url.isActive !== false ? "Disable Link" : "Enable Link"}
                              disabled={isExpired}
                            >
                              {url.isActive !== false && !isExpired ? (
                                <ToggleRight className="h-7 w-7 text-green-400" />
                              ) : (
                                <ToggleLeft className={`h-7 w-7 ${isExpired ? "text-rose-950/20 cursor-not-allowed opacity-40" : "text-gray-650"}`} />
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center items-center gap-1.5">
                              <button
                                onClick={() => openEditModal(url)}
                                className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-gray-400 hover:text-white transition-all cursor-pointer"
                                title="Edit Deployment"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => openShareModal(url)}
                                className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-gray-400 hover:text-white transition-all cursor-pointer"
                                title="Share / Qr Code"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirmation(url._id)}
                                className="p-1.5 rounded bg-slate-900/60 border border-red-500/10 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all cursor-pointer"
                                title="Delete Deployment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-5 border-t border-slate-900 bg-slate-950/20 flex items-center justify-between gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-xs font-bold text-gray-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider select-none">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-xs font-bold text-gray-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

          </div>

        </main>

        {/* ============================================================== */}
        {/* MODALS / OVERLAYS                                              */}
        {/* ============================================================== */}

        {/* 1. SLIDE-OVER URL CREATOR / EDITOR MODAL */}
        <AnimatePresence>
          {isUrlModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUrlModalOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              
              {/* Drawer Container */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-slate-950 border-l border-slate-900 p-8 shadow-2xl overflow-y-auto z-50 flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-extrabold text-white">
                        {modalMode === "create" ? "Deploy New Link" : "Modify Redirect Configuration"}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">Configure target and routing rules.</p>
                    </div>
                    <button 
                      onClick={() => setIsUrlModalOpen(false)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} id="url-config-form" className="space-y-6">
                    
                    {/* Destination URL */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Target Destination URL
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="https://example.com/your-destination-path"
                        value={formUrl}
                        onChange={(e) => setFormUrl(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all text-white"
                      />
                    </div>

                    {/* Alias */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Custom Alias (Optional)
                      </label>
                      <div className="flex items-center w-full bg-slate-900/60 border border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all overflow-hidden">
                        <span className="pl-4 text-xs font-mono text-slate-500 select-none">
                          {host}/
                        </span>
                        <input
                          type="text"
                          placeholder="slug"
                          value={formAlias}
                          onChange={(e) => setFormAlias(e.target.value)}
                          className="w-full pl-1 pr-4 py-3 bg-transparent border-none focus:outline-none text-sm font-mono text-gray-100"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">Only alphanumeric, dashes, and underscores allowed.</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Description (Optional)
                      </label>
                      <textarea
                        placeholder="A short note explaining what this link does..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all h-20 resize-none text-white"
                      />
                    </div>

                    {/* Expiration Date */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Expiration Date (Optional)
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-650 h-4 w-4" />
                        <input
                          type="date"
                          value={formExpiresAt}
                          onChange={(e) => setFormExpiresAt(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all text-gray-300"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Tags (Comma Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="marketing, campaign-2026, social"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all text-white"
                      />
                    </div>

                    {/* Is Active Status Switch */}
                    <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Active State</span>
                        <span className="text-[10px] text-gray-500">Deactivating routing rejects clicks instantly.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormIsActive(!formIsActive)}
                        className="text-gray-400 hover:text-white transition-all cursor-pointer bg-transparent border-none text-left"
                      >
                        {formIsActive ? (
                          <ToggleRight className="h-8 w-8 text-purple-500 animate-pulse" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-gray-600" />
                        )}
                      </button>
                    </div>

                  </form>
                </div>

                <div className="flex gap-4 pt-8 border-t border-slate-900 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsUrlModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-705 text-sm font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="url-config-form"
                    disabled={formSubmitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {formSubmitting ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      modalMode === "create" ? "Deploy Link" : "Save Changes"
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 2. CONFIRM DELETE MODAL */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDeleteModalOpen(false)}
                className="fixed inset-0 bg-black"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-950 border border-slate-900 p-6 rounded-3xl max-w-sm w-full relative z-10 space-y-6 shadow-2xl text-center"
              >
                <div className="h-12 w-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Revoke Redirection Route?</h3>
                  <p className="text-xs text-gray-550 leading-relaxed">
                    This will permanently revoke and delete the link configuration. Users visiting this slug will receive a 404 block. This action is irreversible.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
                  >
                    Keep Route
                  </button>
                  <button
                    onClick={executeDelete}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Delete Link
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. SHARE & QR CODE DRAWER MODAL */}
        <AnimatePresence>
          {isShareModalOpen && shareTargetUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsShareModalOpen(false)}
                className="fixed inset-0 bg-black"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full relative z-10 space-y-6 shadow-2xl text-center"
              >
                <div className="flex justify-between items-center text-left">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Share Deployment</span>
                  <button 
                    onClick={() => setIsShareModalOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-2xl mx-auto w-fit shadow-xl flex items-center justify-center">
                  {qrDataUrls[shareTargetUrl._id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={qrDataUrls[shareTargetUrl._id]} 
                      alt="QR Code" 
                      className="h-44 w-44" 
                    />
                  ) : (
                    <div className="h-44 w-44 flex flex-col items-center justify-center bg-slate-900 rounded-xl gap-2">
                      {qrLoading ? (
                        <Loader2 className="animate-spin h-6 w-6 text-purple-500" />
                      ) : (
                        <button
                          onClick={() => toggleQrPreview(shareTargetUrl._id, shareTargetUrl.fullShortUrl)}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Generate QR Code
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Info and Copy details */}
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-left space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Shortened Link</span>
                    <div className="flex justify-between items-center font-mono text-xs text-purple-400 font-bold">
                      <span className="truncate">{shareTargetUrl.fullShortUrl}</span>
                      <button 
                        onClick={() => copyToClipboard(shareTargetUrl.fullShortUrl, shareTargetUrl._id)}
                        className="text-gray-450 hover:text-white p-1 bg-transparent border-none cursor-pointer"
                      >
                        {copiedId === shareTargetUrl._id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => downloadQr(shareTargetUrl.shorturl, shareTargetUrl.fullShortUrl)}
                    disabled={!qrDataUrls[shareTargetUrl._id]}
                    className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Download QR
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my short link: ${shareTargetUrl.fullShortUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition-all cursor-pointer hover:border-purple-500/20"
                    title="Share on Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTargetUrl.fullShortUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition-all cursor-pointer hover:border-purple-500/20"
                    title="Share on WhatsApp"
                  >
                    <Send className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
};

export default Dashboard;
