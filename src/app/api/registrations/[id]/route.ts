import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reg = await repository.getRegistrationById(id);
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    return NextResponse.json(reg);
  } catch (error) {
    console.error('Failed to get registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await repository.getRegistrationById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const updated = await repository.saveRegistration({
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
