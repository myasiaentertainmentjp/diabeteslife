-- =============================================
-- Fix: 管理者メールアドレスによる記事作成権限の修正
-- =============================================
-- 問題: AdminLayoutはメールアドレスでバイパスできるが、
--       articlesテーブルのRLSはrole='admin'のみチェック
-- 修正: 管理者メールアドレスのusersレコードのroleをadminに設定

-- 管理者メールアドレスのroleをadminに更新
UPDATE users
SET role = 'admin'
WHERE email IN ('info@diabeteslife.jp', 'admin@diabeteslife.jp')
  AND role != 'admin';

-- articlesのINSERT RLSポリシーをメールでもバイパスできるよう更新
DROP POLICY IF EXISTS "Admins can insert articles" ON articles;
CREATE POLICY "Admins can insert articles" ON articles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.email IN ('info@diabeteslife.jp', 'admin@diabeteslife.jp'))
    )
  );

-- articlesのUPDATE RLSポリシーも同様に更新
DROP POLICY IF EXISTS "Admins can update articles" ON articles;
CREATE POLICY "Admins can update articles" ON articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.email IN ('info@diabeteslife.jp', 'admin@diabeteslife.jp'))
    )
  );

-- articlesのDELETE RLSポリシーも同様に更新
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;
CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.email IN ('info@diabeteslife.jp', 'admin@diabeteslife.jp'))
    )
  );

-- articlesのSELECT（全記事閲覧）RLSポリシーも更新
DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
CREATE POLICY "Admins can view all articles" ON articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.email IN ('info@diabeteslife.jp', 'admin@diabeteslife.jp'))
    )
  );
