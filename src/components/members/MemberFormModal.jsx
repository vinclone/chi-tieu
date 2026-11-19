import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { validateMember } from '../../utils/validators';

const AVATAR_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

export default function MemberFormModal({
  isOpen,
  onClose,
  memberToEdit,
  existingMembers = [],
  onSave
}) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setNickname(memberToEdit.nickname || '');
      setAvatarColor(memberToEdit.avatarColor || AVATAR_COLORS[0]);
      setNote(memberToEdit.note || '');
    } else {
      setName('');
      setNickname('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      setNote('');
    }
    setErrors({});
  }, [memberToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      id: memberToEdit?.id,
      name,
      nickname: nickname || name.trim().split(' ').pop(),
      avatarColor,
      note
    };

    const validation = validateMember(payload, existingMembers);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Nguyễn Hoàng Vinh"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tên gọi / Biệt danh (Để hiển thị ngắn gọn)
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Vinh, Minh Béo, Huy Tay Lái..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Màu đại diện
          </label>
          <div className="flex items-center gap-3">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatarColor(color)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  avatarColor === color ? 'ring-4 ring-slate-300 scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Ghi chú / Vai trò
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Trưởng đoàn, thủ quỹ, chụp ảnh..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
          />
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
            {memberToEdit ? 'Lưu thay đổi' : 'Thêm thành viên'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
