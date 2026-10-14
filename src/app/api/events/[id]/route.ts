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
    const actorEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
    const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();

    // STRICT PERMISSION CHECK: Only Superadmin skahidulla568@gmail.com has event delete permission!
    if (actorEmail !== SUPER_ADMIN_EMAIL && actorEmail !== 'skahidulla568@gmail.com') {
      return NextResponse.json(
        {
          error:
            'অনুমতি নেই: শুধুমাত্র সুপারঅ্যাডমিন (skahidulla568@gmail.com) অনুষ্ঠান মুছে ফেলতে পারেন। (Forbidden: Only Super Admin skahidulla568@gmail.com is authorized to delete events)',
        },
        { status: 403 }
      );
    }

    await repository.deleteEvent(id);

    await repository.logAction({
      actorEmail,
      actorRole: 'super_admin',
      action: 'EVENT_AND_RELATED_DATA_DELETED',
      targetType: 'EVENT',
      targetId: id,
      metadata: { deletedBy: actorEmail, cascadedCollections: ['registrations', 'passes', 'posts'] },
    });

    return NextResponse.json({
      success: true,
      message: 'Event and all related registrations, passes, and posts deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
