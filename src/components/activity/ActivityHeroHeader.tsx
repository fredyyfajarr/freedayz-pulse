'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { ArrowLeft, Calendar, MapPin, Zap, Flame, Mountain, BatteryCharging, Heart, Footprints, Thermometer, GitCompare, Share2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { GeoPoint } from '@/domain/entities/ActivityDetail';
import ActivityStoryExportModal from './ActivityStoryExportModal';

interface Props {
  activity: Activity;
  polyline?: GeoPoint[];
}

export default function ActivityHeroHeader({ activity, polyline = [] }: Props) {
  const { t, language } = useLanguage();
  const [isExportOpen, setIsExportOpen] = useState(false);

  const localeStr = language === 'ID' ? 'id-ID' : 'en-US';
  const dateFormatted = new Date(activity.startTime).toLocaleDateString(localeStr, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeFormatted = new Date(activity.startTime).toLocaleTimeString(localeStr, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const durationSec = activity.movingDurationSeconds || activity.durationSeconds;
  const distanceKm = (activity.distanceMeters / 1000).toFixed(2);
  const formattedPace = PaceCalculator.formatPace(activity.avgPaceSecPerKm);
  const paceNum = formattedPace.replace(' /km', '');

  // Garmin Telemetry: Total Steps during activity
  const calculatedSteps = activity.steps || (activity.dynamics?.avgCadence && durationSec
    ? Math.round(activity.dynamics.avgCadence * (durationSec / 60))
    : (durationSec ? Math.round(172 * (durationSec / 60)) : undefined));

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] mb-6 transition-colors">
      {/* Top Bar: Back, Compare & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/activities';
              }
            }}
            className="flex items-center gap-1.5 text-xs font-mono font-black text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 uppercase tracking-widest group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t('detail.back')}</span>
          </button>

          <Link
            href={`/activities/compare?a=${activity.id}`}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-cyan-400 dark:border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold uppercase transition-all"
            title="Compare this run side-by-side with another session"
          >
            <GitCompare className="w-3 h-3" />
            <span>{t('detail.compare')}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-violet-50 dark:bg-violet-950/80 hover:bg-violet-100 dark:hover:bg-violet-900 border border-violet-400 dark:border-violet-600 text-violet-700 dark:text-violet-300 font-bold uppercase transition-all cursor-pointer"
            title="Export run as Instagram Story / WhatsApp Infographic"
          >
            <Share2 className="w-3 h-3" />
            <span>{language === 'ID' ? 'BAGIKAN STORY' : 'SHARE STORY'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-600 text-violet-800 dark:text-violet-300 font-black">
            {activity.sportType.replace('_', ' ')}
          </span>
          {activity.trainingEffectLabel && (
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-300 font-black">
              {language === 'ID' ? 'MANFAAT:' : 'BENEFIT:'} {activity.trainingEffectLabel.replace(/_/g, ' ')}
            </span>
          )}
          {activity.differenceBodyBattery !== undefined && (
            <span className="text-[10px] font-mono uppercase px-2 py-1 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5" />
              {activity.differenceBodyBattery} {language === 'ID' ? 'POIN BODY BATTERY' : 'BODY BATTERY'}
            </span>
          )}
          {activity.maxTemperatureCelsius !== undefined && (
            <span className={`text-[10px] font-mono uppercase px-2 py-1 border font-bold flex items-center gap-1 ${
              activity.maxTemperatureCelsius >= 32
                ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}>
              <Thermometer className="w-3.5 h-3.5 text-orange-500" />
              <span>
                {activity.minTemperatureCelsius ? `${activity.minTemperatureCelsius}°–` : ''}
                {activity.maxTemperatureCelsius}°C
                {activity.maxTemperatureCelsius >= 32 ? ` (${t('detail.heat_stress')})` : ''}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Main Title & Date */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase">
          {activity.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs font-mono text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            {dateFormatted} @ {timeFormatted}
          </span>
          {activity.locationName && (
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              {activity.locationName}
            </span>
          )}
        </div>
      </div>

      {/* Hero 7-Card Metrics Strip (Including Garmin Calories & Steps) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono">
        {/* Distance */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
            {t('activities.distance')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{distanceKm}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">KM</span>
          </div>
        </div>

        {/* Time */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
            {t('activities.duration')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {PaceCalculator.formatDuration(durationSec)}
            </span>
          </div>
        </div>

        {/* Pace */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
            {t('activities.pace')}
          </span>
          <div className="flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{paceNum}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">/KM</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
            {t('activities.hr')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {activity.avgHeartRate || '--'}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">BPM</span>
          </div>
        </div>

        {/* Elevation Gain */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
            {t('activities.elevation')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{activity.elevationGainMeters}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">M</span>
          </div>
        </div>

        {/* Garmin Calories */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5 border-l-2 border-l-orange-500">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('detail.calories')}
            </span>
            <Flame className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
              {activity.calories ? activity.calories.toLocaleString() : '--'}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">KCAL</span>
          </div>
        </div>

        {/* Garmin Running Steps */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5 border-l-2 border-l-emerald-500 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('detail.steps')}
            </span>
            <Footprints className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {calculatedSteps ? calculatedSteps.toLocaleString() : '--'}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
              {language === 'ID' ? 'LANGKAH' : 'STEPS'}
            </span>
          </div>
        </div>
      </div>

      {/* Share / Export Story Infographic Modal */}
      {isExportOpen && (
        <ActivityStoryExportModal
          activity={activity}
          polyline={polyline}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
