-- =============================================
-- 未来コメントを除外した comments_count 更新
-- =============================================
-- 問題: comments_count が未来日時のコメントも含んでいる
-- 修正: created_at <= now() のコメントのみカウントする関数を作成

-- 可視コメント数を更新する関数
CREATE OR REPLACE FUNCTION update_visible_comments_count()
RETURNS void AS $$
BEGIN
  UPDATE threads SET comments_count = (
    SELECT COUNT(*)
    FROM comments
    WHERE comments.thread_id = threads.id
      AND comments.created_at <= now()
      AND comments.is_hidden = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 即座に実行
SELECT update_visible_comments_count();

-- pg_cron で1時間ごとに実行（pg_cron が有効な場合）
-- SELECT cron.schedule(
--   'update-visible-comments-count',
--   '0 * * * *',
--   $$SELECT update_visible_comments_count()$$
-- );
