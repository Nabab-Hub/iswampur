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

    // Check if super admin
    if (normalizedEmail === superAdminEmail) {
      return NextResponse.json({
        role: 'super_admin',
        permissions: [
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
        ],
        eventScope: [],
      });
    }

    // Check if listed in admins collection
    const adminRecord = await repository.getAdminByEmail(normalizedEmail);
    if (adminRecord && adminRecord.active) {
      return NextResponse.json({
        role: adminRecord.role,
        permissions: adminRecord.permissions || [],
        eventScope: adminRecord.eventScope || [],
      });
    }

    // Default authenticated team owner / public user
    return NextResponse.json({
      role: 'team_user',
      permissions: [],
      eventScope: [],
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
