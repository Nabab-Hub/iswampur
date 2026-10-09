import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const actorEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();
    if (actorEmail !== superAdminEmail) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin credentials required' }, { status: 403 });
    }

    const logs = await repository.getAuditLogs(150);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
