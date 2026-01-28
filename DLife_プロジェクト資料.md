# D-Life（Dライフ）プロジェクト資料
## Claude Code作業用リファレンス

**※この資料に記載されている内容（テーブル構成、プロフィール項目、カテゴリ、機能など）に変更があった場合は、作業完了時にこの資料も併せて更新してください。**

---

## サービス概要

**糖尿病患者向けのコミュニティプラットフォーム**

| 項目 | 内容 |
|------|------|
| サービス名 | D-Life（Dライフ） |
| 運営 | MyAsia Entertainment LLC |
| コンセプト | 糖尿病患者同士が気軽に交流できる場所 |

### 競合との差別化
- 大手アプリ（あすけん、カロミル等）は「記録・管理」がメインでコミュニティが弱い
- 糖尿病ネットワーク（dm-net）は情報量はあるがUIが古い
- D-Lifeは「今風のUI」×「コミュニティ」×「情報」の組み合わせ

### 主な機能
- **掲示板（スレッド）**：カテゴリ別のフォーラム形式
- **日記機能**：日々の記録を投稿
- **HbA1cグラフ**：数値の推移を可視化
- **体重グラフ**：体重管理
- **記事コンテンツ**：糖尿病関連の情報記事

### カテゴリ
食事・レシピ、運動・生活、治療・通院、合併症・予防、メンタル・悩み、雑談・その他

---

## ユーザープロフィール項目

### 基本情報
- 表示名（必須）
- アバター画像
- 自己紹介文（500字以内）
- 生年月日 → 表示は「40代前半/中盤/後半」形式
- 性別（男性/女性/その他/非公開）
- 都道府県（任意）
- 外部リンク（最大3件）

### 糖尿病関連
- 糖尿病タイプ（1型/2型/妊娠糖尿病/予備群/家族・サポーター）
- 診断年 → 罹患歴は自動計算
- 治療法（複数選択可）：インスリン/経口薬/食事療法のみ/ポンプ
- 使用デバイス（複数選択可）：リブレ/リブレ2/Dexcom等
- 合併症・透析中・妊娠中の有無

### 健康データ（公開/非公開選択可）
- HbA1c（グラフ表示）
- 体重（グラフ表示）

---

## 技術スタック
- **フロントエンド**: bolt new
- **データベース**: Supabase
- **サーバー**: シンレンタルサーバー（Xserver）

---

## デプロイ方法
1. Claude Codeでコード修正
2. `dist`フォルダをzip圧縮
3. シンレンタルサーバーのファイルマネージャーでアップロード・置き換え

---

## Supabase情報

| 項目 | 値 |
|------|-----|
| プロジェクトURL | `https://josanlblwfjdaaezqbnw.supabase.co` |
| Project ID | `josanlblwfjdaaezqbnw` |
| サービスロールキー | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY` |

---

## テーブル構成

| テーブル名 | 備考 |
|-----------|------|
| admin_notifications | 管理者通知 |
| article_like_config | 記事いいね設定【UNRESTRICTED】 |
| articles | 記事コンテンツ |
| comments | コメント |
| diary_entries | 日記エントリー |
| diary_reactions | 日記リアクション |
| hba1c_records | HbA1c記録 |
| ng_words | NGワード |
| notification_settings | 通知設定 |
| notifications | 通知 |
| popular_keywords | 人気キーワード |
| profile_comments | プロフィールコメント |
| reports | 通報 |
| scheduled_posts | 予約投稿 |
| search_logs | 検索ログ |
| thread_reactions | スレッドリアクション |
| threads | スレッド（掲示板） |
| user_blocks | ユーザーブロック |
| user_profiles | ユーザープロフィール |
| users | ユーザー【UNRESTRICTED】 |

---

## コメントデータ投入（シードデータ）

### 概要
88スレッドに対してダミーコメントをCSVで作成し、Pythonスクリプトで一括投入する。
コメントCSVは **Claude AI（チャット版）** で作成し、投入は **Claude Code** 側で実行。

### 作業フロー
1. Claude AIでスレッドごとのコメントCSVを作成（番号, リプライ先, 本文, 日時）
2. Claude Codeで投入スクリプトを作成・実行（`scripts/insert_comments_noXX.py`）
3. `dlife_threads_88.md` のステータスを「完了」に更新

### 投入仕様
- コメントは `created_at` に日時をJST→UTC変換して設定
- **未来日のコメント**も投入済み（フロントで `created_at <= now()` フィルタにより非表示）
- `comments_count` は過去コメントのみカウント（未来分は含まない）
- ユーザーIDは30人のダミーユーザープールからランダム割当（リプライは親と別ユーザー）
- バッチサイズ50件ずつREST APIで投入（サービスロールキー使用）

### 未来コメントの扱い
- `ThreadDetail.tsx` で `created_at <= now()` フィルタ済み → 一般ユーザーに非表示
- 実ユーザーがコメント投稿時、`comments_count` は全過去コメントを再カウントするため整合性OK
- 時間経過でカウントがずれる問題は `scripts/update_visible_counts.py` を定期実行で対応

### parent_idの注意点（CSV作成時）
コメントCSVで「質問→回答」の会話チェーンを作る際、以下のパターンに注意：

```
A(#24): 「食後血糖が180超えた」       ← 元の発言
B(#25): 「何食べましたか？」           ← Aへの質問（reply_to: 24）
C(#26): 「カレーライス…」             ← Aの回答（reply_to: 24 が正しい ※25ではない）
```

**回答者（C）のリプライ先は、質問者（B）ではなく元の発言者（A）にすること。**
Bの質問番号をreply_toに入れてしまうミスが頻発するため要注意。

### 進捗管理
- `Claude ai共有フォルダ/dlife_threads_88.md` で全88スレッドの進捗管理
- 完了済み: No.10〜14（5/88） ※No.1〜9, No.11は初期データとして投入済み

### 関連スクリプト
| ファイル | 用途 |
|---------|------|
| `scripts/insert_comments_noXX.py` | 各スレッドのコメント投入 |
| `scripts/fix_parent_ids.py` | No.10〜14のparent_id修正（26件） |
| `scripts/fix_parent_ids_1to9.py` | No.1,7のparent_id修正（14件） |
| `scripts/update_visible_counts.py` | 未来コメント可視化時のカウント更新（定期実行用） |
| `scripts/check_parent_ids_1to9.py` | parent_idの問題検出ツール |

---

## 注意事項
- サービスロールキーは機密情報です
- デプロイ前に必ずローカルで動作確認すること
- 医療関連コンテンツのため、情報の正確性に注意

---

最終更新: 2026年1月28日
