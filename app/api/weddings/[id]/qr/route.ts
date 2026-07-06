export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    const wedding = await prisma.wedding.findUnique({ where: { id: params?.id } });
    if (!wedding) return NextResponse.json({ error: 'Düğün bulunamadı' }, { status: 404 });
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const weddingUrl = `${baseUrl}/dugun/${wedding.slug}`;
    const qrDataUrl = await QRCode.toDataURL(weddingUrl, {
      width: 800,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    });
    return NextResponse.json({ qrDataUrl, weddingUrl });
  } catch (error: any) {
    console.error('QR code error:', error);
    return NextResponse.json({ error: 'QR kod oluşturulurken hata' }, { status: 500 });
  }
}
