import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import SettlementRefundTable from '../components/fund/SettlementRefundTable.jsx';
import TreasurerInfoCard from '../components/fund/TreasurerInfoCard.jsx';
import PrintableSettlementReport from '../components/fund/PrintableSettlementReport.jsx';
import { Coins, ArrowLeft, Download, Printer } from 'lucide-react';
import { formatCurrency } from '../utils/currency.js';
import { exportService } from '../services/exportService.js';
import { useToast } from '../context/ToastContext.jsx';

export default function SettlementPage() {
  const {
    activeGroup,
    currentMembers,
    currentExpenses,
    fundSummary,
    memberRefunds,
    allocationType,
    setAllocationType,
    customAllocations,
    setCustomAllocations,
    updateMemberRefundStatus,
    updateMemberInline,
    updateTreasurerInfo,
    setActiveTab
  } = useApp();

  const { showToast } = useToast();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleCustomAllocationChange = (memberId, amount) => {
    setCustomAllocations(prev => ({
      ...prev,
      [memberId]: amount
    }));
  };

  const handleExportCSV = () => {
    try {
      exportService.exportFundSummaryReportCSV(activeGroup, currentMembers, currentExpenses, fundSummary, memberRefunds);
      showToast('Đã xuất báo cáo quyết toán ra tệp CSV Excel!');
    } catch (e) {
      showToast('Lỗi khi xuất file: ' + e.message, 'error');
    }
  };

  const totalRefundAmount = memberRefunds.reduce((sum, r) => sum + r.refundAmount, 0);
  const completedRefundsCount = memberRefunds.filter(r => r.refundStatus === 'completed' || r.refundStatus === 'refunded').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại Bảng tổng quan
            </button>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-teal-700" />
            Quyết Toán Chi Phí & Hoàn Tiền Thừa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đối chiếu số tiền nộp so với chi phí thực tế, hoàn trả tiền thừa hoặc thu thêm khoản hụt quỹ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In quyết toán</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Số dư quỹ còn lại</span>
          <span className={`text-lg sm:text-2xl font-bold font-mono mt-0.5 block whitespace-nowrap ${
            fundSummary.remainingFund >= 0 ? 'text-teal-700' : 'text-rose-700'
          }`}>
            {fundSummary.remainingFund >= 0 ? '+' : ''}{formatCurrency(fundSummary.remainingFund)}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Hoàn trả / thành viên</span>
          <span className="text-lg sm:text-2xl font-bold text-emerald-700 font-mono mt-0.5 block whitespace-nowrap">
            {formatCurrency(fundSummary.refundPerPerson)}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Tổng tiền hoàn trả</span>
          <span className="text-lg sm:text-2xl font-bold text-slate-900 font-mono mt-0.5 block whitespace-nowrap">
            {formatCurrency(totalRefundAmount)}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Tiến độ hoàn tiền</span>
          <span className="text-lg sm:text-2xl font-bold text-teal-800 font-mono mt-0.5 block whitespace-nowrap">
            {completedRefundsCount}/{memberRefunds.length} <span className="text-xs sm:text-sm font-sans font-normal text-slate-500">đã hoàn</span>
          </span>
        </div>
      </div>

      {/* Full-width Settlement & Refund Table with prominent Note column */}
      <div className="w-full min-h-[460px] flex flex-col">
        <SettlementRefundTable
          refunds={memberRefunds}
          allocationType={allocationType}
          onAllocationTypeChange={setAllocationType}
          customAllocations={customAllocations}
          onCustomAllocationChange={handleCustomAllocationChange}
          onUpdateRefundStatus={updateMemberRefundStatus}
          onUpdateMember={updateMemberInline}
        />
      </div>

      {/* Bottom 2-Column: Treasurer Contact Info & Settlement Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Treasurer Contact & Banking Info (7 cols on lg) */}
        <div className="lg:col-span-7">
          <TreasurerInfoCard
            group={activeGroup}
            onUpdateTreasurer={updateTreasurerInfo}
          />
        </div>

        {/* Right: Quick Settlement Guidelines & Bank Transfer Note (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="p-1 bg-teal-100 text-teal-800 rounded-md">💡</span>
              Quy Trình Hoàn Tiền Minh Bạch
            </h3>
            <ul className="text-xs text-slate-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-700 shrink-0">1.</span>
                <span>Thủ quỹ bấm <strong>Sao chép STK</strong> của từng bạn để chuyển hoàn tiền thừa qua app ngân hàng.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-700 shrink-0">2.</span>
                <span>Sau khi chuyển tiền, bấm <strong>Xác nhận đã trả</strong> để đánh dấu chuyển sang màu xanh (Đã hoàn trả).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-700 shrink-0">3.</span>
                <span>Có thể gõ trực tiếp vào cột <strong>Ghi chú (Note)</strong> (VD: <em>"Đã CK VCB 20k", "Trả tiền mặt"</em>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-700 shrink-0">4.</span>
                <span>Bấm <strong>In quyết toán</strong> hoặc <strong>Xuất Excel</strong> để gửi file cho cả nhóm đối chiếu.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Bảo đảm cân bằng thu chi 100%</span>
            <span className="font-mono text-teal-700 font-bold">Tổng hoàn: {formatCurrency(totalRefundAmount)}</span>
          </div>
        </div>
      </div>

      {/* Printable Settlement Report Modal */}
      <PrintableSettlementReport
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        group={activeGroup}
        members={currentMembers}
        expenses={currentExpenses}
        fundSummary={fundSummary}
        refunds={memberRefunds}
      />
    </div>
  );
}
