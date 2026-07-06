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
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Messages error:', error);
    return NextResponse.json({ error: 'Mesajlar yüklenirken hata' }, { status: 500 });
  }
}
