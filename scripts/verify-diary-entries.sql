-- ===========================================
-- Phase 3: 日記記録 確認用SQL
-- ===========================================

-- 1. 投入前確認：ダミーユーザーの日記状況
SELECT
  '投入前' as status,
  COUNT(DISTINCT t.user_id) as users_with_diary,
  COUNT(de.id) as total_entries
FROM threads t
LEFT JOIN diary_entries de ON t.id = de.thread_id
JOIN users u ON t.user_id = u.id
WHERE t.mode = 'diary'
  AND u.is_dummy = true;

-- 2. 投入後確認：ユーザー別サマリー
SELECT
  u.display_name,
  up.diabetes_type,
  t.id as thread_id,
  COUNT(de.id) as entry_count,
  MIN(de.created_at) as first_entry,
  MAX(de.created_at) as last_entry
FROM threads t
JOIN users u ON t.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN diary_entries de ON t.id = de.thread_id
WHERE t.mode = 'diary'
  AND u.is_dummy = true
GROUP BY u.id, u.display_name, up.diabetes_type, t.id
ORDER BY entry_count DESC;

-- 3. 月別エントリ数（全体的な分布確認）
SELECT
  TO_CHAR(de.created_at, 'YYYY-MM') as month,
  COUNT(*) as entries
FROM diary_entries de
JOIN threads t ON de.thread_id = t.id
JOIN users u ON t.user_id = u.id
WHERE t.mode = 'diary'
  AND u.is_dummy = true
GROUP BY TO_CHAR(de.created_at, 'YYYY-MM')
ORDER BY month;

-- 4. サンプルユーザーの日記内容（たこ🐙）
SELECT
  de.created_at,
  LEFT(de.content, 50) as content_preview
FROM diary_entries de
JOIN threads t ON de.thread_id = t.id
WHERE t.user_id = '9516c386-2cc6-53ba-8691-396ed2abff89'
  AND t.mode = 'diary'
ORDER BY de.created_at DESC
LIMIT 10;

-- 5. サンプルユーザーの日記内容（麻衣子@1型）
SELECT
  de.created_at,
  LEFT(de.content, 50) as content_preview
FROM diary_entries de
JOIN threads t ON de.thread_id = t.id
WHERE t.user_id = '27de7033-665e-5060-bafa-e4aed971e69c'
  AND t.mode = 'diary'
ORDER BY de.created_at DESC
LIMIT 10;

-- 6. 同日複数エントリの確認（あってはならない）
SELECT
  de.user_id,
  DATE(de.created_at) as entry_date,
  COUNT(*) as duplicate_count
FROM diary_entries de
JOIN threads t ON de.thread_id = t.id
JOIN users u ON t.user_id = u.id
WHERE t.mode = 'diary'
  AND u.is_dummy = true
GROUP BY de.user_id, DATE(de.created_at)
HAVING COUNT(*) > 1;

-- 7. 全ダミーユーザーの日記有無確認
SELECT
  CASE WHEN de.user_id IS NULL THEN '日記なし' ELSE '日記あり' END as status,
  COUNT(DISTINCT u.id) as user_count
FROM users u
LEFT JOIN threads t ON u.id = t.user_id AND t.mode = 'diary'
LEFT JOIN diary_entries de ON t.id = de.thread_id
WHERE u.is_dummy = true
GROUP BY 1;

-- 8. 内容の長さ分布
SELECT
  CASE
    WHEN LENGTH(de.content) < 15 THEN '短文(15文字未満)'
    WHEN LENGTH(de.content) < 30 THEN '普通(15-30文字)'
    ELSE '長め(30文字以上)'
  END as length_category,
  COUNT(*) as count
FROM diary_entries de
JOIN threads t ON de.thread_id = t.id
JOIN users u ON t.user_id = u.id
WHERE t.mode = 'diary'
  AND u.is_dummy = true
GROUP BY 1
ORDER BY 2 DESC;
