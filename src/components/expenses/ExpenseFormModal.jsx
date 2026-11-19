import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Receipt, 
  Calendar, 
  User, 
  Tag, 
  Sparkles, 
  Check, 
  DollarSign, 
  FileText,
  Utensils,
  Car,
  Hotel,
  Ticket,
  Coffee,
  Flame,
  HelpCircle
} from 'lucide-react';
import { parseVietnameseMoneyText, formatCurrency } from '../../utils/currency.js';
import { getTodayString, formatDate } from '../../utils/date.js';
import { useToast } from '../../context/ToastContext.jsx';

const PRESET_EXPENSES = [
  { title: 'Ăn trưa cơm niêu', category: 'food', icon: Utensils, defaultAmount: '630k' },
  { title: 'Đồ nướng BBQ tối', category: 'food', icon: Flame, defaultAmount: '360k' },
  { title: 'Cà phê sáng & đồ ăn nhẹ', category: 'food', icon: Coffee, defaultAmount: '180k' },
  { title: 'Thuê xe ô tô di chuyển', category: 'transport', icon: Car, defaultAmount: '1tr350' },
  { title: 'Vé tham quan khu du lịch', category: 'tickets', icon: Ticket, defaultAmount: '450k' },
  { title: 'Nước suối & nước ngọt', category: 'food', icon: Utensils, defaultAmount: '150k' },
  { title: 'Thuê lều trại qua đêm', category: 'accommodation', icon: Hotel, defaultAmount: '360k' },
  { title: 'Phí cầu đường BOT & gửi xe', category: 'transport', icon: Car, defaultAmount: '30k' },
];

const CATEGORIES = [
  { id: 'food', label: 'Ăn uống', icon: Utensils, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'transport', label: 'Di chuyển / Xe', icon: Car, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'accommodation', label: 'Lưu trú / Lều', icon: Hotel, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'tickets', label: 'Vé tham quan', icon: Ticket, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'other', label: 'Chi phí khác', icon: HelpCircle, color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export default function ExpenseFormModal({
  isOpen,
  onClose,
  expenseToEdit = null,
  onSave,
  members = [],
  defaultRepresentative = ''
}) {
  const { showToast } = useToast();
  const titleInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [representative, setRepresentative] = useState(defaultRepresentative || 'Nguyễn Văn An');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');

  // Parsed amount in integer VND
  const parsedAmount = parseVietnameseMoneyText(rawAmount);

  // Pre-fill when editing or reset when adding
  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setTitle(expenseToEdit.description || expenseToEdit.title || '');
        setRawAmount(expenseToEdit.amount ? String(expenseToEdit.amount) : '');
        setDate(expenseToEdit.date || getTodayString());
        setRepresentative(expenseToEdit.representative || defaultRepresentative || 'Nguyễn Văn An');
        setCategory(expenseToEdit.category || 'food');
        setNote(expenseToEdit.note || '');
      } else {
        setTitle('');
        setRawAmount('');
        setDate(getTodayString());
        setRepresentative(defaultRepresentative || 'Nguyễn Văn An');
        setCategory('food');
        setNote('');
      }
      if (window.innerWidth >= 768) {
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 50);
      }
    }
  }, [isOpen, expenseToEdit, defaultRepresentative]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setCategory(preset.category);
    if (!rawAmount && preset.defaultAmount) {
      setRawAmount(preset.defaultAmount);
    }
    titleInputRef.current?.focus();
  };

  const handleAddQuickAmount = (extra) => {
    const current = parseVietnameseMoneyText(rawAmount);
    const updated = current + extra;
    setRawAmount(String(updated));
  };

  const handleSetQuickDate = (mode) => {
    if (mode === 'today') {
      setDate(getTodayString());
    } else if (mode === 'yesterday') {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      setDate(d.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (keepOpenAfterSave = false) => {
    if (!title.trim()) {
      showToast('Vui lòng nhập nội dung khoản chi', 'warning');
      titleInputRef.current?.focus();
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      showToast('Vui lòng nhập số tiền hợp lệ (VD: 450k, 1tr350 hoặc 630.000)', 'warning');
      return;
    }

    const payload = {
      description: title.trim(),
      title: title.trim(),
      amount: parsedAmount,
      date: date || getTodayString(),
      representative: representative.trim() || defaultRepresentative || 'Đại diện nhóm',
      category: category || 'food',
      note: note.trim()
    };

    onSave(payload, expenseToEdit ? expenseToEdit.id : null);

    if (keepOpenAfterSave) {
      // Clear for next expense but keep date and representative
      setTitle('');
      setRawAmount('');
      setNote('');
      showToast(`Đã lưu "${payload.description}"! Bạn có thể nhập tiếp.`);
      titleInputRef.current?.focus();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-orange-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {expenseToEdit ? 'Chỉnh Sửa Khoản Chi Tiêu' : 'Nhập Khoản Chi Tiêu Mới'}
              </h2>
              <p className="text-xs text-slate-500">
                Chi tiêu chung của đoàn thanh toán từ quỹ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. Quick Presets Bar */}
          {!expenseToEdit && (
            <div>
              <span className="text-[11px] text-slate-500 font-semibold mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Mẫu nhanh (Bấm để chọn nhanh):
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {PRESET_EXPENSES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 rounded-lg text-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 font-medium"
                  >
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Nội dung khoản chi */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              Nội dung khoản chi <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={titleInputRef}
                type="text"
                required
                placeholder="VD: Thuê xe 16 chỗ, ăn trưa cơm niêu, vé tham quan..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('amount-input')?.focus();
                  }
                }}
                className="w-full border border-slate-300 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none shadow-xs font-medium"
              />
            </div>
          </div>

          {/* 3. Số tiền (VND) - Siêu dễ nhập */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-800 font-semibold">
                Số tiền (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Gõ tự nhiên: <code className="bg-slate-100 px-1 rounded">450k</code>, <code className="bg-slate-100 px-1 rounded">1tr350</code>, <code className="bg-slate-100 px-1 rounded">630.000</code>
              </span>
            </div>

            <div className="relative">
              <input
                id="amount-input"
                type="text"
                required
                placeholder="VD: 1tr350 hoặc 450k"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(false);
                  }
                }}
                className="w-full border-2 border-slate-300 focus:border-rose-600 rounded-xl px-3.5 py-2.5 text-base font-bold text-rose-700 outline-none shadow-xs font-mono"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                VNĐ
              </div>
            </div>

            {/* Live Amount Preview & Quick Increment Pills */}
            <div className="flex items-center justify-between mt-1.5 flex-wrap gap-2">
              <div className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                = {formatCurrency(parsedAmount)}
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400 text-[10px]">Cộng thêm:</span>
                <button
                  type="button"
                  onClick={() => handleAddQuickAmount(50000)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 border border-slate-200"
                >
                  +50k
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickAmount(100000)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 border border-slate-200"
                >
                  +100k
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickAmount(200000)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 border border-slate-200"
                >
                  +200k
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickAmount(500000)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 border border-slate-200"
                >
                  +500k
                </button>
              </div>
            </div>
          </div>

          {/* 4. Ngày chi & Người đại diện chi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-800 font-semibold">Ngày chi:</label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate('today')}
                    className="text-emerald-700 hover:underline font-medium"
                  >
                    Hôm nay
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate('yesterday')}
                    className="text-slate-500 hover:underline"
                  >
                    Hôm qua
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 focus:border-rose-500 rounded-xl px-3 py-2 text-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">
                Người chi (Từ quỹ đoàn):
              </label>
              {members.length > 0 ? (
                <select
                  value={representative}
                  onChange={(e) => setRepresentative(e.target.value)}
                  className="w-full border border-slate-300 focus:border-rose-500 rounded-xl px-3 py-2 text-xs outline-none bg-white font-medium"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.name} {m.name === defaultRepresentative ? '(Thủ quỹ / Đại diện)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={representative}
                  onChange={(e) => setRepresentative(e.target.value)}
                  className="w-full border border-slate-300 focus:border-rose-500 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                />
              )}
            </div>
          </div>

          {/* 5. Danh mục chi tiêu (Category Pills) */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1.5">
              Danh mục:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/80 text-rose-800 font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] truncate w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Cột Ghi Chú (Note) */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              Ghi chú (Note):
            </label>
            <input
              type="text"
              placeholder="VD: Nhà xe Tuấn Anh, quán cơm Lá Cọ, hóa đơn 9 người..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-slate-300 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs outline-none text-slate-700 shadow-xs"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold text-center"
          >
            Đóng
          </button>

          {!expenseToEdit && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors min-h-[38px] whitespace-nowrap"
              title="Lưu khoản chi này và giữ form mở để nhập khoản tiếp theo"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nhập tiếp</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors shadow-rose-600/20 min-h-[38px] whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{expenseToEdit ? 'Cập nhật' : 'Lưu khoản chi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
