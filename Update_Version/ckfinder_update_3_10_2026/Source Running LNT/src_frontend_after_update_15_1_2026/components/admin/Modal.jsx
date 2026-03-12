import React from 'react';

export default function Modal({ open, title, children, footer, onClose, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full ${maxWidth} bg-white rounded-lg shadow-lg border border-gray-200 max-h-[90vh] flex flex-col`}
             role="dialog" aria-modal="true">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between flex-none">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close">✕</button>
          </div>
          <div className="px-5 py-4 overflow-y-auto flex-1">
            {children}
          </div>
          {footer && (
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2 flex-none">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
