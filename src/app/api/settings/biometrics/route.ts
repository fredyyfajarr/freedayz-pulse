import { NextResponse } from 'next/server';
import { AthleteSettingsManager } from '@/infrastructure/persistence/AthleteSettingsManager';

export async function GET() {
  const settings = AthleteSettingsManager.getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = AthleteSettingsManager.updateSettings({
      maxHr: Number(body.maxHr),
      restingHr: Number(body.restingHr),
    });
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
