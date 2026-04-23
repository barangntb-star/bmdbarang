import { 
  FileText, 
  Clock, 
  Camera, 
  Package,
  Plus,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function PrincipalDashboard() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Panel Kepala Sekolah</h1>
          <p className="text-slate-500 text-sm mt-1">Status pengadaan inventaris SMAN 1 Mataram</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Pengadaan Baru</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="Sedang Berjalan" count="3" icon={Clock} color="text-blue-600" bg="bg-blue-50" />
        <StatusCard title="Sudah Selesai" count="12" icon={Package} color="text-green-600" bg="bg-green-50" />
        <StatusCard title="Usulan Pending" count="8" icon={AlertCircle} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <Camera className="w-5 h-5 mr-3 text-blue-600" />
            Galeri Bukti Fisik Barang
          </h2>
          <button className="text-xs font-bold text-blue-600 hover:underline px-4 py-2 bg-blue-50 rounded-lg">Kelola Dokumen</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Laptop Laboratorium i5', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80', date: 'NTB-0192' },
            { name: 'Proyektor Ruang Multimedia', img: 'https://images.unsplash.com/photo-1533669145229-37f26776b8c8?w=500&q=80', date: 'NTB-0441' },
            { name: 'Kursi Kantin Outdoor', img: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=500&q=80', date: 'NTB-0882' },
            { name: 'Buku Kurikulum Merdeka', img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80', date: 'NTB-1120' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              className="group bg-slate-50 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.img} 
                  referrerPolicy="no-referrer"
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="p-4">
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold tracking-widest">{item.date}</p>
                <p className="text-slate-800 font-bold text-sm mt-1 leading-tight">{item.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, count, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-5 group hover:border-slate-300 transition-colors">
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-black ${color}`}>{count}</p>
      </div>
    </div>
  );
}
