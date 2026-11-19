import React, { useState, useEffect } from 'react';
import { X, Save, Settings } from 'lucide-react';
import { parseCurrencyInput } from '../../utils/currency.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function GroupEditModal({
  isOpen,
  onClose,
  group,
  onSaveGroup
}) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [tripName, setTripName] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('2 ngày 1 đêm');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [representative, setRepresentative] = useState('');
  const [plannedContribution, setPlannedContribution] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (group && isOpen) {
      setName(group.name || '');
      setTripName(group.tripName || group.name || '');
      setLocation(group.location || '');
      setDuration(group.duration || '2 ngày 1 đêm');
      setStartDate(group.startDate || '');
      setEndDate(group.endDate || '');
      setRepresentative(group.representative || '');
      setPlannedContribution(group.plannedContribution ? String(group.plannedContribution) : '450000');
      setDescription(group.description || '');
    }
  }, [group, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên nhóm hoặc chuyến đi', 'warning');
      return;
    }

    onSaveGroup(group.id, {
      name: name.trim(),
      tripName: tripName.trim() || name.trim(),
      location: location.trim(),
      duration: duration.trim(),
      startDate,
      endDate,
      representative: representative.trim() || 'Đại diện nhóm',
      plannedContribution: parseCurrencyInput(plannedContribution),
      description: description.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-700 text-white rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cài Đặt Thông Tin Chuyến Đi & Quỹ
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật thông tin đoàn, đại diện và định mức đóng quỹ
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tên chuyến đi / Nhóm:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Chuyến đi Dã ngoại Cuối tuần"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Địa điểm:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Ba Vì, Hà Nội"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Thời lượng:
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="VD: 2 ngày 1 đêm"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Ngày bắt đầu:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Ngày kết thúc:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Người đại diện / Thủ quỹ:
              </label>
              <input
                type="text"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Định mức đóng quỹ / người (VNĐ):
              </label>
              <input
                type="text"
                value={plannedContribution ? Number(plannedContribution).toLocaleString('vi-VN') : ''}
                onChange={(e) => setPlannedContribution(e.target.value)}
                placeholder="450.000"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Mô tả ghi chú chuyến đi:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú thêm về chuyến đi..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
