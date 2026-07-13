export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID gerekli' }, { status: 400 });
    }

    const { error } = await supabase.rpc('increment_photo_like', {
      photo_uuid: photoId,
    });

    if (error) {
      console.error('Like error:', error);
      return NextResponse.json({ error: 'Beğeni işlemi başarısız' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
