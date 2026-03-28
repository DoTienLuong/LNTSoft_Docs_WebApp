// components/category/shared/categoryStyle.js
// Centralized category styles that support dark and light modes.
// Export a helper getCategoryStyles(effective) that returns an object of class strings.

export function getCategoryStyles(effective) {
  const isDark = effective === "dark";

  if (isDark) {
    return {
      // Sidebar container
      listStyle:
        "w-full md:w-72 bg-[#041026] text-[#e6eef8] p-2 flex flex-col h-full min-h-0 overflow-hidden rounded-r-md",

      // selected row
      isSelected: "bg-[#07203a] text-white rounded-md px-3 py-2 border-l-4 border-[#2b9bf0]",

      // per-level row styles
      parentColor: "px-4 py-2 text-base text-[#e6eef8] hover:bg-[#07203a] rounded-md",
      childColor: "px-4 py-1.5 text-sm text-[#cbd8ea] hover:bg-[#07203a] rounded-md",
      level3Color: "px-4 py-1 text-sm text-[#bfcfe6] hover:bg-[#07203a] rounded-md",
      level4Color: "px-4 py-1 text-sm text-[#bfcfe6] hover:bg-[#07203a] rounded-md",

      // header / title classes used in container top area
      headerBorderClass: "",
      titleTextClass: "text-slate-100",
      secondaryTextClass: "text-slate-300",
    };
  }

  // light theme
  return {
    listStyle:
      "w-full md:w-72 bg-white text-gray-900 p-2 flex flex-col h-full min-h-0 overflow-hidden rounded-r-md",
    isSelected: "bg-gray-100 text-gray-900 rounded-md px-3 py-2 border-l-4 border-blue-500",
    parentColor: "px-4 py-2 text-base text-gray-900 hover:bg-gray-100 rounded-md",
    childColor: "px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md",
    level3Color: "px-4 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md",
    level4Color: "px-4 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md",
    headerBorderClass: "",
    titleTextClass: "text-gray-900",
    secondaryTextClass: "text-gray-600",
  };
}

// Backwards-compatible default export (dark mode) and named export for convenience
export const categoryColors = getCategoryStyles("dark");
