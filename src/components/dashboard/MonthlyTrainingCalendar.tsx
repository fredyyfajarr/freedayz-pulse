'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Activity } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Route, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  Mountain,
  Zap,
  CalendarDays,
  Check,
  X,
  History
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

interface Props {
  activities: Activity[];
}

interface CalendarDayCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0 Mon ... 6 Sun
  activitiesCount: number;
  distanceKm: number;
  durationSec: number;
  paceSecPerKm: number;
  trimpScore: number;
  sessions: {
    id: string;
    name: string;
    distanceKm: number;
    pace: string;
    time: string;
    sportType: string;
    trimp: number;
  }[];
}

interface CalendarWeekRow {
  weekIndex: number;
  days: CalendarDayCell[];
  weekTotalKm: number;
}

export default function MonthlyTrainingCalendar({ activities }: Props) {
  const { t, language } = useLanguage();
  // Find latest activity date to initialize calendar
  const initialDate = useMemo(() => {
    if (activities.length > 0) {
      const firstAct = activities[0];
      const dateStr = firstAct.startTimeLocalStr 
        ? firstAct.startTimeLocalStr.split(' ')[0] 
        : new Date(firstAct.startTime).toISOString().split('T')[0];
      const [y, m] = dateStr.split('-').map(Number);
      return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, [activities]);

  const [currentYear, setCurrentYear] = useState<number>(initialDate.year);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.month); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<CalendarDayCell | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(initialDate.year);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  // Keyboard shortcut to close picker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPickerOpen]);

  // Compute all recorded months with logged activities across the whole history
  const recordedMonths = useMemo(() => {
    const map = new Map<string, { year: number; month: number; count: number; distM: number }>();

    activities.forEach(a => {
      const actDateStr = a.startTimeLocalStr 
        ? a.startTimeLocalStr.split(' ')[0] 
        : new Date(a.startTime).toISOString().split('T')[0];
      const [yStr, mStr] = actDateStr.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1; // 0-indexed
      if (isNaN(y) || isNaN(m)) return;
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;

      const existing = map.get(key) || { year: y, month: m, count: 0, distM: 0 };
      existing.count += 1;
      existing.distM += a.distanceMeters || 0;
      map.set(key, existing);
    });

    const list = Array.from(map.entries()).map(([key, val]) => {
      const dateObj = new Date(val.year, val.month, 1);
      return {
        key,
        year: val.year,
        month: val.month,
        label: dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
        shortLabel: dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
        count: val.count,
        distanceKm: Math.round((val.distM / 1000) * 10) / 10,
      };
    });

    // Sort descending (latest month first)
    list.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    return list;
  }, [activities]);

  // Picker 12-month data for currently selected pickerYear
  const pickerYearMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, mIdx) => {
      const key = `${pickerYear}-${String(mIdx + 1).padStart(2, '0')}`;
      const rec = recordedMonths.find(rm => rm.key === key);
      const isCurrentView = pickerYear === currentYear && mIdx === currentMonth;
      const now = new Date();
      const isRealThisMonth = pickerYear === now.getFullYear() && mIdx === now.getMonth();

      return {
        monthIndex: mIdx,
        shortName: MONTH_SHORT[mIdx],
        fullName: MONTH_NAMES[mIdx],
        hasActivities: !!rec,
        count: rec?.count || 0,
        distanceKm: rec?.distanceKm || 0,
        isCurrentView,
        isRealThisMonth,
      };
    });
  }, [pickerYear, recordedMonths, currentYear, currentMonth]);

  // Year summary stats for the picker
  const pickerYearStats = useMemo(() => {
    const yearActs = recordedMonths.filter(rm => rm.year === pickerYear);
    const totalKm = yearActs.reduce((acc, r) => acc + r.distanceKm, 0);
    const totalRuns = yearActs.reduce((acc, r) => acc + r.count, 0);
    const activeMonthsCount = yearActs.length;
    return {
      totalKm: Math.round(totalKm * 10) / 10,
      totalRuns,
      activeMonthsCount,
    };
  }, [recordedMonths, pickerYear]);

  // Month string e.g. "OCTOBER 2026" or "OKTOBER 2026"
  const monthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    const locale = language === 'ID' ? 'id-ID' : 'en-US';
    return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' }).toUpperCase();
  }, [currentYear, currentMonth, language]);

  // Today's local date string
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Compute Monthly Aggregates & Calendar Grid
  const { monthStats, weekRows } = useMemo(() => {
    const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    // Filter activities belonging to this month
    const monthActivities = activities.filter(a => {
      const actDateStr = a.startTimeLocalStr 
        ? a.startTimeLocalStr.split(' ')[0] 
        : new Date(a.startTime).toISOString().split('T')[0];
      return actDateStr.startsWith(currentMonthPrefix);
    });

    const totalDistM = monthActivities.reduce((acc, a) => acc + a.distanceMeters, 0);
    const totalDistKm = Math.round((totalDistM / 1000) * 100) / 100;
    const totalDurationS = monthActivities.reduce(
      (acc, a) => acc + (a.movingDurationSeconds || a.durationSeconds), 
      0
    );
    const totalElevation = monthActivities.reduce((acc, a) => acc + a.elevationGainMeters, 0);
    const totalTrimp = monthActivities.reduce((acc, a) => acc + a.relativeEffortScore, 0);
    const runsCount = monthActivities.filter(a => a.distanceMeters > 0).length;

    // Monthly Weighted Avg Pace
    const monthlyAvgPace = totalDistKm > 0 ? Math.round(totalDurationS / totalDistKm) : 0;

    // Days in this month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Avg Weekly Distance (normalized across the month)
    const avgWeeklyDistKm = daysInMonth > 0 ? Math.round(((totalDistKm / daysInMonth) * 7) * 10) / 10 : 0;
    const avgDistPerRun = runsCount > 0 ? Math.round((totalDistKm / runsCount) * 10) / 10 : 0;

    // Calendar Grid Construction
    // First day of month (Monday = 0 ... Sunday = 6)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: CalendarDayCell[] = [];

    // Helper to get day data
    const buildDayCell = (y: number, m: number, d: number, isCurrMonth: boolean): CalendarDayCell => {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayActs = activities.filter(a => {
        const aDate = a.startTimeLocalStr 
          ? a.startTimeLocalStr.split(' ')[0] 
          : new Date(a.startTime).toISOString().split('T')[0];
        return aDate === dateStr;
      });

      const dayDistM = dayActs.reduce((acc, a) => acc + a.distanceMeters, 0);
      const dayDistKm = Math.round((dayDistM / 1000) * 100) / 100;
      const dayDurS = dayActs.reduce((acc, a) => acc + (a.movingDurationSeconds || a.durationSeconds), 0);
      const dayPace = dayDistM > 0 ? Math.round(dayDurS / (dayDistM / 1000)) : 0;
      const dayTrimp = dayActs.reduce((acc, a) => acc + a.relativeEffortScore, 0);

      const sessions = dayActs.map(a => ({
        id: a.id,
        name: a.name,
        distanceKm: Math.round((a.distanceMeters / 1000) * 100) / 100,
        pace: PaceCalculator.formatPace(a.avgPaceSecPerKm),
        time: PaceCalculator.formatDuration(a.movingDurationSeconds || a.durationSeconds),
        sportType: a.sportType,
        trimp: a.relativeEffortScore,
      }));

      const dateObj = new Date(y, m, d);
      const rawDay = dateObj.getDay();
      const dayOfWeek = rawDay === 0 ? 6 : rawDay - 1;

      return {
        dateStr,
        dayNumber: d,
        isCurrentMonth: isCurrMonth,
        isToday: dateStr === todayStr,
        dayOfWeek,
        activitiesCount: dayActs.length,
        distanceKm: dayDistKm,
        durationSec: dayDurS,
        paceSecPerKm: dayPace,
        trimpScore: dayTrimp,
        sessions,
      };
    };

    // Leading days from prev month
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    for (let i = 0; i < firstDayIndex; i++) {
      const dayNum = prevMonthDays - firstDayIndex + 1 + i;
      cells.push(buildDayCell(prevYear, prevMonthIdx, dayNum, false));
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(buildDayCell(currentYear, currentMonth, d, true));
    }

    // Trailing days from next month to complete the 7-column grid
    const totalSlots = Math.ceil(cells.length / 7) * 7;
    const nextMonthDaysNeeded = totalSlots - cells.length;
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    for (let d = 1; d <= nextMonthDaysNeeded; d++) {
      cells.push(buildDayCell(nextYear, nextMonthIdx, d, false));
    }

    // Split cells into rows of 7
    const rows: CalendarWeekRow[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const weekDays = cells.slice(i, i + 7);
      // Week total distance (counting runs in this month)
      const weekTotal = weekDays.reduce((acc, cd) => {
        return cd.isCurrentMonth ? acc + cd.distanceKm : acc;
      }, 0);

      rows.push({
        weekIndex: Math.floor(i / 7) + 1,
        days: weekDays,
        weekTotalKm: Math.round(weekTotal * 100) / 100,
      });
    }

    return {
      monthStats: {
        totalDistKm,
        totalDurationS,
        monthlyAvgPace,
        runsCount,
        avgWeeklyDistKm,
        avgDistPerRun,
        totalElevation,
        totalTrimp,
      },
      weekRows: rows,
    };
  }, [activities, currentYear, currentMonth, todayStr]);

  const dayHeaders = language === 'ID'
    ? ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN']
    : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 sm:p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-5 transition-colors">
      {/* 1. Header with Month Title & Month Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <div>
            <div className="flex items-center gap-2">
              <h2 
                onClick={() => {
                  setPickerYear(currentYear);
                  setIsPickerOpen(true);
                }}
                className="text-lg sm:text-xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase hover:text-violet-600 dark:hover:text-violet-300 cursor-pointer transition-colors"
                title="Click to jump to another month or year"
              >
                {monthName} // MONTHLY_RUN_LOG
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700/60 text-violet-800 dark:text-violet-300 font-bold uppercase">
                TELEMETRY_LOG_V2
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
              FULL MONTHLY RUNNING VOLUME, DAY-BY-DAY SESSIONS & WEIGHTED AVERAGES
            </p>
          </div>
        </div>

        {/* Month Navigation Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
          <button
            onClick={handlePrevMonth}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#070a14] hover:bg-slate-200 dark:hover:bg-violet-950 border border-slate-300 dark:border-violet-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="hidden sm:inline">PREV</span>
          </button>
          
          {/* Clickable Month Label triggers Month & Year Picker */}
          <button
            type="button"
            onClick={() => {
              setPickerYear(currentYear);
              setIsPickerOpen(true);
            }}
            className="px-3 py-1.5 bg-violet-100 dark:bg-violet-950/70 hover:bg-violet-200 dark:hover:bg-violet-900 border border-violet-400 dark:border-violet-700 hover:border-violet-500 text-violet-800 dark:text-violet-200 text-xs font-black tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer group"
            title="Click to open Month & Year Picker"
          >
            <span>{monthName}</span>
            <span className="text-[10px] text-violet-600 dark:text-violet-400 group-hover:text-cyan-500 font-mono transition-colors">▾</span>
          </button>

          <button
            onClick={handleNextMonth}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#070a14] hover:bg-slate-200 dark:hover:bg-violet-950 border border-slate-300 dark:border-violet-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
            title="Next Month"
          >
            <span className="hidden sm:inline">NEXT</span>
            <ChevronRight className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </button>
        </div>
      </div>

      {/* 2. Prominent Monthly Telemetry KPI Bar (The Monthly Averages) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 font-mono">
        {/* Total Monthly Distance */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-violet-400 dark:border-violet-800/80 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#7c3aed]">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
            <span>{language === 'ID' ? 'VOLUME BULANAN' : 'MONTHLY VOLUME'}</span>
            <Route className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {monthStats.totalDistKm.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400">KM</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mt-1">
            {monthStats.runsCount} {language === 'ID' ? 'TOTAL SESI' : 'TOTAL SESSIONS'}
          </span>
        </div>

        {/* Monthly Weighted Average Pace */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-cyan-400 dark:border-cyan-800/80 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#06b6d4]">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
            <span>{language === 'ID' ? 'RATA-RATA PACE' : 'AVG MONTHLY PACE'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1.5 whitespace-nowrap">
            <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-300">
              {monthStats.monthlyAvgPace > 0
                ? PaceCalculator.formatPace(monthStats.monthlyAvgPace).replace(' /km', '')
                : '--:--'}
            </span>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">/KM</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mt-1 truncate">
            {language === 'ID' ? 'TERTIMBANG JARAK' : 'WEIGHTED BY DISTANCE'}
          </span>
        </div>

        {/* Average Weekly Volume for Month */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-emerald-400 dark:border-emerald-800/80 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#10b981]">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
            <span>{language === 'ID' ? 'RATA-RATA JARAK MINGGUAN' : 'AVG WEEKLY MILEAGE'}</span>
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {monthStats.avgWeeklyDistKm.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">KM / WK</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mt-1">
            {language === 'ID' ? 'RUN RATE BULANAN' : 'MONTHLY RUN RATE'}
          </span>
        </div>

        {/* Average Distance Per Session */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-amber-400 dark:border-amber-800/80 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#f59e0b]">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
            <span>{language === 'ID' ? 'RATA-RATA JARAK SESI' : 'AVG SESSION DISTANCE'}</span>
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-300">
              {monthStats.avgDistPerRun.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-500">KM</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mt-1">
            {language === 'ID' ? 'PER SESI LARI' : 'PER LOGGED RUN'}
          </span>
        </div>

        {/* Monthly Time & Cardiac Load */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-rose-400 dark:border-rose-800/80 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#f43f5e] col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
            <span>{language === 'ID' ? 'TOTAL WAKTU BERGERAK' : 'TOTAL MOVING TIME'}</span>
            <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {PaceCalculator.formatDuration(monthStats.totalDurationS)}
            </span>
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 block mt-1 font-bold">
            {monthStats.totalTrimp} PTS {language === 'ID' ? 'STRES KARDIAC' : 'RELATIVE EFFORT'}
          </span>
        </div>
      </div>

      {/* 3. Monthly Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Day Headers (Mon - Sun + Week Total) */}
          <div className="grid grid-cols-[repeat(7,1fr)_90px] gap-2 pb-2 mb-2 text-center text-[10px] font-mono font-black tracking-widest text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
            {dayHeaders.map(day => (
              <div key={day} className="py-1 bg-slate-100 dark:bg-[#0a0e1c] border border-slate-200 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-300">
                {day}
              </div>
            ))}
            <div className="py-1 bg-violet-100 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-800/80 text-violet-800 dark:text-violet-300 font-bold">
              TOTAL
            </div>
          </div>

          {/* Week Rows */}
          <div className="space-y-2">
            {weekRows.map(row => (
              <div 
                key={row.weekIndex}
                className="grid grid-cols-[repeat(7,1fr)_90px] gap-2 items-stretch"
              >
                {/* 7 Days */}
                {row.days.map((cell, cIdx) => {
                  const hasRuns = cell.activitiesCount > 0;
                  const isSelected = selectedDay?.dateStr === cell.dateStr;

                  // Uniform sleek cyber bubble styling for all running sessions
                  const bubbleGradient = 'from-violet-600 to-indigo-600 border-violet-400 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_rgba(0,0,0,0.6)]';

                  return (
                    <div
                      key={cell.dateStr || cIdx}
                      onClick={() => {
                        if (!hasRuns) return;
                        setSelectedDay(prev => prev?.dateStr === cell.dateStr ? null : cell);
                      }}
                      className={`min-h-[76px] p-1.5 border transition-all flex flex-col justify-between select-none ${
                        !cell.isCurrentMonth
                          ? 'bg-slate-100/50 dark:bg-[#05070f]/40 border-slate-200/60 dark:border-zinc-900/60 opacity-35'
                          : isSelected
                          ? 'bg-violet-50 dark:bg-[#0e1630] border-violet-500 shadow-[3px_3px_0px_#7c3aed] ring-2 ring-violet-500 scale-[1.02] z-10'
                          : cell.isToday
                          ? 'bg-cyan-50/40 dark:bg-[#070a14] border-cyan-500/80 hover:border-cyan-400'
                          : 'bg-white dark:bg-[#070a14] hover:bg-slate-50 dark:hover:bg-[#0a0f24] hover:border-slate-300 dark:hover:border-zinc-700 border-slate-200 dark:border-zinc-800/80'
                      } ${hasRuns ? 'cursor-pointer hover:shadow-md' : ''}`}
                    >
                      {/* Top Bar: Date Number + Multi-session Badge */}
                      <div className="flex items-center justify-between">
                        <span 
                          className={`text-[10px] font-mono font-black ${
                            cell.isToday
                              ? 'text-cyan-600 dark:text-cyan-400 underline decoration-cyan-400 underline-offset-2'
                              : cell.isCurrentMonth
                              ? 'text-slate-600 dark:text-zinc-400'
                              : 'text-slate-400 dark:text-zinc-600'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.activitiesCount > 1 && (
                          <span className="text-[8px] font-mono font-bold px-1 py-0.2 bg-violet-600 dark:bg-violet-900 border border-violet-400 dark:border-violet-500 text-white">
                            {cell.activitiesCount}X
                          </span>
                        )}
                      </div>

                      {/* Middle: Bubble or Rest Marker */}
                      <div className="flex-1 flex items-center justify-center py-1">
                        {hasRuns ? (
                          <div 
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${bubbleGradient} border-2 flex flex-col items-center justify-center text-white font-mono font-black shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-transform`}
                          >
                            <span className="text-[10px] leading-tight text-white">
                              {cell.distanceKm >= 10 ? cell.distanceKm.toFixed(0) : cell.distanceKm.toFixed(1)}
                            </span>
                            <span className="text-[7px] text-white/90 uppercase -mt-0.5">
                              KM
                            </span>
                          </div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-800"></div>
                        )}
                      </div>

                      {/* Bottom Pace Label */}
                      <div className="text-center min-h-[12px]">
                        {hasRuns && cell.paceSecPerKm > 0 && (
                          <span className="text-[8px] font-mono text-slate-500 dark:text-zinc-400 block truncate">
                            {PaceCalculator.formatPace(cell.paceSecPerKm)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Week Total Column */}
                <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-violet-900/60 p-2 flex flex-col items-end justify-center font-mono">
                  <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-500 block">
                    {language === 'ID' ? 'MINGGU' : 'WEEK'} {row.weekIndex}
                  </span>
                  {row.weekTotalKm > 0 ? (
                    <span className="text-xs font-black text-violet-700 dark:text-violet-300 mt-0.5">
                      {row.weekTotalKm.toFixed(1)} <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-normal">km</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5">0.0 km</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Calendar Footer Status */}
      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800 gap-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-400 inline-block"></span>
          <span className="text-zinc-300 font-bold">
            {language === 'ID' ? 'LARI SELESAI' : 'COMPLETED RUN'}
          </span>
          <span className="text-zinc-500">
            {language === 'ID' 
              ? '• KLIK TANGGAL AKTIF UNTUK MELIHAT DETAIL TELEMETRI' 
              : '• CLICK ANY ACTIVE DATE TO LOCK DAY TELEMETRY'}
          </span>
        </div>
        <span className="text-zinc-500">
          {language === 'ID'
            ? 'INTENSITAS, DETAK JANTUNG & TIPE LATIHAN DIANALISIS PADA TAMPILAN DETAIL'
            : 'INTENSITY, HEART RATE & WORKOUT TYPE ANALYZED IN DETAIL VIEW'}
        </span>
      </div>

      {/* 5. Interactive Session Drawer for Selected Day */}
      {selectedDay && selectedDay.activitiesCount > 0 && (
        <div className="p-4 bg-white dark:bg-[#070a14] border-2 border-violet-500 shadow-[4px_4px_0px_#7c3aed] animate-in fade-in duration-150 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-zinc-800 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-violet-700 dark:text-violet-300">
                [ {new Date(selectedDay.dateStr + 'T12:00:00').toLocaleDateString(language === 'ID' ? 'id-ID' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} ]
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold">
                {selectedDay.activitiesCount} {language === 'ID' ? 'SESI' : (selectedDay.activitiesCount === 1 ? 'SESSION' : 'SESSIONS')}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-600/60 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                {language === 'ID' ? 'TERKUNCI' : 'LOCKED'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-700 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <Route className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {language === 'ID' ? 'TOTAL HARI:' : 'DAY TOTAL:'} <strong className="text-slate-900 dark:text-white">{selectedDay.distanceKm.toFixed(2)} KM</strong>
              </span>
              {selectedDay.durationSec > 0 && (
                <span>
                  {language === 'ID' ? 'RATA-RATA PACE:' : 'AVG PACE:'} <strong className="text-cyan-600 dark:text-cyan-300">{PaceCalculator.formatPace(selectedDay.paceSecPerKm)}</strong>
                </span>
              )}
              {selectedDay.trimpScore > 0 && (
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  {language === 'ID' ? 'BEBAN:' : 'EFFORT:'} <strong className="text-rose-600 dark:text-rose-300">{selectedDay.trimpScore} PTS</strong>
                </span>
              )}

              <button
                onClick={() => setSelectedDay(null)}
                className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-zinc-700 text-[10px] font-bold uppercase transition-colors"
                title={language === 'ID' ? 'Tutup panel' : 'Close drawer'}
              >
                ✕ {language === 'ID' ? 'TUTUP' : 'CLOSE'}
              </button>
            </div>
          </div>

          {/* List of individual activities on this day */}
          <div className="space-y-2">
            {selectedDay.sessions.map((a, i) => (
              <div
                key={a.id || i}
                className="flex items-center justify-between bg-slate-50 dark:bg-[#0a0e1c] border border-slate-200 dark:border-zinc-800/80 px-3 py-2.5 text-xs hover:border-violet-500 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 dark:text-white font-bold">{a.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">({a.sportType})</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-900 dark:text-white font-black">{a.distanceKm.toFixed(2)} km</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">{a.pace}</span>
                  <span className="text-slate-600 dark:text-zinc-400">{a.time}</span>
                  <Link
                    href={`/activities/${a.id}`}
                    className="p-1.5 bg-violet-600 dark:bg-violet-900 hover:bg-violet-700 text-white border border-violet-400 dark:border-violet-500 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                    title={language === 'ID' ? 'Lihat Telemetri' : 'View Telemetry'}
                  >
                    <span>{language === 'ID' ? 'ANALISIS' : 'ANALYZE'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Month & Year Picker Popover Dialog */}
      {isPickerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsPickerOpen(false)}
        >
          <div 
            className="bg-[#0b0f1d] border-2 border-violet-500 shadow-[6px_6px_0px_#7c3aed] max-w-lg w-full p-5 sm:p-6 space-y-5 font-mono text-white relative max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-violet-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-wider text-white uppercase flex items-center gap-2">
                    {language === 'ID' ? 'LOMPAT_KE_BULAN // NAVIGASI_WAKTU' : 'JUMP_TO_MONTH // TIME_TRAVEL'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {language === 'ID'
                      ? 'NAVIGASI TELEMETRI LARI HISTORIS BERDASARKAN BULAN & TAHUN SECARA INSTAN'
                      : 'INSTANTLY NAVIGATE HISTORICAL RUNNING TELEMETRY BY MONTH & YEAR'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={language === 'ID' ? 'Tutup pemilih (Esc)' : 'Close picker (Esc)'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Year Switcher Bar */}
            <div className="flex items-center justify-between bg-[#070a14] border border-violet-800/80 p-2.5 shadow-[2px_2px_0px_#1e1b4b]">
              <button
                type="button"
                onClick={() => setPickerYear(prev => prev - 1)}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-violet-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-violet-400" />
                <span>{pickerYear - 1}</span>
              </button>

              <div className="text-center">
                <span className="text-base sm:text-lg font-black tracking-widest text-violet-300 px-4 py-0.5 bg-violet-950/80 border border-violet-700 inline-block">
                  {language === 'ID' ? 'TAHUN' : 'YEAR'} // {pickerYear}
                </span>
                <div className="text-[9px] text-zinc-400 mt-1">
                  {pickerYearStats.totalRuns > 0 ? (
                    <span className="text-emerald-400 font-bold">
                      {pickerYearStats.totalKm.toFixed(1)} KM • {pickerYearStats.totalRuns} {language === 'ID' ? 'SESI' : 'SESSIONS'} ({pickerYearStats.activeMonthsCount} {language === 'ID' ? 'BULAN AKTIF' : 'ACTIVE MOS'})
                    </span>
                  ) : (
                    <span className="text-zinc-500">
                      {language === 'ID' ? `TIDAK ADA TELEMETRI TERCATAT PADA TAHUN ${pickerYear}` : `NO TELEMETRY RECORDED IN ${pickerYear}`}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPickerYear(prev => prev + 1)}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-violet-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{pickerYear + 1}</span>
                <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
              </button>
            </div>

            {/* 12-Month Matrix Grid */}
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-2 flex items-center justify-between">
                <span>{language === 'ID' ? `PILIH BULAN DI TAHUN ${pickerYear}` : `SELECT MONTH IN ${pickerYear}`}</span>
                <span className="text-[9px] text-violet-400 font-normal">
                  {language === 'ID' ? 'KLIK BULAN UNTUK LOMPAT' : 'CLICK ANY MONTH TO JUMP'}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {pickerYearMonths.map(m => {
                  const isSelected = m.isCurrentView;
                  return (
                    <button
                      key={m.monthIndex}
                      type="button"
                      onClick={() => {
                        setCurrentYear(pickerYear);
                        setCurrentMonth(m.monthIndex);
                        setSelectedDay(null);
                        setIsPickerOpen(false);
                      }}
                      className={`p-2.5 border text-left transition-all relative flex flex-col justify-between min-h-[64px] cursor-pointer ${
                        isSelected
                          ? 'bg-violet-950 border-cyan-400 shadow-[3px_3px_0px_#06b6d4] ring-1 ring-cyan-400'
                          : m.hasActivities
                          ? 'bg-[#0e1630] hover:bg-violet-950/80 border-violet-700/80 hover:border-violet-400 shadow-[2px_2px_0px_#1e1b4b]'
                          : 'bg-[#070a14] hover:bg-[#0c1020] border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black tracking-wider ${isSelected ? 'text-cyan-300' : m.hasActivities ? 'text-white' : 'text-zinc-400'}`}>
                          {m.shortName}
                        </span>
                        {m.isRealThisMonth && (
                          <span className="text-[8px] px-1 py-0.2 bg-cyan-950 border border-cyan-600 text-cyan-300 font-bold">
                            {language === 'ID' ? 'KINI' : 'NOW'}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>

                      <div className="mt-2 text-[9px]">
                        {m.hasActivities ? (
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-emerald-400">{m.distanceKm}k</span>
                            <span className="text-zinc-400 text-[8px]">
                              {m.count} {language === 'ID' ? 'lari' : 'runs'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-[8px]">
                            {language === 'ID' ? '0 sesi' : '0 sessions'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Historical Shortcuts / Logged Months */}
            {recordedMonths.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-2">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-violet-400" />
                    {language === 'ID' ? 'LOG TELEMETRI TERCATAT' : 'RECORDED TELEMETRY LOGS'} ({recordedMonths.length} {language === 'ID' ? 'BULAN' : 'MONTHS'})
                  </span>
                  <span className="text-[9px] text-zinc-500">
                    {language === 'ID' ? 'LOMPAT 1-KLIK' : '1-CLICK JUMP'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {recordedMonths.map(rm => {
                    const isSelected = rm.year === currentYear && rm.month === currentMonth;
                    return (
                      <button
                        key={rm.key}
                        type="button"
                        onClick={() => {
                          setCurrentYear(rm.year);
                          setCurrentMonth(rm.month);
                          setSelectedDay(null);
                          setIsPickerOpen(false);
                        }}
                        className={`px-2.5 py-1 text-[10px] border transition-all flex items-center gap-1.5 cursor-pointer font-mono ${
                          isSelected
                            ? 'bg-violet-900 border-cyan-400 text-cyan-300 font-black shadow-[2px_2px_0px_#06b6d4]'
                            : 'bg-[#070a14] hover:bg-violet-950/70 border-violet-900/80 hover:border-violet-600 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <span className="font-bold">{rm.shortLabel}</span>
                        <span className="text-[9px] text-emerald-400 font-mono font-semibold">
                          {rm.distanceKm} km
                        </span>
                        <span className="text-[8px] text-zinc-500">
                          ({rm.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setCurrentYear(now.getFullYear());
                  setCurrentMonth(now.getMonth());
                  setSelectedDay(null);
                  setIsPickerOpen(false);
                }}
                className="px-3 py-1.5 bg-[#070a14] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[10px] sm:text-[11px] font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>JUMP TO TODAY</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-3 py-1.5 bg-violet-950 hover:bg-violet-900 border border-violet-700 text-violet-200 hover:text-white text-[10px] sm:text-[11px] font-black uppercase transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
