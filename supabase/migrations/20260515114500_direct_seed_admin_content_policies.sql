GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "admins manage certs" ON public.certifications;
DROP POLICY IF EXISTS "admins manage experiences" ON public.experiences;
DROP POLICY IF EXISTS "admins manage edu" ON public.education;
DROP POLICY IF EXISTS "admins manage vol" ON public.volunteers;
DROP POLICY IF EXISTS "admins manage projects" ON public.projects;
DROP POLICY IF EXISTS "admins manage skills" ON public.skills;
DROP POLICY IF EXISTS "admins manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "admins manage profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins update profile" ON public.profile_settings;
DROP POLICY IF EXISTS "admins read profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins insert profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins update profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins delete profile settings" ON public.profile_settings;

CREATE POLICY "admins manage certs"
  ON public.certifications
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins manage experiences"
  ON public.experiences
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins manage edu"
  ON public.education
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins manage vol"
  ON public.volunteers
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins manage projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins manage skills"
  ON public.skills
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins manage gallery"
  ON public.gallery
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins read profile settings"
  ON public.profile_settings
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins insert profile settings"
  ON public.profile_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins update profile settings"
  ON public.profile_settings
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins delete profile settings"
  ON public.profile_settings
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins upload" ON storage.objects;
DROP POLICY IF EXISTS "admins update files" ON storage.objects;
DROP POLICY IF EXISTS "admins delete files" ON storage.objects;

CREATE POLICY "admins upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "admins update files"
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

CREATE POLICY "admins delete files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

NOTIFY pgrst, 'reload schema';
