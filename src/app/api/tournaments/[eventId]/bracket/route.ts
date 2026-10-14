import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const bracket = await repository.getTournamentBracket(eventId);

    // Fetch passes and registrations for this event to provide ready-to-draw teams
    const allPasses = await repository.getAllPasses();
    const eventPasses = allPasses.filter(
      (p) => p.eventId === eventId || p.eventId === `event-${eventId}`
    );

    const allRegistrations = await repository.getRegistrations();
    const approvedRegs = allRegistrations.filter(
      (r) =>
        (r.eventId === eventId || r.eventSlug === eventId || r.eventId === `event-${eventId}`) &&
        r.status === 'APPROVED'
    );

    // Compile list of eligible teams (with scanned check-in status)
    const teamsMap = new Map<string, {
      id: string;
      name: string;
      representativeName: string;
      phone: string;
      isCheckedIn: boolean;
      passId?: string;
      humanPassCode?: string;
    }>();

    // From Passes
    eventPasses.forEach((pass) => {
      if (!pass || !pass.teamName) return;
      const key = pass.teamName.toLowerCase().trim();
      teamsMap.set(key, {
        id: pass.registrationId || pass.passId,
        name: pass.teamName,
        representativeName: pass.representativeName || '',
        phone: '',
        isCheckedIn: pass.status === 'CHECKED_IN',
        passId: pass.passId,
        humanPassCode: pass.humanPassCode,
      });
    });

    // From Approved Registrations
    approvedRegs.forEach((reg) => {
      const name = reg?.team?.name;
      if (!name) return;
      const key = name.toLowerCase().trim();
      const existing = teamsMap.get(key);
      if (existing) {
        existing.phone = reg.team?.phone || existing.phone;
        existing.representativeName = reg.team?.representativeName || existing.representativeName;
      } else {
        teamsMap.set(key, {
          id: reg.id,
          name: name,
          representativeName: reg.team?.representativeName || '',
          phone: reg.team?.phone || '',
          isCheckedIn: false,
          passId: reg.passId,
          humanPassCode: reg.humanPassCode,
        });
      }
    });

    const eligibleTeams = Array.from(teamsMap.values());

    return NextResponse.json({
      bracket,
      eligibleTeams,
    });
  } catch (error: any) {
    console.error('Failed to get tournament bracket:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await req.json();

    if (!body || !body.rounds) {
      return NextResponse.json({ error: 'Invalid bracket data' }, { status: 400 });
    }

    const savedBracket = await repository.saveTournamentBracket({
      ...body,
      eventId,
    });

    return NextResponse.json(savedBracket);
  } catch (error) {
    console.error('Failed to save tournament bracket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const bracket = await repository.getTournamentBracket(eventId);
    if (!bracket) {
      return NextResponse.json({ error: 'Bracket not found' }, { status: 404 });
    }
    const body = await req.json();
    if (body.showOnPublicPages !== undefined) {
      bracket.showOnPublicPages = Boolean(body.showOnPublicPages);
    }
    if (body.standings) {
      bracket.standings = { ...bracket.standings, ...body.standings };
    }
    const saved = await repository.saveTournamentBracket(bracket);
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Failed to patch tournament bracket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(req.url);
    const actorEmail = (req.headers.get('x-user-email') || searchParams.get('actorEmail') || '').toLowerCase();
    const actorRole = req.headers.get('x-user-role') || searchParams.get('actorRole') || '';

    const isSuperAdmin =
      actorEmail === 'skahidulla568@gmail.com' ||
      actorRole === 'super_admin';

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'শুধুমাত্র সুপার অ্যাডমিন (skahidulla568@gmail.com) টুর্নামেন্ট ড্র রিসেট করতে পারবেন।' },
        { status: 403 }
      );
    }

    await repository.deleteTournamentBracket(eventId);
    return NextResponse.json({ success: true, message: 'Tournament bracket reset successfully' });
  } catch (error) {
    console.error('Failed to delete tournament bracket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
