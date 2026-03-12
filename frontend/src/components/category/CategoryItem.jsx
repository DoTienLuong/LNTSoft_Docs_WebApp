// src/components/category/admin/AdminCategoryItem.jsx

import React from "react";

export default function CategoryItem({
  category,
  isSelected,
  onSelect,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  editState,
  onDelete,
  // thêm props mới
  hasChildren = false,
  isOpen = false,
  toggleParent = () => {},
  isChild = false,
  styles,
  level,
  isReadOnly = false,
}) {
  let baseStyle;

  if (isSelected) {
    baseStyle = styles.isSelected;
  } else {
    if (level === 0) baseStyle = styles.parentColor; // Level 1
    else if (level === 1) baseStyle = styles.childColor; // Level 2
    else if (level === 2) baseStyle = styles.level3Color; // Level 3
    else if (level === 3) baseStyle = styles.level4Color; // Level 4
  }
  return (
    <div
      onClick={() => onSelect(category.id)}
      style={{ paddingLeft: `${level * 12}px` }}
      className={`relative group py-1 px-2 text-sm font-medium cursor-pointer transition flex items-center w-full ${baseStyle}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {(!isReadOnly && editState.editingId === category.id) ? (
          <div className="flex flex-col gap-2 w-full">
            <input
              value={editState.editTitle}
              onChange={(e) => onEditChange?.("title", e.target.value)}
              className="border px-2 py-1 text-sm rounded w-full"
              placeholder="Title"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onEditSave(category.id)}
                className="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md"
              >
                Save
              </button>
              <button
                onClick={onEditCancel}
                className="flex-1 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="flex-none w-4 inline-flex justify-center">
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleParent();
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  aria-expanded={isOpen}
                  title={isOpen ? "Collapse" : "Expand"}
                >
                  {isOpen ? "▾" : "▸"}
                </button>
              ) : (
                <span className="text-xs text-transparent">▸</span>
              )}
            </span>
            <span className="truncate">{category.title}</span>
          </>
        )}
      </div>
      {!isReadOnly && editState.editingId !== category.id && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
          <button
            onClick={(e) => {
              onEditStart?.(category);
            }}
            className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px]"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              onDelete?.(category.id);
            }}
            className="p-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px]"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
