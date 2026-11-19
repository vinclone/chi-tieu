import React, { useState, useRef } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Edit2,
  ClipboardPaste, 
  Sparkles, 
  Search, 
  Tag,
  Calendar,
  UserCheck
} from 'lucide-react';
import { formatCurrency, parseCurrencyInput, parseVietnameseMoneyText } from '../../utils/currency.js';
import { formatDate, getTodayString } from '../../utils/date.js';
import { useToast } from '../../context/ToastContext.jsx';

const EXPENSE_TEMPLATES = [
  { label: 'Ăn trưa', title: 'Ăn trưa cơm niêu' },
  { label: 'BBQ tối', title: 'Tiệc nướng BBQ tối & than hoa' },
  { label: 'Cà phê sáng', title: 'Cà phê sáng & đồ ăn nhẹ' },
  { label: 'Thuê xe', title: 'Thuê xe ô tô di chuyển' },
  { label: 'Vé tham quan', title: 'Vé tham quan danh lam thắng cảnh' },
  { label: 'Nước uống', title: 'Nước suối & nước ngọt giải khát' },
  { label: 'Thuê lều trại', title: 'Thuê lều bạt & bếp nướng' },
  { label: 'Vé qua cầu / đỗ xe', title: 'Phí cầu đường BOT & gửi xe' }
];

export default function CommonExpenseTable({
  expenses = [],
  representative = '',
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onOpenPasteModal,
  onOpenQuickTextModal,
  onOpenAddExpenseModal,
  onOpenEditExpenseModal
}) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Inline fast entry row state
  const [newDate, setNewDate] = useState(getTodayString());
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newRepresentative, setNewRepresentative] = useState(representative || 'Trưởng nhóm');
  const [newNote, setNewNote] = useState('');

  React.useEffect(() => {
    if (representative) setNewRepresentative(representative);
  }, [representative]);

  const titleInputRef = useRef(null);

  const filteredExpenses = expenses.filter(e => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (e.description && e.description.toLowerCase().includes(query)) ||
      (e.title && e.title.toLowerCase().includes(query)) ||
      (e.representative && e.representative.toLowerCase().includes(query)) ||
      (e.note && e.note.toLowerCase().includes(query))
    );
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Vui lòng nhập nội dung khoản chi', 'warning');
      titleInputRef.current?.focus();
      return;
    }

    const amount = parseVietnameseMoneyText(newAmount);
    if (!amount || amount <= 0) {
      showToast('Vui lòng nhập số tiền hợp lệ (VD: 450k, 1tr350 hoặc 630.000)', 'warning');
      return;
    }

    onAddExpense({
      date: newDate || getTodayString(),
      description: newTitle.trim(),
      title: newTitle.trim(),
      amount,
      representative: newRepresentative.trim() || representative || 'Đại diện nhóm',
      note: newNote.trim()
    });

    // Reset inputs but keep date & representative for fast serial entry
    setNewTitle('');
    setNewAmount('');
    setNewNote('');
    titleInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddSubmit();
    }
  };

  const applyTemplate = (title) => {
    setNewTitle(title);
    titleInputRef.current?.focus();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table header bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-700 text-white rounded-lg shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Bảng Chi Tiêu Chung Của Nhóm
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {expenses.length} khoản chi • Đại diện: <strong>{representative || 'Nguyễn Văn An'}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add via Form button */}
          <button
            onClick={onOpenAddExpenseModal}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap shadow-rose-700/20 min-h-[32px]"
            title="Mở form nhập chi tiêu dễ dàng, có gợi ý mẫu và nhập tắt 450k/1tr350"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm chi (Form)</span>
          </button>

          {/* Quick Natural Language Parser */}
          <button
            onClick={onOpenQuickTextModal}
            type="button"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-800 text-xs font-semibold rounded-lg transition-colors min-h-[32px]"
            title="Nhập nhanh bằng một đoạn văn bản: 'Thuê xe 1tr350, ăn trưa 630k...'"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="sm:inline">Nhập chữ</span>
          </button>

          {/* Paste from Excel */}
          <button
            onClick={onOpenPasteModal}
            type="button"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors min-h-[32px]"
            title="Dán nhiều dòng chi tiêu từ Excel hoặc Google Sheets"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="sm:inline">Dán Excel</span>
          </button>

          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm khoản chi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 w-full sm:w-36"
            />
          </div>
        </div>
      </div>

      {/* Quick Chips / Templates */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium">
          <Tag className="w-3 h-3" /> Mẫu:
        </span>
        {EXPENSE_TEMPLATES.map((tmpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyTemplate(tmpl.title)}
            className="px-2.5 py-0.5 bg-white hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 rounded-full shrink-0 transition-colors whitespace-nowrap"
          >
            {tmpl.label}
          </button>
        ))}
      </div>

      {/* MOBILE VIEW: Responsive Touch Cards (md:hidden) */}
      <div className="md:hidden divide-y divide-slate-100 overflow-y-auto flex-1 p-2.5 space-y-2.5">
        {filteredExpenses.length === 0 && (
          <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-600">Chưa có khoản chi nào</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Bấm "Thêm chi (Form)" hoặc nhập nhanh bên dưới</p>
          </div>
        )}
        {filteredExpenses.map((expense, index) => (
          <div key={expense.id} className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {formatDate(expense.date)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">
                  {expense.description || expense.title}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-base text-rose-700 block">
                  {formatCurrency(expense.amount)}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {expense.representative || representative}
                </span>
              </div>
            </div>

            {/* Note row */}
            <div>
              <input
                type="text"
                placeholder="Ghi chú (Note): hóa đơn, quán ăn..."
                value={expense.note || ''}
                onChange={(e) => onUpdateExpense(expense.id, { note: e.target.value })}
                className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-600 shadow-2xs"
              />
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => onOpenEditExpenseModal && onOpenEditExpenseModal(expense)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-700 bg-white border border-slate-200 rounded-lg text-xs font-medium"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Sửa</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteExpense(expense.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 bg-white border border-slate-200 rounded-lg text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        ))}

        {/* Mobile Quick Add Card */}
        <div className="bg-rose-50/60 border-2 border-dashed border-rose-300 rounded-xl p-3 space-y-2">
          <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Thêm nhanh khoản chi
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-32 bg-white border border-slate-300 focus:border-rose-500 rounded-lg px-2 py-1.5 text-xs outline-none font-mono"
            />
            <input
              type="text"
              placeholder="VD: 450k, 1tr350"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-right bg-white border border-slate-300 focus:border-rose-500 rounded-lg px-2 py-1.5 text-xs outline-none font-mono font-bold text-rose-700"
            />
          </div>
          <input
            ref={titleInputRef}
            type="text"
            placeholder="Nội dung khoản chi (Ăn uống, thuê xe...)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs outline-none font-medium min-h-[36px]"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ghi chú thêm..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-white border border-slate-300 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs outline-none min-h-[36px]"
            />
            <button
              onClick={handleAddSubmit}
              type="button"
              className="px-3.5 py-1.5 bg-rose-600 active:bg-rose-700 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 shadow-xs min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP SPREADSHEET TABLE (hidden md:block) */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <th className="py-2 px-2 w-9 text-center">STT</th>
              <th className="py-2 px-2 min-w-[85px]">Ngày</th>
              <th className="py-2 px-2 min-w-[150px]">Khoản chi</th>
              <th className="py-2 px-2 min-w-[95px]">Người chi</th>
              <th className="py-2 px-2 min-w-[95px] text-right">Số tiền</th>
              <th className="py-2 px-3 min-w-[150px]">Ghi chú (Note)</th>
              <th className="py-2 px-1 w-14 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-xs font-semibold text-slate-600">Chưa có khoản chi nào</span>
                    <span className="text-[11px] text-slate-400">Bấm "Thêm chi (Form)" hoặc nhập nhanh dòng bên dưới</span>
                  </div>
                </td>
              </tr>
            )}
            {filteredExpenses.map((expense, index) => (
              <tr key={expense.id} className="hover:bg-rose-50/30 transition-colors group">
                <td className="py-2 px-3 text-center text-slate-500 font-mono">
                  {index + 1}
                </td>
                <td className="py-2 px-3 text-slate-600 font-mono">
                  <input
                    type="date"
                    value={expense.date}
                    onChange={(e) => onUpdateExpense(expense.id, { date: e.target.value })}
                    className="bg-transparent border-transparent hover:border-slate-300 focus:border-rose-500 focus:bg-white rounded px-1 py-0.5 outline-none font-mono text-xs transition-colors"
                  />
                </td>
                <td className="py-2 px-3 font-medium text-slate-900">
                  <input
                    type="text"
                    value={expense.description || expense.title || ''}
                    onChange={(e) => onUpdateExpense(expense.id, { description: e.target.value, title: e.target.value })}
                    className="w-full bg-transparent border-transparent hover:border-slate-300 focus:border-rose-500 focus:bg-white rounded px-1 py-0.5 outline-none transition-colors"
                  />
                </td>
                <td className="py-2 px-3 text-slate-700">
                  <input
                    type="text"
                    value={expense.representative || representative || ''}
                    onChange={(e) => onUpdateExpense(expense.id, { representative: e.target.value })}
                    className="w-full bg-transparent border-transparent hover:border-slate-300 focus:border-rose-500 focus:bg-white rounded px-1 py-0.5 outline-none transition-colors"
                  />
                </td>
                <td className="py-2 px-3 text-right font-medium text-slate-900">
                  <input
                    type="text"
                    value={expense.amount?.toLocaleString('vi-VN') || ''}
                    onChange={(e) => {
                      const parsed = parseCurrencyInput(e.target.value);
                      onUpdateExpense(expense.id, { amount: parsed });
                    }}
                    className="w-full text-right bg-transparent border-transparent hover:border-slate-300 focus:border-rose-500 focus:bg-white rounded px-1 py-0.5 outline-none font-mono font-semibold text-rose-700 transition-colors"
                  />
                </td>
                <td className="py-2 px-3 text-slate-600">
                  <input
                    type="text"
                    value={expense.note || ''}
                    placeholder="Ghi chú thêm..."
                    onChange={(e) => onUpdateExpense(expense.id, { note: e.target.value })}
                    className="w-full bg-transparent border-transparent hover:border-slate-300 focus:border-rose-500 focus:bg-white rounded px-1 py-0.5 outline-none text-xs transition-colors"
                  />
                </td>
                <td className="py-2 px-2 text-center whitespace-nowrap">
                  <button
                    onClick={() => onOpenEditExpenseModal && onOpenEditExpenseModal(expense)}
                    type="button"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition-all mr-1"
                    title="Chỉnh sửa khoản chi bằng form"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    type="button"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
                    title="Xóa khoản chi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate-400 text-xs">
                  Chưa có khoản chi nào. Bạn có thể nhập nhanh vào dòng dưới đây.
                </td>
              </tr>
            )}

            {/* Fast Inline Row for Adding New Expenses */}
            <tr className="bg-rose-50/40 border-t-2 border-rose-200">
              <td className="py-2 px-3 text-center text-rose-700 font-bold">
                +
              </td>
              <td className="py-2 px-3">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded px-1.5 py-1 text-xs outline-none font-mono shadow-sm"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Nội dung chi (Ăn trưa, xe cộ...)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded px-2 py-1 text-xs outline-none shadow-sm"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="Người chi"
                  value={newRepresentative}
                  onChange={(e) => setNewRepresentative(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded px-2 py-1 text-xs outline-none shadow-sm"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="VD: 450k, 1tr350"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-right bg-white border border-slate-300 focus:border-rose-500 rounded px-2 py-1 text-xs outline-none font-mono shadow-sm"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="Ghi chú (nhà xe, hóa đơn...)"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded px-2 py-1 text-xs outline-none shadow-sm"
                />
              </td>
              <td className="py-2 px-2 text-center">
                <button
                  onClick={handleAddSubmit}
                  type="button"
                  className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors shadow-sm"
                  title="Thêm khoản chi (Enter)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Total Bar (Full-width, cleanly formatted on both mobile & desktop) */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-800">
        <span>Tổng chi tiêu ({expenses.length} khoản):</span>
        <span className="font-mono text-rose-700 font-bold text-sm whitespace-nowrap">
          {formatCurrency(totalExpenseAmount)}
        </span>
      </div>
    </div>
  );
}
