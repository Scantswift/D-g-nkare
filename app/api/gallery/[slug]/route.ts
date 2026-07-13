export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { data: gallery, error } = await supabase
      .from('galleries')
      .select(`
        *,
        photos (*)
      `)
      .eq('code', params.slug)
      .maybeSingle();

    if (error) {
      console.error('Gallery fetch error:', error);
      return NextResponse.json({ error: 'Galeri yüklenirken hata' }, { status: 500 });
    }

    if (!gallery) {
      return NextResponse.json({ error: 'Galeri bulunamadı' }, { status: 404 });
    }

    if (!gallery.is_active) {
      return NextResponse.json({ error: 'Bu galeri kapalı' }, { status: 403 });
    }

    const photos = (gallery.photos || []).map((photo: any) => ({
      id: photo.id,
      url: photo.file_url,
      fileName: photo.file_name || '',
      uploaderName: photo.uploader_name || '',
      createdAt: photo.created_at,
      contentType: photo.file_type,
      likes: photo.likes || 0,
    }));

    return NextResponse.json({
      id: gallery.id,
      coupleName: gallery.couple_name,
      weddingDate: gallery.wedding_date,
      code: gallery.code,
      packageType: gallery.package_type,
      expiresAt: gallery.expires_at,
      photos,
    });
  } catch (error: any) {
    console.error('Gallery error:', error);
    return NextResponse.json({ error: 'Galeri yüklenirken hata' }, { status: 500 });
  }
}
