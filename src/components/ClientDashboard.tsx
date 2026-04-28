import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  User,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  FlaskConical, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  Users,
  LogOut,
  Sparkles,
  Video,
  Monitor,
  ExternalLink,
  ChevronLeft,
  CheckCircle2, 
  Activity, 
  Brain,
  ChevronRight,
  Bell,
  User as UserIcon,
  ShoppingBag,
  Edit2,
  Save,
  X,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { AssessmentData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface AssessmentRecord extends AssessmentData {
  id: string;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AssessmentRecord | null>(null);
  
  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Session Prep Modal
  const [showPrepModal, setShowPrepModal] = useState(false);

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'assessments'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AssessmentRecord[];
        setRecords(data);
        if (data.length > 0 && !selectedRecord) {
            setSelectedRecord(data[0]);
        }
      });
      return unsubscribe;
    }
  }, [user]);

  const formatAuthError = (error: any) => {
    if (error?.code === 'auth/unauthorized-domain') {
      const host = window.location.hostname;
      return `Google sign-in is not enabled for ${host}. Add this domain in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    }

    if (error?.code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was canceled before completion.';
    }

    return error?.message || 'Unable to sign in right now. Please try again.';
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setAuthError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setAuthError(formatAuthError(error));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      const msg = error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password'
        ? 'Incorrect email or password.'
        : error.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : error.code === 'auth/email-already-in-use'
        ? 'An account already exists with this email.'
        : formatAuthError(error);
      setAuthError(msg);
    }
  };

  const handleForgotPassword = async () => {
    setAuthError(null);
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setAuthError('Enter your email, then click Forgot password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      toast.success('Password reset email sent', {
        description: 'Check your inbox for a link to reset your password.'
      });
    } catch (error: any) {
      setAuthError(formatAuthError(error));
    }
  };

  const handleLogout = () => signOut(auth);
  
  const exportToCSV = () => {
    if (records.length === 0) return;
    
    // Define headers
    const headers = [
      'Record ID',
      'Date',
      'Age',
      'Concerns',
      'Clinical Focus',
      'Hormonal Stage',
      'Stress Level',
      'Sleep Quality',
      'Water Intake',
      'Activity Level',
      'Caffeine Intake',
      'Dietary Profile',
      'Investment Preference',
      'Primary Intent',
      'Clinical Analysis'
    ];
    
    // Map records to rows
    const rows = records.map(record => {
      const date = record.createdAt?.toDate ? format(record.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A';
      const concerns = (record.concerns || []).join('; ');
      const clinicalFocus = (record.clinicalFocus || []).join('; ');
      const diet = (record.dietaryProfile || []).join('; ');
      const analysis = record.clinicalInsights?.analysis?.replace(/"/g, '""') || '';
      
      return [
        record.id,
        date,
        record.age,
        `"${concerns}"`,
        `"${clinicalFocus}"`,
        record.hormonalStage,
        record.stressLevel,
        record.sleepQuality,
        record.waterIntake,
        record.activityLevel,
        record.caffeineIntake,
        `"${diet}"`,
        record.investmentPreference,
        `"${record.primaryIntent}"`,
        `"${analysis}"`
      ];
    });
    
    // Combine into CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `skin_intelligence_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Intelligence Exported", {
      description: "Diagnostic CSV data has been prepared and downloaded."
    });
  };

  const handleUpdateProfile = async () => {
    if (!user || !newDisplayName.trim()) return;
    setUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName: newDisplayName });
      setIsEditingProfile(false);
      toast.success("Identity Updated", {
        description: `Your clinical profile is now synchronized as ${newDisplayName}.`
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error("Identity Sync Failure", {
        description: "Unable to update profile name at this time."
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream p-6 pt-32">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 border border-brand-sand">
          <div className="w-16 h-16 bg-brand-moss/10 rounded-2xl flex items-center justify-center text-brand-moss mx-auto mb-8">
            <UserIcon size={32} />
          </div>
          <h1 className="text-3xl font-serif text-brand-slate italic mb-2 text-center">Intelligence Portal</h1>
          <p className="text-brand-moss/60 font-light mb-8 italic text-center text-sm leading-relaxed">
            "Access your skin intelligence records, consultation details, and clinical progress logs."
          </p>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold text-brand-moss pl-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-brand-cream border border-brand-sand rounded-full px-6 py-3 text-sm outline-none focus:border-brand-terracotta transition-colors"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold text-brand-moss pl-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-cream border border-brand-sand rounded-full px-6 py-3 text-sm outline-none focus:border-brand-terracotta transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-moss/40 hover:text-brand-moss"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="mt-2 text-[10px] font-bold uppercase tracking-widest text-brand-terracotta hover:text-brand-moss transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {authError && (
              <p className="text-[10px] text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-100 italic">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-moss text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-slate transition-all shadow-lg"
            >
              {authMode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-sand"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="px-4 bg-white text-brand-sand">or</span></div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-white border border-brand-sand text-brand-moss py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-cream transition-all flex items-center justify-center gap-2"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-[10px] text-brand-moss/40">
            {authMode === 'login' ? (
              <>New here? <button onClick={() => { setAuthMode('register'); setAuthError(null); }} className="text-brand-terracotta font-bold underline">Create an account</button></>
            ) : (
              <>Already registered? <button onClick={() => { setAuthMode('login'); setAuthError(null); }} className="text-brand-terracotta font-bold underline">Log in here</button></>
            )}
          </p>
        </div>
      </div>
    );
  }

  const upcomingConsultation = records.find(r => r.status === 'scheduled');
  const completedRecords = records
    .filter(r => r.status === 'completed' || !!r.clinicalResponse) // Assuming completed or having a response means it's part of the progress
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateA.getTime() - dateB.getTime();
    });

  const chartData = completedRecords.map(r => ({
    date: r.createdAt?.toDate ? format(r.createdAt.toDate(), 'MMM d') : 'Recent',
    stress: r.stressLevel,
    sleep: r.sleepQuality === 'Excellent' ? 3 : r.sleepQuality === 'Average' ? 2 : 1,
  }));

  return (
    <div className="min-h-screen bg-[#FDFCF9] pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">Patient Intelligence Portal</span>
                <span className="h-[1px] w-12 bg-brand-sand"></span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-brand-slate italic">Welcome back, {user.displayName?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-brand-slate">{user.email}</p>
                  <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta hover:text-brand-moss transition-colors">Sign Out</button>
              </div>
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-12 h-12 rounded-full border-2 border-brand-sand shadow-sm" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Section */}
            <section className="bg-white rounded-[2.5rem] border border-brand-sand p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-moss flex items-center gap-3">
                        <UserIcon size={14} />
                        Intelligence Identity
                    </h3>
                    {!isEditingProfile ? (
                        <button 
                            onClick={() => {
                                setNewDisplayName(user.displayName || '');
                                setIsEditingProfile(true);
                            }}
                            className="text-brand-moss/40 hover:text-brand-terracotta transition-colors"
                            aria-label="Edit intelligence identity"
                        >
                            <Edit2 size={16} />
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={handleUpdateProfile}
                                disabled={updatingProfile}
                                className="text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                                aria-label="Save profile changes"
                            >
                                <Save size={16} />
                            </button>
                            <button 
                                onClick={() => setIsEditingProfile(false)}
                                className="text-brand-terracotta hover:text-red-500 transition-colors"
                                aria-label="Cancel profile editing"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-8">
                    <div className="relative group">
                        <img 
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=EBE4D5&color=4A5D4E`} 
                            alt={user.displayName || ''} 
                            className="w-24 h-24 rounded-[2rem] border-4 border-brand-cream shadow-md object-cover" 
                        />
                        <div className="absolute inset-0 bg-brand-moss/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold uppercase tracking-widest">Managed via Google</span>
                        </div>
                    </div>
                    
                    <div className="flex-grow space-y-4">
                        <div>
                            <p className="text-[8px] uppercase tracking-widest text-brand-moss/40 font-bold mb-1">Full Clinical Name</p>
                            {isEditingProfile ? (
                                <input 
                                    type="text"
                                    value={newDisplayName}
                                    onChange={(e) => setNewDisplayName(e.target.value)}
                                    className="w-full bg-brand-cream/50 border border-brand-sand rounded-xl px-4 py-2 text-sm font-serif italic text-brand-slate outline-none focus:border-brand-terracotta transition-all"
                                    placeholder="Enter display name"
                                    autoFocus
                                />
                            ) : (
                                <p className="text-2xl font-serif text-brand-slate italic">{user.displayName || 'Unnamed Intelligence'}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-[8px] uppercase tracking-widest text-brand-moss/40 font-bold mb-1">Authenticated Identifier</p>
                            <p className="text-sm font-light text-brand-moss/60 italic">{user.email}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Consultation Alert */}
            {upcomingConsultation && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-slate text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Calendar size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-brand-terracotta px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                <Bell size={12} className="animate-pulse" />
                                Upcoming Consultation
                            </div>
                            <div>
                                <p className="text-3xl font-serif italic text-brand-sand">
                                  {upcomingConsultation.consultationSlot?.date
                                    ? new Date(upcomingConsultation.consultationSlot.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                    : ''}
                                </p>
                                <p className="text-sm font-light text-brand-cream/80 italic mt-1">
                                    {upcomingConsultation.consultationSlot?.time} — {upcomingConsultation.consultationSlot?.type} Synchronized Session
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                              if (upcomingConsultation.consultationSlot?.type === 'Virtual') {
                                const meetingId = upcomingConsultation.meetingId || `vershante-lynn-${upcomingConsultation.id.slice(0, 8)}`;
                                window.open(`https://meet.jit.si/${meetingId}`, '_blank');
                              } else {
                                setShowPrepModal(true);
                              }
                            }}
                            className="bg-brand-cream text-brand-slate px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-terracotta hover:text-white transition-all shadow-lg">
                            {upcomingConsultation.consultationSlot?.type === 'Virtual' ? 'Join Video Session' : 'Prepare for Session'}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Progress Section */}
            {completedRecords.length > 1 && (
                <section className="bg-white rounded-[2.5rem] border border-brand-sand p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-moss flex items-center gap-3">
                                <Activity size={14} />
                                Clinical Progress Intelligence
                            </h3>
                            <p className="text-xs text-brand-moss/60 italic mt-1">Visualizing your diagnostic trajectory over time.</p>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE4D5" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#A89F91', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#A89F91', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#FFFFFF', 
                                        borderRadius: '16px', 
                                        border: '1px solid #EBE4D5',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    align="right" 
                                    iconType="circle"
                                    wrapperStyle={{ 
                                        paddingBottom: '20px',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}
                                />
                                <Line 
                                    name="Stress Level" 
                                    type="monotone" 
                                    dataKey="stress" 
                                    stroke="#D4735B" 
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#D4735B', strokeWidth: 2, stroke: '#FFFFFF' }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line 
                                    name="Sleep Quality" 
                                    type="monotone" 
                                    dataKey="sleep" 
                                    stroke="#4A5D4E" 
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#4A5D4E', strokeWidth: 2, stroke: '#FFFFFF' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-brand-sand">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-terracotta"></div>
                            <p className="text-[10px] text-brand-moss/60 font-medium">Stress optimization target: &lt; 3</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-moss"></div>
                            <p className="text-[10px] text-brand-moss/60 font-medium">Sleep intelligence target: Excellent (3)</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Assessment History */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-moss flex items-center gap-3">
                        <History size={14} />
                        Assessment Intelligence History
                    </h3>
                    {records.length > 0 && (
                        <button 
                            onClick={exportToCSV}
                            aria-label="Export assessment intelligence history as CSV"
                            className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] font-bold text-brand-moss/60 hover:text-brand-terracotta transition-colors px-3 py-1.5 rounded-full border border-brand-sand bg-white shadow-sm"
                        >
                            <Download size={12} />
                            Export CSV
                        </button>
                    )}
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                    {records.map((record) => (
                        <div 
                            key={record.id}
                            onClick={() => setSelectedRecord(record)}
                            role="button"
                            tabIndex={0}
                            aria-selected={selectedRecord?.id === record.id}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setSelectedRecord(record);
                                }
                            }}
                            className={cn(
                                "p-6 rounded-[2rem] border transition-all cursor-pointer group",
                                selectedRecord?.id === record.id 
                                ? "bg-white border-brand-terracotta shadow-xl" 
                                : "bg-white border-brand-sand hover:border-brand-moss/30"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    selectedRecord?.id === record.id ? "bg-brand-terracotta text-white" : "bg-brand-sand/30 text-brand-moss group-hover:bg-brand-moss group-hover:text-white"
                                )}>
                                    <FlaskConical size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-brand-sand uppercase tracking-widest">
                                    {record.createdAt?.toDate ? format(record.createdAt.toDate(), 'MMM d, yyyy') : 'Recently Added'}
                                </span>
                            </div>
                            <h4 className="text-xl font-serif italic text-brand-slate mb-2">Protocol Log #{record.id.slice(-4).toUpperCase()}</h4>
                            <div className="flex gap-2 flex-wrap">
                                {record.clinicalFocus.slice(0, 2).map((focus, i) => (
                                    <span key={i} className="text-[8px] uppercase font-bold tracking-widest border border-brand-sand px-2 py-0.5 rounded text-brand-moss/60">
                                        {focus}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {records.length === 0 && (
                        <div className="sm:col-span-2 py-12 text-center bg-brand-sand/10 rounded-[2rem] border border-dashed border-brand-sand">
                            <p className="text-brand-moss/40 italic font-light">No intelligence records found on this account.</p>
                            <Link to="/assessment" className="text-brand-terracotta font-bold uppercase tracking-widest text-[10px] mt-4 inline-block hover:underline">Start Assessment</Link>
                        </div>
                    )}
                </div>
            </section>
          </div>

          {/* Sidebar / Detailed View */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
                {selectedRecord ? (
                    <motion.div 
                        key={selectedRecord.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-[2.5rem] border border-brand-sand p-8 shadow-2xl sticky top-32"
                    >
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-brand-sand/50">
                            <div className="w-12 h-12 bg-brand-moss rounded-2xl flex items-center justify-center text-white">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif text-brand-slate italic h-6">Intelligence Recap</h3>
                                <p className="text-[9px] uppercase tracking-widest text-brand-moss/40 font-bold">Clinical Analysis</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {selectedRecord.clinicalResponse && (
                                <div className="bg-brand-moss text-white p-6 rounded-2xl shadow-lg border border-brand-moss/20 ring-4 ring-brand-moss/5 section-pulse">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Bell size={14} className="text-brand-terracotta" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-cream">Professional Intelligence Directive</span>
                                    </div>
                                    <p className="text-sm font-light italic leading-relaxed text-brand-cream/90">
                                        "{selectedRecord.clinicalResponse}"
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-brand-terracotta">
                                    <Sparkles size={14} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Digital Diagnostic</span>
                                </div>

                                {/* Confidence Score */}
                                {selectedRecord.clinicalInsights?.confidenceScore != null && (
                                    <div className="flex items-center justify-between bg-brand-moss/5 border border-brand-moss/10 rounded-xl px-4 py-2.5">
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-brand-moss/60">Alignment Score</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-brand-sand rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-terracotta rounded-full" style={{ width: `${selectedRecord.clinicalInsights.confidenceScore}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-brand-terracotta">{selectedRecord.clinicalInsights.confidenceScore}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* Analysis */}
                                <div className="bg-brand-sand/10 rounded-2xl border border-brand-sand/50 p-4">
                                    <p className="text-[9px] uppercase font-bold tracking-widest text-brand-moss/50 mb-2">Skin Analysis</p>
                                    <p className="text-sm leading-relaxed text-brand-slate">
                                        {selectedRecord.clinicalInsights?.analysis}
                                    </p>
                                </div>

                                {/* Solutions */}
                                {(selectedRecord.clinicalInsights?.solutions?.length ?? 0) > 0 && (
                                    <div className="bg-white rounded-2xl border border-brand-sand/50 p-4">
                                        <p className="text-[9px] uppercase font-bold tracking-widest text-brand-moss/50 mb-3">Recommended Actions</p>
                                        <ol className="space-y-2">
                                            {selectedRecord.clinicalInsights!.solutions.map((s, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-brand-slate">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-terracotta/10 text-brand-terracotta text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                                                    {s}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>

                            {selectedRecord.consultationSlot && (
                                <div className="bg-brand-terracotta text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                                    <div className="flex-grow">
                                        <p className="text-[9px] uppercase font-bold tracking-widest text-brand-cream/60 mb-1">Clinical Synchronization</p>
                                        <p className="text-sm font-bold truncate pr-4">{selectedRecord.consultationSlot.date} @ {selectedRecord.consultationSlot.time}</p>
                                        <p className="text-[10px] italic opacity-80">{selectedRecord.consultationSlot.type}</p>
                                    </div>
                                    {selectedRecord.consultationSlot.type === 'Virtual' && (
                                        <button 
                                            onClick={() => {
                                                const meetingId = selectedRecord.meetingId || `vershante-lynn-${selectedRecord.id.slice(0, 8)}`;
                                                window.open(`https://meet.jit.si/${meetingId}`, '_blank');
                                            }}
                                            className="bg-white text-brand-terracotta p-3 rounded-xl hover:bg-brand-cream transition-all shadow-md active:scale-95 flex-shrink-0"
                                            title="Join Video Consultation"
                                        >
                                            <Video size={20} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Recommended Actives</h4>
                                <div className="flex flex-wrap gap-2 text-white">
                                    {selectedRecord.clinicalInsights?.recommendedProducts.map((p, i) => (
                                        <span key={i} className="text-[9px] font-bold uppercase tracking-widest bg-brand-moss/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                                            <ShoppingBag size={10} /> {p}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Actionable Data</h4>
                                <div className="bg-brand-cream/50 border border-brand-sand rounded-2xl p-4 gap-4 grid grid-cols-2">
                                    <div>
                                        <p className="text-[8px] uppercase text-brand-sand font-bold tracking-widest mb-1">Stress Factor</p>
                                        <p className="text-sm font-bold text-brand-slate">{selectedRecord.stressLevel}/10</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] uppercase text-brand-sand font-bold tracking-widest mb-1">Biological Stage</p>
                                        <p className="text-sm font-bold text-brand-slate">{selectedRecord.hormonalStage}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedRecord.professionalNotes && (
                                <div className="pt-6 border-t border-brand-sand/50">
                                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta mb-2">Clinician Notes</h4>
                                    <p className="text-xs font-light text-brand-moss italic bg-brand-terracotta/5 p-4 rounded-xl border-l-2 border-brand-terracotta">
                                        {selectedRecord.professionalNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-brand-sand/10 rounded-[2.5rem] border border-dashed border-brand-sand border-brand-sand text-brand-moss/40 italic">
                        <Activity size={40} className="mb-4 opacity-20" />
                        <p>Select a protocol log to view detailed intelligence analysis.</p>
                    </div>
                )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Session Prep Modal */}
      {showPrepModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPrepModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="bg-brand-cream rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta mb-1">Session Preparation</p>
                <h2 className="text-2xl font-serif italic text-brand-slate">Getting Ready</h2>
              </div>
              <button
                onClick={() => setShowPrepModal(false)}
                className="p-2 hover:bg-brand-sand/40 rounded-full text-brand-moss transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { icon: '🧴', title: 'Come with a clean face', desc: 'Remove all makeup and skincare products before your session.' },
                { icon: '💧', title: 'Stay hydrated', desc: 'Drink water the morning of your appointment for accurate skin readings.' },
                { icon: '📋', title: 'List your current products', desc: 'Bring or note all products currently in your skincare routine.' },
                { icon: '📸', title: 'Take a before photo', desc: 'Capture your skin in natural light for your personal records.' },
                { icon: '📝', title: 'Note any changes', desc: 'Think about any skin changes or concerns since your last assessment.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-brand-sand">
                  <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-brand-slate">{item.title}</p>
                    <p className="text-xs text-brand-moss/60 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-brand-slate text-white rounded-2xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta mb-1">Your Appointment</p>
              <p className="text-lg font-serif italic">
                {upcomingConsultation?.consultationSlot?.date
                  ? new Date(upcomingConsultation.consultationSlot.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : ''}
              </p>
              <p className="text-sm text-white/60 mt-1">
                {upcomingConsultation?.consultationSlot?.time} — {upcomingConsultation?.consultationSlot?.type} Session
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function History(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
