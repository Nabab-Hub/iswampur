import { NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET() {
  try {
    const logs = await repository.getAuditLogs(150);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
