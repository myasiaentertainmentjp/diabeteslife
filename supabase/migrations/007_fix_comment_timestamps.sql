-- コメントの時間をスレッドの投稿時間より後に修正する
-- コメント番号が大きいほど後の時間になるように設定

-- thread_commentsの時間を修正
-- スレッドの作成時間 + (コメント番号 × 数分) になるように設定
WITH ranked_comments AS (
  SELECT
    tc.id,
    tc.thread_id,
    t.created_at as thread_created_at,
    ROW_NUMBER() OVER (PARTITION BY tc.thread_id ORDER BY tc.id) as comment_num
  FROM thread_comments tc
  JOIN threads t ON t.id = tc.thread_id
)
UPDATE thread_comments tc
SET created_at = rc.thread_created_at + (rc.comment_num * INTERVAL '10 minutes') + (random() * INTERVAL '5 minutes')
FROM ranked_comments rc
WHERE tc.id = rc.id;
