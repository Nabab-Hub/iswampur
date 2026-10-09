import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { VillageEvent } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const events = await repository.getEvents(publishedOnly);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to get events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorEmail = req.headers.get('x-user-email') || 'admin';

    const newEvent: VillageEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: body.slug || `event-${Date.now()}`,
      title: body.title,
      shortDescription: body.shortDescription,
      fullDescription: body.fullDescription,
      category: body.category || 'sports',
      startDate: body.startDate,
      endDate: body.endDate,
      startTime: body.startTime,
      endTime: body.endTime,
      venue: body.venue,
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
      gallery: body.gallery || [],
      featured: Boolean(body.featured),
      showInHero: Boolean(body.showInHero),
      published: body.published !== undefined ? Boolean(body.published) : true,
      registrationEnabled: Boolean(body.registrationEnabled),
      registrationDeadline: body.registrationDeadline,
      registrationFee: Number(body.registrationFee) || 0,
      minPlayers: Number(body.minPlayers) || 11,
      maxPlayers: Number(body.maxPlayers) || 15,
      maxTeams: Number(body.maxTeams) || 16,
      rules: body.rules,
      rulesVersion: body.rulesVersion || '1.0',
      customFields: body.customFields || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorEmail,
    };

    const saved = await repository.saveEvent(newEvent);
    await repository.logAction({
      actorEmail,
      actorRole: 'admin',
      action: 'EVENT_CREATED',
      targetType: 'EVENT',
      targetId: saved.id,
      metadata: { title: saved.title },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
