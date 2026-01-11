-- 004: Add 'todays_meal' category
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. カテゴリに「今日のごはん」を追加
-- =============================================

-- threads テーブルの category カラムの CHECK 制約を更新
-- まず既存の制約を削除（存在する場合）
ALTER TABLE threads DROP CONSTRAINT IF EXISTS threads_category_check;

-- 新しい制約を追加（todays_meal を含む）
ALTER TABLE threads ADD CONSTRAINT threads_category_check
  CHECK (category IN ('todays_meal', 'food_recipe', 'treatment', 'exercise_lifestyle', 'mental_concerns', 'complications_prevention', 'chat_other'));

-- =============================================
-- 2. mode カラムの確認・追加（存在しない場合）
-- =============================================

-- mode カラムが存在しない場合は追加
ALTER TABLE threads
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'normal' CHECK (mode IN ('normal', 'diary'));

-- =============================================
-- 3. threads の INSERT ポリシー確認・追加
-- =============================================

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can create threads" ON threads;

-- 認証ユーザーがスレッドを作成できるポリシー
CREATE POLICY "Users can create threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 確認: RLSが有効になっているか
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

-- SELECT ポリシー（存在しない場合）
DROP POLICY IF EXISTS "Anyone can view threads" ON threads;
CREATE POLICY "Anyone can view threads" ON threads
  FOR SELECT USING (true);

-- UPDATE ポリシー（スレッド作成者のみ）
DROP POLICY IF EXISTS "Users can update own threads" ON threads;
CREATE POLICY "Users can update own threads" ON threads
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE ポリシー（スレッド作成者のみ）
DROP POLICY IF EXISTS "Users can delete own threads" ON threads;
CREATE POLICY "Users can delete own threads" ON threads
  FOR DELETE USING (auth.uid() = user_id);
