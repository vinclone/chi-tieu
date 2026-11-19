import React from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'danger' // 'danger' | 'warning' | 'info'
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
          type === 'danger' ? 'bg-rose-100 text-rose-600' :
          type === 'warning' ? 'bg-amber-100 text-amber-600' :
          'bg-sky-100 text-sky-600'
        }`}>
          {type === 'danger' && <AlertTriangle className="w-7 h-7" />}
          {type === 'warning' && <AlertCircle className="w-7 h-7" />}
          {type === 'info' && <Info className="w-7 h-7" />}
        </div>

        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-colors shadow-sm ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' :
              type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' :
              'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
