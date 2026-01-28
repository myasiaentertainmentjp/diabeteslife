#!/usr/bin/env python3
"""Insert 70 comments for thread No.20: メトホルミン飲んでる人いますか？
v2: reply_to kept as original CSV. user_id logic updated so that
when B asks A a question (？), C's answer gets A's user_id.
Uses only type2 diabetes users (20 users).
"""

import uuid
import json
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

THREAD_ID = "9dbba3dd-4470-4f55-bead-4b65006457c5"
THREAD_OWNER_ID = "2033ee1c-28b2-5187-8ba1-c94f7964e33e"

# Type2 users only (Ash + 19 batch2 type2 users)
USERS = [
    "b0000001-0000-0000-0000-000000000021",  # ゆうき
    "b0000001-0000-0000-0000-000000000023",  # そうた
    "b0000001-0000-0000-0000-000000000025",  # けんた
    "b0000001-0000-0000-0000-000000000027",  # たくや
    "b0000001-0000-0000-0000-000000000028",  # さくら
    "b0000001-0000-0000-0000-000000000029",  # こうへい
    "b0000001-0000-0000-0000-000000000030",  # なつみ
    "f0000001-0000-0000-0000-000000000011",  # りょう
    "f0000001-0000-0000-0000-000000000012",  # まいか
    "f0000001-0000-0000-0000-000000000015",  # だいき
    "f0000001-0000-0000-0000-000000000016",  # あおい
    "f0000001-0000-0000-0000-000000000017",  # ゆうた
    "f0000001-0000-0000-0000-000000000019",  # かいと
    "f0000001-0000-0000-0000-000000000020",  # のぞみ
    "f0000001-0000-0000-0000-000000000022",  # ちはる
    "f0000001-0000-0000-0000-000000000024",  # みずき
    "f0000001-0000-0000-0000-000000000025",  # しょうた
    "f0000001-0000-0000-0000-000000000026",  # ゆい
    "f0000001-0000-0000-0000-000000000027",  # はやと
    THREAD_OWNER_ID,  # Ash
]

# reply_to values are original CSV (no modifications)
COMMENTS = [
    (2, None, "メトホルミン飲み始めて2週間。お腹の調子どうですか？", "2025-12-16 19:00"),
    (3, 2, "最初1ヶ月はお腹ゆるかったです。今は落ち着きました", "2025-12-16 20:00"),
    (4, None, "メトホルミン500mg×2回飲んでます。みんな何mg？", "2025-12-16 21:00"),
    (5, 4, "私は250mg×3回です。少量から始めました", "2025-12-17 08:30"),
    (6, 3, "1ヶ月で落ち着くんですね。希望持てました", "2025-12-17 10:00"),
    (7, 4, "1000mg×2回です。MAXかも", "2025-12-17 12:30"),
    (8, None, "メトホルミンで体重減った人いますか？", "2025-12-17 19:00"),
    (9, 8, "3kg減りました。食欲抑制効果あるのかも", "2025-12-17 20:00"),
    (10, 8, "私は変わらなかった…個人差ありますね", "2025-12-17 21:30"),
    (11, None, "食後に飲むのと食前に飲むの、どっちがいいの？", "2025-12-18 09:00"),
    (12, 11, "私は食後って言われました。胃への負担軽減のため", "2025-12-18 10:30"),
    (13, 11, "食直後がベストらしいですよ。吸収が安定するとか", "2025-12-18 12:00"),
    (14, None, "メトホルミンの副作用で金属っぽい味する人いますか？", "2025-12-18 19:00"),
    (15, 14, "たまにあります！なんか鉄っぽい味", "2025-12-18 20:00"),
    (16, 14, "それ乳酸アシドーシスの前兆かもって聞いたことある。先生に相談した方がいいかも", "2025-12-18 21:00"),
    (17, 16, "そうなんですか？次の診察で聞いてみます", "2025-12-19 08:00"),
    (18, None, "メトホルミンってジェネリックある？薬代安くしたい", "2025-12-19 12:00"),
    (19, 18, "ありますよ！私はジェネリックにしてもらってます", "2025-12-19 14:00"),
    (20, 18, "メトグルコがジェネリックです。効果は同じ", "2025-12-19 15:30"),
    (21, 19, "ありがとうございます！次回から変えてもらいます", "2025-12-19 19:00"),
    (22, None, "メトホルミン飲んでるとビタミンB12不足になるって本当？", "2025-12-19 20:30"),
    (23, 22, "長期服用だとリスクあるみたいですね。サプリで補ってます", "2025-12-20 08:00"),
    (24, 22, "私は年1回血液検査でB12測ってもらってます", "2025-12-20 10:00"),
    (25, 23, "サプリ何使ってますか？", "2025-12-20 12:00"),
    (26, 25, "DHCのビタミンB群飲んでます。安いし", "2025-12-20 14:00"),
    (27, None, "メトホルミンとSGLT2の併用してる人いますか？", "2025-12-20 19:00"),
    (28, 27, "してます。メトホルミン＋フォシーガの組み合わせ", "2025-12-20 20:30"),
    (29, 27, "私も。最初はお腹とトイレのダブルパンチで大変だった笑", "2025-12-20 21:30"),
    (30, 28, "副作用どうですか？併用で辛くなりませんでした？", "2025-12-21 09:00"),
    (31, 30, "最初の2週間はキツかったけど今は大丈夫ですよ", "2025-12-21 11:00"),
    (32, None, "メトホルミン飲み忘れた時どうしてますか？", "2025-12-21 14:00"),
    (33, 32, "気づいた時に飲んでます。ただ次の服用時間近かったらスキップ", "2025-12-21 15:30"),
    (34, 32, "私は忘れたらその回はスキップって先生に言われました", "2025-12-21 17:00"),
    (35, None, "お酒飲む日はメトホルミンどうしてますか？", "2025-12-21 20:00"),
    (36, 35, "飲酒の日は飲まない方がいいって言われてます。乳酸アシドーシスのリスク", "2025-12-21 21:00"),
    (37, 35, "私は少量なら飲んでる…ダメなのかな", "2025-12-22 08:00"),
    (38, 36, "そうなんですね。年末年始は気をつけます", "2025-12-22 10:00"),
    (39, None, "メトホルミン飲んでからHbA1cどのくらい下がった？", "2025-12-22 19:00"),
    (40, 39, "3ヶ月で0.8%下がりました", "2025-12-22 20:00"),
    (41, 39, "私は半年で1.2%下がった。食事も頑張ったけど", "2025-12-22 21:30"),
    (42, None, "メトホルミンの徐放錠使ってる人いますか？", "2025-12-23 12:00"),
    (43, 42, "メトグルコ250mgMTってやつですか？", "2025-12-23 14:00"),
    (44, 42, "徐放錠にしてからお腹の調子良くなりました", "2025-12-23 16:00"),
    (45, 44, "そうなんですか！先生に相談してみようかな", "2025-12-23 19:00"),
    (46, None, "年末年始、メトホルミンの在庫確認した方がいいよ", "2025-12-24 10:00"),
    (47, 46, "確かに！病院休みだもんね。ありがとう", "2025-12-24 12:00"),
    (48, None, "メトホルミン1日何回飲んでますか？", "2025-12-25 19:00"),
    (49, 48, "朝夕の2回です", "2025-12-25 20:00"),
    (50, 48, "毎食後の3回です。量多いから分けてる", "2025-12-25 21:30"),
    (51, None, "メトホルミン飲んで何年目ですか？私は5年目", "2025-12-26 14:00"),
    (52, 51, "私は3年目です。ずっとメトホルミン一筋", "2025-12-26 15:30"),
    (53, 51, "8年目です。最初からずっと飲んでる", "2025-12-26 19:00"),
    (54, None, "造影剤使う検査の時メトホルミン止めるって言われた", "2025-12-27 11:00"),
    (55, 54, "CTとか造影MRIの前後は休薬必要ですよね", "2025-12-27 13:00"),
    (56, 54, "私も人間ドックの時止めました", "2025-12-27 15:00"),
    (57, None, "メトホルミンだけでコントロールできてる人いますか？", "2025-12-28 19:00"),
    (58, 57, "最初の2年はメトホルミンだけでいけてた。今は追加されたけど", "2025-12-28 20:30"),
    (59, 57, "私はメトホルミン＋食事療法でHbA1c 6.5%キープしてます", "2025-12-28 21:30"),
    (60, 59, "すごい！食事どんなこと気をつけてますか？", "2025-12-29 10:00"),
    (61, 60, "糖質を1食30g以下にしてます。あとは野菜から食べる", "2025-12-29 12:00"),
    (62, None, "あけましておめでとう。メトホルミン仲間のみんな今年もよろしく", "2026-01-01 10:00"),
    (63, 62, "あけおめ！今年も薬と仲良く付き合っていこう", "2026-01-01 11:30"),
    (64, None, "正月食べすぎてメトホルミンに頼りすぎてる感ある…", "2026-01-03 19:00"),
    (65, 64, "わかる…薬あるからって油断しちゃうよね", "2026-01-03 20:30"),
    (66, None, "メトホルミンって第一選択薬なんですよね。みんなそうなのかな", "2026-01-05 14:00"),
    (67, 66, "私も最初に処方されたのがメトホルミンでした", "2026-01-05 15:30"),
    (68, 66, "2型の基本薬みたいですね。歴史も長いし", "2026-01-05 17:00"),
    (69, None, "このスレ参考になる。メトホルミン仲間がいると心強い", "2026-01-06 19:00"),
    (70, 69, "同じ薬飲んでる人と情報交換できるのありがたい", "2026-01-06 20:00"),
    (71, None, "また副作用とか困ったことあったらここで相談させてください", "2026-01-07 19:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.20 (v2 - fixed)")
    print(f"Thread ID: {THREAD_ID}")
    print(f"Users pool: {len(USERS)} type2 users")

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
