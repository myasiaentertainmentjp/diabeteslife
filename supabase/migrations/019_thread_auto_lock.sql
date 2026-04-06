-- =============================================
-- 019: スレッド自動ロック機能
-- 作成から90日 or コメント500件でコメント不可
-- =============================================

-- threadsテーブルにmax_comments_countを追加
ALTER TABLE threads ADD COLUMN IF NOT EXISTS max_comments_count INTEGER DEFAULT 500;

-- 自動ロック関数（コメント数が上限に達したらlocked）
CREATE OR REPLACE FUNCTION check_thread_lock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads
  SET status = 'locked'
  WHERE id = NEW.thread_id
    AND status = 'normal'
    AND (
      comments_count >= max_comments_count
      OR created_at < NOW() - INTERVAL '90 days'
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- コメント投稿後にチェックするトリガー
DROP TRIGGER IF EXISTS trigger_check_thread_lock ON comments;
CREATE TRIGGER trigger_check_thread_lock
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_thread_lock();

-- コメント投稿前に締め切りチェック（RLSでブロック）
CREATE OR REPLACE FUNCTION check_thread_open()
RETURNS TRIGGER AS $$
DECLARE
  v_thread threads%ROWTYPE;
BEGIN
  SELECT * INTO v_thread FROM threads WHERE id = NEW.thread_id;
  
  -- statusがlockedなら拒否
  IF v_thread.status = 'locked' THEN
    RAISE EXCEPTION 'このスレッドはコメントを締め切りました';
  END IF;
  
  -- 90日経過してたら拒否
  IF v_thread.created_at < NOW() - INTERVAL '90 days' THEN
    RAISE EXCEPTION 'このスレッドは90日が経過したためコメントできません';
  END IF;
  
  -- コメント数が上限に達してたら拒否
  IF v_thread.comments_count >= COALESCE(v_thread.max_comments_count, 500) THEN
    RAISE EXCEPTION 'このスレッドはコメント数が上限に達しました';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_thread_open ON comments;
CREATE TRIGGER trigger_check_thread_open
  BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_thread_open();

-- 既存スレッドで条件を満たすものを一括ロック
UPDATE threads
SET status = 'locked'
WHERE status = 'normal'
  AND (
    comments_count >= 500
    OR created_at < NOW() - INTERVAL '90 days'
  );
