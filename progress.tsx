export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
    const body = await req.json();
    const order = await prisma.order.update({
      where: { id: params?.id },
      data: { status: body?.status, notes: body?.notes },
    });
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Sipariş güncellenirken hata' }, { status: 500 });
  }
}
