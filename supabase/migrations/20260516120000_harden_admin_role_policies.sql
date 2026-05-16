CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = pg_catalog;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.is_seed_admin_email();
DROP POLICY IF EXISTS "seed admin can repair own role" ON public.user_roles;

DROP POLICY IF EXISTS "admins manage profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins update profile" ON public.profile_settings;
DROP POLICY IF EXISTS "admins read profile" ON public.profile_settings;
DROP POLICY IF EXISTS "admins read profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins insert profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins update profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins delete profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "anyone can read profile" ON public.profile_settings;

CREATE POLICY "authenticated admins read profile settings"
  ON public.profile_settings
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins insert profile settings"
  ON public.profile_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins update profile settings"
  ON public.profile_settings
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins delete profile settings"
  ON public.profile_settings
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins insert public profile" ON public.profile_public;
DROP POLICY IF EXISTS "admins update public profile" ON public.profile_public;
DROP POLICY IF EXISTS "admins delete public profile" ON public.profile_public;

CREATE POLICY "authenticated admins insert public profile"
  ON public.profile_public
  FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins update public profile"
  ON public.profile_public
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins delete public profile"
  ON public.profile_public
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins manage certs" ON public.certifications;
DROP POLICY IF EXISTS "admins manage experiences" ON public.experiences;
DROP POLICY IF EXISTS "admins manage edu" ON public.education;
DROP POLICY IF EXISTS "admins manage vol" ON public.volunteers;
DROP POLICY IF EXISTS "admins manage projects" ON public.projects;
DROP POLICY IF EXISTS "admins manage skills" ON public.skills;
DROP POLICY IF EXISTS "admins manage gallery" ON public.gallery;

CREATE POLICY "authenticated admins manage certs"
  ON public.certifications
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage experiences"
  ON public.experiences
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage edu"
  ON public.education
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage vol"
  ON public.volunteers
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage skills"
  ON public.skills
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage gallery"
  ON public.gallery
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins upload" ON storage.objects;
DROP POLICY IF EXISTS "admins update files" ON storage.objects;
DROP POLICY IF EXISTS "admins delete files" ON storage.objects;

CREATE POLICY "authenticated admins upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "authenticated admins update files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "authenticated admins delete files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

NOTIFY pgrst, 'reload schema';
