-- =============================================
-- 016: diary_entries テーブル修正
-- 日記機能を独立した個人記録として整合性を回復
-- =============================================

-- 1. thread_id を nullable に変更
ALTER TABLE diary_entries
ALTER COLUMN thread_id DROP NOT NULL;

-- 2. title カラムを追加（任意）
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS title TEXT;

-- 3. mood カラムを追加（任意）
-- 値: great, good, okay, bad, terrible
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible'));

-- 4. RLSポリシー更新：thread_id不要でも挿入可能に
DROP POLICY IF EXISTS "Thread owner can create diary entries" ON diary_entries;

CREATE POLICY "User can create own diary entries" ON diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. 既存データに title を補完（content の先頭20文字）
UPDATE diary_entries
SET title = LEFT(content, 20)
WHERE title IS NULL;

-- 6. インデックス追加（user_id で直接検索するため）
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
