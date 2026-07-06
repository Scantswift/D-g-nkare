export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

async function isAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const adminAuth = cookieStore.get('adminAuth');
  return adminAuth?.value === 'true';
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const { error } = await supabase
      .from('galleries')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting gallery:', error);
      return NextResponse.json({ error: 'Galeri silinemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
