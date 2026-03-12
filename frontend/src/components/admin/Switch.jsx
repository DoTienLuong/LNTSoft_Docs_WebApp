import React from 'react';

export default function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald-600' : 'bg-gray-300'} ${disabled ? 'opacity-50' : ''}`}
      aria-pressed={!!checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}
