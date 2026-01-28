#!/usr/bin/env python3
"""Insert 65 comments for thread No.21: 朝の血糖値が高い人
reply_to kept as original CSV. user_id logic: when B asks A a question (？),
C's answer gets A's user_id.
"""

import uuid
import json
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

THREAD_ID = "82a3b12f-739b-4fa2-a5da-79d3c76b7baf"
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
    (2, None, "朝起きたら血糖値130超えてることが多い。夜は何も食べてないのに", "2025-12-16 07:30"),
    (3, 2, "暁現象かもしれないですね。私もそうでした", "2025-12-16 08:15"),
    (4, None, "私も朝だけ高い。昼夜は普通なのに", "2025-12-16 12:00"),
    (5, 3, "暁現象ってなんですか？", "2025-12-16 19:00"),
    (6, 5, "明け方にホルモンの影響で血糖値が上がる現象です。糖尿病の人に多いみたい", "2025-12-16 20:00"),
    (7, None, "朝の空腹時血糖150とかになる日もある…", "2025-12-17 07:00"),
    (8, 7, "150は高いですね。先生に相談しましたか？", "2025-12-17 08:30"),
    (9, 8, "来週診察なので聞いてみます", "2025-12-17 12:00"),
    (10, None, "夜遅く食べると翌朝高くなる気がする", "2025-12-17 19:30"),
    (11, 10, "私も夕食は20時までにしてます", "2025-12-17 20:30"),
    (12, 10, "何時くらいに食べてますか？", "2025-12-17 21:00"),
    (13, 12, "22時とか23時になることも…仕事が遅いので", "2025-12-18 07:00"),
    (14, None, "リブレで見ると夜中3時頃から上がり始めてる", "2025-12-18 08:00"),
    (15, 14, "私も同じです！夜中に何もしてないのに上がる", "2025-12-18 10:00"),
    (16, 14, "それ典型的な暁現象ですね。グラフで見えると納得しますよね", "2025-12-18 12:30"),
    (17, None, "朝の血糖値下げるために何かしてますか？", "2025-12-18 19:00"),
    (18, 17, "寝る前に軽くストレッチしてます。効果あるかわからないけど", "2025-12-18 20:00"),
    (19, 17, "夕食の糖質を減らしたら少しマシになった", "2025-12-18 21:30"),
    (20, None, "朝イチで測ると140、朝食後に測ると120とか。逆転現象", "2025-12-19 07:30"),
    (21, 20, "朝食食べると下がるの不思議ですよね", "2025-12-19 08:30"),
    (22, 20, "インスリン分泌が刺激されるからかな？", "2025-12-19 10:00"),
    (23, None, "ソモジー効果と暁現象の違いがわからない", "2025-12-19 19:00"),
    (24, 23, "ソモジーは夜中に低血糖になった反動で上がるやつ。暁現象は低血糖なしで上がる", "2025-12-19 20:30"),
    (25, 24, "なるほど！リブレで夜中のグラフ見れば判別できそうですね", "2025-12-19 21:00"),
    (26, None, "朝の血糖値が高いと1日のモチベーション下がる", "2025-12-20 07:00"),
    (27, 26, "わかる…朝から凹む", "2025-12-20 08:00"),
    (28, None, "先生に相談したら眠前にメトホルミン追加になった", "2025-12-20 19:00"),
    (29, 28, "効果ありましたか？", "2025-12-20 20:00"),
    (30, 29, "まだ1週間だけど少し下がってきた気がする", "2025-12-20 21:00"),
    (31, None, "睡眠時間と朝の血糖値って関係ありますか？", "2025-12-21 10:00"),
    (32, 31, "睡眠不足だと上がりやすい気がします", "2025-12-21 12:00"),
    (33, 31, "私は寝すぎても高くなる。7時間くらいがベスト", "2025-12-21 14:00"),
    (34, None, "朝起きてすぐ測るのと、30分後に測るのだと違う", "2025-12-21 19:00"),
    (35, 34, "私は起きてすぐの方が高いです", "2025-12-21 20:00"),
    (36, 34, "動き始めると下がりますよね", "2025-12-21 21:30"),
    (37, None, "年末年始、生活リズム乱れて朝の血糖値やばそう", "2025-12-22 19:00"),
    (38, 37, "夜更かしすると翌朝上がりますよね", "2025-12-22 20:30"),
    (39, None, "1型ですが持効型インスリンの量調整したら朝マシになった", "2025-12-23 08:00"),
    (40, 39, "基礎インスリン増やしたんですか？", "2025-12-23 10:00"),
    (41, 40, "はい、先生と相談して2単位増やしました", "2025-12-23 12:00"),
    (42, None, "ストレスで朝の血糖値上がる気がする", "2025-12-23 19:00"),
    (43, 42, "コルチゾール（ストレスホルモン）の影響ありますよね", "2025-12-23 20:30"),
    (44, None, "朝測るの忘れがち…", "2025-12-24 08:00"),
    (45, 44, "枕元に測定器置いてます", "2025-12-24 09:30"),
    (46, 45, "それいいですね！真似します", "2025-12-24 12:00"),
    (47, None, "クリスマス夜更かししたら案の定今朝高かった", "2025-12-25 08:00"),
    (48, 47, "私も…150超えてた", "2025-12-25 09:30"),
    (49, None, "朝の血糖値、季節で変わりませんか？冬高い気がする", "2025-12-26 07:30"),
    (50, 49, "寒いと上がりやすいって聞いたことある", "2025-12-26 09:00"),
    (51, 49, "私も冬の方が高い。運動量減るからかな", "2025-12-26 12:00"),
    (52, None, "朝の目標値ってどのくらいにしてますか？", "2025-12-27 08:00"),
    (53, 52, "先生には110以下って言われてます", "2025-12-27 10:00"),
    (54, 52, "私は130以下を目標にしてます。ゆるめですが", "2025-12-27 12:30"),
    (55, None, "正月、朝ゆっくり起きると血糖値測る時間ずれる", "2025-12-28 19:00"),
    (56, 55, "起きた時間に測ればいいと思いますよ", "2025-12-28 20:30"),
    (57, None, "あけましておめでとう。今朝の血糖値125でまあまあでした", "2026-01-01 09:00"),
    (58, 57, "あけおめ！正月なのに125は優秀", "2026-01-01 10:30"),
    (59, None, "正月3日目、朝160超えた…食べすぎた", "2026-01-03 08:00"),
    (60, 59, "お正月だから仕方ない。今日から頑張ろう", "2026-01-03 09:30"),
    (61, None, "生活リズム戻したら朝の血糖値も落ち着いてきた", "2026-01-05 07:30"),
    (62, 61, "規則正しい生活大事ですよね", "2026-01-05 09:00"),
    (63, None, "このスレ見て暁現象のこと詳しくなった。ありがとう", "2026-01-06 19:00"),
    (64, 63, "情報交換できてこちらも助かります", "2026-01-06 20:00"),
    (65, None, "朝の血糖値、地道に記録続けていきます", "2026-01-07 07:30"),
    (66, 65, "一緒に頑張りましょう！", "2026-01-07 08:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.21")
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
