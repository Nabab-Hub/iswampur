import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorEmail = req.headers.get('x-user-email') || 'admin';

    const posts = await repository.getPosts();
    const existing = posts.find((p) => p.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updated = await repository.savePost({
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    });

    await repository.logAction({
      actorEmail,
      actorRole: 'admin',
      action: 'POST_UPDATED',
      targetType: 'POST',
      targetId: id,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actorEmail = req.headers.get('x-user-email') || 'admin';
    await repository.deletePost(id);

    await repository.logAction({
      actorEmail,
      actorRole: 'admin',
      action: 'POST_DELETED',
      targetType: 'POST',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
