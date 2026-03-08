#!/usr/bin/env python3
"""Insert 44 comments for thread No.53: 冬の低血糖対策"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "13f796d3-b6ff-4b02-bf28-41a4d7b448e0"
THREAD_OWNER_ID = "2033ee1c-28b2-5187-8ba1-c94f7964e33e"

USERS = [
    "b0000001-0000-0000-0000-000000000001","b0000001-0000-0000-0000-000000000002",
    "b0000001-0000-0000-0000-000000000003","b0000001-0000-0000-0000-000000000004",
    "b0000001-0000-0000-0000-000000000005","b0000001-0000-0000-0000-000000000006",
    "b0000001-0000-0000-0000-000000000007","b0000001-0000-0000-0000-000000000008",
    "b0000001-0000-0000-0000-000000000009","b0000001-0000-0000-0000-000000000010",
    "b0000001-0000-0000-0000-000000000011","b0000001-0000-0000-0000-000000000012",
    "b0000001-0000-0000-0000-000000000013","b0000001-0000-0000-0000-000000000014",
    "b0000001-0000-0000-0000-000000000015","b0000001-0000-0000-0000-000000000016",
    "b0000001-0000-0000-0000-000000000017","b0000001-0000-0000-0000-000000000018",
    "b0000001-0000-0000-0000-000000000019","b0000001-0000-0000-0000-000000000020",
    "f0000001-0000-0000-0000-000000000001","f0000001-0000-0000-0000-000000000002",
    "f0000001-0000-0000-0000-000000000003","f0000001-0000-0000-0000-000000000004",
    "f0000001-0000-0000-0000-000000000005","f0000001-0000-0000-0000-000000000006",
    "f0000001-0000-0000-0000-000000000008","f0000001-0000-0000-0000-000000000009",
    "f0000001-0000-0000-0000-000000000010", THREAD_OWNER_ID,
]

USER_DURATION = {
    "b0000001-0000-0000-0000-000000000001":"1_to_3","b0000001-0000-0000-0000-000000000002":"less_than_1",
    "b0000001-0000-0000-0000-000000000003":"less_than_1","b0000001-0000-0000-0000-000000000004":"3_to_5",
    "b0000001-0000-0000-0000-000000000005":"less_than_1","b0000001-0000-0000-0000-000000000006":"1_to_3",
    "b0000001-0000-0000-0000-000000000007":"1_to_3","b0000001-0000-0000-0000-000000000008":"less_than_1",
    "b0000001-0000-0000-0000-000000000009":"5_to_10","b0000001-0000-0000-0000-000000000010":"3_to_5",
    "b0000001-0000-0000-0000-000000000011":"5_to_10","b0000001-0000-0000-0000-000000000012":"1_to_3",
    "b0000001-0000-0000-0000-000000000013":"less_than_1","b0000001-0000-0000-0000-000000000014":"1_to_3",
    "b0000001-0000-0000-0000-000000000015":"10_plus","b0000001-0000-0000-0000-000000000016":"less_than_1",
    "b0000001-0000-0000-0000-000000000017":"10_plus","b0000001-0000-0000-0000-000000000018":"3_to_5",
    "b0000001-0000-0000-0000-000000000019":"10_plus","b0000001-0000-0000-0000-000000000020":"1_to_3",
    THREAD_OWNER_ID:"5_to_10",
}

USERS_BY_DURATION = {k: [u for u in USERS if USER_DURATION.get(u)==k] for k in ["less_than_1","1_to_3","3_to_5","5_to_10","10_plus"]}

DURATION_KEYWORDS = [
    ("10_plus",     ["10年以上","15年","20年","30年","10年選手"]),
    ("5_to_10",     ["5年以上","7年","8年","9年","6年","診断されて5年","診断されて6年","診断されて7年","診断されて8年"]),
    ("3_to_5",      ["4年目","5年目","4年経","5年経","診断されて4年"]),
    ("1_to_3",      ["2年目","3年目","2年経","3年経","診断されて2年","診断されて3年","診断されて1年"]),
    ("less_than_1", ["1年未満","半年","最近診断","診断されたばかり","診断されて数ヶ月"]),
]

def detect_duration(body):
    for cat, kws in DURATION_KEYWORDS:
        for kw in kws:
            if kw in body: return cat
    return None

COMMENTS = [
    (2, None, "冬になると低血糖起きやすくないですか？対策教えてください", "2025-12-12 19:08"),
    (3, None, "寒いと体がエネルギー使うから低血糖になりやすいのかも", "2025-12-12 19:44"),
    (4, None, "ブドウ糖は常に持ち歩いてます", "2025-12-12 20:21"),
    (5, 3, "なるほど。体温維持にエネルギー使うんですね", "2025-12-13 08:14"),
    (6, None, "診断されたばかりで低血糖の対処法知りたいです", "2025-12-13 12:21"),
    (7, 6, "ブドウ糖タブレットを10g分食べるのが基本ですよ", "2025-12-13 12:57"),
    (8, None, "冬は外出時に低血糖なると辛い", "2025-12-13 19:13"),
    (9, None, "寒い中でブドウ糖探すの大変ですよね", "2025-12-13 19:49"),
    (10, 8, "ポケットにブドウ糖入れておくといいですよ", "2025-12-13 20:26"),
    (11, None, "リブレのアラート設定してます", "2025-12-14 12:17"),
    (12, None, "80以下でアラート鳴るようにしてる", "2025-12-14 12:53"),
    (13, 11, "CGMあると安心ですよね", "2025-12-14 19:08"),
    (14, None, "診断されて2年目、冬の低血糖は初めて経験した", "2025-12-15 12:17"),
    (15, 14, "季節で変わることあるんですよね", "2025-12-15 12:53"),
    (16, None, "夜中の低血糖が怖い", "2025-12-15 19:08"),
    (17, None, "枕元にブドウ糖置いてます", "2025-12-15 19:44"),
    (18, 16, "私も。夜間低血糖は気づきにくいから", "2025-12-15 20:21"),
    (19, None, "運動後の低血糖に注意してます", "2025-12-16 12:17"),
    (20, None, "冬は室内運動でも汗かくと低血糖なる", "2025-12-16 12:53"),
    (21, 19, "運動前に軽く補食するといいですよ", "2025-12-16 19:08"),
    (22, None, "10年以上インスリン使ってて、冬は単位調整してます", "2025-12-17 14:11"),
    (23, 22, "主治医と相談して調整してますか？", "2025-12-17 14:47"),
    (24, 23, "はい、定期的に相談してます", "2025-12-17 19:08"),
    (25, None, "低血糖の症状が出にくくなってきた", "2025-12-18 12:17"),
    (26, None, "無自覚低血糖は怖いですよね", "2025-12-18 12:53"),
    (27, 25, "CGMで数値確認するのが大事になりますね", "2025-12-18 19:08"),
    (28, None, "年末年始、低血糖に気をつけないと", "2025-12-22 19:11"),
    (29, None, "お酒飲むと低血糖リスク上がりますよね", "2025-12-22 19:47"),
    (30, 28, "忘年会シーズン要注意ですね", "2025-12-22 20:23"),
    (31, None, "あけおめ！今年も低血糖に気をつけます", "2026-01-01 10:14"),
    (32, 31, "あけおめ！お互い安全に過ごしましょう", "2026-01-01 10:51"),
    (33, None, "正月、食事時間不規則で低血糖なった", "2026-01-02 14:08"),
    (34, 33, "食事時間大事ですよね", "2026-01-02 14:44"),
    (35, None, "このスレ参考になります", "2026-01-04 19:08"),
    (36, 35, "お役に立てて嬉しいです", "2026-01-04 19:44"),
    (37, None, "冬はまだ続くから気をつけないと", "2026-01-06 19:08"),
    (38, None, "春まで低血糖対策続けます", "2026-01-06 19:44"),
    (39, 37, "一緒に頑張りましょう", "2026-01-06 20:21"),
    (40, None, "低血糖対策仲間、これからもよろしく", "2026-01-08 19:08"),
    (41, 40, "よろしくお願いします！", "2026-01-08 19:44"),
    (42, None, "また情報共有しましょう", "2026-01-10 19:08"),
    (43, 42, "お願いします", "2026-01-10 19:44"),
    (44, None, "安全第一で冬を乗り切ろう", "2026-01-12 19:08"),
    (45, 44, "はい！", "2026-01-12 19:44"),
]

def jst_to_utc(s):
    dt = datetime.strptime(s, "%Y-%m-%d %H:%M")
    return (dt - timedelta(hours=9)).strftime("%Y-%m-%dT%H:%M:%S+00:00")

def assign_user_ids(comments):
    user_map, body_map, reply_map = {}, {}, {}
    for n,r,b,d in comments: body_map[n]=b; reply_map[n]=r
    dur_idx = {k:0 for k in USERS_BY_DURATION}; user_idx = 0
    for num, reply_to, body, dt in comments:
        dur_cat = detect_duration(body)
        if dur_cat and USERS_BY_DURATION.get(dur_cat):
            group = USERS_BY_DURATION[dur_cat]
            idx = dur_idx[dur_cat] % len(group)
            candidate = group[idx]
            if reply_to and reply_to in user_map and candidate == user_map[reply_to]:
                dur_idx[dur_cat] += 1; idx = dur_idx[dur_cat] % len(group); candidate = group[idx]
            user_map[num] = candidate; dur_idx[dur_cat] += 1
            print(f"  #{num}: duration match ({dur_cat}) -> {candidate[-3:]}"); continue
        if reply_to and reply_to in reply_map:
            B_num = reply_to; A_num = reply_map[B_num]; B_body = body_map.get(B_num, "")
            if A_num and "？" in B_body and A_num in user_map:
                user_map[num] = user_map[A_num]; print(f"  #{num}: question-answer -> same as #{A_num}"); continue
        if reply_to and reply_to in user_map:
            parent_user = user_map[reply_to]; candidate = USERS[user_idx % len(USERS)]
            while candidate == parent_user: user_idx += 1; candidate = USERS[user_idx % len(USERS)]
            user_map[num] = candidate; user_idx += 1
        else: user_map[num] = USERS[user_idx % len(USERS)]; user_idx += 1
    return user_map

def insert_batch(records, batch_num):
    url = f"{SUPABASE_URL}/rest/v1/comments"
    headers = {"apikey":SUPABASE_KEY,"Authorization":f"Bearer {SUPABASE_KEY}","Content-Type":"application/json","Prefer":"return=minimal"}
    data = json.dumps(records).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp: print(f"  Batch {batch_num}: {resp.status} - {len(records)} records"); return True
    except urllib.error.HTTPError as e: print(f"  Batch {batch_num}: ERROR {e.code} - {e.read().decode()}"); return False

def main():
    print(f"Processing {len(COMMENTS)} comments for thread No.53")
    print(f"Thread ID: {THREAD_ID}\n")
    comment_uuids = {n: str(uuid.uuid4()) for n,_,_,_ in COMMENTS}
    print("Assigning user IDs...")
    user_map = assign_user_ids(COMMENTS); print()
    records = []; now_utc = datetime.now(timezone.utc); past_count = future_count = 0
    for num, reply_to, body, dt_jst in COMMENTS:
        utc_str = jst_to_utc(dt_jst)
        dt_obj = datetime.strptime(dt_jst, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))
        if dt_obj > now_utc: future_count += 1
        else: past_count += 1
        records.append({"id":comment_uuids[num],"thread_id":THREAD_ID,"body":body,"user_id":user_map[num],"is_hidden":False,"created_at":utc_str,"parent_id":comment_uuids[reply_to] if reply_to else None})
    print(f"Past: {past_count}, Future: {future_count}, Total: {len(records)}\n")
    for i in range(0, len(records), 50):
        if not insert_batch(records[i:i+50], i//50+1): print("STOPPING"); return
    print(f"\nAll {len(records)} comments inserted!")
    print(f"\nUpdating comments_count to {past_count}...")
    url = f"{SUPABASE_URL}/rest/v1/threads?id=eq.{THREAD_ID}"
    headers = {"apikey":SUPABASE_KEY,"Authorization":f"Bearer {SUPABASE_KEY}","Content-Type":"application/json","Prefer":"return=minimal"}
    req = urllib.request.Request(url, data=json.dumps({"comments_count":past_count}).encode("utf-8"), headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req) as resp: print(f"  Updated: {resp.status}")
    except urllib.error.HTTPError as e: print(f"  ERROR: {e.code} - {e.read().decode()}")

if __name__ == "__main__": main()
