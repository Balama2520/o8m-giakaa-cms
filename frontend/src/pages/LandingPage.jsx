import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Helmet } from 'react-helmet-async';
import {
    ArrowRight,
    Zap,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Cpu,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ArrowUpRight
} from 'lucide-react';

const LandingPage = () => {
    const [slides, setSlides] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [slidesRes, blogsRes] = await Promise.allSettled([
                    api.get('/hero'),
                    api.get('/blogs')
                ]);

                if (isMounted) {
                    if (slidesRes.status === 'fulfilled' && slidesRes.value.data?.data) {
                        setSlides(slidesRes.value.data.data.filter((s) => s.isActive !== false));
                    }
                    if (blogsRes.status === 'fulfilled' && blogsRes.value.data?.data) {
                        setBlogs(blogsRes.value.data.data.slice(0, 3));
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching landing data:', err);
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

    return (
        <div className="bg-slate-50">
            <Helmet>
                <title>o8m Giakaa CMS | AI-First Enterprise Solutions</title>
                <meta name="description" content="AI-first consulting firm delivering high-impact solutions that drive measurable growth across 40+ global industries." />
                <link rel="canonical" href={`${siteUrl}/`} />
                <meta property="og:title" content="o8m Giakaa CMS | AI-First Enterprise Solutions" />
                <meta property="og:description" content="AI-first consulting firm delivering high-impact solutions that drive measurable growth across 40+ global industries." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${siteUrl}/`} />
            </Helmet>

            {/* Hero Section with Slider */}
            <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden pt-20">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-16 relative z-10">
                    <div className="z-10">
                        {loading ? (
                            <div className="space-y-4">
                                <div className="h-16 w-3/4 bg-slate-100 animate-pulse rounded-lg"></div>
                                <div className="h-24 w-full bg-slate-100 animate-pulse rounded-lg"></div>
                            </div>
                        ) : slides.length > 0 ? (
                            <div key={slides[currentIndex].id} className="animate-in fade-in slide-in-from-left-8 duration-700">
                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                                    {slides[currentIndex].title}
                                </h1>
                                <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
                                    {slides[currentIndex].description}
                                </p>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <a
                                        href={slides[currentIndex].ctaLink || '#'}
                                        className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                    >
                                        {slides[currentIndex].ctaText || 'Learn More'} <ArrowRight size={20} />
                                    </a>
                                    {slides.length > 1 && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={prevSlide}
                                                className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
                                                aria-label="Previous slide"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextSlide}
                                                className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
                                                aria-label="Next slide"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                                <span className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm mb-6 inline-block tracking-widest uppercase">
                                    AI-FIRST IT SERVICES
                                </span>
                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                                    Empowering <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Enterprise</span>
                                </h1>
                                <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                                    AI-first consulting firm delivering high-impact solutions that drive measurable growth across 40+ industries.
                                </p>
                                <div className="flex gap-4">
                                    <button type="button" className="btn-primary px-8 py-4 rounded-xl font-bold bg-primary text-white">Let's Talk</button>
                                    <Link to="/blogs" className="px-8 py-4 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all inline-block">
                                        Our Insights
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-slate-100">
                            <div>
                                <div className="text-3xl font-black text-slate-900">+5</div>
                                <div className="text-sm text-slate-500 font-medium tracking-wide">Countries this Year</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-slate-900">Global</div>
                                <div className="text-sm text-slate-500 font-medium tracking-wide">Scale Delivery</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-slate-900">+20%</div>
                                <div className="text-sm text-slate-500 font-medium tracking-wide">Growth YoY</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-20 bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
                        <div className="relative bg-slate-100 rounded-[3rem] aspect-square overflow-hidden shadow-2xl border-8 border-white group">
                            {slides.length > 0 && slides[currentIndex].mediaUrl ? (
                                <img
                                    src={slides[currentIndex].mediaUrl}
                                    alt="Hero Content"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                    <Cpu size={120} className="text-slate-200 animate-pulse" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Giakaa Section */}
            <section className="py-28 bg-slate-900 text-white overflow-hidden relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Why Giakaa</h2>
                        <p className="text-slate-400 text-lg font-medium tracking-wider uppercase">Strategy. Engineering. Impact.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Built for the AI Era',
                                icon: <Cpu className="text-blue-400" size={32} />,
                                desc: 'Unlike legacy firms, Giakaa was purpose-built with artificial intelligence at our core to deliver adaptive systems.'
                            },
                            {
                                title: 'Rapid High-Impact Delivery',
                                icon: <Zap className="text-amber-400" size={32} />,
                                desc: 'Delivering production-ready solutions 3-5x faster than traditional consultancies without compromising quality.'
                            },
                            {
                                title: 'ROI-Focused Results',
                                icon: <TrendingUp className="text-emerald-400" size={32} />,
                                desc: 'A relentless focus on outcomes that matter: revenue growth, cost reduction, and operational efficiency.'
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-10 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dynamic Blog Previews Section */}
            {blogs.length > 0 && (
                <section className="py-28 bg-white border-b border-slate-100">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                            <div>
                                <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Thought Leadership</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Latest Insights</h2>
                            </div>
                            <Link to="/blogs" className="flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all text-sm">
                                View All Articles <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {blogs.map((blog) => (
                                <article key={blog._id} className="group flex flex-col bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all">
                                    <div className="aspect-video overflow-hidden bg-slate-200">
                                        <img
                                            src={blog.featuredImage || 'https://via.placeholder.com/800x600'}
                                            alt={blog.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-3">
                                            <Calendar size={14} />
                                            {new Date(blog.createdAt).toLocaleDateString()}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                            {blog.metaDescription || 'Read our latest thinking on enterprise technology and AI strategy.'}
                                        </p>
                                        <Link to={`/blog/${blog.slug}`} className="mt-auto flex items-center gap-1.5 font-bold text-primary text-sm group-hover:gap-2.5 transition-all">
                                            Read Post <ArrowUpRight size={16} />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Industries Section */}
            <section className="py-28 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Global Scale</span>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Serving 40+ Industries</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            'Aerospace', 'Agriculture', 'Automotive', 'Aviation', 'Banking',
                            'Chemical', 'Telecom', 'Dairy', 'Defense', 'Education'
                        ].map((industry, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 font-semibold text-center text-slate-700 hover:text-primary hover:shadow-md transition-all">
                                {industry}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Ready to Transform?</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
                        Partner with Giakaa to accelerate your AI adoption and digital transformation roadmap.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button type="button" className="bg-white text-primary px-8 py-4 rounded-xl font-black shadow-xl hover:scale-105 transition-all text-sm">
                            SCHEDULE A CONSULTATION
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact Info Strip */}
            <section className="py-10 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-10 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                        <Mail size={18} className="text-primary" /> contact@giakaa.com
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={18} className="text-primary" /> +1 (555) GIAKAA-AI
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-primary" /> New York • London • Mumbai
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
