'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GeoPoint } from '@/domain/entities/ActivityDetail';
import { MapPin, Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const RouteMapInner = dynamic(() => import('./RouteMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] bg-[#070a14] border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center font-mono text-xs text-zinc-500">
      <MapPin className="w-6 h-6 text-violet-500 animate-bounce mb-2" />
      <span>MEMUAT_JARINGAN_GPS_SATELIT...</span>
    </div>
  ),
});

interface Props {
  polyline: GeoPoint[];
  hoverPoint?: GeoPoint | null;
  activityName?: string;
  activityDate?: string;
}

export default function RouteMap({ polyline, hoverPoint, activityName, activityDate }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  if (!polyline || polyline.length === 0) {
    return (
      <div className="w-full h-full min-h-[360px] bg-[#070a14] border-2 border-zinc-800 flex items-center justify-center font-mono text-xs text-zinc-500">
        {isId ? 'TIDAK_ADA_DATA_RUTE_GPS_UNTUK_AKTIVITAS_INI' : 'NO_GPS_ROUTE_DATA_AVAILABLE_FOR_THIS_ACTIVITY'}
      </div>
    );
  }

  const handleDownloadGpx = () => {
    if (!polyline || polyline.length === 0) return;
    const name = activityName || 'Garmin_Run';
    const date = activityDate || new Date().toISOString();
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="FREEDAYZZ // PULSE" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${name}</name>
    <time>${date}</time>
    <trkseg>
${polyline.map(pt => `      <trkpt lat="${pt.lat}" lon="${pt.lon}">${pt.altitude !== undefined ? `<ele>${pt.altitude}</ele>` : ''}</trkpt>`).join('\n')}
    </trkseg>
  </trk>
</gpx>`;
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_${date.slice(0, 10)}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-[400px] border-2 border-slate-200 dark:border-violet-900/60 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] overflow-hidden">
      {/* Top Banner Overlay with GPX Export */}
      <div className="absolute top-3 right-3 z-[400] bg-white/90 dark:bg-[#090d1a]/90 backdrop-blur-md border border-slate-300 dark:border-violet-600/70 px-2.5 py-1 text-[10px] font-mono text-slate-800 dark:text-zinc-300 flex items-center gap-2.5 shadow-[2px_2px_0px_#cbd5e1] dark:shadow-[2px_2px_0px_#1e1b4b]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
        <span>{isId ? 'TELEMETRI GPS' : 'GPS TELEMETRY'} // {polyline.length} {isId ? 'TITIK' : 'PTS'}</span>
        <button
          type="button"
          onClick={handleDownloadGpx}
          className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950 hover:bg-violet-200 dark:hover:bg-violet-800 border border-violet-400 dark:border-violet-500 text-violet-800 dark:text-violet-300 hover:text-violet-900 dark:hover:text-white font-bold transition-all cursor-pointer"
          title="Download GPX file for this route"
        >
          <Download className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
          <span>GPX</span>
        </button>
      </div>

      <RouteMapInner polyline={polyline} hoverPoint={hoverPoint} />
    </div>
  );
}
