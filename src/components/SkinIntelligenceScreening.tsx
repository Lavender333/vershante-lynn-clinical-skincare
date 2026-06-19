import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Calendar, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

type ScreeningStep = 'intro' | 'questions' | 'contact' | 'results';

const POCKETSUITE_BOOKING_URL = import.meta.env.VITE_POCKETSUITE_BOOKING_URL || 'https://pocketsuite.io/book/vershantelynn/items/skin-intelligence-assessment';
const isExternalBookingUrl = POCKETSUITE_BOOKING_URL.startsWith('http');
const imagePath = (fileName: string) => `${import.meta.env.BASE_URL}images/${fileName}`;

interface ScreeningAnswers {
  q1: string[];
  q2: string;
  q3: string;
  q4: string[];
  q5: string;
  q6: string[];
  firstName: string;
  email: string;
  phone: string;
}

export default function SkinIntelligenceScreening() {
  const [step, setStep] = useState<ScreeningStep>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<ScreeningAnswers>({
    q1: [],
    q2: '',
    q3: '',
    q4: [],
    q5: '',
    q6: [],
    firstName: '',
    email: '',
    phone: '',
  });

  const questions = [
    {
      id: 'q1',
      title: 'What are you currently noticing most about your skin?',
      subtitle: '(Select up to 2)',
      type: 'checkbox',
      options: [
        'Dark marks or uneven tone',
        'Sensitivity, irritation, or redness',
        'Skin that feels dull, tired, or changing',
        'Texture or roughness',
        'Breakouts or congestion',
        'Dryness or dehydration',
        'I\'m not sure, my skin just feels unbalanced',
      ],
    },
    {
      id: 'q2',
      title: 'How does your skin tend to behave?',
      type: 'radio',
      options: [
        'Reactive or easily irritated',
        'Uneven tone that lingers after irritation',
        'Dry, tight, or dehydrated',
        'Oily but still feels congested',
        'Looks tired, dull, or inflamed',
        'Changes depending on stress, hormones, or environment',
        'Generally stable, but not as healthy-looking as I\'d like',
      ],
    },
    {
      id: 'q3',
      title: 'Have you tried to improve these concerns before?',
      type: 'radio',
      options: [
        'Yes, multiple times without lasting results',
        'Yes, with temporary improvement',
        'I\'ve tried products, but not professionally',
        'No, I\'m just starting',
      ],
    },
    {
      id: 'q4',
      title: 'Have you noticed any patterns or possible triggers?',
      subtitle: '(Select all that apply)',
      type: 'checkbox',
      options: [
        'Hormonal changes',
        'Stress or lack of sleep',
        'Diet or digestion',
        'Product reactions or irritation',
        'Seasonal or environmental changes',
        'No clear pattern yet',
      ],
    },
    {
      id: 'q5',
      title: 'How does your skin usually respond to products or treatments?',
      type: 'radio',
      options: [
        'Burns, stings, or becomes irritated easily',
        'Breaks out or becomes congested quickly',
        'Takes time to react',
        'Improves temporarily, then declines again',
        'Usually tolerates products well',
      ],
    },
    {
      id: 'q6',
      title: 'What are you looking for right now?',
      subtitle: '(Select all that apply)',
      type: 'checkbox',
      options: [
        'Clear direction and a structured plan',
        'Professional treatments designed with intention',
        'Help choosing the right products',
        'Support for healthier-looking skin long term',
        'I\'m still exploring my options',
      ],
    },
  ];

  const handleCheckboxChange = (questionId: string, option: string) => {
    const key = questionId as keyof ScreeningAnswers;
    const current = answers[key] as string[];
    const maxSelections = questionId === 'q1' ? 2 : 999;

    if (current.includes(option)) {
      setAnswers({ ...answers, [key]: current.filter((item) => item !== option) });
    } else if (current.length < maxSelections) {
      setAnswers({ ...answers, [key]: [...current, option] });
    }
  };

  const handleRadioChange = (questionId: string, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleContactChange = (field: string, value: string) => {
    setAnswers({ ...answers, [field]: value });
  };

  const handleNextQuestion = () => {
    const question = questions[currentQuestion];
    const answer = answers[question.id as keyof ScreeningAnswers];

    if (question.type === 'checkbox' && Array.isArray(answer) && answer.length === 0) {
      toast.error('Select at least one response to continue');
      return;
    }
    if (question.type === 'radio' && answer === '') {
      toast.error('Select the response that best reflects your skin right now');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep('contact');
    }
  };

  const getAnswer = (questionId: string) => answers[questionId as keyof ScreeningAnswers];

  const getAnswerList = (questionId: string) => {
    const answer = getAnswer(questionId);
    return Array.isArray(answer) ? answer : answer ? [answer] : [];
  };

  const getConcernCategory = () => {
    const selected = getAnswerList('q1').join(' ').toLowerCase();
    if (selected.includes('dark') || selected.includes('tone')) return 'pigment';
    if (selected.includes('sensitivity') || selected.includes('irritation') || selected.includes('redness')) return 'sensitivity-barrier';
    if (selected.includes('dryness') || selected.includes('dehydration')) return 'dehydration-barrier';
    if (selected.includes('dull') || selected.includes('changing')) return 'aging-dullness';
    if (selected.includes('breakouts') || selected.includes('congestion')) return 'congestion';
    return 'skin-imbalance';
  };

  const handleContactSubmit = async () => {
    if (!answers.firstName || !answers.email) {
      toast.error('Add your first name and email to receive your overview');
      return;
    }

    setSubmitting(true);
    try {
      const screeningResponses = questions.map((question) => ({
        id: question.id,
        question: question.title,
        answer: getAnswer(question.id),
      }));

      const concerns = getAnswerList('q1');
      const triggerPatterns = getAnswerList('q4');
      const goals = getAnswerList('q6');
      const concernCategory = getConcernCategory();

      await addDoc(collection(db, 'assessments'), {
        fullName: answers.firstName.trim(),
        preferredName: answers.firstName.trim(),
        email: answers.email.trim(),
        phoneNumber: answers.phone.trim(),
        referralSource: 'Free Skin Intelligence Screening',
        age: '',
        concerns,
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
        goals: goals.join(', '),
        investmentPreference: 'Free Screening Follow-up',
        primaryIntent: goals.join(', ') || 'Free screening submission',
        clinicalFocus: [...new Set([...concerns, ...triggerPatterns])],
        screeningAnswers: screeningResponses,
        source: 'free-screening',
        concernCategory,
        crmTags: [
          'Skin Intelligence Screening',
          `Concern: ${concernCategory}`,
          ...concerns.map((concern) => `Concern: ${concern}`),
          ...triggerPatterns.map((trigger) => `Trigger: ${trigger}`),
        ],
        emailAutomation: {
          sequence: 'skin-intelligence-screening-overview',
          status: 'ready',
          submittedAt: serverTimestamp(),
        },
        bookingIntent: {
          service: 'Skin Intelligence Assessment',
          provider: isExternalBookingUrl ? 'PocketSuite' : 'Internal',
          url: POCKETSUITE_BOOKING_URL,
        },
        createdAt: serverTimestamp(),
        status: 'pending',
      });

      fetch('/api/admin-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Free Skin Intelligence Screening',
          name: answers.firstName.trim(),
          email: answers.email.trim(),
          phone: answers.phone.trim(),
          subject: 'New free screening submission',
          concerns,
          concernCategory,
          message: goals.join(', ') || 'Free screening submission',
          details: screeningResponses,
        }),
      }).catch((emailError) => {
        console.warn('Screening notification email could not be sent:', emailError);
      });

      setStep('results');
    } catch (error) {
      console.error('Free screening submission error:', error);
      toast.error('Screening not saved', {
        description: 'Please try again so your screening can be sent to the clinical dashboard.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-brand-cream pt-20 pb-20">
      {step === 'intro' && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-6 py-16"
        >
          <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 bg-brand-sand/50 px-4 py-2 rounded-full border border-brand-sand">
              <Brain size={16} className="text-brand-moss" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-moss">
                Your skin isn't misbehaving, it's communicating.
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif text-brand-slate italic leading-tight">
              Start Your Skin <br />
              <span className="text-brand-terracotta not-italic font-sans font-black uppercase tracking-tighter">
                Intelligence Screening™
              </span>
            </h1>

            <div className="space-y-6 max-w-2xl mx-auto">
              <p className="text-lg text-brand-moss/80 font-light leading-relaxed border-l-2 border-brand-terracotta pl-6 text-left">
                Your skin follows patterns and reflects underlying physiology. This guided screening is
                designed to identify how your skin may be functioning, what could be influencing
                imbalance, and where to begin with more intention and clarity.
              </p>

              <p className="text-base text-brand-moss/70 font-light leading-relaxed">
                Especially in melanin-rich skin, irritation and inflammation can leave behind longer-lasting
                changes that require a more thoughtful approach.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep('questions')}
              className="inline-flex items-center gap-3 bg-brand-moss text-white px-12 py-5 rounded-full text-sm uppercase tracking-widest font-bold hover:bg-brand-slate transition-all shadow-xl shadow-brand-moss/30"
            >
              Begin My Skin Screening
              <ArrowRight size={20} />
            </motion.button>

            <div className="pt-8">
              <Link to="/" className="inline-flex items-center gap-2 text-brand-moss hover:text-brand-slate transition-all">
                <ArrowLeft size={16} />
                Back to home
              </Link>
            </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-brand-sand bg-brand-sand/20">
                <img
                  src={imagePath('vershante-procell-treatment-room.jpg')}
                  alt="Vershanté Lynn performing a professional corrective skincare treatment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-5 right-5 bg-white/90 backdrop-blur border border-brand-sand rounded-2xl p-5 shadow-xl">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta mb-2">We don't guess. We assess.</p>
                <p className="text-sm text-brand-moss/70 font-light">A guided pre-assessment for melanin-rich skin behavior, triggers, and corrective direction.</p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {step === 'questions' && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-6 py-12"
        >
          <div className="space-y-12">
            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm uppercase tracking-widest font-bold text-brand-moss">
                  Skin Intelligence Step {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm text-brand-moss/60">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-1 bg-brand-sand/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                  className="h-full bg-brand-terracotta"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-serif text-brand-slate italic">
                  {question.title}
                </h2>
                <p className="text-sm text-brand-moss/60 font-light italic">
                  {question.subtitle || 'Choose the response that best reflects your current skin behavior.'}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {question.options.map((option) => {
                  const isSelected =
                    question.type === 'checkbox'
                      ? (answers[question.id as keyof ScreeningAnswers] as string[]).includes(option)
                      : answers[question.id as keyof ScreeningAnswers] === option;

                  return (
                    <motion.label
                      key={option}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-terracotta bg-brand-terracotta/5'
                          : 'border-brand-sand/30 hover:border-brand-sand/60 bg-white'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <input
                        type={question.type}
                        name={question.id}
                        value={option}
                        checked={isSelected}
                        onChange={() => {
                          if (question.type === 'checkbox') {
                            handleCheckboxChange(question.id, option);
                          } else {
                            handleRadioChange(question.id, option);
                          }
                        }}
                        className="w-5 h-5 accent-brand-terracotta cursor-pointer"
                      />
                      <span className="text-base text-brand-slate font-light">{option}</span>
                      {isSelected && (
                        <Check size={18} className="ml-auto text-brand-terracotta" />
                      )}
                    </motion.label>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 pt-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1);
                  } else {
                    setStep('intro');
                  }
                }}
                className="px-8 py-4 rounded-full border-2 border-brand-sand/50 text-brand-slate font-bold uppercase tracking-widest hover:border-brand-sand transition-all"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextQuestion}
                className="flex-1 px-8 py-4 rounded-full bg-brand-moss text-white font-bold uppercase tracking-widest hover:bg-brand-slate transition-all shadow-lg"
              >
                {currentQuestion === questions.length - 1 ? 'Continue to Contact' : 'Continue'}
              </motion.button>
            </div>
          </div>
        </motion.section>
      )}

      {step === 'contact' && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-6 py-12"
        >
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-serif text-brand-slate italic">
                Where should we send your Skin <br />
                <span className="text-brand-terracotta not-italic font-sans font-black uppercase tracking-tighter">
                  Intelligence Overview
                </span>
                ?
              </h2>
              <p className="text-base text-brand-moss/70 font-light">
                Your responses will be saved for clinical follow-up and used to prepare your Skin Intelligence pathway.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-brand-slate mb-3">
                  First Name *
                </label>
                <input
                  type="text"
                  value={answers.firstName}
                  onChange={(e) => handleContactChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-brand-sand/30 focus:border-brand-terracotta focus:outline-none bg-white text-brand-slate font-light transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-brand-slate mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={answers.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-brand-sand/30 focus:border-brand-terracotta focus:outline-none bg-white text-brand-slate font-light transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-brand-slate mb-3">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={answers.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-brand-sand/30 focus:border-brand-terracotta focus:outline-none bg-white text-brand-slate font-light transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContactSubmit}
              disabled={submitting}
              className="w-full px-12 py-5 rounded-full bg-brand-terracotta text-white font-bold uppercase tracking-widest hover:bg-brand-slate transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving Screening...' : 'View My Skin Intelligence Overview'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setCurrentQuestion(questions.length - 1)}
              className="w-full text-brand-moss font-light text-sm hover:text-brand-slate transition-all"
            >
              Back to screening
            </motion.button>
          </div>
        </motion.section>
      )}

      {step === 'results' && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto px-6 py-12"
        >
          <div className="space-y-16">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-serif text-brand-slate italic">
                Your Skin Intelligence <br />
                <span className="text-brand-terracotta not-italic font-sans font-black uppercase tracking-tighter">
                  Overview
                </span>
              </h1>
              <p className="text-lg text-brand-moss/80 font-light">
                {answers.firstName ? `Hello ${answers.firstName}, your responses suggest patterns in how your skin may be` : 'Your responses suggest patterns in how your skin may be'}
                functioning, responding, and adapting over time.
              </p>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-3xl p-8 md:p-12 space-y-8 border border-brand-sand/30">
              <h2 className="text-3xl font-serif text-brand-slate italic">Understanding Your Patterns</h2>

              <div className="space-y-6 text-brand-moss/80 font-light leading-relaxed">
                <p>
                  <span className="font-bold text-brand-slate">Surface symptoms rarely happen in isolation.</span> Discoloration,
                  sensitivity, congestion, dehydration, and inflammation are often connected to how the
                  skin is functioning overall — including barrier health, irritation levels, environmental
                  exposure, lifestyle patterns, and internal stress responses.
                </p>

                <div className="p-6 bg-brand-cream rounded-2xl border-l-4 border-brand-terracotta">
                  <p className="text-lg text-brand-slate font-serif italic">
                    "Your skin is constantly communicating."
                  </p>
                </div>

                <p>
                  This screening is the first step in understanding what your skin is trying to tell you.
                  The next level of clarity comes through a comprehensive, professional assessment where
                  we analyze your complete skin history, lifestyle patterns, and design a corrective
                  strategy uniquely suited to your needs.
                </p>
              </div>
            </div>

            {/* Next Step Section */}
            <div className="space-y-8">
              <h2 className="text-3xl font-serif text-brand-slate italic">
                Your Next Step: Skin Intelligence <br />
                <span className="text-brand-terracotta not-italic font-sans font-black uppercase tracking-tighter">
                  Assessment™
                </span>
              </h2>

              <p className="text-lg text-brand-moss/80 font-light leading-relaxed">
                This is where we move beyond the initial screening into a more detailed professional
                assessment and corrective strategy.
              </p>

              <div className="bg-brand-moss/5 rounded-3xl p-8 md:p-12 border border-brand-moss/20 space-y-8">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-brand-slate">
                  What's Included
                </h3>

                <ul className="space-y-4">
                  {[
                    '1:1 professional skin analysis',
                    'Review of skin history and contributing patterns',
                    'Assessment of triggers and skin behavior',
                    'Customized treatment recommendations',
                    'Product and routine guidance',
                    'A corrective strategy designed to support clearer, stronger, healthier-looking skin over time',
                  ].map((item) => (
                    <li key={item} className="flex gap-4 text-brand-moss/80 font-light">
                      <Check className="text-brand-terracotta flex-shrink-0 mt-1" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-6 space-y-4 border-t border-brand-moss/20">
                  <p className="text-sm text-brand-moss/70 font-light">
                    <span className="font-bold text-brand-slate">Book within 7 days</span> and receive a{' '}
                    <span className="font-bold text-brand-terracotta">$25 credit</span> toward your
                    future service or treatment plan.
                  </p>
                </div>
              </div>

              {isExternalBookingUrl ? (
                <a
                  href={POCKETSUITE_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 bg-brand-terracotta text-white px-10 py-5 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-brand-slate transition-all shadow-xl"
                >
                  Book Skin Intelligence Assessment™
                  <Calendar size={18} />
                </a>
              ) : (
                <Link
                  to={POCKETSUITE_BOOKING_URL}
                  className="inline-flex items-center gap-3 bg-brand-terracotta text-white px-10 py-5 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-brand-slate transition-all shadow-xl"
                >
                  Book Skin Intelligence Assessment™
                  <Calendar size={18} />
                </Link>
              )}

            </div>

            {/* Close */}
            <div className="text-center pt-12 border-t border-brand-sand/30">
              <p className="text-xl font-serif italic text-brand-slate leading-relaxed space-y-2">
                <span className="block">"We don't guess.</span>
                <span className="block font-bold">We assess, then support your skin with intention."</span>
              </p>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
