#!/usr/bin/env python3
"""Insert 55 comments for thread No.24: 通院頻度どのくらい？
reply_to kept as original CSV. user_id logic:
1. Duration-keyword comments get a user whose illness_duration matches.
2. When B asks A a question (？), C's answer gets A's user_id.
"""

import uuid
import json
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

THREAD_ID = "2ffbf01d-9fff-4c12-98fe-dda589234191"
THREAD_OWNER_ID = "2033ee1c-28b2-5187-8ba1-c94f7964e33e"

USERS = [
    "b0000001-0000-0000-0000-000000000001",  # よっしー    1_to_3
    "b0000001-0000-0000-0000-000000000002",  # まゆみ      less_than_1
    "b0000001-0000-0000-0000-000000000003",  # たけし      less_than_1
    "b0000001-0000-0000-0000-000000000004",  # さちこ      3_to_5
    "b0000001-0000-0000-0000-000000000005",  # こうた      less_than_1
    "b0000001-0000-0000-0000-000000000006",  # ゆかり      1_to_3
    "b0000001-0000-0000-0000-000000000007",  # まさひろ    1_to_3
    "b0000001-0000-0000-0000-000000000008",  # ともこ      less_than_1
    "b0000001-0000-0000-0000-000000000009",  # しんじ      5_to_10
    "b0000001-0000-0000-0000-000000000010",  # ひろみ      3_to_5
    "b0000001-0000-0000-0000-000000000011",  # だいすけ    5_to_10
    "b0000001-0000-0000-0000-000000000012",  # あけみ      1_to_3
    "b0000001-0000-0000-0000-000000000013",  # けんた      less_than_1
    "b0000001-0000-0000-0000-000000000014",  # みちこ      1_to_3
    "b0000001-0000-0000-0000-000000000015",  # りょうた    10_plus
    "b0000001-0000-0000-0000-000000000016",  # なおこ      less_than_1
    "b0000001-0000-0000-0000-000000000017",  # てつや      10_plus
    "b0000001-0000-0000-0000-000000000018",  # かずえ      3_to_5
    "b0000001-0000-0000-0000-000000000019",  # ゆうや      10_plus
    "b0000001-0000-0000-0000-000000000020",  # れいこ      1_to_3
    "f0000001-0000-0000-0000-000000000001",  # みーママ    family
    "f0000001-0000-0000-0000-000000000002",  # ケンパパ    family
    "f0000001-0000-0000-0000-000000000003",  # さくら🌸    family
    "f0000001-0000-0000-0000-000000000004",  # たっくん父  family
    "f0000001-0000-0000-0000-000000000005",  # ゆうこ      family
    "f0000001-0000-0000-0000-000000000006",  # けんじ      family
    "f0000001-0000-0000-0000-000000000008",  # まさお      family
    "f0000001-0000-0000-0000-000000000009",  # ひなの      family
    "f0000001-0000-0000-0000-000000000010",  # としき      family
    THREAD_OWNER_ID,                          # Ash        5_to_10
]

USER_DURATION = {
    "b0000001-0000-0000-0000-000000000001": "1_to_3",
    "b0000001-0000-0000-0000-000000000002": "less_than_1",
    "b0000001-0000-0000-0000-000000000003": "less_than_1",
    "b0000001-0000-0000-0000-000000000004": "3_to_5",
    "b0000001-0000-0000-0000-000000000005": "less_than_1",
    "b0000001-0000-0000-0000-000000000006": "1_to_3",
    "b0000001-0000-0000-0000-000000000007": "1_to_3",
    "b0000001-0000-0000-0000-000000000008": "less_than_1",
    "b0000001-0000-0000-0000-000000000009": "5_to_10",
    "b0000001-0000-0000-0000-000000000010": "3_to_5",
    "b0000001-0000-0000-0000-000000000011": "5_to_10",
    "b0000001-0000-0000-0000-000000000012": "1_to_3",
    "b0000001-0000-0000-0000-000000000013": "less_than_1",
    "b0000001-0000-0000-0000-000000000014": "1_to_3",
    "b0000001-0000-0000-0000-000000000015": "10_plus",
    "b0000001-0000-0000-0000-000000000016": "less_than_1",
    "b0000001-0000-0000-0000-000000000017": "10_plus",
    "b0000001-0000-0000-0000-000000000018": "3_to_5",
    "b0000001-0000-0000-0000-000000000019": "10_plus",
    "b0000001-0000-0000-0000-000000000020": "1_to_3",
    THREAD_OWNER_ID: "5_to_10",
}

USERS_BY_DURATION = {
    "less_than_1": [u for u in USERS if USER_DURATION.get(u) == "less_than_1"],
    "1_to_3":      [u for u in USERS if USER_DURATION.get(u) == "1_to_3"],
    "3_to_5":      [u for u in USERS if USER_DURATION.get(u) == "3_to_5"],
    "5_to_10":     [u for u in USERS if USER_DURATION.get(u) == "5_to_10"],
    "10_plus":     [u for u in USERS if USER_DURATION.get(u) == "10_plus"],
}

DURATION_KEYWORDS = [
    ("10_plus",     ["10年以上", "15年", "20年", "30年", "10年選手"]),
    ("5_to_10",     ["5年以上", "7年", "8年", "9年", "6年", "診断されて5年", "診断されて6年", "診断されて7年", "診断されて8年"]),
    ("3_to_5",      ["4年目", "5年目", "4年経", "5年経", "診断されて4年"]),
    ("1_to_3",      ["2年目", "3年目", "2年経", "3年経", "診断されて2年", "診断されて3年", "診断されて1年"]),
    ("less_than_1", ["1年未満", "半年", "最近診断", "診断されたばかり", "診断されて数ヶ月"]),
]


def detect_duration(body):
    for category, keywords in DURATION_KEYWORDS:
        for kw in keywords:
            if kw in body:
                return category
    return None


COMMENTS = [
    (2, None, "みなさん通院どのくらいの頻度で行ってますか？", "2025-12-16 19:00"),
    (3, 2, "月1回です。薬もらうついでに", "2025-12-16 19:30"),
    (4, 2, "2ヶ月に1回です。安定してるから", "2025-12-16 20:00"),
    (5, None, "診断されたばかりの頃は2週間に1回だった", "2025-12-16 21:00"),
    (6, 5, "最初は頻繁ですよね。私も最初は月2回でした", "2025-12-17 08:00"),
    (7, None, "3ヶ月に1回の人いますか？", "2025-12-17 12:00"),
    (8, 7, "はい、HbA1c安定してるから3ヶ月ごとになりました", "2025-12-17 13:00"),
    (9, 7, "私もです。10年以上通ってやっと3ヶ月になった", "2025-12-17 19:00"),
    (10, None, "通院日って仕事休んでますか？", "2025-12-17 20:00"),
    (11, 10, "土曜日にやってる病院に変えました", "2025-12-17 20:30"),
    (12, 10, "有給使ってます。月1だから仕方ない", "2025-12-17 21:30"),
    (13, None, "通院費って月どのくらいかかりますか？", "2025-12-18 12:00"),
    (14, 13, "診察と薬で5000円くらいです", "2025-12-18 12:30"),
    (15, 13, "インスリン使ってるから8000円くらいかかる", "2025-12-18 19:00"),
    (16, 15, "インスリンは高いですよね…", "2025-12-18 19:30"),
    (17, None, "待ち時間が長くて辛い", "2025-12-18 20:30"),
    (18, 17, "予約制の病院に変えたら楽になりました", "2025-12-19 08:00"),
    (19, 17, "朝イチで行くようにしてます", "2025-12-19 12:00"),
    (20, None, "眼科と歯科も定期的に行ってますか？", "2025-12-19 19:00"),
    (21, 20, "眼科は年1回、眼底検査してます", "2025-12-19 19:30"),
    (22, 20, "歯科は3ヶ月ごと。糖尿病だと歯周病なりやすいから", "2025-12-19 20:30"),
    (23, 21, "眼科大事ですよね。私も診断されて2年目から行き始めた", "2025-12-19 21:00"),
    (24, None, "通院サボったことある人いますか？", "2025-12-20 14:00"),
    (25, 24, "正直あります…忙しくて3ヶ月空いちゃった", "2025-12-20 15:00"),
    (26, 24, "サボると余計悪化するから頑張って行ってます", "2025-12-20 19:00"),
    (27, 25, "先生に怒られませんでした？", "2025-12-20 20:00"),
    (28, 27, "注意されましたけど、来てくれて良かったって言われました", "2025-12-20 21:00"),
    (29, None, "年末年始は病院休みだから早めに行かないと", "2025-12-21 14:00"),
    (30, 29, "私は先週行ってきました。薬も多めにもらった", "2025-12-21 15:00"),
    (31, 29, "忘れてた！明日行かなきゃ", "2025-12-21 19:00"),
    (32, None, "オンライン診療使ってる人いますか？", "2025-12-22 12:00"),
    (33, 32, "コロナ禍から使ってます。便利ですよ", "2025-12-22 13:00"),
    (34, 32, "血液検査がある時は行かないとだけど、薬だけの時はオンラインにしてます", "2025-12-22 19:00"),
    (35, 33, "どこのサービス使ってますか？", "2025-12-22 20:00"),
    (36, 35, "病院が独自でやってるシステムです。アプリでビデオ通話する感じ", "2025-12-22 21:00"),
    (37, None, "主治医との相性って大事ですよね", "2025-12-23 14:00"),
    (38, 37, "合わなくて病院変えたことあります", "2025-12-23 15:00"),
    (39, 37, "話しやすい先生だと通院も苦じゃない", "2025-12-23 19:00"),
    (40, None, "検査の日って朝ごはん食べていいの？", "2025-12-24 08:00"),
    (41, 40, "空腹時血糖測る時は抜いてくださいって言われてます", "2025-12-24 09:00"),
    (42, 40, "私の病院は食後でもOKって言われた。HbA1cメインだから", "2025-12-24 12:00"),
    (43, None, "年明け最初の通院いつですか？", "2025-12-27 19:00"),
    (44, 43, "1月6日です。正月の結果が怖い", "2025-12-27 19:30"),
    (45, 43, "1月中旬。ちょっと間空くから心配", "2025-12-27 20:30"),
    (46, None, "通院歴長い人、病院変えたことありますか？", "2025-12-28 14:00"),
    (47, 46, "引っ越しで変えました。紹介状書いてもらった", "2025-12-28 15:00"),
    (48, 46, "10年以上同じ病院です。先生も変わらないし安心", "2025-12-28 19:00"),
    (49, None, "あけましておめでとう。今年も通院頑張ろう", "2026-01-01 10:00"),
    (50, 49, "あけおめ！健康第一で", "2026-01-01 11:00"),
    (51, None, "今年から糖尿病専門医のいる病院に変えようかな", "2026-01-03 14:00"),
    (52, 51, "専門医いると安心ですよね。治療の選択肢も増えるし", "2026-01-03 15:00"),
    (53, None, "通院って面倒だけど、サボると後で大変だから続けてる", "2026-01-05 19:00"),
    (54, 53, "継続が大事ですよね", "2026-01-05 19:30"),
    (55, None, "このスレ見て通院の大切さ再確認した", "2026-01-06 19:00"),
    (56, 55, "お互い頑張りましょう！", "2026-01-06 19:30"),
]


def jst_to_utc(jst_str):
    dt = datetime.strptime(jst_str, "%Y-%m-%d %H:%M")
    dt_utc = dt - timedelta(hours=9)
    return dt_utc.strftime("%Y-%m-%dT%H:%M:%S+00:00")


def assign_user_ids(comments):
    user_map = {}
    body_map = {}
    reply_map = {}
    for num, reply_to, body, dt in comments:
        body_map[num] = body
        reply_map[num] = reply_to

    dur_idx = {k: 0 for k in USERS_BY_DURATION}
    user_idx = 0

    for num, reply_to, body, dt in comments:
        # 1. Duration keyword match
        dur_cat = detect_duration(body)
        if dur_cat and USERS_BY_DURATION.get(dur_cat):
            group = USERS_BY_DURATION[dur_cat]
            idx = dur_idx[dur_cat] % len(group)
            candidate = group[idx]
            if reply_to and reply_to in user_map and candidate == user_map[reply_to]:
                dur_idx[dur_cat] += 1
                idx = dur_idx[dur_cat] % len(group)
                candidate = group[idx]
            user_map[num] = candidate
            dur_idx[dur_cat] += 1
            print(f"  #{num}: duration match ({dur_cat}) -> {candidate[-3:]}")
            continue

        # 2. A->B(？)->C pattern
        if reply_to and reply_to in reply_map:
            B_num = reply_to
            A_num = reply_map[B_num]
            B_body = body_map.get(B_num, "")
            if A_num and "？" in B_body and A_num in user_map:
                user_map[num] = user_map[A_num]
                print(f"  #{num}: question-answer -> same as #{A_num}")
                continue

        # 3. Normal assignment
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
    print(f"Processing {len(COMMENTS)} comments for thread No.24")
    print(f"Thread ID: {THREAD_ID}")
    print()

    comment_uuids = {}
    for num, _, _, _ in COMMENTS:
        comment_uuids[num] = str(uuid.uuid4())

    print("Assigning user IDs...")
    user_map = assign_user_ids(COMMENTS)
    print()

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
