import { 
  BarChart3, 
  Package, 
  Users, 
  FileText, 
  History, 
  PlusCircle, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation, Link } from 'react-router-dom';

const adminNav = [
  { name: 'Dashboard', path: '/admin', icon: BarChart3 },
  { name: 'Data Barang', path: '/admin/items', icon: Package },
  { name: 'Manajemen Pengguna', path: '/admin/users', icon: Users },
  { name: 'Laporan', path: '/admin/reports', icon: FileText },
];

const principalNav = [
  { name: 'Dashboard', path: '/principal', icon: BarChart3 },
  { name: 'Pengadaan Baru', path: '/principal/new', icon: PlusCircle },
  { name: 'Riwayat Pengadaan', path: '/principal/history', icon: History },
  { name: 'Dokumen', path: '/principal/documents', icon: FileText },
];

interface SidebarProps {
  role: 'ADMIN' | 'PRINCIPAL';
  onLogout: () => void;
}

export default function Sidebar({ role, onLogout }: SidebarProps) {
  const location = useLocation();
  const navItems = role === 'ADMIN' ? adminNav : principalNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 shrink-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">NTB</div>
          <span className="text-white font-bold tracking-tight text-lg leading-tight uppercase">SIPPG <span className="text-blue-500">Sekolah</span></span>
        </div>
      </div>

      <nav className="flex-1 p-4 mt-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-3">
          {role === 'ADMIN' ? 'Admin Dashboard' : 'Menu Kepala Sekolah'}
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all group ${
                isActive 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-red-950/20 hover:text-red-400 transition-colors text-slate-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}
