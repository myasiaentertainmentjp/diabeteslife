#!/usr/bin/env python3
"""Insert 52 comments for thread No.81: 加湿器使ってる？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "919de25f-cf9f-4103-9a5a-7b49797ee235"
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
    (2, None, "冬は乾燥がひどい。加湿器使ってる人いますか", "2025-12-20 19:30"),
    (3, None, "糖尿病だと肌乾燥しやすいから加湿器必須", "2025-12-20 20:15"),
    (4, None, "診断されたばかりで乾燥対策どうすればいいか模索中", "2025-12-20 21:00"),
    (5, 4, "加湿器あると全然違いますよ", "2025-12-20 21:45"),
    (6, None, "10年以上この病気だけど、冬は加湿器フル稼働", "2025-12-21 10:30"),
    (7, 6, "うちも毎日使ってます", "2025-12-21 11:15"),
    (8, None, "加湿器の種類って何がいいんだろう", "2025-12-21 15:45"),
    (9, 8, "スチーム式が加湿力高いですよ", "2025-12-21 16:30"),
    (10, 8, "超音波式は電気代安いけど手入れ必要", "2025-12-21 17:15"),
    (11, None, "3年目だけど去年加湿器買ったら肌の調子良くなった", "2025-12-21 19:30"),
    (12, 11, "やっぱり効果あるんですね", "2025-12-21 20:15"),
    (13, None, "寝室に置いてる人多い？", "2025-12-22 11:30"),
    (14, 13, "寝室とリビング両方に置いてます", "2025-12-22 12:15"),
    (15, 13, "寝室だけ。朝起きたとき喉が楽", "2025-12-22 13:00"),
    (16, None, "湿度何%くらいにしてますか", "2025-12-22 18:45"),
    (17, 16, "50〜60%を目安にしてる", "2025-12-22 19:30"),
    (18, 16, "40%以下だと乾燥感じるから50%以上キープ", "2025-12-22 20:15"),
    (19, None, "加湿しすぎるとカビ生えるって聞いた", "2025-12-23 10:30"),
    (20, 19, "60%超えると結露も心配ですね", "2025-12-23 11:15"),
    (21, None, "湿度計も一緒に買った方がいい", "2025-12-23 15:45"),
    (22, None, "加湿器の掃除面倒くさい", "2025-12-23 20:15"),
    (23, 22, "週1でやらないとカビ生えますよね", "2025-12-23 21:00"),
    (24, None, "タンクの水毎日替えてる？", "2025-12-24 11:30"),
    (25, 24, "毎日替えてます。雑菌繁殖怖いから", "2025-12-24 12:15"),
    (26, None, "象印のスチーム式使ってる。手入れ楽", "2025-12-24 19:20"),
    (27, 26, "私も同じの使ってます。電気代高いけど", "2025-12-24 20:00"),
    (28, None, "ダイキンの加湿空気清浄機使ってる", "2025-12-25 14:30"),
    (29, 28, "空気清浄機と一体型便利ですよね", "2025-12-25 15:15"),
    (30, None, "加湿器ない部屋は濡れタオル干してる", "2025-12-25 20:30"),
    (31, 30, "洗濯物干すのもいいですよね", "2025-12-25 21:15"),
    (32, None, "やかんでお湯沸かすのも加湿になる", "2025-12-26 11:45"),
    (33, None, "観葉植物も加湿効果あるらしい", "2025-12-26 19:20"),
    (34, 33, "へー知らなかった", "2025-12-26 20:00"),
    (35, None, "加湿器使い始めてから風邪ひきにくくなった気がする", "2025-12-27 10:30"),
    (36, 35, "ウイルスも乾燥すると活発になるらしいですね", "2025-12-27 11:15"),
    (37, None, "職場が乾燥してるから卓上加湿器使ってる", "2025-12-27 18:45"),
    (38, 37, "USB式のやつ便利ですよね", "2025-12-27 19:30"),
    (39, None, "年末セールで加湿器買おうか迷ってる", "2025-12-28 14:20"),
    (40, 39, "今からでも買う価値ありますよ", "2025-12-28 15:00"),
    (41, None, "大晦日も加湿器つけっぱなし", "2025-12-31 19:30"),
    (42, None, "正月は乾燥との戦い", "2026-01-02 14:15"),
    (43, None, "帰省先に加湿器なくて辛かった", "2026-01-03 18:30"),
    (44, 43, "濡れタオルで凌いだ？", "2026-01-03 19:15"),
    (45, 44, "それとマスクして寝ました", "2026-01-03 20:00"),
    (46, None, "加湿器の良さを実感した冬", "2026-01-05 19:15"),
    (47, None, "このスレ参考になった", "2026-01-06 18:30"),
    (48, None, "乾燥対策、続けていこう", "2026-01-07 20:00"),
    (49, None, "みんなの加湿器情報助かる", "2026-01-08 19:15"),
    (50, None, "来年も加湿器活躍させる", "2026-01-09 18:30"),
    (51, None, "冬の必需品だね", "2026-01-09 20:00"),
    (52, None, "このスレありがとう", "2026-01-10 19:15"),
    (53, None, "また来年も情報交換しよう", "2026-01-10 21:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.81")
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
