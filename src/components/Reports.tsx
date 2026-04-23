import { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  School, 
  Tags, 
  ChevronRight, 
  Download, 
  Filter,
  Search,
  PieChart as PieChartIcon
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Procurement, CatalogItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

type SchoolReport = {
  schoolName: string;
  totalItems: number;
  totalSpend: number;
  categories: { [category: string]: number };
};

export default function Reports() {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [catalogItems, setCatalogItems] = useState<{ [id: string]: CatalogItem }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'school' | 'category'>('school');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch Catalog Items first for categories
    const qItems = query(collection(db, 'items'));
    const unsubscribeItems = onSnapshot(qItems, (snapshot) => {
      const itemsMap: { [id: string]: CatalogItem } = {};
      snapshot.docs.forEach(doc => {
        itemsMap[doc.id] = { id: doc.id, ...doc.data() } as CatalogItem;
      });
      setCatalogItems(itemsMap);
    });

    // Fetch Procurements
    const qProc = query(collection(db, 'procurements'));
    const unsubscribeProc = onSnapshot(qProc, (snapshot) => {
      const procData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Procurement[];
      setProcurements(procData);
      setLoading(false);
    });

    return () => {
      unsubscribeItems();
      unsubscribeProc();
    };
  }, []);

  // Aggregation Logic
  const schoolReports: SchoolReport[] = Object.values(
    procurements.reduce((acc, proc) => {
      if (!acc[proc.schoolName]) {
        acc[proc.schoolName] = {
          schoolName: proc.schoolName,
          totalItems: 0,
          totalSpend: 0,
          categories: {}
        };
      }

      proc.items.forEach(item => {
        const qty = Number(item.quantity) || 0;
        acc[proc.schoolName].totalItems += qty;
        acc[proc.schoolName].totalSpend += (Number(item.price) || 0) * qty;

        // Map category from catalog
        const category = catalogItems[item.itemId]?.category || 'Lainnya';
        acc[proc.schoolName].categories[category] = (acc[proc.schoolName].categories[category] || 0) + qty;
      });

      return acc;
    }, {} as { [name: string]: SchoolReport })
  );

  const filteredReports = schoolReports.filter(r => 
    r.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProcuredItems = schoolReports.reduce((sum, r) => sum + r.totalItems, 0);

  // Global Categories for Pie Chart
  const categorySummary = procurements.reduce((acc, proc) => {
    proc.items.forEach(item => {
      const category = catalogItems[item.itemId]?.category || 'Lainnya';
      acc[category] = (acc[category] || 0) + (Number(item.quantity) || 0);
    });
    return acc;
  }, {} as { [cat: string]: number });

  const pieData = Object.entries(categorySummary).map(([name, value]) => ({ name, value }));
  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pusat Laporan & Statistik</h1>
          <p className="text-slate-500 text-sm">Analisis distribusi logistik pendidikan se-Nusa Tenggara Barat</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Cetak PDF
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4" /> Filter Lanjutan
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <School className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sekolah Aktif</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{schoolReports.length}</h3>
          <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-tighter">Terintegrasi Sistem</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <FileBarChart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Barang Terdistribusi</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{totalProcuredItems}</h3>
          <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-tighter">Unit terverifikasi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <Tags className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Populer</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{Object.keys(categorySummary).length}</h3>
          <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-tighter">Klasifikasi Barang</p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <School className="w-4 h-4 text-blue-500" /> Distribusi per Sekolah
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolReports.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="schoolName" hide />
                <YAxis hide />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="totalItems" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <PieChartIcon className="w-4 h-4 text-purple-500" /> Komposisi Kategori
            </h3>
          </div>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table Reports */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('school')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'school' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Rekapitulasi Sekolah
            </button>
            <button 
              onClick={() => setActiveTab('category')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'category' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Komposisi Kategori
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari sekolah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none w-full md:w-64" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Identitas Sekolah</th>
                {activeTab === 'school' ? (
                  <>
                    <th className="px-8 py-5 text-center">Total Barang</th>
                    <th className="px-8 py-5 text-right">Estimasi Nilai</th>
                    <th className="px-8 py-5 text-center">Status Data</th>
                  </>
                ) : (
                  <th className="px-8 py-5">Sebaran Kategori</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={report.schoolName} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {report.schoolName.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 text-sm tracking-tight">{report.schoolName}</span>
                    </div>
                  </td>
                  
                  {activeTab === 'school' ? (
                    <>
                      <td className="px-8 py-5 text-center">
                        <span className="text-slate-800 font-bold text-sm">{report.totalItems}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-bold uppercase">unit</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-slate-900 font-black text-sm tracking-tighter">
                          Rp {report.totalSpend.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-tighter border border-green-100">
                            Sinkron
                          </span>
                        </div>
                      </td>
                    </>
                  ) : (
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(report.categories).map(([cat, qty], i) => (
                          <div key={cat} className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{cat}:</span>
                             <span className="text-[10px] font-black text-slate-900">{qty}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
              
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <School className="w-12 h-12 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-bold italic">Data laporan tidak ditemukan untuk wilayah ini.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
