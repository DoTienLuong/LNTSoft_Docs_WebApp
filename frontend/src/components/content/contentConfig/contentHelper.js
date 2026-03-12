// Giữ format inline khi Enter (clone đúng logic từ ContentViewer của bạn)
export function attachEnterKeepsInlineFormats(quill) {
  if (!quill || quill.__enterKeepInlineBound) return;
  quill.__enterKeepInlineBound = true;

  quill.keyboard.addBinding({ key: 13 }, function (range) {
    const prevFormats = quill.getFormat(Math.max(0, range.index - 1), 1) || {};
    this.quill.insertText(range.index, "\n", "user");
    const newIndex = range.index + 1;

    const keep = ["font", "size", "bold", "italic", "underline", "strike", "color", "background", "code"];
    keep.forEach((k) => {
      if (prevFormats[k]) {
        quill.formatText(newIndex, 0, k, prevFormats[k], "user");
        quill.format(k, prevFormats[k], "user");
      }
    });

    quill.setSelection(newIndex, 0, "silent");
    return false;
  });
}

export function sortByOrder(list) {
  return [...list].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
}

export function sortByUpdatedDesc(list) {
  return [...list].sort((a, b) => {
    const ta = new Date(a.updated_at || a.created_at || 0).getTime();
    const tb = new Date(b.updated_at || b.created_at || 0).getTime();
    return tb - ta;
  });
}
