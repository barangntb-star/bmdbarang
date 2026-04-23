import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Shield, 
  Building2, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  ChevronDown
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { UserProfile, Role } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'PRINCIPAL' as Role,
    schoolName: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as UserProfile[];
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    return unsubscribe;
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'PRINCIPAL', schoolName: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      schoolName: user.schoolName || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const userRef = doc(db, 'users', editingUser.uid);
        await updateDoc(userRef, {
          name: formData.name,
          role: formData.role,
          schoolName: formData.schoolName
        });
      } else {
        // For new users, we use a temporary ID or they will be matched by email on first login
        // But in this system, it's better to use email as a lookup if UID is not yet known
        // However, UserProfile requires a UID. For now, let's use a random ID that will be
        // overwritten or linked during first login in App.tsx
        const tempId = `temp_${Date.now()}`;
        const newUser: UserProfile = {
          uid: tempId,
          email: formData.email,
          name: formData.name,
          role: formData.role,
          schoolName: formData.schoolName,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', tempId), newUser);
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingUser ? 'update' : 'create', 'users');
    }
  };

  const handleDelete = async (uid: string) => {
    if (uid === 'admin_id') return; // Protect super admin if necessary
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (error) {
        handleFirestoreError(error, 'delete', 'users');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm">Otoritas sekolah dan administrator sistem wilayah NTB</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Pengguna</span>
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari nama, email, atau sekolah..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 italic">Memuat data pengguna...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-slate-400 italic bg-white rounded-3xl border border-slate-100">
            Tidak ada pengguna yang ditemukan.
          </div>
        ) : filteredUsers.map((user) => (
          <div key={user.uid} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-blue-300 transition-all shadow-sm">
            <div className="flex items-center space-x-5">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-800 font-bold text-lg leading-tight">{user.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                  <span className="flex items-center text-xs text-slate-400 font-medium tracking-tight">
                    <Mail className="w-3 h-3 mr-1.5" />
                    {user.email}
                  </span>
                  {user.schoolName && (
                    <span className="flex items-center text-xs text-slate-400 font-medium tracking-tight">
                      <Building2 className="w-3 h-3 mr-1.5" />
                      {user.schoolName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`hidden sm:flex items-center px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${
                user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                <Shield className="w-3 h-3 mr-2" />
                {user.role}
              </div>
              <div className="flex items-center gap-1 border-l border-slate-100 pl-4">
                <button 
                  onClick={() => openEditModal(user)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(user.uid)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{editingUser ? 'Edit Profil Pengguna' : 'Tambah Pengguna Baru'}</h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Otorisasi wilayah NTB</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Nama Lengkap</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="Masukkan nama lengkap..."
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  {!editingUser && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Alamat Email Dinas</label>
                      <input 
                        required
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        placeholder="contoh@dikbud.ntb.id"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Peran Sistem</label>
                      <select 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 outline-none appearance-none"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as Role})}
                      >
                        <option value="PRINCIPAL">Kepala Sekolah</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Unit Kerja / Sekolah</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="SMAN 1 Mataram / Dikbud"
                      value={formData.schoolName}
                      onChange={e => setFormData({...formData, schoolName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 px-6 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Batalkan
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>{editingUser ? 'Perbarui Akses' : 'Aktifkan Pengguna'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
