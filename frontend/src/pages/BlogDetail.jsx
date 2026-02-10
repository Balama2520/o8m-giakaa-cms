import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';

const BlogDetail = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await api.get(`/blogs/${slug}`);
                setBlog(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching blog', err);
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen py-40 flex flex-col items-center gap-6 text-slate-400">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
            <p className="font-bold">Reading article...</p>
        </div>
    );

    if (!blog) return (
        <div className="min-h-screen py-40 text-center">
            <h1 className="text-3xl font-bold mb-4">Blog not found</h1>
            <Link to="/blogs" className="text-primary font-bold">Back to insights</Link>
        </div>
    );

    const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
    const canonicalUrl = `${siteUrl}/blog/${slug}`;

    return (
        <div className="bg-white min-h-screen pb-40">
            <Helmet>
                <title>{blog.metaTitle || blog.title} | o8m Giakaa CMS</title>
                <meta name="description" content={blog.metaDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph Tags */}
                <meta property="og:title" content={blog.metaTitle || blog.title} />
                <meta property="og:description" content={blog.metaDescription} />
                <meta property="og:image" content={blog.featuredImage} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />
            </Helmet>

            {/* Header / Banner */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <img
                    src={blog.featuredImage || 'https://via.placeholder.com/1600x900'}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20">
                    <div className="container mx-auto max-w-4xl">
                        <Link to="/blogs" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 font-bold text-sm bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                            <ArrowLeft size={16} /> BACK TO INSIGHTS
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-8">
                            {blog.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm font-semibold tracking-widest">
                            <span className="flex items-center gap-2"><Clock size={16} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="bg-primary/20 text-white px-3 py-1 rounded-full">{blog.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 -mt-20 relative z-10">
                <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-20">
                    <div className="flex justify-between items-center mb-16 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black">G</div>
                            <div>
                                <p className="text-slate-900 font-bold">Giakaa Expert</p>
                                <p className="text-xs text-slate-400">Artificial Intelligence Specialist</p>
                            </div>
                        </div>
                        <button className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-primary transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* Rich Text Content with XSS Protection */}
                    <div
                        className="rich-text-content prose prose-slate prose-xl max-w-none text-slate-700 leading-relaxed font-serif"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
