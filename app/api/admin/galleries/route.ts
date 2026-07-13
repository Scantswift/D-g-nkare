export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

async function isAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const adminAuth = cookieStore.get('adminAuth');
  return adminAuth?.value === 'true';
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('galleries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching galleries:', error);
      return NextResponse.json({ error: 'Galeriler alınamadı' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const body = await req.json();
    const { code, couple_name, wedding_date, package_type, expires_at } = body;

    if (!code || !couple_name || !wedding_date || !package_type || !expires_at) {
      return NextResponse.json({ error: 'Tüm alanlar zorunlu' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existing } = await supabaseAdmin
      .from('galleries')
      .select('code')
      .eq('code', code)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Bu kod zaten kullanılıyor' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('galleries')
      .insert({
        code,
        couple_name,
        wedding_date,
        package_type,
        expires_at,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery:', error);
      return NextResponse.json({ error: 'Galeri oluşturulamadı' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
