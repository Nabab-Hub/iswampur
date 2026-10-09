import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const saved = await repository.saveContactMessage({
      name,
      email,
      phone,
      message,
    });

    return NextResponse.json({ success: true, id: saved.id });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
