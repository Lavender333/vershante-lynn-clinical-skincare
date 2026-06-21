import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { BlogPost } from '../types';

const defaultImage = `${import.meta.env.BASE_URL}images/vershante-edge-portrait.png`;

const formatDate = (date: string) => {
  if (!date) return 'Recently published';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function JournalPage() {
  const { slug } = useParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'blogPosts'), where('status', '==', 'published'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const published = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as BlogPost)
        .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
      setPosts(published);
      setLoading(false);
    }, (error) => {
      console.info('Unable to load journal posts.', error);
      setPosts([]);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const featured = useMemo(() => posts.find((post) => post.featured) || posts[0], [posts]);
  const currentPost = slug ? posts.find((post) => post.slug === slug) : null;

  if (slug) {
    return <JournalArticle post={currentPost} loading={loading} />;
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-24 px-6 clinical-grid">
      <div className="max-w-7xl mx-auto">
        <header className="max-w-3xl mb-14 space-y-5">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">
            <BookOpen size={14} />
            Skin Intelligence Journal
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic text-brand-slate leading-[0.95]">
            Clinical notes for skin that communicates.
          </h1>
          <p className="text-lg text-brand-moss/75 font-light leading-relaxed">
            Education, professional insight, treatment notes, and skin intelligence guidance from Vershanté Lynn Aesthetics.
          </p>
        </header>

        {loading ? (
          <div className="bg-white border border-brand-sand rounded-[2rem] p-12 text-center">
            <p className="text-brand-moss/60 font-serif italic text-xl">Loading journal entries...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-dashed border-brand-sand rounded-[2rem] p-12 text-center">
            <p className="text-brand-moss/60 font-serif italic text-xl">No journal articles published yet — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {featured && (
              <Link
                to={`/journal/${featured.slug}`}
                className="group grid lg:grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-[2.5rem] bg-white border border-brand-sand shadow-xl hover:border-brand-terracotta/50 transition-all"
              >
                <div className="aspect-[16/11] lg:aspect-auto bg-brand-sand/20 overflow-hidden">
                  <img
                    src={featured.imageUrl || defaultImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-terracotta/10 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-brand-terracotta">
                    <Sparkles size={12} />
                    Featured Article
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-moss/50">{featured.category} • {formatDate(featured.publishDate)}</p>
                    <h2 className="text-4xl md:text-5xl font-serif italic text-brand-slate leading-tight">{featured.title}</h2>
                    <p className="text-brand-moss/75 font-light leading-relaxed">{featured.excerpt}</p>
                  </div>
                  <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-brand-terracotta">
                    Read Article
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.filter((post) => post.id !== featured?.id).map((post) => (
                <Link
                  key={post.id}
                  to={`/journal/${post.slug}`}
                  className="group bg-white border border-brand-sand rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-terracotta/50 transition-all"
                >
                  <div className="aspect-[16/10] bg-brand-sand/20 overflow-hidden">
                    <img
                      src={post.imageUrl || defaultImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-moss/50">{post.category} • {formatDate(post.publishDate)}</p>
                    <h2 className="text-3xl font-serif italic text-brand-slate leading-tight">{post.title}</h2>
                    <p className="text-sm text-brand-moss/70 font-light leading-relaxed">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JournalArticle({ post, loading }: { post?: BlogPost | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-brand-sand rounded-[2rem] p-12 text-center">
          <p className="text-brand-moss/60 font-serif italic text-xl">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-cream pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-brand-sand rounded-[2rem] p-12 text-center space-y-6">
          <p className="text-brand-moss/60 font-serif italic text-xl">This journal article is not available.</p>
          <Link to="/journal" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-terracotta">
            <ArrowLeft size={14} />
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-24 px-6 clinical-grid">
      <article className="max-w-4xl mx-auto">
        <Link to="/journal" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-terracotta mb-10">
          <ArrowLeft size={14} />
          Back to Journal
        </Link>
        <div className="bg-white border border-brand-sand rounded-[2.5rem] overflow-hidden shadow-xl">
          <div className="aspect-[16/10] bg-brand-sand/20">
            <img src={post.imageUrl || defaultImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="p-8 md:p-12 space-y-8">
            <header className="space-y-5">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-brand-terracotta">
                <Calendar size={13} />
                {post.category} • {formatDate(post.publishDate)}
              </div>
              <h1 className="text-5xl md:text-6xl font-serif italic text-brand-slate leading-tight">{post.title}</h1>
              <p className="text-lg text-brand-moss/75 font-light leading-relaxed">{post.excerpt}</p>
            </header>
            <div className="prose prose-lg max-w-none">
              {post.body.split('\n').filter(Boolean).map((paragraph, index) => (
                <p key={index} className="text-brand-moss/80 font-light leading-relaxed mb-5">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
