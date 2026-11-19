import React, { useState } from 'react';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import {
  Copy,
  Edit2,
  Trash2,
  FileImage,
  ArrowUpDown,
  CheckSquare,
  Square
} from 'lucide-react';

const CATEGORY_NAMES = {
  food: 'Ăn uống',
  transport: 'Di chuyển',
  hotel: 'Khách sạn',
  entertainment: 'Giải trí',
  shopping: 'Mua sắm',
  tickets: 'Vé tham quan',
  fuel: 'Xăng xe',
  other: 'Khác',
};

const SPLIT_NAMES = {
  equal: 'Chia đều',
  custom: 'Tùy chỉnh',
  percentage: 'Phần trăm',
  weighted: 'Theo phần',
};

export default function ExpenseSpreadsheetView({
  expenses = [],
  members = [],
  onEdit,
  onDuplicate,
  onDelete,
  onBulkDelete,
  onViewReceipt
}) {
  const memberMap = React.useMemo(() => new Map(members.map(m => [m.id, m])), [members]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const isAllSelected = expenses.length > 0 && selectedIds.length === expenses.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map(e => e.id));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedExpenses = React.useMemo(() => {
    const list = [...expenses];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.date + 'T' + (a.time || '00:00')) - new Date(b.date + 'T' + (b.time || '00:00'));
      } else if (sortField === 'title') {
        cmp = a.title.localeCompare(b.title, 'vi');
      } else if (sortField === 'category') {
        cmp = (CATEGORY_NAMES[a.category] || a.category).localeCompare(CATEGORY_NAMES[b.category] || b.category, 'vi');
      } else if (sortField === 'payer') {
        const payerA = memberMap.get(a.payerId)?.name || '';
        const payerB = memberMap.get(b.payerId)?.name || '';
        cmp = payerA.localeCompare(payerB, 'vi');
      } else if (sortField === 'amount') {
        cmp = Number(a.amount) - Number(b.amount);
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [expenses, sortField, sortDirection, memberMap]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs font-semibold text-emerald-900">
          <span>Đã chọn {selectedIds.length} khoản chi</span>
          <button
            type="button"
            onClick={() => {
              onBulkDelete(selectedIds);
              setSelectedIds([]);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa các mục đã chọn
          </button>
        </div>
      )}

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto max-h-[650px] relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100/90 sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs select-none">
            <tr className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {isAllSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th
                className="py-3 px-3 min-w-[95px] cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Ngày</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-3 min-w-[200px] cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  <span>Tên khoản chi</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-3 min-w-[100px] cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  <span>Danh mục</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-3 min-w-[120px] cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('payer')}
              >
                <div className="flex items-center gap-1">
                  <span>Người trả</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-3 min-w-[130px] text-right cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Số tiền</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 min-w-[90px]">Cách chia</th>
              <th className="py-3 px-3 min-w-[160px]">Tham gia</th>
              <th className="py-3 px-3 min-w-[140px]">Ghi chú</th>
              <th className="py-3 px-3 w-28 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {sortedExpenses.map((exp, idx) => {
              const isSelected = selectedIds.includes(exp.id);
              const payer = memberMap.get(exp.payerId);
              const participantNames = (exp.participantIds || [])
                .map(id => memberMap.get(id)?.nickname || memberMap.get(id)?.name || id)
                .join(', ');

              return (
                <tr
                  key={exp.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-emerald-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleRow(exp.id)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {formatDate(exp.date)}
                    {exp.time && <span className="text-[10px] text-slate-400 block">{exp.time}</span>}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="line-clamp-1">{exp.title}</span>
                      {exp.receipt && (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(exp.receipt, exp.title)}
                          className="text-emerald-600 hover:text-emerald-800 shrink-0"
                          title="Xem ảnh hóa đơn"
                        >
                          <FileImage className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {CATEGORY_NAMES[exp.category] || exp.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-800">
                    {payer?.nickname || payer?.name || 'Không rõ'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[11px] text-slate-600">
                      {SPLIT_NAMES[exp.splitType] || exp.splitType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]" title={participantNames}>
                    {participantNames}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[140px]" title={exp.note}>
                    {exp.note || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDuplicate(exp.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                        title="Nhân bản"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(exp)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(exp)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
