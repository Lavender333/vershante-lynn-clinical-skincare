import React from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles, Brain, FlaskConical, Target, Users } from 'lucide-react';

const imagePath = (fileName: string) => `${import.meta.env.BASE_URL}images/${fileName}`;

export default function PhilosophyPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-cream">
      <div className="max-w-4xl mx-auto px-6 space-y-24">
        {/* Intro */}
        <motion.header 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-serif text-brand-slate italic">The Philosophy</h1>
          <p className="text-xl text-brand-moss/80 font-light max-w-2xl mx-auto leading-relaxed">
            Clinically trained, eclectic at heart, and deeply committed to your skin intelligence.
          </p>
        </motion.header>

        {/* Core Pillars */}
        <motion.section 
          className="grid gap-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="bg-white p-12 rounded-[3rem] shadow-xl border border-brand-sand grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-6">
              <div className="inline-flex p-3 bg-brand-terracotta/10 rounded-2xl">
                <Brain className="text-brand-terracotta" />
              </div>
              <h2 className="text-4xl font-serif italic text-brand-slate">Clinical Grounding</h2>
              <p className="text-brand-moss/80 font-light leading-relaxed">
                My approach is rooted in dermatology-grade training. I look for patterns—the "why" behind the hyperpigmentation or the "how" behind the sensitivity. I don't believe in guessing; I believe in intelligence. 
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  'Cortisol & Stress',
                  'Postpartum Skincare',
                  'Menopause Intelligence',
                  'Hyperpigmentation Patterns'
                ].map(focus => (
                  <div key={focus} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">{focus}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-inner bg-brand-sand/20">
              <img
                src={imagePath('vershante-clinical-grounding.png')}
                alt="Vershanté Lynn performing a clinical skincare treatment"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div 
            className="bg-brand-moss p-12 rounded-[3rem] shadow-xl text-white grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="order-2 md:order-1 aspect-square rounded-2xl overflow-hidden shadow-inner bg-white/10">
              <img
                src={imagePath('vershante-eclectic-warmth.png')}
                alt="Vershanté Lynn providing a warm clinical skincare treatment"
                className="w-full h-full object-cover brightness-[1.05]"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-flex p-3 bg-brand-sand/10 rounded-2xl">
                <Sparkles className="text-brand-sand" />
              </div>
              <h2 className="text-4xl font-serif italic text-brand-sand">Eclectic Warmth</h2>
              <p className="text-brand-sand/80 font-light leading-relaxed">
                Treatment doesn't have to feel cold. My space and my process are warm, welcoming, and intentionally eclectic. I love prints, textures, and the human story. You are not a patient; you are a partner in intelligence.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* The Why */}
        <motion.section 
          className="bg-brand-sand/30 p-16 rounded-[4rem] border border-brand-sand relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Quote size={200} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-moss mb-8">The Focus</h3>
            <p className="text-3xl font-serif italic text-brand-slate leading-snug">
              "We specialize in the 35-55 demographic because your skin is telling a story of transformation—motherhood, career stress, biological shifts. It deserves an expert who speaks the language of both science and spirit."
            </p>
            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-1 gap-1" />
              <div className="flex flex-col">
                <span className="font-bold text-brand-slate">Vershante Lynn</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-moss">Clinical Esthetician</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Partnership */}
        <motion.section 
          className="text-center space-y-12 pb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-4xl font-serif italic text-brand-slate">Partnership over Transactions</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-brand-sand space-y-4">
              <Users className="mx-auto text-brand-terracotta" />
              <h4 className="font-bold text-[10px] uppercase tracking-widest">Education Loop</h4>
              <p className="text-sm font-light text-brand-moss">Moving from one-and-done to a lifelong skin education protocol.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-brand-sand space-y-4">
              <Target className="mx-auto text-brand-terracotta" />
              <h4 className="font-bold text-[10px] uppercase tracking-widest">Accessiblity</h4>
              <p className="text-sm font-light text-brand-moss">Home-care protocols designed for your budget and lifestyle flow.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-brand-sand space-y-4">
              <FlaskConical className="mx-auto text-brand-terracotta" />
              <h4 className="font-bold text-[10px] uppercase tracking-widest">Data Verification</h4>
              <p className="text-sm font-light text-brand-moss">Testing and verifying every product match against your unique data.</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
