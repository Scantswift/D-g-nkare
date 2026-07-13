/*
# Fix SECURITY DEFINER exposure on increment_photo_like

## Problem
The `increment_photo_like` function was `SECURITY DEFINER`, meaning it ran with the
owner's privileges and bypassed RLS. Both `anon` and `authenticated` roles had EXECUTE
permission, creating a security-flagged escalation path.

## Fix
1. Switch function to `SECURITY INVOKER` — it now runs as the calling user, respecting RLS.
2. Add a restricted UPDATE RLS policy on `photos` that only allows updates to rows
   belonging to an active gallery.
3. Revoke broad UPDATE privilege, then grant column-level UPDATE only on `likes`
   so callers cannot modify any other column (file_url, file_name, gallery_id, etc.).
4. The function body only does `likes = likes + 1` — no arbitrary value can be set.

## Tables Modified
- `public.photos` — new UPDATE policy, column-level grants adjusted
- `public.increment_photo_like` — changed to SECURITY INVOKER
*/

-- 1. Switch function to SECURITY INVOKER
CREATE OR REPLACE FUNCTION increment_photo_like(photo_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE photos SET likes = likes + 1 WHERE id = photo_uuid;
END;
$$;

-- 2. Add restricted UPDATE policy on photos (only for active-gallery rows)
DROP POLICY IF EXISTS "anon_update_photo_likes" ON photos;
CREATE POLICY "anon_update_photo_likes" ON photos FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = photos.gallery_id
      AND galleries.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = photos.gallery_id
      AND galleries.is_active = true
    )
  );

-- 3. Revoke broad UPDATE, grant column-level UPDATE only on `likes`
REVOKE UPDATE ON photos FROM anon, authenticated;
GRANT UPDATE (likes) ON photos TO anon, authenticated;

-- 4. Keep EXECUTE on the function (it's now INVOKER, so it's safe)
GRANT EXECUTE ON FUNCTION increment_photo_like(uuid) TO anon, authenticated;
