# D-Life コメント作成 引き継ぎドキュメント

作成日: 2026-01-27
最終更新: 2026-01-28

---

## 概要

糖尿病コミュニティサイト「D-Life」のダミーコメントを作成する作業。
Claude.ai と Claude Code で役割分担して進める。

---

## 役割分担

### Claude.ai がやること
1. **コメントCSV作成**
   - スレッド名とスレッドURLを受け取る
   - スレッド内容に合った自然なコメントを作成
   - リプライ番号付きでCSV形式で出力
   - 日時はJST（日本時間）で記載

2. **渡すもの**
   - `dlife_comments_xxx.csv` — コメントデータ（CSVファイル or テキスト）

### Claude Code がやること
1. **CSVを読み込む**
2. **user_id紐づけ** — 30人のbotユーザープール（下記参照）から3段階の優先度で割り当て
3. **UUID生成・parent_idマッピング**
4. **Supabase REST APIでコメント挿入**（バッチ50件ずつ）
5. **comments_count更新**（未来コメントを除外した件数）
6. **dlife_threads_88.md の進捗更新**

---

## 作業フロー

### 事前準備（Claude.ai 側）
以下の3ファイルをClaude.aiに事前に読み込ませておく：
1. `dlife_handover.md`（このファイル）
2. `dlife_users_154.csv`（ユーザー一覧）
3. `dlife_comments_xxx.csv`（既存の参考CSV、フォーマット確認用）

### 1スレッドのコメント作成フロー

1. **あなた → Claude.ai**: スレッド名とスレッドURLを送る
   - 例: 「【雑談】今日の血糖値どうだった？ https://diabeteslife.jp/threads/a0000001-1215-0001-0001-000000000001」
   - コメント件数はClaude.aiがスレッド内容に応じて自動判断（下記「コメント件数の目安」参照）
   - 件数を指定したい場合のみ明示すればOK
2. **Claude.ai**: スレッド内容に合った自然なコメントCSVを作成
3. **あなた → Claude Code**: CSVファイルを渡す（パスを伝える or テキスト貼り付け）
4. **Claude Code**: CSV読み込み → user_id紐づけ → REST API挿入 → comments_count更新
5. **確認**: サイトで表示確認

---

## ファイル一覧

### 共有フォルダ（Claude ai共有フォルダ/）
| ファイル名 | 内容 |
|-----------|------|
| `dlife_handover.md` | このドキュメント（作業ルール・接続情報） |
| `dlife_threads_88.md` | スレッド88件の一覧・進捗管理 |
| `dlife_users_154.csv` | ユーザー154人の情報（user_id, display_name, type, age, gender, treatment, duration, devices） |

### スクリプトフォルダ（デスクトップ/Dライフ/scripts/）
| ファイル名 | 内容 |
|-----------|------|
| `insert_comments_noXX.py` | スレッドごとの挿入スクリプト（v3テンプレート、No.1〜55作成済） |

---

## Supabase接続情報

```
Project ID: josanlblwfjdaaezqbnw
URL: https://josanlblwfjdaaezqbnw.supabase.co
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY
```

### データ操作方法
**REST API（推奨）** — `execute_comments.py` を使用、またはPythonで直接REST APIを叩く：
```python
import urllib.request, json

url = "https://josanlblwfjdaaezqbnw.supabase.co/rest/v1/comments"
headers = {
    "apikey": "[Service Role Key]",
    "Authorization": "Bearer [Service Role Key]",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}
data = json.dumps([...]).encode()
req = urllib.request.Request(url, data=data, headers=headers, method="POST")
urllib.request.urlopen(req)
```

**DDL/関数作成** — Supabase SQL Editorで直接実行（REST APIではDDL不可）

---

## コメントCSVフォーマット

```csv
thread_id,番号,リプライ先,本文,日時
a0000001-1215-0001-0001-000000000001,32,,朝イチ102だった。まあまあかな,2025-12-16 08:15
a0000001-1215-0001-0001-000000000001,33,,食後2時間で158…ちょっと高いな,2025-12-16 12:30
a0000001-1215-0001-0001-000000000001,34,33,158なら許容範囲じゃないですか？,2025-12-16 13:05
```

- **thread_id**: スレッドID（URLの末尾部分）
- **番号**: コメント番号（スレッド内での順番、1はスレッド本文なので2から開始）
- **リプライ先**: 空欄なら独立コメント、番号があればその番号への返信
- **本文**: コメント内容
- **日時**: JST（日本時間）で記載

※Claude Codeはthread_idからスレ主user_idを自動取得する（Supabase APIで照合）

---

## Claude Code 向け 処理ルール

### commentsテーブルスキーマ
```sql
INSERT INTO comments (id, thread_id, body, user_id, is_hidden, created_at, parent_id)
VALUES ('[uuid]', '[thread_id]', E'[本文]', '[user_id]', false, '[UTC日時]', '[parent_uuid or NULL]');
```
- **id**: Python uuid4()で事前生成
- **parent_id**: リプライ先がある場合、そのコメントのUUIDをセット（番号→UUID対応表を内部管理）
- **is_hidden**: 常にfalse

### 日時変換
- CSVの日時はJST
- DBに入れる時はUTCに変換（-9時間）
- 例: JST 2025-12-16 08:15 → UTC 2025-12-15 23:15:00+00

### 30人botユーザープール

スレッド全体のスレ主は Ash（`2033ee1c-28b2-5187-8ba1-c94f7964e33e`）。
コメント投稿者は以下30人のプールからラウンドロビンで割り当てる：

- **b-series（患者20人）**: b001〜b020
- **f-series（家族9人）**: f001〜f006, f008〜f010（f007を除く）
- **Ash**（スレ主）

### user_id紐づけルール（3段階の優先度）

**優先度1: 罹病歴キーワードマッチ**
コメント本文に罹病歴キーワードが含まれる場合、該当する罹病歴グループのユーザーを割り当てる。

| 罹病歴 (illness_duration) | キーワード例 | 該当ユーザー |
|--------------------------|------------|------------|
| 10_plus（10年以上） | 10年以上, 15年, 20年 | b015(りょうた), b017(てつや), b019(ゆうや) |
| 5_to_10（5〜10年） | 5年以上, 7年, 8年 | b009(しんじ), b011(だいすけ), Ash |
| 3_to_5（3〜5年） | 4年目, 5年目 | b004(さちこ), b010(ひろみ), b018(かずえ) |
| 1_to_3（1〜3年） | 2年目, 3年目, 診断されて1年 | b001(よっしー), b006(ゆかり), b007(まさひろ), b012(あけみ), b014(みちこ), b020(れいこ) |
| less_than_1（1年未満） | 診断されたばかり, 半年, 最近診断 | b002(まゆみ), b003(たけし), b005(こうた), b008(ともこ), b013(けんた), b016(なおこ) |

**優先度2: Q&A（質問→回答）パターン**
A→B（？付き質問）→C（回答）の場合、CにAと同じユーザーを割り当てる。
- 例: #8 A投稿 → #10 B「どこで買えますか？」→ #11 C回答 → #11はAと同じユーザー

**優先度3: 通常ラウンドロビン**
上記に該当しない場合、USERSリストを順番に割り当て。リプライ先と同一ユーザーにならないよう制御。

---

## ユーザー分類（154人）

| タイプ | 人数 |
|--------|------|
| 2型 | 93人 |
| 境界型 | 30人 |
| 1型 | 26人 |
| 妊娠糖尿病 | 5人 |

### 特殊条件ユーザー数（目安）
- リブレユーザー: 約25人
- Dexcomユーザー: 約15人
- インスリン治療: 約30人
- 1年未満: 約15人

---

## スレッド一覧

**→ `dlife_threads_88.md` を参照**（88件の全スレッド一覧・進捗管理）

※コメント0件のスレッドはフロント側で非表示にする

---

## 作業進捗

**→ `dlife_threads_88.md` を参照**（各スレッドのコメント数・状態を管理）

- **No.1〜55: 完了**（コメント挿入済み）
- **No.56〜88: 未作成**（スレッド作成済み、コメント待ち）
- Claude Codeがコメント挿入完了したら `dlife_threads_88.md` のコメント数と状態を更新する

---

## コメント件数の目安

Claude.aiがスレッド内容から自動判断する。指定がなければ以下を基準にする：

| スレッドの種類 | 件数目安 | 例 |
|--------------|---------|-----|
| 雑談・日常系（盛り上がりやすい） | 100〜200件 | 今日の血糖値、食事報告 |
| 相談・質問系 | 50〜100件 | 初心者質問、治療相談 |
| メンタル・悩み系 | 30〜80件 | 診断直後の不安、家族の悩み |
| ニッチ・専門系 | 20〜50件 | 特定デバイスの話題 |

※自然に見えることが最優先。件数が多ければいいわけではない
※1回のCSVで多すぎる場合は分割して渡してもOK

---

## コメント内容のルール

### 時間帯の分布（JST）
- 深夜 2〜6時: かなり少なめ（5%以下）
- 朝 7〜9時: 少なめ（10%）
- 昼 12〜13時: 多め（15%）
- 夜 19〜23時: 最も多い（40%）
- その他: 30%

### リプライ
- リプライ率: 20〜60%（平均40%）
- `>>番号` の形式で返信
- 返信内容は元コメントに合わせる

### 罹病歴キーワードの埋め込み（重要）
Claude Codeがuser_idを自動割り当てするため、各CSVに **3つの罹病歴コメント** を含めること：
1. **less_than_1**: 「診断されたばかり」「半年」「最近診断」等を含むコメント
2. **1_to_3 or 3_to_5**: 「2年目」「3年目」「4年目」等を含むコメント
3. **10_plus**: 「10年以上」等を含むコメント

これにより、Claude Codeが罹病歴に合ったユーザーを自動割り当てできる。

### Q&Aパターンの埋め込み（推奨）
以下のパターンを2〜4組含めると自然な会話になる：
- A（独立コメント）→ B（Aへのリプライ、「？」付き質問）→ C（Bへのリプライ、回答）
- Claude CodeがCにAと同じユーザーを自動割り当てする

### 自然さ
- 同じコメントの重複NG
- テンプレ感を避ける
- 絵文字は控えめ（😊✨💪🙏😭程度）

---

## 未来コメントについて

- created_atが未来の日時のコメントは、一般ユーザーには非表示
- 管理者（admin）には「予約」バッジ付きで表示される
- 時刻が到来すると自動的に一般ユーザーにも表示される
- comments_countは未来コメントを除外した数を保存する

---

## 注意事項

- thread_idは既存のものを使う（新規作成しない）
- user_idは必ず `dlife_users_154.csv` から選ぶ
- 日時はUTCで保存（JSTから-9時間）
- コメント削除してやり直す場合:
  ```sql
  DELETE FROM comments
  WHERE thread_id = '[thread_id]'
  AND created_at >= '[開始日時]';
  ```
- 挿入後はスクリプト内でcomments_countを自動更新（未来コメント除外）
