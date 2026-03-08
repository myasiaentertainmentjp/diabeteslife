#!/usr/bin/env python3
"""Insert 46 comments for thread No.78: スキー・スノボと低血糖"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "425c738b-b753-4bea-8f79-bc7f31aca55e"
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
    (2, None, "スキー行きたいけど低血糖が心配", "2025-12-20 19:30"),
    (3, None, "ウインタースポーツって結構体力使うよね", "2025-12-20 20:15"),
    (4, None, "診断されたばかりでスキーに行っていいか不安", "2025-12-20 21:00"),
    (5, 4, "準備しっかりすれば大丈夫ですよ", "2025-12-20 21:45"),
    (6, None, "10年以上糖尿病だけど、毎年スキー行ってる", "2025-12-21 10:30"),
    (7, 6, "どんな対策してますか？", "2025-12-21 11:15"),
    (8, 7, "ブドウ糖は必ず持っていく。ポケットに入れてる", "2025-12-21 12:00"),
    (9, None, "リフト乗ってる間に血糖値下がってることある", "2025-12-21 15:45"),
    (10, 9, "寒いと消費カロリー増えるからね", "2025-12-21 16:30"),
    (11, None, "3年目だけど去年スキー場で低血糖になった", "2025-12-22 11:30"),
    (12, 11, "大丈夫でしたか？どう対処しました？", "2025-12-22 12:15"),
    (13, 12, "すぐブドウ糖食べて休憩室で休んだ。焦った", "2025-12-22 13:00"),
    (14, None, "ゲレンデで倒れたら迷惑かけそうで怖い", "2025-12-22 18:45"),
    (15, 14, "一緒に行く人に病気のこと伝えておくといいですよ", "2025-12-22 19:30"),
    (16, None, "スノボのほうが体力使う気がする", "2025-12-23 10:30"),
    (17, 16, "転ぶ回数も多いしね", "2025-12-23 11:15"),
    (18, None, "こまめに休憩取るようにしてる", "2025-12-23 15:45"),
    (19, 18, "2〜3本滑ったら休憩入れてる", "2025-12-23 16:30"),
    (20, None, "リブレつけてるからスマホで確認できて便利", "2025-12-23 20:15"),
    (21, 20, "リフト乗りながらチェックできますね", "2025-12-23 21:00"),
    (22, None, "インスリン打ってる人、スキー場での注射どうしてる？", "2025-12-24 11:30"),
    (23, 22, "レストハウスのトイレで打ってます", "2025-12-24 12:15"),
    (24, 22, "車に戻って打つこともある", "2025-12-24 13:00"),
    (25, None, "寒いとインスリンの効きが変わったりする？", "2025-12-24 19:20"),
    (26, 25, "凍らせないように体温で温めて持ち歩いてる", "2025-12-24 20:00"),
    (27, None, "ゲレ食の糖質が気になる", "2025-12-25 14:30"),
    (28, 27, "カレーとかラーメンばっかりだよね", "2025-12-25 15:15"),
    (29, 27, "おにぎり持参してる", "2025-12-25 16:00"),
    (30, None, "運動量多いから多少食べても大丈夫かなって甘えてしまう", "2025-12-25 20:30"),
    (31, None, "年末年始にスキー旅行計画中", "2025-12-26 11:45"),
    (32, 31, "楽しんできてください！準備万端で", "2025-12-26 12:30"),
    (33, None, "スキー保険入っておいたほうがいいかな", "2025-12-27 10:30"),
    (34, 33, "持病あると保険入れないこともあるから確認を", "2025-12-27 11:15"),
    (35, None, "スキー行ってきた！低血糖にならずに済んだ", "2026-01-05 19:30"),
    (36, 35, "おめでとうございます！対策バッチリでしたね", "2026-01-05 20:15"),
    (37, None, "今シーズンあと1回は行きたい", "2026-01-07 18:30"),
    (38, None, "ウインタースポーツ楽しみたいよね", "2026-01-08 20:00"),
    (39, None, "糖尿病でも諦めなくていい", "2026-01-09 19:15"),
    (40, 39, "準備と対策が大事ですね", "2026-01-09 20:00"),
    (41, None, "このスレ参考になった", "2026-01-10 18:30"),
    (42, None, "来シーズンも安全に滑りたい", "2026-01-10 20:15"),
    (43, None, "みんなの情報ありがとう", "2026-01-10 21:00"),
    (44, None, "スキー仲間がいると心強い", "2026-01-11 18:45"),
    (45, None, "また来シーズンもこのスレで情報交換しよう", "2026-01-11 20:00"),
    (46, None, "糖尿病でもウインタースポーツ楽しもう", "2026-01-11 21:15"),
    (47, None, "ありがとうございました！", "2026-01-12 19:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.78")
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
