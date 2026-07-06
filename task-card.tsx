export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
    const [totalWeddings, totalPhotos, pendingOrders, totalOrders, allOrders] = await Promise.all([
      prisma.wedding.count(),
      prisma.photo.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count(),
      prisma.order.findMany({ select: { totalAmount: true } }),
    ]);
    const totalRevenue = (allOrders ?? []).reduce((sum: number, o: any) => sum + (o?.totalAmount ?? 0), 0);
    return NextResponse.json({ totalWeddings, totalPhotos, pendingOrders, totalOrders, totalRevenue });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
