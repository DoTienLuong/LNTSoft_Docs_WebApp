// components/content/ContentList.jsx
import React from "react";
import ContentItem from "./ContentItem";
import { useTheme } from "../../contexts/ThemeContext";
import { getContentStyles } from "./contentConfig/contentStyles";

export default function ContentList({
  items, openMap, editingId,
  onToggleOpen, onEdit, onDelete, onMove,
  editBindings,
  isReadOnly = false,
}) {
  const { effective } = useTheme();
  const theme = getContentStyles(effective);
  if (!items?.length) return <div className={`text-sm ${theme.mutedText}`}>Chưa có nội dung.</div>;
  return (
    <div className="space-y-4">
      {items.map((c, idx) => (
        <ContentItem
          key={c.id}
          item={c}
          isOpen={!!openMap[c.id]}
          isFirst={idx === 0}
          isLast={idx === items.length - 1}
          isEditing={editingId === c.id}
          onToggle={() => onToggleOpen(c.id)}
          onEdit={onEdit ? () => onEdit(c) : undefined}
          onDelete={onDelete ? () => onDelete(c.id) : undefined}
          onMoveUp={onMove ? () => onMove(c, "up") : undefined}
          onMoveDown={onMove ? () => onMove(c, "down") : undefined}
          editBindings={editBindings}
          isReadOnly={isReadOnly}
        />
      ))}
    </div>
  );
}
