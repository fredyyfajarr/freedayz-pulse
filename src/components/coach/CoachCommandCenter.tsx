'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  Calendar, 
  ExternalLink, 
  UserCheck, 
  UserPlus, 
  Copy, 
  Check, 
  ChevronDown, 
  SlidersHorizontal,
  Flame,
  Activity,
  Award
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AthleteRosterMember {
  id: string;
  name: string;
  email: string;
  status: 'optimal' | 'fresh' | 'peaking' | 'danger' | 'fatigued';
  statusLabel: string;
  weeklyDistanceKm: number;
  monthlyDistanceKm: number;
  avgPace: string;
  acwr: number;
  acwrLabel: string;
  lastSessionDate: string;
  lastSessionName: string;
  lastSessionDistKm: number;
  vo2max?: number;
  weeklyTargetKm: number;
}

interface Props {
  coachName: string;
  coachEmail: string;
  athletes: AthleteRosterMember[];
  selectedAthleteId: string;
  onSelectAthlete: (id: string) => void;
  isInspectingTelemetry: boolean;
  onToggleInspect: (inspect: boolean) => void;
}

export default function CoachCommandCenter({
  coachName,
  coachEmail,
  athletes,
  selectedAthleteId,
  onSelectAthlete,
  isInspectingTelemetry,
  onToggleInspect,
}: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [copiedCode, setCopiedCode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId) || athletes[0];
  const totalClubDistance = athletes.reduce((acc, a) => acc + a.monthlyDistanceKm, 0);

  const clubInviteCode = 'FRDZ-CLUB-2026';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(clubInviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setShowInviteModal(false);
      setInviteEmail('');
    }, 1500);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Coach Master Command Header */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-[#0d1224] to-[#070a14] border-2 border-cyan-500/80 p-5 shadow-[4px_4px_0px_#06b6d4] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 bg-cyan-950 border border-cyan-400 text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {isId ? 'PUSAT_KENDALI_PELATIH // ROLE_COACH' : 'COACH_COMMAND_CENTER // HEAD_COACH'}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-violet-950 border border-violet-600 text-violet-300 font-bold uppercase tracking-wider">
                FREEDAYZZ RUNNING CLUB
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black italic tracking-wide uppercase mt-2 text-white">
              {isId ? `PORTAL MONITORING: ${coachName.toUpperCase()}` : `COACHING LAB: ${coachName.toUpperCase()}`}
            </h1>
            <p className="text-xs text-zinc-300 font-sans mt-0.5">
              {isId 
                ? 'Pengawasan telemetri kardiovaskular, kepatuhan zona HR, dan pencegahan cedera atlet binaan Anda.'
                : 'Oversight of athlete biometrics, training load balance, and injury risk mitigation.'}
            </p>
          </div>

          {/* Quick Club Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-300 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#0891b2] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isId ? 'UNDANG ATLET' : 'INVITE ATHLETE'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Salin kode klub untuk atlet"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? (isId ? 'TERSALIN!' : 'COPIED!') : clubInviteCode}</span>
            </button>
          </div>
        </div>

        {/* 2. Club Aggregate KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-[#070a14] border border-cyan-900/60 p-3">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              {isId ? 'TOTAL ATLET BINAAN' : 'MONITORED ATHLETES'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-cyan-400">{athletes.length}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">{isId ? 'Pelari Aktif' : 'Active'}</span>
            </div>
          </div>

          <div className="bg-[#070a14] border border-cyan-900/60 p-3">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              {isId ? 'VOLUME KOLEKTIF BULANAN' : 'CLUB MONTHLY VOLUME'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{totalClubDistance.toFixed(1)}</span>
              <span className="text-[10px] text-cyan-400 font-bold">KM</span>
            </div>
          </div>

          <div className="bg-[#070a14] border border-cyan-900/60 p-3">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              {isId ? 'RADAR RISIKO CEDERA (ACWR)' : 'INJURY RADAR (ACWR)'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-400">0</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">{isId ? 'Zona Bahaya' : 'In Danger'}</span>
            </div>
            <span className="text-[9px] text-zinc-500 block mt-0.5">
              {isId ? 'Semua atlet di Sweet Spot' : 'All athletes in Sweet Spot'}
            </span>
          </div>

          <div className="bg-[#070a14] border border-cyan-900/60 p-3">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              {isId ? 'STATUS KEPELATIHAN' : 'COACHING STATUS'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-black text-emerald-400 uppercase">
                {isId ? 'AKTIF BERJALAN' : 'ACTIVE & READY'}
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 block mt-0.5 truncate">
              {coachEmail}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Athlete Roster Selector & Oversight Switcher */}
      <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm sm:text-base font-black italic tracking-wide text-slate-900 dark:text-white uppercase">
              {isId ? 'DAFTAR ATLET BINAAN // ROSTER KLUB' : 'ATHLETE ROSTER // CLUB MEMBERS'}
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
            {isId ? 'KLIK ATLET UNTUK MEMBUKA TELEMETRI LARI LENGKAP' : 'CLICK ATHLETE TO INSPECT TELEMETRY'}
          </span>
        </div>

        {/* Athlete Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
          {athletes.map((a) => {
            const isSelected = a.id === selectedAthleteId;
            return (
              <div
                key={a.id}
                onClick={() => onSelectAthlete(a.id)}
                className={`p-4 border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-cyan-50/50 dark:bg-cyan-950/30 border-cyan-500 shadow-[3px_3px_0px_#06b6d4]'
                    : 'bg-slate-50 dark:bg-[#070a14] border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-cyan-600 text-white text-[9px] font-black uppercase tracking-wider">
                    {isId ? 'SEDANG DIPANTAU' : 'INSPECTING'}
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                    {a.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {a.name}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-400 font-bold shrink-0">
                        {a.statusLabel}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block truncate font-sans">
                      {a.email}
                    </span>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800 text-[10px]">
                      <div>
                        <span className="text-slate-500 dark:text-zinc-500 block uppercase font-bold">
                          {isId ? 'BULAN INI' : 'MONTH DIST'}
                        </span>
                        <strong className="text-slate-900 dark:text-white text-xs">
                          {a.monthlyDistanceKm.toFixed(1)} km
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-zinc-500 block uppercase font-bold">
                          {isId ? 'RATA2 PACE' : 'AVG PACE'}
                        </span>
                        <strong className="text-cyan-600 dark:text-cyan-400 text-xs">
                          {a.avgPace}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-zinc-500 block uppercase font-bold">
                          {isId ? 'RADAR ACWR' : 'ACWR'}
                        </span>
                        <strong className="text-emerald-600 dark:text-emerald-400 text-xs">
                          {a.acwr.toFixed(2)} ({a.acwrLabel})
                        </strong>
                      </div>
                    </div>

                    {/* Last Run Info */}
                    <div className="mt-2.5 text-[10px] text-slate-600 dark:text-zinc-400 flex items-center justify-between">
                      <span className="truncate">
                        🏃 {a.lastSessionName} ({a.lastSessionDistKm.toFixed(1)} km)
                      </span>
                      <span className="text-slate-400 dark:text-zinc-500 shrink-0 ml-1">
                        {a.lastSessionDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Oversight Mode Banner */}
        <div className="p-3 bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-400 dark:border-cyan-800 text-cyan-950 dark:text-cyan-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>
              {isId 
                ? `Dashboard di bawah menampilkan kalender latihan & telemetri atlet binaan: `
                : `The dashboard below reflects training telemetry for athlete: `}
              <strong className="text-slate-900 dark:text-white underline">
                {selectedAthlete.name} ({selectedAthlete.email})
              </strong>
            </span>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-600 text-white uppercase shrink-0">
            {isId ? 'MODE INSPEKSI AKTIF' : 'INSPECTION ACTIVE'}
          </span>
        </div>
      </div>

      {/* Invite Athlete Modal */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowInviteModal(false)}
        >
          <div 
            className="bg-[#0b0f1d] border-2 border-cyan-500 shadow-[6px_6px_0px_#06b6d4] max-w-md w-full p-5 sm:p-6 space-y-4 font-mono text-white relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black tracking-wider uppercase text-white">
                  {isId ? 'UNDANG ATLET KE KLUB' : 'INVITE ATHLETE TO CLUB'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {isId 
                ? 'Bagikan kode klub kepada pelari Anda, atau kirimkan email undangan langsung agar atlet terdaftar di bawah bimbingan Anda.'
                : 'Share the club code with your runners, or enter their email to invite them to your coaching roster.'}
            </p>

            <div className="bg-[#070a14] border border-cyan-900 p-3 space-y-1">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                {isId ? 'KODE KLUB FREEDAYZZ' : 'FREEDAYZZ CLUB CODE'}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-cyan-300 tracking-wider">
                  {clubInviteCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-1 bg-cyan-600 text-white text-[10px] font-bold uppercase hover:bg-cyan-500"
                >
                  {copiedCode ? (isId ? 'TERSALIN' : 'COPIED') : (isId ? 'SALIN' : 'COPY')}
                </button>
              </div>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] text-zinc-400 block uppercase font-bold mb-1">
                  {isId ? 'EMAIL ATLET' : 'ATHLETE EMAIL'}
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="e.g. runner@example.com"
                  className="w-full bg-[#070a14] border border-zinc-700 p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {inviteSent && (
                <div className="p-2 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isId ? 'Undangan berhasil dikirim!' : 'Invite sent successfully!'}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase border border-zinc-700"
                >
                  {isId ? 'BATAL' : 'CANCEL'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase border border-cyan-300 shadow-[2px_2px_0px_#0891b2]"
                >
                  {isId ? 'KIRIM UNDANGAN' : 'SEND INVITATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
