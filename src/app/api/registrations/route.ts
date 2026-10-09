import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { TeamRegistration } from '@/types';
import { sendRegistrationReceivedEmail, sendReviewerAlertEmail } from '@/lib/mailer/mailer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const eventId = searchParams.get('eventId') || undefined;
    const ownerEmail = searchParams.get('ownerEmail') || undefined;
    const ownerUid = searchParams.get('ownerUid') || undefined;

    const list = await repository.getRegistrations({
      status,
      eventId,
      ownerEmail,
      ownerUid,
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error('Failed to get registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const siteUrl = req.nextUrl.origin;

    // Validate essential fields
    if (!body.eventId || !body.ownerEmail || !body.team?.name) {
      return NextResponse.json(
        { error: 'Event, owner email, and team name are required.' },
        { status: 400 }
      );
    }

    // Check duplicate team name or active registration for same user on same event
    const existingForEvent = await repository.getRegistrations({
      eventId: body.eventId,
    });

    const isDuplicateTeamName = existingForEvent.some(
      (r) =>
        r.team.name.trim().toLowerCase() === body.team.name.trim().toLowerCase() &&
        r.status !== 'REJECTED' &&
        r.status !== 'CANCELLED' &&
        r.id !== body.id
    );

    if (isDuplicateTeamName) {
      return NextResponse.json(
        { error: 'এই নামের একটি দল ইতিমধ্যেই নিবন্ধিত বা প্রক্রিয়াধীন রয়েছে। দয়া করে অন্য নাম ব্যবহার করুন।' },
        { status: 400 }
      );
    }

    const regId = body.id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const status = body.status === 'DRAFT' ? 'DRAFT' : 'PENDING_REVIEW';

    const newReg: TeamRegistration = {
      id: regId,
      seasonId: body.seasonId || 'ipl-2026',
      eventId: body.eventId,
      eventSlug: body.eventSlug || 'iswampur-premier-league-2026',
      ownerUid: body.ownerUid || 'anonymous',
      ownerEmail: body.ownerEmail,
      ownerDisplayName: body.ownerDisplayName,
      language: body.language || 'bn',
      termsAccepted: Boolean(body.termsAccepted),
      termsAcceptedAt: body.termsAcceptedAt || new Date().toISOString(),
      termsVersion: body.termsVersion || '2026.1',
      team: {
        name: body.team.name.trim(),
        address: body.team.address || '',
        representativeName: body.team.representativeName || '',
        email: body.team.email || body.ownerEmail,
        phone: body.team.phone || '',
        emergencyName: body.team.emergencyName,
        emergencyPhone: body.team.emergencyPhone || '',
        members: body.team.members || [],
      },
      customFieldValues: body.customFieldValues,
      payment: {
        amount: Number(body.payment?.amount) || 0,
        utr: body.payment?.utr || '',
        screenshotUrl: body.payment?.screenshotUrl || '',
        screenshotPublicId: body.payment?.screenshotPublicId,
        submittedAt: new Date().toISOString(),
      },
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          action: status === 'DRAFT' ? 'DRAFT_SAVED' : 'SUBMITTED',
          performedBy: body.ownerEmail,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const saved = await repository.saveRegistration(newReg);

    if (status === 'PENDING_REVIEW') {
      // 1. Dispatch confirmation email to team owner
      sendRegistrationReceivedEmail(saved, siteUrl).catch((err) =>
        console.error('Registration confirmation email failed:', err)
      );

      // 2. Dispatch reviewer email to admins assigned in site settings
      const settings = await repository.getSettings();
      if (settings.reviewerAdmins && settings.reviewerAdmins.length > 0) {
        sendReviewerAlertEmail(saved, settings.reviewerAdmins, siteUrl).catch((err) =>
          console.error('Reviewer alert email failed:', err)
        );
      }
    }

    await repository.logAction({
      actorEmail: body.ownerEmail,
      actorRole: 'team_user',
      action: status === 'DRAFT' ? 'REGISTRATION_DRAFT' : 'REGISTRATION_SUBMITTED',
      targetType: 'REGISTRATION',
      targetId: saved.id,
      metadata: { teamName: saved.team.name, status: saved.status },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Failed to submit registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
