import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Check, Sparkles, Brain, FlaskConical, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { AssessmentData } from '../types';

const STEPS = [
  { id: 'basics', title: 'The Basics' },
  { id: 'clinical', title: 'Clinical Context' },
  { id: 'focus', title: 'Clinical Focus' },
  { id: 'lifestyle', title: 'Lifestyle & Flow' },
  { id: 'goals', title: 'Your Intent' }
];

const CONCERNS = [
  { id: 'Sensitivity', desc: 'Reactive responses to environmental triggers and ingredient profiles.' },
  { id: 'Hyperpigmentation', desc: 'Visible marking from melanin clusters or melasma.' },
  { id: 'Texture', desc: 'Surface irregularities, rough patches, or open pores.' },
  { id: 'Dullness', desc: 'Loss of luminosity and sluggish cellular turnover.' },
  { id: 'Elasticity', desc: 'Compromised bounce and firmness in the dermal layer.' },
  { id: 'Acne', desc: 'Active congestion from hormonal shifts or inflammation.' },
  { id: 'Redness', desc: 'Vascular reactivity and chronic flushing or barrier fatigue.' }
];

const FOCUS_AREAS = [
  { name: 'Cortisol & Stress', desc: 'Managing skin reactions triggered by high-cortisol lifestyle.' },
  { name: 'Postpartum Skincare', desc: 'Restoring balance after significant biological and hormonal shifts.' },
  { name: 'Menopause Intelligence', desc: 'Deep hydration and elasticity restoration for the evolving skin barrier.' },
  { name: 'Hyperpigmentation Patterns', desc: 'Targeted correction for melanin-rich skin and persistent marking.' },
  { name: 'Perimenopausal Congestion', desc: 'Addressing adult acne results from fluctuating estrogen levels.' },
  { name: 'Epidermal Barrier Recovery', desc: 'Healing over-processed skin and chronic inflammation/sensitization.' },
  { name: 'Circadian Skin Rhythm', desc: 'Optimizing the skin repair cycle impacted by fragmented sleep.' },
  { name: 'Periorbital Ecology', desc: 'Structural care for lymphatic drainage and thinning dermal layers around eyes.' },
  { name: 'Environmental Resilience', desc: 'Mapping oxidative damage from blue light and urban pollution.' }
];

const DIETARY_OPTIONS = [
  'Anti-Inflammatory',
  'Plant-Based',
  'High Protein',
  'Ketogenic',
  'Standard/Varied',
  'Dairy-Free',
  'Sugar-Conscious',
  'Intermittent Fasting'
];

const STORAGE_KEY = 'vershante_diagnostic_progress';

export default function AssessmentForm({ onComplete }: { onComplete: (data: AssessmentData) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AssessmentData>({
    fullName: '',
    email: '',
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
    professionalHistory: '',
    goals: '',
    investmentPreference: 'The Signature Hybrid Flow',
    primaryIntent: '',
    clinicalFocus: [],
    stepFeedback: {}
  });

  const [hasRestored, setHasRestored] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { data, step } = JSON.parse(saved);
        setFormData(data);
        setCurrentStep(step);
      } catch (e) {
        console.error("Diagnostic restoration failed:", e);
      }
    }
    setHasRestored(true);
  }, []);

  // Auto-save on changes
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

  const toggleFocus = (focus: string) => {
    setFormData(prev => ({
      ...prev,
      clinicalFocus: prev.clinicalFocus.includes(focus)
        ? prev.clinicalFocus.filter(f => f !== focus)
        : [...prev.clinicalFocus, focus]
    }));
  };

  const toggleDiet = (diet: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryProfile: prev.dietaryProfile.includes(diet)
        ? prev.dietaryProfile.filter(d => d !== diet)
        : [...prev.dietaryProfile, diet]
    }));
  };

  const isStepValid = () => {
    if (currentStep === 0) return formData.fullName && formData.email && formData.age;
    if (currentStep === 1) return formData.concerns.length > 0;
    if (currentStep === 2) return formData.clinicalFocus.length > 0;
    if (currentStep === 4) return formData.primaryIntent.length > 10;
    return true;
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
          <span>Auto-Save Encrypted</span>
        </motion.div>
      </div>

      <div className="flex justify-between mb-12">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                idx === currentStep ? "border-brand-terracotta bg-brand-terracotta text-white" : 
                idx < currentStep ? "border-brand-moss bg-brand-moss text-white" : "border-brand-sand text-brand-sand"
              )}
              aria-current={idx === currentStep ? "step" : undefined}
            >
              {idx < currentStep ? <Check size={20} /> : idx + 1}
            </div>
            <span className={cn(
              "text-[9px] uppercase tracking-widest font-bold text-center w-max mt-1",
              idx === currentStep ? "text-brand-slate" : 
              idx < currentStep ? "text-brand-moss" : "text-brand-sand/60"
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
          className="min-h-[400px] py-4 flex flex-col"
        >
          <div className="flex-grow">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic">Beginning the Dialogue</h2>
                  <p className="text-brand-moss/80 font-light">Let's start with who you are.</p>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Lauren Adams"
                      className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Email Intelligence</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="intelligence@skin.com"
                      className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Age</label>
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={e => setFormData({...formData, age: e.target.value})}
                      placeholder="35"
                      className="w-full bg-brand-cream border-b border-brand-sand p-3 focus:border-brand-terracotta outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic">Clinical Observations</h2>
                  <p className="text-brand-moss/80 font-light italic">"Identify the patterns you observe in your skin."</p>
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
                          "w-full p-6 rounded-[1.5rem] border text-left transition-all flex justify-between items-center group relative shadow-sm",
                          isSelected 
                            ? "bg-brand-moss text-white border-brand-moss ring-2 ring-brand-terracotta/20 shadow-md translate-x-2" 
                            : "bg-white border-brand-sand hover:border-brand-moss text-brand-slate"
                        )}
                      >
                        <div className="space-y-2">
                          <p className="font-serif italic text-xl leading-none">{concern.id}</p>
                          <p className={cn("text-xs font-light leading-relaxed max-w-[280px]", isSelected ? "text-brand-cream/80" : "text-brand-moss/70")}>
                            {concern.desc}
                          </p>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ml-4",
                          isSelected ? "bg-brand-terracotta border-brand-terracotta" : "border-brand-sand"
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
                  <h2 className="text-3xl font-serif text-brand-slate italic underline decoration-brand-terracotta/30">Clinical Focus</h2>
                  <p className="text-brand-moss/80 font-light italic">"Select the disciplines that will anchor our diagnostic effort."</p>
                </div>
                <div className="grid gap-4 py-2">
                  {FOCUS_AREAS.map((focus) => {
                    const isSelected = formData.clinicalFocus.includes(focus.name);
                    return (
                      <button
                        key={focus.name}
                        type="button"
                        onClick={() => toggleFocus(focus.name)}
                        aria-pressed={isSelected}
                        className={cn(
                          "w-full p-6 rounded-[1.5rem] border text-left transition-all flex justify-between items-center group relative shadow-sm",
                          isSelected 
                            ? "bg-brand-slate text-white border-brand-slate ring-2 ring-brand-terracotta/20 shadow-md transform translate-x-2" 
                            : "bg-white border-brand-sand hover:border-brand-moss text-brand-slate"
                        )}
                      >
                        <div className="space-y-2">
                          <p className="font-serif italic text-xl leading-none">{focus.name}</p>
                          <p className={cn("text-xs font-light leading-relaxed max-w-[280px]", isSelected ? "text-brand-sand/90" : "text-brand-moss/70")}>
                            {focus.desc}
                          </p>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ml-4",
                          isSelected ? "bg-brand-terracotta border-brand-terracotta" : "border-brand-sand"
                        )}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic">Lifestyle & Flow</h2>
                  <p className="text-brand-moss/80 font-light">Mapping the circulatory and inflammatory rhythms of your biological state.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">Hormonal Context</label>
                    <div className="flex flex-wrap gap-2">
                      {['Standard', 'Post-Partum', 'Perimenopause', 'Menopause', 'Post-Menopause'].map(stage => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => setFormData({...formData, hormonalStage: stage as any})}
                          aria-pressed={formData.hormonalStage === stage}
                          className={cn(
                            "px-4 py-2 rounded-full border text-xs transition-all",
                            formData.hormonalStage === stage 
                              ? "bg-brand-terracotta text-white border-brand-terracotta" 
                              : "bg-transparent border-brand-sand hover:border-brand-terracotta text-brand-moss"
                          )}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">Sleep Intelligence</label>
                      <div className="flex gap-2">
                        {['Poor', 'Average', 'Excellent'].map(choice => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({...formData, sleepQuality: choice as any})}
                            aria-pressed={formData.sleepQuality === choice}
                            className={cn(
                              "flex-1 py-2 rounded-xl border text-[10px] uppercase font-bold transition-all",
                              formData.sleepQuality === choice 
                                ? "bg-brand-moss text-white" 
                                : "bg-brand-cream border-brand-sand text-brand-moss"
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">Hydration Level</label>
                      <div className="flex gap-2">
                        {['Low', 'Standard', 'Optimal'].map(choice => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({...formData, waterIntake: choice as any})}
                            aria-pressed={formData.waterIntake === choice}
                            className={cn(
                              "flex-1 py-2 rounded-xl border text-[10px] uppercase font-bold transition-all",
                              formData.waterIntake === choice 
                                ? "bg-brand-moss text-white" 
                                : "bg-brand-cream border-brand-sand text-brand-moss"
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">Activity Level</label>
                      <div className="flex gap-2">
                        {['Sedentary', 'Moderate', 'Active'].map(choice => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({...formData, activityLevel: choice as any})}
                            aria-pressed={formData.activityLevel === choice}
                            className={cn(
                              "flex-1 py-2 rounded-xl border text-[9px] uppercase font-bold transition-all",
                              formData.activityLevel === choice 
                                ? "bg-brand-moss text-white" 
                                : "bg-brand-cream border-brand-sand text-brand-moss"
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">Caffeine Intake</label>
                      <div className="flex gap-2">
                        {['None', 'Moderate', 'High'].map(choice => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({...formData, caffeineIntake: choice as any})}
                            aria-pressed={formData.caffeineIntake === choice}
                            className={cn(
                              "flex-1 py-2 rounded-xl border text-[9px] uppercase font-bold transition-all",
                              formData.caffeineIntake === choice 
                                ? "bg-brand-moss text-white" 
                                : "bg-brand-cream border-brand-sand text-brand-moss"
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic text-brand-terracotta">Dietary Profile (Select Patterns)</label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map(option => {
                        const isSelected = formData.dietaryProfile.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleDiet(option)}
                            aria-pressed={isSelected}
                            className={cn(
                              "px-4 py-2 rounded-full border text-[10px] uppercase font-bold transition-all",
                              isSelected 
                                ? "bg-brand-moss text-white border-brand-moss" 
                                : "bg-brand-cream border-brand-sand text-brand-moss hover:border-brand-moss"
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic text-brand-terracotta">Cortisol & Stress (1-10)</label>
                      <span className="text-xl font-serif italic text-brand-terracotta">{formData.stressLevel}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={formData.stressLevel}
                      onChange={e => setFormData({...formData, stressLevel: parseInt(e.target.value)})}
                      className="w-full accent-brand-terracotta bg-brand-sand h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-brand-slate italic">Your Intent</h2>
                  <p className="text-brand-moss/80 font-light">Aligning our clinical goals for your skin intelligence journey.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss italic">The Investment Path</label>
                    <div className="grid gap-2">
                      {[
                        { name: 'The Home Ritual', desc: 'A curated daily routine for independent care.' },
                        { name: 'The Signature Hybrid Flow', desc: 'Balancing home care with periodic professional updates.' },
                        { name: 'The Total Transformation', desc: 'Our most thorough protocol combining deep-dive clinical visits with rigorous home care.' }
                      ].map(option => (
                        <button
                          key={option.name}
                          type="button"
                          onClick={() => setFormData({...formData, investmentPreference: option.name as any})}
                          aria-pressed={formData.investmentPreference === option.name}
                          className={cn(
                            "w-full p-6 rounded-2xl border text-left transition-all flex justify-between items-center group",
                            formData.investmentPreference === option.name 
                              ? "bg-brand-slate text-white border-brand-slate shadow-lg" 
                              : "bg-brand-cream border-brand-sand text-brand-moss hover:border-brand-slate"
                          )}
                        >
                          <div className="space-y-1">
                            <span className="font-serif italic text-lg leading-none">{option.name}</span>
                            <p className={cn("text-[10px] font-light italic", formData.investmentPreference === option.name ? "text-brand-sand/80" : "text-brand-moss/60")}>
                              {option.desc}
                            </p>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0",
                            formData.investmentPreference === option.name ? "bg-brand-terracotta border-brand-terracotta" : "border-brand-sand"
                          )}>
                            {formData.investmentPreference === option.name && <Check size={12} className="text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">What is your primary intent for this partnership?</label>
                    <textarea 
                      value={formData.primaryIntent}
                      onChange={e => setFormData({...formData, primaryIntent: e.target.value})}
                      placeholder="e.g., Balancing hormonal sensitivity, establishing a rigorous clinical routine..."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Previous Professional Treatments</label>
                    <textarea 
                      value={formData.professionalHistory}
                      onChange={e => setFormData({...formData, professionalHistory: e.target.value})}
                      placeholder="e.g., Chemical peels, Microneedling, IPL, regular facials..."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-20 resize-none text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Current Product Protocol</label>
                    <textarea 
                      value={formData.currentRoutine}
                      onChange={e => setFormData({...formData, currentRoutine: e.target.value})}
                      placeholder="List your daily products..."
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-24 resize-none text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Additional Goals or Notes</label>
                    <textarea 
                      value={formData.goals}
                      onChange={e => setFormData({...formData, goals: e.target.value})}
                      placeholder="Any other details for our diagnostic deep-dive?"
                      className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-4 focus:border-brand-terracotta outline-none transition-colors h-16 resize-none text-sm"
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
          <span>Clinical Grade Assessment v1.0</span>
        </div>
      </div>
    </div>
  );
}
