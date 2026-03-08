-- M&A価値最大化 Phase 2
-- 通院・生活習慣・同意・リマインダー機能追加

-- ============================================
-- 1. 通院・検査データ
-- ============================================

-- 通院頻度
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS visit_frequency text;
-- 値: monthly, bimonthly, quarterly, biannually, annually, irregular

-- 診療科
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS medical_department text;
-- 値: diabetes_internal, general_internal, endocrine, other

-- 公開フラグ
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS visit_frequency_public boolean DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS medical_department_public boolean DEFAULT false;

-- 合併症詳細（複数選択可）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS complications text[];
-- 値: retinopathy, nephropathy, neuropathy, cardiovascular, foot, dental, other
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS complications_public boolean DEFAULT false;

-- ============================================
-- 2. 生活習慣データ
-- ============================================

-- 食事管理方法（複数選択可）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diet_method text[];
-- 値: carb_restriction, calorie_restriction, balanced, none

-- 運動頻度
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS exercise_frequency text;
-- 値: daily, several_weekly, weekly, monthly, rarely, none

-- 運動種類（複数選択可）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS exercise_types text[];
-- 値: walking, jogging, gym, swimming, cycling, yoga, other

-- 喫煙状況
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS smoking_status text;
-- 値: never, former, current

-- 飲酒状況
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS drinking_status text;
-- 値: never, rarely, sometimes, often

-- 生活習慣全体の公開フラグ
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS lifestyle_public boolean DEFAULT false;

-- ============================================
-- 3. データ精度向上
-- ============================================

-- HbA1c検査日（実際の検査日）
ALTER TABLE hba1c_records ADD COLUMN IF NOT EXISTS tested_at date;

-- 薬の服用詳細（開始日付き）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS medications_detail jsonb DEFAULT '[]';
-- 構造: [{"name": "メトホルミン", "started_at": "2024-01"}, ...]

-- ============================================
-- 4. データ利用同意テーブル
-- ============================================

CREATE TABLE IF NOT EXISTS user_consents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  consent_type text NOT NULL,
  -- 値: research_data, pharma_data, marketing
  consented boolean NOT NULL,
  consented_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, consent_type)
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);

-- RLSポリシー
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- 既存ポリシー削除（冪等性のため）
DROP POLICY IF EXISTS "Users can view own consents" ON user_consents;
DROP POLICY IF EXISTS "Users can insert own consents" ON user_consents;
DROP POLICY IF EXISTS "Users can update own consents" ON user_consents;

CREATE POLICY "Users can view own consents" ON user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents" ON user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents" ON user_consents
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 6. 記録リマインダー
-- ============================================

-- 体重リマインダー設定
ALTER TABLE notification_settings ADD COLUMN IF NOT EXISTS weight_reminder boolean DEFAULT true;

-- 記録継続バッジ用
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hba1c_streak integer DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weight_streak integer DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_hba1c_recorded_at date;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_weight_recorded_at date;

-- ============================================
-- updated_at自動更新トリガー（user_consents用）
-- ============================================

CREATE OR REPLACE FUNCTION update_user_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_consents_updated_at ON user_consents;
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_consents_updated_at();
