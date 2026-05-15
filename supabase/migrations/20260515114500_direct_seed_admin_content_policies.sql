GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_seed_admin_email()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(auth.jwt() ->> 'email') IN (
    'jayszrs@admin.local',
    'jaelanisuryasaputra@gmail.com',
    'jaelanisurya.akademicrypto@gmail.com'
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_seed_admin_email() TO authenticated;

DROP POLICY IF EXISTS "admins manage certs" ON public.certifications;
DROP POLICY IF EXISTS "admins manage experiences" ON public.experiences;
DROP POLICY IF EXISTS "admins manage edu" ON public.education;
DROP POLICY IF EXISTS "admins manage vol" ON public.volunteers;
DROP POLICY IF EXISTS "admins manage projects" ON public.projects;
DROP POLICY IF EXISTS "admins manage skills" ON public.skills;
DROP POLICY IF EXISTS "admins manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "admins manage profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins update profile" ON public.profile_settings;

CREATE POLICY "admins manage certs"
  ON public.certifications
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email());

CREATE POLICY "admins manage experiences"
  ON public.experiences
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email());

CREATE POLICY "admins manage edu"
  ON public.education
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email());

CREATE POLICY "admins manage vol"
  ON public.volunteers
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email());

CREATE POLICY "admins manage projects"
  ON public.projects
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email());

CREATE POLICY "admins manage skills"
  ON public.skills
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email());

CREATE POLICY "admins manage gallery"
  ON public.gallery
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email());

CREATE POLICY "admins manage profile settings"
  ON public.profile_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_seed_admin_email());

DROP POLICY IF EXISTS "admins upload" ON storage.objects;
DROP POLICY IF EXISTS "admins update files" ON storage.objects;
DROP POLICY IF EXISTS "admins delete files" ON storage.objects;

CREATE POLICY "admins upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND (public.has_role(auth.uid(),'admin') OR public.is_seed_admin_email())
  );

CREATE POLICY "admins update files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND (public.has_role(auth.uid(),'admin') OR public.is_seed_admin_email())
  )
  WITH CHECK (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND (public.has_role(auth.uid(),'admin') OR public.is_seed_admin_email())
  );

CREATE POLICY "admins delete files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND (public.has_role(auth.uid(),'admin') OR public.is_seed_admin_email())
  );

NOTIFY pgrst, 'reload schema';
