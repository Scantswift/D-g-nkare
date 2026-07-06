export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    const wedding = await prisma.wedding.findUnique({
      where: { id: params?.id },
      include: { photos: { orderBy: { createdAt: 'desc' } }, orders: { orderBy: { createdAt: 'desc' } }, _count: { select: { photos: true, orders: true } } },
    });
    if (!wedding) return NextResponse.json({ error: 'Düğün bulunamadı' }, { status: 404 });
    return NextResponse.json(wedding);
  } catch (error: any) {
    console.error('Get wedding error:', error);
    return NextResponse.json({ error: 'Düğün bilgileri alınırken hata' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    const body = await req.json();
    const wedding = await prisma.wedding.update({
      where: { id: params?.id },
      data: { ...(body ?? {}) },
    });
    return NextResponse.json(wedding);
  } catch (error: any) {
    console.error('Update wedding error:', error);
    return NextResponse.json({ error: 'Düğün güncellenirken hata' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    const role = (session.user as any).role;
    if (role !== 'ADMIN') {
      const wedding = await prisma.wedding.findUnique({ where: { id: params?.id } });
      if (wedding?.userId !== (session.user as any).id) {
        return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
      }
    }
    await prisma.wedding.delete({ where: { id: params?.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete wedding error:', error);
    return NextResponse.json({ error: 'Düğün silinirken hata' }, { status: 500 });
  }
}
