import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ open, title = 'Xác nhận', message, confirmText = 'Xác nhận', cancelText = 'Huỷ', onConfirm, onCancel, loading }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-gray-700">{message}</p>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50" onClick={onCancel} disabled={loading}> {cancelText} </button>
        <button className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50" onClick={onConfirm} disabled={loading}>
          {loading ? 'Đang xử lý...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
