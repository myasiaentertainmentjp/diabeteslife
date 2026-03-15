-- =============================================
-- 017: meal_posts テーブル新規作成
-- 食事記録機能（インスタ風グリッドUI対応）
-- フィルター: 料理系タグ・糖尿病種別・年代
-- =============================================

-- =============================================
-- 1. meal_posts テーブル
-- =============================================
CREATE TABLE IF NOT EXISTS meal_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',              -- 料理系タグ（低糖質・外食等）
  diabetes_type TEXT,                    -- 投稿者の糖尿病種別（自動取得）
  age_group TEXT,                        -- 投稿者の年代（自動取得）
  blood_sugar_after INTEGER,             -- 食後血糖値（任意・mg/dL）
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_meal_posts_user_id ON meal_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_posts_created_at ON meal_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_posts_is_public ON meal_posts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_meal_posts_tags ON meal_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_meal_posts_diabetes_type ON meal_posts(diabetes_type);
CREATE INDEX IF NOT EXISTS idx_meal_posts_age_group ON meal_posts(age_group);

-- RLS
ALTER TABLE meal_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public meal posts" ON meal_posts
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create meal posts" ON meal_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal posts" ON meal_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal posts" ON meal_posts
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 2. meal_comments テーブル
-- =============================================
CREATE TABLE IF NOT EXISTS meal_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_post_id UUID NOT NULL REFERENCES meal_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_comments_meal_post_id ON meal_comments(meal_post_id);
CREATE INDEX IF NOT EXISTS idx_meal_comments_created_at ON meal_comments(created_at ASC);

ALTER TABLE meal_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meal comments" ON meal_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create meal comments" ON meal_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal comments" ON meal_comments
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. meal_likes テーブル
-- =============================================
CREATE TABLE IF NOT EXISTS meal_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_post_id UUID NOT NULL REFERENCES meal_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_meal_likes_meal_post_id ON meal_likes(meal_post_id);
CREATE INDEX IF NOT EXISTS idx_meal_likes_user_id ON meal_likes(user_id);

ALTER TABLE meal_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meal likes" ON meal_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like meal posts" ON meal_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike meal posts" ON meal_likes
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. トリガー（likes_count / comments_count 自動更新）
-- =============================================
CREATE OR REPLACE FUNCTION update_meal_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE meal_posts SET likes_count = likes_count + 1 WHERE id = NEW.meal_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE meal_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.meal_post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_meal_likes_count
  AFTER INSERT OR DELETE ON meal_likes
  FOR EACH ROW EXECUTE FUNCTION update_meal_likes_count();

CREATE OR REPLACE FUNCTION update_meal_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE meal_posts SET comments_count = comments_count + 1 WHERE id = NEW.meal_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE meal_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.meal_post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_meal_comments_count
  AFTER INSERT OR DELETE ON meal_comments
  FOR EACH ROW EXECUTE FUNCTION update_meal_comments_count();
