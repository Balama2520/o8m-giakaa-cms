import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { isAuthenticated } from './utils/auth';

// Route-level code splitting to optimize bundle chunks
const LandingPage = lazy(() => import('./pages/LandingPage'));
const BlogListing = lazy(() => import('./pages/BlogListing'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

const PageLoader = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading content...</p>
    </div>
);

// Protected Admin Route wrapper
const ProtectedAdmin = () => {
    const [authenticated, setAuthenticated] = useState(isAuthenticated());

    useEffect(() => {
        const handleUnauthorized = () => setAuthenticated(false);
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    if (!authenticated) {
        return <AdminLogin onLoginSuccess={() => setAuthenticated(true)} />;
    }

    return <AdminPanel onLogout={() => setAuthenticated(false)} />;
};

function App() {
    return (
        <HelmetProvider>
            <Router>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/blogs" element={<BlogListing />} />
                                <Route path="/blog/:slug" element={<BlogDetail />} />
                                <Route path="/admin/*" element={<ProtectedAdmin />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </main>
                    <Footer />
                </div>
            </Router>
        </HelmetProvider>
    );
}

export default App;
