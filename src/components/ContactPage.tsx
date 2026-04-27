import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Mail, MessageSquare, User, AlertCircle, CheckCircle2, FlaskConical } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('A network error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-brand-moss/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-moss mb-6"
          >
            <MessageSquare size={12} />
            Clinical Communications
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif text-brand-slate italic mb-6 leading-tight"
          >
            Connect With The Edge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-brand-moss/60 font-light italic max-w-2xl mx-auto leading-relaxed"
          >
            "Direct synchronization for general inquiries, partnership opportunities, or clinical follow-ups."
          </motion.p>
        </header>

        <div className="grid md:grid-cols-5 gap-12">
          {/* Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 space-y-10"
          >
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta mb-6">Contact Channels</h3>
              <div className="space-y-6">
                <a href="mailto:intelligence@vershantelynn.com" className="group flex items-center gap-4 bg-white p-6 rounded-2xl border border-brand-sand hover:border-brand-moss/30 transition-all shadow-sm">
                  <div className="w-10 h-10 bg-brand-sand/20 rounded-xl flex items-center justify-center text-brand-moss group-hover:bg-brand-moss group-hover:text-white transition-all">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-brand-sand font-bold mb-1">Email Protocol</p>
                    <p className="text-sm font-bold text-brand-slate">intelligence@vershantelynn.com</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-brand-slate text-brand-cream p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <FlaskConical size={120} />
              </div>
              <h4 className="text-xl font-serif italic mb-4 relative z-10">Clinical Hours</h4>
              <ul className="space-y-3 relative z-10">
                <li className="flex justify-between text-xs font-light">
                  <span className="opacity-60 italic">Mon — Thu</span>
                  <span className="font-bold">10:00 — 18:00</span>
                </li>
                <li className="flex justify-between text-xs font-light">
                  <span className="opacity-60 italic">Fri — Sat</span>
                  <span className="font-bold">09:00 — 15:00</span>
                </li>
                <li className="pt-3 border-t border-white/10 flex justify-between text-xs font-light">
                  <span className="opacity-60 italic">Sun</span>
                  <span className="font-bold text-brand-terracotta">Closed</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-3 bg-white rounded-[2.5rem] border border-brand-sand p-8 md:p-12 shadow-2xl"
          >
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 scale-animation">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-serif italic text-brand-slate mb-4">Transmission Successful</h3>
                <p className="text-brand-moss/60 font-light italic leading-relaxed mb-8">
                  "Your inquiry has been synchronized with our clinical team. We will respond within 24–48 biological hours."
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="bg-brand-moss text-white px-10 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-slate transition-all shadow-lg"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss ml-4">Identifier (Name)</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-sand" size={16} />
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Clinical Name"
                        className="w-full bg-brand-cream/30 border border-brand-sand rounded-full pl-12 pr-6 py-4 text-sm outline-none focus:border-brand-terracotta transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss ml-4">Communication Node (Email)</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-sand" size={16} />
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Email Address"
                        className="w-full bg-brand-cream/30 border border-brand-sand rounded-full pl-12 pr-6 py-4 text-sm outline-none focus:border-brand-terracotta transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss ml-4">Subject Vector</label>
                  <input 
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Brief objective of inquiry"
                    className="w-full bg-brand-cream/30 border border-brand-sand rounded-full px-8 py-4 text-sm outline-none focus:border-brand-terracotta transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss ml-4">Diagnostic Narrative (Message)</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Detail your clinical inquiry here..."
                    className="w-full bg-brand-cream/30 border border-brand-sand rounded-[2rem] px-8 py-6 text-sm outline-none focus:border-brand-terracotta transition-all resize-none"
                  ></textarea>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest">
                    <AlertCircle size={16} />
                    {errorMessage}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-brand-moss text-white py-5 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-brand-slate transition-all shadow-xl disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3"
                >
                  {status === 'submitting' ? (
                    <>Processing Synchronization...</>
                  ) : (
                    <>
                      Distribute Inquiry
                      <Send size={14} />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-brand-moss/40 italic font-medium">
                  "End-to-end clinical encryption secured by Skin Intelligence Protocols."
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
