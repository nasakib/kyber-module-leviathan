-- VectorForge: The Coordinate Engine - Cloud Database Schema for Supabase
-- Run this script in your Supabase SQL Editor to provision all tables, functions, RLS policies, and triggers.

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL DEFAULT 'Coordinate Pilot',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by all authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile automatically on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. USER PROGRESS (CLOUD SAVES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  stars INTEGER NOT NULL DEFAULT 0,
  best_attempts INTEGER NOT NULL DEFAULT 0,
  mastery_status JSONB NOT NULL DEFAULT '{"bronze": false, "silver": false, "gold": false}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);

-- RLS: User Progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. COMMUNITY LEVELS & RATINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.community_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'VectorForge Architect',
  title TEXT NOT NULL,
  sector_id TEXT NOT NULL DEFAULT 'linear',
  description TEXT NOT NULL DEFAULT '',
  level_data JSONB NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  upvotes INTEGER NOT NULL DEFAULT 0,
  play_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_levels_sector ON public.community_levels(sector_id);
CREATE INDEX IF NOT EXISTS idx_community_levels_upvotes ON public.community_levels(upvotes DESC);

-- Level Upvotes Tracker (one vote per user)
CREATE TABLE IF NOT EXISTS public.level_votes (
  level_id UUID NOT NULL REFERENCES public.community_levels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (level_id, user_id)
);

-- RLS: Community Levels & Votes
ALTER TABLE public.community_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can browse community levels"
  ON public.community_levels FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can publish community levels"
  ON public.community_levels FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update or delete their own levels"
  ON public.community_levels FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can manage their own votes"
  ON public.level_votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view votes"
  ON public.level_votes FOR SELECT
  USING (true);

-- ============================================================================
-- 4. CLASSROOM MANAGEMENT & ASSIGNMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classroom_members (
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (classroom_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  required_level_ids TEXT[] NOT NULL DEFAULT '{}',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  completed_levels TEXT[] NOT NULL DEFAULT '{}',
  total_stars INTEGER NOT NULL DEFAULT 0,
  gold_masteries_count INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- RLS: Classrooms & Assignments
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their classrooms"
  ON public.classrooms FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY "Enrolled students can view classrooms"
  ON public.classrooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_members
      WHERE classroom_id = public.classrooms.id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Classroom members visibility"
  ON public.classroom_members FOR ALL
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.classrooms
      WHERE id = public.classroom_members.classroom_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Assignments visible to teachers and enrolled students"
  ON public.assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms
      WHERE id = public.assignments.classroom_id AND teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.classroom_members
      WHERE classroom_id = public.assignments.classroom_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Submissions visible to student and teacher"
  ON public.assignment_submissions FOR ALL
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.classrooms c ON a.classroom_id = c.id
      WHERE a.id = public.assignment_submissions.assignment_id AND c.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. REALTIME PUBLICATIONS
-- ============================================================================
-- Enable Realtime for multi-device sync and live classroom dashboards
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_levels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_submissions;
