import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Wallet, ChevronDown, Plus } from 'lucide-react';

export default function Header({ onOpenExpenseModal }) {
  const { activeGroup, setIsGroupSwitcherOpen } = useApp();

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
          <Wallet className="w-4 h-4" />
        </div>
        <button
          type="button"
          onClick={() => setIsGroupSwitcherOpen(true)}
          className="flex items-center gap-1.5 text-left font-bold text-slate-800 text-sm min-w-0 flex-1 truncate active:opacity-70 transition-opacity"
        >
          <span className="truncate">{activeGroup?.name || 'Chọn chuyến đi'}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </div>

      {onOpenExpenseModal && (
        <button
          type="button"
          onClick={onOpenExpenseModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-sm shadow-rose-600/25 shrink-0 min-h-[38px] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chi</span>
        </button>
      )}
    </header>
  );
}
