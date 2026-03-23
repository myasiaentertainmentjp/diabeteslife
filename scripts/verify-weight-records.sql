-- ===========================================
-- Phase 2: 体重記録 確認用SQL
-- ===========================================

-- 1. 投入前確認：ダミーユーザーの体重記録状況
SELECT
  '投入前' as status,
  COUNT(DISTINCT w.user_id) as users_with_records,
  COUNT(w.id) as total_records
FROM weight_records w
JOIN users u ON w.user_id = u.id
WHERE u.is_dummy = true;

-- 2. 投入後確認：ユーザー別サマリー
SELECT
  u.display_name,
  up.diabetes_type,
  COUNT(w.id) as record_count,
  MIN(w.recorded_at) as first_record,
  MAX(w.recorded_at) as last_record,
  MIN(w.value) as min_weight,
  MAX(w.value) as max_weight,
  ROUND(AVG(w.value)::numeric, 1) as avg_weight,
  MAX(w.value) - MIN(w.value) as weight_range
FROM users u
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN weight_records w ON u.id = w.user_id
WHERE u.is_dummy = true
  AND u.id IN (
    '9516c386-2cc6-53ba-8691-396ed2abff89',
    '649c2749-825f-5848-a5c7-96dead7950ea',
    '70ad24b3-70ad-54df-94ed-8ad696b6f4d2',
    '8108dd63-ac37-57eb-a000-957166677c83',
    '2033ee1c-28b2-5187-8ba1-c94f7964e33e',
    '41cf3d7f-9ac1-5151-9417-c3bfa7afeda0',
    '27de7033-665e-5060-bafa-e4aed971e69c',
    '6b77d0a7-e272-5075-be52-262fdf386cf1',
    '6ca9558c-e08f-5318-ae91-4ff74ae400e1',
    '86c6897a-ecb0-5df3-bd51-42cb87202f78',
    '5c742ce8-46e9-5195-84b2-2988893e7a29',
    '1ef47199-b5ca-5676-b707-094fb74dfb29',
    '43cddd28-0440-54a7-b3b5-87a8a4623507',
    '71325971-dac7-5495-9361-48a241d5ff15',
    '52eddc2c-aa88-5e62-a227-139b8887696c',
    '25c04963-f5cf-53a8-b8b4-8de16531d204',
    '37549bb9-c9e9-5b7c-b44e-ef43f58149de',
    '08b928d5-48dd-530a-a87f-c99f9be17971',
    '2ea07739-a00d-59c4-a47f-86a6ed6da68b',
    '5a3ee246-2604-53d4-9d80-5339b63e6e29'
  )
GROUP BY u.id, u.display_name, up.diabetes_type
ORDER BY record_count DESC;

-- 3. 月別記録数（全体的な分布確認）
SELECT
  TO_CHAR(recorded_at, 'YYYY-MM') as month,
  COUNT(*) as records
FROM weight_records w
JOIN users u ON w.user_id = u.id
WHERE u.is_dummy = true
GROUP BY TO_CHAR(recorded_at, 'YYYY-MM')
ORDER BY month;

-- 4. 体重値の分布確認（不自然な値がないか）
SELECT
  CASE
    WHEN value < 40 THEN '40kg未満'
    WHEN value < 50 THEN '40-50kg'
    WHEN value < 60 THEN '50-60kg'
    WHEN value < 70 THEN '60-70kg'
    WHEN value < 80 THEN '70-80kg'
    WHEN value < 90 THEN '80-90kg'
    ELSE '90kg以上'
  END as weight_range,
  COUNT(*) as count
FROM weight_records w
JOIN users u ON w.user_id = u.id
WHERE u.is_dummy = true
GROUP BY 1
ORDER BY 1;

-- 5. 公開設定の確認
SELECT
  is_public,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM weight_records w
JOIN users u ON w.user_id = u.id
WHERE u.is_dummy = true
GROUP BY is_public;

-- 6. サンプルユーザーの時系列データ（たこ🐙）
SELECT
  recorded_at,
  value,
  value - LAG(value) OVER (ORDER BY recorded_at) as change
FROM weight_records
WHERE user_id = '9516c386-2cc6-53ba-8691-396ed2abff89'
ORDER BY recorded_at
LIMIT 20;

-- 7. 同日複数記録の確認（あってはならない）
SELECT
  user_id,
  recorded_at,
  COUNT(*) as duplicate_count
FROM weight_records w
JOIN users u ON w.user_id = u.id
WHERE u.is_dummy = true
GROUP BY user_id, recorded_at
HAVING COUNT(*) > 1;

-- 8. 全ダミーユーザーの体重記録有無確認
SELECT
  CASE WHEN w.user_id IS NULL THEN '記録なし' ELSE '記録あり' END as status,
  COUNT(DISTINCT u.id) as user_count
FROM users u
LEFT JOIN weight_records w ON u.id = w.user_id
WHERE u.is_dummy = true
GROUP BY 1;
