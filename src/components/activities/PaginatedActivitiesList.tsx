'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Activity } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { 
  Footprints, 
  Heart, 
  BatteryCharging, 
  ArrowUpRight, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Flame, 
  Compass,
  GitCompare
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activities: Activity[];
}

export default function PaginatedActivitiesList({ activities }: Props) {
  const { t, language } = useLanguage();
  const isId = language === 'ID';
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const itemsPerPage = 5;

  useEffect(() => {
    // Read page from URL or sessionStorage after mounting to prevent SSR hydration mismatch
    const param = new URLSearchParams(window.location.search).get('page');
    if (param) {
      setCurrentPage(Math.max(1, parseInt(param, 10) || 1));
    } else {
      const saved = sessionStorage.getItem('activities_current_page');
      if (saved) setCurrentPage(Math.max(1, parseInt(saved, 10) || 1));
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search).get('page');
      if (p) {
        setCurrentPage(Math.max(1, parseInt(p, 10) || 1));
      } else {
        const s = sessionStorage.getItem('activities_current_page');
        if (s) setCurrentPage(Math.max(1, parseInt(s, 10) || 1));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Filter activities based on search query and sport type
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchesSearch = 
        act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.locationName && act.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.trainingEffectLabel && act.trainingEffectLabel.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSport = 
        selectedSport === 'ALL' || 
        act.sportType.toLowerCase() === selectedSport.toLowerCase();

      return matchesSearch && matchesSport;
    });
  }, [activities, searchQuery, selectedSport]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage) || 1;

  // Ensure current page stays in bounds
  const validCurrentPage = Math.min(currentPage, totalPages);

  // Paginated slice
  const paginatedActivities = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, validCurrentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('page', String(page));
      window.history.replaceState({}, '', url.toString());
      sessionStorage.setItem('activities_current_page', String(page));
    }
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const sports = useMemo(() => {
    const s = new Set<string>();
    activities.forEach(a => s.add(a.sportType));
    return ['ALL', ...Array.from(s)];
  }, [activities]);

  const startIndex = (validCurrentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(validCurrentPage * itemsPerPage, filteredActivities.length);

  return (
    <div className="space-y-6">
      {/* 1. Bilingual Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-violet-900/50 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700/60 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider">
              {isId ? 'TELEMETRI_LOG // ARSIP' : 'TELEMETRY_LOG // ARCHIVE'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1">
            {isId ? 'SEMUA_AKTIVITAS_LARI' : 'ALL_RUNNING_ACTIVITIES'}
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            {isId 
              ? `TOTAL ${activities.length} SESI TERCATAT (TERPAGINASI // 5 SESI PER HALAMAN)` 
              : `TOTAL OF ${activities.length} LOGGED SESSIONS (PAGINATED // 5 SESSIONS PER PAGE)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/activities/compare"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 dark:bg-cyan-950 hover:bg-cyan-200 dark:hover:bg-cyan-900 border border-cyan-400 dark:border-cyan-500 hover:border-cyan-500 dark:hover:border-cyan-300 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-white text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_#06b6d4]"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isId ? 'BANDINGKAN LARI' : 'COMPARE RUNS'}</span>
          </Link>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono transition-colors">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-violet-600 dark:text-violet-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={isId ? 'Cari aktivitas berdasarkan nama, lokasi...' : 'Search activities by title, date, notes...'}
            className="w-full bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-800 focus:border-violet-500 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none transition-colors"
          />
        </div>

        {/* Sport Type Filters & Counter */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-xs">
          <div className="flex items-center gap-1">
            {sports.map(sport => {
              const label = sport === 'ALL' 
                ? (isId ? 'SEMUA' : 'ALL') 
                : (isId && sport.toLowerCase() === 'running' ? 'LARI' : sport.replace('_', ' '));

              return (
                <button
                  key={sport}
                  onClick={() => {
                    setSelectedSport(sport);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    selectedSport === sport
                      ? 'bg-violet-600 dark:bg-violet-950 text-white dark:text-violet-300 border-violet-500 shadow-[2px_2px_0px_#7c3aed]'
                      : 'bg-slate-100 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <span className="text-[10px] text-slate-500 dark:text-zinc-400 hidden md:inline-block">
            {filteredActivities.length} {isId ? 'SESI' : 'SESSIONS'}
          </span>
        </div>
      </div>

      {/* 3. Activities List (5 items max) */}
      <div className="space-y-3 font-mono">
        {paginatedActivities.length === 0 ? (
          <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-8 text-center text-xs text-slate-500 dark:text-zinc-500">
            {isId ? 'TIDAK ADA SESI YANG SESUAI KRITERIA PENCARIAN.' : 'NO SESSIONS MATCH YOUR SEARCH CRITERIA.'}
          </div>
        ) : (
          paginatedActivities.map(act => {
            const dateStr = act.startTimeLocalStr
              ? act.startTimeLocalStr.split(' ')[0]
              : new Date(act.startTime).toLocaleDateString(isId ? 'id-ID' : 'en-US');

            const timeStr = act.startTimeLocalStr
              ? act.startTimeLocalStr.split(' ')[1]?.slice(0, 5)
              : new Date(act.startTime).toLocaleTimeString(isId ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' });

            const distKm = (act.distanceMeters / 1000).toFixed(2);
            const pace = PaceCalculator.formatPace(act.avgPaceSecPerKm).replace(' /km', '');
            const duration = PaceCalculator.formatDuration(act.movingDurationSeconds || act.durationSeconds);
            
            // Normalize cadence to SPM if recorded as single-leg RPM
            const rawCad = act.dynamics?.avgCadence;
            const normCad = rawCad && rawCad > 0 ? (rawCad < 125 ? rawCad * 2 : rawCad) : null;

            return (
              <div
                key={act.id}
                className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 hover:border-violet-600/80 p-5 transition-all shadow-sm hover:shadow-[4px_4px_0px_#7c3aed] group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700/60 text-violet-800 dark:text-violet-300 font-black">
                        {isId && act.sportType.toLowerCase() === 'running' ? 'LARI' : act.sportType.replace('_', ' ')}
                      </span>
                      {act.trainingEffectLabel && (
                        <span className="text-[10px] uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-600/50 text-blue-800 dark:text-blue-300 font-black">
                          {isId ? 'MANFAAT:' : 'TE:'} {act.trainingEffectLabel.replace(/_/g, ' ')}
                        </span>
                      )}
                      {act.differenceBodyBattery !== undefined && (
                        <span className="text-[10px] uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center gap-1 font-bold">
                          <BatteryCharging className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          {act.differenceBodyBattery} BB
                        </span>
                      )}
                      {act.relativeEffortScore > 0 && (
                        <span className="text-[10px] uppercase px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700/60 text-rose-800 dark:text-rose-300 flex items-center gap-1 font-bold">
                          <Flame className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                          {act.relativeEffortScore} TRIMP
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/activities/${act.id}`}
                      className="block text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors mt-2"
                    >
                      {act.name}
                    </Link>

                    <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      {dateStr} @ {timeStr} {act.locationName ? `// ${act.locationName}` : ''}
                    </div>
                  </div>

                  {/* Right: Metrics Grid */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {/* Distance */}
                    <div className="text-left sm:text-right">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        {isId ? 'JARAK' : 'DISTANCE'}
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {distKm} <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">km</span>
                      </span>
                    </div>

                    {/* Pace */}
                    <div className="text-left sm:text-right">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        {isId ? 'RATA-RATA PACE' : 'AVG PACE'}
                      </span>
                      <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">
                        {pace} <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">/km</span>
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="text-left sm:text-right">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        {isId ? 'WAKTU' : 'TIME'}
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {duration}
                      </span>
                    </div>

                    {/* HR */}
                    {act.avgHeartRate && (
                      <div className="text-left sm:text-right">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1 sm:justify-end">
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {isId ? 'HR RATA-RATA' : 'AVG HR'}
                        </span>
                        <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                          {act.avgHeartRate} <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">bpm</span>
                        </span>
                      </div>
                    )}

                    {/* Cadence */}
                    {normCad && (
                      <div className="text-left sm:text-right hidden sm:block">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1 sm:justify-end">
                          <Footprints className="w-3 h-3 text-amber-500 dark:text-amber-400" /> {isId ? 'KADENSI' : 'CADENCE'}
                        </span>
                        <span className="text-xl font-black text-amber-600 dark:text-amber-300">
                          {normCad} <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">spm</span>
                        </span>
                      </div>
                    )}

                    {/* Action */}
                    <Link
                      href={`/activities/${act.id}`}
                      className="p-2.5 sm:p-3 bg-violet-100 dark:bg-violet-950 hover:bg-violet-600 dark:hover:bg-violet-800 border-2 border-violet-400 dark:border-violet-500 text-violet-800 dark:text-white hover:text-white transition-all shadow-[3px_3px_0px_#7c3aed] group-hover:translate-x-0.5 shrink-0"
                      title={isId ? 'Lihat Telemetri' : 'View Telemetry'}
                    >
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Pagination Bar (when items > 5) */}
      {filteredActivities.length > itemsPerPage && (
        <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono transition-colors">
          <div className="text-slate-600 dark:text-zinc-400 text-[11px]">
            {isId ? 'MENAMPILKAN' : 'SHOWING'} <strong className="text-slate-900 dark:text-white">{startIndex}</strong> – <strong className="text-slate-900 dark:text-white">{endIndex}</strong> {isId ? 'DARI' : 'OF'} <strong className="text-violet-600 dark:text-violet-300">{filteredActivities.length}</strong> {isId ? 'TOTAL LARI' : 'TOTAL RUNS'}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(Math.max(1, validCurrentPage - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-violet-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title={isId ? 'Halaman Sebelumnya' : 'Previous Page'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`min-w-[32px] h-8 px-2 border text-xs font-black transition-all cursor-pointer ${
                  validCurrentPage === pageNum
                    ? 'bg-violet-600 dark:bg-violet-950 text-white dark:text-violet-300 border-violet-500 shadow-[2px_2px_0px_#7c3aed]'
                    : 'bg-slate-100 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-zinc-600'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, validCurrentPage + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-violet-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title={isId ? 'Halaman Berikutnya' : 'Next Page'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
