import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Coins,
  BarChart3,
  Settings,
  ChevronRight,
  Wallet,
  FolderGit2
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Bảng tổng quan quỹ', icon: LayoutDashboard },
  { id: 'members', label: 'Đóng góp thành viên', icon: Users },
  { id: 'expenses', label: 'Chi tiêu chung của đoàn', icon: Receipt },
  { id: 'settlement', label: 'Quyết toán & Hoàn tiền', icon: Coins },
  { id: 'statistics', label: 'Thống kê & Báo cáo', icon: BarChart3 },
  { id: 'settings', label: 'Cài đặt & Dữ liệu', icon: Settings },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, activeGroup, setIsGroupSwitcherOpen } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-screen shrink-0 sticky top-0 h-screen select-none">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-tight">
            Quỹ Nhóm
          </span>
          <span className="text-xs text-slate-400 font-medium">Quản lý thu chi & quyết toán</span>
        </div>
      </div>

      {/* Active Group Selector Card */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => setIsGroupSwitcherOpen(true)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-slate-100/90 transition-all text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-slate-500 font-medium block">Chuyến đi hiện tại</span>
              <span className="text-sm font-bold text-slate-800 truncate block group-hover:text-emerald-700 transition-colors">
                {activeGroup?.name || 'Chọn nhóm'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 ml-1" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Info footer */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400">
        <p className="font-medium text-slate-600">Mô hình Quỹ Đoàn</p>
        <p>Thu quỹ → Chi trả → Hoàn tiền</p>
      </div>
    </aside>
  );
}
