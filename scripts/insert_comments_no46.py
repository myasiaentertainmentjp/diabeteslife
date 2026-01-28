#!/usr/bin/env python3
"""Insert 49 comments for thread No.46: クリスマスケーキどうする？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "63548962-f71d-49b7-b5fb-5ccb25f26a8a"
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
    (2, None, "クリスマスケーキどうしますか？食べたいけど糖質が…", "2025-12-08 19:14"),
    (3, None, "シャトレーゼの低糖質ケーキ予約した", "2025-12-08 19:51"),
    (4, None, "家族と一緒だから普通のケーキを少しだけ食べる予定", "2025-12-08 20:28"),
    (5, 3, "シャトレーゼいいですよね。糖質どのくらいですか？", "2025-12-09 08:11"),
    (6, 5, "1カットで糖質5gくらいだったと思います", "2025-12-09 12:17"),
    (7, None, "診断されたばかりで初めてのクリスマス。ケーキ諦めるべき？", "2025-12-09 12:53"),
    (8, 7, "低糖質ケーキあるから諦めなくて大丈夫ですよ", "2025-12-09 19:08"),
    (9, None, "コージーコーナーにも低糖質ケーキあるらしい", "2025-12-09 19:44"),
    (10, None, "知らなかった！チェックしてみます", "2025-12-09 20:21"),
    (11, 9, "期間限定だから早めに予約した方がいいですよ", "2025-12-10 08:14"),
    (12, None, "手作りで低糖質ケーキ作る人いますか", "2025-12-10 12:19"),
    (13, None, "おからパウダーとラカントで作ります", "2025-12-10 12:55"),
    (14, 12, "レシピ教えてほしいです！", "2025-12-10 19:11"),
    (15, 14, "YouTubeで「低糖質 スポンジケーキ」で検索すると出てきますよ", "2025-12-10 19:47"),
    (16, None, "診断されて3年目、毎年低糖質ケーキでクリスマス楽しんでる", "2025-12-11 12:22"),
    (17, 16, "素敵ですね！どこで買ってますか？", "2025-12-11 12:58"),
    (18, 17, "シャトレーゼかネット通販です", "2025-12-11 19:13"),
    (19, None, "普通のケーキ一口だけもらう作戦", "2025-12-12 12:17"),
    (20, None, "私もそれ。味わえれば満足", "2025-12-12 12:53"),
    (21, 19, "一口で我慢できる自信がない…", "2025-12-12 19:08"),
    (22, None, "10年以上糖尿病だけど、クリスマスは低糖質ケーキで十分楽しめる", "2025-12-13 14:11"),
    (23, 22, "慣れると低糖質でも満足できますよね", "2025-12-13 14:47"),
    (24, None, "SUNAOのアイスケーキもおすすめ", "2025-12-13 19:14"),
    (25, None, "アイスケーキいいですね！糖質どのくらい？", "2025-12-13 19:51"),
    (26, 24, "1個50kcalくらいで糖質も控えめですよ", "2025-12-13 20:28"),
    (27, None, "子供がケーキ食べたがるから一緒に食べる", "2025-12-14 12:19"),
    (28, None, "家族のイベントだから少しくらいはね", "2025-12-14 12:55"),
    (29, 27, "お子さんと一緒に楽しんでください", "2025-12-14 19:11"),
    (30, None, "ケーキの代わりにチーズケーキにしようかな", "2025-12-15 12:17"),
    (31, None, "チーズケーキはショートケーキより糖質低めですよね", "2025-12-15 12:53"),
    (32, 30, "ベイクドチーズケーキならさらに低い", "2025-12-15 19:08"),
    (33, None, "低糖質ケーキの予約完了！楽しみ", "2025-12-17 19:14"),
    (34, 33, "私も予約しました！", "2025-12-17 19:51"),
    (35, None, "クリスマス当日、ケーキ楽しみにしてる", "2025-12-22 19:11"),
    (36, None, "明日がクリスマスイブ。ワクワク", "2025-12-23 19:08"),
    (37, 36, "楽しんでください！", "2025-12-23 19:44"),
    (38, None, "低糖質ケーキ食べました！おいしかった", "2025-12-24 20:17"),
    (39, None, "私も今食べてます。幸せ", "2025-12-24 20:53"),
    (40, 38, "血糖値どうでしたか？", "2025-12-24 21:29"),
    (41, 40, "食後1時間で140くらいでした。許容範囲", "2025-12-24 22:06"),
    (42, None, "普通のケーキ少しだけ食べた。おいしかった", "2025-12-25 10:14"),
    (43, None, "クリスマス楽しめましたか？", "2025-12-25 19:08"),
    (44, 43, "楽しめました！低糖質でも満足", "2025-12-25 19:44"),
    (45, None, "来年も低糖質ケーキでクリスマス楽しもう", "2025-12-26 19:11"),
    (46, 45, "毎年恒例にしたいですね", "2025-12-26 19:47"),
    (47, None, "このスレのおかげでケーキ諦めなくて済んだ", "2025-12-27 19:08"),
    (48, 47, "情報共有できてよかったです", "2025-12-27 19:44"),
    (49, None, "また来年のクリスマスに会いましょう", "2025-12-28 19:11"),
    (50, 49, "来年もよろしくお願いします！", "2025-12-28 19:47"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.46")
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
