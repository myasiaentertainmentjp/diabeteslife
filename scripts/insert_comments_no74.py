#!/usr/bin/env python3
"""Insert 53 comments for thread No.74: 冬の水分補給"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "957abbbc-b0a3-4be8-83d0-de549da0532a"
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
    (2, None, "冬って水分補給忘れがち。気づいたら喉カラカラ", "2025-12-20 19:30"),
    (3, None, "汗かかないから水分取らなくていいと思ってた", "2025-12-20 20:15"),
    (4, None, "診断されたばかりで水分補給の大切さを痛感してる", "2025-12-20 21:00"),
    (5, 4, "脱水は血糖値にも影響しますからね", "2025-12-20 21:45"),
    (6, None, "10年以上糖尿病だけど、冬の水分補給は意識してる", "2025-12-21 10:30"),
    (7, 6, "さすがベテランですね", "2025-12-21 11:15"),
    (8, None, "暖房で乾燥するから水分必要なんだよね", "2025-12-21 15:45"),
    (9, 8, "暖房の部屋にいると気づかないうちに脱水になる", "2025-12-21 16:30"),
    (10, None, "1日どのくらい水分取ってますか", "2025-12-21 19:30"),
    (11, 10, "1.5〜2リットルくらいを目標にしてます", "2025-12-21 20:15"),
    (12, 10, "コップ8杯を目安にしてる", "2025-12-21 21:00"),
    (13, None, "3年目だけど冬は水分取るの忘れる", "2025-12-22 11:30"),
    (14, 13, "アラームかけて飲むようにしてます", "2025-12-22 12:15"),
    (15, None, "冷たい水は飲みにくい。白湯にしてる", "2025-12-22 18:45"),
    (16, 15, "白湯いいですよね。体も温まる", "2025-12-22 19:30"),
    (17, None, "トイレ近くなるから水分控えてた。良くないよね", "2025-12-23 10:30"),
    (18, 17, "我慢しないほうがいいですよ。腎臓のためにも", "2025-12-23 11:15"),
    (19, None, "寝る前は水分控えたほうがいいのかな", "2025-12-23 15:45"),
    (20, 19, "就寝直前は控えめに、でもコップ1杯くらいはいいかと", "2025-12-23 16:30"),
    (21, None, "起きたらまず水を飲むようにしてる", "2025-12-23 20:15"),
    (22, 21, "寝てる間に脱水になってるから朝の水分大事", "2025-12-23 21:00"),
    (23, None, "お茶やコーヒーでも水分補給になるのかな", "2025-12-24 11:30"),
    (24, 23, "カフェインは利尿作用あるから水も飲んだほうがいい", "2025-12-24 12:15"),
    (25, 23, "ノンカフェインのお茶なら大丈夫", "2025-12-24 13:00"),
    (26, None, "マイボトル持ち歩いてる人いますか", "2025-12-24 19:20"),
    (27, 26, "いつも持ち歩いてます。飲む量が可視化できていい", "2025-12-24 20:00"),
    (28, 26, "サーモスのマグボトル愛用してる", "2025-12-24 20:45"),
    (29, None, "脱水になると血液ドロドロになるって聞いた", "2025-12-25 14:30"),
    (30, 29, "血栓のリスクも上がるらしいですね", "2025-12-25 15:15"),
    (31, None, "スポーツドリンクは糖質高いから避けてる", "2025-12-25 20:30"),
    (32, 31, "経口補水液のほうがまだマシ", "2025-12-25 21:15"),
    (33, None, "水分取りすぎてむくむことある？", "2025-12-26 11:45"),
    (34, 33, "腎機能に問題なければ大丈夫だと思う", "2025-12-26 12:30"),
    (35, None, "職場が乾燥してるからデスクに水筒置いてる", "2025-12-26 19:20"),
    (36, None, "意識しないと本当に水飲まないんだよね", "2025-12-27 10:30"),
    (37, None, "アプリで水分摂取量記録してる人いますか", "2025-12-27 18:45"),
    (38, 37, "使ってます。リマインドしてくれるから便利", "2025-12-27 19:30"),
    (39, None, "年末年始、お酒の代わりに水飲もう", "2025-12-28 15:20"),
    (40, None, "正月も水分補給忘れずに", "2026-01-02 14:15"),
    (41, None, "帰省先でも水筒持参した", "2026-01-03 18:30"),
    (42, None, "冬こそ水分補給が大事だと実感", "2026-01-04 19:15"),
    (43, None, "このスレ見て水飲む習慣ついた", "2026-01-05 15:45"),
    (44, None, "地味だけど大事なことだよね", "2026-01-06 18:30"),
    (45, None, "みんなで水分補給頑張ろう", "2026-01-07 20:00"),
    (46, None, "脱水予防で健康管理", "2026-01-08 19:15"),
    (47, None, "来年の冬も意識していこう", "2026-01-09 18:45"),
    (48, None, "このスレ参考になった", "2026-01-09 21:00"),
    (49, None, "水分補給、続けていきます", "2026-01-10 18:30"),
    (50, None, "冬も夏も水分は大事", "2026-01-10 20:15"),
    (51, None, "みんなありがとう", "2026-01-11 19:00"),
    (52, None, "健康のために水を飲もう", "2026-01-11 20:30"),
    (53, None, "このスレまた見に来ます", "2026-01-11 21:15"),
    (54, None, "冬の水分補給、忘れずに", "2026-01-12 18:45"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.74")
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
