import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const posts = await repository.getPosts();
    const post = posts.find((p) => p.id === id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const currentLikes = post.likesCount || 0;
    const body = await req.json().catch(() => ({}));
    const increment = body.liked === false ? -1 : 1;
    const newLikes = Math.max(0, currentLikes + increment);

    const updated = await repository.savePost({
      ...post,
      likesCount: newLikes,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, likesCount: newLikes });
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
