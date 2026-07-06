/*
# Create galleries table for wedding photo sharing

1. New Tables
- `galleries`
  - `id` (uuid, primary key)
  - `code` (text, unique, not null) - rastgele 10 karakterlik galeri kodu
  - `couple_name` (text, not null) - çift ismi (örn: Ayşe & Mehmet)
  - `wedding_date` (date, not null) - düğün tarihi
  - `package_type` (text, not null) - Basic, Premium, Luks
  - `expires_at` (timestamptz, not null) - galerinin süresi (pakete göre)
  - `is_active` (boolean, default true) - galeri aktif mi
  - `created_at` (timestamptz, default now())
- `photos`
  - `id` (uuid, primary key)
  - `gallery_id` (uuid, foreign key)
  - `file_url` (text, not null)
  - `file_name` (text)
  - `file_type` (text)
  - `uploader_name` (text)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on all tables
- Allow anon + authenticated CRUD for galleries and photos (public guest upload)
*/

CREATE TABLE IF NOT EXISTS galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  couple_name text NOT NULL,
  wedding_date date NOT NULL,
  package_type text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text,
  file_type text,
  uploader_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_galleries" ON galleries;
CREATE POLICY "anon_select_galleries" ON galleries FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_galleries" ON galleries;
CREATE POLICY "anon_insert_galleries" ON galleries FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_galleries" ON galleries;
CREATE POLICY "anon_update_galleries" ON galleries FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_galleries" ON galleries;
CREATE POLICY "anon_delete_galleries" ON galleries FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_photos" ON photos;
CREATE POLICY "anon_select_photos" ON photos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_photos" ON photos;
CREATE POLICY "anon_insert_photos" ON photos FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_photos" ON photos;
CREATE POLICY "anon_delete_photos" ON photos FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_galleries_code ON galleries(code);
CREATE INDEX IF NOT EXISTS idx_photos_gallery_id ON photos(gallery_id);