'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  size?: number;
  className?: string;
  withShadow?: boolean;
  forceTheme?: 'dark' | 'light';
}

export default function BrandLogo({
  size = 40,
  className = '',
  withShadow = true,
  forceTheme,
}: Props) {
  const { theme } = useTheme();
  const currentTheme = forceTheme || theme;
  const isLight = currentTheme === 'light';

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden transition-all group-hover:scale-105 ${
        isLight
          ? 'border-2 border-violet-400 bg-white'
          : 'border-2 border-violet-500/80 bg-[#070a14]'
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: withShadow
          ? isLight
            ? '2.5px 2.5px 0px #cbd5e1'
            : '2.5px 2.5px 0px #7c3aed'
          : 'none',
      }}
      title="FREEDAYZZ // PULSE Telemetry Lab"
    >
      {/* 100% Razor-Sharp Inline Vector SVG (renders instantly & exports perfectly) */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1"
      >
        <defs>
          {/* Background Squircle Gradient */}
          <linearGradient id={`brandBg_${isLight ? 'l' : 'd'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isLight ? (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#f5f3ff" />
                <stop offset="100%" stopColor="#ede9fe" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="60%" stopColor="#5b21b6" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </>
            )}
          </linearGradient>

          {/* Cyan Pulse Gradient */}
          <linearGradient id={`pulseGrad_${isLight ? 'l' : 'd'}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {isLight ? (
              <>
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#22d3ee" />
              </>
            )}
          </linearGradient>

          {/* Speed Streaks Gradient */}
          <linearGradient id={`streaksGrad_${isLight ? 'l' : 'd'}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isLight ? '#c084fc' : '#e879f9'} stopOpacity="0" />
            <stop offset="100%" stopColor={isLight ? '#7c3aed' : '#e879f9'} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Squircle Badge Base */}
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="22"
          fill={`url(#brandBg_${isLight ? 'l' : 'd'})`}
          stroke={isLight ? '#7c3aed' : '#a78bfa'}
          strokeWidth="3"
        />

        {/* Speed Streaks behind runner */}
        <line x1="12" y1="28" x2="28" y2="28" stroke={`url(#streaksGrad_${isLight ? 'l' : 'd'})`} strokeWidth="3" strokeLinecap="round" />
        <line x1="8" y1="36" x2="22" y2="36" stroke={`url(#streaksGrad_${isLight ? 'l' : 'd'})`} strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="66" x2="26" y2="66" stroke={`url(#streaksGrad_${isLight ? 'l' : 'd'})`} strokeWidth="3" strokeLinecap="round" />
        <line x1="9" y1="74" x2="21" y2="74" stroke={`url(#streaksGrad_${isLight ? 'l' : 'd'})`} strokeWidth="2.5" strokeLinecap="round" />

        {/* Running Athlete Silhouette */}
        {/* Head */}
        <circle cx="68" cy="22" r="7" fill={isLight ? '#6d28d9' : '#ffffff'} />

        {/* Torso & Core */}
        <path
          d="M 57 28 L 69 30 L 55 53 L 44 49 Z"
          fill={isLight ? '#6d28d9' : '#ffffff'}
        />

        {/* Back Arm (pumping) */}
        <polyline
          points="52,34 38,40 32,36"
          fill="none"
          stroke={isLight ? '#6d28d9' : '#ffffff'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Front Arm (driving forward) */}
        <polyline
          points="64,34 77,40 81,50"
          fill="none"
          stroke={isLight ? '#6d28d9' : '#ffffff'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Back Leg (stride push-off) */}
        <polyline
          points="46,51 34,64 19,74"
          fill="none"
          stroke={isLight ? '#6d28d9' : '#ffffff'}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Front Leg (high knee drive) */}
        <polyline
          points="53,51 68,62 60,80"
          fill="none"
          stroke={isLight ? '#6d28d9' : '#ffffff'}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Telemetry Heart Rate Pulse Wave (Neon Cyan cutting through core) */}
        <polyline
          points="6,52 22,52 28,40 35,64 43,32 50,68 57,42 63,52 94,52"
          fill="none"
          stroke={`url(#pulseGrad_${isLight ? 'l' : 'd'})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Forward Telemetry Arrow Tip */}
        <polyline
          points="88,47 94,52 88,57"
          fill="none"
          stroke={isLight ? '#0284c7' : '#22d3ee'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
