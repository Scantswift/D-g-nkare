export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body ?? {};
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Ad, email ve mesaj zorunlu' }, { status: 400 });
    }
    const msg = await prisma.contactMessage.create({
      data: { name, email, subject: subject ?? 'Genel', message },
    });
    return NextResponse.json({ success: true, id: msg.id }, { status: 201 });
  } catch (error: any) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: 'Mesaj gönderilirken hata' }, { status: 500 });
  }
}
