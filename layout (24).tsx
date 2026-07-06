export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const wedding = await prisma.wedding.findUnique({
      where: { slug: params?.slug },
      include: { photos: { orderBy: { createdAt: 'desc' } } },
    });
    if (!wedding) return NextResponse.json({ error: 'Düğün bulunamadı' }, { status: 404 });
    
    // Increment view count
    await prisma.wedding.update({ where: { id: wedding.id }, data: { viewCount: { increment: 1 } } });
    
    const photosWithUrls = await Promise.all(
      (wedding.photos ?? []).map(async (photo: any) => {
        const url = await getFileUrl(photo.cloudStoragePath, photo.contentType, photo.isPublic);
        return { ...photo, url };
      })
    );
    
    return NextResponse.json({
      id: wedding.id,
      groomName: wedding.groomName,
      brideName: wedding.brideName,
      weddingDate: wedding.weddingDate,
      venue: wedding.venue,
      slug: wedding.slug,
      viewCount: wedding.viewCount,
      photos: photosWithUrls,
    });
  } catch (error: any) {
    console.error('Gallery error:', error);
    return NextResponse.json({ error: 'Galeri yüklenirken hata' }, { status: 500 });
  }
}
