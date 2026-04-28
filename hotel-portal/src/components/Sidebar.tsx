import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BedDouble, 
  Coffee, 
  CalendarCheck, 
  Settings, 
  LogOut,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BedDouble, label: 'Room Management', path: '/rooms' },
  { icon: Coffee, label: 'Services', path: '/services' },
  { icon: CalendarCheck, label: 'Bookings', path: '/bookings' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-xl shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">TrekPal</h1>
            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">Hotel Partner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn(
                "w-5 h-5",
                "group-hover:scale-110 transition-transform duration-200"
              )} />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <div className="bg-slate-50 p-4 rounded-2xl mb-4">
          <p className="text-xs text-slate-500 font-medium truncate">{user?.name || 'My Hotel'}</p>
          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            ACTIVE PARTNER
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
