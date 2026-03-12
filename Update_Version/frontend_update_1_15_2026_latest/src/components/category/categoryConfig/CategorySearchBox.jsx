import React from "react";

// Accept a `dark` prop to style the search box appropriately for dark sidebars
export default function CategorySearchBox({ value, onChange, dark = false }) {
  const base = "w-full mb-3 px-3 py-2 text-sm rounded-lg outline-none";
  const light = "border border-gray-300 bg-gray-50 text-slate-800 focus:ring-2 focus:ring-blue-400 focus:bg-white";
  const darkStyle = "border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:bg-slate-800";

  return (
    <input
      type="text"
      placeholder="Search category..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${base} ${dark ? darkStyle : light}`}
    />
  );
}
