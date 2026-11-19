'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';

export default function DynamicDocumentTitle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [userRole, setUserRole] = useState<'athlete' | 'coach' | 'admin'>('athlete');

  useEffect(() => {
    async function fetchRole() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role) {
          setUserRole(user.user_metadata.role);
        }
      } catch {}
    }
    fetchRole();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const role = session?.user?.user_metadata?.role;
      if (role) setUserRole(role);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const isCoach = userRole === 'coach';
    let title = '';

    if (pathname === '/dashboard') {
      if (isCoach) {
        if (currentTab === 'roster') {
          title = isId ? 'Roster Skuad & Penugasan' : 'Squad Roster & Tasks';
        } else if (currentTab === 'plans') {
          title = isId ? 'Program & Menu Latihan Skuad' : 'Squad Training Plans';
        } else if (currentTab === 'acwr') {
          title = isId ? 'Matriks Risiko Cedera (ACWR)' : 'Injury Risk Radar (ACWR)';
        } else if (currentTab === 'directives') {
          title = isId ? 'Papan Arahan Pelatih' : 'Coach Directives Hub';
        } else {
          title = isId ? 'Portal Pelatih & Komando Skuad' : 'Coach Portal & Squad Hub';
        }
      } else {
        title = isId ? 'Dashboard Telemetri Lari' : 'Running Telemetry Dashboard';
      }
    } else if (pathname.startsWith('/activities/compare')) {
      title = isId ? 'Komparasi Telemetri Lari' : 'Telemetry Comparison';
    } else if (pathname.startsWith('/activities/') && pathname !== '/activities') {
      title = isId ? 'Detail Analisis Lari' : 'Run Telemetry Details';
    } else if (pathname.startsWith('/activities')) {
      title = isCoach
        ? (isId ? 'Aktivitas Skuad Atlet' : 'Squad Activities Feed')
        : (isId ? 'Log & Riwayat Aktivitas Lari' : 'Running Activity Log');
    } else if (pathname.startsWith('/fitness')) {
      title = isCoach
        ? (isId ? 'Kebugaran Tim (PMC Skuad)' : 'Squad Fitness & Freshness')
        : (isId ? 'Kebugaran & Kesegaran (PMC)' : 'Fitness & Freshness (PMC)');
    } else if (pathname.startsWith('/recovery')) {
      title = isCoach
        ? (isId ? 'Pemulihan & Biometrik Skuad' : 'Squad Recovery & HRV')
        : (isId ? 'Pemulihan & HRV Garmin' : 'Garmin Recovery & HRV');
    } else if (pathname.startsWith('/records')) {
      title = isCoach
        ? (isId ? 'Papan Rekor Skuad' : 'Squad Records & Leaderboard')
        : (isId ? 'Rekor Pribadi & Best Efforts' : 'Personal Records & Best Efforts');
    } else if (pathname.startsWith('/settings')) {
      title = isCoach
        ? (isId ? 'Pengaturan Klub & Pelatih' : 'Club & Coach Settings')
        : (isId ? 'Pengaturan Akun & Kalibrasi' : 'Account & Calibration Settings');
    } else if (pathname === '/login') {
      title = isId ? 'Masuk Akun' : 'Sign In';
    } else if (pathname === '/register') {
      title = isId ? 'Pendaftaran Akun Baru' : 'Create Account';
    } else if (pathname === '/onboarding') {
      title = isId ? 'Koneksi Garmin Personal API' : 'Connect Garmin Personal API';
    } else if (pathname === '/') {
      title = isId ? 'Freedayzz Pulse // Telemetri Lari Lanjutan' : 'Freedayzz Pulse // Advanced Running Telemetry';
    } else {
      title = isId ? 'Freedayzz Pulse' : 'Freedayzz Pulse';
    }

    document.title = `${title} | Freedayzz Pulse`;
  }, [pathname, currentTab, language, userRole, isId]);

  return null;
}
