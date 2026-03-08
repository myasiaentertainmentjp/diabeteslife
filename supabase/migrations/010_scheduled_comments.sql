-- 予約コメント機能: is_hidden カラムと自動公開機能
-- =============================================

-- 1. comments テーブルに is_hidden カラムを追加
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 2. インデックスを追加（未来日時のコメント検索用）
CREATE INDEX IF NOT EXISTS idx_comments_is_hidden ON comments(is_hidden) WHERE is_hidden = true;
CREATE INDEX IF NOT EXISTS idx_comments_scheduled ON comments(created_at, is_hidden) WHERE is_hidden = true;

-- 3. 予約コメントを公開する関数
CREATE OR REPLACE FUNCTION publish_scheduled_comments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- is_hidden = true で created_at が現在時刻以前のコメントを公開
  UPDATE comments
  SET is_hidden = false
  WHERE is_hidden = true
  AND created_at <= NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN updated_count;
END;
$$;

-- 4. 関数の実行権限を設定
GRANT EXECUTE ON FUNCTION publish_scheduled_comments() TO authenticated;
GRANT EXECUTE ON FUNCTION publish_scheduled_comments() TO service_role;

-- 5. pg_cron での定期実行設定（Supabase Dashboard から設定）
-- 以下のSQLをSupabase SQL Editorで実行してください：
--
-- 10分ごとに実行する場合:
-- SELECT cron.schedule(
--   'publish-scheduled-comments',
--   '*/10 * * * *',
--   $$SELECT publish_scheduled_comments()$$
-- );
--
-- 1時間ごとに実行する場合:
-- SELECT cron.schedule(
--   'publish-scheduled-comments',
--   '0 * * * *',
--   $$SELECT publish_scheduled_comments()$$
-- );
--
-- cron ジョブを確認:
-- SELECT * FROM cron.job;
--
-- cron ジョブを削除:
-- SELECT cron.unschedule('publish-scheduled-comments');

-- 6. RLSポリシーを更新（非表示コメントは管理者のみ閲覧可能）
-- 既存のSELECTポリシーがある場合は更新が必要

-- 公開コメントは誰でも閲覧可能
DROP POLICY IF EXISTS "Anyone can view visible comments" ON comments;
CREATE POLICY "Anyone can view visible comments" ON comments
  FOR SELECT USING (is_hidden = false);

-- 管理者は全コメント閲覧可能
DROP POLICY IF EXISTS "Admins can view all comments" ON comments;
CREATE POLICY "Admins can view all comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
