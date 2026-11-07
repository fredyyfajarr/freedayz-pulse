'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const next = (formData.get('next') as string) || '';

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if athlete already connected their Garmin API key
  let targetUrl = '/onboarding';
  if (data?.user) {
    try {
      const { data: connection } = await supabase
        .from('user_garmin_connections')
        .select('id, is_active, garmin_api_key')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (connection && (connection.garmin_api_key || connection.is_active)) {
        targetUrl = next && next.startsWith('/') && next !== '/login' ? next : '/dashboard';
      }
    } catch {
      targetUrl = '/onboarding';
    }
  }

  revalidatePath('/', 'layout');
  redirect(targetUrl);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const fullName = (formData.get('fullName') as string)?.trim() || email.split('@')[0];
  const role = (formData.get('role') as string) || 'athlete';

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi' };
  }

  if (password.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    email: email,
    message: 'Registrasi akun berhasil! Silakan masukkan kata sandi untuk masuk.',
  };
}

export async function saveGarminConnection(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesi kedaluwarsa, silakan masuk kembali.' };
  }

  const garminApiKey = (formData.get('garminApiKey') as string)?.trim() || '';
  const hrZoneMethod = (formData.get('hrZoneMethod') as string) || 'HRR';
  const weeklyTargetKm = parseFloat((formData.get('weeklyTargetKm') as string) || '30');

  try {
    // 1. Save or update Garmin connection record
    await supabase.from('user_garmin_connections').upsert({
      user_id: user.id,
      garmin_api_key: garminApiKey,
      is_active: true,
      sync_status: garminApiKey ? 'CONFIGURED' : 'DEMO_MODE',
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 2. Update athlete biometrics preferences
    await supabase.from('athlete_biometrics').upsert({
      user_id: user.id,
      hr_zone_method: hrZoneMethod,
      auto_sync_rhr: true,
      weekly_target_km: weeklyTargetKm,
    }, { onConflict: 'user_id' });
  } catch (err: any) {
    console.error('Error saving garmin connection:', err);
    // Even if db tables haven't been migrated yet, allow user to proceed
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
