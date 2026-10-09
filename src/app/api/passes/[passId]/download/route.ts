import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { generatePassPdf } from '@/lib/pass/generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ passId: string }> }
) {
  try {
    const { passId } = await params;
    const pass = await repository.getPass(passId);

    if (!pass) {
      return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
    }

    const siteUrl = req.nextUrl.origin;
    const pdfBytes = await generatePassPdf(pass, { siteUrl });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Iswampur_Pass_${pass.humanPassCode}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Download pass error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
