import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { PostAnnouncement } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const posts = await repository.getPosts(publishedOnly);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to get posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorEmail = req.headers.get('x-user-email') || 'admin';

    const newPost: PostAnnouncement = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: body.title,
      content: body.content,
      coverImage: body.coverImage,
      images: body.images || (body.coverImage ? [body.coverImage] : []),
      category: body.category || 'notice',
      published: body.published !== undefined ? Boolean(body.published) : true,
      featured: Boolean(body.featured),
      publishAt: body.publishAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorEmail: actorEmail,
    };

    const saved = await repository.savePost(newPost);
    await repository.logAction({
      actorEmail,
      actorRole: 'admin',
      action: 'POST_CREATED',
      targetType: 'POST',
      targetId: saved.id,
      metadata: { title: saved.title },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
