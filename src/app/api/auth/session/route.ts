import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const { email, uid, displayName, photoURL } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();

    let role: 'super_admin' | 'admin' | 'team_user' = 'team_user';
    let permissions: any[] = [];
    let eventScope: string[] = [];

    // Check if super admin
    if (normalizedEmail === superAdminEmail) {
      role = 'super_admin';
      permissions = [
        'events.manage',
        'gallery.manage',
        'notices.manage',
        'content.manage',
        'registrations.view',
        'registrations.review',
        'registrations.export',
        'payments.verify',
        'passes.manage',
        'matchday.checkin',
        'admins.manage',
        'ipl.manage',
        'settings.manage',
      ];
    } else {
      // Check if listed in admins collection
      const adminRecord = await repository.getAdminByEmail(normalizedEmail);
      if (adminRecord && adminRecord.active) {
        role = adminRecord.role;
        permissions = adminRecord.permissions || [];
        eventScope = adminRecord.eventScope || [];
      }
    }

    // Automatically record and track every logged-in user in directory
    await repository.recordUserLogin({
      uid: uid || `uid_${Date.now()}`,
      email: normalizedEmail,
      displayName: displayName || normalizedEmail.split('@')[0],
      photoURL: photoURL || undefined,
      role,
    });

    return NextResponse.json({
      role,
      permissions,
      eventScope,
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
