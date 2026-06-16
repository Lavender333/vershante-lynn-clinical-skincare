import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc,
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  FlaskConical, 
  Calendar, 
  User as UserIcon, 
  Mail, 
  Activity, 
  Trash2, 
  ChevronRight, 
  Lock,
  Users,
  LogOut,
  Sparkles,
  Clock,
  ArrowUpRight,
  Eye,
  EyeOff,
  Edit2,
  Bell,
  Save,
  X,
  Search,
  MessageSquare,
  Settings,
  Video,
  Monitor,
  ExternalLink,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { AssessmentData, EventPost, OperatingHours } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import BookingCalendar from './BookingCalendar';

interface AssessmentRecord extends AssessmentData {
  id: string;
  createdAt: any;
  source?: string;
  screeningAnswers?: {
    id: string;
    question: string;
    answer: string | string[];
  }[];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [events, setEvents] = useState<EventPost[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AssessmentRecord | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdminState, setIsAdminState] = useState(false);
  const [activeTab, setActiveTab] = useState<'assessments' | 'events' | 'team' | 'settings'>('assessments');
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'calendar'>('list');
  const [adminsList, setAdminsList] = useState<{id: string, email: string}[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'professional' | 'specialist'>('admin');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventForm, setEventForm] = useState<EventPost>({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    imageUrl: ''
  });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventSaving, setEventSaving] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [editSlot, setEditSlot] = useState({ date: '', time: '', type: 'Virtual' });
  const [editVitals, setEditVitals] = useState({ age: '', stage: '', stress: 5, sleep: '' });
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [notifying, setNotifying] = useState(false);

  // Expanded Editing
  const [isEditingInsights, setIsEditingInsights] = useState(false);
  const [editInsights, setEditInsights] = useState({
    analysis: '',
    solutions: [] as string[],
    recommendedProducts: [] as string[]
  });
  const [editNotes, setEditNotes] = useState('');
  const [editResponse, setEditResponse] = useState('');

  const adminEmail = 'antoinetteqwilliams@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Double check against admins collection or hardcoded super admin
        const isSuper = u.email?.toLowerCase().trim() === adminEmail;
        setIsAdminState(isSuper);
        
        if (isSuper) {
          console.log("Super Admin detected via Dashboard");
        }
        
        if (!isSuper && u.email) {
          // Check collection if not super
          try {
            const { getDoc, doc } = await import('firebase/firestore');
            const adminDoc = await getDoc(doc(db, 'admins', u.email.toLowerCase().trim()));
            if (adminDoc.exists()) {
              setIsAdminState(true);
            }
          } catch (err) {
            console.error("Dashboard admin check failed", err);
          }
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && isAdminState) {
      const q = query(collection(db, 'assessments'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AssessmentRecord[];
        setRecords(data);
      });
      return unsubscribe;
    }
  }, [user, isAdminState]);

  useEffect(() => {
    if (user && isAdminState && activeTab === 'team') {
      const q = query(collection(db, 'admins'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
          role: doc.data().role || 'admin'
        }));
        setAdminsList(data);
      });
      return unsubscribe;
    }
  }, [user, isAdminState, activeTab]);

  useEffect(() => {
    if (user && isAdminState) {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as EventPost[];
        setEvents(data);
      });
      return unsubscribe;
    }
  }, [user, isAdminState]);

  useEffect(() => {
    if (user && isAdminState) {
      const unsubscribe = onSnapshot(doc(db, 'settings', 'operatingHours'), (snapshot) => {
        if (snapshot.exists()) {
          setOperatingHours({ id: snapshot.id, ...snapshot.data() } as OperatingHours);
        } else {
          // Initialize default hours if none exist
          const defaults = {
            days: {
              'Monday': { open: '09:00', close: '17:00', closed: false },
              'Tuesday': { open: '09:00', close: '17:00', closed: false },
              'Wednesday': { open: '09:00', close: '17:00', closed: false },
              'Thursday': { open: '09:00', close: '17:00', closed: false },
              'Friday': { open: '09:00', close: '17:00', closed: false },
              'Saturday': { open: '10:00', close: '14:00', closed: false },
              'Sunday': { open: '00:00', close: '00:00', closed: true },
            }
          };
          setDoc(doc(db, 'settings', 'operatingHours'), defaults);
        }
      });
      return unsubscribe;
    }
  }, [user, isAdminState]);

  const addAdmin = async () => {
    if (!newAdminEmail) return;
    const email = newAdminEmail.toLowerCase().trim();
    setIsAddingAdmin(true);
    try {
      // Use email directly as ID
      await setDoc(doc(db, 'admins', email), {
        email: email,
        role: newAdminRole,
        addedAt: serverTimestamp()
      });
      // Send invite email notification
      try {
        await fetch('/api/send-admin-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: newAdminRole })
        });
      } catch (emailErr) {
        console.warn('Admin invite email could not be sent:', emailErr);
      }
      toast.success('Admin Access Granted', {
        description: `An invitation email has been sent to ${email}.`
      });
      setNewAdminEmail('');
      setNewAdminRole('admin');
    } catch (e) {
      console.error(e);
      toast.error("Promotion Protocol Failed", {
        description: "Error promoting user. Ensure you have clinical authority."
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const updateAdminRole = async (id: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'admins', id), {
        role: newRole
      });
      setEditingAdminId(null);
    } catch (e) {
      console.error("Error updating role:", e);
      toast.error("Role Update Failed", {
        description: "Unable to update the clinical role for this account."
      });
    }
  };

  const removeAdmin = async (id: string, emailStr: string) => {
    if (emailStr === adminEmail) {
      toast.error("Hierarchy Protection", {
        description: "The Super Administrator cannot be demoted."
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to demote ${emailStr}? They will lose clinical dashboard access.`)) {
      try {
        await deleteDoc(doc(db, 'admins', id));
      } catch (e) {
        console.error("Error removing admin:", e);
      }
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      imageUrl: ''
    });
    setEditingEventId(null);
  };

  const handleEditEvent = (event: EventPost) => {
    setEventForm({
      title: event.title || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      description: event.description || '',
      imageUrl: event.imageUrl || ''
    });
    setEditingEventId(event.id || null);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.location || !eventForm.description) {
      toast.error('Event needs a little more detail', {
        description: 'Add a title, date, time, location, and short description.'
      });
      return;
    }

    setEventSaving(true);
    try {
      const payload = {
        title: eventForm.title.trim(),
        date: eventForm.date,
        time: eventForm.time.trim(),
        location: eventForm.location.trim(),
        description: eventForm.description.trim(),
        imageUrl: eventForm.imageUrl?.trim() || '',
        updatedAt: serverTimestamp()
      };

      if (editingEventId) {
        await updateDoc(doc(db, 'events', editingEventId), payload);
        toast.success('Event updated');
      } else {
        await addDoc(collection(db, 'events'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        toast.success('Event posted to homepage');
      }

      resetEventForm();
    } catch (error) {
      console.error('Failed to save event', error);
      toast.error('Event save failed', {
        description: 'Please try again from the admin dashboard.'
      });
    } finally {
      setEventSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId?: string) => {
    if (!eventId) return;
    if (!window.confirm('Delete this homepage event?')) return;

    try {
      await deleteDoc(doc(db, 'events', eventId));
      if (editingEventId === eventId) resetEventForm();
      toast.success('Event removed');
    } catch (error) {
      console.error('Failed to delete event', error);
      toast.error('Unable to remove event');
    }
  };

  // Sync editSlot when a record is selected
  useEffect(() => {
    if (selectedRecord?.consultationSlot) {
      setEditSlot({
        date: selectedRecord.consultationSlot.date,
        time: selectedRecord.consultationSlot.time,
        type: selectedRecord.consultationSlot.type
      });
    } else {
      setEditSlot({ date: '', time: '', type: 'Virtual' });
    }

    if (selectedRecord) {
      setEditVitals({
        age: selectedRecord.age || '',
        stage: selectedRecord.hormonalStage || '',
        stress: selectedRecord.stressLevel || 5,
        sleep: selectedRecord.sleepQuality || ''
      });
      setEditInsights({
        analysis: selectedRecord.clinicalInsights?.analysis || '',
        solutions: selectedRecord.clinicalInsights?.solutions || [],
        recommendedProducts: selectedRecord.clinicalInsights?.recommendedProducts || []
      });
      setEditNotes(selectedRecord.professionalNotes || '');
      setEditResponse(selectedRecord.clinicalResponse || '');
    }

    setIsEditing(false);
    setIsEditingVitals(false);
    setIsEditingInsights(false);
  }, [selectedRecord]);

  const formatAuthError = (error: any) => {
    if (error?.code === 'auth/unauthorized-domain') {
      const host = window.location.hostname;
      return `Google sign-in is not enabled for ${host}. Add this domain in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    }

    if (error?.code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was canceled before completion.';
    }

    if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
      return 'Incorrect email or password.';
    }

    if (error?.code === 'auth/user-not-found') {
      return 'No account found with this email.';
    }

    return error?.message || 'Unable to sign in right now. Please try again.';
  };

  const handleGoogleLogin = async () => {
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
      setAuthError(formatAuthError(error));
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this clinical record?")) {
      await deleteDoc(doc(db, 'assessments', id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  };

  const handleSaveVitals = async () => {
    if (!selectedRecord) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'assessments', selectedRecord.id), {
        age: editVitals.age,
        hormonalStage: editVitals.stage,
        stressLevel: editVitals.stress,
        sleepQuality: editVitals.sleep
      });
      
      const updated = {
        ...selectedRecord, 
        age: editVitals.age,
        hormonalStage: editVitals.stage,
        stressLevel: editVitals.stress,
        sleepQuality: editVitals.sleep
      };
      setSelectedRecord(updated);
      setIsEditingVitals(false);

      toast.success("Vitals Synchronized", {
        description: `Clinical vitals updated for ${selectedRecord.fullName}.`
      });
    } catch (error) {
      console.error("Failed to update vitals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'assessments', selectedRecord.id), {
        consultationSlot: editSlot,
        status: 'scheduled'
      });
      
      const updated = {
        ...selectedRecord, 
        consultationSlot: editSlot, 
        status: 'scheduled'
      };
      setSelectedRecord(updated);
      setIsEditing(false);

      toast.success("Protocol Updated", {
        description: `Clinical record updated. Local notification triggered for ${selectedRecord.email}.`
      });
    } catch (error) {
      console.error("Failed to update appointment", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (slot: any) => {
    if (!selectedRecord) return;
    setLoading(true);
    setNotifying(true);
    try {
      const newSlot = {
        date: slot.date,
        time: slot.time,
        type: slot.type
      };
      await updateDoc(doc(db, 'assessments', selectedRecord.id), {
        consultationSlot: newSlot,
        status: 'scheduled'
      });
      
      const updated = {
        ...selectedRecord,
        consultationSlot: newSlot,
        status: 'scheduled'
      };
      setSelectedRecord(updated);
      
      // Trigger actual email notification
      try {
        await fetch('/api/send-appointment-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: selectedRecord.email,
            fullName: selectedRecord.fullName,
            bookingDetails: newSlot,
            type: 'update'
          })
        });
        console.log("Clinical update protocol dispatched successfully.");
      } catch (emailErr) {
        console.error("Communication failure at gateway:", emailErr);
      }
      
      setNotifying(false);
      setIsRescheduling(false);
      
    } catch (e) {
      console.error(e);
      toast.error("Intelligence Sync Failure", {
        description: "Unable to complete the rescheduling protocol."
      });
      setNotifying(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInsights = async () => {
    if (!selectedRecord) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'assessments', selectedRecord.id), {
        clinicalInsights: editInsights,
        professionalNotes: editNotes,
        clinicalResponse: editResponse
      });
      setSelectedRecord({
        ...selectedRecord, 
        clinicalInsights: editInsights, 
        professionalNotes: editNotes,
        clinicalResponse: editResponse
      });
      setIsEditingInsights(false);
    } catch (error) {
      console.error("Failed to update insights", error);
    } finally {
      setLoading(false);
    }
  };
  const sendManualReminder = async () => {
    if (!selectedRecord || !selectedRecord.consultationSlot) return;
    setNotifying(true);
    try {
      await fetch('/api/send-appointment-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedRecord.email,
          fullName: selectedRecord.fullName,
          bookingDetails: selectedRecord.consultationSlot,
          type: 'reminder'
        })
      });
      toast.success("Reminder Dispatched", {
        description: `Clinical reminder successfully sent to ${selectedRecord.email}.`
      });
    } catch (error) {
      console.error("Reminder failed", error);
    } finally {
      setNotifying(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!user || !isAdminState) {
    if (!loading && user && !isAdminState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream p-6 pt-32">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 border border-brand-sand text-center">
                    <Lock size={48} className="text-brand-terracotta mx-auto mb-6" />
                    <h1 className="text-2xl font-serif italic mb-4">Unauthorized</h1>
                    <p className="text-sm text-brand-moss/60 mb-8">This account does not have professional credentials for clinical log access.</p>
                    <button onClick={handleLogout} className="w-full bg-brand-moss text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs">Sign Out</button>
                </div>
            </div>
        );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 border border-brand-sand">
          <div className="w-16 h-16 bg-brand-moss/10 rounded-2xl flex items-center justify-center text-brand-moss mx-auto mb-8">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-serif text-brand-slate italic mb-2 text-center">Clinical Access</h1>
          <p className="text-brand-moss/60 font-light mb-8 italic text-center text-sm">
            "Authorized intelligence portal for behavioral record tracking."
          </p>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
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
                Error: {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-moss text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-slate transition-all shadow-lg"
            >
              {authMode === 'login' ? 'Log In' : 'Create Admin Account'}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-sand"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="px-4 bg-white text-brand-sand">or clinically link</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-brand-sand text-brand-moss py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-cream transition-all flex items-center justify-center gap-2"
          >
            Authenticate with Google
          </button>

          <p className="mt-8 text-center text-[10px] text-brand-moss/40">
            {authMode === 'login' ? (
              <>First time? <button onClick={() => setAuthMode('register')} className="text-brand-terracotta font-bold underline">Set up your account</button></>
            ) : (
              <>Already registered? <button onClick={() => setAuthMode('login')} className="text-brand-terracotta font-bold underline">Log in here</button></>
            )}
          </p>
        </div>
      </div>
    );
  }

  const filteredRecords = records.filter(record => 
    (record.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-brand-slate text-white p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-terracotta rounded-xl flex items-center justify-center">
            <FlaskConical size={20} />
          </div>
          <div>
            <h2 className="font-serif italic text-lg leading-none">Intelligence</h2>
            <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold">Dashboard v1.0</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Authenticated Professional</p>
            <p className="text-sm font-medium truncate">{user.displayName}</p>
            <p className="text-[10px] text-brand-terracotta">{user.email}</p>
          </div>

          <div className="space-y-1 mb-8">
              <button 
                onClick={() => setActiveTab('assessments')}
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest",
                    activeTab === 'assessments' ? "bg-white/10 text-brand-terracotta" : "text-white/60 hover:bg-white/5"
                )}
              >
                  <FlaskConical size={14} />
                  Submissions
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest",
                    activeTab === 'events' ? "bg-white/10 text-brand-terracotta" : "text-white/60 hover:bg-white/5"
                )}
              >
                  <Calendar size={14} />
                  Events
              </button>
              <button 
                onClick={() => setActiveTab('team')}
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest",
                    activeTab === 'team' ? "bg-white/10 text-brand-terracotta" : "text-white/60 hover:bg-white/5"
                )}
              >
                  <Users size={14} />
                  Clinical Team
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest",
                    activeTab === 'settings' ? "bg-white/10 text-brand-terracotta" : "text-white/60 hover:bg-white/5"
                )}
              >
                  <Settings size={14} />
                  Clinical Settings
              </button>
          </div>

          <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4 px-4">Metric Overview</div>
          <div className="grid grid-cols-2 gap-2 px-2">
            <div className="bg-white/5 p-4 rounded-2xl text-center">
              <p className="text-2xl font-serif italic text-brand-terracotta">{records.length}</p>
              <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/40">Total Logs</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-center">
              <p className="text-2xl font-serif italic text-brand-terracotta">
                {records.filter(r => r.status === 'scheduled').length}
              </p>
              <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/40">Scheduled</p>
            </div>
          </div>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/60 hover:text-brand-terracotta transition-colors px-4 py-8 border-t border-white/10"
        >
          <LogOut size={16} />
          Terminate Session
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-h-screen">
        {activeTab === 'assessments' ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h1 className="text-4xl font-serif text-brand-slate italic mb-2">Clinical Submissions</h1>
                <p className="text-brand-moss/60 font-light italic">Recent activity from your skin intelligence portal.</p>
                <div className="flex items-center gap-4 mt-6">
                  <button 
                    onClick={() => setActiveSubTab('list')}
                    className={cn(
                      "text-[10px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-all",
                      activeSubTab === 'list' ? "border-brand-terracotta text-brand-slate" : "border-transparent text-brand-sand hover:text-brand-moss"
                    )}
                  >
                    Intelligence List
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('calendar')}
                    className={cn(
                      "text-[10px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-all",
                      activeSubTab === 'calendar' ? "border-brand-terracotta text-brand-slate" : "border-transparent text-brand-sand hover:text-brand-moss"
                    )}
                  >
                    Clinical Calendar
                  </button>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                <a
                  href="https://lavender333.github.io/vershante-lynn-clinical-skincare/assessment"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand-terracotta text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-slate transition-all shadow-sm whitespace-nowrap"
                >
                  Assessment Link
                  <ExternalLink size={13} />
                </a>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-sand" size={16} />
                  <input
                    type="text"
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-brand-sand rounded-full pl-12 pr-6 py-3 text-sm outline-none focus:border-brand-terracotta transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {activeSubTab === 'list' ? (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecords.map((record) => (
                  <motion.div
                    layoutId={record.id}
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={cn(
                      "group bg-white rounded-[2rem] border p-6 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
                      record.status === 'scheduled' ? "border-brand-terracotta/30 bg-brand-terracotta/5" : "border-brand-sand"
                    )}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-brand-sand/30 rounded-xl flex items-center justify-center text-brand-slate group-hover:bg-brand-moss group-hover:text-white transition-all">
                        <UserIcon size={20} />
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-[8px] uppercase tracking-widest font-bold px-3 py-1 rounded-full",
                          record.status === 'scheduled' ? "bg-brand-terracotta text-white" : "bg-brand-sand text-brand-moss"
                        )}>
                          {record.source === 'free-screening' ? 'screening' : record.status}
                        </span>
                        <p className="text-[8px] text-brand-sand font-bold mt-2 uppercase tracking-widest">
                          {record.createdAt?.toDate ? format(record.createdAt.toDate(), 'MMM d, HH:mm') : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-serif text-brand-slate italic">{record.fullName}</h3>
                      <p className="text-xs text-brand-moss/60">{record.email}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {(record.clinicalFocus || []).slice(0, 2).map((focus, i) => (
                        <span key={i} className="text-[8px] uppercase tracking-widest font-bold bg-white/50 border border-brand-sand px-2 py-1 rounded-sm text-brand-moss">
                          {focus}
                        </span>
                      ))}
                      {(record.clinicalFocus || []).length > 2 && (
                        <span className="text-[8px] uppercase tracking-widest font-bold bg-brand-sand/20 px-2 py-1 rounded-sm text-brand-moss">
                          +{(record.clinicalFocus || []).length - 2}
                        </span>
                      )}
                    </div>

                    {record.consultationSlot && (
                      <div className="mt-6 pt-6 border-t border-brand-sand flex items-center justify-between text-brand-terracotta">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {record.consultationSlot.date} @ {record.consultationSlot.time}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => handleDelete(record.id, e)}
                          className="p-2 text-brand-sand hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <CalendarView 
                records={records} 
                currentDate={currentCalendarDate} 
                onPrev={() => setCurrentCalendarDate(subMonths(currentCalendarDate, 1))}
                onNext={() => setCurrentCalendarDate(addMonths(currentCalendarDate, 1))}
                onSelectRecord={setSelectedRecord}
              />
            )}
          </>
        ) : activeTab === 'events' ? (
          <div className="max-w-6xl mx-auto py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-serif text-brand-slate italic mb-2">Homepage Events</h1>
                <p className="text-brand-moss/60 font-light italic">Post upcoming events that appear publicly on the homepage.</p>
              </div>
              {editingEventId && (
                <button
                  onClick={resetEventForm}
                  className="inline-flex items-center justify-center gap-2 border border-brand-sand text-brand-moss px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-cream transition-all"
                >
                  <X size={13} />
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid lg:grid-cols-[420px_1fr] gap-8">
              <form onSubmit={handleSaveEvent} className="bg-white border border-brand-sand rounded-[2rem] p-8 shadow-sm space-y-5 h-fit">
                <div className="flex items-center gap-3 pb-4 border-b border-brand-sand">
                  <Calendar className="text-brand-terracotta" size={22} />
                  <h2 className="text-2xl font-serif italic text-brand-slate">{editingEventId ? 'Edit Event' : 'Add Event'}</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Title</label>
                  <input
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full bg-brand-cream/40 border border-brand-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-terracotta"
                    placeholder="Spring Skin Reset Workshop"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Date</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full bg-brand-cream/40 border border-brand-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-terracotta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Time</label>
                    <input
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="w-full bg-brand-cream/40 border border-brand-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-terracotta"
                      placeholder="6:00 PM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Location</label>
                  <input
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full bg-brand-cream/40 border border-brand-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-terracotta"
                    placeholder="Virtual or Studio"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Short Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full bg-brand-cream/40 border border-brand-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-terracotta min-h-[110px]"
                    placeholder="A concise note about who it is for and what they can expect."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-moss">Image URL Optional</label>
                  <input
                    value={eventForm.imageUrl || ''}
                    onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                    className="w-full bg-brand-cream/40 border border-brand-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-terracotta"
                    placeholder="https://..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={eventSaving}
                  className="w-full bg-brand-moss text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-slate transition-all shadow-lg disabled:opacity-50"
                >
                  {eventSaving ? 'Saving...' : editingEventId ? 'Update Event' : 'Post Event'}
                </button>
              </form>

              <div className="space-y-4">
                {events.length > 0 ? events.map((event) => {
                  const eventDate = new Date(`${event.date}T12:00:00`);
                  const isPast = event.date < new Date().toISOString().slice(0, 10);
                  return (
                    <div key={event.id} className={cn(
                      "bg-white border rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row gap-5",
                      isPast ? "border-brand-sand opacity-60" : "border-brand-terracotta/30"
                    )}>
                      {event.imageUrl && (
                        <div className="md:w-40 aspect-[16/10] rounded-xl overflow-hidden bg-brand-sand/20 shrink-0">
                          <img src={event.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="flex gap-4 flex-grow">
                        <div className="w-16 h-16 rounded-xl bg-brand-terracotta text-white flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] uppercase tracking-widest font-bold">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-2xl font-serif italic leading-none">{eventDate.getDate()}</span>
                        </div>
                        <div className="space-y-2 flex-grow min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-serif italic text-brand-slate">{event.title}</h3>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-moss/60">{event.time} • {event.location}</p>
                            </div>
                            {isPast && (
                              <span className="text-[8px] uppercase tracking-widest font-bold bg-brand-sand/30 text-brand-moss px-2 py-1 rounded-full">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-brand-moss/70 font-light leading-relaxed">{event.description}</p>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-terracotta hover:text-brand-slate"
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-sand hover:text-red-500"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="bg-white border border-dashed border-brand-sand rounded-[2rem] p-12 text-center">
                    <p className="text-brand-moss/50 font-serif italic text-xl">No events posted yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'team' ? (
          <div className="max-w-4xl mx-auto py-12">
            <h1 className="text-4xl font-serif text-brand-slate italic mb-2">Clinical Team</h1>
            <p className="text-brand-moss/60 font-light italic mb-12">Manage medical professionals and clinical admins.</p>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-moss mb-4">Registered Admins</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-brand-moss text-white rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <UserIcon size={16} />
                                <div>
                                    <p className="text-xs font-bold">antoinetteqwilliams@gmail.com</p>
                                    <p className="text-[8px] uppercase tracking-widest text-white/50">Super Administrator</p>
                                </div>
                            </div>
                        </div>

                        {adminsList.filter(a => a.email !== adminEmail).map((admin) => (
                            <div key={admin.id} className="p-4 bg-white border border-brand-sand rounded-2xl flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-3">
                                    <UserIcon size={16} className="text-brand-moss" />
                                    <div>
                                        <p className="text-xs font-bold text-brand-slate">{admin.email}</p>
                                        <div className="flex items-center gap-2">
                                          {editingAdminId === admin.id ? (
                                            <select 
                                              value={admin.role}
                                              onChange={(e) => updateAdminRole(admin.id, e.target.value)}
                                              onBlur={() => setEditingAdminId(null)}
                                              autoFocus
                                              className="text-[8px] uppercase tracking-widest bg-brand-cream border border-brand-sand rounded px-1 outline-none font-bold text-brand-terracotta"
                                            >
                                              <option value="admin">Admin</option>
                                              <option value="professional">Professional</option>
                                              <option value="specialist">Specialist</option>
                                            </select>
                                          ) : (
                                            <button 
                                              onClick={() => setEditingAdminId(admin.id)}
                                              className="text-[8px] uppercase tracking-widest text-brand-moss/40 hover:text-brand-terracotta transition-colors font-bold flex items-center gap-1"
                                            >
                                              {admin.role || 'Clinical Admin'}
                                              <Edit2 size={8} />
                                            </button>
                                          )}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeAdmin(admin.id, admin.email)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-brand-sand hover:text-red-400 transition-all"
                                    title="Demote Admin"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-sand/10 p-8 rounded-[2.5rem] border border-brand-sand h-fit">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta mb-6 text-center">Add New Professional</h3>
                    <div className="space-y-4">
                        <p className="text-[10px] text-brand-moss/60 text-center leading-relaxed italic mb-4">
                            "Promotion to clinical admin grants full access to patient assessments and synchronization logs."
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                              type="email" 
                              value={newAdminEmail}
                              onChange={e => setNewAdminEmail(e.target.value)}
                              placeholder="Professional Email"
                              className="w-full bg-white border border-brand-sand rounded-full px-6 py-3 text-sm outline-none focus:border-brand-terracotta transition-colors col-span-2"
                          />
                          <select 
                            value={newAdminRole}
                            onChange={(e) => setNewAdminRole(e.target.value as any)}
                            className="w-full bg-white border border-brand-sand rounded-full px-6 py-3 text-xs outline-none focus:border-brand-terracotta transition-colors col-span-2"
                          >
                            <option value="admin">Clinical Admin</option>
                            <option value="professional">Professional</option>
                            <option value="specialist">Clinical Specialist</option>
                          </select>
                        </div>
                        <button 
                            onClick={addAdmin}
                            disabled={isAddingAdmin}
                            className="w-full bg-brand-moss text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-slate transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {isAddingAdmin ? 'Processing...' : 'Grant Access'}
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <SettingsView 
            hours={operatingHours} 
            onUpdateHours={(newHours) => {
              setOperatingHours(newHours);
              setDoc(doc(db, 'settings', 'operatingHours'), newHours);
            }} 
          />
        )}
      </main>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedRecord && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              className="fixed inset-0 bg-brand-slate/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              layoutId={selectedRecord.id}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 p-8 md:p-12 overflow-y-auto border-l border-brand-sand"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brand-terracotta rounded-2xl flex items-center justify-center text-white">
                    <UserIcon size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif text-brand-slate italic">{selectedRecord.fullName}</h2>
                    <p className="text-brand-moss/60 flex items-center gap-2">
                      <Mail size={12} /> {selectedRecord.email}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="p-3 text-brand-sand hover:text-brand-slate bg-brand-sand/10 rounded-full transition-all"
                >
                  <Lock size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-brand-sand/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-brand-terracotta">
                      <Activity size={16} />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-terracotta">Clinical Vitals</span>
                    </div>
                    {!isEditingVitals && (
                      <button 
                        onClick={() => setIsEditingVitals(true)}
                        className="p-2 hover:bg-brand-sand/20 rounded-full text-brand-moss transition-all"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                  </div>
                  
                  {isEditingVitals ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-brand-moss/60">Age</label>
                          <input 
                            type="text" 
                            value={editVitals.age}
                            onChange={e => setEditVitals({...editVitals, age: e.target.value})}
                            className="w-full bg-white border border-brand-sand rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-terracotta transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-brand-moss/60">Stage</label>
                          <select 
                            value={editVitals.stage}
                            onChange={e => setEditVitals({...editVitals, stage: e.target.value as any})}
                            className="w-full bg-white border border-brand-sand rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-terracotta transition-all"
                          >
                            <option value="Standard">Standard</option>
                            <option value="Post-Partum">Post-Partum</option>
                            <option value="Perimenopause">Perimenopause</option>
                            <option value="Menopause">Menopause</option>
                            <option value="Post-Menopause">Post-Menopause</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-brand-moss/60">Stress (1-10)</label>
                          <input 
                            type="number" 
                            min="1"
                            max="10"
                            value={editVitals.stress}
                            onChange={e => setEditVitals({...editVitals, stress: parseInt(e.target.value)})}
                            className="w-full bg-white border border-brand-sand rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-terracotta transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-brand-moss/60">Sleep</label>
                          <select 
                            value={editVitals.sleep}
                            onChange={e => setEditVitals({...editVitals, sleep: e.target.value as any})}
                            className="w-full bg-white border border-brand-sand rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-terracotta transition-all"
                          >
                            <option value="Poor">Poor</option>
                            <option value="Average">Average</option>
                            <option value="Excellent">Excellent</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSaveVitals}
                          className="flex-grow bg-brand-moss text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-slate transition-all"
                        >
                          <Save size={12} /> Save Vitals
                        </button>
                        <button 
                          onClick={() => setIsEditingVitals(false)}
                          className="bg-brand-sand/20 text-brand-moss p-2 rounded-xl hover:bg-brand-sand/40 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid min-w-[200px] gap-3">
                      <div className="flex justify-between border-b border-brand-sand/30 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-brand-moss/60">Age</span>
                        <span className="text-xs font-bold text-brand-slate">{selectedRecord.age}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-sand/30 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-brand-moss/60">Stage</span>
                        <span className="text-xs font-bold text-brand-slate">{selectedRecord.hormonalStage}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-sand/30 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-brand-moss/60">Stress</span>
                        <span className="text-xs font-bold text-brand-slate">{selectedRecord.stressLevel}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-brand-moss/60">Sleep</span>
                        <span className="text-xs font-bold text-brand-slate">{selectedRecord.sleepQuality}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-brand-moss/5 p-6 rounded-3xl space-y-4 border border-brand-moss/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-brand-moss">
                      <Clock size={16} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Booking Status</span>
                    </div>
                    {selectedRecord.consultationSlot && !isEditing && (
                      <div className="flex gap-2">
                        {selectedRecord.consultationSlot.type === 'Virtual' && (
                          <button 
                            onClick={() => {
                              const meetingId = selectedRecord.meetingId || `vershante-lynn-${selectedRecord.id.slice(0, 8)}`;
                              window.open(`https://meet.jit.si/${meetingId}`, '_blank');
                            }}
                            className="p-2 bg-brand-terracotta text-white rounded-full hover:bg-brand-slate transition-all shadow-lg"
                            title="Start Clinical Video Session"
                          >
                            <Video size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => setIsRescheduling(true)}
                          className="p-2 hover:bg-brand-moss/10 rounded-full text-brand-moss transition-all"
                          title="Reschedule Appointment"
                        >
                          <Calendar size={14} />
                        </button>
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="p-2 hover:bg-brand-moss/10 rounded-full text-brand-moss transition-all"
                          title="Edit Appointment"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={sendManualReminder}
                          disabled={notifying}
                          className="p-2 hover:bg-brand-moss/10 rounded-full text-brand-terracotta transition-all disabled:opacity-30"
                          title="Send Clinical Reminder"
                        >
                          <Bell size={14} className={cn(notifying && "animate-bounce")} />
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-brand-moss/60 px-1">Consultation Date</label>
                        <input 
                          type="text" 
                          value={editSlot.date}
                          onChange={e => setEditSlot({...editSlot, date: e.target.value})}
                          placeholder="e.g. May 15th, 2024"
                          className="w-full bg-white border border-brand-sand rounded-xl px-4 py-2 text-xs outline-none focus:border-brand-terracotta"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-brand-moss/60 px-1">Time Window</label>
                          <input 
                            type="text" 
                            value={editSlot.time}
                            onChange={e => setEditSlot({...editSlot, time: e.target.value})}
                            placeholder="e.g. 10:00 AM"
                            className="w-full bg-white border border-brand-sand rounded-xl px-4 py-2 text-xs outline-none focus:border-brand-terracotta"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-brand-moss/60 px-1">Session Type</label>
                          <select 
                            value={editSlot.type}
                            onChange={e => setEditSlot({...editSlot, type: e.target.value})}
                            className="w-full bg-white border border-brand-sand rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-terracotta"
                          >
                            <option value="Virtual">Virtual</option>
                            <option value="In-Person">In-Person</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={handleSaveEdit}
                          className="flex-grow bg-brand-moss text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-slate transition-all"
                        >
                          <Save size={12} /> Save Protocol
                        </button>
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="bg-brand-sand/20 text-brand-moss p-2 rounded-xl hover:bg-brand-sand/40 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : selectedRecord.consultationSlot ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-brand-moss/40 font-bold">Planned Session</p>
                        <p className="text-xl font-serif italic text-brand-slate">{selectedRecord.consultationSlot.date}</p>
                        <p className="text-xs text-brand-terracotta font-bold uppercase tracking-widest">{selectedRecord.consultationSlot.time} — {selectedRecord.consultationSlot.type}</p>
                      </div>
                      <div className="pt-4 border-t border-brand-moss/10">
                        <p className="text-[9px] uppercase tracking-widest text-brand-moss/40 font-bold">Investment Path</p>
                        <p className="text-xs font-bold text-brand-moss">{selectedRecord.investmentPreference}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 py-4">
                      <p className="text-brand-sand italic text-xs">No appointment booked yet.</p>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-[9px] uppercase font-bold text-brand-terracotta border border-brand-terracotta/30 px-4 py-2 rounded-full hover:bg-brand-terracotta hover:text-white transition-all"
                      >
                        Manually Schedule
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-12">
                {((selectedRecord.crmTags?.length ?? 0) > 0 || selectedRecord.emailAutomation || selectedRecord.bookingIntent) && (
                  <section className="bg-white p-8 rounded-[2rem] border border-brand-sand">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta mb-6">
                      CRM + Automation Direction
                    </h3>
                    {(selectedRecord.crmTags?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {selectedRecord.crmTags!.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-brand-cream border border-brand-sand rounded-full text-[9px] uppercase tracking-widest font-bold text-brand-moss">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4 text-xs text-brand-moss/70">
                      {selectedRecord.emailAutomation && (
                        <div className="bg-brand-cream/50 rounded-2xl p-4 border border-brand-sand/60">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-brand-moss/50 mb-1">Email Automation</p>
                          <p className="font-bold text-brand-slate">{selectedRecord.emailAutomation.sequence}</p>
                          <p className="uppercase tracking-widest text-[9px] text-brand-terracotta mt-2">{selectedRecord.emailAutomation.status}</p>
                        </div>
                      )}
                      {selectedRecord.bookingIntent && (
                        <div className="bg-brand-cream/50 rounded-2xl p-4 border border-brand-sand/60">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-brand-moss/50 mb-1">Booking Path</p>
                          <p className="font-bold text-brand-slate">{selectedRecord.bookingIntent.service}</p>
                          <p className="uppercase tracking-widest text-[9px] text-brand-terracotta mt-2">{selectedRecord.bookingIntent.provider}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {(selectedRecord.screeningAnswers?.length ?? 0) > 0 && (
                  <section className="bg-brand-cream/60 p-8 rounded-[2rem] border border-brand-sand">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta mb-6">
                      Free Screening Responses
                    </h3>
                    <div className="space-y-5">
                      {selectedRecord.screeningAnswers!.map((response) => (
                        <div key={response.id} className="border-b border-brand-sand/40 pb-4 last:border-0 last:pb-0">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-moss/60 mb-2">
                            {response.question}
                          </p>
                          <p className="text-sm text-brand-slate font-light">
                            {Array.isArray(response.answer) ? response.answer.join(', ') : response.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex justify-between items-center mb-6 border-b border-brand-sand pb-2">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta">Clinical Insights</h3>
                    {!isEditingInsights && (
                      <button 
                        onClick={() => setIsEditingInsights(true)}
                        className="p-2 hover:bg-brand-sand/20 rounded-full text-brand-moss transition-all"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                  </div>
                  
                  {isEditingInsights ? (
                    <div className="space-y-6 bg-[#F9F6F2] p-8 rounded-[2rem] border border-brand-sand animate-in fade-in zoom-in-95">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-brand-moss">AI Analysis Override</label>
                        <textarea 
                          value={editInsights.analysis}
                          onChange={e => setEditInsights({...editInsights, analysis: e.target.value})}
                          className="w-full bg-white border border-brand-sand rounded-2xl p-4 text-xs font-light italic outline-none focus:border-brand-terracotta min-h-[100px]"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-brand-moss text-xs">Solutions (Comma separated)</label>
                          <textarea 
                            value={editInsights.solutions.join('\n')}
                            onChange={e => setEditInsights({...editInsights, solutions: e.target.value.split('\n').filter(s => s.trim())})}
                            className="w-full bg-white border border-brand-sand rounded-xl p-3 text-xs outline-none focus:border-brand-terracotta min-h-[80px]"
                            placeholder="One solution per line..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-brand-moss text-xs">Actives (Comma separated)</label>
                          <textarea 
                            value={editInsights.recommendedProducts.join('\n')}
                            onChange={e => setEditInsights({...editInsights, recommendedProducts: e.target.value.split('\n').filter(s => s.trim())})}
                            className="w-full bg-white border border-brand-sand rounded-xl p-3 text-xs outline-none focus:border-brand-terracotta min-h-[80px]"
                            placeholder="One ingredient per line..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSaveInsights}
                          className="flex-grow bg-brand-terracotta text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-slate transition-all"
                        >
                          <Save size={12} /> Update Analysis
                        </button>
                        <button 
                          onClick={() => setIsEditingInsights(false)}
                          className="bg-brand-sand/20 text-brand-moss px-4 rounded-xl hover:bg-brand-sand/40 transition-all font-bold text-[10px] uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Confidence Score */}
                      {selectedRecord.clinicalInsights?.confidenceScore != null && (
                        <div className="flex items-center justify-between bg-brand-moss/5 border border-brand-moss/10 rounded-2xl px-5 py-3">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-brand-moss/60">Clinical Alignment Score</span>
                          <div className="flex items-center gap-3">
                            <div className="w-28 h-1.5 bg-brand-sand rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-terracotta rounded-full"
                                style={{ width: `${selectedRecord.clinicalInsights.confidenceScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-brand-terracotta">{selectedRecord.clinicalInsights.confidenceScore}%</span>
                          </div>
                        </div>
                      )}

                      {/* Analysis */}
                      <div className="bg-[#F9F6F2] rounded-2xl border border-brand-sand p-5 relative">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles size={13} className="text-brand-terracotta" />
                          <span className="text-[9px] uppercase font-bold tracking-widest text-brand-terracotta">Skin Analysis</span>
                        </div>
                        <p className="text-sm leading-relaxed text-brand-slate">
                          {selectedRecord.clinicalInsights?.analysis}
                        </p>
                      </div>

                      {/* Solutions */}
                      {(selectedRecord.clinicalInsights?.solutions?.length ?? 0) > 0 && (
                        <div className="bg-white border border-brand-sand rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={13} className="text-brand-moss" />
                            <span className="text-[9px] uppercase font-bold tracking-widest text-brand-moss">Target Solutions</span>
                          </div>
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

                      {/* Products */}
                      {(selectedRecord.clinicalInsights?.recommendedProducts?.length ?? 0) > 0 && (
                        <div className="bg-white border border-brand-sand rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <FlaskConical size={13} className="text-brand-moss" />
                            <span className="text-[9px] uppercase font-bold tracking-widest text-brand-moss">Recommended Actives</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedRecord.clinicalInsights!.recommendedProducts.map((p, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 bg-brand-moss/10 text-brand-moss text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-brand-moss/20">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-slate mb-4 border-b border-brand-sand pb-2 flex justify-between items-center">
                    Professional Private Notes
                  </h3>
                  {isEditingInsights ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-brand-terracotta/5 rounded-2xl border border-brand-terracotta/20 mb-4">
                        <label className="text-[9px] uppercase font-bold text-brand-terracotta mb-2 block">Direct Clinical Response (Visible to Client)</label>
                        <textarea 
                          value={editResponse}
                          onChange={e => setEditResponse(e.target.value)}
                          placeholder="Respond to their feedback or clinical needs..."
                          className="w-full bg-white border border-brand-sand rounded-xl p-4 text-xs font-light italic outline-none focus:border-brand-terracotta min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <textarea 
                          value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        placeholder="Internal notes for this client protocol..."
                        className="w-full bg-brand-cream border border-brand-sand rounded-2xl p-6 text-sm italic outline-none focus:border-brand-terracotta min-h-[150px] shadow-inner"
                      />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-light text-brand-moss/80 italic border-l-4 border-brand-sand pl-6 py-2 bg-brand-sand/5 rounded-r-xl">
                      {selectedRecord.professionalNotes || "No clinical observation notes recorded yet. Enter edit mode to add notes."}
                    </p>
                  )}
                </section>

                <section className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-slate mb-4">Patient Concerns</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedRecord.concerns || []).map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-brand-sand/10 rounded-full text-[10px] text-brand-moss border border-brand-sand/30">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-slate mb-4">Clinical Focus</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedRecord.clinicalFocus || []).map((f, i) => (
                        <span key={i} className="px-3 py-1 bg-brand-moss text-white rounded-full text-[10px] font-bold tracking-widest uppercase">{f}</span>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-slate mb-4">Dietary Profile</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedRecord.dietaryProfile || []).map((d, i) => (
                      <span key={i} className="px-3 py-1 bg-brand-sand/10 rounded-full text-[10px] text-brand-moss italic">{d}</span>
                    ))}
                  </div>
                </section>

                <section className="space-y-8">
                  <div>
                    <h3 className="text-[10px] uppercase font-bold text-brand-slate mb-2">Intent & Goals</h3>
                    <p className="text-sm font-light text-brand-moss/80 italic border-l-2 border-brand-terracotta pl-4">
                      {selectedRecord.primaryIntent || selectedRecord.goals || "No detailed goals provided."}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase font-bold text-brand-slate mb-2">Current Routine</h3>
                    <p className="text-sm font-light text-brand-moss/80 italic border-l-2 border-brand-sand pl-4">
                      {selectedRecord.currentRoutine || "No ritual recorded."}
                    </p>
                  </div>
                </section>

                {selectedRecord.stepFeedback && Object.keys(selectedRecord.stepFeedback).length > 0 && (
                  <section className="bg-brand-moss/5 p-8 rounded-[2rem] border border-brand-moss/10">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-moss mb-6 flex items-center gap-2">
                        <MessageSquare size={14} />
                        Step Experience Feedback
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(selectedRecord.stepFeedback).map(([stepId, feedback]) => (
                            <div key={stepId} className="flex flex-col gap-2">
                                <p className="text-[9px] uppercase font-bold text-brand-moss/40 tracking-widest">{stepId.replace(/-/g, ' ')}</p>
                                <p className="text-sm font-light italic text-brand-slate border-l-2 border-brand-sand pl-4">
                                    "{feedback}"
                                </p>
                            </div>
                        ))}
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRescheduling && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-slate/80 backdrop-blur-md z-[60]"
              onClick={() => !notifying && setIsRescheduling(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[70] p-6 pointer-events-none"
            >
              <div className="w-full max-w-5xl pointer-events-auto relative">
                <button 
                  onClick={() => setIsRescheduling(false)}
                  className="absolute -top-12 right-0 text-white hover:text-brand-terracotta flex items-center gap-2 uppercase text-[10px] font-bold tracking-[0.2em]"
                >
                  Close Synchronization <X size={16} />
                </button>
                <div className="relative">
                  {notifying && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[3rem]">
                      <div className="w-16 h-16 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-brand-slate font-serif italic text-lg">Synchronizing clinical notification...</p>
                    </div>
                  )}
                  <BookingCalendar 
                    initialDate={selectedRecord?.consultationSlot?.date} 
                    onBook={handleReschedule} 
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarView({ records, currentDate, onPrev, onNext, onSelectRecord }: { records: AssessmentRecord[], currentDate: Date, onPrev: () => void, onNext: () => void, onSelectRecord: (r: AssessmentRecord) => void }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="bg-white rounded-[2.5rem] border border-brand-sand p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-serif italic text-brand-slate">{format(currentDate, 'MMMM yyyy')}</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-moss/40">Clinical Synchronization Schedule</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onPrev} className="p-2 hover:bg-brand-cream rounded-full border border-brand-sand text-brand-moss">
            <ChevronLeft size={16} />
          </button>
          <button onClick={onNext} className="p-2 hover:bg-brand-cream rounded-full border border-brand-sand text-brand-moss">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-brand-sand/30 border border-brand-sand overflow-hidden rounded-2xl">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-brand-cream py-3 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-moss/60">{day}</span>
          </div>
        ))}
        {days.map((day, i) => {
          const dayRecords = records.filter(r => r.consultationSlot && isSameDay(new Date(r.consultationSlot.date + 'T12:00:00'), day));
          return (
            <div 
              key={i} 
              className={cn(
                "bg-white min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-brand-cream/30",
                !isSameMonth(day, monthStart) && "opacity-30 bg-brand-cream/10"
              )}
            >
              <span className="text-[10px] font-bold text-brand-sand ml-1">{format(day, 'd')}</span>
              <div className="flex flex-col gap-1">
                {dayRecords.map(record => (
                  <button
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className="text-[9px] text-left p-1.5 rounded-lg bg-brand-terracotta/10 text-brand-terracotta border border-brand-terracotta/20 hover:bg-brand-terracotta hover:text-white transition-all truncate"
                  >
                    <span className="font-bold">{record.consultationSlot?.time}</span> {record.fullName}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsView({ hours, onUpdateHours }: { hours: OperatingHours | null, onUpdateHours: (h: OperatingHours) => void }) {
  if (!hours) return null;

  const handleUpdate = (day: string, field: 'open' | 'close' | 'closed', value: any) => {
    const newHours = {
      ...hours,
      days: {
        ...hours.days,
        [day]: {
          ...hours.days[day],
          [field]: value
        }
      }
    };
    onUpdateHours(newHours);
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-serif text-brand-slate italic mb-2">Clinical Settings</h1>
      <p className="text-brand-moss/60 font-light italic mb-12">Configure and synchronize global intelligence parameters.</p>

      <div className="bg-white rounded-[2.5rem] border border-brand-sand p-10 shadow-xl">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-sand">
          <Clock className="text-brand-terracotta" size={24} />
          <h3 className="text-xl font-serif italic text-brand-slate">Intelligence Capture Hours</h3>
        </div>

        <div className="space-y-6">
          {Object.entries(hours.days).map(([day, schedule]) => (
            <div key={day} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-brand-cream/30 rounded-2xl transition-all border border-transparent hover:border-brand-sand/50">
              <div className="flex items-center gap-4 min-w-[120px]">
                <button 
                  onClick={() => handleUpdate(day, 'closed', !schedule.closed)}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all",
                    schedule.closed ? "bg-brand-terracotta border-brand-terracotta" : "border-brand-sand"
                  )}
                />
                <span className={cn("text-xs font-bold uppercase tracking-widest", schedule.closed ? "text-brand-sand" : "text-brand-slate")}>{day}</span>
              </div>

              {!schedule.closed ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold text-brand-moss/40">Open</span>
                    <input 
                      type="time" 
                      value={schedule.open}
                      onChange={e => handleUpdate(day, 'open', e.target.value)}
                      className="bg-brand-cream/50 border border-brand-sand rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-terracotta"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold text-brand-moss/40">Close</span>
                    <input 
                      type="time" 
                      value={schedule.close}
                      onChange={e => handleUpdate(day, 'close', e.target.value)}
                      className="bg-brand-cream/50 border border-brand-sand rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-terracotta"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-terracotta/40 pr-8">Clinical Synchronization Offline</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-brand-moss/5 rounded-2xl border border-brand-moss/10 flex items-start gap-4">
          <Monitor className="text-brand-moss mt-1" size={18} />
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-brand-moss tracking-widest">Global Synchronization Protocol</p>
            <p className="text-xs text-brand-moss/60 italic leading-relaxed">
              "Updating clinical hours will instantly synchronize availability across all diagnostic capture windows and booking vectors."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
