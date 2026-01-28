#!/usr/bin/env python3
"""Insert 58 comments for thread No.52: 正月太り対策"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "a0a596bc-809c-4049-a0f1-420d0d634302"
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
    (2, None, "正月太り対策どうしてますか？毎年太る…", "2025-12-22 19:11"),
    (3, None, "食べすぎた翌日は調整するようにしてます", "2025-12-22 19:47"),
    (4, None, "お餅は1日1個までって決めてる", "2025-12-22 20:23"),
    (5, 3, "どんな調整してますか？", "2025-12-23 08:14"),
    (6, 5, "糖質を減らして野菜とタンパク質中心にしてます", "2025-12-23 12:21"),
    (7, None, "診断されたばかりで初めての正月。太りたくない", "2025-12-23 12:57"),
    (8, 7, "食べるものを選べば大丈夫ですよ", "2025-12-23 19:13"),
    (9, None, "運動は続けるつもり", "2025-12-23 19:49"),
    (10, None, "初詣で歩くのも運動になる", "2025-12-23 20:26"),
    (11, 9, "私も散歩だけは続けます", "2025-12-24 08:11"),
    (12, None, "毎日体重計に乗るようにしてる", "2025-12-24 12:17"),
    (13, None, "増えたらすぐ対策できますもんね", "2025-12-24 12:53"),
    (14, 12, "見える化大事ですよね", "2025-12-24 19:08"),
    (15, None, "診断されて3年目、正月太りは毎年の課題", "2025-12-25 14:11"),
    (16, 15, "どう対策してますか？", "2025-12-25 14:47"),
    (17, 16, "おせちは糖質低いものを選んで、お餅は控えてます", "2025-12-25 19:09"),
    (18, None, "帰省すると食べろ攻撃が…", "2025-12-26 12:17"),
    (19, None, "実家だとコントロール難しいですよね", "2025-12-26 12:53"),
    (20, 18, "「ダイエット中」って言って断ってます", "2025-12-26 19:08"),
    (21, None, "10年以上糖尿病で、正月太り対策は慣れてきた", "2025-12-27 14:11"),
    (22, 21, "コツ教えてください！", "2025-12-27 14:47"),
    (23, 22, "三が日だけと決めて、4日からは通常モードに戻す", "2025-12-27 19:08"),
    (24, None, "年末年始も朝食は普通にしてる", "2025-12-28 12:17"),
    (25, None, "夜だけ少し緩めて朝昼は普通がいいかも", "2025-12-28 12:53"),
    (26, 24, "メリハリ大事ですよね", "2025-12-28 19:08"),
    (27, None, "大掃除で動いたから運動になったはず", "2025-12-29 15:11"),
    (28, 27, "いい運動になりますよね", "2025-12-29 15:47"),
    (29, None, "明日から正月。気をつけます", "2025-12-31 19:08"),
    (30, 29, "お互い頑張りましょう！", "2025-12-31 19:44"),
    (31, None, "あけおめ！今日は食べすぎ注意", "2026-01-01 10:14"),
    (32, None, "あけおめ！お餅2個で我慢した", "2026-01-01 10:51"),
    (33, 31, "私は1個にしました", "2026-01-01 11:28"),
    (34, None, "初詣行ってきた。結構歩いた", "2026-01-01 15:11"),
    (35, 34, "いい運動になりましたね", "2026-01-01 15:47"),
    (36, None, "正月2日目、体重微増…", "2026-01-02 08:14"),
    (37, None, "まだ許容範囲。これ以上増やさないように", "2026-01-02 12:17"),
    (38, 36, "私も少し増えた。今日から気をつける", "2026-01-02 12:53"),
    (39, None, "三が日終わった！通常モードに戻す", "2026-01-03 10:14"),
    (40, None, "私も今日から節制します", "2026-01-03 10:51"),
    (41, 39, "切り替え大事ですね", "2026-01-03 14:08"),
    (42, None, "体重1kg増えた…戻さないと", "2026-01-04 08:14"),
    (43, None, "1kgなら1週間で戻せますよ", "2026-01-04 12:17"),
    (44, 42, "私は2kg増…頑張ります", "2026-01-04 12:53"),
    (45, None, "仕事始まったら生活リズム戻るかな", "2026-01-05 19:08"),
    (46, 45, "通勤で歩くから少しは動きますよね", "2026-01-05 19:44"),
    (47, None, "正月太りリセット作戦開始", "2026-01-06 12:17"),
    (48, None, "糖質制限と運動で戻します", "2026-01-06 12:53"),
    (49, 47, "頑張ってください！", "2026-01-06 19:08"),
    (50, None, "1週間で体重戻ってきた", "2026-01-10 19:11"),
    (51, 50, "すごい！どうやって戻しましたか？", "2026-01-10 19:47"),
    (52, 51, "夕食の糖質減らして毎日ウォーキングしました", "2026-01-10 20:23"),
    (53, None, "私もやっと元に戻った", "2026-01-12 19:08"),
    (54, None, "お疲れ様でした！", "2026-01-12 19:44"),
    (55, 53, "今年は正月太り最小限で済んだ", "2026-01-12 20:21"),
    (56, None, "このスレのおかげで意識できた", "2026-01-14 19:08"),
    (57, 56, "お互い頑張りましたね", "2026-01-14 19:44"),
    (58, None, "来年も正月太り対策頑張ろう", "2026-01-15 19:11"),
    (59, 58, "また年末に集まりましょう", "2026-01-15 19:47"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.52")
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
