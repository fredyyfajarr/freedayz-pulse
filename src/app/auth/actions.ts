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
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error:
          'Email belum dikonfirmasi. Silakan klik link konfirmasi di inbox email Anda, atau matikan "Confirm email" di Supabase Dashboard (Authentication -> Sign In / Providers -> Email).',
      };
    }
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      return { error: 'Email atau kata sandi tidak cocok. Silakan periksa kembali.' };
    }
    return { error: error.message };
  }

  // Check if athlete already connected their Garmin API key
  let targetUrl = '/dashboard';

  if (data?.user) {
    const meta = data.user.user_metadata;
    const hasMetaConnection = meta?.garmin_connected === true || !!meta?.garmin_api_key;

    if (!hasMetaConnection) {
      try {
        const { data: connection } = await supabase
          .from('user_garmin_connections')
          .select('id, is_active, garmin_api_key')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!connection || (!connection.garmin_api_key && !connection.is_active)) {
          // Only prompt for onboarding if completely new user without any connection record
          targetUrl = '/onboarding';
        }
      } catch {
        // If table doesn't exist or query fails, let the user into dashboard smoothly
        targetUrl = '/dashboard';
      }
    }
  }

  if (next && next.startsWith('/') && next !== '/login' && next !== '/onboarding') {
    targetUrl = next;
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

  // If email confirmation is required in Supabase, data.session is null and data.user is created
  const needsEmailConfirmation = !data?.session;

  return {
    success: true,
    email: email,
    needsEmailConfirmation,
    message: needsEmailConfirmation
      ? `Tautan konfirmasi telah dikirim ke ${email}. Silakan buka email Anda untuk mengaktifkan akun.`
      : 'Registrasi akun berhasil! Silakan masukkan kata sandi untuk masuk.',
  };
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get('email') as string)?.trim();

  if (!email) {
    return { error: 'Alamat email wajib diisi.' };
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: `Tautan verifikasi baru berhasil dikirim ke ${email}. Periksa kotak masuk dan folder spam.`,
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

  // 1. Always save in Supabase Auth user_metadata (guaranteed to persist with user identity)
  await supabase.auth.updateUser({
    data: {
      garmin_api_key: garminApiKey,
      garmin_connected: true,
      hr_zone_method: hrZoneMethod,
      weekly_target_km: weeklyTargetKm,
      garmin_connected_at: new Date().toISOString(),
    },
  });

  // 2. Also save to user_garmin_connections and athlete_biometrics tables
  try {
    await supabase.from('user_garmin_connections').upsert({
      user_id: user.id,
      garmin_api_key: garminApiKey,
      is_active: true,
      sync_status: garminApiKey ? 'CONFIGURED' : 'DEMO_MODE',
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    await supabase.from('athlete_biometrics').upsert({
      user_id: user.id,
      hr_zone_method: hrZoneMethod,
      auto_sync_rhr: true,
      weekly_target_km: weeklyTargetKm,
    }, { onConflict: 'user_id' });
  } catch (err: any) {
    console.warn('Optional table upsert notice:', err);
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
