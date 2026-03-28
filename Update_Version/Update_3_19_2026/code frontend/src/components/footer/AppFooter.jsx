import React from "react";

export default function AppFooter() {
  return (
    <footer className="w-full bg-[#4f8fd6] text-[#0a0a0a] border-t border-[#3a77bb]">
      <div className="px-3 sm:px-5 py-1.5 flex items-center justify-between gap-3 text-[16px] leading-none">
        <div className="min-w-0 truncate">
          <span className="mr-1">© Copyright 2025 | </span>
          <a
            href="https://www.lnt-soft.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#083f98] underline hover:text-[#072f72]"
            title="www.lnt-soft.com"
          >
            www.lnt-soft.com
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
          <a href="tel:+84979470224" className="text-[#d9d9d9] hover:text-white" title="Call us">
            (+84) 97 947 0224
          </a>
          <span>|</span>
          <a href="mailto:info@lnt-soft.com" className="text-[#0a0a0a] hover:underline" title="Email">
            info@lnt-soft.com
          </a>
        </div>
      </div>
    </footer>
  );
}
