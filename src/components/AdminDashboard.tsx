import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const data = [
  { name: 'Jan', total: 400 },
  { name: 'Feb', total: 300 },
  { name: 'Mar', total: 600 },
  { name: 'Apr', total: 800 },
  { name: 'May', total: 500 },
  { name: 'Jun', total: 700 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Ringkasan Pengadaan Barang</h1>
          <p className="text-slate-500 text-sm mt-1">Sistem Informasi Pengadaan Provinsi Nusa Tenggara Barat</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold border border-blue-100 uppercase tracking-wider">Provinsi NTB</span>
          <div className="w-px h-8 bg-slate-200"></div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <AlertCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sekolah" value="1,420" subValue="+12 Sekolah Baru" subColor="text-green-600" />
        <StatCard title="Usulan Pending" value="45" subValue="Menunggu Verifikasi" subColor="text-slate-400" highlight="text-orange-600" />
        <StatCard title="Barang Tiba" value="89%" subValue="Cakupan Wilayah NTB" subColor="text-slate-400" highlight="text-blue-700" />
        <StatCard title="Anggaran Terpakai" value="Rp 12.5M" subValue="Tahun Anggaran 2024" subColor="text-slate-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8 px-2">
            <h3 className="font-bold text-slate-700">Tren Pengadaan Bulanan</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Detail Laporan</button>
          </div>
          <div className="h-64 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#2563eb' }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-700">Pengadaan Terbaru</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {[
              { school: 'SMAN 1 Mataram', total: 'Rp 45.0M', status: 'Selesai', color: 'bg-green-100 text-green-700' },
              { school: 'SMKN 2 Selong', total: 'Rp 12.5M', status: 'Pengiriman', color: 'bg-blue-100 text-blue-700' },
              { school: 'SMPN 3 Sumbawa', total: 'Rp 8.2M', status: 'Proses', color: 'bg-orange-100 text-orange-700' },
              { school: 'SDN 5 Dompu', total: 'Rp 3.1M', status: 'Selesai', color: 'bg-green-100 text-green-700' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.school}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{item.total}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.color}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <button className="w-full py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">Unduh Semua Data (.XLS)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, subColor, highlight = 'text-slate-800' }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
      <p className={`text-3xl font-black tracking-tight ${highlight}`}>{value}</p>
      <p className={`text-[11px] font-medium mt-1 ${subColor}`}>{subValue}</p>
    </div>
  );
}
