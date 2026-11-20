import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Wallet, ChevronDown, Plus, Cloud } from 'lucide-react';

export default function Header({ onOpenExpenseModal }) {
  const { activeGroup, setIsGroupSwitcherOpen, roomCode, syncStatus, setIsRoomModalOpen } = useApp();

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
          <Wallet className="w-4 h-4" />
        </div>
        <button
          type="button"
          onClick={() => setIsGroupSwitcherOpen(true)}
          className="flex items-center gap-1 text-left font-bold text-slate-800 text-xs min-w-0 truncate active:opacity-70 transition-opacity"
        >
          <span className="truncate">{activeGroup?.name || 'Chọn chuyến đi'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setIsRoomModalOpen(true)}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold transition-colors"
          title="Xem mã phòng đám mây & link chia sẻ cho nhóm"
        >
          <Cloud className={`w-3.5 h-3.5 text-emerald-600 ${syncStatus === 'syncing' ? 'animate-bounce' : ''}`} />
          <span className="font-mono tracking-tight">{roomCode}</span>
        </button>

        {onOpenExpenseModal && (
          <button
            type="button"
            onClick={onOpenExpenseModal}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-sm shadow-rose-600/25 shrink-0 min-h-[34px] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Chi</span>
          </button>
        )}
      </div>
    </header>
  );
}
