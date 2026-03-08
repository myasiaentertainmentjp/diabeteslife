#!/usr/bin/env python3
"""Insert 46 comments for thread No.62: 初詣で甘酒飲む？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "14310920-867d-488a-80eb-159093d3695a"
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
    (2, None, "初詣の甘酒って飲んでますか？糖質気になるけど…", "2025-12-20 19:45"),
    (3, None, "一口だけ飲んでる。縁起物だし", "2025-12-20 20:30"),
    (4, None, "診断されたばかりで初めての正月。甘酒我慢すべき？", "2025-12-20 21:15"),
    (5, 4, "無理に我慢しなくていいと思う。一杯くらいなら", "2025-12-20 22:00"),
    (6, None, "甘酒の糖質ってどのくらいあるんだろう", "2025-12-21 10:30"),
    (7, 6, "100mlで20g前後らしい。結構あるね", "2025-12-21 11:15"),
    (8, None, "10年以上糖尿病だけど、甘酒は毎年飲んでる。年に一回くらいいいかなって", "2025-12-21 14:20"),
    (9, 8, "年一回の楽しみは大事ですよね", "2025-12-21 15:00"),
    (10, None, "米麹の甘酒と酒粕の甘酒って糖質違うのかな", "2025-12-21 19:30"),
    (11, 10, "米麹のほうが糖質高いって聞いたことある", "2025-12-21 20:15"),
    (12, None, "神社で配ってるやつ断りにくい…", "2025-12-22 11:45"),
    (13, 12, "わかる。せっかくだからって受け取っちゃう", "2025-12-22 12:30"),
    (14, None, "3年目だけど甘酒は飲まないようにしてる。代わりにお茶もらう", "2025-12-22 18:20"),
    (15, None, "熱々の甘酒って体温まるんだよね。冬の初詣には最高", "2025-12-22 20:45"),
    (16, None, "甘酒飲んだ後は歩いて血糖値下げるようにしてる", "2025-12-23 10:30"),
    (17, 16, "初詣って結構歩くから運動になりますよね", "2025-12-23 11:15"),
    (18, None, "低糖質の甘酒ってないのかな", "2025-12-23 15:40"),
    (19, 18, "探したけど見つからなかった…あったら教えてほしい", "2025-12-23 16:30"),
    (20, None, "豆乳甘酒なら少しマシって聞いたことある", "2025-12-23 20:15"),
    (21, None, "甘酒より御神酒のほうが糖質低いのかな", "2025-12-24 11:30"),
    (22, 21, "日本酒も糖質あるからどっちもどっちかも", "2025-12-24 12:15"),
    (23, None, "家族と一緒だと「飲まないの？」って聞かれるのが面倒", "2025-12-24 19:20"),
    (24, 23, "「お腹いっぱい」って言ってごまかしてる", "2025-12-24 20:00"),
    (25, None, "甘酒より屋台の食べ物のほうが誘惑強い", "2025-12-25 14:30"),
    (26, 25, "たこ焼きとか焼きそばとか…糖質の塊", "2025-12-25 15:15"),
    (27, None, "初詣は夜中に行くから低血糖が心配", "2025-12-25 20:45"),
    (28, 27, "ブドウ糖持っていくといいですよ", "2025-12-25 21:30"),
    (29, None, "元旦の朝に行くから甘酒で体温めたい派", "2025-12-26 10:20"),
    (30, None, "甘酒飲んでリブレの矢印↑↑になったことある", "2025-12-26 18:30"),
    (31, 30, "急上昇しますよね。でも美味しいから悩む", "2025-12-26 19:15"),
    (32, None, "子供の頃から初詣の甘酒好きだったから、やめられない", "2025-12-27 11:45"),
    (33, None, "思い出の味ってあるよね", "2025-12-27 15:30"),
    (34, None, "今年は甘酒我慢して、帰ってから低糖質ココア飲もうかな", "2025-12-28 19:20"),
    (35, None, "甘酒一杯くらいで神経質になりたくないな", "2025-12-29 14:15"),
    (36, 35, "その気持ちわかります。ストレスも血糖値に悪いし", "2025-12-29 15:00"),
    (37, None, "結局飲むか飲まないか当日の気分で決める", "2025-12-30 20:30"),
    (38, None, "明日の初詣どうしよう。まだ迷ってる", "2025-12-31 21:45"),
    (39, None, "あけましておめでとう！甘酒飲んできた", "2026-01-01 02:30"),
    (40, 39, "おめでとうございます！美味しかったですか？", "2026-01-01 09:15"),
    (41, 40, "最高でした。血糖値は見ないことにした笑", "2026-01-01 10:00"),
    (42, None, "今年は我慢できた。お茶だけ飲んだ", "2026-01-01 15:30"),
    (43, None, "半分だけ飲んで残りは夫にあげた", "2026-01-02 11:20"),
    (44, None, "来年も同じこと悩んでそう", "2026-01-03 18:45"),
    (45, 44, "毎年の恒例行事ですね笑", "2026-01-03 19:30"),
    (46, None, "甘酒問題、永遠のテーマだわ", "2026-01-04 20:15"),
    (47, None, "来年こそ低糖質甘酒発売されてほしい", "2026-01-05 14:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.62")
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
