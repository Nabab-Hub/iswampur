import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import {
  generateSecurePassId,
  computePassSignature,
  generatePassPdf,
} from '@/lib/pass/generator';
import {
  sendApprovalEmail,
  sendReviewStatusUpdateEmail,
} from '@/lib/mailer/mailer';
import { TeamPass } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const siteUrl = req.nextUrl.origin;
    const { action, reason, actorEmail } = body;

    const reviewerEmail = actorEmail || req.headers.get('x-user-email') || 'reviewer@iswampur.org';

    const reg = await repository.getRegistrationById(id);
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      // 1. Generate cryptographic pass ID and human code
      const { passId, humanPassCode } = generateSecurePassId();

      const event = await repository.getEventBySlug(reg.eventId);
      const eventTitle = event?.title || {
        bn: 'ইস্বামপুর প্রিমিয়ার লীগ ২০২৬',
        en: 'Iswampur Premier League 2026',
      };
      const venue = event?.venue || {
        bn: 'ইস্বামপুর কেন্দ্রীয় খেলার মাঠ',
        en: 'Iswampur Central Sports Ground',
      };

      // 2. Compute HMAC-SHA256 digital signature
      const signature = computePassSignature({
        passId,
        registrationId: reg.id,
        teamName: reg.team.name,
        eventId: reg.eventId,
      });

      const newPass: TeamPass = {
        passId,
        humanPassCode,
        registrationId: reg.id,
        eventId: reg.eventId,
        eventTitle,
        teamName: reg.team.name,
        representativeName: reg.team.representativeName,
        memberCount: reg.team.members.length,
        issuedAt: new Date().toISOString(),
        status: 'ACTIVE',
        venue,
        eventDate: event?.startDate || '২০-২৫ ডিসেম্বর, ২০২৬',
        signature,
      };

      // 3. Save pass
      await repository.savePass(newPass);

      // 4. Update registration record
      reg.status = 'APPROVED';
      reg.passId = passId;
      reg.humanPassCode = humanPassCode;
      reg.reviewedBy = reviewerEmail;
      reg.reviewedAt = new Date().toISOString();
      reg.reviewNote = reason || 'Payment verified and squad approved.';
      reg.history = [
        ...(reg.history || []),
        {
          action: 'APPROVED',
          performedBy: reviewerEmail,
          timestamp: new Date().toISOString(),
          note: reg.reviewNote,
        },
      ];
      await repository.saveRegistration(reg);

      // 5. Generate PDF pass
      const pdfBytes = await generatePassPdf(newPass, { siteUrl });

      // 6. Send approval email with attached PDF
      sendApprovalEmail(reg, newPass, pdfBytes, siteUrl).catch((err) =>
        console.error('Failed to dispatch approval email:', err)
      );

      // 7. Log audit trail
      await repository.logAction({
        actorEmail: reviewerEmail,
        actorRole: 'admin',
        action: 'REGISTRATION_APPROVED',
        targetType: 'REGISTRATION',
        targetId: reg.id,
        metadata: { passId, humanPassCode, teamName: reg.team.name },
      });

      return NextResponse.json({
        success: true,
        status: 'APPROVED',
        passId,
        humanPassCode,
      });
    } else if (action === 'REJECT' || action === 'CORRECTION_REQUIRED') {
      const newStatus = action === 'REJECT' ? 'REJECTED' : 'CORRECTION_REQUIRED';
      reg.status = newStatus;
      reg.reviewedBy = reviewerEmail;
      reg.reviewedAt = new Date().toISOString();
      reg.reviewNote = reason || '';
      reg.history = [
        ...(reg.history || []),
        {
          action: newStatus,
          performedBy: reviewerEmail,
          timestamp: new Date().toISOString(),
          note: reason,
        },
      ];
      await repository.saveRegistration(reg);

      // Send rejection or correction required email
      sendReviewStatusUpdateEmail(reg, newStatus, reason, siteUrl).catch((err) =>
        console.error('Failed to dispatch status email:', err)
      );

      await repository.logAction({
        actorEmail: reviewerEmail,
        actorRole: 'admin',
        action: `REGISTRATION_${newStatus}`,
        targetType: 'REGISTRATION',
        targetId: reg.id,
        metadata: { reason },
      });

      return NextResponse.json({ success: true, status: newStatus });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Review registration failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
