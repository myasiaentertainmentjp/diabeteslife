#!/usr/bin/env python3
"""Insert 100 comments for thread No.18: 薬の副作用について語ろう
v2: reply_to kept as original CSV. user_id logic updated so that
when B asks A a question (？), C's answer gets A's user_id.
"""

import uuid
import json
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

THREAD_ID = "dfeb6b8f-4414-4cf7-8567-5024cad6e463"
THREAD_OWNER_ID = "2033ee1c-28b2-5187-8ba1-c94f7964e33e"

USERS = [
    "b0000001-0000-0000-0000-000000000001",
    "b0000001-0000-0000-0000-000000000002",
    "b0000001-0000-0000-0000-000000000003",
    "b0000001-0000-0000-0000-000000000004",
    "b0000001-0000-0000-0000-000000000005",
    "b0000001-0000-0000-0000-000000000006",
    "b0000001-0000-0000-0000-000000000007",
    "b0000001-0000-0000-0000-000000000008",
    "b0000001-0000-0000-0000-000000000009",
    "b0000001-0000-0000-0000-000000000010",
    "b0000001-0000-0000-0000-000000000011",
    "b0000001-0000-0000-0000-000000000012",
    "b0000001-0000-0000-0000-000000000013",
    "b0000001-0000-0000-0000-000000000014",
    "b0000001-0000-0000-0000-000000000015",
    "f0000001-0000-0000-0000-000000000001",
    "f0000001-0000-0000-0000-000000000002",
    "f0000001-0000-0000-0000-000000000005",
    "f0000001-0000-0000-0000-000000000006",
    "f0000001-0000-0000-0000-000000000009",
    "f0000001-0000-0000-0000-000000000010",
    "f0000001-0000-0000-0000-000000000008",
    "f0000001-0000-0000-0000-000000000003",
    "f0000001-0000-0000-0000-000000000004",
    "b0000001-0000-0000-0000-000000000016",
    "b0000001-0000-0000-0000-000000000017",
    "b0000001-0000-0000-0000-000000000018",
    "b0000001-0000-0000-0000-000000000019",
    "b0000001-0000-0000-0000-000000000020",
    THREAD_OWNER_ID,
]

# reply_to values are original CSV (no modifications)
COMMENTS = [
    (2, None, "メトホルミン飲み始めて1週間、お腹ゆるくなりませんか？", "2025-12-16 19:00"),
    (3, None, "私もメトホルミン飲んでます。最初は下痢がひどかった", "2025-12-16 19:45"),
    (4, 2, "私も最初そうでした！1ヶ月くらいで落ち着きましたよ", "2025-12-16 20:30"),
    (5, None, "SGLT2阻害薬飲んでる人いますか？トイレ近くなりすぎて困る", "2025-12-16 21:15"),
    (6, 4, "そうなんですね！もう少し様子見てみます。ありがとうございます", "2025-12-16 21:30"),
    (7, 5, "フォシーガ飲んでます。確かにトイレ近い…", "2025-12-17 08:30"),
    (8, None, "GLP-1始めたら吐き気がすごい", "2025-12-17 12:00"),
    (9, 3, "どのくらいで落ち着きましたか？", "2025-12-17 14:00"),
    (10, 8, "リベルサス？オゼンピック？", "2025-12-17 15:30"),
    (11, 9, "2〜3週間で徐々にマシになりました", "2025-12-17 18:00"),
    (12, 10, "リベルサスです。朝飲むと昼まで気持ち悪い…", "2025-12-17 19:00"),
    (13, None, "SU剤飲んでる方、低血糖なりませんか？", "2025-12-17 20:30"),
    (14, 5, "私もジャディアンスで同じです。夜中に3回くらい起きる", "2025-12-17 21:00"),
    (15, None, "メトホルミンの下痢、食後に飲むようにしたらマシになった", "2025-12-18 10:00"),
    (16, 13, "グリメピリド飲んでます。食事抜くと低血糖なることある", "2025-12-18 12:30"),
    (17, 12, "リベルサスの吐き気、私は1ヶ月くらいで慣れましたよ", "2025-12-18 14:00"),
    (18, None, "インスリン打ち始めてから体重増えた人いますか？", "2025-12-18 19:30"),
    (19, 14, "夜中のトイレ辛いですよね…寝不足になる", "2025-12-18 20:00"),
    (20, 18, "私も5kg増えました…インスリンあるあるらしいです", "2025-12-18 21:30"),
    (21, None, "DPP-4阻害薬は副作用少ない印象", "2025-12-19 09:00"),
    (22, 16, "ブドウ糖持ち歩いてますか？", "2025-12-19 10:30"),
    (23, 17, "1ヶ月…長いですね。でも希望持てました。ありがとう", "2025-12-19 12:00"),
    (24, 22, "はい、常にカバンに入れてます。100均のケースに小分けして", "2025-12-19 14:00"),
    (25, None, "トルリシティの注射、痛くないですか？", "2025-12-19 19:00"),
    (26, 21, "ジャヌビア飲んでるけど確かに副作用感じない", "2025-12-19 20:30"),
    (27, 18, "インスリンで太るの怖くて抵抗あったけど、血糖コントロール優先した", "2025-12-19 21:00"),
    (28, 25, "最初怖かったけど、針細いからほぼ痛くないですよ", "2025-12-20 08:00"),
    (29, None, "メトホルミンで金属っぽい味がする時ある", "2025-12-20 12:00"),
    (30, 28, "そうなんですね！来週から始まるので安心しました", "2025-12-20 14:00"),
    (31, 29, "それ乳酸アシドーシスの前兆かもしれないから先生に相談した方がいいかも", "2025-12-20 15:30"),
    (32, None, "フォシーガで膀胱炎になりやすくなった気がする", "2025-12-20 19:00"),
    (33, 31, "え、そうなんですか？次の診察で聞いてみます", "2025-12-20 20:00"),
    (34, 32, "SGLT2阻害薬は尿路感染症のリスクあるみたいですね", "2025-12-20 21:30"),
    (35, None, "年末年始、薬飲み忘れそうで怖い", "2025-12-21 10:00"),
    (36, 35, "アラームセットしてます！毎日同じ時間に鳴るように", "2025-12-21 10:30"),
    (37, None, "エクア飲んでる人いますか？便秘になりませんか", "2025-12-21 14:00"),
    (38, 34, "水分たくさん取るようにしてます。予防のため", "2025-12-21 15:00"),
    (39, 37, "エクア飲んでます！確かに便秘気味かも…気づかなかった", "2025-12-21 19:00"),
    (40, None, "オゼンピック始めて食欲なさすぎて逆に心配", "2025-12-22 09:30"),
    (41, 39, "やっぱりそうですよね。食物繊維意識して取るようにしてます", "2025-12-22 11:00"),
    (42, 40, "それGLP-1の効果ですね。でも極端に食べられないなら相談した方がいいかも", "2025-12-22 12:30"),
    (43, None, "ボグリボース飲むとお腹張る…", "2025-12-22 19:00"),
    (44, 40, "私も最初そうでした。少量ずつでも食べるようにしてたら慣れました", "2025-12-22 20:30"),
    (45, 43, "αグルコシダーゼ阻害薬はガス溜まりやすいですよね", "2025-12-22 21:00"),
    (46, None, "メトホルミンとSGLT2の併用で副作用倍増した感じ", "2025-12-23 10:00"),
    (47, 44, "ありがとうございます。少しずつ食べるようにしてみます", "2025-12-23 11:30"),
    (48, 46, "併用はキツイですよね…私も最初大変だった", "2025-12-23 14:00"),
    (49, None, "薬変えてもらうのってアリですか？副作用辛くて", "2025-12-23 19:30"),
    (50, 49, "全然アリですよ！我慢しないで先生に相談した方がいい", "2025-12-23 20:00"),
    (51, 49, "私も2回変えてもらいました。合う薬見つかるまで試行錯誤", "2025-12-23 21:00"),
    (52, None, "インスリン打つところ、同じ場所ばかりだと硬くなる", "2025-12-24 12:00"),
    (53, 52, "リポハイパートロフィーってやつですよね。場所ローテーションした方がいいですよ", "2025-12-24 13:30"),
    (54, None, "年末年始の薬、余裕持って準備した", "2025-12-24 19:00"),
    (55, 53, "お腹だけじゃなくて太ももとかも使えるんですね。知らなかった", "2025-12-24 20:30"),
    (56, 55, "腕も使えますよ。看護師さんに相談してみてください", "2025-12-25 09:00"),
    (57, None, "リベルサスの飲み方難しい。起床後すぐ、水で、30分絶食…", "2025-12-25 11:00"),
    (58, 57, "わかる！コーヒー飲めないの辛い", "2025-12-25 12:30"),
    (59, None, "スーグラで体重減ったけど筋肉も落ちた気がする", "2025-12-25 19:00"),
    (60, 57, "私は目覚まし30分前にセットして、飲んでから二度寝してます笑", "2025-12-25 20:00"),
    (61, 60, "その手があった！真似させてもらいます", "2025-12-25 21:30"),
    (62, 59, "SGLT2で減るのは水分と糖だから、タンパク質しっかり取った方がいいですよ", "2025-12-26 10:00"),
    (63, None, "メトホルミンでビタミンB12不足になるって本当？", "2025-12-26 14:00"),
    (64, 62, "なるほど、プロテイン飲もうかな", "2025-12-26 15:30"),
    (65, 63, "長期服用だとリスクあるみたいですね。サプリで補ってます", "2025-12-26 19:00"),
    (66, None, "ピオグリタゾンでむくみがひどい", "2025-12-26 21:00"),
    (67, 65, "先生に相談したら検査してくれるかな？", "2025-12-27 09:30"),
    (68, 66, "TZD系はむくみ出やすいみたいですよね", "2025-12-27 11:00"),
    (69, 67, "言えば血液検査でB12測ってくれると思いますよ", "2025-12-27 14:00"),
    (70, None, "1型でポンプ使ってるけど、皮膚かぶれが悩み", "2025-12-27 19:30"),
    (71, 70, "テープの前に皮膚保護剤塗ると良いですよ", "2025-12-27 20:30"),
    (72, None, "お正月、薬飲んで食べすぎたら意味ないよね…", "2025-12-28 12:00"),
    (73, 71, "キャビロン使ってます？", "2025-12-28 14:00"),
    (74, 73, "そうです！キャビロンとスキンタック併用してます", "2025-12-28 15:30"),
    (75, 72, "薬に頼りすぎは良くないですよね…分かってるけど難しい", "2025-12-28 19:00"),
    (76, None, "ジャディアンスでケトアシドーシスになった人いる？", "2025-12-29 10:00"),
    (77, 76, "シックデイの時は飲まない方がいいって言われてます", "2025-12-29 11:30"),
    (78, None, "薬の副作用で仕事に支障出たことある人いますか", "2025-12-29 19:00"),
    (79, 78, "メトホルミン始めた時、お腹の調子悪くて会議中ヒヤヒヤした", "2025-12-29 19:45"),
    (80, 78, "SU剤で低血糖なって運転中に冷や汗出たことある。怖かった", "2025-12-29 21:00"),
    (81, None, "あけましておめでとうございます。今年も薬と上手に付き合いたい", "2026-01-01 10:00"),
    (82, 81, "あけおめです！お互い頑張りましょう", "2026-01-01 11:30"),
    (83, 80, "それ怖いですね…運転前は血糖値チェックしてますか？", "2026-01-01 14:00"),
    (84, 83, "今は乗る前に必ず測るようにしてます。100以下なら補食してから", "2026-01-01 16:00"),
    (85, None, "マンジャロ始めた人いますか？副作用どうですか", "2026-01-02 19:00"),
    (86, 85, "先月から始めました。吐き気はあるけどオゼンピックよりマシかも", "2026-01-02 20:30"),
    (87, None, "ツイミーグって新しい薬どうなんだろう", "2026-01-03 11:00"),
    (88, 86, "体重どのくらい減りましたか？", "2026-01-03 13:00"),
    (89, 88, "1ヶ月で3kg減りました。食欲減るのが大きいかな", "2026-01-03 15:30"),
    (90, 87, "イメグリミンですよね。まだ新しいから情報少ないかも", "2026-01-03 18:00"),
    (91, None, "薬代高くて辛い…ジェネリックある薬に変えてもらおうかな", "2026-01-04 19:00"),
    (92, 91, "メトホルミンはジェネリックあるから安いですよ", "2026-01-04 20:00"),
    (93, 91, "GLP-1系は高いですよね…月1万超える", "2026-01-04 21:30"),
    (94, None, "副作用で薬やめたいって思ったことある人いますか", "2026-01-05 14:00"),
    (95, 94, "何度もある…でも合併症のリスク考えると飲み続けるしかない", "2026-01-05 15:00"),
    (96, 94, "副作用辛いですよね。先生に正直に話して薬調整してもらうといいですよ", "2026-01-05 17:00"),
    (97, None, "このスレ見て自分だけじゃないって安心した", "2026-01-06 20:00"),
    (98, 97, "同じ悩み持ってる人いると心強いですよね", "2026-01-06 21:00"),
    (99, None, "副作用も含めて情報共有できるのありがたい", "2026-01-07 19:00"),
    (100, 99, "リアルじゃなかなか話せないからね", "2026-01-07 19:30"),
    (101, None, "先生に言いづらい副作用もここなら言える", "2026-01-07 20:30"),
]


def jst_to_utc(jst_str):
    dt = datetime.strptime(jst_str, "%Y-%m-%d %H:%M")
    dt_utc = dt - timedelta(hours=9)
    return dt_utc.strftime("%Y-%m-%dT%H:%M:%S+00:00")


def assign_user_ids(comments):
    """Assign user_ids with question-answer awareness.
    When B asks A a question (reply contains ？) and C replies to B,
    C gets A's user_id (the person who was asked answers).
    """
    user_map = {}
    body_map = {}
    reply_map = {}
    for num, reply_to, body, dt in comments:
        body_map[num] = body
        reply_map[num] = reply_to

    user_idx = 0
    for num, reply_to, body, dt in comments:
        # Check A→B(question)→C(answer) pattern
        if reply_to and reply_to in reply_map:
            B_num = reply_to
            A_num = reply_map[B_num]
            B_body = body_map.get(B_num, "")
            if A_num and "？" in B_body and A_num in user_map:
                user_map[num] = user_map[A_num]
                continue

        # Normal assignment: ensure different from parent
        if reply_to and reply_to in user_map:
            parent_user = user_map[reply_to]
            candidate = USERS[user_idx % len(USERS)]
            while candidate == parent_user:
                user_idx += 1
                candidate = USERS[user_idx % len(USERS)]
            user_map[num] = candidate
            user_idx += 1
        else:
            user_map[num] = USERS[user_idx % len(USERS)]
            user_idx += 1

    return user_map


def insert_batch(records, batch_num):
    url = f"{SUPABASE_URL}/rest/v1/comments"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    data = json.dumps(records).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  Batch {batch_num}: {resp.status} - {len(records)} records inserted")
            return True
    except urllib.error.HTTPError as e:
        print(f"  Batch {batch_num}: ERROR {e.code} - {e.read().decode()}")
        return False


def main():
    print(f"Processing {len(COMMENTS)} comments for thread No.18 (v2 - fixed)")
    print(f"Thread ID: {THREAD_ID}")

    comment_uuids = {}
    for num, _, _, _ in COMMENTS:
        comment_uuids[num] = str(uuid.uuid4())

    user_map = assign_user_ids(COMMENTS)

    records = []
    now_utc = datetime.now(timezone.utc)
    past_count = 0
    future_count = 0

    for num, reply_to, body, dt_jst in COMMENTS:
        utc_str = jst_to_utc(dt_jst)
        dt_obj = datetime.strptime(dt_jst, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))
        if dt_obj > now_utc:
            future_count += 1
        else:
            past_count += 1

        parent_id = comment_uuids[reply_to] if reply_to else None
        record = {
            "id": comment_uuids[num],
            "thread_id": THREAD_ID,
            "body": body,
            "user_id": user_map[num],
            "is_hidden": False,
            "created_at": utc_str,
            "parent_id": parent_id,
        }
        records.append(record)

    print(f"Past comments: {past_count}")
    print(f"Future comments: {future_count}")
    print(f"Total: {len(records)}")
    print()

    BATCH_SIZE = 50
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i+BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        if not insert_batch(batch, batch_num):
            print("STOPPING due to error")
            return

    print(f"\nAll {len(records)} comments inserted!")

    print(f"\nUpdating comments_count to {past_count}...")
    url = f"{SUPABASE_URL}/rest/v1/threads?id=eq.{THREAD_ID}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    data = json.dumps({"comments_count": past_count}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  Updated: {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"  ERROR: {e.code} - {e.read().decode()}")


if __name__ == "__main__":
    main()
