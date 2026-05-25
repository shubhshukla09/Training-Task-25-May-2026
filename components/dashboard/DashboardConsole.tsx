"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AnalyticsChart from "./AnalyticsChart";
import Editor from "@/components/blog/Editor";
import { 
  Sparkles, LayoutDashboard, FileText, MessageSquare, Mail, 
  Terminal, Plus, Check, Eye, Trash2, Edit, X, Upload, Bookmark,
  Layers, Lock, EyeOff
} from "lucide-react";

interface DashboardConsoleProps {
  initialData: {
    metrics: {
      totalBlogs: number;
      totalDrafts: number;
      totalViews: number;
      totalSubscribers: number;
    };
    posts: any[];
    categories: any[];
    tags: any[];
    comments: any[];
    subscribers: any[];
    activities: any[];
    chartData: any[];
  };
}

type TabType = "analytics" | "blogs" | "comments" | "subscribers" | "logs";

export default function DashboardConsole({ initialData }: DashboardConsoleProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [posts, setPosts] = useState<any[]>(initialData.posts);
  const [comments, setComments] = useState<any[]>(initialData.comments);
  const [subscribers, setSubscribers] = useState<any[]>(initialData.subscribers);
  const [activities, setActivities] = useState<any[]>(initialData.activities);
  const [metrics, setMetrics] = useState(initialData.metrics);

  // Writing & Editing Overlay States
  const [isWriting, setIsWriting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  
  // Form States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");

  // Helper: Slugify title automatically
  function handleTitleChange(text: string) {
    setTitle(text);
    if (!editingPostId) {
      setSlug(
        text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
      );
    }
  }

  // 1. Image Upload Handler
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setFeaturedImage(data.url);
    } catch (err) {
      setFormError("Failed to upload image. Using default fallback.");
    } finally {
      setUploading(false);
    }
  }

  // 2. Blog Mutator (Create / Update)
  const blogMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = editingPostId ? `/api/blogs/${editingPostId}` : "/api/blogs";
      const method = editingPostId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save blog post");
      }
      return data;
    },
    onSuccess: (data) => {
      if (editingPostId) {
        setPosts((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
      } else {
        setPosts((prev) => [data, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          totalBlogs: data.published ? prev.totalBlogs + 1 : prev.totalBlogs,
          totalDrafts: !data.published ? prev.totalDrafts + 1 : prev.totalDrafts,
        }));
      }
      closeEditor();
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to save post");
    },
  });

  function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !slug || !content || !categoryId) {
      setFormError("All required fields must be filled!");
      return;
    }

    blogMutation.mutate({
      title,
      slug,
      content,
      summary,
      featuredImage,
      categoryId,
      tagIds: selectedTagIds,
      published,
    });
  }

  // Edit action
  function openEditorForEdit(post: any) {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setSummary(post.summary);
    setFeaturedImage(post.featuredImage || "");
    setCategoryId(post.categoryId);
    setSelectedTagIds(post.tags?.map((t: any) => t.id) || []);
    setPublished(post.published);
    setIsWriting(true);
  }

  function closeEditor() {
    setIsWriting(false);
    setEditingPostId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setSummary("");
    setFeaturedImage("");
    setCategoryId("");
    setSelectedTagIds([]);
    setPublished(false);
    setFormError("");
  }

  // 3. Blog Deleter
  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: (_, deletedId) => {
      const original = posts.find((p) => p.id === deletedId);
      setPosts((prev) => prev.filter((p) => p.id !== deletedId));
      if (original) {
        setMetrics((prev) => ({
          ...prev,
          totalBlogs: original.published ? prev.totalBlogs - 1 : prev.totalBlogs,
          totalDrafts: !original.published ? prev.totalDrafts - 1 : prev.totalDrafts,
        }));
      }
    },
  });

  // 4. Toggle Publish Status
  const togglePublishMutation = useMutation({
    mutationFn: async (post: any) => {
      const res = await fetch(`/api/blogs/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setPosts((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
      setMetrics((prev) => ({
        ...prev,
        totalBlogs: data.published ? prev.totalBlogs + 1 : prev.totalBlogs - 1,
        totalDrafts: !data.published ? prev.totalDrafts + 1 : prev.totalDrafts - 1,
      }));
    },
  });

  // 5. Comment Moderation (Approve / Unapprove)
  const commentModerationMutation = useMutation({
    mutationFn: async (payload: { id: string; approved: boolean }) => {
      const res = await fetch(`/api/comments/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: payload.approved }),
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setComments((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
    },
  });

  // 6. Comment Deleter
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: (_, deletedId) => {
      setComments((prev) => prev.filter((c) => c.id !== deletedId));
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* 7. DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-white/5 mb-10 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider">
              Dashboard Console
            </h1>
          </div>
          <p className="text-xs text-zinc-400">Manage platform analytics, publications, and comment moderation.</p>
        </div>

        <button
          onClick={() => setIsWriting(true)}
          className="px-5 py-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold shadow-glow-cyan flex items-center space-x-1.5 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* 8. STAT CARDS METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Views", val: metrics.totalViews, icon: <Eye className="text-cyan-400" /> },
          { label: "Published Blogs", val: metrics.totalBlogs, icon: <FileText className="text-emerald-400" /> },
          { label: "Active Drafts", val: metrics.totalDrafts, icon: <EyeOff className="text-violet-400" /> },
          { label: "Newsletter List", val: metrics.totalSubscribers, icon: <Mail className="text-amber-500" /> },
        ].map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-white/10 bg-zinc-950/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                {item.label}
              </span>
              <span className="text-2xl font-extrabold text-white leading-none font-outfit">
                {item.val}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 9. MAIN CONTENT PANELS (Sidebar Tab Select + active tab window) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tab Sidebar selector */}
        <aside className="lg:col-span-3 flex flex-col space-y-1 bg-zinc-950/30 border border-white/5 rounded-2xl p-2.5">
          {[
            { id: "analytics", label: "Analytics Graph", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "blogs", label: "Blogs CRUD list", icon: <FileText className="w-4 h-4" /> },
            { id: "comments", label: "Comments Moderation", icon: <MessageSquare className="w-4 h-4" /> },
            { id: "subscribers", label: "Subscribers", icon: <Mail className="w-4 h-4" /> },
            { id: "logs", label: "System Logs", icon: <Terminal className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-3 w-full px-4.5 py-3 rounded-xl text-xs font-bold transition-all text-left focus:outline-none ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <div className={activeTab === tab.id ? "text-cyan-400" : ""}>{tab.icon}</div>
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Tab Active Window */}
        <main className="lg:col-span-9">
          {/* TAB 1: ANALYTICS GRAPH */}
          {activeTab === "analytics" && (
            <div className="flex flex-col space-y-6">
              <AnalyticsChart data={initialData.chartData} />
            </div>
          )}

          {/* TAB 2: BLOGS CRUD LIST */}
          {activeTab === "blogs" && (
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl overflow-hidden flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Blogs List Control</h3>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-500 font-bold">
                      <th className="pb-3.5 pl-2">Title</th>
                      <th className="pb-3.5">Category</th>
                      <th className="pb-3.5">Views</th>
                      <th className="pb-3.5">Status</th>
                      <th className="pb-3.5 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-white/5 hover:bg-white/3 font-medium text-zinc-300">
                        <td className="py-4 pl-2 font-bold text-white max-w-[200px] truncate">{post.title}</td>
                        <td className="py-4">{post.category.name}</td>
                        <td className="py-4">{post.views}</td>
                        <td className="py-4">
                          <button
                            onClick={() => togglePublishMutation.mutate(post)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              post.published
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-700/20 border-zinc-700/30 text-zinc-400"
                            }`}
                          >
                            {post.published ? "Published" : "Draft"}
                          </button>
                        </td>
                        <td className="py-4 pr-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditorForEdit(post)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition-colors focus:outline-none"
                              title="Edit post"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this blog post?")) {
                                  deleteBlogMutation.mutate(post.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors focus:outline-none"
                              title="Delete post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COMMENTS MODERATION */}
          {activeTab === "comments" && (
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl overflow-hidden flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Comment Moderation Feed</h3>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-500 font-bold">
                      <th className="pb-3.5 pl-2">Author</th>
                      <th className="pb-3.5">Blog Title</th>
                      <th className="pb-3.5">Comment</th>
                      <th className="pb-3.5 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((comment) => (
                      <tr key={comment.id} className="border-b border-white/5 hover:bg-white/3 font-medium text-zinc-300">
                        <td className="py-4 pl-2 font-bold text-white">
                          <div>
                            <p className="text-xs">{comment.author.name}</p>
                            <p className="text-[10px] text-zinc-500 font-normal">{comment.author.email}</p>
                          </div>
                        </td>
                        <td className="py-4 max-w-[150px] truncate">{comment.post.title}</td>
                        <td className="py-4 max-w-[200px] truncate" title={comment.content}>
                          {comment.content}
                        </td>
                        <td className="py-4 pr-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => commentModerationMutation.mutate({ id: comment.id, approved: !comment.approved })}
                              className={`p-1.5 rounded-lg border transition-all ${
                                comment.approved
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                  : "border-zinc-700/20 bg-zinc-700/10 text-zinc-400 hover:text-emerald-400"
                              }`}
                              title={comment.approved ? "Approved (Click to hide)" : "Hidden (Click to approve)"}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this comment permanently?")) {
                                  deleteCommentMutation.mutate(comment.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors focus:outline-none"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIBERS */}
          {activeTab === "subscribers" && (
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl overflow-hidden flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Newsletter Subscribers</h3>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-500 font-bold">
                      <th className="pb-3.5 pl-2">Subscriber Email</th>
                      <th className="pb-3.5">Status</th>
                      <th className="pb-3.5 pr-2 text-right">Date Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="border-b border-white/5 hover:bg-white/3 font-medium text-zinc-300">
                        <td className="py-4 pl-2 font-bold text-white">{sub.email}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            sub.active
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                            {sub.active ? "Active" : "Unsubscribed"}
                          </span>
                        </td>
                        <td className="py-4 pr-2 text-right text-zinc-500">
                          {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM LOGS */}
          {activeTab === "logs" && (
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Real-time Activity Stream</h3>
              
              <div className="flex flex-col space-y-4 font-mono text-xs">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 p-3 rounded-lg border border-white/5 bg-zinc-900/30">
                    <span className="text-cyan-400 font-bold shrink-0">[$]</span>
                    <div className="flex-grow">
                      <p className="text-zinc-200">{act.description}</p>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        {new Date(act.createdAt).toLocaleString()} | Type: {act.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 10. WRITING & EDITING OVERLAY MODAL */}
      {isWriting && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/85 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in-up">
          <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[#09090b]/90 p-8 shadow-glass-lg flex flex-col space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingPostId ? "Modify Blog Post" : "Compose New Technical Article"}
                </h2>
                <p className="text-xs text-zinc-500">Slugify, add media, tag topics, and compile markdown.</p>
              </div>
              <button
                onClick={closeEditor}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error logs */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmitPost} className="space-y-5">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    Article Title
                  </label>
                  <input
                    type="text"
                    placeholder="The Future of Web Compilation..."
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="glass-input px-4 py-2.5 text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="future-of-web-compilation"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="glass-input px-4 py-2.5 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              {/* Media Upload & Category select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    Featured Image URL
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      className="glass-input px-4 py-2.5 text-sm flex-grow"
                    />
                    
                    {/* Raw File Uploader selector button */}
                    <label className="p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    Content Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="glass-input px-4 py-2.5 text-sm bg-zinc-950 focus:ring-0"
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {initialData.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags Selector */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Topic Tags
                </label>
                <div className="flex flex-wrap gap-2.5 p-3.5 rounded-2xl border border-white/5 bg-zinc-950/20">
                  {initialData.tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setSelectedTagIds((prev) =>
                            isSelected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                            : "border-white/5 bg-white/5 text-zinc-500 hover:text-white"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Markdown split editor */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Markdown Content
                </label>
                <Editor content={content} onChange={setContent} />
              </div>

              {/* Bottom CTAs */}
              <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="publishCheck"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-white/10 bg-zinc-950 focus:ring-0 text-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="publishCheck" className="text-xs font-bold text-zinc-300 cursor-pointer">
                    Publish immediately (draft otherwise)
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="px-6 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={blogMutation.isPending}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold shadow-glow-cyan"
                  >
                    {blogMutation.isPending ? "Saving..." : "Save Publication"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
