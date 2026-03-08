#!/usr/bin/env python3
"""Insert 60 comments for thread No.23: 家族に糖尿病のこと話してる？
reply_to kept as original CSV. user_id logic:
1. When B asks A a question (？), C's answer gets A's user_id.
2. Duration-keyword comments get a user whose illness_duration matches.
"""

import uuid
import json
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

THREAD_ID = "63599061-f412-4a05-a8c1-89a0b4a24d81"
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
    "f0000001-0000-0000-0000-000000000001",  # みーママ    family(null)
    "f0000001-0000-0000-0000-000000000002",  # ケンパパ    family(null)
    "f0000001-0000-0000-0000-000000000003",  # さくら🌸    family(null)
    "f0000001-0000-0000-0000-000000000004",  # たっくん父  family(null)
    "f0000001-0000-0000-0000-000000000005",  # ゆうこ      family(null)
    "f0000001-0000-0000-0000-000000000006",  # けんじ      family(null)
    "f0000001-0000-0000-0000-000000000008",  # まさお      family(null)
    "f0000001-0000-0000-0000-000000000009",  # ひなの      family(null)
    "f0000001-0000-0000-0000-000000000010",  # としき      family(null)
    THREAD_OWNER_ID,                          # Ash        5_to_10
]

# illness_duration mapping for each user
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
    # f-series (family) have no illness_duration
}

# Users grouped by illness_duration for duration matching
USERS_BY_DURATION = {
    "less_than_1": [u for u in USERS if USER_DURATION.get(u) == "less_than_1"],
    "1_to_3":      [u for u in USERS if USER_DURATION.get(u) == "1_to_3"],
    "3_to_5":      [u for u in USERS if USER_DURATION.get(u) == "3_to_5"],
    "5_to_10":     [u for u in USERS if USER_DURATION.get(u) == "5_to_10"],
    "10_plus":     [u for u in USERS if USER_DURATION.get(u) == "10_plus"],
}

# Duration keyword patterns (order matters: check longer/more specific first)
DURATION_KEYWORDS = [
    ("10_plus",     ["10年以上", "15年", "20年", "30年", "10年選手"]),
    ("5_to_10",     ["5年以上", "7年", "8年", "9年", "6年", "診断されて5年", "診断されて6年", "診断されて7年", "診断されて8年"]),
    ("3_to_5",      ["4年目", "5年目", "4年経", "5年経", "診断されて4年", "診断されて5年"]),
    ("1_to_3",      ["2年目", "3年目", "2年経", "3年経", "診断されて2年", "診断されて3年", "診断されて1年"]),
    ("less_than_1", ["1年未満", "半年", "最近診断", "診断されたばかり", "診断されて数ヶ月"]),
]


def detect_duration(body):
    """Detect illness duration category from comment body. Returns category or None."""
    for category, keywords in DURATION_KEYWORDS:
        for kw in keywords:
            if kw in body:
                return category
    return None


COMMENTS = [
    (2, None, "家族に糖尿病のこと話してますか？なかなか言い出せなくて", "2025-12-16 19:00"),
    (3, 2, "私は両親には話してます。心配されるけど…", "2025-12-16 19:45"),
    (4, 2, "診断されたばかりの頃は言えなかった。半年くらいしてから話しました", "2025-12-16 20:30"),
    (5, None, "妻には話したけど子供には言ってない", "2025-12-16 21:30"),
    (6, 5, "お子さん何歳ですか？", "2025-12-17 08:00"),
    (7, 6, "小学生です。まだ理解できないかなと思って", "2025-12-17 12:00"),
    (8, None, "親に話したら「だから言ったでしょ」って責められた", "2025-12-17 19:00"),
    (9, 8, "それ辛いですね…自分も不摂生を責められました", "2025-12-17 19:30"),
    (10, 8, "病気になったのは自分のせいじゃないのに。気持ちわかります", "2025-12-17 20:30"),
    (11, None, "夫に話したら「俺の作る料理が悪いのか」って言われた", "2025-12-18 12:00"),
    (12, 11, "え、そういう反応されると困りますよね…", "2025-12-18 12:30"),
    (13, 11, "旦那さんに病気のこと理解してもらうの大事ですよね", "2025-12-18 19:00"),
    (14, None, "一人暮らしだから話す相手がいない", "2025-12-18 20:00"),
    (15, 14, "このコミュニティで話せますよ！", "2025-12-18 20:30"),
    (16, 14, "私も一人暮らしです。仲間がいると嬉しい", "2025-12-18 21:00"),
    (17, None, "兄弟には話してますか？", "2025-12-19 12:00"),
    (18, 17, "姉には話しました。遺伝もあるから気をつけてって", "2025-12-19 13:00"),
    (19, 17, "弟には言ってない。心配かけたくなくて", "2025-12-19 19:00"),
    (20, None, "10年以上経つけど、未だに親戚には言ってない", "2025-12-19 20:30"),
    (21, 20, "親戚は言わなくていいと思います。変に詮索されそう", "2025-12-19 21:00"),
    (22, None, "家族に話したらサポートしてくれるようになった", "2025-12-20 12:00"),
    (23, 22, "いい家族ですね。うちも話したら食事作りを手伝ってくれるようになった", "2025-12-20 13:00"),
    (24, 22, "羨ましい…うちは無関心", "2025-12-20 19:00"),
    (25, None, "最近診断されたんですが、親にどう切り出せばいいですか", "2025-12-20 20:00"),
    (26, 25, "正直に「健康診断で引っかかって」って話しました", "2025-12-20 20:30"),
    (27, 25, "私は診断されて2年経ってからやっと話せました。焦らなくていいと思います", "2025-12-20 21:30"),
    (28, None, "子供が大きくなったら遺伝のこと伝えないといけないかな", "2025-12-21 14:00"),
    (29, 28, "予防のためにも伝えた方がいいと思います", "2025-12-21 15:00"),
    (30, 28, "私は成人した子供に伝えました。健康診断ちゃんと受けてって", "2025-12-21 19:00"),
    (31, None, "義両親には絶対言いたくない", "2025-12-21 20:30"),
    (32, 31, "わかる…色々言われそうで", "2025-12-21 21:00"),
    (33, 31, "義実家は言わなくていいと思う。プライバシーだし", "2025-12-22 08:00"),
    (34, None, "年末年始、帰省して家族と食事するのが憂鬱", "2025-12-22 19:00"),
    (35, 34, "「ダイエット中」って言ってごまかしてます", "2025-12-22 19:30"),
    (36, 34, "食べろ食べろ攻撃がキツイですよね", "2025-12-22 20:30"),
    (37, None, "彼氏に言うべきか迷ってる", "2025-12-23 14:00"),
    (38, 37, "結婚を考えてるなら早めに話した方がいいかも", "2025-12-23 15:00"),
    (39, 37, "私は付き合って半年で話しました。理解してくれました", "2025-12-23 19:00"),
    (40, 38, "やっぱりそうですよね。勇気出して話してみます", "2025-12-23 20:00"),
    (41, None, "家族が過干渉で困ってる。食事の度に「それ食べていいの？」って", "2025-12-24 12:00"),
    (42, 41, "心配からだと思うけど、毎回言われるとキツイですよね", "2025-12-24 13:00"),
    (43, 41, "「自分で管理してるから大丈夫」って伝えてみては？", "2025-12-24 19:00"),
    (44, 43, "そうですね、ちゃんと話してみます", "2025-12-24 20:00"),
    (45, None, "診断されて3年目、やっと家族に受け入れられた気がする", "2025-12-25 19:00"),
    (46, 45, "時間かかりますよね。うちも最初は大変だった", "2025-12-25 20:00"),
    (47, None, "親が先に糖尿病だから、話しやすかった", "2025-12-26 14:00"),
    (48, 47, "同じ病気だと理解してもらいやすいですよね", "2025-12-26 15:00"),
    (49, None, "家族に隠してるストレスも血糖値に悪そう", "2025-12-27 19:00"),
    (50, 49, "確かに。秘密にしてると気疲れしますよね", "2025-12-27 19:30"),
    (51, None, "お正月、親戚に「痩せた？」って聞かれるの怖い", "2025-12-28 19:00"),
    (52, 51, "「健康のために」って言っとけば大丈夫", "2025-12-28 20:00"),
    (53, None, "家族の理解があると治療も続けやすい", "2025-12-29 14:00"),
    (54, 53, "本当にそう思います。一人で抱え込まない方がいい", "2025-12-29 15:00"),
    (55, None, "このスレ見て、勇気出して家族に話してみようと思った", "2026-01-03 19:00"),
    (56, 55, "応援してます！", "2026-01-03 19:30"),
    (57, 55, "うまくいくといいですね", "2026-01-03 20:30"),
    (58, None, "家族に話して良かったこと悪かったこと、両方あるなぁ", "2026-01-05 19:00"),
    (59, 58, "わかります。でもトータルでは話して良かったと思ってます", "2026-01-05 20:00"),
    (60, None, "みんなの話聞けて参考になりました。ありがとう", "2026-01-06 19:00"),
    (61, 60, "こちらこそ！またいつでも話しましょう", "2026-01-06 19:30"),
]


def jst_to_utc(jst_str):
    dt = datetime.strptime(jst_str, "%Y-%m-%d %H:%M")
    dt_utc = dt - timedelta(hours=9)
    return dt_utc.strftime("%Y-%m-%dT%H:%M:%S+00:00")


def assign_user_ids(comments):
    """Assign user_ids with:
    1. Duration keyword matching (comment mentions illness duration -> matching user)
    2. Question-answer awareness (A->B(？)->C pattern)
    3. Parent-child differentiation
    """
    user_map = {}
    body_map = {}
    reply_map = {}
    for num, reply_to, body, dt in comments:
        body_map[num] = body
        reply_map[num] = reply_to

    # Track usage index per duration group for round-robin within group
    dur_idx = {k: 0 for k in USERS_BY_DURATION}
    user_idx = 0

    for num, reply_to, body, dt in comments:
        # 1. Check duration keyword match
        dur_cat = detect_duration(body)
        if dur_cat and USERS_BY_DURATION.get(dur_cat):
            group = USERS_BY_DURATION[dur_cat]
            idx = dur_idx[dur_cat] % len(group)
            candidate = group[idx]
            # Avoid same user as parent
            if reply_to and reply_to in user_map and candidate == user_map[reply_to]:
                dur_idx[dur_cat] += 1
                idx = dur_idx[dur_cat] % len(group)
                candidate = group[idx]
            user_map[num] = candidate
            dur_idx[dur_cat] += 1
            print(f"  #{num}: duration match ({dur_cat}) -> {candidate[-3:]}")
            continue

        # 2. Check A->B(？)->C pattern
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
    print(f"Processing {len(COMMENTS)} comments for thread No.23")
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
