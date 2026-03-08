#!/usr/bin/env python3
"""Insert 54 comments for thread No.40: Dexcom使ってる人いますか？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "5a04c73d-ad94-4937-a143-e00cde36db84"
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
    (2, None, "Dexcom使ってる人いますか？リブレと迷ってます", "2025-12-16 19:00"),
    (3, None, "G7使ってます。リアルタイムで数値見れるのがいい", "2025-12-16 19:45"),
    (4, None, "G6から使ってます。精度高いですよ", "2025-12-16 20:30"),
    (5, 3, "アラーム機能どうですか？", "2025-12-17 08:00"),
    (6, 5, "低血糖アラート設定できるから安心です。夜中も起こしてくれる", "2025-12-17 12:00"),
    (7, None, "診断されたばかりでCGM検討中。Dexcomって高いですか", "2025-12-17 12:45"),
    (8, 7, "保険適用なら月5000円くらいです", "2025-12-17 19:00"),
    (9, None, "リブレとDexcomの違いって何ですか", "2025-12-17 19:45"),
    (10, None, "Dexcomはリアルタイム、リブレはスキャン式。アラームはDexcomの方が優秀", "2025-12-17 20:30"),
    (11, 9, "精度もDexcomの方がいいって聞きますね", "2025-12-18 08:00"),
    (12, None, "G7のセンサー交換10日ごとだよね", "2025-12-18 12:00"),
    (13, None, "リブレより短いけど精度はいい", "2025-12-18 12:45"),
    (14, 12, "交換の手間はあるけど慣れました", "2025-12-18 19:00"),
    (15, None, "インスリンポンプと連携してる人いますか", "2025-12-18 19:45"),
    (16, None, "t:slimと連携させてます。自動調整が楽", "2025-12-18 20:30"),
    (17, 15, "オムニポッド5との連携もできるらしいですね", "2025-12-19 08:00"),
    (18, None, "Dexcomのアプリ使いやすいですか", "2025-12-19 12:00"),
    (19, None, "Clarityってアプリでグラフ見れます。見やすいですよ", "2025-12-19 12:45"),
    (20, 18, "家族にも数値共有できるのがいい", "2025-12-19 19:00"),
    (21, None, "センサーの装着場所どこにしてますか", "2025-12-19 19:45"),
    (22, None, "お腹がメインです。腕も使えるみたい", "2025-12-19 20:30"),
    (23, 21, "私は二の腕の裏側につけてます", "2025-12-20 08:00"),
    (24, None, "10年以上1型で、Dexcomに変えてからQOL上がった", "2025-12-20 12:00"),
    (25, 24, "やっぱり1型の方には必需品ですよね", "2025-12-20 12:45"),
    (26, None, "センサーが剥がれる時どうしてますか", "2025-12-20 19:00"),
    (27, None, "オーバーパッチ使ってます", "2025-12-20 19:45"),
    (28, 26, "skin tacっていう接着剤塗ってからつけると剥がれにくい", "2025-12-20 20:30"),
    (29, None, "夜間低血糖がDexcomのおかげで減った", "2025-12-21 12:00"),
    (30, None, "アラートで起きられるから安心ですよね", "2025-12-21 12:45"),
    (31, 29, "私も夜中のアラートに何度も助けられた", "2025-12-21 19:00"),
    (32, None, "診断されて3年目、最近Dexcomデビューしました", "2025-12-21 19:45"),
    (33, 32, "使い心地どうですか？", "2025-12-21 20:30"),
    (34, 33, "もっと早く使えばよかったと思ってます", "2025-12-22 08:00"),
    (35, None, "Apple Watchで血糖値見れるのがいい", "2025-12-22 12:00"),
    (36, None, "運動中もすぐ確認できて便利", "2025-12-22 12:45"),
    (37, 35, "ウォッチフェイスに常時表示してます", "2025-12-22 19:00"),
    (38, None, "センサーエラー出たことありますか", "2025-12-23 12:00"),
    (39, None, "たまにあります。サポートに連絡したら交換してくれた", "2025-12-23 12:45"),
    (40, 38, "私も一度あった。対応良かったです", "2025-12-23 19:00"),
    (41, None, "年末年始用にセンサー多めに確保した", "2025-12-24 14:00"),
    (42, 41, "大事ですよね。切れたら困る", "2025-12-24 15:00"),
    (43, None, "あけおめ！今年もDexcomにお世話になります", "2026-01-01 10:00"),
    (44, 43, "あけおめ！Dexcom仲間よろしく", "2026-01-01 11:00"),
    (45, None, "Dexcom使い始めてから主治医との会話が増えた", "2026-01-03 14:00"),
    (46, None, "データ見せやすいですよね", "2026-01-03 15:00"),
    (47, 45, "グラフで傾向がわかるから相談しやすい", "2026-01-03 19:00"),
    (48, None, "このスレ参考になります", "2026-01-04 19:00"),
    (49, 48, "Dexcomの情報交換できて助かりますよね", "2026-01-04 19:45"),
    (50, None, "また新しい情報あったら共有しましょう", "2026-01-05 19:00"),
    (51, 50, "よろしくお願いします", "2026-01-05 19:45"),
    (52, None, "Dexcomのおかげで血糖管理が楽になった", "2026-01-06 19:00"),
    (53, None, "テクノロジーに感謝", "2026-01-06 19:45"),
    (54, 52, "本当にそう思います", "2026-01-06 20:30"),
    (55, None, "Dexcom仲間、これからもよろしく", "2026-01-07 19:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.40")
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
