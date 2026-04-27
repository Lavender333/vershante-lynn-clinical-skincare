import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import AssessmentPage from './components/AssessmentPage';
import PhilosophyPage from './components/PhilosophyPage';
import ContactPage from './components/ContactPage';
import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import { FlaskConical, Instagram, Mail, Phone, MapPin, Lock } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-brand-sand/20 border-t border-brand-sand pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-moss rounded-xl flex items-center justify-center text-white">
              <FlaskConical size={20} />
            </div>
            <div className="flex flex-col -gap-1">
              <span className="font-serif italic text-xl text-brand-slate leading-none">Vershante Lynn</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-moss font-bold">Skin Intelligence</span>
            </div>
          </Link>
          <p className="text-sm text-brand-moss/70 font-light leading-relaxed">
            Clinically trained esthetician specializing in unique skin intelligence.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-brand-moss/10 flex items-center justify-center text-brand-moss hover:bg-brand-moss hover:text-white transition-all">
              <Instagram size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-brand-moss/10 flex items-center justify-center text-brand-moss hover:bg-brand-moss hover:text-white transition-all">
              <Mail size={14} />
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-slate">Navigation</h4>
          <ul className="space-y-4 text-sm text-brand-moss/80 font-light">
            <li><Link to="/" className="hover:text-brand-terracotta transition-colors">The Edge</Link></li>
            <li><Link to="/assessment" className="hover:text-brand-terracotta transition-colors">Assessment Form</Link></li>
            <li><Link to="/philosophy" className="hover:text-brand-terracotta transition-colors">Philosophy</Link></li>
            <li><Link to="/contact" className="hover:text-brand-terracotta transition-colors">Contact Us</Link></li>
            <li><Link to="/my-intelligence" className="hover:text-brand-terracotta transition-colors">My Intelligence Portal</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-slate">Clinical Focus</h4>
          <ul className="space-y-4 text-sm text-brand-moss/80 font-light">
            <li>Cortisol & Stress</li>
            <li>Postpartum Skincare</li>
            <li>Menopause Intelligence</li>
            <li>Hyperpigmentation Patterns</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-slate">In Studio</h4>
          <div className="space-y-4 text-sm text-brand-moss/80 font-light">
            <div className="flex gap-3">
              <MapPin size={16} className="text-brand-terracotta shrink-0" />
              <span>By Appointment Only<br />Virtual & In-Person</span>
            </div>
            <div className="flex gap-3">
              <Phone size={16} className="text-brand-terracotta shrink-0" />
              <span>888.SKIN.INTEL</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-brand-sand/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-sand font-bold">
          &copy; {new Date().getFullYear()} Vershante Lynn Skincare. All Rights Intelligence.
        </span>
        <div className="flex gap-8 text-[9px] uppercase tracking-widest text-brand-sand font-bold">
          <a href="#" className="hover:text-brand-moss transition-all">Privacy Protocol</a>
          <a href="#" className="hover:text-brand-moss transition-all">Terms of Service</a>
          <Link to="/my-intelligence" className="flex items-center gap-1 hover:text-brand-moss transition-all">
            <Lock size={8} /> My Portal
          </Link>
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-brand-moss transition-all">
            <Lock size={8} /> Professional
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col relative selection:bg-brand-terracotta selection:text-white">
        {/* Grain Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/philosophy" element={<PhilosophyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/my-intelligence" element={<ClientDashboard />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" expand={true} richColors theme="light" />
      </div>
    </Router>
  );
}
