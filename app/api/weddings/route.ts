export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const where = role === 'ADMIN' ? {} : { userId };
    const weddings = await prisma.wedding.findMany({
      where,
      include: { _count: { select: { photos: true, orders: true } }, user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(weddings);
  } catch (error: any) {
    console.error('Get weddings error:', error);
    return NextResponse.json({ error: 'Düğünler alınırken hata' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    const userId = (session.user as any).id;
    const body = await req.json();
    const { groomName, brideName, weddingDate, venue, packageType } = body ?? {};
    if (!groomName || !brideName || !weddingDate) {
      return NextResponse.json({ error: 'Damat adı, gelin adı ve tarih zorunlu' }, { status: 400 });
    }
    let slug = generateSlug(groomName, brideName, new Date(weddingDate));
    const existingSlug = await prisma.wedding.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const wedding = await prisma.wedding.create({
      data: { groomName, brideName, weddingDate: new Date(weddingDate), venue: venue ?? '', slug, packageType: packageType ?? 'basic', userId },
    });
    return NextResponse.json(wedding, { status: 201 });
  } catch (error: any) {
    console.error('Create wedding error:', error);
    return NextResponse.json({ error: 'Düğün oluşturulurken hata' }, { status: 500 });
  }
}
