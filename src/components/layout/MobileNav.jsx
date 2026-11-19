import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Coins,
  Settings
} from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'members', label: 'Thành viên', icon: Users },
  { id: 'expenses', label: 'Chi tiêu', icon: Receipt },
  { id: 'settlement', label: 'Quyết toán', icon: Coins },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

export default function MobileNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg">
      {MOBILE_NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl min-h-[44px] min-w-[56px] transition-all ${
              isActive
                ? 'text-emerald-700 font-bold'
                : 'text-slate-400 hover:text-slate-600 active:text-slate-700'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.4] text-emerald-700' : 'stroke-2'}`} />
            <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
