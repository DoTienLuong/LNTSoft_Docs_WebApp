// Centralized theme styles for light and dark modes
// Export a helper to get the classname strings based on effective mode
export const stylesByMode = {
  dark: {
    headerBg: "bg-[#041026] text-[#e6eef8]",
    topBtnBg: "bg-[#07203a] hover:bg-[#083047]",
    searchBg: "bg-[#07203a]",
    subtitleClass: "text-[#cbd8ea]",
    arrowClass: "text-[#cbd8ea]",
    hoverNodeBg: "hover:bg-white/6",
    menuBgClass: "bg-[#07203a] text-[#e6eef8] border border-[#083047]",
    modalContainerClass:
      "relative max-w-6xl w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl overflow-auto max-h-[86vh] z-10",
    modalLoadingClass: "text-sm text-[#cbd8ea]",
    modalCloseBtn: "text-sm px-3 py-1 rounded bg-[#07203a]/80 hover:bg-[#07203a]",
    modalSearchClass:
      "bg-[#07203a] text-sm text-white placeholder-gray-300 outline-none rounded px-3 py-2",
    resultItemBg: "bg-slate-800/30",
    resultPathClass: "text-xs text-[#cbd8ea]",
    // Softer card style for modules (no heavy border, subtle shadow)
    moduleCardClass: "bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl p-5 shadow-lg",
    moduleTitleClass:
      "inline-block px-3 py-1 rounded-full bg-blue-600/80 text-white font-semibold text-sm shadow-sm",
    moduleDescClass: "text-xs text-gray-300 mt-1",
    noTopClass: "text-xs text-gray-400",

    // additional for small inline conditionals
    selectClass: "bg-[#07203a] text-[#e6eef8] border border-[#083047]",
    menuBtnHoverClass: "hover:bg-[#083047]",
    avatarBgClass: "bg-[#07203a]",
    avatarTextClass: "text-[#e6eef8]",
    menuItemHoverClass: "hover:bg-[#083047]",
    menuDangerTextClass: "",
    menuPrimaryTextClass: "",
    // Page background
    pageBgClass: "bg-[#071826]",

    // Header search / dropdown
    // Header search / dropdown
    // Container now handles focus ring via focus-within so we avoid multiple rings (1-2 only)
    headerSearchContainerClass:
      "bg-[#051728] border border-transparent rounded-full px-3 py-2 shadow-sm w-full transition focus-within:ring-2 focus-within:ring-blue-400",
    headerSearchIconClass: "text-blue-300",
    // Input should be visually simple (no extra ring) so the container ring is the main focus indicator
    headerSearchInputClass: "bg-transparent text-sm text-white placeholder-[#9fb7cc] outline-none w-full transition",
    searchDropdownClass:
      "fixed left-1/2 top-24 transform -translate-x-1/2 z-50 bg-slate-900/95 text-white rounded-xl shadow-2xl p-4 w-11/12 md:w-3/4 max-w-4xl max-h-[70vh] overflow-auto transition duration-150 ease-out",
    searchResultHover: "hover:shadow-md hover:bg-slate-800/60",
    headerSearchOpenBtn: "text-sm px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white shadow-sm",

    // Welcome card
    welcomeCardClass: "relative max-w-4xl w-full bg-slate-900/95 text-left rounded-2xl shadow-xl p-8",
    welcomeAccentClass: "absolute -top-6 left-6 bg-slate-800 rounded-full p-2 shadow-md",
    welcomeTitleClass: "text-2xl font-semibold text-white",
    welcomeTextClass: "text-sm text-slate-300",
    welcomeBtnClass: "inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md",
    welcomeSecondaryClass: "text-sm text-slate-300 hover:underline",
    // Small top subheader (contact info)
    headerSubBgClass: "bg-gradient-to-r from-[#036ea8] to-[#05b7f7]",
    headerSubTextClass: "text-white text-xs",
    headerSubLinkClass: "text-white text-xs hover:underline inline-flex items-center gap-2",
    headerSubIconClass: "text-white",
    // Login page styles
    loginBgClass: "bg-gradient-to-br from-[#e6f7ff] to-[#f0fbff]",
    loginCardClass:
      "max-w-4xl w-full bg-white/90 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden grid grid-cols-1 md:grid-cols-2",
    loginLeftClass: "bg-gradient-to-b from-[#036ea8] to-[#05b7f7] p-8 flex flex-col justify-center",
    loginRightClass: "p-8 flex items-center justify-center",
    loginInputClass: "w-full border border-gray-200 px-3 py-2 rounded-md bg-white/60 focus:outline-none",
    loginBtnClass: "w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-[#036ea8] to-[#05b7f7] text-white font-semibold shadow-md hover:opacity-95",
  },
  light: {
    headerBg: "bg-white text-gray-900",
    topBtnBg: "bg-[#05b7f7] hover:bg-[#04a6db] text-white",
    searchBg: "bg-white border border-gray-200",
    subtitleClass: "text-gray-500",
    arrowClass: "text-gray-500",
    hoverNodeBg: "hover:bg-gray-100",
    menuBgClass: "bg-white text-gray-900",
    modalContainerClass:
      "relative max-w-6xl w-full bg-white/95 text-gray-900 rounded-2xl shadow-xl backdrop-blur-sm overflow-auto max-h-[86vh] z-10",
    modalLoadingClass: "text-sm text-gray-600",
    modalCloseBtn: "text-sm px-3 py-1 rounded bg-[#05b7f7] hover:bg-[#04a6db] text-white",
    modalSearchClass:
      "w-full max-w-lg bg-white text-sm text-gray-700 placeholder-gray-400 outline-none rounded px-3 py-2 border border-gray-200",
    resultItemBg: "bg-gray-50",
    resultPathClass: "text-xs text-gray-500",
    // Softer card style for modules (remove heavy border)
    moduleCardClass: "bg-white rounded-xl p-6 shadow-md",
    moduleTitleClass: "inline-block px-3 py-1 rounded-full bg-[#05b7f7] text-white font-semibold text-sm",
    moduleDescClass: "text-xs text-gray-500 mt-1",
    noTopClass: "text-xs text-gray-500",

    // additional for small inline conditionals
    selectClass: "bg-white text-[#05b7f7] border border-[#05b7f7]",
    menuBtnHoverClass: "hover:bg-gray-100",
    avatarBgClass: "bg-[#e8f9ff]",
    avatarTextClass: "text-[#05b7f7]",
    menuItemHoverClass: "hover:bg-gray-100",
    menuDangerTextClass: "text-red-600",
    menuPrimaryTextClass: "text-[#05b7f7]",
    // Page background
    pageBgClass: "bg-[#f6fbfe]",

    // Header search / dropdown
    // Header search / dropdown
    headerSearchContainerClass:
      "bg-white border border-transparent rounded-full px-3 py-2 shadow-sm w-full transition focus-within:ring-2 focus-within:ring-[#bfe9fb]",
    headerSearchIconClass: "text-[#05b7f7]",
    headerSearchInputClass: "bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none w-full transition",
    searchDropdownClass:
      "fixed left-1/2 top-24 transform -translate-x-1/2 z-50 bg-white/95 text-gray-900 rounded-xl shadow-2xl p-4 w-11/12 md:w-3/4 max-w-4xl max-h-[70vh] overflow-auto transition duration-150 ease-out",
    searchResultHover: "hover:shadow-sm hover:bg-white",
    headerSearchOpenBtn: "text-sm px-3 py-1 rounded-md bg-[#05b7f7] hover:bg-[#04a6db] text-white shadow-sm",

    // Welcome card
    welcomeCardClass: "relative max-w-4xl w-full bg-white/95 text-left rounded-2xl shadow-lg p-8",
    welcomeAccentClass: "absolute -top-6 left-6 bg-white rounded-full p-2 shadow-md",
    welcomeTitleClass: "text-2xl font-semibold text-gray-900",
    welcomeTextClass: "text-sm text-gray-600",
    welcomeBtnClass: "inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md",
    welcomeSecondaryClass: "text-sm text-gray-600 hover:underline",
    // Small top subheader (contact info)
    headerSubBgClass: "bg-gradient-to-r from-[#05b7f7] to-[#0396c8]",
    headerSubTextClass: "text-white text-xs",
    headerSubLinkClass: "text-white text-xs hover:underline inline-flex items-center gap-2",
    headerSubIconClass: "text-white",
    // Login page styles
    loginBgClass: "bg-gradient-to-br from-[#f6fbfe] to-[#eef9ff]",
    loginCardClass:
      "max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2",
    loginLeftClass: "bg-gradient-to-b from-[#05b7f7] to-[#0396c8] p-8 flex flex-col justify-center",
    loginRightClass: "p-8 flex items-center justify-center",
    loginInputClass: "w-full border border-gray-200 px-3 py-2 rounded-md bg-white focus:outline-none",
    loginBtnClass: "w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-[#05b7f7] to-[#0396c8] text-white font-semibold shadow-md hover:opacity-95",
  },
};

export function getThemeStyles(effective) {
  return effective === "dark" ? stylesByMode.dark : stylesByMode.light;
}
