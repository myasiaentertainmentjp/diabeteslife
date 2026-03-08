-- Phase 1: Database Updates
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. スレッド日記モード
-- =============================================

-- threads テーブルに mode カラムを追加
ALTER TABLE threads
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'normal' CHECK (mode IN ('normal', 'diary'));

-- 日記モード用のエントリーテーブル（スレッド作成者の投稿）
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- diary_entries の RLS
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view diary entries" ON diary_entries
  FOR SELECT USING (true);

CREATE POLICY "Thread owner can create diary entries" ON diary_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = thread_id
      AND threads.user_id = auth.uid()
      AND threads.mode = 'diary'
    )
  );

CREATE POLICY "Thread owner can update own diary entries" ON diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Thread owner can delete own diary entries" ON diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- diary_entries にインデックス追加
CREATE INDEX IF NOT EXISTS idx_diary_entries_thread_id ON diary_entries(thread_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at DESC);

-- =============================================
-- 2. プロフィール拡充
-- =============================================

-- user_profiles テーブルに新カラム追加
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('10s', '20s', '30s', '40s', '50s', '60s', '70s_plus', 'private')),
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'private')),
ADD COLUMN IF NOT EXISTS prefecture TEXT,
ADD COLUMN IF NOT EXISTS illness_duration TEXT CHECK (illness_duration IN ('less_than_1', '1_to_3', '3_to_5', '5_to_10', '10_plus')),
ADD COLUMN IF NOT EXISTS devices TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_complications TEXT DEFAULT 'private' CHECK (has_complications IN ('yes', 'no', 'private')),
ADD COLUMN IF NOT EXISTS on_dialysis TEXT DEFAULT 'private' CHECK (on_dialysis IN ('yes', 'no', 'private')),
ADD COLUMN IF NOT EXISTS is_pregnant TEXT DEFAULT 'private' CHECK (is_pregnant IN ('yes', 'no', 'private')),
ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_age_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_gender_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_prefecture_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_illness_duration_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_devices_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hba1c_public BOOLEAN DEFAULT false;

-- =============================================
-- 3. 通報機能
-- =============================================

-- reports テーブル作成
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'comment', 'diary_entry', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'medical_misinformation', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- reports の RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- reports にインデックス追加
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- =============================================
-- 4. ユーザーBAN機能
-- =============================================

-- users テーブルに is_banned カラム追加
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_reason TEXT;
