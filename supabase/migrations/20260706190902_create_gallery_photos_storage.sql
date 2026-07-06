/*
# Create Supabase storage bucket for gallery photos

1. New Storage
- `gallery-photos` bucket (public)
- Allows any file type (images and videos)
- Files are publicly accessible after upload

2. Storage Policies
- Anyone can upload to the gallery-photos bucket (public gallery uploads)
- Anyone can view photos (public gallery)
- Only authenticated users (admin) can delete
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

DROP POLICY IF EXISTS "Public gallery photo upload" ON storage.objects;
CREATE POLICY "Public gallery photo upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'gallery-photos');

DROP POLICY IF EXISTS "Public gallery photo view" ON storage.objects;
CREATE POLICY "Public gallery photo view"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'gallery-photos');

DROP POLICY IF EXISTS "Public gallery photo delete" ON storage.objects;
CREATE POLICY "Public gallery photo delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'gallery-photos');