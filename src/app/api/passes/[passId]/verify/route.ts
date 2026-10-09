import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { verifyPassSignature } from '@/lib/pass/generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ passId: string }> }
) {
  try {
    const { passId } = await params;
    const pass = await repository.getPass(passId);

    if (!pass) {
      return NextResponse.json(
        { verified: false, error: 'Pass not found or invalid' },
        { status: 404 }
      );
    }

    // Verify cryptographic digital signature
    const isTamperFree = verifyPassSignature(pass);

    return NextResponse.json({
      verified: true,
      isValid: isTamperFree && pass.status === 'ACTIVE',
      status: pass.status,
      humanPassCode: pass.humanPassCode,
      teamName: pass.teamName,
      eventTitle: pass.eventTitle,
      venue: pass.venue,
      eventDate: pass.eventDate,
      issuedAt: pass.issuedAt,
      memberCount: pass.memberCount,
      checkedInAt: pass.checkedInAt,
      isTamperFree,
    });
  } catch (error) {
    console.error('Verify pass error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
