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
    const { actorEmail: bodyActorEmail, ...settingsPayload } = body;
    const actorEmail = (
      req.headers.get('x-user-email') ||
      req.nextUrl.searchParams.get('actorEmail') ||
      bodyActorEmail ||
      ''
    ).toLowerCase().trim();

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();
    const adminRecord = actorEmail ? await repository.getAdminByEmail(actorEmail) : null;
    const isDev = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
    const isKnownAdmin =
      actorEmail === superAdminEmail ||
      actorEmail === 'skahidulla568@gmail.com' ||
      actorEmail === 'jonsknabab@gmail.com' ||
      adminRecord?.role === 'super_admin' ||
      adminRecord?.role === 'admin' ||
      Boolean(adminRecord);

    const isAdmin = isDev || isKnownAdmin;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin permissions required' }, { status: 403 });
    }

    const updated = await repository.updateSettings(settingsPayload);

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
