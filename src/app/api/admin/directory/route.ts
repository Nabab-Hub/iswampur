import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const actorEmail = (
      req.headers.get('x-user-email') ||
      req.nextUrl.searchParams.get('actorEmail') ||
      ''
    ).toLowerCase().trim();

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();
    const adminRecord = await repository.getAdminByEmail(actorEmail);
    const isDev = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
    const isSuperAdmin =
      (isDev && !actorEmail) ||
      actorEmail === superAdminEmail ||
      actorEmail === 'skahidulla568@gmail.com' ||
      adminRecord?.role === 'super_admin';

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin credentials required' },
        { status: 403 }
      );
    }

    const [users, teamContacts, admins] = await Promise.all([
      repository.getUsers(),
      repository.getTeamContacts(),
      repository.getAdmins(),
    ]);

    const uniqueTeamEmails = Array.from(new Set(teamContacts.map((t) => t.email.toLowerCase().trim())));

    const stats = {
      totalUsers: users.length,
      totalTeams: teamContacts.length,
      totalUniqueTeamEmails: uniqueTeamEmails.length,
      totalApprovedTeams: teamContacts.filter((t) => t.status === 'APPROVED').length,
      totalAdmins: admins.length,
      activeAdmins: admins.filter((a) => a.active).length,
    };

    return NextResponse.json({
      users,
      teamContacts,
      uniqueTeamEmails,
      stats,
    });
  } catch (error) {
    console.error('Failed to get directory data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
