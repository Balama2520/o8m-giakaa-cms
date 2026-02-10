import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, Trash, Edit, Save, X, Layout, FileText, CheckCircle, Circle, ArrowUp, ArrowDown } from 'lucide-react';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('hero');
    const [slides, setSlides] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'hero' ? '/api/hero' : '/api/blogs';
            const res = await axios.get(`http://localhost:5000${endpoint}`);
            if (activeTab === 'hero') setSlides(res.data.data);
            else setBlogs(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id || item.id);
        setFormData(item);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const url = activeTab === 'hero'
                ? `http://localhost:5000/api/hero/${editingId === 'new' ? '' : editingId}`
                : `http://localhost:5000/api/blogs/${editingId === 'new' ? '' : editingId}`;

            const method = editingId === 'new' ? 'post' : 'put';
            await axios[method](url, formData);
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Save failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const endpoint = activeTab === 'hero' ? `/api/hero/${id}` : `/api/blogs/${id}`;
                await axios.delete(`http://localhost:5000${endpoint}`);
                fetchData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">o8m Giakaa CMS</h1>
                        <p className="text-slate-500 mt-1">Manage your professional landing page content</p>
                    </div>
                </header>

                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('hero')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold ${activeTab === 'hero' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Layout size={18} /> Hero Slides
                    </button>
                    <button
                        onClick={() => setActiveTab('blogs')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold ${activeTab === 'blogs' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <FileText size={18} /> Blogs
                    </button>
                </div>

                {editingId ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 mb-20">
                        <div className="bg-slate-50 border-bottom border-slate-100 p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingId === 'new' ? 'Create New' : 'Edit'} {activeTab === 'hero' ? 'Hero Slide' : 'Blog post'}
                            </h2>
                            <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Enter title..."
                                        value={formData.title || ''}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                {activeTab === 'hero' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Media URL</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="https://..."
                                                value={formData.mediaUrl || ''}
                                                onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32"
                                                placeholder="Tell your story..."
                                                value={formData.description || ''}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">CTA Text</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.ctaText || ''}
                                                onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">CTA Link</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.ctaLink || ''}
                                                onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Display Order (Priority)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.displayOrder || 0}
                                                onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Visibility</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                                value={formData.isActive === false ? 'inactive' : 'active'}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
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
                                                value={formData.featuredImage || ''}
                                                onChange={e => setFormData({ ...formData, featuredImage: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Meta Title</label>
                                            <input
                                                type="text"
                                                placeholder="SEO Title (recommended < 60 chars)"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.metaTitle || ''}
                                                onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Meta Description</label>
                                            <input
                                                type="text"
                                                placeholder="SEO Description (recommended < 160 chars)"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.metaDescription || ''}
                                                onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
                                                value={formData.status || 'draft'}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2 mt-4">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Content</label>
                                            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.content || ''}
                                                    onChange={content => setFormData({ ...formData, content })}
                                                    style={{ height: '400px' }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-4 mt-20 pt-8 border-t border-slate-100">
                                <button type="submit" className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    <Save size={18} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingId(null)} className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Manage {activeTab === 'hero' ? 'Slides' : 'Blogs'}</h2>
                            <button
                                onClick={() => { setEditingId('new'); setFormData({}); }}
                                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                            >
                                <Plus size={18} /> Add New
                            </button>
                        </div>

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
                                    {(activeTab === 'hero' ? slides : blogs).map(item => (
                                        <tr key={item._id || item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{item.title}</div>
                                                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{item.slug || 'Slide Item'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${(item.isActive || item.status === 'published')
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        {(item.isActive || item.status === 'published') ? <CheckCircle size={12} /> : <Circle size={12} />}
                                                        {activeTab === 'hero' ? (item.isActive ? 'Active' : 'Inactive') : (item.status === 'published' ? 'Published' : 'Draft')}
                                                    </span>
                                                    {activeTab === 'hero' && (
                                                        <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase letter-spacing-widest">
                                                            Order: {item.displayOrder}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => handleEdit(item)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors inline-block"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(item._id || item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-block"><Trash size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {loading && (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                                    <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                                    <p className="font-medium">Loading contents...</p>
                                </div>
                            )}
                            {!loading && (activeTab === 'hero' ? slides : blogs).length === 0 && (
                                <div className="py-20 text-center text-slate-400">
                                    <p className="font-medium text-lg">No content found</p>
                                    <p className="text-sm">Click "Add New" to get started</p>
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
