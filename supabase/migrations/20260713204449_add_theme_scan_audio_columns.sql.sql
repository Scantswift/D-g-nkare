/*
# Add theme, scan_count, audio support

## Summary
1. galleries tablosuna `theme` (renk teması seçimi) ve `scan_count` (QR tarama sayacı) eklendi.
2. photos tablosuna `audio_url` (ses notu URL'si) ve `is_audio` (ses mi fotoğraf mı) eklendi.

## Tables Modified
- `galleries`:
  - `theme` text default 'classic-cream' — galeri renk teması
  - `scan_count` int default 0 — QR/link kaç kez açıldı
- `photos`:
  - `audio_url` text nullable — ses notu dosya URL'si
  - `is_audio` boolean default false — bu satır ses notu mu?
*/

ALTER TABLE galleries
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'classic-cream',
  ADD COLUMN IF NOT EXISTS scan_count integer NOT NULL DEFAULT 0;

ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS is_audio boolean NOT NULL DEFAULT false;

-- RLS: Allow anon to increment scan_count (column-level)
DROP POLICY IF EXISTS "anon_update_gallery_scan" ON galleries;
CREATE POLICY "anon_update_gallery_scan" ON galleries FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

REVOKE UPDATE ON galleries FROM anon, authenticated;
GRANT UPDATE (scan_count) ON galleries TO anon, authenticated;

-- Function to safely increment scan count
CREATE OR REPLACE FUNCTION increment_gallery_scan(gallery_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE galleries SET scan_count = scan_count + 1 WHERE code = gallery_code AND is_active = true;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_gallery_scan(text) TO anon, authenticated;
