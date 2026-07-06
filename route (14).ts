export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    
    const photos = await prisma.photo.findMany({
      where: { weddingId: params?.id },
      orderBy: { createdAt: 'desc' },
    });
    
    const photosWithUrls = await Promise.all(
      (photos ?? []).map(async (photo: any) => {
        const url = await getFileUrl(photo.cloudStoragePath, photo.contentType, photo.isPublic);
        return { ...photo, url };
      })
    );
    
    return NextResponse.json(photosWithUrls);
  } catch (error: any) {
    console.error('Get photos error:', error);
    return NextResponse.json({ error: 'Fotoğraflar yüklenirken hata' }, { status: 500 });
  }
}
