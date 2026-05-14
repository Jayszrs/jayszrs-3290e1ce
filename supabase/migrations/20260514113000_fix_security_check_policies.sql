DROP POLICY IF EXISTS "anyone can read profile" ON public.profile_settings;
DROP POLICY IF EXISTS "admins update profile" ON public.profile_settings;

CREATE POLICY "admins read profile settings"
  ON public.profile_settings
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert profile settings"
  ON public.profile_settings
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update profile settings"
  ON public.profile_settings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete profile settings"
  ON public.profile_settings
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.profile_public (
  id UUID PRIMARY KEY,
  branding_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  about TEXT NOT NULL,
  location TEXT NOT NULL,
  availability TEXT NOT NULL,
  typing_texts TEXT[] NOT NULL DEFAULT '{}',
  cv_url TEXT,
  profile_image_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_public ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can read public profile" ON public.profile_public;
CREATE POLICY "anyone can read public profile"
  ON public.profile_public
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admins manage public profile" ON public.profile_public;
DROP POLICY IF EXISTS "admins insert public profile" ON public.profile_public;
DROP POLICY IF EXISTS "admins update public profile" ON public.profile_public;
DROP POLICY IF EXISTS "admins delete public profile" ON public.profile_public;

CREATE POLICY "admins insert public profile"
  ON public.profile_public
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update public profile"
  ON public.profile_public
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete public profile"
  ON public.profile_public
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.profile_public (
  id,
  branding_name,
  full_name,
  subtitle,
  about,
  location,
  availability,
  typing_texts,
  cv_url,
  profile_image_url,
  github_url,
  linkedin_url,
  instagram_url,
  tiktok_url,
  updated_at
)
SELECT
  id,
  branding_name,
  full_name,
  subtitle,
  about,
  location,
  availability,
  typing_texts,
  cv_url,
  profile_image_url,
  github_url,
  linkedin_url,
  instagram_url,
  tiktok_url,
  updated_at
FROM public.profile_settings
ON CONFLICT (id) DO UPDATE
SET branding_name = EXCLUDED.branding_name,
    full_name = EXCLUDED.full_name,
    subtitle = EXCLUDED.subtitle,
    about = EXCLUDED.about,
    location = EXCLUDED.location,
    availability = EXCLUDED.availability,
    typing_texts = EXCLUDED.typing_texts,
    cv_url = EXCLUDED.cv_url,
    profile_image_url = EXCLUDED.profile_image_url,
    github_url = EXCLUDED.github_url,
    linkedin_url = EXCLUDED.linkedin_url,
    instagram_url = EXCLUDED.instagram_url,
    tiktok_url = EXCLUDED.tiktok_url,
    updated_at = EXCLUDED.updated_at;

CREATE OR REPLACE FUNCTION public.sync_profile_public()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.profile_public WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  INSERT INTO public.profile_public (
    id,
    branding_name,
    full_name,
    subtitle,
    about,
    location,
    availability,
    typing_texts,
    cv_url,
    profile_image_url,
    github_url,
    linkedin_url,
    instagram_url,
    tiktok_url,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.branding_name,
    NEW.full_name,
    NEW.subtitle,
    NEW.about,
    NEW.location,
    NEW.availability,
    NEW.typing_texts,
    NEW.cv_url,
    NEW.profile_image_url,
    NEW.github_url,
    NEW.linkedin_url,
    NEW.instagram_url,
    NEW.tiktok_url,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET branding_name = EXCLUDED.branding_name,
      full_name = EXCLUDED.full_name,
      subtitle = EXCLUDED.subtitle,
      about = EXCLUDED.about,
      location = EXCLUDED.location,
      availability = EXCLUDED.availability,
      typing_texts = EXCLUDED.typing_texts,
      cv_url = EXCLUDED.cv_url,
      profile_image_url = EXCLUDED.profile_image_url,
      github_url = EXCLUDED.github_url,
      linkedin_url = EXCLUDED.linkedin_url,
      instagram_url = EXCLUDED.instagram_url,
      tiktok_url = EXCLUDED.tiktok_url,
      updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_public ON public.profile_settings;
CREATE TRIGGER trg_sync_profile_public
  AFTER INSERT OR UPDATE OR DELETE ON public.profile_settings
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_public();

REVOKE EXECUTE ON FUNCTION public.sync_profile_public() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "users see own roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;

CREATE POLICY "users read own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admins read all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
