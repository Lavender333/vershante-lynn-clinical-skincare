import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navigation() {
  const location = useLocation();
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);

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
              Professional
            </Link>
          )}

          <Link to="/book-now" className={cn("hover:text-brand-terracotta transition-colors", location.pathname === '/book-now' && "text-brand-terracotta")} aria-current={location.pathname === '/book-now' ? "page" : undefined}>Book Now</Link>
          <Link to="/philosophy" className={cn("hover:text-brand-terracotta transition-colors", location.pathname === '/philosophy' && "text-brand-terracotta")} aria-current={location.pathname === '/philosophy' ? "page" : undefined}>Philosophy</Link>
          <Link to="/contact" className={cn("hover:text-brand-terracotta transition-colors", location.pathname === '/contact' && "text-brand-terracotta")} aria-current={location.pathname === '/contact' ? "page" : undefined}>Contact</Link>
          <Link to="/my-intelligence" className={cn("flex items-center gap-1 hover:text-brand-terracotta transition-colors", location.pathname === '/my-intelligence' && "text-brand-terracotta")} aria-current={location.pathname === '/my-intelligence' ? "page" : undefined}>
            {user ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-brand-sand">
                        <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    My Intelligence
                </div>
            ) : (
                <>
                    <Lock size={10} />
                    Portal Login
                </>
            )}
          </Link>
        </div>

        <Link
          to="/book-now"
          className="bg-brand-terracotta text-white px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-slate transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-brand-terracotta/20"
        >
          Book Now
        </Link>
      </div>
    </nav>
  );
}
