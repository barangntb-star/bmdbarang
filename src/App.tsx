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
      try {
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
      } catch (error) {
        console.error("Auth state error:", error);
        // Optionally handle specific errors, e.g., permission denied
      } finally {
        setLoading(false);
      }
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
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Ensure custom parameters or specific constraints can be added here if needed
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failure:", error);
      alert("Gagal masuk: Pastikan Anda mengizinkan popup di browser Anda atau periksa koneksi internet.");
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative Gradients for a clean professional look */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-40 -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200 rounded-full blur-[120px] opacity-40 -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl relative z-10 text-center"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-200 mb-8 border-b-4 border-slate-950">
            <ShieldCheck className="text-blue-500 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">SIPLAH <span className="text-blue-600">NTB</span></h1>
          <p className="text-slate-400 mt-4 text-[10px] font-bold uppercase tracking-[0.3em]">Portal Sinkronisasi Aset Pendidikan</p>
        </div>

        <div className="space-y-4">
          <p className="text-slate-500 text-xs font-medium mb-6">Silakan gunakan kredensial resmi Anda untuk mengakses sistem inventaris se-NTB.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all hover:bg-blue-700 active:scale-[0.98] shadow-xl shadow-blue-100 group border-b-4 border-blue-800"
          >
            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="tracking-tight">Masuk dengan Email Dinas</span>
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-300 font-bold uppercase tracking-[0.2em]">
          <span>Verifikasi Identitas NTB</span>
          <span className="text-slate-400">© 2024 DIKBUD</span>
        </div>
      </motion.div>
    </div>
  );
}
