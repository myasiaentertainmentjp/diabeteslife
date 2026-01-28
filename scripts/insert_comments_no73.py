#!/usr/bin/env python3
"""Insert 48 comments for thread No.73: 暖房と血糖値の関係"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "d9b20bbc-d0a5-4202-b62d-17f50d733f82"
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
    (2, None, "暖房ガンガンにしてると血糖値に影響あるのかな", "2025-12-20 19:45"),
    (3, None, "暖かいと動かなくなるから血糖値上がりそう", "2025-12-20 20:30"),
    (4, None, "診断されたばかりで暖房との付き合い方がわからない", "2025-12-20 21:15"),
    (5, 4, "適度な温度で過ごすのがいいですよ", "2025-12-20 22:00"),
    (6, None, "10年以上糖尿病だけど、冬は暖房の中でダラダラしがち", "2025-12-21 10:30"),
    (7, 6, "暖かいと動く気なくなりますよね", "2025-12-21 11:15"),
    (8, None, "エアコンの暖房で乾燥がひどい", "2025-12-21 15:45"),
    (9, 8, "加湿器必須ですよね", "2025-12-21 16:30"),
    (10, None, "こたつから出られない問題", "2025-12-21 19:30"),
    (11, 10, "こたつは人をダメにする笑", "2025-12-21 20:15"),
    (12, None, "3年目だけど冬は運動量減って血糖値上がる", "2025-12-22 11:30"),
    (13, 12, "室内でも動くようにしないとですね", "2025-12-22 12:15"),
    (14, None, "暖房の設定温度何度にしてますか", "2025-12-22 18:45"),
    (15, 14, "20度くらいにしてます。暑すぎると動かなくなるから", "2025-12-22 19:30"),
    (16, 14, "22度。寒がりなので…", "2025-12-22 20:15"),
    (17, None, "床暖房の家が羨ましい。足元から温まりたい", "2025-12-23 10:30"),
    (18, None, "ホットカーペットで過ごしてる", "2025-12-23 15:45"),
    (19, 18, "ホットカーペットいいですよね。電気代も安い", "2025-12-23 16:30"),
    (20, None, "暖房代がかさむ季節。節約と健康の両立が難しい", "2025-12-23 20:15"),
    (21, None, "寒いと血圧も上がるし難しい", "2025-12-24 11:30"),
    (22, 21, "糖尿病で血圧も高いから冬は気を使う", "2025-12-24 12:15"),
    (23, None, "暖房つけっぱなしで寝ると朝喉がカラカラ", "2025-12-24 19:20"),
    (24, 23, "タイマーで切れるようにしてます", "2025-12-24 20:00"),
    (25, None, "石油ストーブ使ってる人いますか", "2025-12-25 14:30"),
    (26, 25, "使ってます。やかん置いて加湿も兼ねてる", "2025-12-25 15:15"),
    (27, None, "暖房で汗かくと低血糖になりやすい気がする", "2025-12-25 20:30"),
    (28, 27, "脱水にも気をつけないとですね", "2025-12-25 21:15"),
    (29, None, "部屋の温度差でヒートショックも怖い", "2025-12-26 11:45"),
    (30, 29, "脱衣所も暖めるようにしてます", "2025-12-26 12:30"),
    (31, None, "着る毛布で暖房費節約してる", "2025-12-26 19:20"),
    (32, 31, "着る毛布あったかいですよね", "2025-12-26 20:00"),
    (33, None, "レッグウォーマーで足元温めてる", "2025-12-27 10:30"),
    (34, None, "暖房に頼りすぎず体を動かすようにしてる", "2025-12-27 18:45"),
    (35, 34, "それが一番ですよね。筋肉動かすと温まるし", "2025-12-27 19:30"),
    (36, None, "年末年始はこたつでダラダラしそう", "2025-12-28 15:20"),
    (37, None, "正月太りの原因は暖房かもしれない", "2025-12-30 19:30"),
    (38, None, "今年は意識して動くようにする", "2026-01-02 14:15"),
    (39, None, "暖房の中でストレッチするだけでも違う", "2026-01-03 18:30"),
    (40, 39, "テレビ見ながらできますよね", "2026-01-03 19:15"),
    (41, None, "暖房費と血糖値、両方気になる冬", "2026-01-05 15:45"),
    (42, None, "春が待ち遠しい", "2026-01-06 19:20"),
    (43, None, "このスレ見て暖房の使い方考え直した", "2026-01-07 18:30"),
    (44, None, "適度な温度で適度に動くのが大事", "2026-01-08 20:00"),
    (45, None, "みんなで冬を乗り切ろう", "2026-01-09 19:15"),
    (46, None, "暖房と上手に付き合っていこう", "2026-01-09 21:00"),
    (47, None, "来年の冬も参考にする", "2026-01-10 18:45"),
    (48, None, "冬の生活習慣、見直すきっかけになった", "2026-01-10 20:30"),
    (49, None, "このスレありがとう", "2026-01-11 19:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.73")
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
