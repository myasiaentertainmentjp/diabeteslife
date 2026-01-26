-- =============================================
-- Fix: articles テーブルの RLS ポリシー追加
-- =============================================
-- 問題: admin ユーザーが記事を更新できない（UPDATE の RLS ポリシーが不足）
-- 修正: admin ユーザーに対する全操作の RLS ポリシーを追加

-- 既存のポリシーを安全に削除（存在する場合のみ）
DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
DROP POLICY IF EXISTS "Admins can update articles" ON articles;
DROP POLICY IF EXISTS "Admins can insert articles" ON articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;

-- RLS が有効になっていることを確認
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 誰でも公開記事を閲覧可能
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
CREATE POLICY "Anyone can view published articles" ON articles
  FOR SELECT USING (is_published = true);

-- 管理者は全記事を閲覧可能（下書き含む）
DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
CREATE POLICY "Admins can view all articles" ON articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 管理者は記事を作成可能
CREATE POLICY "Admins can insert articles" ON articles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 管理者は記事を更新可能
CREATE POLICY "Admins can update articles" ON articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 管理者は記事を削除可能
CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
