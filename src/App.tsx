import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useNavigate 
} from 'react-router-dom';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import PrincipalDashboard from './components/PrincipalDashboard';
import ManageItems from './components/ManageItems';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import NewProcurement from './components/NewProcurement';
import { LogIn, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // If first time user, determine role (default to principal unless admin email)
          const isAdmin = u.email === 'barangntb@gmail.com';
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            name: u.displayName || 'User',
            role: isAdmin ? 'ADMIN' : 'PRINCIPAL',
            schoolName: isAdmin ? '' : 'SMAN 1 Mataram (Default)',
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg shadow-blue-200"
        />
        <p className="mt-6 text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px]">Memuat Sinkronisasi</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginView />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
        <Sidebar role={profile.role} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0 ml-64 h-full">
          {/* Top Bar for User Info */}
          <header className="h-16 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0 sticky top-0 z-10">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{profile.role} NTB</h2>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">{profile.name}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{profile.schoolName || 'Dinas Pendidikan'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <LogIn className="w-5 h-5 rotate-180" />
              </div>
            </div>
          </header>

          <main className="flex-1 p-10 overflow-y-auto">
            <Routes>
              <Route path="/admin" element={profile.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/principal" />} />
              <Route path="/admin/items" element={profile.role === 'ADMIN' ? <ManageItems /> : <Navigate to="/principal" />} />
              <Route path="/admin/users" element={profile.role === 'ADMIN' ? <UserManagement /> : <Navigate to="/principal" />} />
              <Route path="/admin/reports" element={profile.role === 'ADMIN' ? <Reports /> : <Navigate to="/principal" />} />
              
              <Route path="/principal" element={profile.role === 'PRINCIPAL' ? <PrincipalDashboard /> : <Navigate to="/admin" />} />
              <Route path="/principal/new" element={profile.role === 'PRINCIPAL' ? <NewProcurement profile={profile} /> : <Navigate to="/admin" />} />
              <Route path="/principal/history" element={<div className="text-slate-400 font-bold italic p-20 text-center">Memuat riwayat arsip sekolah...</div>} />
              <Route path="/principal/documents" element={<div className="text-slate-400 font-bold italic p-20 text-center">Akses dokumen memerlukan otorisasi digital...</div>} />
              
              <Route path="/" element={<Navigate to={profile.role === 'ADMIN' ? "/admin" : "/principal"} />} />
            </Routes>
          </main>

          {/* Footer Bar */}
          <footer className="h-10 bg-white border-t border-slate-200 px-10 flex items-center justify-between shrink-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              &copy; 2024 Dinas Pendidikan dan Kebudayaan Nusa Tenggara Barat
            </div>
            <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 shadow-sm animate-pulse"></div> Node-Asia-SE1</span>
              <span>v2.1.0-STABLE</span>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
}

function LoginView() {
  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200 rounded-full blur-3xl opacity-50 -ml-48 -mb-48" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 mb-8 transform -rotate-3 hover:rotate-0 transition-transform">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">SIPPG <span className="text-blue-600 font-light tracking-[0.1em]">Sekolah</span></h1>
          <p className="text-slate-400 mt-3 text-xs font-bold uppercase tracking-[0.25em]">Provinsi Nusa Tenggara Barat</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all hover:bg-slate-800 active:scale-[0.98] shadow-xl group border-b-4 border-slate-950"
          >
            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform text-blue-400" />
            <span>Masuk dengan Email Dinas</span>
          </button>
          
          <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-xl border border-slate-100">
             <div className="p-2 bg-white rounded-lg shadow-sm">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
             </div>
             <p className="text-slate-400 text-[10px] leading-relaxed font-semibold uppercase tracking-tight">
               Otentikasi khusus wilayah NTB. Pastikan menggunakan akun dinas yang terdaftar di database sinkronisasi wilayah.
             </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
          <span>Security Protocol 2.4</span>
          <span className="text-blue-600">Dikbud NTB</span>
        </div>
      </motion.div>
    </div>
  );
}
