/*
# Fix RLS Security Policies for galleries, photos, and storage

## Summary
This migration closes critical security vulnerabilities in the RLS policies:
1. galleries table: Removes anon INSERT/UPDATE/DELETE (was "always true"), keeps SELECT for anon (needed for gallery access by code).
2. photos table: Removes anon DELETE, restricts UPDATE to a SECURITY DEFINER function for likes only, validates INSERT against existing gallery.
3. gallery-photos storage bucket: Removes broad SELECT (list) policy, keeps INSERT for uploads, restricts file access to direct URL only.
4. Creates a `increment_photo_like` function (SECURITY DEFINER) so anon users can like photos without needing a general UPDATE policy.

## Tables Modified
- `public.galleries` — RLS policies tightened
- `public.photos` — RLS policies tightened, new column `likes`
- `storage.objects` — bucket policies tightened for `gallery-photos`

## Security Changes
- galleries: anon can only SELECT (read). No INSERT/UPDATE/DELETE via anon key.
- photos: anon can SELECT and INSERT (with gallery validation). No DELETE or direct UPDATE via anon key.
- photos: A `increment_photo_like()` RPC function allows like increments only.
- storage: anon can upload to gallery-photos bucket but cannot list bucket contents. File access via direct URL only (no enumeration).

## Important Notes
1. Admin operations (create/update/delete galleries, delete photos) must use the service role key, which bypasses RLS entirely.
2. The `increment_photo_like` function is SECURITY DEFINER so it runs with the function owner's privileges, allowing it to update the `likes` column without a general UPDATE policy.
3. The photos INSERT policy validates that the `gallery_id` references an existing, active gallery row.
*/

-- ============================================================
-- 1. GALLERIES TABLE — Remove anon INSERT/UPDATE/DELETE
-- ============================================================

-- Drop the insecure "always true" policies
DROP POLICY IF EXISTS "anon_delete_galleries" ON galleries;
DROP POLICY IF EXISTS "anon_insert_galleries" ON galleries;
DROP POLICY IF EXISTS "anon_update_galleries" ON galleries;

-- Keep SELECT for anon (guests need to view galleries by code)
-- The existing anon_select_galleries policy is fine but let's make it explicit
DROP POLICY IF EXISTS "anon_select_galleries" ON galleries;
CREATE POLICY "anon_select_galleries" ON galleries FOR SELECT
  TO anon, authenticated USING (true);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated.
-- All write operations must go through the service role key (admin API routes).

-- ============================================================
-- 2. PHOTOS TABLE — Remove anon DELETE, restrict UPDATE, validate INSERT
-- ============================================================

-- Add likes column (default 0)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS likes integer NOT NULL DEFAULT 0;

-- Drop the insecure DELETE policy
DROP POLICY IF EXISTS "anon_delete_photos" ON photos;

-- Drop and recreate SELECT (keep it open so gallery viewers can see photos)
DROP POLICY IF EXISTS "anon_select_photos" ON photos;
CREATE POLICY "anon_select_photos" ON photos FOR SELECT
  TO anon, authenticated USING (true);

-- Drop and recreate INSERT with gallery validation
DROP POLICY IF EXISTS "anon_insert_photos" ON photos;
CREATE POLICY "anon_insert_photos" ON photos FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    gallery_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = photos.gallery_id
      AND galleries.is_active = true
    )
  );

-- No UPDATE policy for anon/authenticated.
-- Like increments are handled by the SECURITY DEFINER function below.

-- Create the like increment function (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION increment_photo_like(photo_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE photos SET likes = likes + 1 WHERE id = photo_uuid;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION increment_photo_like(uuid) TO anon, authenticated;

-- ============================================================
-- 3. STORAGE BUCKET — Remove broad SELECT (list) policy
-- ============================================================

-- Drop the broad SELECT policy that allows listing all files
DROP POLICY IF EXISTS "Public gallery photo view" ON storage.objects;

-- Keep INSERT (upload) policy for anon
DROP POLICY IF EXISTS "Public gallery photo upload" ON storage.objects;
CREATE POLICY "Public gallery photo upload" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'gallery-photos');

-- Remove the DELETE policy (only service role should delete storage objects)
DROP POLICY IF EXISTS "Public gallery photo delete" ON storage.objects;

-- Note: Without a SELECT policy on storage.objects, files cannot be listed.
-- However, files can still be accessed via their public URL (Supabase serves
-- public bucket files via CDN without going through RLS). The gallery-photos
-- bucket should be set to public bucket type so files are accessible via
-- direct URLs without needing a SELECT policy.
