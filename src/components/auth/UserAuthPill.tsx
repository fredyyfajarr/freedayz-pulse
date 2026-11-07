'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { signout } from '@/app/auth/actions';
import { User, LogOut, LogIn, ShieldCheck, ChevronRight } from 'lucide-react';

interface Props {
  isCompact?: boolean;
}

export default function UserAuthPill({ isCompact = false }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        setUser(authUser);
        if (authUser) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          setProfile(data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-9 bg-slate-100 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 animate-pulse" />
    );
  }

  // Not Logged In State -> Prompt to Sign In
  if (!user) {
    if (isCompact) {
      return (
        <Link
          href="/login"
          title={isId ? 'Masuk Akun' : 'Sign In'}
          className="w-10 h-10 mx-auto flex items-center justify-center bg-violet-600 text-white border border-violet-400 shadow-sm hover:bg-violet-500 transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
        </Link>
      );
    }

    return (
      <Link
        href="/login"
        className="flex items-center justify-between p-2.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-300 dark:border-violet-700/60 hover:border-violet-500 text-violet-900 dark:text-violet-200 text-xs font-mono font-bold transition-all group shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <LogIn className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform" />
          <span>{isId ? 'MASUK / DAFTAR' : 'SIGN IN / REGISTER'}</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
      </Link>
    );
  }

  // Logged In State -> Display Profile & Role
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Athlete';
  const role = profile?.role || 'athlete';
  const roleBadge =
    role === 'coach'
      ? (isId ? 'PELATIH // COACH' : 'COACH')
      : role === 'admin'
      ? 'ADMIN'
      : (isId ? 'ATLET // ATHLETE' : 'ATHLETE');

  if (isCompact) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div
          title={`${displayName} (${roleBadge})`}
          className="w-9 h-9 flex items-center justify-center bg-violet-600 text-white font-mono font-black text-xs border border-violet-400 shadow-sm"
        >
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <form action={signout}>
          <button
            type="submit"
            title={isId ? 'Keluar' : 'Logout'}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-violet-900/60 shadow-sm font-mono space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 shrink-0 flex items-center justify-center bg-violet-600 text-white font-black text-xs border border-violet-400 shadow-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-black text-slate-900 dark:text-white truncate">
              {displayName}
            </span>
            <span className="block text-[9px] text-slate-500 dark:text-zinc-400 truncate">
              {user.email}
            </span>
          </div>
        </div>

        <form action={signout}>
          <button
            type="submit"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-300 transition-colors cursor-pointer"
            title={isId ? 'Keluar dari akun' : 'Sign out'}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-zinc-800 text-[9px]">
        <span className="text-slate-500 dark:text-zinc-500 font-bold uppercase">
          ROLE
        </span>
        <span
          className={`px-1.5 py-0.2 font-black border uppercase ${
            role === 'coach'
              ? 'bg-cyan-100 dark:bg-cyan-950 border-cyan-400 text-cyan-800 dark:text-cyan-300'
              : role === 'admin'
              ? 'bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-800 dark:text-rose-300'
              : 'bg-violet-100 dark:bg-violet-950 border-violet-400 text-violet-800 dark:text-violet-300'
          }`}
        >
          {roleBadge}
        </span>
      </div>
    </div>
  );
}
