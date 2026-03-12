import React, { useEffect, useState } from "react";
import { getModules } from "../api/modules";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = ({ onSelectModule, compact = false }) => {
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    getModules()
      .then((res) => {
        const data = res && res.data && res.data.data ? res.data.data : [];
        setModules(data);
      })
      .catch(() => setModules([]));
  }, []);

  const handleSelect = (m) => {
    setActiveModule(m.id);
    if (onSelectModule) onSelectModule(m);
  };

  const { effective } = useTheme();
  const isDark = effective === "dark";

  if (compact) {
    return (
      <nav className="bg-transparent p-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 py-2">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelect(m)}
              className={`flex items-center gap-2 min-w-[56px] sm:min-w-[88px] px-2 py-1 text-xs font-medium rounded-md border transition whitespace-nowrap flex-shrink-0
                ${
                  activeModule === m.id
                    ? "bg-[#2b9bf0] text-white border-[#2b9bf0] shadow"
                    : isDark
                      ? "bg-[#07203a] text-[#e6eef8] border-[#083047] hover:bg-[#083047]"
                      : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                }`}
              title={m.name}
            >
              {m.icon ? <i className={`${m.icon} text-sm`} /> : <span className="w-4 h-4 bg-gray-500 rounded-full" />}
              <span className="hidden xs:inline-block sm:inline-block truncate text-[12px]">{m.name}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className={`${isDark ? 'bg-transparent border-b border-[#083047]' : 'bg-white border-b border-gray-200'} p-2`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m)}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-md border transition
              ${
                activeModule === m.id
                  ? "bg-[#2b9bf0] text-white border-[#0f6fd0] shadow"
                  : isDark
                    ? "bg-[#07203a] text-[#e6eef8] border-[#083047] hover:bg-[#083047]"
                    : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:border-blue-400"
              }`}>
            <i className={`${m.icon} text-sm`}></i>
            <span className="truncate">{m.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
