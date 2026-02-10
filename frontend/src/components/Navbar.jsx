import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="h-24 flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-[1000] border-b border-slate-100">
            <div className="container px-4 mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white scale-110 group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
                        <span className="font-black text-xl leading-none">O</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter ml-1">o8m Giakaa CMS</span>
                </Link>

                <div className="hidden md:flex items-center gap-10">
                    {['Services', 'Industries', 'Company', 'Careers'].map((item) => (
                        <Link
                            key={item}
                            to="/"
                            className="text-[15px] font-bold text-slate-600 hover:text-primary transition-colors tracking-wide uppercase"
                        >
                            {item}
                        </Link>
                    ))}
                    <Link to="/blogs" className="text-[15px] font-bold text-slate-600 hover:text-primary transition-colors tracking-wide uppercase">
                        Insights
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/admin" className="hidden lg:block text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors">
                        ADMIN
                    </Link>
                    <button className="bg-slate-900 text-white font-black py-3.5 px-8 rounded-xl shadow-lg hover:bg-primary transition-all text-sm tracking-widest uppercase">
                        Contact Us
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
