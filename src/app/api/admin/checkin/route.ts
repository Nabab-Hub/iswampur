import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { verifyPassSignature } from '@/lib/pass/generator';

export async function POST(req: NextRequest) {
  try {
    const { passCode, actorEmail } = await req.json();
    if (!passCode) {
      return NextResponse.json({ error: 'Pass code or ID required' }, { status: 400 });
    }

    const pass = await repository.getPass(passCode);
    if (!pass) {
      return NextResponse.json(
        { success: false, error: 'কোনো বৈধ পাস পাওয়া যায়নি (Pass not found)' },
        { status: 404 }
      );
    }

    const isValidSig = verifyPassSignature(pass);
    if (!isValidSig) {
      return NextResponse.json(
        { success: false, error: 'পাসটির ডিজিটাল সিগনেচার সঠিক নয়! এটি নকল বা বিকৃত।' },
        { status: 400 }
      );
    }

    if (pass.status === 'REVOKED') {
      return NextResponse.json(
        { success: false, error: 'এই পাসটি কর্তৃপক্ষ কর্তৃক বাতিল করা হয়েছে (Pass Revoked)' },
        { status: 400 }
      );
    }

    if (pass.status === 'CHECKED_IN') {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: `এই দল ইতিপূর্বেই মাঠে উপস্থিত হিসেবে নথিভুক্ত হয়েছে (${new Date(
          pass.checkedInAt || ''
        ).toLocaleTimeString()})`,
        pass,
      });
    }

    // Mark as checked in
    pass.status = 'CHECKED_IN';
    pass.checkedInAt = new Date().toISOString();
    pass.checkedInBy = actorEmail || 'matchday_officer';
    await repository.savePass(pass);

    await repository.logAction({
      actorEmail: actorEmail || 'matchday_officer',
      actorRole: 'admin',
      action: 'MATCHDAY_CHECKIN',
      targetType: 'PASS',
      targetId: pass.passId,
      metadata: { teamName: pass.teamName, humanPassCode: pass.humanPassCode },
    });

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      message: `সফলভাবে চেক-ইন সম্পন্ন! দলের নাম: ${pass.teamName}`,
      pass,
    });
  } catch (error) {
    console.error('Checkin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const passes = await repository.getAllPasses();
    const pending = passes.filter((p) => p.status === 'ACTIVE');
    const entered = passes.filter((p) => p.status === 'CHECKED_IN');
    return NextResponse.json({ pending, entered, total: passes.length });
  } catch (error) {
    console.error('Checkin GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch passes' }, { status: 500 });
  }
}

