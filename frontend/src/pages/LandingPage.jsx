import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ChevronRight, ArrowRight, Shield, Zap, Database, ChevronLeft, Globe, TrendingUp, Cpu, Mail, Phone, MapPin } from 'lucide-react';

const LandingPage = () => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await api.get('/hero');
                setSlides(res.data.data.filter(s => s.isActive));
                setLoading(false);
            } catch (err) {
                console.error('Error fetching slides', err);
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    return (
        <div className="bg-slate-50">
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
                                <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                                    {slides[currentIndex].title}
                                </h1>
                                <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-lg">
                                    {slides[currentIndex].description}
                                </p>
                                <div className="flex flex-wrap gap-5">
                                    <a href={slides[currentIndex].ctaLink} className="btn-primary inline-flex items-center gap-3">
                                        {slides[currentIndex].ctaText} <ArrowRight size={20} />
                                    </a>
                                    {slides.length > 1 && (
                                        <div className="flex gap-3">
                                            <button onClick={prevSlide} className="p-4 rounded-full border border-slate-200 hover:bg-slate-50 transition-all">
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button onClick={nextSlide} className="p-4 rounded-full border border-slate-200 hover:bg-slate-50 transition-all">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                                <span className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm mb-6 inline-block tracking-widest uppercase">AI-FIRST IT SERVICES</span>
                                <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                                    Empowering <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Enterprise</span>
                                </h1>
                                <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-lg">
                                    AI-first consulting firm delivering high-impact solutions that drive measurable growth across 40+ industries.
                                </p>
                                <div className="flex gap-4">
                                    <button className="btn-primary px-10 py-4">Let's Talk</button>
                                    <button className="px-10 py-4 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all">
                                        Our Services
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-slate-100">
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
            <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent opacity-5"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Why Giakaa</h2>
                        <p className="text-slate-400 text-xl font-medium tracking-wider uppercase">Strategy. Engineering. Impact.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: 'Built for the AI Era',
                                icon: <Cpu className="text-blue-400" />,
                                desc: 'Unlike legacy firms, Giakaa was purpose-built with artificial intelligence at our core to deliver adaptive systems.'
                            },
                            {
                                title: 'Rapid High-Impact Delivery',
                                icon: <Zap className="text-amber-400" />,
                                desc: 'Delivering production-ready solutions 3-5x faster than traditional consultancies without compromising quality.'
                            },
                            {
                                title: 'ROI-Focused Results',
                                icon: <TrendingUp className="text-emerald-400" />,
                                desc: 'A relentless focus on outcomes that matter: revenue growth, cost reduction, and operational efficiency.'
                            }
                        ].map((item, i) => (
                            <div key={i} className="group p-12 bg-white/5 rounded-[3rem] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm shadow-2xl">
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-6">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Industries Section (New) */}
            <section className="py-32 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="max-w-xl">
                            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Our Impact</span>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Serving Over 40+ <br />Global Industries</h2>
                        </div>
                        <button className="btn-primary">View All Industries</button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            'Aerospace', 'Agriculture', 'Automotive', 'Aviation', 'Banking',
                            'Chemical', 'Telecom', 'Dairy', 'Defense', 'Education'
                        ].map((industry, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 font-bold text-center text-slate-600 hover:text-primary hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                                {industry}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Footer Section */}
            <section className="py-32 bg-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter">Ready to transform?</h2>
                    <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto">
                        Join the world's most innovative companies leveraging Giakaa's AI-first expertise.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <button className="bg-white text-primary px-10 py-5 rounded-xl font-black text-lg shadow-2xl hover:scale-105 transition-all">
                            SCHEDULE A CONSULTATION
                        </button>
                        <button className="bg-primary-dark text-white border border-white/20 px-10 py-5 rounded-xl font-black text-lg hover:bg-white/10 transition-all">
                            SEE CASE STUDIES
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact Info Strip */}
            <section className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-12 grayscale opacity-70">
                    <div className="flex items-center gap-3 font-bold text-slate-900">
                        <Mail size={20} className="text-primary" /> contact@giakaa.com
                    </div>
                    <div className="flex items-center gap-3 font-bold text-slate-900">
                        <Phone size={20} className="text-primary" /> +1 (555) GIAKAA-AI
                    </div>
                    <div className="flex items-center gap-3 font-bold text-slate-900">
                        <MapPin size={20} className="text-primary" /> New York • London • Mumbai
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
