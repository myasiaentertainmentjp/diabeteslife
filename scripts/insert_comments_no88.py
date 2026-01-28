#!/usr/bin/env python3
"""Insert 61 comments for thread No.88: 春が待ち遠しい人"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "8df8575c-9f3c-42d5-adff-4cbbc283f410"
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
    (2, None, "早く春にならないかな。冬は血糖管理が大変", "2025-12-20 19:30"),
    (3, None, "寒いと運動できないし食べすぎるし最悪", "2025-12-20 20:15"),
    (4, None, "診断されたばかりで初めての冬。早く暖かくなってほしい", "2025-12-20 21:00"),
    (5, 4, "春になると運動しやすくなりますよ", "2025-12-20 21:45"),
    (6, None, "10年以上糖尿病だけど、冬は毎年つらい。春が待ち遠しい", "2025-12-21 10:30"),
    (7, 6, "ベテランでも冬はつらいんですね", "2025-12-21 11:15"),
    (8, None, "春になったらウォーキング再開する", "2025-12-21 15:45"),
    (9, 8, "私も同じこと考えてます", "2025-12-21 16:30"),
    (10, None, "桜を見ながら散歩したい", "2025-12-21 19:30"),
    (11, 10, "それ最高ですね。楽しみ", "2025-12-21 20:15"),
    (12, None, "3年目だけど冬は毎年HbA1c上がる。春で挽回する", "2025-12-22 11:30"),
    (13, 12, "私も同じパターンです", "2025-12-22 12:15"),
    (14, None, "春になったら自転車通勤復活させたい", "2025-12-22 18:45"),
    (15, 14, "いい運動になりますよね", "2025-12-22 19:30"),
    (16, None, "冬季うつもあるから春が待ち遠しい", "2025-12-23 10:30"),
    (17, 16, "日が長くなると気分も上がりますよね", "2025-12-23 11:15"),
    (18, None, "あと何ヶ月で春なんだろう", "2025-12-23 15:45"),
    (19, 18, "3月くらいから暖かくなりますかね", "2025-12-23 16:30"),
    (20, None, "春野菜が楽しみ。菜の花とか", "2025-12-23 20:15"),
    (21, 20, "旬の野菜美味しいですよね", "2025-12-23 21:00"),
    (22, None, "暖かくなったら外でピクニックしたい", "2025-12-24 11:30"),
    (23, 22, "お弁当持ってお花見いいですね", "2025-12-24 12:15"),
    (24, None, "冬は着込むから動きにくい。春の薄着が楽", "2025-12-24 19:20"),
    (25, 24, "確かに。コートなしで歩きたい", "2025-12-24 20:00"),
    (26, None, "花粉症だけど、それでも春が待ち遠しい", "2025-12-25 14:30"),
    (27, 26, "花粉はつらいけど暖かさには代えられない", "2025-12-25 15:15"),
    (28, None, "春になったらジョギング始めたい", "2025-12-25 20:30"),
    (29, 28, "新しいことを始めるにはいい季節ですよね", "2025-12-25 21:15"),
    (30, None, "冬至過ぎたから日が長くなってきてる", "2025-12-26 11:45"),
    (31, 30, "少しずつ明るくなってますよね", "2025-12-26 12:30"),
    (32, None, "1月2月が一番寒いから踏ん張りどころ", "2025-12-26 19:20"),
    (33, 32, "あと少しの辛抱ですね", "2025-12-26 20:00"),
    (34, None, "年末年始乗り越えたら春に近づく", "2025-12-27 10:30"),
    (35, 34, "その通り！頑張ろう", "2025-12-27 11:15"),
    (36, None, "大晦日。今年も終わり。春に近づいてる", "2025-12-31 19:30"),
    (37, None, "あけおめ！今年こそ春を楽しむ", "2026-01-01 10:15"),
    (38, None, "正月明けの寒さがきつい", "2026-01-03 18:30"),
    (39, 38, "1月が一番寒いですよね", "2026-01-03 19:15"),
    (40, None, "梅の花が咲いたら春が近い合図", "2026-01-05 14:30"),
    (41, 40, "梅が咲くと嬉しくなりますよね", "2026-01-05 15:15"),
    (42, None, "あと2ヶ月くらいの辛抱かな", "2026-01-07 18:30"),
    (43, 42, "カウントダウン始まりましたね", "2026-01-07 19:15"),
    (44, None, "このスレ見て春を待つ仲間がいて嬉しい", "2026-01-08 19:30"),
    (45, 44, "みんなで春を待ちましょう", "2026-01-08 20:15"),
    (46, None, "春になったら報告しに来ます", "2026-01-09 18:30"),
    (47, 46, "楽しみにしてます！", "2026-01-09 19:15"),
    (48, None, "冬を乗り越えた自分を褒めたい", "2026-01-09 20:30"),
    (49, 48, "みんな頑張ってますよね", "2026-01-09 21:15"),
    (50, None, "このスレ参考になった", "2026-01-10 18:30"),
    (51, None, "春への希望が持てた", "2026-01-10 19:15"),
    (52, None, "みんなで冬を乗り切ろう", "2026-01-10 20:00"),
    (53, None, "春はもうすぐ", "2026-01-10 20:45"),
    (54, None, "このスレありがとう", "2026-01-10 21:30"),
    (55, None, "来年の冬もこのスレで励まし合いたい", "2026-01-11 18:30"),
    (56, None, "春を待つ仲間がいて心強い", "2026-01-11 19:15"),
    (57, None, "あと少しの辛抱", "2026-01-11 20:00"),
    (58, None, "みんなで春を迎えよう", "2026-01-11 20:45"),
    (59, None, "このスレ最高でした", "2026-01-11 21:30"),
    (60, None, "ありがとうございました！", "2026-01-12 18:30"),
    (61, None, "春よ来い", "2026-01-12 19:15"),
    (62, None, "また来年の冬も！", "2026-01-12 20:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.88")
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
