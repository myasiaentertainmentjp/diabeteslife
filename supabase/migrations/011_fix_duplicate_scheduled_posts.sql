-- =============================================
-- Fix: process_scheduled_posts の重複実行防止
-- =============================================
-- 問題: cronジョブと手動実行が同時に走ると、
-- 同じ予約投稿が2回処理されてコメントが重複する
-- 修正: FOR UPDATE SKIP LOCKED を使用して排他制御を追加

CREATE OR REPLACE FUNCTION process_scheduled_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  scheduled RECORD;
  new_thread_id UUID;
  comment_count INT;
BEGIN
  FOR scheduled IN
    SELECT * FROM scheduled_posts
    WHERE status = 'pending'
    AND scheduled_at <= NOW()
    ORDER BY scheduled_at ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    IF scheduled.type = 'thread' THEN
      -- Insert new thread
      INSERT INTO threads (user_id, title, content, category, status)
      VALUES (scheduled.user_id, scheduled.title, scheduled.content, scheduled.category, 'normal')
      RETURNING id INTO new_thread_id;

      -- Update scheduled post
      UPDATE scheduled_posts
      SET status = 'posted', posted_at = NOW(), updated_at = NOW()
      WHERE id = scheduled.id;

    ELSIF scheduled.type = 'comment' THEN
      -- Insert new comment
      INSERT INTO comments (thread_id, user_id, body)
      VALUES (scheduled.thread_id, scheduled.user_id, scheduled.content);

      -- Update thread comments count
      SELECT COUNT(*) INTO comment_count
      FROM comments WHERE thread_id = scheduled.thread_id;

      UPDATE threads
      SET comments_count = comment_count, updated_at = NOW()
      WHERE id = scheduled.thread_id;

      -- Update scheduled post
      UPDATE scheduled_posts
      SET status = 'posted', posted_at = NOW(), updated_at = NOW()
      WHERE id = scheduled.id;
    END IF;
  END LOOP;
END;
$$;
