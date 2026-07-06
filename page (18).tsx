export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    (settings ?? []).forEach((s: any) => { settingsMap[s.key] = s.value; });
    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Ayarlar yüklenirken hata' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
    const body = await req.json();
    const entries = Object.entries(body ?? {});
    for (const [key, value] of entries) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Ayarlar güncellenirken hata' }, { status: 500 });
  }
}
