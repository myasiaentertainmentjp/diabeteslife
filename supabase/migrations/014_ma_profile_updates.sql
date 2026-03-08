-- M&A向けプロフィール改善: 服用薬・体重記録の追加
-- 2026-02-26

-- =============================================
-- 1. 服用薬カラムの追加
-- =============================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS medications text[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS medications_public boolean DEFAULT false;

-- =============================================
-- 2. 体重記録テーブルの作成
-- =============================================

CREATE TABLE IF NOT EXISTS weight_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recorded_at date NOT NULL,
  value decimal(5,1) NOT NULL,
  memo text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_weight_records_user_id ON weight_records(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_records_recorded_at ON weight_records(recorded_at DESC);

-- ユニーク制約（同じユーザーが同じ月に複数記録を防ぐ場合はコメント解除）
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_weight_records_user_month ON weight_records(user_id, recorded_at);

-- =============================================
-- 3. 体重記録のRLSポリシー
-- =============================================

ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;

-- 自分の記録は閲覧可能
CREATE POLICY "Users can view own weight records" ON weight_records
  FOR SELECT USING (auth.uid() = user_id);

-- 公開記録は誰でも閲覧可能
CREATE POLICY "Public weight records are viewable" ON weight_records
  FOR SELECT USING (is_public = true);

-- 自分の記録は作成可能
CREATE POLICY "Users can insert own weight records" ON weight_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分の記録は更新可能
CREATE POLICY "Users can update own weight records" ON weight_records
  FOR UPDATE USING (auth.uid() = user_id);

-- 自分の記録は削除可能
CREATE POLICY "Users can delete own weight records" ON weight_records
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. 体重公開フラグをプロフィールに追加
-- =============================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weight_public boolean DEFAULT false;

-- =============================================
-- 5. プロフィール確認日（月1ポップアップ用）
-- =============================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_profile_reviewed_at timestamptz;
