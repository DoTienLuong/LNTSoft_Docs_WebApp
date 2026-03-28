import React from 'react';

export default function Select({ label, value, onChange, options, placeholder, includePlaceholder = true, ...rest }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="text-slate-600">{label}</span>}
      <select
        className="border border-slate-300 rounded px-3 py-2 bg-white"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      >
        {includePlaceholder && <option value="">{placeholder || 'Chọn...'}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
