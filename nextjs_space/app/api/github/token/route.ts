export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { githubToken: true } });
    return NextResponse.json({ hasToken: !!(user?.githubToken), tokenPreview: user?.githubToken ? `${user.githubToken.slice(0, 8)}...` : null });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { token } = body ?? {};
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    // Validate token
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${token}` },
    });
    if (!res.ok) return NextResponse.json({ error: 'Invalid GitHub token' }, { status: 400 });

    await prisma.user.update({ where: { id: session.user.id }, data: { githubToken: token } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await prisma.user.update({ where: { id: session.user.id }, data: { githubToken: null } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete token' }, { status: 500 });
  }
}
