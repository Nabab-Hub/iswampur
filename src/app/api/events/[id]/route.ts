import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await repository.getEventBySlug(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to get event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorEmail = req.headers.get('x-user-email') || 'admin';

    const existing = await repository.getEventBySlug(id);
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updated = await repository.saveEvent({
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    });

    await repository.logAction({
      actorEmail,
      actorRole: 'admin',
      action: 'EVENT_UPDATED',
      targetType: 'EVENT',
      targetId: existing.id,
      metadata: { title: updated.title },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actorEmail = req.headers.get('x-user-email') || 'admin';
    await repository.deleteEvent(id);

    await repository.logAction({
      actorEmail,
      actorRole: 'admin',
      action: 'EVENT_DELETED',
      targetType: 'EVENT',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
