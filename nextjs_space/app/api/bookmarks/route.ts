export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookmarks);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { repoOwner, repoName, category, notes } = body ?? {};
    if (!repoOwner || !repoName) {
      return NextResponse.json({ error: 'repoOwner and repoName required' }, { status: 400 });
    }

    // Toggle - if exists, delete; if not, create
    const existing = await prisma.bookmark.findUnique({
      where: { userId_repoOwner_repoName: { userId: session.user.id, repoOwner, repoName } },
    });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: 'removed' });
    }
    const bookmark = await prisma.bookmark.create({
      data: { userId: session.user.id, repoOwner, repoName, category: category ?? null, notes: notes ?? null },
    });
    return NextResponse.json({ action: 'added', bookmark }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}
