import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  FileText, 
  Camera, 
  CheckCircle2,
  Search,
  Building
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { CatalogItem, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface CartItem extends CatalogItem {
  cartQuantity: number;
}

export default function NewProcurement({ profile }: { profile: UserProfile }) {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const q = query(collection(db, 'items'), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CatalogItem[];
        setCatalog(items);
      } catch (error) {
        console.error("Error fetching catalog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const addToCart = (item: CatalogItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      }
      return [...prev, { ...item, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.cartQuantity + delta);
        return { ...i, cartQuantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.cartQuantity * (item.unitPrice || 0)), 0);

  const handleSubmit = async () => {
    try {
      const procurementData = {
        requesterId: profile.uid,
        schoolName: profile.schoolName || 'Sekolah Tanpa Nama',
        items: cart.map(i => ({
          itemId: i.id,
          name: i.name,
          quantity: i.cartQuantity,
          price: i.unitPrice || 0
        })),
        totalAmount: totalAmount,
        status: 'PENDING',
        documentUrl: 'https://example.com/mock-bast.pdf',
        photoUrl: 'https://images.unsplash.com/photo-1580582133735-385a2010d3a7?w=500&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'procurements'), procurementData);
      setStep(3); // Success Message
    } catch (error) {
      handleFirestoreError(error, 'create', 'procurements');
    }
  };

  const filteredCatalog = catalog.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengadaan Barang Baru</h1>
          <p className="text-slate-500 text-sm">Pilih barang dari katalog resmi untuk dilaporkan/diajukan</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200">
           <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${step === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>1. Pilih Barang</div>
           <div className="w-4 h-px bg-slate-200"></div>
           <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${step === 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>2. Konfirmasi & Dokumen</div>
        </div>
      </header>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Catalog Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari barang di katalog..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-slate-100 animate-pulse h-40 rounded-3xl" />
                ))
              ) : filteredCatalog.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 italic">Katalog barang belum tersedia dari Admin.</p>
                </div>
              ) : filteredCatalog.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={item.id} 
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all group shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{item.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg tracking-tight mb-1">{item.name}</h3>
                  <p className="text-slate-400 text-xs line-clamp-1 mb-4">{item.specifications || 'Spesifikasi resmi'}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Harga Dasar</p>
                      <p className="text-sm font-black text-slate-900 tracking-tight">Rp {(item.unitPrice || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">Daftar Pengajuan</h3>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-10 text-center">Belum ada barang dipilih.</p>
                ) : cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                    <div className="flex-1">
                      <p className="font-bold text-sm leading-tight line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-white/50 font-bold mt-1 uppercase">x{item.cartQuantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white/10 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-blue-400"><Minus className="w-3 h-3" /></button>
                        <span className="px-2 text-xs font-bold">{item.cartQuantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-blue-400"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-white/30 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Estimasi Total</span>
                  <span className="text-xl font-black tracking-tighter">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/20"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-10 max-w-4xl mx-auto overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-8">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Informasi Pengadaan</h3>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                     <Building className="w-7 h-7" />
                   </div>
                   <div>
                     <p className="text-lg font-black text-slate-800">{profile.schoolName}</p>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Kepala Sekolah: {profile.name}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unggah BAST / Dokumen (PDF)</span>
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer text-slate-400 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase">Pilih File PDF</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unggah Foto Fisik Barang</span>
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer text-slate-400 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase">Ambil / Pilih Foto</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] text-amber-700 font-bold uppercase leading-relaxed">
                  *Dengan menyimpan data ini, Anda menyatakan bahwa barang telah diterima dalam kondisi baik sesuai spesifikasi dan terdokumentasi dengan sah.
                </p>
              </div>
            </div>

            <div className="w-full md:w-80 space-y-6">
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ringkasan Pesanan</p>
                 <div className="space-y-3 mb-6">
                   {cart.map(i => (
                     <div key={i.id} className="flex justify-between text-xs font-bold text-slate-600">
                       <span>{i.name} (x{i.cartQuantity})</span>
                       <span className="text-slate-800">Rp {( (i.unitPrice || 0) * i.cartQuantity ).toLocaleString('id-ID')}</span>
                     </div>
                   ))}
                 </div>
                 <div className="pt-4 border-t border-slate-200">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Total Akhir</span>
                     <span className="text-xl font-black text-slate-900 tracking-tighter">Rp {totalAmount.toLocaleString('id-ID')}</span>
                   </div>
                 </div>
               </div>

               <div className="flex flex-col gap-3">
                 <button 
                  onClick={handleSubmit}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95"
                 >
                   Simpan & Laporkan
                 </button>
                 <button 
                  onClick={() => setStep(1)}
                  className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
                 >
                   Kembali Edit
                 </button>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center py-20"
        >
          <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-100 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4 uppercase">Laporan Berhasil!</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">Data pengadaan sekolah {profile.schoolName} telah tersimpan dan masuk dalam sinkronisasi wilayah NTB.</p>
          <button 
            onClick={() => navigate('/principal')}
            className="bg-slate-900 text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all"
          >
            Kembali ke Dashboard
          </button>
        </motion.div>
      )}
    </div>
  );
}
