'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { 
  GitCompare, 
  Calendar as CalendarIcon, 
  ListFilter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeftRight, 
  Search,
  Check,
  Layers,
  Footprints,
  Clock,
  Heart
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activities: Activity[];
  selectedA: string;
  selectedB: string;
}

const MONTH_NAMES_EN = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const MONTH_NAMES_ID = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

export default function CompareSelectorClient({ activities, selectedA, selectedB }: Props) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isId = language === 'ID';
  const MONTH_NAMES = isId ? MONTH_NAMES_ID : MONTH_NAMES_EN;

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');

  // Find active activities
  const activeRunA = useMemo(() => activities.find(a => a.id === selectedA) || activities[0], [activities, selectedA]);
  const activeRunB = useMemo(() => activities.find(a => a.id === selectedB) || (activities.length > 1 ? activities[1] : activities[0]), [activities, selectedB]);

  // Calendar year and month state (initialized from active Run A or latest run)
  const initialDate = useMemo(() => {
    const act = activeRunA || activities[0];
    if (act) {
      const d = new Date(act.startTime);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, [activeRunA, activities]);

  const [calYear, setCalYear] = useState<number>(initialDate.year);
  const [calMonth, setCalMonth] = useState<number>(initialDate.month); // 0-indexed

  // Selected date string on the calendar
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    const act = activeRunA || activities[0];
    if (act) {
      return act.startTimeLocalStr ? act.startTimeLocalStr.split(' ')[0] : new Date(act.startTime).toISOString().split('T')[0];
    }
    return '';
  });

  // Inspected activity within the selected day (defaults to largest distance on that day)
  const [inspectedActivityId, setInspectedActivityId] = useState<string>(activeRunA?.id || '');

  // Map activities by date string "YYYY-MM-DD", sorted by distance descending (main workout first!)
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    activities.forEach(act => {
      const dateStr = act.startTimeLocalStr 
        ? act.startTimeLocalStr.split(' ')[0] 
        : new Date(act.startTime).toISOString().split('T')[0];
      const existing = map.get(dateStr) || [];
      existing.push(act);
      map.set(dateStr, existing);
    });

    // Sort each day's activities: longest distance first!
    map.forEach((list) => {
      list.sort((a, b) => b.distanceMeters - a.distanceMeters);
    });

    return map;
  }, [activities]);

  // Month navigation
  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalYear(prev => prev - 1);
      setCalMonth(11);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalYear(prev => prev + 1);
      setCalMonth(0);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  // Generate calendar grid (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    
    // Day of week: 0 for Monday, 6 for Sunday
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const days = [];

    // Prev month padding
    const prevMonthLastDay = new Date(calYear, calMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = calMonth === 0 ? 11 : calMonth - 1;
      const y = calMonth === 0 ? calYear - 1 : calYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        activities: activitiesByDate.get(dateStr) || [],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        activities: activitiesByDate.get(dateStr) || [],
      });
    }

    // Next month padding to fill out complete grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const m = calMonth === 11 ? 0 : calMonth + 1;
      const y = calMonth === 11 ? calYear + 1 : calYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        activities: activitiesByDate.get(dateStr) || [],
      });
    }

    return days;
  }, [calYear, calMonth, activitiesByDate]);

  // Update URL without scrolling to top
  const updateUrl = (newA: string, newB: string) => {
    const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    router.replace(`/activities/compare?a=${newA}&b=${newB}`, { scroll: false });
    
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
      });
      setTimeout(() => {
        window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
      }, 50);
    }
  };

  // Handle setting run A and run B
  const handleSetA = (id: string) => {
    updateUrl(id, selectedB);
  };

  const handleSetB = (id: string) => {
    updateUrl(selectedA, id);
  };

  const handleSwap = () => {
    updateUrl(selectedB, selectedA);
  };

  // Activities for the selected calendar day
  const selectedDayActivities = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return activitiesByDate.get(selectedCalendarDate) || [];
  }, [activitiesByDate, selectedCalendarDate]);

  // Active inspected activity
  const activeInspectedActivity = useMemo(() => {
    if (selectedDayActivities.length === 0) return null;
    const found = selectedDayActivities.find(a => a.id === inspectedActivityId);
    return found || selectedDayActivities[0];
  }, [selectedDayActivities, inspectedActivityId]);

  // Filtered activities for list view
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const q = searchQuery.toLowerCase();
    return activities.filter(act => 
      act.name?.toLowerCase().includes(q) ||
      act.startTimeLocalStr?.toLowerCase().includes(q) ||
      `${(act.distanceMeters / 1000).toFixed(1)}k`.includes(q)
    );
  }, [activities, searchQuery]);

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] font-mono space-y-4 transition-colors">
      {/* 1. Header Toolbar with Mode Switcher & Swap Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 gap-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {t('compare.title')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Swap Runs Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-violet-700/80 hover:border-violet-400 text-violet-700 dark:text-violet-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Swap Session A and Session B"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">SWAP A & B</span>
          </button>

          {/* View Mode Toggle (Calendar vs List) */}
          <div className="flex items-center bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-800 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-violet-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{t('compare.calendar_view')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-violet-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{t('compare.list_view')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Run Comparison Summary Cards (Session A vs Session B) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Active Run A Pill */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-violet-400 dark:border-violet-600/80 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block"></span>
              {t('compare.currently_a')}
            </span>
            <span className="text-[10px] text-zinc-400">
              {activeRunA ? new Date(activeRunA.startTime).toLocaleDateString() : '--'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-black text-white truncate max-w-[220px]">
              {activeRunA?.name || 'Session A'}
            </span>
            <span className="text-sm font-black text-violet-300">
              {activeRunA ? (activeRunA.distanceMeters / 1000).toFixed(2) : '0'} km
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/80">
            <span>Pace: {activeRunA ? PaceCalculator.formatPace(activeRunA.avgPaceSecPerKm) : '--'}</span>
            <span>{isId ? 'HR Rata-rata:' : 'Avg HR:'} {activeRunA?.avgHeartRate || '--'} bpm</span>
          </div>
        </div>

        {/* Active Run B Pill */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-orange-400 dark:border-orange-500/80 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
              {t('compare.currently_b')}
            </span>
            <span className="text-[10px] text-zinc-400">
              {activeRunB ? new Date(activeRunB.startTime).toLocaleDateString(isId ? 'id-ID' : 'en-US') : '--'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-black text-white truncate max-w-[220px]">
              {activeRunB?.name || 'Session B'}
            </span>
            <span className="text-sm font-black text-orange-300">
              {activeRunB ? (activeRunB.distanceMeters / 1000).toFixed(2) : '0'} km
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/80">
            <span>Pace: {activeRunB ? PaceCalculator.formatPace(activeRunB.avgPaceSecPerKm) : '--'}</span>
            <span>{isId ? 'HR Rata-rata:' : 'Avg HR:'} {activeRunB?.avgHeartRate || '--'} bpm</span>
          </div>
        </div>
      </div>

      {/* 3. CALENDAR PICKER MODE (Monthly Training Calendar Grid) */}
      {viewMode === 'calendar' ? (
        <div className="space-y-4 pt-2">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between bg-[#070a14] border border-zinc-800 p-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <p className="text-[9px] text-zinc-400 uppercase">
                {t('compare.pick_date_hint')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 7-Column Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-zinc-400 uppercase font-black">
            <span>{t('calendar.mon')}</span>
            <span>{t('calendar.tue')}</span>
            <span>{t('calendar.wed')}</span>
            <span>{t('calendar.thu')}</span>
            <span>{t('calendar.fri')}</span>
            <span>{t('calendar.sat')}</span>
            <span>{t('calendar.sun')}</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 font-mono">
            {calendarDays.map((cell, idx) => {
              const hasRun = cell.activities.length > 0;
              // Primary workout is the largest distance on that day!
              const primaryAct = cell.activities[0];
              const isSelectedA = cell.activities.some(a => a.id === selectedA);
              const isSelectedB = cell.activities.some(a => a.id === selectedB);
              const isCellActive = selectedCalendarDate === cell.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasRun) {
                      setSelectedCalendarDate(cell.dateStr);
                      // Set inspected activity to the main run or selected run
                      const matchingSelected = cell.activities.find(a => a.id === selectedA || a.id === selectedB);
                      setInspectedActivityId((matchingSelected || primaryAct).id);
                    }
                  }}
                  className={`min-h-[58px] sm:min-h-[70px] p-1 sm:p-1.5 border transition-all flex flex-col justify-between select-none ${
                    !cell.isCurrentMonth
                      ? 'opacity-30 border-zinc-900 bg-[#070a14]/40'
                      : hasRun
                      ? 'bg-[#070a14] cursor-pointer hover:border-cyan-400 shadow-sm'
                      : 'bg-[#070a14]/60 border-zinc-900'
                  } ${
                    isSelectedA && isSelectedB
                      ? 'border-2 border-cyan-400 bg-cyan-950/25 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                      : isSelectedA
                      ? 'border-2 border-violet-500 bg-violet-950/30 shadow-[0_0_8px_rgba(139,92,246,0.4)]'
                      : isSelectedB
                      ? 'border-2 border-orange-500 bg-orange-950/30 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                      : isCellActive
                      ? 'border-cyan-400 bg-cyan-950/15'
                      : 'border-zinc-800/80'
                  }`}
                >
                  {/* Top: Day Number & Multi-Run or Selected Badges */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black ${cell.isCurrentMonth ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {cell.dayNumber}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {cell.activities.length > 1 && (
                        <span className="text-[7.5px] px-1 py-0.2 bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold" title={`${cell.activities.length} sessions logged on this day`}>
                          {cell.activities.length}x
                        </span>
                      )}
                      {isSelectedA && (
                        <span className="text-[8px] font-black px-1 bg-violet-600 text-white rounded-none">
                          A
                        </span>
                      )}
                      {isSelectedB && (
                        <span className="text-[8px] font-black px-1 bg-orange-500 text-white rounded-none">
                          B
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Mileage badge (Shows largest primary distance) */}
                  {hasRun ? (
                    <div className="mt-1">
                      <span className="text-[10px] sm:text-xs font-black text-white block truncate leading-tight">
                        {(primaryAct.distanceMeters / 1000).toFixed(1)}k
                      </span>
                      <span className="text-[8px] text-zinc-400 block truncate">
                        {PaceCalculator.formatPace(primaryAct.avgPaceSecPerKm).replace(' /km', '')}
                      </span>
                    </div>
                  ) : (
                    <div className="h-3" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Inspected Workout Session Tray (Supports Multi-Session Selection!) */}
          {activeInspectedActivity && (
            <div className="bg-[#070a14] border-2 border-cyan-500/80 p-3 sm:p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block">
                      {isId ? 'TANGGAL LATIHAN:' : 'WORKOUT DATE:'} {selectedCalendarDate}
                    </span>
                    {selectedDayActivities.length > 1 && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 border border-zinc-700 text-amber-300 font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {selectedDayActivities.length} {isId ? 'SESI PADA TANGGAL INI' : 'SESSIONS ON THIS DATE'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-white mt-0.5">
                    {activeInspectedActivity.name} &bull; {new Date(activeInspectedActivity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </h3>
                </div>

                {/* 2 Big Action Buttons: Set as A or Set as B */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetA(activeInspectedActivity.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                      selectedA === activeInspectedActivity.id
                        ? 'bg-violet-700 text-white border-violet-400 shadow-[2px_2px_0px_#ffffff]'
                        : 'bg-[#0d1224] text-violet-300 border-violet-600 hover:bg-violet-900/60'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${selectedA === activeInspectedActivity.id ? 'inline' : 'hidden'}`} />
                    <span>{t('compare.set_as_a')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetB(activeInspectedActivity.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                      selectedB === activeInspectedActivity.id
                        ? 'bg-orange-600 text-white border-orange-400 shadow-[2px_2px_0px_#ffffff]'
                        : 'bg-[#0d1224] text-orange-300 border-orange-600 hover:bg-orange-900/60'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${selectedB === activeInspectedActivity.id ? 'inline' : 'hidden'}`} />
                    <span>{t('compare.set_as_b')}</span>
                  </button>
                </div>
              </div>

              {/* If date has MULTIPLE activities (e.g. 11k + 0.2k on Oct 22), show session selector tabs! */}
              {selectedDayActivities.length > 1 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    {isId ? 'PILIH SESI PADA TANGGAL INI:' : 'SELECT SESSION ON THIS DATE:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDayActivities.map((act) => {
                      const isInspected = act.id === activeInspectedActivity.id;
                      const km = (act.distanceMeters / 1000).toFixed(2);
                      const pace = PaceCalculator.formatPace(act.avgPaceSecPerKm);
                      const isA = act.id === selectedA;
                      const isB = act.id === selectedB;

                      return (
                        <div
                          key={act.id}
                          onClick={() => setInspectedActivityId(act.id)}
                          className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between ${
                            isInspected
                              ? 'bg-[#0d1224] border-2 border-cyan-400 shadow-[2px_2px_0px_#06b6d4]'
                              : 'bg-[#090d1a] border-zinc-800 hover:border-zinc-700 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white">{km} km</span>
                              <span className="text-[10px] text-zinc-400">@ {pace}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 truncate block">
                              {act.name} &bull; {new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isA && <span className="text-[9px] px-1.5 py-0.5 bg-violet-700 text-white font-black">{isId ? 'LARI A' : 'RUN A'}</span>}
                            {isB && <span className="text-[9px] px-1.5 py-0.5 bg-orange-600 text-white font-black">{isId ? 'LARI B' : 'RUN B'}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Telemetry Glance for the Active Inspected Activity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#0d1224] p-2 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">{isId ? 'JARAK' : 'DISTANCE'}</span>
                  <span className="font-black text-white text-sm">
                    {(activeInspectedActivity.distanceMeters / 1000).toFixed(2)} km
                  </span>
                </div>
                <div className="bg-[#0d1224] p-2 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">{isId ? 'RATA-RATA PACE' : 'AVG PACE'}</span>
                  <span className="font-black text-white text-sm">
                    {PaceCalculator.formatPace(activeInspectedActivity.avgPaceSecPerKm)}
                  </span>
                </div>
                <div className="bg-[#0d1224] p-2 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">{isId ? 'HR RATA-RATA' : 'AVG HEART RATE'}</span>
                  <span className="font-black text-rose-400 text-sm">
                    {activeInspectedActivity.avgHeartRate || '--'} bpm
                  </span>
                </div>
                <div className="bg-[#0d1224] p-2 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block uppercase">{isId ? 'BEBAN TRIMP' : 'CARDIAC TRIMP'}</span>
                  <span className="font-black text-violet-300 text-sm">
                    {activeInspectedActivity.relativeEffortScore || '--'} pts
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 4. LIST VIEW MODE (Quick Search + Dropdowns) */
        <div className="space-y-4 pt-2">
          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('compare.search_hint')}
              className="w-full bg-[#070a14] border border-zinc-800 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dropdown A */}
            <div className="space-y-1">
              <label className="text-[10px] text-violet-400 uppercase font-black block">
                {t('compare.select_run_a')}
              </label>
              <select
                value={selectedA}
                onChange={(e) => handleSetA(e.target.value)}
                className="w-full bg-[#070a14] border-2 border-violet-700/80 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                {filteredActivities.map((act) => {
                  const km = (act.distanceMeters / 1000).toFixed(2);
                  const date = new Date(act.startTime).toLocaleDateString();
                  const time = new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const pace = PaceCalculator.formatPace(act.avgPaceSecPerKm);
                  return (
                    <option key={act.id} value={act.id}>
                      {date} ({time}) &bull; {act.name} &bull; {km} km @ {pace}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Dropdown B */}
            <div className="space-y-1">
              <label className="text-[10px] text-orange-400 uppercase font-black block">
                {t('compare.select_run_b')}
              </label>
              <select
                value={selectedB}
                onChange={(e) => handleSetB(e.target.value)}
                className="w-full bg-[#070a14] border-2 border-orange-500/80 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                {filteredActivities.map((act) => {
                  const km = (act.distanceMeters / 1000).toFixed(2);
                  const date = new Date(act.startTime).toLocaleDateString();
                  const time = new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const pace = PaceCalculator.formatPace(act.avgPaceSecPerKm);
                  return (
                    <option key={act.id} value={act.id}>
                      {date} ({time}) &bull; {act.name} &bull; {km} km @ {pace}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
