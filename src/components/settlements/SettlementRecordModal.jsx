import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { validateSettlement } from '../../utils/validators';
import { getTodayString } from '../../utils/date';
import confetti from 'canvas-confetti';
import { CreditCard, Banknote, Smartphone, HelpCircle } from 'lucide-react';

const METHODS = [
  { id: 'bank_transfer', label: 'Chuyển khoản', icon: CreditCard },
  { id: 'cash', label: 'Tiền mặt', icon: Banknote },
  { id: 'e_wallet', label: 'Ví MoMo / ZaloPay', icon: Smartphone },
  { id: 'other', label: 'Khác', icon: HelpCircle },
];

export default function SettlementRecordModal({
  isOpen,
  onClose,
  initialData,
  members = [],
  memberBalances = null,
  onSave
}) {
  const [fromMemberId, setFromMemberId] = useState('');
  const [toMemberId, setToMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [date, setDate] = useState(getTodayString());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFromMemberId(initialData.fromMemberId || '');
        setToMemberId(initialData.toMemberId || '');
        setAmount(initialData.amount ? String(initialData.paidAmount || initialData.amount) : '');
        setPaymentMethod(initialData.paymentMethod || 'bank_transfer');
        setDate(initialData.date || getTodayString());
        setNote(initialData.note || '');
      } else {
        setFromMemberId(members[0]?.id || '');
        setToMemberId(members[1]?.id || '');
        setAmount('');
        setPaymentMethod('bank_transfer');
        setDate(getTodayString());
        setNote('');
      }
      setErrors({});
    }
  }, [isOpen, initialData, members]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      fromMemberId,
      toMemberId,
      amount: Number(amount) || 0,
      paidAmount: Number(amount) || 0,
      paymentMethod,
      date,
      note
    };

    const isEdit = Boolean(initialData && initialData.isEdit && initialData.id);
    const originalPaid = isEdit ? (initialData.paidAmount || initialData.amount || 0) : 0;

    const validation = validateSettlement(payload, members, {
      memberBalances,
      editingSettlementAmount: originalPaid
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(payload, isEdit ? initialData.id : null);

    // Fire festive confetti effect if not editing
    if (!isEdit) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Ignore if canvas-confetti is not available
      }
    }

    onClose();
  };

  const isEdit = Boolean(initialData && initialData.isEdit && initialData.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa khoản quyết toán" : "Ghi nhận thanh toán quyết toán"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* From and To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Người chuyển tiền <span className="text-rose-500">*</span>
            </label>
            <select
              value={fromMemberId}
              onChange={(e) => setFromMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nickname || m.name}
                </option>
              ))}
            </select>
            {errors.fromMemberId && <p className="text-xs text-rose-500 mt-1">{errors.fromMemberId}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Người nhận tiền <span className="text-rose-500">*</span>
            </label>
            <select
              value={toMemberId}
              onChange={(e) => setToMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nickname || m.name}
                </option>
              ))}
            </select>
            {errors.toMemberId && <p className="text-xs text-rose-500 mt-1">{errors.toMemberId}</p>}
          </div>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Số tiền đã trả (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="0 ₫"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors({ ...errors, amount: undefined });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 transition-all ${
                errors.amount ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
              }`}
            />
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ngày thanh toán <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Hình thức thanh toán
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {METHODS.map(method => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Ghi chú (Tùy chọn)
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Chuyển khoản Techcombank, trả tiền mặt tại quán..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm shadow-emerald-600/20 transition-all active:scale-98"
          >
            Xác nhận đã trả
          </button>
        </div>
      </form>
    </Modal>
  );
}
