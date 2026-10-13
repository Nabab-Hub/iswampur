import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { generateNoticePdf } from '@/lib/notice/generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const posts = await repository.getPosts();
    const notice = posts.find((p) => p.id === id);

    if (!notice) {
      return NextResponse.json({ error: 'Post or Notice not found' }, { status: 404 });
    }

    const pdfBytes = await generateNoticePdf(notice);
    const filename = `Notice-${notice.memoNo ? notice.memoNo.replace(/[^a-zA-Z0-9_-]/g, '_') : notice.id}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error generating notice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate notice PDF: ' + error.message },
      { status: 500 }
    );
  }
}
