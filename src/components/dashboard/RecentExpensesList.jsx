import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import {
  Utensils,
  Car,
  Hotel,
  PartyPopper,
  ShoppingBag,
  Ticket,
  Fuel,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const CATEGORY_MAP = {
  food: { label: 'Ăn uống', icon: Utensils, color: 'text-emerald-600 bg-emerald-50' },
  transport: { label: 'Di chuyển', icon: Car, color: 'text-blue-600 bg-blue-50' },
  hotel: { label: 'Khách sạn', icon: Hotel, color: 'text-purple-600 bg-purple-50' },
  entertainment: { label: 'Giải trí', icon: PartyPopper, color: 'text-amber-600 bg-amber-50' },
  shopping: { label: 'Mua sắm', icon: ShoppingBag, color: 'text-pink-600 bg-pink-50' },
  tickets: { label: 'Vé tham quan', icon: Ticket, color: 'text-cyan-600 bg-cyan-50' },
  fuel: { label: 'Xăng xe', icon: Fuel, color: 'text-orange-600 bg-orange-50' },
  other: { label: 'Khác', icon: HelpCircle, color: 'text-slate-600 bg-slate-50' },
};

export default function RecentExpensesList({
  expenses = [],
  members = [],
  onViewAll
}) {
  const memberMap = new Map(members.map(m => [m.id, m]));
  const recent = expenses.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs italic">
        Chưa có khoản chi tiêu nào được ghi nhận.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="divide-y divide-slate-100">
        {recent.map(exp => {
          const cat = CATEGORY_MAP[exp.category] || CATEGORY_MAP.other;
          const Icon = cat.icon;
          const payer = memberMap.get(exp.payerId);

          return (
            <div key={exp.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 truncate block">{exp.title}</span>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>{formatDate(exp.date)}</span>
                    <span>•</span>
                    <span>{payer?.nickname || payer?.name || 'Không rõ'} trả</span>
                    <span>•</span>
                    <span>{exp.participantIds?.length || 0} người chia</span>
                  </div>
                </div>
              </div>

              <span className="font-extrabold text-slate-900 shrink-0">
                {formatCurrency(exp.amount)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <span>Xem toàn bộ {expenses.length} khoản chi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
