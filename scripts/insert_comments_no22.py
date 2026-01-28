#!/usr/bin/env python3
"""Insert 80 comments for thread No.22: 外食時の血糖値対策
reply_to kept as original CSV. user_id logic: when B asks A a question (？),
C's answer gets A's user_id.
"""

import uuid
import json
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

THREAD_ID = "e2491a37-4412-421f-9d9c-d371e67451c6"
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
    "b0000001-0000-0000-0000-000000000016",
    "b0000001-0000-0000-0000-000000000017",
    "b0000001-0000-0000-0000-000000000018",
    "b0000001-0000-0000-0000-000000000019",
    "b0000001-0000-0000-0000-000000000020",
    "f0000001-0000-0000-0000-000000000001",
    "f0000001-0000-0000-0000-000000000002",
    "f0000001-0000-0000-0000-000000000003",
    "f0000001-0000-0000-0000-000000000004",
    "f0000001-0000-0000-0000-000000000005",
    "f0000001-0000-0000-0000-000000000006",
    "f0000001-0000-0000-0000-000000000008",
    "f0000001-0000-0000-0000-000000000009",
    "f0000001-0000-0000-0000-000000000010",
    THREAD_OWNER_ID,
]

COMMENTS = [
    (2, None, "外食する時どうしてますか？糖質量わからなくて困る", "2025-12-16 12:30"),
    (3, 2, "私はご飯少なめでお願いしてます", "2025-12-16 13:00"),
    (4, 2, "サラダから食べるようにしてます。食べ順大事", "2025-12-16 18:30"),
    (5, None, "ファミレスは栄養成分表示あるから助かる", "2025-12-16 19:30"),
    (6, 5, "ガストとかサイゼリヤはアプリで見れますよね", "2025-12-16 20:00"),
    (7, None, "居酒屋が一番困る。何が入ってるかわからない", "2025-12-17 12:00"),
    (8, 7, "焼き鳥（塩）とか刺身とか選んでます", "2025-12-17 12:45"),
    (9, 7, "枝豆と冷奴は安心して食べられる", "2025-12-17 19:00"),
    (10, None, "ラーメン食べたい時どうしてますか？", "2025-12-17 20:00"),
    (11, 10, "麺半分にしてもらってます", "2025-12-17 20:30"),
    (12, 10, "低糖質麺に変更できる店を探して行ってます", "2025-12-17 21:00"),
    (13, 12, "どこのお店ですか？", "2025-12-18 08:00"),
    (14, 13, "一風堂とかで糖質オフ麺選べますよ", "2025-12-18 10:00"),
    (15, None, "回転寿司は何皿までOKにしてますか？", "2025-12-18 12:30"),
    (16, 15, "5皿までって決めてます。あとは茶碗蒸しとか汁物", "2025-12-18 13:00"),
    (17, 15, "シャリ少なめにできる店もありますよ", "2025-12-18 19:00"),
    (18, 17, "くら寿司のシャリハーフいいですよね", "2025-12-18 19:30"),
    (19, None, "牛丼屋はどうしてますか？", "2025-12-18 20:30"),
    (20, 19, "吉野家のライザップ牛サラダ食べてます", "2025-12-18 21:00"),
    (21, 19, "すき家の牛丼ライトはご飯の代わりに豆腐", "2025-12-19 07:30"),
    (22, 21, "それ知らなかった！今度試してみます", "2025-12-19 08:30"),
    (23, None, "外食前にサラダ食べてから行くようにしてる", "2025-12-19 12:00"),
    (24, 23, "ベジファーストですね。私もやってます", "2025-12-19 12:30"),
    (25, None, "焼肉は意外と血糖値上がりにくい", "2025-12-19 19:00"),
    (26, 25, "タレより塩の方がいいですよね", "2025-12-19 19:30"),
    (27, 25, "ご飯頼まなければ結構安心して食べられる", "2025-12-19 20:30"),
    (28, None, "イタリアンでパスタ食べたい時どうしてますか？", "2025-12-20 12:00"),
    (29, 28, "ピザよりパスタの方がまだマシかなと思って食べてる", "2025-12-20 13:00"),
    (30, 28, "前菜とメインだけにしてパスタは我慢してます", "2025-12-20 18:00"),
    (31, 29, "パスタはGI値低めだから血糖値の上がり方ゆるやかですよね", "2025-12-20 19:00"),
    (32, None, "定食屋でご飯の量どうしてますか？", "2025-12-20 20:00"),
    (33, 32, "小盛りか半分残してます", "2025-12-20 20:30"),
    (34, 32, "大戸屋は五穀米に変更できるからおすすめ", "2025-12-20 21:00"),
    (35, None, "忘年会シーズン、外食増えて大変", "2025-12-21 12:00"),
    (36, 35, "コース料理だと調整難しいですよね", "2025-12-21 13:00"),
    (37, 35, "〆のご飯ものはパスするようにしてます", "2025-12-21 18:00"),
    (38, None, "カフェでケーキ食べたい時どうしてますか", "2025-12-21 15:00"),
    (39, 38, "友達とシェアして半分だけ食べてます", "2025-12-21 16:00"),
    (40, 38, "スタバの低糖質スイーツ選んでます", "2025-12-21 19:00"),
    (41, 39, "シェアいいですね！罪悪感も半分笑", "2025-12-21 20:00"),
    (42, None, "外食後に歩くようにしてる", "2025-12-22 12:30"),
    (43, 42, "食後のウォーキング効果ありますよね", "2025-12-22 13:00"),
    (44, None, "ファストフードは避けてますか？", "2025-12-22 19:00"),
    (45, 44, "マックはバンズ抜きで注文できるって聞いた", "2025-12-22 19:30"),
    (46, 44, "モスの菜摘（なつみ）はバンズがレタスだから糖質低い", "2025-12-22 20:30"),
    (47, 46, "モスの菜摘おいしいですよね！よく食べます", "2025-12-22 21:00"),
    (48, None, "クリスマスディナー何食べました？", "2025-12-25 20:00"),
    (49, 48, "チキンとサラダ中心にしました。ケーキは一口だけ", "2025-12-25 20:30"),
    (50, 48, "シャトレーゼの糖質オフケーキ買いました", "2025-12-25 21:00"),
    (51, None, "中華料理は糖質高いの多いですよね", "2025-12-26 12:00"),
    (52, 51, "あんかけ系とチャーハンは避けてます", "2025-12-26 12:30"),
    (53, 51, "青椒肉絲とか野菜炒め系は比較的安心", "2025-12-26 19:00"),
    (54, None, "年末年始の外食どうしますか？", "2025-12-27 18:00"),
    (55, 54, "実家で食べることが多いから、量だけ気をつける予定", "2025-12-27 19:00"),
    (56, 54, "正月は諦めてる…1月の検査が怖い", "2025-12-27 20:30"),
    (57, None, "そばは血糖値上がりにくいって本当？", "2025-12-28 12:00"),
    (58, 57, "うどんよりはマシだけど、量によりますね", "2025-12-28 13:00"),
    (59, 57, "十割そばならGI値低めです", "2025-12-28 18:00"),
    (60, None, "年越しそばは食べますか？", "2025-12-28 18:00"),
    (61, 60, "少量だけ食べます。縁起物だし", "2025-12-31 19:00"),
    (62, 60, "糖質ゼロ麺で代用します", "2025-12-31 20:00"),
    (63, None, "あけおめ！お正月の外食どうでしたか", "2026-01-01 12:00"),
    (64, 63, "おせちは意外と糖質高いの多かった…", "2026-01-01 13:00"),
    (65, 63, "お雑煮の餅を1個だけにして我慢しました", "2026-01-01 18:00"),
    (66, None, "正月太りで外食控えないと", "2026-01-03 12:00"),
    (67, 66, "私も2kg増えた…自炊頑張ります", "2026-01-03 13:00"),
    (68, None, "外食の時、血糖測定器持っていきますか？", "2026-01-04 19:00"),
    (69, 68, "リブレだから常に測れてます", "2026-01-04 19:30"),
    (70, 68, "外では測らないですね。帰宅後に測ってます", "2026-01-04 20:30"),
    (71, None, "外食でおすすめのチェーン店ありますか？", "2026-01-05 12:00"),
    (72, 71, "サイゼリヤはコスパ良くて糖質調整しやすい", "2026-01-05 12:30"),
    (73, 71, "いきなりステーキはご飯なしでいける", "2026-01-05 18:00"),
    (74, 72, "サイゼリヤのサラダとチキン最強ですよね", "2026-01-05 19:00"),
    (75, None, "このスレ見て外食の選択肢増えた", "2026-01-06 12:00"),
    (76, 75, "みんなの知恵が集まって助かりますよね", "2026-01-06 12:30"),
    (77, None, "外食も工夫次第で楽しめるってわかった", "2026-01-06 19:00"),
    (78, 77, "我慢しすぎず上手に付き合いたいですよね", "2026-01-06 20:00"),
    (79, None, "また新しい情報あったら共有します", "2026-01-07 12:00"),
    (80, 79, "よろしくお願いします！", "2026-01-07 12:30"),
    (81, None, "外食楽しみながらコントロール頑張ろう", "2026-01-07 19:00"),
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
        if reply_to and reply_to in reply_map:
            B_num = reply_to
            A_num = reply_map[B_num]
            B_body = body_map.get(B_num, "")
            if A_num and "？" in B_body and A_num in user_map:
                user_map[num] = user_map[A_num]
                continue

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
    print(f"Processing {len(COMMENTS)} comments for thread No.22")
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
