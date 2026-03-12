// Theme-aware style map for content components (dark + light)
export function getContentStyles(effective) {
  const isDark = effective === "dark";
  if (isDark) {
    return {
      container: "flex-1 p-6 overflow-y-auto h-full bg-[#041026] text-[#e6eef8]",
      title: "text-2xl md:text-3xl font-bold mb-6 text-white",
      panel: "p-4 rounded mt-6 border border-[#083047] bg-transparent",
      input: "w-full bg-[#07203a] border border-[#083047] px-2 py-1 text-sm rounded mb-2 text-[#e6eef8]",
      labelText: "text-[#cbd8ea]",
      buttonPrimary: "px-4 py-2 bg-[#2b9bf0] text-white rounded",
      buttonPrimarySmall: "px-3 py-1 bg-[#2b9bf0] text-white rounded text-sm",
      buttonSave: "px-4 py-2 bg-green-500 text-white rounded",
      buttonCancel: "px-4 py-2 bg-transparent border border-[#083047] text-[#cbd8ea] rounded",
      editorText: "ql-editor max-w-none mb-4 text-[#cbd8ea]",

      itemCard: "bg-[#07203a] rounded-md shadow-sm p-3 border border-[#083047]",
      itemToggleOpenOn: "bg-[#083047] text-white",
      itemToggleOpenOff: "bg-transparent hover:bg-[#083047] text-[#e6eef8]",
      actionText: "text-[#cbd8ea] hover:text-white",
      actionBlue: "text-[#2b9bf0] hover:text-[#1a7fc8]",
      actionDanger: "text-red-400 hover:text-red-600",

      imageSection: "mt-4 border-t border-[#083047] pt-3",
      imageTitle: "font-medium text-[#e6eef8] mb-2",
      imageFigureBg: "rounded-lg overflow-hidden bg-[#071125] shadow-sm hover:shadow-md transition",
      imageCaption: "absolute bottom-0 left-0 right-0 bg-black/45 text-white text-[11px] leading-4 px-2 py-1 truncate",
      imageButtonEdit: "px-2 py-1 text-[11px] rounded bg-white/10 hover:bg-white/20 text-[#e6eef8] shadow",
      imageButtonDelete: "px-2 py-1 text-[11px] rounded bg-red-600/90 hover:bg-red-600 text-white shadow",

      addImageBtn: "flex items-center gap-1 px-3 py-1.5 bg-[#2b9bf0] text-white rounded hover:bg-[#1a7fc8] text-sm shadow-sm",

      lightboxBg: "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4",
      lightboxText: "text-white/80",

      userContainer: "flex-1 p-8 overflow-y-auto h-full bg-[#041026] text-[#e6eef8]",
      userTitle: "text-3xl md:text-4xl font-extrabold mb-6 text-white",
      proseText: "prose max-w-none text-[#cbd8ea] mb-4",
      articleBorder: "border-[#083047]",
      tocActive: "bg-[#2b9bf0] text-white",
      tocInactive: "text-[#cbd8ea] hover:bg-[#07203a]",
      mutedText: "text-[#9fb7c9]",
    };
  }

  // light theme variants
  return {
    container: "flex-1 p-4 overflow-y-auto h-full bg-white text-gray-900",
    title: "text-2xl md:text-3xl font-bold mb-6 text-gray-900",
    panel: "p-4 rounded-md mt-4 border border-gray-200 bg-white shadow-sm",
    input: "w-full border px-3 py-2 text-sm rounded mb-3 bg-white text-gray-900",
    labelText: "text-gray-600",
    buttonPrimary: "px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700",
    buttonPrimarySmall: "px-3 py-1 bg-blue-600 text-white rounded text-sm shadow-sm hover:bg-blue-700",
    buttonSave: "px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700",
    buttonCancel: "px-3 py-2 bg-transparent border border-gray-200 text-gray-700 rounded",
    editorText: "ql-editor max-w-none mb-4 text-gray-800",

    itemCard: "bg-white rounded-md shadow-sm py-2 px-3 border border-gray-200",
    itemToggleOpenOn: "bg-gray-50 text-gray-900",
    itemToggleOpenOff: "bg-transparent hover:bg-gray-50 text-gray-800",
    actionText: "text-gray-600 hover:text-gray-800 text-sm",
    actionBlue: "text-blue-600 hover:text-blue-700 text-sm",
    actionDanger: "text-red-600 hover:text-red-700 text-sm",

    imageSection: "mt-4 border-t border-gray-200 pt-3",
    imageTitle: "font-medium text-gray-900 mb-2",
    imageFigureBg: "rounded-lg overflow-hidden bg-gray-50 shadow-sm hover:shadow-md transition",
    imageCaption: "absolute bottom-0 left-0 right-0 bg-black/45 text-white text-[11px] leading-4 px-2 py-1 truncate",
    imageButtonEdit: "px-2 py-1 text-[11px] rounded bg-gray-100 hover:bg-gray-200 text-gray-700",
    imageButtonDelete: "px-2 py-1 text-[11px] rounded bg-red-600/90 hover:bg-red-600 text-white shadow",

    addImageBtn: "flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm shadow-sm",

    lightboxBg: "fixed inset-0 z-50 bg-white/90 flex items-center justify-center p-4",
    lightboxText: "text-gray-900",

    userContainer: "flex-1 p-8 overflow-y-auto h-full bg-white text-gray-900",
    userTitle: "text-3xl md:text-4xl font-extrabold mb-6 text-gray-900",
    proseText: "prose max-w-none text-gray-800 mb-4",
    articleBorder: "border-gray-200",
    tocActive: "bg-blue-600 text-white",
    tocInactive: "text-gray-700 hover:bg-gray-100",
    mutedText: "text-gray-500",
  };
}

export const contentStylesDefault = getContentStyles("dark");
