-- =============================================
-- 予約コメント自動公開のcronジョブ設定
-- =============================================
--
-- このスクリプトをSupabase SQL Editorで実行してください。
-- pg_cron拡張が有効になっている必要があります。
--
-- Supabase Dashboard > Database > Extensions で pg_cron を有効にしてください。
-- =============================================

-- 1. 既存のジョブがあれば削除
SELECT cron.unschedule('publish-scheduled-comments')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'publish-scheduled-comments'
);

-- 2. 10分ごとに予約コメントを公開するジョブを作成
SELECT cron.schedule(
  'publish-scheduled-comments',    -- ジョブ名
  '*/10 * * * *',                  -- 10分ごと (cronフォーマット)
  $$SELECT publish_scheduled_comments()$$
);

-- 確認: 作成されたジョブを表示
SELECT * FROM cron.job WHERE jobname = 'publish-scheduled-comments';

-- =============================================
-- オプション: 1時間ごとに変更する場合
-- =============================================
-- SELECT cron.unschedule('publish-scheduled-comments');
-- SELECT cron.schedule(
--   'publish-scheduled-comments',
--   '0 * * * *',  -- 毎時0分
--   $$SELECT publish_scheduled_comments()$$
-- );

-- =============================================
-- 手動で実行する場合
-- =============================================
-- SELECT publish_scheduled_comments();

-- =============================================
-- cron実行履歴を確認
-- =============================================
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'publish-scheduled-comments')
-- ORDER BY start_time DESC
-- LIMIT 10;
