'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  MapPin,
  Clock,
  Heart,
  Mountain,
  Footprints,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityFileImportModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { language } = useLanguage();
  const isId = language === 'ID';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    activity: any;
    detail: any;
    pointCount: number;
  } | null>(null);

  if (!isOpen) return null;

  // Haversine formula for distance between 2 GPS coordinates
  const calculateHaversineMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const parseGPX = async (text: string, fileName: string) => {
    setParsing(true);
    setErrorMsg(null);

    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      // Check parse errors
      const parseError = xml.querySelector('parsererror');
      if (parseError) {
        throw new Error('File GPX rusak atau format XML tidak valid.');
      }

      // Track points
      const trkptNodes = xml.querySelectorAll('trkpt');
      if (trkptNodes.length === 0) {
        throw new Error('Tidak ditemukan titik koordinat GPS (trkpt) di file ini.');
      }

      const activityNameNode = xml.querySelector('trk > name') || xml.querySelector('name');
      const cleanName =
        activityNameNode?.textContent?.trim() ||
        fileName.replace(/\.(gpx|fit|json)$/i, '').replace(/[-_]/g, ' ') ||
        'Outdoor Run';

      let totalDistM = 0;
      let elevGain = 0;
      let prevPt: { lat: number; lon: number; ele: number; time?: Date } | null = null;
      let hrSum = 0;
      let hrCount = 0;
      let maxHr = 0;

      const metricStream: any[] = [];
      const polylinePoints: [number, number][] = [];

      let startTime: Date | null = null;
      let endTime: Date | null = null;

      trkptNodes.forEach((node, idx) => {
        const lat = parseFloat(node.getAttribute('lat') || '0');
        const lon = parseFloat(node.getAttribute('lon') || '0');
        const eleNode = node.querySelector('ele');
        const ele = eleNode ? parseFloat(eleNode.textContent || '0') : 0;
        const timeNode = node.querySelector('time');
        const time = timeNode?.textContent ? new Date(timeNode.textContent) : null;

        if (idx === 0 && time) startTime = time;
        if (time) endTime = time;

        // Heart rate extraction (standard gpxtpx:hr or hr)
        const hrNode =
          node.querySelector('hr') ||
          node.getElementsByTagNameNS('*', 'hr')[0];
        const hr = hrNode ? parseInt(hrNode.textContent || '0', 10) : 0;
        if (hr > 0) {
          hrSum += hr;
          hrCount++;
          if (hr > maxHr) maxHr = hr;
        }

        if (prevPt) {
          const deltaM = calculateHaversineMeters(prevPt.lat, prevPt.lon, lat, lon);
          // Filter anomalous GPS jumps (> 150m between 1-sec ticks)
          if (deltaM < 150) {
            totalDistM += deltaM;
          }
          if (ele > prevPt.ele) {
            elevGain += ele - prevPt.ele;
          }
        }

        prevPt = { lat, lon, ele, time: time || undefined };
        polylinePoints.push([lat, lon]);

        // Sample stream every 5 points to save size
        if (idx % 3 === 0) {
          metricStream.push({
            timestamp: time ? time.toISOString() : undefined,
            distance: Math.round(totalDistM),
            elevation: Math.round(ele),
            heartRate: hr > 0 ? hr : undefined,
          });
        }
      });

      const effectiveStartTime = startTime || new Date();
      const effectiveEndTime = endTime || new Date(effectiveStartTime.getTime() + 1800000);
      const durationSeconds = Math.max(
        60,
        Math.round((effectiveEndTime.getTime() - effectiveStartTime.getTime()) / 1000)
      );

      const avgSpeedMps = totalDistM > 0 && durationSeconds > 0 ? totalDistM / durationSeconds : 0;
      const avgPaceSec = totalDistM > 100 ? Math.round(durationSeconds / (totalDistM / 1000)) : 420;
      const avgHr = hrCount > 0 ? Math.round(hrSum / hrCount) : 155;

      // Approximate TRIMP score
      const trimp = Math.round((durationSeconds / 60) * 1.5);
      const activityId = `import-${Date.now()}`;

      const newActivity = {
        id: activityId,
        name: cleanName,
        sportType: 'running',
        startTime: effectiveStartTime,
        durationSeconds,
        movingDurationSeconds: durationSeconds,
        distanceMeters: Math.round(totalDistM),
        avgSpeedMps,
        maxSpeedMps: avgSpeedMps * 1.35,
        elevationGainMeters: Math.round(elevGain),
        elevationLossMeters: Math.round(elevGain * 0.95),
        avgHeartRate: avgHr,
        maxHeartRate: maxHr > 0 ? maxHr : avgHr + 20,
        calories: Math.round((totalDistM / 1000) * 65),
        avgPaceSecPerKm: avgPaceSec,
        relativeEffortScore: trimp,
        locationName: 'GPS Track Import',
      };

      const newDetail = {
        activityId,
        metricStream,
        splits: [],
        polylinePoints: polylinePoints.slice(0, 500),
      };

      setParsedData({
        activity: newActivity,
        detail: newDetail,
        pointCount: trkptNodes.length,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses file GPX.');
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg(null);
    setParsedData(null);

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'gpx') {
      const text = await selectedFile.text();
      await parseGPX(text, selectedFile.name);
    } else if (ext === 'json') {
      try {
        const json = JSON.parse(await selectedFile.text());
        if (json.id && json.distanceMeters) {
          setParsedData({
            activity: json,
            detail: null,
            pointCount: json.metricStream?.length || 100,
          });
        } else {
          throw new Error('Format JSON aktivitas tidak sesuai skema.');
        }
      } catch (e: any) {
        setErrorMsg(e.message || 'JSON tidak valid.');
      }
    } else {
      setErrorMsg('Format file belum didukung. Harap gunakan file .GPX atau .JSON.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveActivity = async () => {
    if (!parsedData) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/activities/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: parsedData.activity,
          detail: parsedData.detail,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan aktivitas.');
      }

      onClose();
      router.refresh();
      window.location.href = `/activities/${parsedData.activity.id}`;
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengimpor aktivitas.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0d1224] border-2 border-violet-800/80 max-w-2xl w-full flex flex-col shadow-[8px_8px_0px_#7c3aed] overflow-hidden font-mono text-slate-900 dark:text-zinc-100 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#070a14]">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-violet-600 dark:text-cyan-400" />
            <h2 className="text-sm font-black italic tracking-wide uppercase">
              {isId ? 'IMPORT FILE AKTIVITAS // .GPX / .JSON' : 'IMPORT RUN ACTIVITY FILE // .GPX'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 scale-[0.99]'
                : 'border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-[#070a14] hover:border-violet-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".gpx,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-violet-100 dark:bg-violet-950/80 border border-violet-400 dark:border-violet-600 text-violet-600 dark:text-cyan-400">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase mt-2">
                {isId ? 'Tarik & Letakkan File .GPX / .JSON di Sini' : 'Drag & Drop .GPX / .JSON File Here'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans">
                {isId
                  ? 'Atau klik untuk memilih file dari komputer (Ekspor dari Garmin / Strava / Coros).'
                  : 'Or click to browse from device (Exported from Garmin, Strava, or Coros).'}
              </p>
            </div>
          </div>

          {/* Parsing State */}
          {parsing && (
            <div className="p-4 bg-violet-50 dark:bg-violet-950/40 border border-violet-300 dark:border-violet-700 text-center text-xs animate-pulse">
              {isId ? 'Mengekstrak titik GPS, elevasi, dan denyut jantung...' : 'Parsing GPS trackpoints, elevation & heart rate stream...'}
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedData && (
            <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-emerald-500 p-4 space-y-3 shadow-[2px_2px_0px_#10b981]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isId ? 'BERHASIL DIEKSTRAK' : 'EXTRACTED SUCCESSFULLY'}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {parsedData.pointCount} GPS POINTS
                </span>
              </div>

              {/* Editable Name */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400 block mb-1">
                  {isId ? 'JUDUL SESI LARI' : 'ACTIVITY NAME'}
                </label>
                <input
                  type="text"
                  value={parsedData.activity.name}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      activity: { ...parsedData.activity, name: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-white dark:bg-[#0d1224] border border-slate-300 dark:border-zinc-800 text-xs font-bold focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Metrics Preview */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                <div className="p-2 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[8px] text-slate-400 dark:text-zinc-500 block">DISTANCE</span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white">
                    {(parsedData.activity.distanceMeters / 1000).toFixed(2)} KM
                  </strong>
                </div>
                <div className="p-2 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[8px] text-slate-400 dark:text-zinc-500 block">TIME</span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white">
                    {PaceCalculator.formatDuration(parsedData.activity.durationSeconds)}
                  </strong>
                </div>
                <div className="p-2 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[8px] text-slate-400 dark:text-zinc-500 block">PACE</span>
                  <strong className="text-sm font-black text-cyan-600 dark:text-cyan-400">
                    {PaceCalculator.formatPace(parsedData.activity.avgPaceSecPerKm).replace(' /km', '')}
                  </strong>
                </div>
                <div className="p-2 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[8px] text-slate-400 dark:text-zinc-500 block">HEART RATE</span>
                  <strong className="text-sm font-black text-rose-500">
                    {parsedData.activity.avgHeartRate || '--'} BPM
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#070a14] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-zinc-800 text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isId ? 'Batal' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={!parsedData || saving}
            onClick={handleSaveActivity}
            className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider border border-violet-400 shadow-[3px_3px_0px_#cbd5e1] dark:shadow-[3px_3px_0px_#1e1b4b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>
              {saving
                ? isId
                  ? 'MENYIMPAN...'
                  : 'SAVING...'
                : isId
                ? 'SIMPAN KE TELEMETRY LAB'
                : 'SAVE TO TELEMETRY LAB'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}