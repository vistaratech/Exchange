-- ================================================================
-- EXCHANGE — Production Supabase Schema & Security Setup
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query
-- ================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  city text DEFAULT 'Chennai',
  locality text,
  avatar text,
  rating numeric DEFAULT 5.0,
  exchanges integer DEFAULT 0,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger: Automatically create public.profiles row upon Supabase sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, city, locality, avatar)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'city', 'Chennai'),
    COALESCE(new.raw_user_meta_data->>'locality', 'Central'),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. POSTS TABLE (Items for barter exchange)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name text NOT NULL,
  owner_avatar text,
  title text NOT NULL,
  description text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('New', 'Like New', 'Good', 'Fair')),
  category text NOT NULL,
  city text NOT NULL,
  locality text,
  wanted text,
  image text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'removed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_city_category ON public.posts(city, category, status, created_at DESC);


-- 3. PROPOSALS TABLE (1-for-1 Item Exchange Offers)
CREATE TABLE IF NOT EXISTS public.exchange_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  receiver_name text NOT NULL,
  sender_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  receiver_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- 4. COMMUNITY REPORTS TABLE (User & Item Safety)
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  post_title text,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'Open' CHECK (status IN ('Open', 'Reviewing', 'Resolved', 'Dismissed')),
  created_at timestamptz DEFAULT now()
);


-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view member profiles, user can update own profile
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Posts: Active posts viewable by everyone; authenticated users can insert and manage own
CREATE POLICY "Active posts are viewable by everyone" ON public.posts
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Proposals: Only participants can view & manage their exchange proposals
CREATE POLICY "Participants can view proposals" ON public.exchange_proposals
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can submit proposals" ON public.exchange_proposals
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Participants can update proposals" ON public.exchange_proposals
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Reports: Anyone can submit a report; viewable by authenticated users or admins
CREATE POLICY "Anyone can report a post" ON public.reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view reports they filed" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);


-- ================================================================
-- STORAGE BUCKET FOR POST IMAGES (Supabase Storage)
-- ================================================================
-- Note: You can also create this bucket in Supabase Dashboard -> Storage -> New Bucket ('post-images' -> Public: ON)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public item images are accessible by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload item images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
