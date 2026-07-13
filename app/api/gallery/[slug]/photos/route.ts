export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { fileUrl, fileName, fileType, uploaderName } = body ?? {};

    if (!fileUrl || !fileName) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id, is_active')
      .eq('code', params.slug)
      .maybeSingle();

    if (galleryError || !gallery) {
      return NextResponse.json({ error: 'Galeri bulunamadı' }, { status: 404 });
    }

    if (!gallery.is_active) {
      return NextResponse.json({ error: 'Bu düğün galerisi kapalı' }, { status: 403 });
    }

    const { data: photo, error: insertError } = await supabase
      .from('photos')
      .insert({
        gallery_id: gallery.id,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        uploader_name: uploaderName || '',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Photo insert error:', insertError);
      return NextResponse.json({ error: 'Fotoğraf kaydı oluşturulurken hata' }, { status: 500 });
    }

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    console.error('Upload record error:', error);
    return NextResponse.json({ error: 'Fotoğraf kaydı oluşturulurken hata' }, { status: 500 });
  }
}
