// src/components/category/admin/AdminCategoryForm.jsx
import React from "react";
export default function CategoryForm({
  categories,
  newTitle,
  setNewTitle,
  newParent,
  setNewParent,
  onSave,
  onCancel,
  dark = false,
}) {
  const containerClass = dark
    ? "mt-4 space-y-2 p-3 rounded-md bg-slate-800 border border-slate-700 text-slate-100"
    : "mt-4 space-y-2 border p-3 rounded-md bg-white shadow-sm";

  const inputClass = dark
    ? "w-full border border-slate-600 px-2 py-1 text-sm rounded bg-slate-700 text-slate-100 placeholder-slate-400"
    : "w-full border px-2 py-1 text-sm rounded";

  const selectClass = inputClass;

  const cancelClass = dark
    ? "flex-1 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-md"
    : "flex-1 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded-md";

  return (
    <div className={containerClass}>
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="New category title"
        className={inputClass}
      />
      <select
        value={newParent || ""}
        onChange={(e) => setNewParent(e.target.value || null)}
        className={selectClass}
      >
        <option value="">-- Root --</option>
        {categories
          .filter(
            (c) =>
              !c.parent_id || // cấp 1
              categories.some(
                (p) => p.id === c.parent_id && !p.parent_id // cấp 2
              )
          )
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.parent_id ? `↳ ${c.title} (level 2)` : `${c.title} (level 1)`}
            </option>
          ))}
      </select>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md"
        >
          Save
        </button>
        <button onClick={onCancel} className={cancelClass}>
          Cancel
        </button>
      </div>
    </div>
  );
}
