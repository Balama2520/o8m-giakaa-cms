import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import { clearAuth, getUser } from '../utils/auth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Plus,
    Trash,
    Edit,
    Save,
    X,
    Layout,
    FileText,
    CheckCircle,
    Circle,
    LogOut,
    AlertCircle,
    Shield
} from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('hero');
    const [slides, setSlides] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [notification, setNotification] = useState(null);

    const currentUser = getUser();

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'hero' ? '/admin/hero' : '/admin/blogs';
            const res = await api.get(endpoint);
            if (activeTab === 'hero') {
                setSlides(res.data.data || []);
            } else {
                setBlogs(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load CMS content:', error);
            showNotification(
                'error',
                error.response?.data?.error || 'Unable to load content. Please check server status.'
            );
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (item) => {
        setEditingId(item._id || item.id);
        setFormData(item);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const isNew = editingId === 'new';
            const basePath = activeTab === 'hero' ? '/admin/hero' : '/admin/blogs';
            const url = isNew ? basePath : `${basePath}/${editingId}`;
            const method = isNew ? 'post' : 'put';

            await api[method](url, formData);
            showNotification('success', `${activeTab === 'hero' ? 'Hero slide' : 'Blog post'} saved successfully!`);
            setEditingId(null);
            setFormData({});
            fetchData();
        } catch (err) {
            console.error('Save error:', err);
            showNotification('error', err.response?.data?.error || 'Failed to save item. Check validation rules.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const endpoint = activeTab === 'hero' ? `/admin/hero/${id}` : `/admin/blogs/${id}`;
                await api.delete(endpoint);
                showNotification('success', 'Item deleted successfully');
                fetchData();
            } catch (err) {
                console.error('Delete error:', err);
                showNotification('error', err.response?.data?.error || 'Delete failed');
            }
        }
    };

    const handleLogoutClick = () => {
        clearAuth();
        if (onLogout) {
            onLogout();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-24 pb-32">
            <div className="max-w-6xl mx-auto">
                {/* Header with User Info and Logout */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Shield size={24} />
                            </span>
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">o8m Giakaa CMS</h1>
                                <p className="text-slate-500 text-sm mt-0.5">Administrative Content Management Portal</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentUser && (
                            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200 text-slate-700">
                                Logged in as: <strong>{currentUser.username}</strong>
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleLogoutClick}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 font-semibold text-sm text-slate-600 transition-all"
                            aria-label="Log out of CMS"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </header>

                {/* Accessible Notification Banner */}
                {notification && (
                    <div
                        role="alert"
                        className={`mb-6 p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium animate-in fade-in duration-200 ${
                            notification.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {notification.type === 'success' ? (
                                <CheckCircle size={18} className="shrink-0" />
                            ) : (
                                <AlertCircle size={18} className="shrink-0" />
                            )}
                            <span>{notification.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setNotification(null)}
                            className="p-1 hover:opacity-75 transition-opacity"
                            aria-label="Dismiss notification"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Tab Controls */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit mb-8">
                    <button
                        type="button"
                        onClick={() => { setActiveTab('hero'); setEditingId(null); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold text-sm ${
                            activeTab === 'hero' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Layout size={18} /> Hero Slides
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab('blogs'); setEditingId(null); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold text-sm ${
                            activeTab === 'blogs' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <FileText size={18} /> Blogs
                    </button>
                </div>

                {/* Edit / Create Form */}
                {editingId ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 mb-20">
                        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingId === 'new' ? 'Create New' : 'Edit'} {activeTab === 'hero' ? 'Hero Slide' : 'Blog Post'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                                aria-label="Cancel editing"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={100}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Enter title..."
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                {activeTab === 'hero' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Media URL</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="https://images.unsplash.com/..."
                                                value={formData.mediaUrl || ''}
                                                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-28"
                                                placeholder="Slide subtitle or brief narrative..."
                                                value={formData.description || ''}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">CTA Button Text</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="e.g. Learn More"
                                                value={formData.ctaText || ''}
                                                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">CTA Target URL</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="https://... or /services"
                                                value={formData.ctaLink || ''}
                                                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Display Priority Order</label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.displayOrder ?? 0}
                                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Slide Visibility</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.isActive === false ? 'inactive' : 'active'}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                            >
                                                <option value="active">Active (Visible on public landing)</option>
                                                <option value="inactive">Inactive (Hidden from public)</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Featured Image URL</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="https://images.unsplash.com/..."
                                                value={formData.featuredImage || ''}
                                                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">SEO Meta Title</label>
                                            <input
                                                type="text"
                                                maxLength={60}
                                                placeholder="SEO Title (< 60 chars)"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.metaTitle || ''}
                                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">SEO Meta Description</label>
                                            <input
                                                type="text"
                                                maxLength={160}
                                                placeholder="SEO Meta Description (< 160 chars)"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.metaDescription || ''}
                                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Publishing Status</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.status || 'draft'}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="draft">Draft (Private / Unlisted)</option>
                                                <option value="published">Published (Public / Indexed)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2 mt-4">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Article Content *</label>
                                            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.content || ''}
                                                    onChange={(content) => setFormData({ ...formData, content })}
                                                    style={{ height: '360px' }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-4 mt-20 pt-8 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        {/* Table Header Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                Manage {activeTab === 'hero' ? 'Hero Slides' : 'Blog Articles'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => { setEditingId('new'); setFormData({}); }}
                                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 text-sm"
                            >
                                <Plus size={18} /> Add New {activeTab === 'hero' ? 'Slide' : 'Post'}
                            </button>
                        </div>

                        {/* Content Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200 text-left">
                                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Title</th>
                                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Status / Priority</th>
                                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(activeTab === 'hero' ? slides : blogs).map((item) => (
                                        <tr key={item._id || item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{item.title}</div>
                                                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                                                    {item.slug ? `/blog/${item.slug}` : (item.mediaUrl || 'Default Banner')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                                                            (item.isActive || item.status === 'published')
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-amber-50 text-amber-600'
                                                        }`}
                                                    >
                                                        {(item.isActive || item.status === 'published') ? <CheckCircle size={12} /> : <Circle size={12} />}
                                                        {activeTab === 'hero'
                                                            ? (item.isActive ? 'Active' : 'Inactive')
                                                            : (item.status === 'published' ? 'Published' : 'Draft')}
                                                    </span>
                                                    {activeTab === 'hero' && (
                                                        <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                                                            Priority: {item.displayOrder ?? 0}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors inline-block"
                                                    aria-label="Edit item"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item._id || item.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                                                    aria-label="Delete item"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {loading && (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                                    <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                                    <p className="font-medium text-sm">Loading CMS contents...</p>
                                </div>
                            )}

                            {!loading && (activeTab === 'hero' ? slides : blogs).length === 0 && (
                                <div className="py-20 text-center text-slate-400">
                                    <p className="font-medium text-lg">No content found</p>
                                    <p className="text-sm mt-1">Click "Add New" to create your first {activeTab === 'hero' ? 'slide' : 'article'}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
