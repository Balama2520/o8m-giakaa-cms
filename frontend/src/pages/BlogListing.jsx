import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, ArrowRight } from 'lucide-react';

const BlogListing = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await api.get('/blogs?status=published');
                setBlogs(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching blogs', err);
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen py-24">
            <Helmet>
                <title>Insights & Thinking | o8m Giakaa CMS</title>
                <meta name="description" content="Explore our latest thoughts on AI, Digital Transformation, and Technology." />
            </Helmet>

            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-20 animate-in fade-in slide-in-from-top-8 duration-700">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Our Latest Insights</h1>
                    <p className="text-xl text-slate-500">Explore the cutting edge of AI and Digital Transformation through our curated experts' thoughts.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-slate-200 aspect-video rounded-3xl mb-6"></div>
                                <div className="h-8 bg-slate-200 rounded-lg w-3/4 mb-4"></div>
                                <div className="h-20 bg-slate-200 rounded-lg w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {blogs.map(blog => (
                            <article key={blog._id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={blog.featuredImage || 'https://via.placeholder.com/800x600'}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-10 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 text-slate-400 text-sm mb-4 font-semibold uppercase tracking-widest">
                                        <Calendar size={16} />
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                                        {blog.title}
                                    </h2>
                                    <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed">
                                        {blog.metaDescription || "Click to read this insightful article on giakaa CMS."}
                                    </p>
                                    <Link to={`/blog/${blog.slug}`} className="mt-auto flex items-center gap-3 font-black text-primary hover:gap-5 transition-all">
                                        READ ARTICLE <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[3rem]">
                        <p className="text-2xl font-bold text-slate-400">No insights published yet.</p>
                        <p className="text-slate-400 mt-2">Check back later for new updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogListing;
