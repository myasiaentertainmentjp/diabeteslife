# D-LIFE 改善タスクリスト

作成日: 2026-03-06
最終更新: 2026-03-06
ステータス: フェーズ1-2完了

---

## 完了済み

### フェーズ1: 緊急SEO対応

#### 1.2 主要ページへのメタデータ追加 [x]
- [x] `/app/threads/page.tsx` - メタデータ + revalidate追加
- [x] `/app/guide/layout.tsx` - 新規作成
- [x] `/app/faq/layout.tsx` - 新規作成
- [x] `/app/contact/layout.tsx` - 新規作成
- [x] `/app/search/layout.tsx` - 新規作成
- [x] `/app/login/layout.tsx` - 新規作成
- [x] `/app/register/layout.tsx` - 新規作成
- [x] `/app/forgot-password/layout.tsx` - 新規作成

### フェーズ2: SEO強化

#### 2.1 動的サイトマップ実装 [x]
- [x] `/app/sitemap.ts` 作成
- [x] 全記事のスラッグを含む
- [x] 全スレッド（最新500件）を含む
- [x] 静的sitemap.xml削除

#### 2.2 JSON-LD構造化データ追加 [x]
- [x] Organization schema (layout.tsx)
- [x] WebSite schema with SearchAction (layout.tsx)
- [x] BlogPosting schema (articles/[slug]/page.tsx)

#### 2.3 revalidate設定追加 [x]
- [x] `/app/page.tsx` (ホーム): revalidate = 3600
- [x] `/app/threads/page.tsx`: revalidate = 300
- [x] `/app/articles/page.tsx`: revalidate = 60 (既存)
- [x] `/app/articles/[slug]/page.tsx`: revalidate = 60 (既存)

### フェーズ3: パフォーマンス最適化

#### 3.1 next/image導入 [x]
- [x] `/app/articles/page.tsx`
- [x] `/app/articles/[slug]/page.tsx`
- [x] `/app/search/page.tsx`

#### 3.4 next.config.mjs最適化 [x]
- [x] images.remotePatterns設定
- [x] AVIF/WebP自動変換
- [x] キャッシュヘッダー設定

---

## 未完了（優先度: 低〜中）

### 1.1 OGP画像作成 [ ]
- `/public/images/ogp.png` を作成（1200x630px）
- サイトロゴとキャッチコピーを含むデザイン
- **要手動作成**

### 残りのnext/image導入 [ ]
以下のファイルにまだ`<img>`タグが残っている:
- [ ] `/app/mypage/blocked/page.tsx`
- [ ] `/app/threads/new/page.tsx`
- [ ] `/app/users/[userId]/page.tsx`
- [ ] `/components/HomeClient.tsx`
- [ ] `/components/Sidebar.tsx`
- [ ] `/components/ThreadDetailClient.tsx`

### useEffect依存関係の修正 [ ]
ESLint警告が出ている箇所（機能には影響なし）

### 追加JSON-LD [ ]
- [ ] FAQPage schema (/faq)
- [ ] BreadcrumbList schema

---

## メモ

- Bolt.new → Next.js 移行完了
- SSR正常動作確認済み (2026-03-06)
- DNS設定完了 (diabeteslife.jp → 162.43.76.7)
- ビルド成功 (2026-03-06)
