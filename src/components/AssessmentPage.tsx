import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import AssessmentForm from '../components/AssessmentForm';
import BookingCalendar from '../components/BookingCalendar';
import { AssessmentData, ConsultationSlot } from '../types';
import { Sparkles, Calendar, FlaskConical, MessageSquare, CheckCircle2, Loader2, Brain, ChevronRight, ListChecks, ShoppingBag, LogIn, ArrowUpRight } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { cn } from '../lib/utils';
import { generateClinicalInsights } from '../services/skinAnalysisService';

import BiologicalFlowChart from '../components/BiologicalFlowChart';
import PrintableSummary from '../components/PrintableSummary';

type FlowStep = 'assessment' | 'booking' | 'success';

export default function AssessmentPage() {
  const [flowStep, setFlowStep] = useState<FlowStep>('assessment');
  const [loading, setLoading] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [data, setData] = useState<AssessmentData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ConsultationSlot | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const adminEmail = 'antoinetteqwilliams@gmail.com';
        if (u.email?.toLowerCase().trim() === adminEmail) {
          setIsAdmin(true);
        } else {
          try {
            const { getDoc, doc } = await import('firebase/firestore');
            const adminDoc = await getDoc(doc(db, 'admins', u.email?.toLowerCase().trim() || ''));
            if (adminDoc.exists()) {
              setIsAdmin(true);
            }
          } catch (e) {
            console.error("Admin check failed", e);
          }
        }
      } else {
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleAssessmentComplete = async (assessmentData: AssessmentData) => {
    setLoading(true);
    try {
      // Run AI analysis before saving so clinicalInsights is stored with the record
      const clinicalInsights = await generateClinicalInsights(assessmentData);
      const enrichedData = { ...assessmentData, clinicalInsights };

      const docRef = await addDoc(collection(db, 'assessments'), {
        ...enrichedData,
        userId: user?.uid || null,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setAssessmentId(docRef.id);
      setData(enrichedData);
      setFlowStep('booking');
    } catch (error: any) {
      console.error('Assessment submission error:', error);
      const info = (() => { try { return JSON.parse(error.message); } catch { return null; } })();
      toast.error('Submission Failed', {
        description: info?.error || 'Unable to submit your assessment. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookingComplete = async (slot: ConsultationSlot) => {
    if (!assessmentId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'assessments', assessmentId), {
        consultationSlot: slot,
        status: 'scheduled'
      });
      setSelectedSlot(slot);
      setFlowStep('success');

      // Trigger confirmation email
      if (data) {
        try {
          const response = await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.email,
              fullName: data.fullName,
              bookingDetails: {
                date: new Date(slot.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                time: slot.time,
                type: slot.type
              },
              insightsSummary: data.clinicalInsights,
              clinicalFocus: data.clinicalFocus,
              summaryData: data
            })
          });
          const result = await response.json();
          if (!result.success) {
            console.error("Clinical notification failed:", result.error);
            toast.error("Communication sync delayed", {
              description: "The confirmation email is being re-routed at the gateway."
            });
          } else {
            console.log("Clinical confirmation protocol dispatched successfully.");
            toast.success("Intelligence Protocol Dispatched", {
              description: `Confirmation sent to ${data.email}.`
            });
          }
        } catch (emailErr) {
          console.error("Communication failure at gateway:", emailErr);
          toast.error("Gateway Sync Failure", {
            description: "Unable to reach the communication protocol."
          });
        }
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      const info = (() => { try { return JSON.parse(error.message); } catch { return null; } })();
      toast.error('Booking Failed', {
        description: info?.error || 'Unable to confirm your booking. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-cream clinical-grid">
      <div className="absolute inset-0 eclectic-print pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-16 px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-brand-sand z-0 -translate-y-1/2" />
            
            {[
              { id: 'assessment', label: 'Intelligence Capture', icon: Brain },
              { id: 'booking', label: 'Synchronization', icon: Calendar },
              { id: 'success', label: 'Protocol Ready', icon: CheckCircle2 }
            ].map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = (flowStep === 'booking' && idx === 0) || (flowStep === 'success' && idx <= 2);
              const isActive = flowStep === step.id;
              
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      backgroundColor: isCompleted || isActive ? 'var(--color-brand-moss)' : 'var(--color-brand-cream)',
                      borderColor: isCompleted || isActive ? 'var(--color-brand-moss)' : 'var(--color-brand-sand)',
                      color: isCompleted || isActive ? '#FFFFFF' : 'var(--color-brand-moss)'
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-sm",
                      isActive && "ring-4 ring-brand-moss/10"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </motion.div>
                  <span className={cn(
                    "text-[9px] uppercase tracking-[0.2em] font-bold text-center absolute -bottom-8 whitespace-nowrap transition-colors",
                    isActive ? "text-brand-moss" : "text-brand-moss/40"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {flowStep === 'assessment' && (
            <motion.div 
              key="assessment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="text-sm uppercase tracking-widest text-brand-moss/60 font-black">We don't guess. We assess.</div>
                <h1 className="text-5xl font-serif text-brand-slate italic">Skin Intelligence Assessment™</h1>
                <p className="text-brand-moss/80 font-light">Comprehensive Skin Analysis & Corrective Strategy Intake.</p>

                <div className="max-w-lg mx-auto text-brand-slate/70 text-base leading-relaxed">
                  <p className="mb-3">The Skin Intelligence Assessment™ is a paid professional strategy consultation that maps skin behavior, trigger patterns, pigment dynamics, barrier status, and corrective pathways. The experience is clinical yet warm — intentional, elevated, and melanin-inclusive.</p>
                  <p className="text-brand-terracotta font-bold uppercase tracking-[0.2em] text-[11px]">Skin Intelligence Assessment™ — $125<br />(Introduction Price: $90) • 45–60 minute session</p>
                </div>

                <div className="mt-4 text-sm text-brand-moss/70">
                  <p className="font-bold mb-2">Assessment includes</p>
                  <ul className="list-inside list-disc space-y-1 text-left max-w-md mx-auto">
                    <li>Comprehensive intake + lifestyle review</li>
                    <li>Trigger analysis & skin behavior evaluation</li>
                    <li>Barrier, inflammation & pigment assessment</li>
                    <li>Product review, treatment roadmap, customized homecare</li>
                    <li>1:1 virtual or in-person consultation (45–60 minutes)</li>
                    <li className="mt-2 text-[11px] text-brand-slate/60">If you move forward with corrective care within 7 days, receive a $25 credit toward your treatment plan.</li>
                  </ul>
                </div>
                <div className="mt-2 text-xs italic text-brand-slate/50">"Your skin follows patterns. Your skin isn't misbehaving, it's communicating."</div>
              </div>
              
              <AssessmentForm onComplete={handleAssessmentComplete} />
              
              <div className="max-w-xl mx-auto text-center mt-12 bg-white/50 p-8 rounded-[2rem] border border-brand-sand">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-moss mb-4">What happens next?</h3>
                <div className="grid grid-cols-2 gap-8 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-brand-terracotta">
                      <FlaskConical size={14} />
                      <span className="font-bold text-[10px] uppercase">Clinical Review</span>
                    </div>
                    <p className="text-[11px] text-brand-moss font-light leading-relaxed">
                      Your intake is reviewed with clinical precision to map barrier status, pigment behavior, inflammation, and trigger patterns.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-brand-terracotta">
                      <Calendar size={14} />
                      <span className="font-bold text-[10px] uppercase">Consultation Booking</span>
                    </div>
                    <p className="text-[11px] text-brand-moss font-light leading-relaxed">
                      Select a 45–60 minute window for the virtual or in-person strategy session that finalizes your treatment pathway.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {flowStep === 'booking' && (
            <motion.div 
              key="booking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">
                  <Brain size={14} />
                  <span>Intelligence Received</span>
                </div>
                <h1 className="text-5xl font-serif text-brand-slate italic">Schedule Consultation</h1>
                <p className="text-brand-moss/80 font-light">
                  Step 02: Select the consultation window for your diagnostic deep dive. This session is designed to feel elevated, editorial, and clinically precise.
                </p>
              </div>

              <BookingCalendar onBook={handleBookingComplete} />
            </motion.div>
          )}

          {flowStep === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-brand-sand text-center space-y-8">
                <div className="w-20 h-20 bg-brand-moss rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-moss/20 ring-4 ring-brand-moss/10">
                  <CheckCircle2 size={40} />
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-5xl font-serif text-brand-slate italic">Protocol established</h2>
                  <p className="text-xl text-brand-moss/80 font-light">
                    Your assessment and consultation are now synchronized, {data?.fullName.split(' ')[0]}. Your strategy session is confirmed, and your intake is ready for the next clinical review.
                  </p>
                  <p className="text-sm text-brand-slate/60">
                    If you choose to move forward with a corrective program within 7 days, you will receive a $25 credit toward your treatment plan or service.
                  </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8 pt-8">
                  {/* Biological Signature Panel */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-1 bg-brand-cream/50 rounded-[2.5rem] p-8 border border-brand-sand flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="text-center">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-moss mb-2">Biological Signature</h4>
                      <p className="text-[11px] text-brand-moss/60 italic">"Visualizing your environmental & clinical alignment."</p>
                    </div>
                    
                    {data && <BiologicalFlowChart data={data} />}
                    
                    <div className="w-full pt-6 border-t border-brand-sand space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[9px] uppercase font-bold text-brand-moss/60 tracking-widest">Alignment Score</span>
                        <span className="text-xl font-serif italic text-brand-terracotta">{data?.clinicalInsights?.confidenceScore || 85}%</span>
                      </div>
                      <div className="w-full bg-brand-sand/30 h-1 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data?.clinicalInsights?.confidenceScore || 85}%` }}
                          transition={{ duration: 2, ease: "easeOut", delay: 1 }}
                          className="h-full bg-brand-terracotta"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Insights & Appointments Panel */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6 h-full">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-brand-slate p-8 rounded-[2.5rem] text-left space-y-6 text-white shadow-xl shadow-brand-slate/20"
                      >
                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-sand border-b border-brand-sand/20 pb-4">Confirmed Appointment</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-terracotta/20 flex items-center justify-center">
                              <Calendar size={14} className="text-brand-terracotta" />
                            </div>
                            <p className="font-serif italic text-2xl">{selectedSlot?.date ? new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-terracotta/20 flex items-center justify-center">
                              <Sparkles size={14} className="text-brand-terracotta" />
                            </div>
                            <p className="text-[10px] uppercase tracking-widest font-bold">{selectedSlot?.time} — {selectedSlot?.type} Session</p>
                          </div>
                          <div className="pt-4 border-t border-white/10 mt-4">
                            <p className="text-[9px] uppercase tracking-widest text-brand-sand opacity-40 mb-1">Clinical Investment</p>
                            <p className="text-xs font-bold text-brand-terracotta">{data?.investmentPreference}</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-white border-2 border-brand-cream p-8 rounded-[2.5rem] text-left space-y-6 shadow-sm"
                      >
                        <div className="space-y-4">
                          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-moss border-b border-brand-sand/50 pb-4">Clinical Observations</h4>
                          <div className="flex flex-wrap gap-2">
                            {data?.clinicalFocus && data.clinicalFocus.length > 0 ? (
                              data.clinicalFocus.map(f => (
                                <span key={f} className="px-3 py-1 bg-brand-cream rounded-full text-[9px] font-bold text-brand-moss border border-brand-sand">{f}</span>
                              ))
                            ) : (
                              <span className="text-[10px] text-brand-moss/40 italic">General Diagnostic</span>
                            )}
                          </div>
                          
                          <div className="pt-4 border-t border-brand-sand/30 space-y-3">
                            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-moss/60 italic">Identified Patterns</h4>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                              {data?.concerns.map(c => (
                                <div key={c} className="flex items-center gap-1.5">
                                  <div className="w-1 h-1 bg-brand-terracotta rounded-full" />
                                  <span className="text-[11px] text-brand-slate/80">{c}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-moss/5 p-10 rounded-[3rem] text-left space-y-8 border border-brand-moss/10"
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="text-brand-moss" size={24} />
                      <h4 className="text-xs uppercase tracking-[0.4em] font-black text-brand-moss">AI Professional Insight Module</h4>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-brand-terracotta">Diagnostic Analysis</p>
                        <p className="text-base font-light text-brand-slate leading-relaxed italic border-l-2 border-brand-terracotta/30 pl-6">
                          "{data?.clinicalInsights?.analysis}"
                        </p>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-brand-moss">
                            <ListChecks size={14} />
                            <span className="text-[10px] uppercase font-black tracking-widest">Protocol Adjustments</span>
                          </div>
                          <ul className="space-y-2">
                            {data?.clinicalInsights?.solutions.map((s, i) => (
                              <li key={i} className="text-xs text-brand-moss/80 flex items-start gap-2">
                                <span className="text-brand-terracotta mt-0.5">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-brand-moss">
                            <ShoppingBag size={14} />
                            <span className="text-[10px] uppercase font-black tracking-widest">Ingredient Intelligence</span>
                          </div>
                          <ul className="space-y-2">
                            {data?.clinicalInsights?.recommendedProducts.map((p, i) => (
                              <li key={i} className="text-xs text-brand-moss/80 flex items-start gap-2">
                                <span className="text-brand-terracotta mt-0.5">•</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Printable summary / receipt */}
                {data && (
                  <div className="mt-6 flex items-center justify-center">
                    <PrintableSummary data={data} slot={selectedSlot} />
                  </div>
                )}
              </div>
              
              {data?.stepFeedback && Object.keys(data.stepFeedback).length > 0 && (
                <div className="bg-brand-sand/5 p-8 rounded-3xl border border-brand-sand/30 text-left space-y-4">
                  <div className="flex items-center gap-2 text-brand-moss/60">
                    <MessageSquare size={14} />
                    <h4 className="text-[10px] uppercase font-bold tracking-widest">Your UX Feedback Synchronization</h4>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(data.stepFeedback).map(([stepId, feedback]) => (
                      <div key={stepId} className="bg-white/50 p-4 rounded-xl border border-brand-sand/20">
                        <p className="text-[8px] uppercase font-bold text-brand-sand tracking-widest mb-1">{stepId.replace(/-/g, ' ')}</p>
                        <p className="text-[11px] text-brand-moss italic font-light">"{feedback}"</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-brand-moss/40 italic">"This environmental feedback is secured for clinical analysis to improve our intelligence Capture Flow."</p>
                </div>
              )}

              <div className="pt-8 space-y-6 border-t border-brand-sand">
                <p className="text-sm text-brand-moss/60">
                  A clinical prep guide and meeting link have been sent to <span className="font-bold underline">{data?.email}</span>.
                </p>
                
                {!user ? (
                  <div className="bg-brand-sand/10 p-8 rounded-3xl border border-brand-sand space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-brand-moss leading-relaxed">
                      Secure your Clinical intelligence
                    </h4>
                    <p className="text-[11px] text-brand-moss/60 font-light leading-relaxed max-w-md mx-auto">
                      Log in to save this protocol to your patient dashboard and access your diagnostic history, session reminders, and clinical updates at any time.
                    </p>
                    <button 
                      onClick={signIn}
                      className="inline-flex items-center gap-2 bg-brand-moss text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-slate transition-all"
                    >
                      <LogIn size={14} />
                      Link to Intelligence Profile
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/my-intelligence"
                    className="inline-flex items-center gap-2 bg-brand-terracotta text-white px-8 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-slate transition-all shadow-lg"
                  >
                    View My Intelligence Dashboard
                    <ArrowUpRight size={14} />
                  </Link>
                )}

                <div className="flex flex-col items-center gap-4">
                  <button 
                    onClick={() => {
                      setFlowStep('assessment');
                      setAssessmentId(null);
                      setData(null);
                    }}
                    className="text-brand-terracotta text-[10px] uppercase tracking-widest font-bold hover:opacity-70"
                  >
                    Start New Intelligence Submission
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="fixed inset-0 bg-brand-cream/50 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-brand-sand flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-brand-terracotta" size={48} />
              <p className="font-serif italic text-brand-slate">Synchronizing Intelligence...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
