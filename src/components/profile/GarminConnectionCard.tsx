'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Key, RefreshCw, CheckCircle2, AlertTriangle, Activity, Wifi, Radio } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface GarminStatusData {
  configured: boolean;
  connected: boolean;
  latencyMs: number;
  lastSync: string | null;
  totalActivities: number;
  maskedKey: string;
  message: string;
  error?: string;
}

interface Props {
  initialStatus?: GarminStatusData | null;
}

export default function GarminConnectionCard({ initialStatus }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [status, setStatus] = useState<GarminStatusData | null>(initialStatus || null);
  const [isPinging, setIsPinging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsPinging(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/garmin/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(prev => prev ? { ...prev, connected: false, message: 'Server connection unreachable.' } : null);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    if (!status) {
      checkStatus();
    }
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback(
          isId 
            ? `Berhasil sinkron ${data.syncedCount || 0} aktivitas terbaru Garmin!` 
            : `Successfully synced ${data.syncedCount || 0} latest Garmin activities!`
        );
        checkStatus();
      } else {
        setSyncFeedback(data.error || (isId ? 'Gagal melakukan sinkronisasi.' : 'Sync failed.'));
      }
    } catch (err: any) {
      setSyncFeedback(err.message || 'Network error');
    } finally {
      setIsSyncing(false);
    }
  };

  const isConnected = status?.connected === true;
  const isConfigured = status?.configured === true;

  return (
    <div className="bg-[#0d1224] border-2 border-violet-900/60 p-5 shadow-[4px_4px_0px_#1e1b4b] space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-violet-400" />
          <h3 className="font-black italic tracking-widest uppercase text-xs sm:text-sm text-white">
            GARMIN_PERSONAL_API // STATUS_LIVE
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <span className="text-[9px] px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE & AKTIF
            </span>
          ) : isConfigured ? (
            <span className="text-[9px] px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              AUTH DIPERLUKAN
            </span>
          ) : (
            <span className="text-[9px] px-2 py-0.5 bg-rose-950 border border-rose-500 text-rose-400 font-bold">
              BELUM DIKONFIGURASI
            </span>
          )}
        </div>
      </div>

      {/* Main Telemetry & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="bg-[#070a14] border border-zinc-800 p-2.5">
          <span className="text-zinc-500 text-[10px] block uppercase font-bold">
            {isId ? 'TOKEN PRIBADI AKTIF' : 'ACTIVE PERSONAL TOKEN'}
          </span>
          <span className="text-violet-300 font-bold text-xs truncate block mt-0.5">
            {status?.maskedKey || 'MEMUAT...'}
          </span>
        </div>

        <div className="bg-[#070a14] border border-zinc-800 p-2.5">
          <span className="text-zinc-500 text-[10px] block uppercase font-bold">
            {isId ? 'LATENSI PING GARMIN' : 'GARMIN PING LATENCY'}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300 font-bold text-xs">
              {status?.latencyMs !== undefined ? `${status.latencyMs} ms` : '--'}
            </span>
            <span className="text-[9px] text-zinc-500">
              ({isId ? 'RESPON CEPAT' : 'FAST'})
            </span>
          </div>
        </div>

        <div className="bg-[#070a14] border border-zinc-800 p-2.5">
          <span className="text-zinc-500 text-[10px] block uppercase font-bold">
            {isId ? 'TERAKHIR SINKRON' : 'LAST SYNCED'}
          </span>
          <span className="text-emerald-400 font-bold text-xs block mt-0.5">
            {status?.lastSync ? new Date(status.lastSync).toLocaleString(isId ? 'id-ID' : 'en-US') : (isId ? 'Belum pernah' : 'Never')}
          </span>
        </div>

        <div className="bg-[#070a14] border border-zinc-800 p-2.5">
          <span className="text-zinc-500 text-[10px] block uppercase font-bold">
            {isId ? 'TOTAL AKTIVITAS TERSIMPAN' : 'RECORDED ACTIVITIES'}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Activity className="w-3 h-3 text-violet-400" />
            <span className="text-white font-black text-xs">
              {status?.totalActivities ?? '--'} {isId ? 'SESI LARI' : 'SESSIONS'}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {syncFeedback && (
        <div className="p-2.5 bg-violet-950/80 border border-violet-600 text-violet-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800 text-xs">
        <button
          type="button"
          onClick={checkStatus}
          disabled={isPinging}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Wifi className={`w-3.5 h-3.5 ${isPinging ? 'animate-pulse text-cyan-400' : 'text-zinc-400'}`} />
          <span>{isPinging ? (isId ? 'MENGUJI...' : 'PINGING...') : (isId ? 'UJI KONEKSI' : 'TEST PING')}</span>
        </button>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 border border-violet-400 text-white font-bold uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#7c3aed] cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-300' : ''}`} />
          <span>{isSyncing ? (isId ? 'MENYINKRONKAN...' : 'SYNCING...') : (isId ? 'SINKRONKAN SEKARANG' : 'SYNC NOW')}</span>
        </button>

        <Link
          href="/onboarding"
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-700/70 text-cyan-300 hover:text-cyan-200 font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isId ? 'ATUR API KEY' : 'MANAGE API KEY'}</span>
        </Link>
      </div>
    </div>
  );
}
