-- コメントの時間を1分単位でランダムに調整
-- created_atの分を0-59のランダムな値に変更

-- thread_comments の時間を調整
UPDATE thread_comments
SET created_at = created_at
  - INTERVAL '1 minute' * EXTRACT(MINUTE FROM created_at)
  + INTERVAL '1 minute' * floor(random() * 60);

-- profile_comments の時間を調整
UPDATE profile_comments
SET created_at = created_at
  - INTERVAL '1 minute' * EXTRACT(MINUTE FROM created_at)
  + INTERVAL '1 minute' * floor(random() * 60);

-- threads の時間も調整
UPDATE threads
SET created_at = created_at
  - INTERVAL '1 minute' * EXTRACT(MINUTE FROM created_at)
  + INTERVAL '1 minute' * floor(random() * 60);

-- diary_entries の時間も調整
UPDATE diary_entries
SET created_at = created_at
  - INTERVAL '1 minute' * EXTRACT(MINUTE FROM created_at)
  + INTERVAL '1 minute' * floor(random() * 60);
