import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navigation() {
  const location = useLocation();
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const isSuper = u.email?.toLowerCase().trim() === 'antoinetteqwilliams@gmail.com';
        setIsAdmin(isSuper);
        if (isSuper) {
          console.log("Super Admin detected via Navigation");
        } else if (u.email) {
          // Check collection
          try {
            const { getDoc, doc } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');
            const adminDoc = await getDoc(doc(db, 'admins', u.email.toLowerCase().trim()));
            if (adminDoc.exists()) {
              setIsAdmin(true);
            }
          } catch (err) {
            console.error("Navigation admin check failed", err);
          }
        }
      } else {
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-sand">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-14 h-14 rounded-xl bg-white border border-brand-sand/60 shadow-sm overflow-hidden flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}images/vershante-lynn-logo.png`}
              alt="Vershanté Lynn Aesthetics"
              className="w-full h-full object-contain p-1.5"
            />
          </div>
          <div className="hidden sm:flex flex-col -gap-1">
            <span className="font-serif italic text-xl text-brand-slate leading-none">Vershante Lynn</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-moss font-bold">Aesthetics</span>
            <div className="mt-2 space-y-0.5">
              <span className="text-[10px] italic text-brand-slate/60 block">We don't guess. We assess.</span>
            </div>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest font-bold text-brand-slate">
          <Link to="/" className={cn("hover:text-brand-terracotta transition-colors", location.pathname === '/' && "text-brand-terracotta")} aria-current={location.pathname === '/' ? "page" : undefined}>The Edge</Link>
          
          {isAdmin && (
            <Link to="/dashboard" className={cn("flex items-center gap-1 text-brand-moss hover:text-brand-terracotta transition-colors", location.pathname === '/dashboard' && "text-brand-terracotta")} aria-current={location.pathname === '/dashboard' ? "page" : undefined}>
              <Lock size={10} />
              Workspace
            </Link>
          )}

          <Link to="/book-now" className={cn("hover:text-brand-terracotta transition-colors", location.pathname === '/book-now' && "text-brand-terracotta")} aria-current={location.pathname === '/book-now' ? "page" : undefined}>Book Now</Link>
          <Link to="/journal" className={cn("hover:text-brand-terracotta transition-colors", location.pathname.startsWith('/journal') && "text-brand-terracotta")} aria-current={location.pathname.startsWith('/journal') ? "page" : undefined}>Journal</Link>
          <Link to="/philosophy" className={cn("hover:text-brand-terracotta transition-colors", location.pathname === '/philosophy' && "text-brand-terracotta")} aria-current={location.pathname === '/philosophy' ? "page" : undefined}>Philosophy</Link>
          <Link to="/contact" className={cn("hover:text-brand-terracotta transition-colors", location.pathname === '/contact' && "text-brand-terracotta")} aria-current={location.pathname === '/contact' ? "page" : undefined}>Contact</Link>
          <Link to="/my-intelligence" className={cn("flex items-center gap-1 hover:text-brand-terracotta transition-colors", location.pathname === '/my-intelligence' && "text-brand-terracotta")} aria-current={location.pathname === '/my-intelligence' ? "page" : undefined}>
            {user ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-brand-sand">
                        <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    My Portal
                </div>
            ) : (
                <>
                    <Lock size={10} />
                    Portal Login
                </>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/book-now"
            className="bg-brand-terracotta text-white px-5 sm:px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-slate transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-brand-terracotta/20"
          >
            Book Now
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden w-11 h-11 rounded-full border border-brand-sand bg-white text-brand-slate flex items-center justify-center shadow-sm"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-brand-sand bg-brand-cream/95 backdrop-blur-xl shadow-2xl">
          <div className="px-6 py-5 space-y-3">
            <Link to="/" className={cn("block rounded-2xl bg-white/70 border border-brand-sand px-5 py-4 text-sm uppercase tracking-widest font-bold text-brand-slate", location.pathname === '/' && "text-brand-terracotta border-brand-terracotta/40")}>The Edge</Link>
            <Link to="/book-now" className={cn("block rounded-2xl bg-white/70 border border-brand-sand px-5 py-4 text-sm uppercase tracking-widest font-bold text-brand-slate", location.pathname === '/book-now' && "text-brand-terracotta border-brand-terracotta/40")}>Book Now</Link>
            <Link to="/screening" className={cn("block rounded-2xl bg-white/70 border border-brand-sand px-5 py-4 text-sm uppercase tracking-widest font-bold text-brand-slate", location.pathname === '/screening' && "text-brand-terracotta border-brand-terracotta/40")}>Free Screening</Link>
            <Link to="/journal" className={cn("block rounded-2xl bg-white/70 border border-brand-sand px-5 py-4 text-sm uppercase tracking-widest font-bold text-brand-slate", location.pathname.startsWith('/journal') && "text-brand-terracotta border-brand-terracotta/40")}>Journal</Link>
            <Link to="/philosophy" className={cn("block rounded-2xl bg-white/70 border border-brand-sand px-5 py-4 text-sm uppercase tracking-widest font-bold text-brand-slate", location.pathname === '/philosophy' && "text-brand-terracotta border-brand-terracotta/40")}>Philosophy</Link>
            <Link to="/contact" className={cn("block rounded-2xl bg-white/70 border border-brand-sand px-5 py-4 text-sm uppercase tracking-widest font-bold text-brand-slate", location.pathname === '/contact' && "text-brand-terracotta border-brand-terracotta/40")}>Contact</Link>
            <Link to="/my-intelligence" className={cn("flex items-center gap-2 rounded-2xl bg-white/70 border border-brand-sand px-5 py-4 text-sm uppercase tracking-widest font-bold text-brand-slate", location.pathname === '/my-intelligence' && "text-brand-terracotta border-brand-terracotta/40")}>
              <Lock size={13} />
              {user ? 'My Portal' : 'Portal Login'}
            </Link>
            {isAdmin && (
              <Link to="/dashboard" className={cn("flex items-center gap-2 rounded-2xl bg-brand-slate px-5 py-4 text-sm uppercase tracking-widest font-bold text-white", location.pathname === '/dashboard' && "bg-brand-terracotta")}>
                <Lock size={13} />
                Workspace
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
