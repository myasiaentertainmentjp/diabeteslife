-- =============================================
-- 020: 継続スレッド自動生成機能
-- is_continuous=trueのスレッドが上限に達したら
-- 自動でPart2を作成する
-- =============================================

-- threadsテーブルに継続フラグと次スレIDを追加
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_continuous BOOLEAN DEFAULT false;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS next_thread_id UUID REFERENCES threads(id);
ALTER TABLE threads ADD COLUMN IF NOT EXISTS part_number INTEGER DEFAULT 1;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS parent_thread_id UUID REFERENCES threads(id);

-- 継続スレッド自動生成関数
CREATE OR REPLACE FUNCTION create_next_thread()
RETURNS TRIGGER AS $$
DECLARE
  v_thread threads%ROWTYPE;
  v_new_title TEXT;
  v_new_thread_id UUID;
  v_next_part INTEGER;
  v_max_thread_number INTEGER;
BEGIN
  -- 対象スレッドを取得
  SELECT * INTO v_thread FROM threads WHERE id = NEW.thread_id;
  
  -- 継続フラグがなければスキップ
  IF v_thread.is_continuous = false OR v_thread.is_continuous IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- 既にnext_thread_idが設定されていればスキップ
  IF v_thread.next_thread_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- 上限チェック（500件 or 90日）
  IF v_thread.comments_count >= COALESCE(v_thread.max_comments_count, 500)
     OR v_thread.created_at < NOW() - INTERVAL '90 days' THEN
    
    -- 次のパート番号
    v_next_part := COALESCE(v_thread.part_number, 1) + 1;
    
    -- タイトル生成（既存の【PartX】を除去してから付与）
    v_new_title := regexp_replace(v_thread.title, '【Part\d+】$', '');
    v_new_title := v_new_title || '【Part' || v_next_part || '】';
    
    -- 最大thread_numberを取得
    SELECT COALESCE(MAX(thread_number), 0) + 1 INTO v_max_thread_number FROM threads;
    
    -- Part2スレッドを作成
    INSERT INTO threads (
      title,
      body,
      user_id,
      category,
      is_pinned,
      is_locked,
      is_hidden,
      is_continuous,
      max_comments_count,
      part_number,
      parent_thread_id,
      thread_number,
      comments_count,
      created_at,
      updated_at
    ) VALUES (
      v_new_title,
      '前スレッドからの継続トピックです。引き続きお気軽にご参加ください。',
      v_thread.user_id,
      v_thread.category,
      v_thread.is_pinned,
      false,
      false,
      true,
      500,
      v_next_part,
      COALESCE(v_thread.parent_thread_id, v_thread.id),
      v_max_thread_number,
      0,
      NOW(),
      NOW()
    ) RETURNING id INTO v_new_thread_id;
    
    -- 元スレッドにnext_thread_idを設定してロック
    UPDATE threads
    SET next_thread_id = v_new_thread_id,
        is_locked = true
    WHERE id = v_thread.id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー設定（コメント投稿後）
DROP TRIGGER IF EXISTS trigger_create_next_thread ON comments;
CREATE TRIGGER trigger_create_next_thread
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_next_thread();

