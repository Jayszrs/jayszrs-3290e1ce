
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-promote first user to admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TIMESTAMPS HELPER
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- PROFILE SETTINGS (singleton row)
CREATE TABLE public.profile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branding_name TEXT NOT NULL DEFAULT 'JAY SZRS',
  full_name TEXT NOT NULL DEFAULT 'Jaelani Surya Saputra',
  subtitle TEXT NOT NULL DEFAULT 'Creative Technologist • Informatics Student • Designer • Content Creator',
  about TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT 'jaelanisuryasaputra@gmail.com',
  whatsapp TEXT NOT NULL DEFAULT '62895330152658',
  location TEXT NOT NULL DEFAULT 'Indonesia',
  availability TEXT NOT NULL DEFAULT 'Available for collaboration',
  typing_texts TEXT[] NOT NULL DEFAULT ARRAY['I build digital experiences.','I design creative interfaces.','I explore IT, design, and technology.'],
  cv_url TEXT,
  profile_image_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read profile" ON public.profile_settings FOR SELECT USING (true);
CREATE POLICY "admins update profile" ON public.profile_settings FOR ALL USING (public.has_role(auth.uid(),'admin'));
INSERT INTO public.profile_settings (about) VALUES ('Hi, I am Jay SZRS. Informatics Engineering student passionate about UI/UX, web development, design, content creation, networking, and cyber security basics.');

-- GENERIC CONTENT TABLES
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  date_range TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  category TEXT,
  description TEXT,
  image_url TEXT,
  document_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "admins manage experiences" ON public.experiences FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_exp_upd BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT NOT NULL,
  category TEXT,
  description TEXT,
  badge_url TEXT,
  certificate_url TEXT,
  verification_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read certs" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "admins manage certs" ON public.certifications FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_cert_upd BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  major TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read edu" ON public.education FOR SELECT USING (true);
CREATE POLICY "admins manage edu" ON public.education FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_edu_upd BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  year TEXT NOT NULL,
  category TEXT,
  description TEXT,
  image_url TEXT,
  document_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read vol" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "admins manage vol" ON public.volunteers FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_vol_upd BEFORE UPDATE ON public.volunteers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL,
  year TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'Completed',
  thumbnail_url TEXT,
  demo_url TEXT,
  github_url TEXT,
  documentation_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "admins manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_proj_upd BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INT DEFAULT 80,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "admins manage skills" ON public.skills FOR ALL USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "admins manage gallery" ON public.gallery FOR ALL USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update messages" ON public.contact_messages FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete messages" ON public.contact_messages FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES
  ('cv','cv',true),
  ('certificates','certificates',true),
  ('badges','badges',true),
  ('gallery','gallery',true),
  ('documents','documents',true),
  ('avatars','avatars',true);

CREATE POLICY "public read all buckets" ON storage.objects FOR SELECT
  USING (bucket_id IN ('cv','certificates','badges','gallery','documents','avatars'));
CREATE POLICY "admins upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('cv','certificates','badges','gallery','documents','avatars') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update files" ON storage.objects FOR UPDATE
  USING (bucket_id IN ('cv','certificates','badges','gallery','documents','avatars') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete files" ON storage.objects FOR DELETE
  USING (bucket_id IN ('cv','certificates','badges','gallery','documents','avatars') AND public.has_role(auth.uid(),'admin'));
