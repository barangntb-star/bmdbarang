import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FileText, 
  Camera, 
  X, 
  Upload,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { CatalogItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function ManageItems() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    quantity: 1,
    provider: '',
    specifications: '',
    category: 'TIK & Multimedia',
    unitPrice: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CatalogItem[];
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newItem = {
        ...formData,
        createdAt: new Date().toISOString(),
        // Mocked URLs for now
        documentUrl: 'https://example.com/doc.pdf',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80'
      };
      await addDoc(collection(db, 'items'), newItem);
      setIsModalOpen(false);
      setFormData({
        name: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        quantity: 1,
        provider: '',
        specifications: '',
        category: 'TIK & Multimedia',
        unitPrice: 0
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'items');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        await deleteDoc(doc(db, 'items', id));
      } catch (error) {
        handleFirestoreError(error, 'delete', 'items');
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Katalog Barang Resmi</h1>
          <p className="text-slate-500 text-sm">Standarisasi spesifikasi barang pengadaan sekolah NTB</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5 text-blue-400" />
          <span>Input Pengadaan Baru</span>
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari katalog..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <select className="bg-white border border-slate-200 rounded-lg py-2 px-4 text-sm text-slate-600 focus:outline-none font-medium">
            <option>Semua Kategori</option>
            <option>TIK & Multimedia</option>
            <option>Sarana Prasarana</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-slate-200">
                <th className="px-6 py-4">Nama Item / Penyedia</th>
                <th className="px-6 py-4">Tgl. Pengadaan</th>
                <th className="px-6 py-4 text-center">Jumlah</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    Memuat data katalog...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    Belum ada data pengadaan barang. Klik "Input Pengadaan Baru" untuk memulai.
                  </td>
                </tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{item.provider}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 text-xs font-medium">{item.acquisitionDate}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-slate-700 font-bold text-sm">{item.quantity}</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-bold uppercase">unit</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Form Input Pengadaan Barang</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Barang */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Package className="w-3 h-3 mr-2" /> Nama Barang
                    </label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="Contoh: Laptop Core i7"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  {/* Tgl Pengadaan */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Calendar className="w-3 h-3 mr-2" /> Tanggal Pengadaan
                    </label>
                    <input 
                      required
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      value={formData.acquisitionDate}
                      onChange={e => setFormData({...formData, acquisitionDate: e.target.value})}
                    />
                  </div>

                  {/* Jumlah Barang */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Layers className="w-3 h-3 mr-2" /> Jumlah Barang (Unit)
                    </label>
                    <input 
                      required
                      type="number"
                      min="1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium font-mono"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  {/* Penyedia */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Info className="w-3 h-3 mr-2" /> Perusahaan / Penyedia
                    </label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="Nama Vendor"
                      value={formData.provider}
                      onChange={e => setFormData({...formData, provider: e.target.value})}
                    />
                  </div>
                </div>

                {/* Spesifikasi */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Package className="w-3 h-3 mr-2" /> Spesifikasi Barang
                  </label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium h-24 resize-none"
                    placeholder="Tuliskan spesifikasi teknis barang secara detail..."
                    value={formData.specifications}
                    onChange={e => setFormData({...formData, specifications: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload PDF */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <FileText className="w-3 h-3 mr-2" /> Dokumen Pengadaan (PDF)
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400">
                      <Upload className="w-5 h-5 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Pilih File PDF</span>
                    </div>
                  </div>

                  {/* Foto Barang */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Camera className="w-3 h-3 mr-2" /> Foto Barang
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400">
                      <Camera className="w-5 h-5 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Ambil / Pilih Foto</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-6 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300"
                  >
                    Simpan Data
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
