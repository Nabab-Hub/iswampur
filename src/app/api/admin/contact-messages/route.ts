import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { sendContactReplyEmail } from '@/lib/mailer/mailer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const actorEmail = (
      req.headers.get('x-user-email') ||
      req.nextUrl.searchParams.get('actorEmail') ||
      ''
    ).toLowerCase().trim();

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();
    const adminRecord = await repository.getAdminByEmail(actorEmail);
    const isAdmin = actorEmail === superAdminEmail || adminRecord?.role === 'admin' || adminRecord?.role === 'super_admin';

    // Allow fetching messages if admin, or in local development
    if (process.env.NODE_ENV === 'production' && !isAdmin && actorEmail) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const messages = await repository.getContactMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Failed to get contact messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Reply to a contact message and dispatch email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, replyText, adminEmail, adminName } = body;

    if (!id || !replyText || !replyText.trim()) {
      return NextResponse.json(
        { error: 'Message ID and reply text are required' },
        { status: 400 }
      );
    }

    const messages = await repository.getContactMessages();
    const targetMsg = messages.find((m) => m.id === id);

    if (!targetMsg) {
      return NextResponse.json({ error: 'Contact message not found' }, { status: 404 });
    }

    // Send email to the contact sender
    let emailSent = false;
    try {
      emailSent = await sendContactReplyEmail({
        to: targetMsg.email,
        recipientName: targetMsg.name || 'Valued Visitor',
        originalMessage: targetMsg.message,
        replyMessage: replyText.trim(),
        adminName: adminName || 'Iswampur Village Committee Administrator',
      });
    } catch (mailErr) {
      console.error('Failed to send contact reply email:', mailErr);
    }

    // Update message state in database
    const updated = await repository.updateContactMessage(id, {
      status: 'replied',
      replyText: replyText.trim(),
      repliedAt: new Date().toISOString(),
      repliedBy: adminEmail || adminName || 'Admin',
    });

    return NextResponse.json({
      success: true,
      message: updated,
      emailSent,
    });
  } catch (error: any) {
    console.error('Failed to process contact reply:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update message status (e.g. mark read/unread)
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    const updated = await repository.updateContactMessage(id, { status });
    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error('Failed to patch contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a message
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await repository.deleteContactMessage(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Failed to delete contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
