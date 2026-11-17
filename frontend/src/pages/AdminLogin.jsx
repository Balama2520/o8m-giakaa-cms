import { useState } from 'react';
import api from '../utils/api';
import { setToken, setUser } from '../utils/auth';
import { Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const AdminLogin = ({ onLoginSuccess }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!identifier.trim() || !password) {
            setError('Please enter both your username/email and password.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/login', {
                username: identifier.trim(),
                password
            });

            if (res.data.success && res.data.token) {
                setToken(res.data.token);
                setUser(res.data.user);
                if (onLoginSuccess) {
                    onLoginSuccess(res.data.user);
                }
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Authentication error:', err);
            setError(
                err.response?.data?.error ||
                'Unable to sign in. Please verify your credentials or server status.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Header Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 text-white shadow-xl shadow-primary/25 mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
                    <p className="text-slate-400 text-sm mt-2">Sign in to manage o8m Giakaa CMS content</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    {error && (
                        <div
                            role="alert"
                            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3 animate-in fade-in duration-200"
                        >
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                                Username or Email
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                                    <User size={18} />
                                </span>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="admin or admin@giakaa.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3.5 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying Credentials...</span>
                                </>
                            ) : (
                                <span>Sign In to Dashboard</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Note */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    Protected by JWT authentication and rate-limited brute-force prevention.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
