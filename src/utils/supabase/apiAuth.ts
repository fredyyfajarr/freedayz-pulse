import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export type ApiAuthResult =
  | { user: User; response?: never }
  | { user?: never; response: NextResponse };

/**
 * Verifies that an incoming API route request has a valid authenticated Supabase session
 * or an active Demo Mode session (pulse_demo_mode=1).
 * Returns { user } on success, or { response } with HTTP 401 Unauthorized on failure.
 */
export async function requireAuthenticatedUser(): Promise<ApiAuthResult> {
  try {
    const cookieStore = await cookies();
    const isDemoCookie = cookieStore.get('pulse_demo_mode')?.value === '1';

    if (isDemoCookie) {
      const demoUser: User = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@freedayzz.pulse',
        app_metadata: {},
        user_metadata: {
          full_name: 'Demo Athlete',
          role: 'athlete',
          garmin_demo_mode: true,
          garmin_connected: true,
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      return { user: demoUser };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        response: NextResponse.json(
          { error: 'Unauthorized. Silakan login terlebih dahulu.' },
          { status: 401 }
        ),
      };
    }

    return { user };
  } catch {
    return {
      response: NextResponse.json(
        { error: 'Unauthorized. Gagal memverifikasi sesi.' },
        { status: 401 }
      ),
    };
  }
}
