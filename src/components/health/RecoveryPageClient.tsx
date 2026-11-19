'use client';

import React, { useState, useMemo } from 'react';
import { HealthTelemetrySnapshot, GarminHRVSummary } from '@/domain/entities/GarminHealthMetrics';
import GarminRecoveryHub from '@/components/health/GarminRecoveryHub';
import RecoverySevenDayCharts from '@/components/health/RecoverySevenDayCharts';
import { Zap, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  snapshot: HealthTelemetrySnapshot;
}

export default function RecoveryPageClient({ snapshot }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7; // Show 7 days of HRV data per page

  const sortedHrv = useMemo(() => {
    return snapshot.hrvHistory.slice().reverse();
  }, [snapshot.hrvHistory]);

  const totalPages = Math.max(1, Math.ceil(sortedHrv.length / itemsPerPage));
  const paginatedHrv = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedHrv.slice(start, start + itemsPerPage);
  }, [sortedHrv, currentPage, itemsPerPage]);

  const formatFeedback = (phrase: string) => {
    if (!phrase) return isId ? 'Pemulihan sistem saraf otonom normal' : 'Normal autonomic nervous system recovery';
    const clean = phrase.replace(/_/g, ' ');
    if (isId) {
      if (phrase.includes('BALANCED')) return 'HRV seimbang, pemulihan optimal';
      if (phrase.includes('UNBALANCED')) return 'HRV tidak seimbang, adaptasi stres terganggu';
      if (phrase.includes('LOW')) return 'HRV rendah, tanda kelelahan atau stres';
      if (phrase.includes('POOR')) return 'Pemulihan kurang optimal';
    }
    return clean;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-violet-900/50 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 dark:border-cyan-600/60 text-cyan-800 dark:text-cyan-300 font-bold uppercase tracking-wider">
              {isId ? 'FISIOLOGI_GARMIN // KECERDASAN_BIOMETRIK' : 'GARMIN_PHYSIOLOGY // BIOMETRIC_INTELLIGENCE'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1 break-words">
            {isId ? 'STATUS_HRV_&_PEMULIHAN_KARDIO' : 'HRV_STATUS_&_CARDIO_RECOVERY'}
          </h1>
          <p className="text-xs font-mono text-slate-600 dark:text-zinc-400">
            {isId
              ? 'VARIABILITAS DETAK JANTUNG SEMALAM, BODY BATTERY & TELEMETRI VO2MAX LARI'
              : 'OVERNIGHT HEART RATE VARIABILITY, BODY BATTERY & RUNNING VO2MAX TELEMETRY'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="px-3 py-1.5 bg-white dark:bg-[#0d1224] border-2 border-violet-400 dark:border-violet-600 shadow-[3px_3px_0px_#cbd5e1] dark:shadow-[3px_3px_0px_#7c3aed] text-right">
            <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block font-bold">
              {isId ? 'STATUS HRV' : 'HRV STATUS'}
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase">
              {snapshot.latestHrv?.status === 'BALANCED' && isId
                ? 'SEIMBANG'
                : snapshot.latestHrv?.status || 'BALANCED'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Main Recovery Hub (VO2Max, HRV, Body Battery, RHR) */}
      <GarminRecoveryHub snapshot={snapshot} />

      {/* 1.5. 7-Day Physiological Trends (7D Avg RHR, 7D Avg HRV, Body Battery, Sleep) */}
      <RecoverySevenDayCharts
        dailyHistory={snapshot.dailyHistory}
        hrvHistory={snapshot.hrvHistory}
        currentRhr={snapshot.dailySummary?.restingHeartRate}
        current7dAvgRhr={snapshot.dailySummary?.lastSevenDaysAvgRestingHeartRate}
      />

      {/* 2. 30-Day HRV History Table with Pagination */}
      <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-4 font-mono transition-colors w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Heart className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <h3 className="font-black italic tracking-widest uppercase text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {isId ? '30_HARI_TREN_HRV_SEMALAM' : '30_DAY_OVERNIGHT_HRV_TRENDS'}
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 shrink-0">
            GARMIN CONNECT HRV-SERVICE
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[580px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest text-left bg-slate-50 dark:bg-[#070a14]">
                <th className="py-2.5 px-3">{isId ? 'TANGGAL' : 'DATE'}</th>
                <th className="py-2.5 px-3">{isId ? 'RATA-RATA SEMALAM' : 'NIGHTLY AVG'}</th>
                <th className="py-2.5 px-3">{isId ? 'PUNCAK 5-MENIT' : '5-MIN HIGH PEAK'}</th>
                <th className="py-2.5 px-3">{isId ? 'BASELINE 7-HARI' : '7-DAY BASELINE'}</th>
                <th className="py-2.5 px-3">{isId ? 'STATUS' : 'STATUS'}</th>
                <th className="py-2.5 px-3">{isId ? 'UMPAN BALIK GARMIN' : 'GARMIN FEEDBACK'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {paginatedHrv.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 dark:text-zinc-500 font-sans text-xs">
                    {isId ? 'Belum ada data rekaman HRV untuk periode ini.' : 'No HRV records logged yet for this period.'}
                  </td>
                </tr>
              ) : (
                paginatedHrv.map((h: GarminHRVSummary, i: number) => {
                  const isBalanced = h.status === 'BALANCED';
                  const displayStatus = isId && isBalanced ? 'SEIMBANG' : h.status;
                  return (
                    <tr key={h.calendarDate || i} className="hover:bg-slate-50 dark:hover:bg-violet-950/20 transition-colors">
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-bold whitespace-nowrap">{h.calendarDate}</td>
                      <td className="py-3 px-3 text-cyan-700 dark:text-cyan-300 font-black whitespace-nowrap">
                        {h.lastNightAvg ? `${h.lastNightAvg} ms` : '--'}
                      </td>
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-bold whitespace-nowrap">
                        {h.lastNight5MinHigh ? `${h.lastNight5MinHigh} ms` : '--'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {h.baseline ? `${h.baseline.balancedLow} – ${h.baseline.balancedUpper} ms` : '--'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                          isBalanced
                            ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300'
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-zinc-400 text-[11px] font-sans">
                        {formatFeedback(h.feedbackPhrase)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {sortedHrv.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-800 gap-3 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans">
              {isId
                ? `Menampilkan ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, sortedHrv.length)} dari ${sortedHrv.length} hari rekaman HRV semalam`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, sortedHrv.length)} of ${sortedHrv.length} days of overnight HRV`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-zinc-800 font-bold transition-all text-xs cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{isId ? 'Sebelumnya' : 'Previous'}</span>
              </button>
              <div className="px-2.5 py-1 text-[11px] font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                {currentPage} / {totalPages}
              </div>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-zinc-800 font-bold transition-all text-xs cursor-pointer flex items-center gap-1"
              >
                <span>{isId ? 'Selanjutnya' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
