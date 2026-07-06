export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { cloudStoragePath, fileName, contentType, uploaderName, isPublic } = body ?? {};
    if (!cloudStoragePath || !fileName || !contentType) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }
    const wedding = await prisma.wedding.findUnique({ where: { slug: params?.slug } });
    if (!wedding) return NextResponse.json({ error: 'Düğün bulunamadı' }, { status: 404 });
    if (!wedding.isActive) return NextResponse.json({ error: 'Bu düğün galerisi kapalı' }, { status: 403 });

    const photo = await prisma.photo.create({
      data: {
        cloudStoragePath,
        fileName,
        contentType,
        isPublic: isPublic ?? true,
        uploaderName: uploaderName ?? '',
        weddingId: wedding.id,
      },
    });
    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    console.error('Upload record error:', error);
    return NextResponse.json({ error: 'Fotoğraf kaydı oluşturulurken hata' }, { status: 500 });
  }
}
