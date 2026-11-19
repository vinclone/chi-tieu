import React from 'react';
import Modal from '../common/Modal';

export default function ReceiptModal({ isOpen, onClose, imageUrl, title }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Hóa đơn / Chứng từ thanh toán"} maxWidth="max-w-2xl">
      <div className="flex flex-col items-center justify-center p-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Hóa đơn"
            className="max-h-[70vh] w-auto object-contain rounded-xl shadow-md border border-slate-200"
          />
        ) : (
          <p className="text-slate-400 text-sm py-8">Không có hình ảnh chứng từ</p>
        )}
      </div>
    </Modal>
  );
}
