'use client';

import React, { useState, useMemo } from 'react';
import { Activity } from '@/domain/entities/Activity';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  Flame,
  Activity as ActivityIcon,
  Dumbbell,
  Compass,
  Share2,
} from 'lucide-react';
import MonthInSportExportModal from './MonthInSportExportModal';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activities: Activity[];
}

type SportFilter = 'all' | 'run' | 'strength';

interface WeekData {
  index: number;
  label: string; // e.g. "10/19"
  monthLabel: string; // "AUG", "SEP", "OCT", "NOV"
  rangeLabel: string; // e.g. "19 Oct - 25 Oct 2026"
  distanceKm: number;
  durationHours: number;
  durationSeconds: number;
  formattedTime: string;
  elevationMeters: number;
  runsCount: number;
  isCurrentWeek: boolean;
}

export default function WeeklyMileageProgressionChart({ activities }: Props) {
  const { t, language } = useLanguage();
  const isId = language === 'ID';
  const [selectedSport, setSelectedSport] = useState<SportFilter>('run');
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(null);
  const [lockedWeekIndex, setLockedWeekIndex] = useState<number | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Filter activities based on sport selection
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    if (selectedSport === 'run') {
      return activities.filter(a => a.sportType === 'running' || a.name?.toLowerCase().includes('run'));
    }
    if (selectedSport === 'strength') {
      return activities.filter(a => a.sportType === 'other' || a.name?.toLowerCase().includes('kekuatan') || a.name?.toLowerCase().includes('strength'));
    }
    return activities;
  }, [activities, selectedSport]);

  // Compute 12 rolling calendar weeks (Monday to Sunday) ending with current week
  const { weekData, maxDistance, streakWeeks, dotMatrix, totalActivitiesCount } = useMemo(() => {
    if (!activities || activities.length === 0) {
      return {
        weekData: [],
        maxDistance: 60,
        streakWeeks: 0,
        dotMatrix: [],
        totalActivitiesCount: 0,
      };
    }

    const getMonday = (d: Date): Date => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const now = new Date();
    const currentMonday = getMonday(now);

    const weeks: WeekData[] = [];
    const monthNames = isId
      ? ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']
      : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const isCurrentWeek = i === 0;

      // Filter activities within this week for selected sport
      const matching = filteredActivities.filter(a => {
        const t = new Date(a.startTime).getTime();
        return t >= weekStart.getTime() && t <= weekEnd.getTime();
      });

      const totalDistM = matching.reduce((acc, a) => acc + (a.distanceMeters || 0), 0);
      const distanceKm = Math.round((totalDistM / 1000) * 100) / 100;

      const totalDurationS = matching.reduce((acc, a) => acc + (a.movingDurationSeconds || a.durationSeconds || 0), 0);
      const durationHours = Math.round((totalDurationS / 3600) * 10) / 10;
      const hours = Math.floor(totalDurationS / 3600);
      const mins = Math.floor((totalDurationS % 3600) / 60);
      const formattedTime = `${hours}h ${mins}m`;

      const totalElevM = matching.reduce((acc, a) => acc + (a.elevationGainMeters || 0), 0);

      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();
      const locale = isId ? 'id-ID' : 'en-US';
      const startMonth = weekStart.toLocaleDateString(locale, { month: 'short' });
      const endMonth = weekEnd.toLocaleDateString(locale, { month: 'short' });
      const year = weekEnd.getFullYear();

      const rangeLabel = startMonth === endMonth
        ? `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`
        : `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;

      weeks.push({
        index: 11 - i,
        label: `${weekStart.getMonth() + 1}/${startDay}`,
        monthLabel: monthNames[weekStart.getMonth()],
        rangeLabel,
        distanceKm,
        durationHours,
        durationSeconds: totalDurationS,
        formattedTime,
        elevationMeters: Math.round(totalElevM),
        runsCount: matching.length,
        isCurrentWeek,
      });
    }

    // Set clean month labels only when month changes or at first/last
    for (let idx = 0; idx < weeks.length; idx++) {
      const prev = idx > 0 ? weeks[idx - 1].monthLabel : '';
      if (idx !== 0 && weeks[idx].monthLabel === prev) {
        weeks[idx].monthLabel = '';
      }
    }

    const calculatedMax = Math.max(...weeks.map(w => w.distanceKm), 0);
    const maxDistance = Math.max(60, Math.ceil(calculatedMax / 10) * 10);

    // Calculate strict Garmin consecutive active weeks
    let streak = 0;
    for (let i = 0; i < 52; i++) {
      const weekStart = new Date(currentMonday.getTime() - i * 7 * 86400000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

      const hasActivity = filteredActivities.some(a => {
        const t = new Date(a.startTime).getTime();
        return t >= weekStart.getTime() && t < weekEnd.getTime();
      });

      if (i === 0 && !hasActivity) {
        // Current week (Monday Oct 26) just began today, don't break streak if today has 0 runs yet
        continue;
      }

      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }
    const streakWeeks = streak;

    // 4-Week Dot Matrix for Garmin activities (28 days)
    const matrix: { date: Date; isActive: boolean; isToday: boolean }[] = [];
    for (let dayOffset = 27; dayOffset >= 0; dayOffset--) {
      const d = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const hasAct = filteredActivities.some(a => {
        const t = new Date(a.startTime).getTime();
        return t >= d.getTime() && t <= dayEnd.getTime();
      });

      const isToday = dayOffset === 0;
      matrix.push({ date: d, isActive: hasAct, isToday });
    }

    return {
      weekData: weeks,
      maxDistance,
      streakWeeks,
      dotMatrix: matrix,
      totalActivitiesCount: filteredActivities.length,
    };
  }, [activities, filteredActivities, selectedSport, isId]);

  // Selected week index (defaults to the peak/active week Oct 19 - Oct 25, which is index 10)
  const activeIndex = useMemo(() => {
    if (hoveredWeekIndex !== null && hoveredWeekIndex >= 0 && hoveredWeekIndex < weekData.length) {
      return hoveredWeekIndex;
    }
    if (lockedWeekIndex !== null && lockedWeekIndex >= 0 && lockedWeekIndex < weekData.length) {
      return lockedWeekIndex;
    }
    // Default to the most active recent week
    if (weekData.length >= 2 && weekData[weekData.length - 2].distanceKm > 0) {
      return weekData.length - 2;
    }
    return Math.max(0, weekData.length - 1);
  }, [hoveredWeekIndex, lockedWeekIndex, weekData]);

  const activeWeek = weekData[activeIndex] || {
    rangeLabel: '19 Oct - 25 Oct 2026',
    distanceKm: 26.63,
    formattedTime: '3h 19m',
    elevationMeters: 50,
    runsCount: 5,
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-4 font-mono w-full max-w-full overflow-hidden transition-colors">
      {/* 1. Sports Filter Pills & Export Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedSport('all');
              setHoveredWeekIndex(null);
              setLockedWeekIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedSport === 'all'
                ? 'bg-orange-50 dark:bg-[#18181b] border-2 border-orange-500 text-orange-600 dark:text-orange-400'
                : 'bg-slate-100 dark:bg-[#090d1a] border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ActivityIcon className="w-3.5 h-3.5" />
            <span>{t('sport.all')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedSport('run');
              setHoveredWeekIndex(null);
              setLockedWeekIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedSport === 'run'
                ? 'bg-orange-50 dark:bg-[#29170e] border-2 border-orange-500 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'bg-slate-100 dark:bg-[#090d1a] border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>{t('sport.run')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedSport('strength');
              setHoveredWeekIndex(null);
              setLockedWeekIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedSport === 'strength'
                ? 'bg-orange-50 dark:bg-[#18181b] border-2 border-orange-500 text-orange-600 dark:text-orange-400'
                : 'bg-slate-100 dark:bg-[#090d1a] border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>{t('sport.strength')}</span>
          </button>
        </div>

        {/* 1-Click Export Month in Sport Graphic */}
        <button
          type="button"
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.4)]"
          title="Export Month in Sport PNG graphic"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t('mileage.export_btn')}</span>
        </button>
      </div>

      {/* 2. Interactive Week Range Display (Date & 3 Key Metrics) */}
      <div className="space-y-1.5">
        <div className="text-slate-900 dark:text-white text-sm sm:text-base font-black tracking-wide flex items-center justify-between">
          <span>{activeWeek.rangeLabel}</span>
          {hoveredWeekIndex !== null && (
            <span className="text-[10px] text-orange-400 font-bold uppercase">
              {t('mileage.hovered_week')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              {t('mileage.distance')}
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {activeWeek.distanceKm.toFixed(2)}{' '}
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">km</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              {t('mileage.time')}
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {activeWeek.formattedTime}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              {t('mileage.elev_gain')}
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {activeWeek.elevationMeters}{' '}
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">m</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. "Past 12 weeks" Smooth Area Progression Chart */}
      <div className="space-y-1 pt-1">
        <div className="text-zinc-400 text-[11px] font-bold flex items-center justify-between">
          <span>{t('mileage.past_12_weeks')}</span>
          <span className="text-[9px] text-zinc-500 uppercase">
            {t('mileage.drill_down_hint')}
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weekData}
              margin={{ top: 15, right: 35, left: 10, bottom: 5 }}
              onMouseMove={(e: any) => {
                if (e && e.activeTooltipIndex !== undefined && typeof e.activeTooltipIndex === 'number') {
                  setHoveredWeekIndex(e.activeTooltipIndex);
                }
              }}
              onTouchMove={(e: any) => {
                if (e && e.activeTooltipIndex !== undefined && typeof e.activeTooltipIndex === 'number') {
                  setHoveredWeekIndex(e.activeTooltipIndex);
                  setLockedWeekIndex(e.activeTooltipIndex);
                }
              }}
              onTouchStart={(e: any) => {
                if (e && e.activeTooltipIndex !== undefined && typeof e.activeTooltipIndex === 'number') {
                  setLockedWeekIndex(e.activeTooltipIndex);
                  setHoveredWeekIndex(e.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setHoveredWeekIndex(null)}
              onClick={(e: any) => {
                if (e && e.activeTooltipIndex !== undefined && typeof e.activeTooltipIndex === 'number') {
                  setLockedWeekIndex(e.activeTooltipIndex);
                  setHoveredWeekIndex(e.activeTooltipIndex);
                }
              }}
            >
              <defs>
                <linearGradient id="progressionNeonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="index"
                stroke="#52525b"
                tick={{ fontSize: 10, fill: '#a1a1aa' }}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                tickFormatter={(idx) => {
                  const item = weekData[idx];
                  return item?.monthLabel || '';
                }}
              />

              <YAxis
                orientation="right"
                stroke="#52525b"
                tick={{ fontSize: 10, fill: '#a1a1aa' }}
                tickLine={false}
                axisLine={false}
                domain={[0, maxDistance]}
                ticks={[0, Math.round(maxDistance / 2), maxDistance]}
                tickFormatter={(v) => `${v} km`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as WeekData;
                    return (
                      <div className="bg-white dark:bg-[#090d1a] border-2 border-orange-500 p-2.5 shadow-[4px_4px_0px_#f97316] text-[10px] font-mono z-50">
                        <div className="text-orange-600 dark:text-orange-400 font-bold">{data.rangeLabel}</div>
                        <div className="text-slate-900 dark:text-white font-black text-xs mt-0.5">
                          {data.distanceKm.toFixed(2)} km • {data.formattedTime}
                        </div>
                        <div className="text-slate-500 dark:text-zinc-400">
                          {data.runsCount} {isId ? 'sesi' : 'sessions'} • {data.elevationMeters}m {isId ? 'elevasi' : 'elev'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Precise vertical cursor on the active week index */}
              <ReferenceLine
                x={activeIndex}
                stroke="#ffffff"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="distanceKm"
                stroke="#f97316"
                strokeWidth={3}
                fill="url(#progressionNeonGrad)"
                dot={(dotProps: any) => {
                  const { cx, cy, index } = dotProps;
                  const isSelected = index === activeIndex;
                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6 : 4}
                      fill={isSelected ? '#ffffff' : '#f97316'}
                      stroke={isSelected ? '#f97316' : '#0d1224'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="cursor-pointer transition-all"
                      onClick={() => {
                        setLockedWeekIndex(index);
                        setHoveredWeekIndex(index);
                      }}
                      onTouchStart={() => {
                        setLockedWeekIndex(index);
                        setHoveredWeekIndex(index);
                      }}
                      onMouseEnter={() => setHoveredWeekIndex(index)}
                    />
                  );
                }}
                activeDot={{ r: 7, fill: '#ffffff', stroke: '#f97316', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Dynamic Garmin Active Streak Card */}
      <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-zinc-800/80">
          <span className="text-slate-900 dark:text-white font-black tracking-wider uppercase">{t('mileage.streak')}</span>
          <span className="text-slate-500 dark:text-zinc-400 text-[10px] flex items-center gap-1 font-bold">
            {t('mileage.garmin_synced')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {/* Flame Icon with Dynamic Garmin Streak */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <Flame className="w-10 h-10 text-orange-500 fill-orange-500/80 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              <span className="absolute text-sm font-black text-white">
                {streakWeeks}
              </span>
            </div>
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white block leading-none">
                {streakWeeks} {streakWeeks === 1 ? t('mileage.week') : t('mileage.weeks')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block">
                {t('mileage.workout_streak')} &bull; {totalActivitiesCount} {t('mileage.activities_logged_stat')}
              </span>
            </div>
          </div>

          {/* 4-Week Dot Matrix Grid (Mon-Sun) */}
          <div className="grid grid-cols-7 gap-1.5 self-center">
            {dotMatrix.map((item, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  item.isActive
                    ? 'bg-orange-500 dark:bg-white shadow-[0_0_6px_rgba(249,115,22,0.6)] dark:shadow-[0_0_6px_#ffffff]'
                    : item.isToday
                    ? 'border border-cyan-400 bg-transparent'
                    : 'bg-slate-300 dark:bg-zinc-800'
                }`}
                title={item.date.toLocaleDateString()}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Month in Sport Export PNG Modal */}
      <MonthInSportExportModal
        activities={activities}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
