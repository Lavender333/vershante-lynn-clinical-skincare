import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Check, Sparkles, Brain, FlaskConical, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { AssessmentData } from '../types';

const STEPS = [
  { id: 'clientInfo', title: 'SECTION 1 — CLIENT INFORMATION' },
  { id: 'concerns', title: 'SECTION 2 — YOUR SKIN CONCERNS' },
  { id: 'history', title: 'SECTION 3 — SKIN HISTORY & PATTERNS' },
  { id: 'routine', title: 'SECTION 4 — PRODUCT & ROUTINE REVIEW' },
  { id: 'lifestyle', title: 'SECTION 5 — INTERNAL + LIFESTYLE FACTORS' },
  { id: 'hormonal', title: 'SECTION 6 — HORMONAL + HEALTH HISTORY' },
  { id: 'treatment', title: 'SECTION 7 — TREATMENT HISTORY' },
  { id: 'goals', title: 'SECTION 8 — SKIN INTELLIGENCE GOALS' },
  { id: 'images', title: 'SECTION 9 — IMAGE SUBMISSION' },
  { id: 'professional', title: 'SECTION 10 — PROFESSIONAL USE ONLY' }
];

const STEP_MICROCOPY: Record<string, string> = {
  clientInfo: 'Begin with the fundamentals — precise, intentional details help guide clinical decisions.',
  concerns: "Select the concerns most present today — we'll map patterns, not just symptoms.",
  history: 'Share recurring cycles, triggers, and what has (or hasn\'t) worked.',
  routine: 'Detail your morning and evening rituals — order and frequency matter.',
  lifestyle: 'Context shapes skin behavior — hydration, sleep, and stress are relevant.',
  hormonal: 'Biological context can change barrier and pigment response — be candid.',
  treatment: 'List prior corrective care and any notable reactions or downtime.',
  goals: 'Define outcomes clearly — clinical progress is strategic and measurable.',
  images: 'Natural light, no filters — visual documentation supports accurate analysis.',
  professional: 'Reserved for clinician synthesis and recommended clinical pathway.'
};

const SECTION_SUMMARIES: Record<string, string[]> = {
  clientInfo: [
    'Full Name',
    'Preferred Name',
    'Date of Birth',
    'Phone Number',
    'Email Address',
    'Occupation',
    'Emergency Contact Name + Phone Number',
    'How did you hear about Vershanté Lynn Aesthetics?'
  ],
  concerns: [
    'Hyperpigmentation / dark marks',
    'Uneven skin tone',
    'Sensitivity or irritation',
    'Redness or inflammation',
    'Breakouts or congestion',
    'Texture or roughness',
    'Dryness or dehydration',
    'Fine lines or visible aging',
    'Loss of firmness or glow',
    'Scarring'
  ],
  history: [
    'Have you worked with a skincare professional before?',
    'What treatments or products have you tried previously?',
    'Did anything help temporarily?',
    'Did anything make your skin worse?',
    'Describe any recurring cycles or changes you notice with your skin.'
  ],
  routine: [
    'Morning Routine',
    'Evening Routine',
    'How long have you been using your current routine?',
    'How often do you change products?',
    'Do products commonly burn, sting, or cause irritation?'
  ],
  lifestyle: [
    'Stress levels',
    'Average sleep per night',
    'Water intake',
    'Supplements',
    'Exercise habits',
    'Lifestyle/environment factors'
  ],
  hormonal: [
    'Hormonal imbalance',
    'PCOS',
    'Fibroids',
    'Thyroid imbalance',
    'Insulin resistance',
    'Eczema/Psoriasis',
    'Digestive concerns',
    'Current medications'
  ],
  treatment: [
    'Chemical peels',
    'Microneedling',
    'Laser treatments',
    'Dermaplaning',
    'LED therapy',
    'Prescription skincare',
    'Previous reactions to treatments'
  ],
  goals: [
    'What would healthy skin look or feel like for you?',
    'Top 3 skin goals',
    'Commitment level',
    'Openness to corrective care'
  ],
  images: [
    'Front-facing bare skin photo',
    'Left side profile',
    'Right side profile',
    'Natural lighting preferred',
    'No filters or makeup'
  ],
  professional: [
    'Primary Concerns',
    'Observed Skin Behavior',
    'Barrier Status',
    'Inflammation Level',
    'Pigment Classification',
    'Possible Trigger Patterns',
    'Recommended Treatment Pathway',
    'Recommended Homecare',
    'Professional Notes'
  ]
};

const CONCERNS = [
  { id: 'Hyperpigmentation / dark marks', desc: 'Visible melanin clusters, dark spots, or uneven tone.' },
  { id: 'Uneven skin tone', desc: 'Areas of imbalance across texture and color.' },
  { id: 'Sensitivity or irritation', desc: 'Reactive responses to products or environmental triggers.' },
  { id: 'Redness or inflammation', desc: 'Vascular reactivity, flushing, or barrier distress.' },
  { id: 'Breakouts or congestion', desc: 'Clogged pores, blemishes, and compromised renewal.' },
  { id: 'Texture or roughness', desc: 'Surface irregularities and uneven hydration.' },
  { id: 'Dryness or dehydration', desc: 'Lack of moisture, barrier fatigue, or tightness.' },
  { id: 'Fine lines or visible aging', desc: 'Early textural change and concerns around firmness.' },
  { id: 'Loss of firmness or glow', desc: 'Dullness, laxity, and diminished radiance.' },
  { id: 'Scarring', desc: 'Post-inflammatory or procedural marks and relief concerns.' }
];

const TREATMENT_OPTIONS = [
  'Chemical peels',
  'Microneedling',
  'Laser treatments',
  'Dermaplaning',
  'LED therapy',
  'Prescription skincare'
];

const STORAGE_KEY = 'vershante_diagnostic_progress_v2';

export default function AssessmentForm({ onComplete }: { onComplete: (data: AssessmentData) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AssessmentData>({
    fullName: '',
    preferredName: '',
    dob: '',
    phoneNumber: '',
    email: '',
    occupation: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    referralSource: '',
    age: '',
    concerns: [],
    sensitivityLevel: 'Medium',
    hormonalStage: 'Standard',
    stressLevel: 5,
    sleepQuality: 'Average',
    waterIntake: 'Standard',
    dietaryProfile: [],
    activityLevel: 'Moderate',
    caffeineIntake: 'Moderate',
    currentRoutine: '',
    morningRoutine: '',
    eveningRoutine: '',
    routineDuration: '',
    productChangeFrequency: '',
    productReactions: '',
    professionalHistory: '',
    skinHistorySummary: '',
    treatmentsTried: '',
    temporaryHelp: '',
    worsenedBy: '',
    recurringCycles: '',
    supplements: '',
    exerciseHabits: '',
    lifestyleFactors: '',
    hormonalImbalance: false,
    pcos: false,
    fibroids: false,
    thyroidImbalance: false,
    insulinResistance: false,
    eczemaPsoriasis: false,
    digestiveConcerns: false,
    currentMedications: '',
    treatmentHistory: [],
    previousReactions: '',
    desiredOutcome: '',
    topGoals: '',
    commitmentLevel: '',
    opennessToCorrectiveCare: '',
    frontPhotoNotes: '',
    leftPhotoNotes: '',
    rightPhotoNotes: '',
    primaryIntent: '',
    clinicalFocus: [],
    stepFeedback: {},
    clinicalInsights: { analysis: '', solutions: [], recommendedProducts: [], confidenceScore: 0 },
    professionalPrimaryConcerns: '',
    professionalSkinBehavior: '',
    professionalBarrierStatus: '',
    professionalInflammationLevel: '',
    professionalPigmentClassification: '',
    professionalTriggerPatterns: '',
    professionalRecommendedTreatmentPathway: '',
    professionalRecommendedHomecare: '',
    professionalNotes: '',
    consultationSlot: { date: '', time: '', type: 'Virtual' },
    status: 'pending'
  });

  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { data, step } = JSON.parse(saved);
        setFormData(data);
        setCurrentStep(step);
      } catch (e) {
        console.error('Diagnostic restoration failed:', e);
      }
    }
    setHasRestored(true);
  }, []);

  useEffect(() => {
    if (hasRestored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: formData,
        step: currentStep
      }));
    }
  }, [formData, currentStep, hasRestored]);

  const handleStepFeedback = (feedback: string) => {
    setFormData(prev => ({
      ...prev,
      stepFeedback: {
        ...prev.stepFeedback,
        [STEPS[currentStep].id]: feedback
      }
    }));
  };

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const toggleConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  const toggleTreatment = (treatment: string) => {
    setFormData(prev => ({
      ...prev,
      treatmentHistory: prev.treatmentHistory.includes(treatment)
        ? prev.treatmentHistory.filter(c => c !== treatment)
        : [...prev.treatmentHistory, treatment]
    }));
  };

  const toggleCondition = (field: 'hormonalImbalance' | 'pcos' | 'fibroids' | 'thyroidImbalance' | 'insulinResistance' | 'eczemaPsoriasis' | 'digestiveConcerns') => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return Boolean(formData.fullName && formData.email && formData.phoneNumber);
      case 1:
        return formData.concerns.length > 0;
      case 2:
        return Boolean(formData.skinHistorySummary || formData.treatmentsTried || formData.recurringCycles);
      case 3:
        return Boolean(formData.morningRoutine || formData.eveningRoutine);
      case 4:
        return Boolean(formData.sleepQuality && formData.waterIntake);
      case 5:
        return true;
      case 6:
        return formData.treatmentHistory.length > 0;
      case 7:
        return Boolean(formData.primaryIntent || formData.topGoals);
      default:
        return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-brand-sand relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <FlaskConical size={120} />
      </div>

      <div className="text-center mb-6 relative">
        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-terracotta/60">
          Intelligence Protocol: Step {currentStep + 1} of {STEPS.length}
        </span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hasRestored ? [0, 1, 0] : 0 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[8px] uppercase tracking-widest text-brand-moss/40 font-bold"
        >
          <Save size={10} />
          <span>Auto-Save In Progress</span>
        </motion.div>
      </div>

      <div className="flex justify-between mb-12 overflow-x-auto pb-4 gap-3">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center gap-2 min-w-[6rem]">
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                idx === currentStep ? 'border-brand-terracotta bg-brand-terracotta text-white' :
                idx < currentStep ? 'border-brand-moss bg-brand-moss text-white' : 'border-brand-sand text-brand-sand'
              )}
              aria-current={idx === currentStep ? 'step' : undefined}
            >
              {idx < currentStep ? <Check size={16} /> : idx + 1}
            </div>
            <span className={cn(
              'text-[9px] uppercase tracking-widest font-bold text-center w-full',
              idx === currentStep ? 'text-brand-slate' : idx < currentStep ? 'text-brand-moss' : 'text-brand-sand/60'
            )}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[420px] py-4 flex flex-col"
        >
          <div className="flex-grow">
            <p className="text-[11px] italic text-brand-slate/60 mb-2">We don't guess. We assess. Your skin follows patterns.</p>
            <p className="text-sm text-brand-moss/60 mb-6">{STEP_MICROCOPY[STEPS[currentStep].id]}</p>

            {SECTION_SUMMARIES[STEPS[currentStep].id] && (
              <div className="mb-6 bg-brand-cream/50 p-4 rounded-xl border border-brand-sand text-sm text-brand-slate">
                <p className="uppercase tracking-widest text-[10px] font-bold text-brand-moss mb-2">This section covers</p>
                <ul className="list-disc list-inside space-y-1">
                  {SECTION_SUMMARIES[STEPS[currentStep].id].map((item) => (
                    <li key={item} className="text-[13px]">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Client Information</h2>
                  <p className="text-brand-moss/80 font-light">Begin with the fundamentals of your profile and referral source.</p>
                </div>
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Aaliyah Johnson"
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Preferred Name</label>
                      <input
                        type="text"
                        value={formData.preferredName}
                        onChange={e => setFormData({ ...formData, preferredName: e.target.value })}
                        placeholder="Ali"
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Occupation</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="Creative Director"
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                        placeholder="Monique Brooks"
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                        placeholder="(555) 987-6543"
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">How did you hear about Vershanté Lynn Aesthetics?</label>
                    <input
                      type="text"
                      value={formData.referralSource}
                      onChange={e => setFormData({ ...formData, referralSource: e.target.value })}
                      placeholder="Instagram, referral, search, etc."
                      className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Your Skin Concerns</h2>
                  <p className="text-brand-moss/80 font-light">Choose the areas of focus that are most present in your skin today.</p>
                </div>
                <div className="grid gap-4 py-2">
                  {CONCERNS.map((concern) => {
                    const isSelected = formData.concerns.includes(concern.id);
                    return (
                      <button
                        key={concern.id}
                        type="button"
                        onClick={() => toggleConcern(concern.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          'w-full p-6 rounded-[1.5rem] border text-left transition-all flex justify-between items-center group relative shadow-sm',
                          isSelected
                            ? 'bg-brand-moss text-white border-brand-moss ring-2 ring-brand-terracotta/20 shadow-md translate-x-2'
                            : 'bg-white border-brand-sand hover:border-brand-moss text-brand-slate'
                        )}
                      >
                        <div className="space-y-2">
                          <p className="font-serif italic text-xl leading-none">{concern.id}</p>
                          <p className={cn('text-xs font-light leading-relaxed max-w-[280px]', isSelected ? 'text-brand-cream/80' : 'text-brand-moss/70')}>
                            {concern.desc}
                          </p>
                        </div>
                        <div className={cn(
                          'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ml-4',
                          isSelected ? 'bg-brand-terracotta border-brand-terracotta' : 'border-brand-sand'
                        )}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Skin History & Patterns</h2>
                  <p className="text-brand-moss/80 font-light">Tell me how your skin has responded over time so I can identify recurring behavior and triggers.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Have you worked with a skincare professional before?</label>
                    <textarea
                      value={formData.skinHistorySummary}
                      onChange={e => setFormData({ ...formData, skinHistorySummary: e.target.value })}
                      placeholder="Briefly describe your experience with professional care."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">What treatments or products have you tried previously?</label>
                      <textarea
                        value={formData.treatmentsTried}
                        onChange={e => setFormData({ ...formData, treatmentsTried: e.target.value })}
                        placeholder="List treatments, products, prescription skincare, etc."
                        className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Did anything help temporarily?</label>
                      <textarea
                        value={formData.temporaryHelp}
                        onChange={e => setFormData({ ...formData, temporaryHelp: e.target.value })}
                        placeholder="Note any quick improvements or short-lived results."
                        className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Did anything make your skin worse?</label>
                      <textarea
                        value={formData.worsenedBy}
                        onChange={e => setFormData({ ...formData, worsenedBy: e.target.value })}
                        placeholder="Record any products, treatments, or habits that increased irritation."
                        className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Describe recurring cycles or changes you notice.</label>
                      <textarea
                        value={formData.recurringCycles}
                        onChange={e => setFormData({ ...formData, recurringCycles: e.target.value })}
                        placeholder="Include timing, triggers, and any pattern of fluctuation."
                        className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Product & Routine Review</h2>
                  <p className="text-brand-moss/80 font-light">Provide a precise view of your current homecare, frequency, and reactions.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Morning Routine</label>
                    <textarea
                      value={formData.morningRoutine}
                      onChange={e => setFormData({ ...formData, morningRoutine: e.target.value })}
                      placeholder="Morning product order and notes."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Evening Routine</label>
                    <textarea
                      value={formData.eveningRoutine}
                      onChange={e => setFormData({ ...formData, eveningRoutine: e.target.value })}
                      placeholder="Evening product order and notes."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Routine Duration</label>
                      <input
                        type="text"
                        value={formData.routineDuration}
                        onChange={e => setFormData({ ...formData, routineDuration: e.target.value })}
                        placeholder="Months / Years"
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">How often do you change products?</label>
                      <input
                        type="text"
                        value={formData.productChangeFrequency}
                        onChange={e => setFormData({ ...formData, productChangeFrequency: e.target.value })}
                        placeholder="Every few weeks, rarely, seasonally..."
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Products that irritate</label>
                      <input
                        type="text"
                        value={formData.productReactions}
                        onChange={e => setFormData({ ...formData, productReactions: e.target.value })}
                        placeholder="Describe your typical skin response."
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Internal + Lifestyle Factors</h2>
                  <p className="text-brand-moss/80 font-light">Map the internal rhythms and environmental influences that shape skin behavior.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">Stress Level (1–10)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.stressLevel}
                        onChange={e => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })}
                        className="w-full accent-brand-terracotta bg-brand-sand h-1 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-brand-terracotta">{formData.stressLevel}</span>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">Average Sleep per Night</label>
                      <div className="flex gap-2">
                        {['Poor', 'Average', 'Excellent'].map(choice => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({ ...formData, sleepQuality: choice as any })}
                            aria-pressed={formData.sleepQuality === choice}
                            className={cn(
                              'flex-1 py-2 rounded-xl border text-[10px] uppercase font-bold transition-all',
                              formData.sleepQuality === choice
                                ? 'bg-brand-moss text-white'
                                : 'bg-brand-cream border-brand-sand text-brand-moss'
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">Hydration</label>
                      <div className="flex gap-2">
                        {['Low', 'Standard', 'Optimal'].map(choice => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({ ...formData, waterIntake: choice as any })}
                            aria-pressed={formData.waterIntake === choice}
                            className={cn(
                              'flex-1 py-2 rounded-xl border text-[10px] uppercase font-bold transition-all',
                              formData.waterIntake === choice
                                ? 'bg-brand-moss text-white'
                                : 'bg-brand-cream border-brand-sand text-brand-moss'
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Supplements</label>
                      <input
                        type="text"
                        value={formData.supplements}
                        onChange={e => setFormData({ ...formData, supplements: e.target.value })}
                        placeholder="Vitamins, probiotics, adaptogens, etc."
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Exercise Habits</label>
                      <input
                        type="text"
                        value={formData.exerciseHabits}
                        onChange={e => setFormData({ ...formData, exerciseHabits: e.target.value })}
                        placeholder="Cardio, strength, frequency, intensity."
                        className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Lifestyle / Environment</label>
                      <textarea
                        value={formData.lifestyleFactors}
                        onChange={e => setFormData({ ...formData, lifestyleFactors: e.target.value })}
                        placeholder="Travel, humidity, work environment, sleep routine, stressors."
                        className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Hormonal + Health History</h2>
                  <p className="text-brand-moss/80 font-light">Record key biological and systemic factors that may influence barrier and pigment behavior.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { field: 'hormonalImbalance', label: 'Hormonal imbalance' },
                    { field: 'pcos', label: 'PCOS' },
                    { field: 'fibroids', label: 'Fibroids' },
                    { field: 'thyroidImbalance', label: 'Thyroid imbalance' },
                    { field: 'insulinResistance', label: 'Insulin resistance' },
                    { field: 'eczemaPsoriasis', label: 'Eczema / Psoriasis' },
                    { field: 'digestiveConcerns', label: 'Digestive concerns' }
                  ].map((item) => {
                    const key = item.field as 'hormonalImbalance' | 'pcos' | 'fibroids' | 'thyroidImbalance' | 'insulinResistance' | 'eczemaPsoriasis' | 'digestiveConcerns';
                    return (
                      <button
                        key={item.field}
                        type="button"
                        onClick={() => toggleCondition(key)}
                        className={cn(
                          'w-full rounded-3xl border px-4 py-4 text-left text-sm font-bold transition-all',
                          formData[key]
                            ? 'bg-brand-moss text-white border-brand-moss'
                            : 'bg-brand-cream border-brand-sand text-brand-slate hover:border-brand-moss'
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Current medications or supplements</label>
                    <textarea
                      value={formData.currentMedications}
                      onChange={e => setFormData({ ...formData, currentMedications: e.target.value })}
                      placeholder="List any prescription or over-the-counter protocols you are currently taking."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Treatment History</h2>
                  <p className="text-brand-moss/80 font-light">Document your prior corrective treatments and any reactions that followed.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TREATMENT_OPTIONS.map((treatment) => {
                    const isSelected = formData.treatmentHistory.includes(treatment);
                    return (
                      <button
                        key={treatment}
                        type="button"
                        onClick={() => toggleTreatment(treatment)}
                        className={cn(
                          'w-full rounded-3xl border px-4 py-4 text-left text-sm font-bold transition-all',
                          isSelected
                            ? 'bg-brand-moss text-white border-brand-moss'
                            : 'bg-brand-cream border-brand-sand text-brand-slate hover:border-brand-moss'
                        )}
                      >
                        {treatment}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Previous reactions to treatments</label>
                  <textarea
                    value={formData.previousReactions}
                    onChange={e => setFormData({ ...formData, previousReactions: e.target.value })}
                    placeholder="Describe any sensitivity, inflammation, or other responses."
                    className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                  />
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Skin Intelligence Goals</h2>
                  <p className="text-brand-moss/80 font-light">Define your healthy skin goals and how committed you are to corrective clinical care.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">What would healthy skin look or feel like for you?</label>
                    <textarea
                      value={formData.primaryIntent}
                      onChange={e => setFormData({ ...formData, primaryIntent: e.target.value })}
                      placeholder="Describe your ideal outcome in your own words."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Top 3 skin goals</label>
                    <textarea
                      value={formData.topGoals}
                      onChange={e => setFormData({ ...formData, topGoals: e.target.value })}
                      placeholder="1. 2. 3."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-20 resize-none text-sm"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Commitment level</label>
                      <div className="grid gap-2">
                        {['Ready', 'Curious', 'Committed'].map(choice => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({ ...formData, commitmentLevel: choice as any })}
                            className={cn(
                              'w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all',
                              formData.commitmentLevel === choice
                                ? 'bg-brand-slate text-white border-brand-slate'
                                : 'bg-brand-cream border-brand-sand text-brand-moss hover:border-brand-moss'
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Openness to corrective care</label>
                      <div className="grid gap-2">
                        {['Yes', 'Maybe', 'Prefer guidance'].map(choice => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({ ...formData, opennessToCorrectiveCare: choice as any })}
                            className={cn(
                              'w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all',
                              formData.opennessToCorrectiveCare === choice
                                ? 'bg-brand-slate text-white border-brand-slate'
                                : 'bg-brand-cream border-brand-sand text-brand-moss hover:border-brand-moss'
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Image Submission</h2>
                  <p className="text-brand-moss/80 font-light">Provide visual context with natural-light images. No filters or makeup.</p>
                </div>
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Front-facing bare skin photo</label>
                    <textarea
                      value={formData.frontPhotoNotes}
                      onChange={e => setFormData({ ...formData, frontPhotoNotes: e.target.value })}
                      placeholder="When you upload, note the lighting and whether makeup was removed."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-20 resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Left side profile</label>
                    <textarea
                      value={formData.leftPhotoNotes}
                      onChange={e => setFormData({ ...formData, leftPhotoNotes: e.target.value })}
                      placeholder="Natural lighting preferred. Mention if any product residue remains."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-20 resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Right side profile</label>
                    <textarea
                      value={formData.rightPhotoNotes}
                      onChange={e => setFormData({ ...formData, rightPhotoNotes: e.target.value })}
                      placeholder="Ideal for capturing texture, pigmentation, and barrier clarity."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-20 resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic leading-tight tracking-tight">Professional Use Only</h2>
                  <p className="text-brand-moss/80 font-light">This section is reserved for clinician review and will be completed after intake submission.</p>
                </div>
                <div className="grid gap-4">
                  {[
                    { field: 'professionalPrimaryConcerns', label: 'Primary Concerns' },
                    { field: 'professionalSkinBehavior', label: 'Observed Skin Behavior' },
                    { field: 'professionalBarrierStatus', label: 'Barrier Status' },
                    { field: 'professionalInflammationLevel', label: 'Inflammation Level' },
                    { field: 'professionalPigmentClassification', label: 'Pigment Classification' },
                    { field: 'professionalTriggerPatterns', label: 'Possible Trigger Patterns' },
                    { field: 'professionalRecommendedTreatmentPathway', label: 'Recommended Treatment Pathway' },
                    { field: 'professionalRecommendedHomecare', label: 'Recommended Homecare' }
                  ].map((item) => (
                    <div key={item.field} className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">{item.label}</label>
                      <textarea
                        value={formData[item.field as keyof AssessmentData] as string || ''}
                        onChange={e => setFormData({ ...formData, [item.field]: e.target.value })}
                        placeholder={`Clinician note for ${item.label.toLowerCase()}.`}
                        className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-20 resize-none text-sm"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Professional Notes</label>
                    <textarea
                      value={formData.professionalNotes || ''}
                      onChange={e => setFormData({ ...formData, professionalNotes: e.target.value })}
                      placeholder="Any additional clinician observations or treatment notes."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-28 resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-brand-sand/30">
            <label className="text-[9px] uppercase tracking-widest font-bold text-brand-moss/40 mb-2 block">Step Experience (Optional Feedback)</label>
            <textarea
              value={formData.stepFeedback?.[STEPS[currentStep].id] || ''}
              onChange={e => handleStepFeedback(e.target.value)}
              placeholder="Any difficulty or observations about this step?"
              className="w-full bg-brand-cream/50 border border-brand-sand rounded-xl px-4 py-2 text-[11px] font-light italic text-brand-slate outline-none focus:border-brand-terracotta transition-all resize-none h-12"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-12 pt-8 border-t border-brand-sand">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 text-brand-moss disabled:opacity-30 transition-opacity uppercase text-[10px] tracking-widest font-bold"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        {currentStep === STEPS.length - 1 ? (
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              onComplete(formData);
            }}
            className="bg-brand-moss text-white px-8 py-3 rounded-full hover:bg-brand-slate transition-colors flex items-center gap-2 uppercase text-[10px] tracking-widest font-bold shadow-lg shadow-brand-moss/20"
          >
            Submit Intelligence
            <Sparkles size={16} />
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="bg-brand-moss text-white px-8 py-3 rounded-full hover:bg-brand-slate transition-colors flex items-center gap-2 disabled:opacity-30 uppercase text-[10px] tracking-widest font-bold shadow-lg shadow-brand-moss/20"
          >
            Next Step
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-brand-sand">
          <Brain size={12} />
          <span>Skin Intelligence Assessment™</span>
        </div>
      </div>
    </div>
  );
}
