import React from 'react';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { formatDateTime } from '../../utils/date';
import {
  Utensils,
  Car,
  Hotel,
  PartyPopper,
  ShoppingBag,
  Ticket,
  Fuel,
  HelpCircle,
  Copy,
  Edit2,
  Trash2,
  FileImage,
  Users
} from 'lucide-react';

const CATEGORY_CONFIG = {
  food: { label: 'Ăn uống', icon: Utensils, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  transport: { label: 'Di chuyển', icon: Car, bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  hotel: { label: 'Khách sạn', icon: Hotel, bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  entertainment: { label: 'Giải trí', icon: PartyPopper, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  shopping: { label: 'Mua sắm', icon: ShoppingBag, bg: 'bg-pink-50 text-pink-700 border-pink-200' },
  tickets: { label: 'Vé tham quan', icon: Ticket, bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  fuel: { label: 'Xăng xe', icon: Fuel, bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  other: { label: 'Khác', icon: HelpCircle, bg: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const SPLIT_LABELS = {
  equal: 'Chia đều',
  custom: 'Tùy chỉnh',
  percentage: 'Phần trăm',
  weighted: 'Theo phần',
};

export default function ExpenseCardView({
  expenses = [],
  members = [],
  onEdit,
  onDuplicate,
  onDelete,
  onViewReceipt
}) {
  const memberMap = new Map(members.map(m => [m.id, m]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {expenses.map(exp => {
        const cat = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.other;
        const Icon = cat.icon;
        const payer = memberMap.get(exp.payerId);
        const participantCount = exp.participantIds?.length || 0;

        return (
          <div
            key={exp.id}
            className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 shadow-xs transition-all hover:shadow-md flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Category & Amount */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cat.bg}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </span>
                <CurrencyDisplay amount={exp.amount} size="lg" />
              </div>

              {/* Title & Date */}
              <h3 className="font-bold text-slate-800 text-sm mb-1 leading-snug line-clamp-2">
                {exp.title}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {formatDateTime(exp.date, exp.time)}
              </p>

              {/* Payer and Participants */}
              <div className="space-y-2 py-2.5 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Người trả:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: payer?.avatarColor || '#10B981' }}
                    >
                      {(payer?.nickname || payer?.name || '?')[0]}
                    </div>
                    <span>{payer?.nickname || payer?.name || 'Không rõ'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Chia cho:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                      <Users className="w-3 h-3 text-slate-400" />
                      {participantCount} người ({SPLIT_LABELS[exp.splitType] || exp.splitType})
                    </span>
                  </div>
                </div>

                {exp.note && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg line-clamp-2">
                    "{exp.note}"
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
              {exp.receipt ? (
                <button
                  type="button"
                  onClick={() => onViewReceipt(exp.receipt, exp.title)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <FileImage className="w-3.5 h-3.5" /> Hóa đơn
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Không có hóa đơn</span>
              )}

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDuplicate(exp.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Nhân bản khoản chi"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(exp)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(exp)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Xóa khoản chi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
