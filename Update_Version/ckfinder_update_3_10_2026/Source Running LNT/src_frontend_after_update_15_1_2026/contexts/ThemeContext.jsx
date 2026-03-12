import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem("app-theme-mode") || "auto";
    } catch (e) {
      return "auto";
    }
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Listen to system changes when mode === 'auto'
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemPrefersDark(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("app-theme-mode", mode);
    } catch (e) {
      // ignore
    }
  }, [mode]);

  const effective = mode === "auto" ? (systemPrefersDark ? "dark" : "light") : mode;

  // Apply a data-theme attribute on the root element so global CSS can adapt
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", effective);
      }
    } catch (e) {
      // ignore
    }
  }, [effective]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, effective }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export default ThemeContext;
