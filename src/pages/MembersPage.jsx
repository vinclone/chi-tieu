import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import MemberContributionTable from '../components/fund/MemberContributionTable.jsx';
import PasteMembersModal from '../components/fund/PasteMembersModal.jsx';
import { Users, ArrowLeft, Download, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/currency.js';
import { exportService } from '../services/exportService.js';
import { useToast } from '../context/ToastContext.jsx';

export default function MembersPage() {
  const {
    activeGroup,
    currentMembers,
    currentExpenses,
    currentSettlements,
    fundSummary,
    addMemberInline,
    updateMemberInline,
    deleteMemberInline,
    batchAddMembers,
    setActiveTab
  } = useApp();

  const { showToast } = useToast();
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

  const handleExportCSV = () => {
    try {
      exportService.exportMembersSummaryCSV(activeGroup, currentMembers, currentExpenses, currentSettlements);
      showToast('Đã xuất danh sách thành viên ra tệp CSV Excel!');
    } catch (e) {
      showToast('Lỗi khi xuất file: ' + e.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại Bảng tổng quan
            </button>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            Quản Lý Đóng Góp Quỹ Thành Viên
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi danh sách đoàn, tiến độ nộp quỹ và ghi chú đóng tiền của từng người
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPasteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Dán từ Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Tổng thành viên</span>
          <span className="text-lg sm:text-2xl font-bold text-slate-900 font-mono mt-0.5 block whitespace-nowrap">
            {fundSummary.memberCount} <span className="text-xs sm:text-sm font-sans font-normal text-slate-500">người</span>
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Định mức / người</span>
          <span className="text-lg sm:text-2xl font-bold text-slate-900 font-mono mt-0.5 block whitespace-nowrap">
            {formatCurrency(fundSummary.plannedPerPerson)}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Thực tế đã thu</span>
          <span className="text-lg sm:text-2xl font-bold text-emerald-700 font-mono mt-0.5 block whitespace-nowrap">
            {formatCurrency(fundSummary.totalCollected)}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Tiến độ nộp quỹ</span>
          <span className="text-lg sm:text-2xl font-bold text-teal-800 font-mono mt-0.5 block whitespace-nowrap">
            {fundSummary.paidMembersCount}/{fundSummary.memberCount} <span className="text-xs sm:text-sm font-sans font-normal text-slate-500">đã nộp</span>
          </span>
        </div>
      </div>

      {/* Full-width Member Contribution Spreadsheet Table */}
      <div className="min-h-[580px] flex flex-col">
        <MemberContributionTable
          members={currentMembers}
          plannedContribution={activeGroup.plannedContribution}
          onAddMember={addMemberInline}
          onUpdateMember={updateMemberInline}
          onDeleteMember={deleteMemberInline}
          onOpenPasteModal={() => setIsPasteModalOpen(true)}
        />
      </div>

      {/* Paste Members Modal */}
      <PasteMembersModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onConfirmBatch={batchAddMembers}
        defaultContribution={activeGroup.plannedContribution}
      />
    </div>
  );
}
