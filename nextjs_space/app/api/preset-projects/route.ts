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
    const category = searchParams.get('category') ?? undefined;

    const where: any = {};
    if (category && category !== 'all') where.category = category;

    const projects = await prisma.presetProject.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { id, owner, repo, name, description, category } = body ?? {};
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const existing = await prisma.presetProject.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Only allow edit if user added it, or user is admin
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (existing.addedByUserId !== session.user.id && user?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to edit this project' }, { status: 403 });
    }
    const updated = await prisma.presetProject.update({
      where: { id },
      data: { ...(name && { name }), ...(description !== undefined && { description }), ...(category && { category }), ...(owner && { owner }), ...(repo && { repo }) },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const existing = await prisma.presetProject.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (existing.addedByUserId !== session.user.id && user?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to delete this project' }, { status: 403 });
    }
    await prisma.presetProject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { owner, repo, name, description, category } = body ?? {};
    if (!owner || !repo || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await prisma.presetProject.upsert({
      where: { owner_repo: { owner, repo } },
      update: { name, description, category },
      create: {
        owner,
        repo,
        name,
        description: description ?? null,
        category,
        isUserAdded: true,
        addedByUserId: session.user.id,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
