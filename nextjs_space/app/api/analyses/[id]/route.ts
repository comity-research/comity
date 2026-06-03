export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const analysis = await prisma.analysis.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const analysis = await prisma.analysis.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await prisma.analysis.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 });
  }
}
