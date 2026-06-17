import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ArrowRight, Brain, Calendar, Clock, FlaskConical, MapPin, Quote, ShieldCheck, Heart, Droplets } from 'lucide-react';
import { db } from '../lib/firebase';
import { EventPost } from '../types';

const imagePath = (fileName: string) => `${import.meta.env.BASE_URL}images/${fileName}`;

export default function LandingPage() {
  const [events, setEvents] = useState<EventPost[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date().toISOString().slice(0, 10);
      const upcoming = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as EventPost)
        .filter((event) => event.date >= today);
      setEvents(upcoming);
    }, (error) => {
      console.info('Unable to load upcoming events.', error);
      setEvents([]);
    });

    return unsubscribe;
  }, []);

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
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-moss">We don't guess. We assess.</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif text-brand-slate leading-[0.9] italic">
              Skin <br />
              <span className="text-brand-terracotta not-italic font-sans font-black uppercase tracking-tighter">Intelligence</span>
            </h1>
            
            <p className="text-xl text-brand-moss/80 font-light max-w-md leading-relaxed border-l-2 border-brand-terracotta pl-6">
              Expert clinical skincare for those navigating hormonal shifts, cortisol stress, and profound sensitivity.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/screening"
                className="bg-brand-moss text-white px-10 py-5 rounded-full text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-brand-slate transition-all flex items-center gap-3 shadow-xl shadow-brand-moss/30"
              >
                Start Free Screening
                <Brain size={18} />
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative">
              <img 
                src={imagePath('vershante-treatment.jpg')}
                alt="Vershanté Lynn performing a clinical skincare treatment"
                className="w-full h-full object-cover filter contrast-[1.05] brightness-[1.02]"
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
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-10">
            
            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-moss/20 rounded-2xl flex items-center justify-center border border-brand-moss/40">
                <ShieldCheck className="text-brand-moss" />
              </div>
              <h3 className="text-3xl font-serif italic text-brand-sand">Pigment & Uneven Tone</h3>
              <p className="text-brand-sand/60 font-light leading-relaxed text-sm">
                Hyperpigmentation, dark marks, uneven tone, and discoloration that lingers after irritation.
              </p>
              <p className="text-[11px] text-brand-sand/40 font-light leading-relaxed">
                Suggested imagery: natural-light portraits and close skin details on melanin-rich complexions, with visible radiance and tone variation.
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-sand/20 rounded-2xl flex items-center justify-center border border-brand-sand/40">
                <Droplets className="text-brand-sand" />
              </div>
              <h3 className="text-3xl font-serif italic text-brand-sand">Sensitivity & Barrier Disruption</h3>
              <p className="text-brand-sand/60 font-light leading-relaxed text-sm">
                Irritation, inflammation, redness, dehydration, and skin that reacts easily to products or stress.
              </p>
              <p className="text-[11px] text-brand-sand/40 font-light leading-relaxed">
                Suggested imagery: calm, makeup-free skin, hydration textures, barrier-support products, and soft clinical treatment moments.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-slate/20 rounded-2xl flex items-center justify-center border border-brand-sand/40">
                <FlaskConical className="text-brand-terracotta" />
              </div>
              <h3 className="text-3xl font-serif italic text-brand-sand">Congestion & Texture</h3>
              <p className="text-brand-sand/60 font-light leading-relaxed text-sm">
                Breakouts, clogged pores, roughness, and congestion that can sometimes present like acne.
              </p>
              <p className="text-[11px] text-brand-sand/40 font-light leading-relaxed">
                Suggested imagery: refined skin texture closeups, consultation scenes, and product review details without harsh medical zoom.
              </p>
            </div>

            <div className="space-y-6">
              <div className="w-16 h-16 bg-brand-terracotta/20 rounded-2xl flex items-center justify-center border border-brand-terracotta/40">
                <Heart className="text-brand-terracotta" />
              </div>
              <h3 className="text-3xl font-serif italic text-brand-sand">Aging, Dullness & Skin Changes</h3>
              <p className="text-brand-sand/60 font-light leading-relaxed text-sm">
                Fine lines, loss of glow, firmness changes, dullness, and skin shifts that develop with time.
              </p>
              <p className="text-[11px] text-brand-sand/40 font-light leading-relaxed">
                Suggested imagery: elegant 30+ portraits, luminous mature skin, soft side-lighting, and editorial face or hand details.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Clinical Treatment Imagery */}
      <motion.section
        className="py-28 bg-brand-cream"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-end mb-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">
                <FlaskConical size={14} />
                Clinical Method
              </div>
              <h2 className="text-5xl font-serif text-brand-slate italic leading-tight">
                Corrective care, seen clearly.
              </h2>
            </div>
            <p className="text-brand-moss/70 font-light leading-relaxed max-w-2xl lg:ml-auto">
              Treatment visuals reflect the precision behind the Skin Intelligence approach: calm analysis,
              professional technique, and melanin-aware corrective skincare.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-brand-sand bg-white">
              <img
                src={imagePath('vershante-procell-treatment-room.jpg')}
                alt="Vershanté Lynn performing a ProCell treatment in a clinical skincare room"
                className="w-full h-full min-h-[420px] md:min-h-[560px] object-cover"
              />
            </div>
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-brand-sand bg-white">
              <img
                src={imagePath('vershante-procell-closeup.jpg')}
                alt="Close-up of a ProCell corrective skincare treatment on melanin-rich skin"
                className="w-full h-full min-h-[420px] md:min-h-[560px] object-cover"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Upcoming Events */}
      <motion.section
        className="py-28 bg-brand-cream"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">
                <Calendar size={14} />
                Upcoming
              </div>
              <h2 className="text-5xl font-serif text-brand-slate italic">Events</h2>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => {
                const eventDate = new Date(`${event.date}T12:00:00`);
                return (
                  <article key={event.id} className="bg-white border border-brand-sand rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                    {event.imageUrl && (
                      <div className="aspect-[16/9] overflow-hidden bg-brand-sand/20">
                        <img src={event.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="p-6 space-y-5">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl bg-brand-terracotta text-white flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] uppercase tracking-widest font-bold">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-2xl font-serif italic leading-none">{eventDate.getDate()}</span>
                        </div>
                        <div className="space-y-2 min-w-0">
                          <h3 className="text-2xl font-serif italic text-brand-slate leading-tight">{event.title}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest font-bold text-brand-moss/60">
                            <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {event.time}</span>
                            <span className="inline-flex items-center gap-1.5"><MapPin size={12} /> {event.location}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-brand-moss/70 font-light leading-relaxed">{event.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-brand-sand rounded-2xl p-10 text-center">
              <p className="text-brand-moss/60 font-serif italic text-xl">No events scheduled right now — check back soon</p>
            </div>
          )}
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
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[1.1fr_0.9fr] gap-20 xl:gap-28 items-center">
          <div className="order-2 md:order-1 relative">
              <div className="grid grid-cols-2 gap-5">
              <div className="space-y-4">
                <img
                  src={imagePath('vershante-education-room.jpg')}
                  alt="Vershanté Lynn teaching a professional skincare education session"
                  className="rounded-3xl shadow-lg border border-brand-sand/20 aspect-[3/4] min-h-[360px] md:min-h-[520px] object-cover"
                />
                <div className="bg-brand-sand h-40 rounded-3xl eclectic-print" />
              </div>
              <div className="pt-12 space-y-4">
                <div className="bg-brand-moss/10 h-40 rounded-3xl" />
                <img
                  src={imagePath('vershante-black-spa-expo.jpg')}
                  alt="Vershanté Lynn speaking at the Black Spa Expo"
                  className="rounded-3xl shadow-lg border border-brand-sand/20 aspect-[3/4] min-h-[360px] md:min-h-[520px] object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 space-y-8">
            <h2 className="text-5xl font-serif text-brand-slate italic">The Intelligence <br />Protocol</h2>
            
            <div className="space-y-12">
              <div className="flex gap-6">
                <span className="text-5xl font-black text-brand-sand/50">01</span>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-widest text-brand-slate mb-2">Digital Screening</h4>
                  <p className="text-brand-moss/80 font-light">Free assessment to identify your skin patterns and concerns.</p>
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
            
            <Link 
              to="/screening"
              className="inline-flex items-center gap-3 text-brand-terracotta border-b-2 border-brand-terracotta pb-1 font-bold uppercase tracking-widest hover:gap-6 transition-all"
            >
              Start Your Screening
              <ArrowRight size={20} />
            </Link>
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
            We prioritize education and long-term health over "one and done" fixes. Start with our free screening to understand your skin patterns.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/screening"
              className="inline-block bg-brand-terracotta text-white px-12 py-5 rounded-full text-sm uppercase tracking-widest font-bold hover:bg-brand-slate transition-all shadow-2xl"
            >
              Begin Free Screening
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
