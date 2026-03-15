-- =============================================
-- 018: meal_postsにプロフィール属性カラム追加
-- 糖尿病種別・年代フィルター対応
-- =============================================

ALTER TABLE meal_posts
  ADD COLUMN IF NOT EXISTS diabetes_type TEXT,   -- type1 / type2 / gestational / prediabetes / family
  ADD COLUMN IF NOT EXISTS age_group TEXT;        -- 10s / 20s / 30s / 40s / 50s / 60s / 70s_plus

-- インデックス
CREATE INDEX IF NOT EXISTS idx_meal_posts_diabetes_type ON meal_posts(diabetes_type) WHERE diabetes_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_meal_posts_age_group ON meal_posts(age_group) WHERE age_group IS NOT NULL;
