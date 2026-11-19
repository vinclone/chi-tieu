import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { validateGroup } from '../../utils/validators';

const THEMES = [
  { id: 'emerald', label: 'Xanh ngọc', class: 'from-emerald-500 to-teal-600' },
  { id: 'sky', label: 'Xanh da trời', class: 'from-sky-500 to-blue-600' },
  { id: 'indigo', label: 'Xanh chàm', class: 'from-indigo-500 to-purple-600' },
  { id: 'rose', label: 'Hồng sen', class: 'from-rose-500 to-pink-600' },
  { id: 'amber', label: 'Cam hổ phách', class: 'from-amber-500 to-orange-600' },
];

export default function GroupFormModal({ isOpen, onClose, groupToEdit, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: '',
    theme: 'emerald'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (groupToEdit) {
      setFormData({
        name: groupToEdit.name || '',
        description: groupToEdit.description || '',
        location: groupToEdit.location || '',
        startDate: groupToEdit.startDate || '',
        endDate: groupToEdit.endDate || '',
        budget: groupToEdit.budget ? String(groupToEdit.budget) : '',
        theme: groupToEdit.theme || 'emerald'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        budget: '',
        theme: 'emerald'
      });
    }
    setErrors({});
  }, [groupToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateGroup(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave({
      ...formData,
      budget: formData.budget ? Number(formData.budget) : 0
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={groupToEdit ? 'Chỉnh sửa thông tin chuyến đi' : 'Tạo chuyến đi / Nhóm mới'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tên chuyến đi / Nhóm <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Đà Lạt 2026, Du lịch Phú Quốc, Ăn lẩu cuối tuần..."
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Địa điểm
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Đà Lạt, Vũng Tàu, Hà Nội..."
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ngày kết thúc
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => {
                setFormData({ ...formData, endDate: e.target.value });
                if (errors.endDate) setErrors({ ...errors, endDate: undefined });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.endDate ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
              }`}
            />
            {errors.endDate && <p className="text-xs text-rose-500 mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Ngân sách dự kiến (VNĐ)
          </label>
          <input
            type="number"
            min="0"
            step="50000"
            placeholder="Ví dụ: 15000000"
            value={formData.budget}
            onChange={(e) => {
              setFormData({ ...formData, budget: e.target.value });
              if (errors.budget) setErrors({ ...errors, budget: undefined });
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.budget ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
          />
          {errors.budget && <p className="text-xs text-rose-500 mt-1">{errors.budget}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Mô tả / Ghi chú
          </label>
          <textarea
            rows="2"
            placeholder="Mô tả tóm tắt về chuyến đi..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        {/* Theme color */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Màu chủ đề
          </label>
          <div className="flex items-center gap-3">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setFormData({ ...formData, theme: theme.id })}
                className={`w-8 h-8 rounded-full bg-gradient-to-tr ${theme.class} transition-transform ${
                  formData.theme === theme.id ? 'ring-4 ring-slate-300 scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                }`}
                title={theme.label}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
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
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm shadow-emerald-600/20 transition-all"
          >
            {groupToEdit ? 'Lưu thay đổi' : 'Tạo chuyến đi'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
