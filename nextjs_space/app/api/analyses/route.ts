export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const repoFullName = searchParams.get('repo') ?? undefined;

    const where: any = { userId: session.user.id };
    if (repoFullName) where.repoFullName = repoFullName;

    const analyses = await prisma.analysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      select: {
        id: true,
        repoOwner: true,
        repoName: true,
        repoFullName: true,
        status: true,
        hhiScore: true,
        hhiRisk: true,
        cga: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(analyses);
  } catch (error: any) {
    console.error('Fetch analyses error:', error);
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
  }
}
