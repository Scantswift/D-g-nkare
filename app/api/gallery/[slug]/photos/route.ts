export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function moderateImage(fileUrl: string, fileType: string): Promise<{ approved: boolean; reason?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  // Skip if no credentials configured
  if (!apiUser || !apiSecret) {
    console.warn('[moderation] Sightengine credentials not set — skipping');
    return { approved: true };
  }

  // Skip video moderation
  if (fileType?.startsWith('video/')) {
    return { approved: true, reason: 'video_skipped' };
  }

  try {
    const params = new URLSearchParams({
      url: fileUrl,
      models: 'nudity-2.1,offensive',
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const res = await fetch(`https://api.sightengine.com/1.0/check.json?${params.toString()}`);
    if (!res.ok) {
      console.error('[moderation] Sightengine API error:', res.status);
      return { approved: true, reason: 'api_error' };
    }

    const data = await res.json();

    const nudityScore: number =
      data?.nudity?.sexual_activity ??
      data?.nudity?.sexual_display ??
      data?.nudity?.erotica ??
      0;
    const offensiveScore: number = data?.offensive?.prob ?? 0;

    const THRESHOLD = 0.5;
    if (nudityScore > THRESHOLD) return { approved: false, reason: 'nudity' };
    if (offensiveScore > THRESHOLD) return { approved: false, reason: 'offensive' };

    return { approved: true };
  } catch (err) {
    console.error('[moderation] Exception:', err);
    return { approved: true, reason: 'exception' };
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { fileUrl, fileName, fileType, uploaderName, audioUrl, isAudio } = body ?? {};

    if (!fileUrl || !fileName) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    // Content moderation for images (before saving)
    if (!isAudio) {
      const modResult = await moderateImage(fileUrl, fileType || '');
      if (!modResult.approved) {
        const msg =
          modResult.reason === 'nudity'
            ? 'Bu fotoğraf uygunsuz içerik barındırdığı için eklenemedi.'
            : 'Bu fotoğraf topluluk kurallarına aykırı içerik barındırdığı için eklenemedi.';
        return NextResponse.json({ error: msg, blocked: true }, { status: 422 });
      }
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
        audio_url: audioUrl || null,
        is_audio: isAudio || false,
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
