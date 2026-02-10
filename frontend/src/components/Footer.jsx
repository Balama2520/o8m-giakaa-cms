import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-white pt-24 pb-12">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                                <span className="font-black text-lg">O</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter">o8m Giakaa CMS</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Driving the future of enterprise with human-first AI expertise and world-class engineering solutions.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black text-sm tracking-widest mb-8 uppercase text-slate-500">Services</h4>
                        <ul className="space-y-4 text-slate-400 text-sm font-medium">
                            <li className="hover:text-white cursor-pointer transition-colors">Strategy & AI Transformation</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Cloud Engineering</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Data & Analytics</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Managed Services</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-sm tracking-widest mb-8 uppercase text-slate-500">Company</h4>
                        <ul className="space-y-4 text-slate-400 text-sm font-medium">
                            <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Case Studies</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                            <li><Link to="/admin" className="hover:text-white transition-colors">Admin CMS</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-sm tracking-widest mb-8 uppercase text-slate-500">Legal</h4>
                        <ul className="space-y-4 text-slate-400 text-sm font-medium">
                            <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-slate-500 text-xs font-medium tracking-wider">
                        &copy; {new Date().getFullYear()} o8m Giakaa CMS | Built as a Technical Prototype for o8m Labs.
                    </div>
                    <div className="flex gap-8 text-xs font-bold text-slate-500 tracking-widest uppercase">
                        <span className="hover:text-primary cursor-pointer transition-colors">LinkedIn</span>
                        <span className="hover:text-primary cursor-pointer transition-colors">Twitter</span>
                        <span className="hover:text-primary cursor-pointer transition-colors">Medium</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
