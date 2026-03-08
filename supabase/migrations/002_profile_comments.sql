-- Profile Comments Feature
-- Run this in Supabase SQL Editor

-- =============================================
-- プロフィールコメント機能
-- =============================================

-- profile_comments テーブル作成
CREATE TABLE IF NOT EXISTS profile_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commenter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- profile_comments の RLS
ALTER TABLE profile_comments ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能
CREATE POLICY "Anyone can view profile comments" ON profile_comments
  FOR SELECT USING (true);

-- ログインユーザーはコメント投稿可能
CREATE POLICY "Authenticated users can create profile comments" ON profile_comments
  FOR INSERT WITH CHECK (auth.uid() = commenter_id);

-- コメント投稿者、プロフィールオーナー、管理者は削除可能
CREATE POLICY "Comment owner, profile owner, or admin can delete" ON profile_comments
  FOR DELETE USING (
    auth.uid() = commenter_id OR
    auth.uid() = profile_user_id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_profile_comments_profile_user_id ON profile_comments(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_comments_created_at ON profile_comments(created_at ASC);
