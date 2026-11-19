import React from 'react';
import { formatCurrency } from '../../utils/currency';
import {
  Wallet,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function SummaryCards({ totals }) {
  const cards = [
    {
      label: 'Tổng chi tiêu nhóm',
      value: formatCurrency(totals.totalExpenses),
      subtext: `${totals.expenseCount} khoản đã chi`,
      icon: Wallet,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Trung bình / thành viên',
      value: formatCurrency(totals.avgSpendingPerMember),
      subtext: `Trên ${totals.memberCount} thành viên`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Đã quyết toán xong',
      value: formatCurrency(totals.totalSettled),
      subtext: 'Đã chuyển khoản thực tế',
      icon: CheckCircle2,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      label: 'Số nợ còn cần chuyển',
      value: formatCurrency(totals.totalOutstandingBalance),
      subtext: totals.totalOutstandingBalance === 0 ? 'Đã cân bằng 100%' : 'Chờ hoàn tất thanh toán',
      icon: Clock,
      color: totals.totalOutstandingBalance === 0
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {card.label}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate block">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
