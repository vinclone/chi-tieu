import React from 'react';
import { Wallet, Receipt, Coins, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/currency.js';

export default function FinancialOverviewCards({ fundSummary, group }) {
  const {
    memberCount,
    expenseCount,
    plannedPerPerson,
    totalExpectedFund,
    totalCollected,
    totalExpenses,
    remainingFund,
    costPerPerson,
    refundPerPerson,
    paidMembersCount
  } = fundSummary;

  const collectionRate = totalExpectedFund > 0 
    ? Math.min(100, Math.round((totalCollected / totalExpectedFund) * 100)) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card 1: TỔNG THU QUỸ */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-xl p-5 shadow-sm border border-emerald-700 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute right-3 top-3 opacity-10">
          <Wallet className="w-24 h-24" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-300" />
              Tổng Thu Quỹ Nhóm
            </span>
            <span className="bg-emerald-700/80 text-emerald-100 text-xs px-2 py-0.5 rounded-full font-medium">
              {collectionRate}% kế hoạch
            </span>
          </div>

          <div className="text-3xl font-bold tracking-tight text-white mb-1">
            {formatCurrency(totalCollected)}
          </div>

          <div className="text-xs text-emerald-200/90 mb-3">
            Dự kiến thu: <span className="font-medium text-white">{formatCurrency(totalExpectedFund)}</span> ({memberCount} thành viên)
          </div>
        </div>

        <div className="pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs text-emerald-100">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-300" />
            <span>Đã đóng: <strong className="text-white">{paidMembersCount}/{memberCount}</strong> người</span>
          </div>
          <div>
            Định mức: <strong className="text-white">{formatCurrency(plannedPerPerson)}</strong>/người
          </div>
        </div>
      </div>

      {/* Card 2: TỔNG CHI TIÊU THỰC TẾ */}
      <div className="bg-gradient-to-br from-rose-900 to-red-950 text-white rounded-xl p-5 shadow-sm border border-rose-800 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute right-3 top-3 opacity-10">
          <Receipt className="w-24 h-24" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-rose-300" />
              Tổng Chi Tiêu Thực Tế
            </span>
            <span className="bg-rose-800/80 text-rose-100 text-xs px-2 py-0.5 rounded-full font-medium">
              {expenseCount} giao dịch
            </span>
          </div>

          <div className="text-3xl font-bold tracking-tight text-white mb-1">
            {formatCurrency(totalExpenses)}
          </div>

          <div className="text-xs text-rose-200/90 mb-3">
            Bình quân chi phí: <span className="font-medium text-white">{formatCurrency(costPerPerson)}</span> / người
          </div>
        </div>

        <div className="pt-3 border-t border-rose-800/60 flex items-center justify-between text-xs text-rose-100 gap-2">
          <div className="truncate" title={`Đại diện chi: ${group?.representative || 'Nguyễn Văn An'}`}>
            Đại diện: <strong className="text-white">{group?.representative || 'Nguyễn Văn An'}</strong>
          </div>
          <div className="shrink-0">
            Hạch toán: <strong className="text-white">Quỹ chung</strong>
          </div>
        </div>
      </div>

      {/* Card 3: SỐ DƯ QUỸ & HOÀN TIỀN */}
      <div className={`text-white rounded-xl p-5 shadow-sm border relative overflow-hidden flex flex-col justify-between ${
        remainingFund >= 0 
          ? 'bg-gradient-to-br from-teal-800 to-cyan-900 border-teal-700' 
          : 'bg-gradient-to-br from-amber-900 to-orange-950 border-amber-800'
      }`}>
        <div className="absolute right-3 top-3 opacity-10">
          <Coins className="w-24 h-24" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-teal-300" />
              Số Dư Quỹ Còn Lại
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
              remainingFund >= 0 
                ? 'bg-emerald-600/80 text-emerald-100' 
                : 'bg-rose-600/80 text-rose-100'
            }`}>
              {remainingFund >= 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {remainingFund > 0 ? 'Dư tiền thừa' : remainingFund === 0 ? 'Hòa vốn' : 'Hụt chi'}
            </span>
          </div>

          <div className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-1">
            {remainingFund >= 0 ? '+' : ''}{formatCurrency(remainingFund)}
          </div>

          <div className="text-xs text-teal-200/90 mb-3">
            Công thức: <span className="font-mono text-white/90">Tổng Thu ({formatCurrency(totalCollected)}) - Tổng Chi ({formatCurrency(totalExpenses)})</span>
          </div>
        </div>

        <div className="pt-3 border-t border-teal-700/60 flex items-center justify-between text-xs text-teal-100">
          <div>
            {remainingFund >= 0 ? (
              <span>Hoàn trả: <strong className="text-emerald-300 font-semibold">{formatCurrency(refundPerPerson)}</strong> / người</span>
            ) : (
              <span>Cần đóng thêm: <strong className="text-amber-300 font-semibold">{formatCurrency(Math.abs(refundPerPerson))}</strong> / người</span>
            )}
          </div>
          <div className="font-medium text-xs">
            {remainingFund > 0 ? 'Sẵn sàng quyết toán' : remainingFund === 0 ? 'Chưa phát sinh chi' : 'Cần bổ sung quỹ'}
          </div>
        </div>
      </div>
    </div>
  );
}
