import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET() {
  try {
    const settings = await repository.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const actorEmail = req.headers.get('x-user-email') || 'admin';

    const updated = await repository.updateSettings(body);

    await repository.logAction({
      actorEmail,
      actorRole: 'admin',
      action: 'SITE_SETTINGS_UPDATED',
      targetType: 'SETTINGS',
      targetId: 'site',
      metadata: { reviewerAdmins: updated.reviewerAdmins },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
