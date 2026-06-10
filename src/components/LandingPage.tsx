import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, FlaskConical, Quote, ArrowRight, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function LandingPage() {
  const isAdmin = import.meta.env.VITE_IS_ADMIN === 'true';
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-brand-cream clinical-grid">
        <div className="absolute inset-0 eclectic-print pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 bg-brand-sand/50 px-4 py-2 rounded-full border border-brand-sand">
              <FlaskConical size={16} className="text-brand-moss" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-moss">Your skin isn’t misbehaving, it’s communicating.</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif text-brand-slate leading-[0.9] italic">
              Skin <br />
              <span className="text-brand-terracotta not-italic font-sans font-black uppercase tracking-tighter">Intelligence</span>
            </h1>
            
            <p className="text-xl text-brand-moss/80 font-light max-w-md leading-relaxed border-l-2 border-brand-terracotta pl-6">
              Expert clinical skincare for those navigating hormonal shifts, cortisol stress, and profound sensitivity.
            </p>
            
            {isAdmin && (
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/assessment"
                  className="bg-brand-moss text-white px-10 py-5 rounded-full text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-brand-slate transition-all flex items-center gap-3 shadow-xl shadow-brand-moss/30"
                >
                  Start Assessment
                  <Brain size={18} />
                </Link>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1596755094514-f87034a7ad45?auto=format&fit=crop&q=80&w=800" 
                alt="Vershante Lynn" 
                className="w-full h-full object-cover filter contrast-[1.05] brightness-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-moss/5" />
            </div>
            
            {/* Decal / Eclectic element */}
            <div className="absolute -bottom-8 -left-8 bg-brand-terracotta text-white p-8 rounded-[3rem] shadow-2xl max-w-[240px] rotate-3">
              <Quote className="mb-4 opacity-50" />
              <p className="text-lg font-serif italic leading-snug">
                "We don't just treat skin; we analyze the internal data of your life."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Focus Areas */}
      <motion.section 
        className="py-32 bg-brand-slate text-white relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
            
            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-moss/20 rounded-2xl flex items-center justify-center border border-brand-moss/40">
                <Heart className="text-brand-moss" />
              </div>
              <h3 className="text-3xl font-serif italic text-brand-sand">Postpartum Skincare</h3>
              <p className="text-brand-sand/60 font-light leading-relaxed text-sm">
                Restoring balance and cellular health after significant biological and hormonal shifts. 
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-sand/20 rounded-2xl flex items-center justify-center border border-brand-sand/40">
                <Brain className="text-brand-sand" />
              </div>
              <h3 className="text-3xl font-serif italic text-brand-sand">Menopause Intelligence</h3>
              <p className="text-brand-sand/60 font-light leading-relaxed text-sm">
                Specialized protocols for deep hydration and elasticity as the skin barrier evolves.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-slate/20 rounded-2xl flex items-center justify-center border border-brand-sand/40">
                <ShieldCheck className="text-brand-terracotta" />
              </div>
              <h3 className="text-3xl font-serif italic text-brand-sand">Patterns of Pigment</h3>
              <p className="text-brand-sand/60 font-light leading-relaxed text-sm">
                Advanced correction for hyperpigmentation patterns and persistent melanin-rich marking.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* The Journey Section */}
      <motion.section 
        className="py-32 bg-brand-cream relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
          <div className="order-2 md:order-1 relative">
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1616394584738-fc6e612e71af?auto=format&fit=crop&q=80&w=400" alt="Melanin Intelligence" className="rounded-3xl shadow-lg border border-brand-sand/50 contrast-[1.1]" referrerPolicy="no-referrer" />
                <div className="bg-brand-sand h-32 rounded-3xl eclectic-print" />
              </div>
              <div className="pt-12 space-y-4">
                <div className="bg-brand-moss/10 h-32 rounded-3xl" />
                <img src="https://images.unsplash.com/photo-1523450031158-4af9859f13dd?auto=format&fit=crop&q=80&w=400" alt="Diverse Clinical Focus" className="rounded-3xl shadow-lg border border-brand-sand/50 saturate-[0.8]" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 space-y-8">
            <h2 className="text-5xl font-serif text-brand-slate italic">The Intelligence <br />Protocol</h2>
            
            <div className="space-y-12">
              <div className="flex gap-6">
                <span className="text-5xl font-black text-brand-sand/50">01</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-brand-slate mb-2">Digital Assessment</h4>
                  <p className="text-brand-moss/80 font-light">The first step to scheduling. We collect detailed intelligence on your patterns.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <span className="text-5xl font-black text-brand-sand/50">02</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-brand-slate mb-2">Clinical Consultation</h4>
                  <p className="text-brand-moss/80 font-light">Virtual or In-person. We analyze your flow and match products to your biological state.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <span className="text-5xl font-black text-brand-sand/50">03</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-brand-slate mb-2">Product Match</h4>
                  <p className="text-brand-moss/80 font-light">First treatment and initial home-care protocol established.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <span className="text-5xl font-black text-brand-sand/50">04</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-brand-slate mb-2">Virtual Care</h4>
                  <p className="text-brand-moss/80 font-light">Follow-up sessions after receiving products to ensure integration.</p>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <Link 
                to="/assessment"
                className="inline-flex items-center gap-3 text-brand-terracotta border-b-2 border-brand-terracotta pb-1 font-bold uppercase tracking-widest hover:gap-6 transition-all"
              >
                Begin Your 01
                <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </motion.section>

      {/* CTA Footer */}
      <motion.section 
        className="py-24 bg-brand-moss flex items-center justify-center text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-3xl px-6 space-y-8">
          <h2 className="text-5xl font-serif text-brand-cream italic">Ready for Skin Intelligence?</h2>
          <p className="text-lg text-brand-cream/60 font-light">
            We prioritize education and long-term health over "one and done" fixes. Start your journey with our clinical assessment.
          </p>
          {isAdmin && (
            <Link 
              to="/assessment"
              className="inline-block bg-brand-terracotta text-white px-12 py-5 rounded-full text-sm uppercase tracking-widest font-bold hover:bg-brand-slate transition-all shadow-2xl"
            >
              Access Assessment Form
            </Link>
          )}
        </div>
      </motion.section>
    </div>
  );
}
