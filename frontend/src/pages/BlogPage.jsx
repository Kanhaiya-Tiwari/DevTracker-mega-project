import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, Clock, Heart, MessageCircle, Share2, BookOpen, Image as ImageIcon } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import { api } from "../services/api";
import { useNotifications } from "../contexts/NotificationContext";

export default function BlogPage({ token, user }) {
  const [blogs, setBlogs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    cover_image: "",
  });
  const { triggerXPEarned } = useNotifications();

  useEffect(() => {
    if (token) {
      fetchBlogs();
    }
  }, [token]);

  const fetchBlogs = async () => {
    try {
      const data = await api.getBlogs(token);
      setBlogs(data || []);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBlog) {
        await api.updateBlog(token, editingBlog.id, formData);
      } else {
        await api.createBlog(token, formData);
        triggerXPEarned(30, "writing a blog");
      }
      setShowCreateModal(false);
      setEditingBlog(null);
      setFormData({ title: "", content: "", cover_image: "" });
      fetchBlogs();
    } catch (error) {
      alert(error?.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      cover_image: blog.cover_image || "",
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (blogId) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.deleteBlog(token, blogId);
      fetchBlogs();
    } catch (error) {
      alert(error?.message || "Failed to delete blog");
    }
  };

  const handleLike = async (blogId) => {
    if (!token) {
      alert("Please log in to like blogs");
      return;
    }
    try {
      // Toggle like functionality
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId 
          ? { ...blog, likes: (blog.likes || 0) + 1, userLiked: true }
          : blog
      ));
      // You can add API call here if backend supports it
      // await api.likeBlog(token, blogId);
    } catch (error) {
      console.error("Failed to like blog:", error);
    }
  };

  const handleComment = (blogId) => {
    const comment = prompt("Share your thoughts on this blog:");
    if (comment && token) {
      // Add comment functionality
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId 
          ? { ...blog, comments: (blog.comments || 0) + 1 }
          : blog
      ));
      // You can add API call here if backend supports it
      // await api.addComment(token, blogId, comment);
    }
  };

  const handleShare = (blog) => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.content.slice(0, 200) + "...",
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `${blog.title}\n\n${blog.content.slice(0, 200)}...\n\n${window.location.href}`;
      navigator.clipboard.writeText(text);
      alert("Blog link copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getReadingTime = (content) => {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200) + " min read";
  };

  const unsplashImages = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-900/30 via-blue-900/20 to-violet-900/15 p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold text-white">Community Insights</h2>
          </div>
          <p className="text-slate-300">Share your learning journey and insights with the community</p>
          <Button
            onClick={() => {
              setEditingBlog(null);
              setFormData({ title: "", content: "", cover_image: "" });
              setShowCreateModal(true);
            }}
            variant="primary"
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write New Blog
          </Button>
        </div>
      </div>

      {/* Blog Feed */}
      <div className="space-y-6">
        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sky-400/30 bg-gradient-to-br from-sky-900/20 to-violet-900/10 p-16 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <BookOpen className="w-10 h-10 text-sky-400" />
            </div>
            <p className="text-white font-bold text-2xl mb-3">Start Your Journey</p>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Share your learning insights, breakthrough moments, and tips with the community. Your experience matters.</p>
            <Button
              onClick={() => {
                setEditingBlog(null);
                setFormData({ title: "", content: "", cover_image: "" });
                setShowCreateModal(true);
              }}
              variant="primary"
              className="animate-scale-in"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write Your First Blog
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {blogs.map((blog, index) => (
              <article
                key={blog.id}
                className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-900/20 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Cover Image */}
                {blog.cover_image && (
                  <div className="h-64 overflow-hidden relative group">
                    <img
                      src={blog.cover_image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  </div>
                )}

                <div className="p-6 -mt-20 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 via-violet-500 to-pink-500 p-0.5 shadow-lg shadow-sky-900/30 animate-spin-slow">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(blog.created_at)}
                          <span className="text-slate-600">•</span>
                          <Clock className="w-3.5 h-3.5" />
                          {getReadingTime(blog.content)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-slate-400 hover:text-sky-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2.5 hover:bg-rose-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{blog.title}</h3>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-6 line-clamp-4">{blog.content}</p>

                  <div className="flex items-center gap-6 pt-4 border-t border-slate-700/50">
                    <button 
                      onClick={() => handleLike(blog.id)}
                      className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${
                        blog.userLiked 
                          ? "text-rose-400" 
                          : "text-slate-400 hover:text-rose-400"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${blog.userLiked ? "fill-current" : ""}`} />
                      <span className="text-sm font-medium">
                        {blog.likes || 0} {blog.likes === 1 ? "Like" : "Likes"}
                      </span>
                    </button>
                    <button 
                      onClick={() => handleComment(blog.id)}
                      className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-all duration-200 hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {blog.comments || 0} {blog.comments === 1 ? "Comment" : "Comments"}
                      </span>
                    </button>
                    <button 
                      onClick={() => handleShare(blog)}
                      className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-all duration-200 hover:scale-105"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingBlog ? "Edit Blog" : "Write New Blog"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter an engaging title..."
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image URL (optional)</label>
                <Input
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
                {formData.cover_image && (
                  <div className="mt-2 h-32 rounded-lg overflow-hidden">
                    <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {!formData.cover_image && (
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {unsplashImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, cover_image: img })}
                        className="h-16 rounded-lg overflow-hidden hover:ring-2 ring-sky-500 transition-all"
                      >
                        <img src={img} alt={`Option ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={12}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 text-white px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                  placeholder="Share your insights, learning journey, or tips..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBlog(null);
                    setFormData({ title: "", content: "", cover_image: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" disabled={loading}>
                  {loading ? "Saving..." : editingBlog ? "Update Blog" : "Publish Blog"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
