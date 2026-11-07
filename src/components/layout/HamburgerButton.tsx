'use client';

import React from 'react';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
  ariaLabel?: string;
}

export default function HamburgerButton({
  isOpen,
  onClick,
  className = '',
  title,
  ariaLabel,
}: HamburgerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-9 h-9 flex items-center justify-center border-2 border-slate-300 dark:border-violet-900/80 bg-white dark:bg-[#090d1c] hover:bg-slate-100 dark:hover:bg-violet-950/60 text-slate-800 dark:text-zinc-200 hover:text-violet-600 dark:hover:text-violet-300 shadow-[2px_2px_0px_#cbd5e1] dark:shadow-[2px_2px_0px_#1e1b4b] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer group shrink-0 ${className}`}
      aria-label={ariaLabel || (isOpen ? 'Tutup sidebar' : 'Buka sidebar')}
      title={title || (isOpen ? 'Tutup Sidebar (Close)' : 'Buka Sidebar (Open)')}
    >
      <div className="w-4 h-4 relative flex flex-col justify-between items-center py-0.5">
        {/* Top Line */}
        <span
          className={`w-4 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out origin-center ${
            isOpen 
              ? 'absolute top-1.5 rotate-45 bg-violet-600 dark:bg-violet-400' 
              : ''
          }`}
        />

        {/* Middle Line */}
        <span
          className={`w-4 h-0.5 bg-current rounded-full transition-all duration-200 ease-in-out ${
            isOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
          }`}
        />

        {/* Bottom Line */}
        <span
          className={`w-4 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out origin-center ${
            isOpen 
              ? 'absolute top-1.5 -rotate-45 bg-violet-600 dark:bg-violet-400' 
              : ''
          }`}
        />
      </div>
    </button>
  );
}
