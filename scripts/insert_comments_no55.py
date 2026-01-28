#!/usr/bin/env python3
"""Insert 49 comments for thread No.55: バレンタインのチョコどうする？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "e8d8f641-7e9e-4882-8453-67506a0a2439"
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
    (2, None, "バレンタインのチョコ、どうしますか？もらっても食べられない…", "2026-01-20 19:08"),
    (3, None, "高カカオチョコなら糖質控えめですよ", "2026-01-20 19:44"),
    (4, None, "シャトレーゼの低糖質チョコおすすめ", "2026-01-20 20:21"),
    (5, 3, "カカオ70%以上がいいんですよね？", "2026-01-21 08:14"),
    (6, 5, "そうです。ビターなら糖質も少なめ", "2026-01-21 12:21"),
    (7, None, "診断されたばかりでバレンタインどうしようか悩んでる", "2026-01-21 12:57"),
    (8, 7, "低糖質チョコで楽しめますよ", "2026-01-21 19:13"),
    (9, None, "職場の義理チョコが困る", "2026-01-22 12:17"),
    (10, None, "もらったら少しだけ食べて残りは家族に…", "2026-01-22 12:53"),
    (11, 9, "私も配布用は家族に渡してます", "2026-01-22 19:08"),
    (12, None, "手作りで低糖質チョコ作る予定", "2026-01-23 12:17"),
    (13, None, "いいですね！レシピ教えてください", "2026-01-23 12:53"),
    (14, 12, "カカオマスとラカントで作ります", "2026-01-23 19:08"),
    (15, None, "診断されて2年目、バレンタインは高カカオチョコで", "2026-01-24 12:17"),
    (16, 15, "何%のを食べてますか？", "2026-01-24 12:53"),
    (17, 16, "86%のやつです。最初は苦かったけど慣れた", "2026-01-24 19:08"),
    (18, None, "チョコ1粒なら大丈夫かな", "2026-01-25 12:17"),
    (19, None, "1粒で糖質2〜3gくらいですかね", "2026-01-25 12:53"),
    (20, 18, "少量なら問題ないと思いますよ", "2026-01-25 19:08"),
    (21, None, "10年以上糖尿病だけど、バレンタインは楽しんでます", "2026-01-26 14:08"),
    (22, 21, "どうやって楽しんでますか？", "2026-01-26 14:44"),
    (23, 22, "低糖質チョコを自分へのご褒美に買ってます", "2026-01-26 19:08"),
    (24, None, "ゴディバの高カカオシリーズ気になる", "2026-01-27 12:17"),
    (25, None, "高級チョコなら少量で満足できそう", "2026-01-27 12:53"),
    (26, 24, "ゴディバ美味しいですよね", "2026-01-27 19:08"),
    (27, None, "リンツの85%も美味しいですよ", "2026-01-28 12:17"),
    (28, None, "チョコレート効果の86%愛用してます", "2026-01-28 12:53"),
    (29, 27, "リンツ好きです。1粒で満足感ある", "2026-01-28 19:08"),
    (30, None, "バレンタイン用に低糖質チョコ予約した", "2026-02-01 12:17"),
    (31, 30, "どこのですか？", "2026-02-01 12:53"),
    (32, 31, "シャトレーゼの糖質カットチョコです", "2026-02-01 19:08"),
    (33, None, "SUNAOのチョコアイスもおすすめ", "2026-02-05 12:17"),
    (34, None, "チョコアイスいいですね！", "2026-02-05 12:53"),
    (35, 33, "バレンタインにアイスもありですね", "2026-02-05 19:08"),
    (36, None, "もうすぐバレンタイン。準備できた", "2026-02-10 19:08"),
    (37, 36, "私も低糖質チョコ買いました", "2026-02-10 19:44"),
    (38, None, "バレンタイン当日！チョコ食べました", "2026-02-14 19:08"),
    (39, None, "高カカオチョコで満足です", "2026-02-14 19:44"),
    (40, 38, "血糖値大丈夫でしたか？", "2026-02-14 20:21"),
    (41, 40, "低糖質だったから問題なしでした", "2026-02-14 20:58"),
    (42, None, "義理チョコ少しだけ食べた", "2026-02-14 21:35"),
    (43, 42, "少量なら大丈夫ですよ", "2026-02-15 08:14"),
    (44, None, "バレンタイン乗り切った！", "2026-02-15 12:17"),
    (45, None, "お疲れ様でした！", "2026-02-15 12:53"),
    (46, 44, "低糖質チョコのおかげで楽しめました", "2026-02-15 19:08"),
    (47, None, "このスレ参考になりました", "2026-02-16 19:08"),
    (48, 47, "また来年も情報共有しましょう", "2026-02-16 19:44"),
    (49, None, "来年のバレンタインも低糖質で楽しもう", "2026-02-17 19:08"),
    (50, 49, "来年もよろしくお願いします", "2026-02-17 19:44"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.55")
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
