#!/usr/bin/env python3
"""Insert 59 comments for thread No.47: 冬の運動不足対策"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "904622d5-7485-4724-ad94-2d1be56d1a16"
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
    (2, None, "冬になると外出るの億劫で運動不足になる。みんなどうしてますか", "2025-12-10 19:11"),
    (3, None, "室内でできる運動に切り替えてます", "2025-12-10 19:47"),
    (4, None, "ジム通いしてます。天候関係ないから", "2025-12-10 20:23"),
    (5, 3, "何やってますか？", "2025-12-11 08:14"),
    (6, 5, "踏み台昇降とYouTubeのエクササイズ動画", "2025-12-11 12:21"),
    (7, None, "診断されたばかりで運動習慣つけたいけど寒くて", "2025-12-11 12:57"),
    (8, 7, "室内運動からでいいと思いますよ", "2025-12-11 19:13"),
    (9, None, "リングフィットアドベンチャーやってます", "2025-12-11 19:49"),
    (10, None, "ゲーム感覚でできるのいいですよね", "2025-12-11 20:26"),
    (11, 9, "私もリングフィット！楽しく続けられる", "2025-12-12 08:11"),
    (12, None, "朝の散歩を続けてるけど寒さがきつい", "2025-12-12 12:18"),
    (13, None, "完全防寒で歩いてます。慣れると気持ちいい", "2025-12-12 12:54"),
    (14, 12, "私は昼間の暖かい時間に変えました", "2025-12-12 19:09"),
    (15, None, "ショッピングモール歩くのも運動になる", "2025-12-12 19:45"),
    (16, None, "暖かいし一石二鳥ですね", "2025-12-12 20:22"),
    (17, 15, "イオン歩きよくやります笑", "2025-12-13 08:17"),
    (18, None, "診断されて2年目、冬も運動サボらないようにしてる", "2025-12-13 12:23"),
    (19, 18, "えらい！どうやってモチベ保ってますか？", "2025-12-13 12:59"),
    (20, 19, "血糖値の数字見るとやる気出る", "2025-12-13 19:14"),
    (21, None, "スクワットだけでも毎日やるようにしてる", "2025-12-14 12:19"),
    (22, None, "筋トレは血糖値にいいですよね", "2025-12-14 12:55"),
    (23, 21, "私も寝る前にスクワット30回", "2025-12-14 19:11"),
    (24, None, "10年以上糖尿病で、冬の運動不足は毎年の課題", "2025-12-15 14:08"),
    (25, 24, "長年の経験でどう対策してますか？", "2025-12-15 14:44"),
    (26, 25, "ジムの会員になって強制的に行くようにしてます", "2025-12-15 19:09"),
    (27, None, "お風呂掃除とか家事も運動になる", "2025-12-15 19:45"),
    (28, None, "大掃除シーズンだからいい運動になりそう", "2025-12-15 20:22"),
    (29, 27, "家事は意外とカロリー消費しますよね", "2025-12-16 08:14"),
    (30, None, "ラジオ体操続けてます。朝やると目が覚める", "2025-12-16 12:21"),
    (31, None, "YouTubeで一緒にできるから便利", "2025-12-16 12:57"),
    (32, 30, "私も毎朝やってます", "2025-12-16 19:13"),
    (33, None, "階段使うようにしてます", "2025-12-17 12:18"),
    (34, None, "エレベーター禁止にしてる", "2025-12-17 12:54"),
    (35, 33, "日常に運動取り入れるの大事ですよね", "2025-12-17 19:09"),
    (36, None, "ストレッチだけでも毎日やるようにしてる", "2025-12-18 12:17"),
    (37, None, "体が硬いと怪我しやすいですもんね", "2025-12-18 12:53"),
    (38, 36, "私は寝る前のストレッチが日課", "2025-12-18 19:08"),
    (39, None, "年末年始、運動サボりそうで怖い", "2025-12-22 19:11"),
    (40, None, "初詣で歩くのも運動になるかな", "2025-12-22 19:47"),
    (41, 39, "少しでも体動かすの大事", "2025-12-22 20:23"),
    (42, None, "大掃除で結構動いた", "2025-12-28 15:14"),
    (43, 42, "お疲れ様です！いい運動になりましたね", "2025-12-28 15:51"),
    (44, None, "あけおめ！今年も運動頑張ります", "2026-01-01 10:17"),
    (45, 44, "あけおめ！一緒に頑張りましょう", "2026-01-01 10:53"),
    (46, None, "正月太り対策に散歩してきた", "2026-01-02 14:11"),
    (47, None, "初詣で結構歩いた。5000歩くらい", "2026-01-02 19:08"),
    (48, 46, "えらい！私は寝正月でした…", "2026-01-02 19:44"),
    (49, None, "今日から運動再開します", "2026-01-04 08:17"),
    (50, None, "私も！正月休みで鈍った体を動かさないと", "2026-01-04 12:23"),
    (51, 49, "一緒に頑張りましょう！", "2026-01-04 12:59"),
    (52, None, "仕事始まったら通勤で歩くから少しは動く", "2026-01-06 19:11"),
    (53, None, "冬でも運動続けていきたい", "2026-01-07 12:17"),
    (54, 52, "通勤も立派な運動ですよね", "2026-01-07 12:53"),
    (55, None, "このスレ参考になりました", "2026-01-08 19:08"),
    (56, 55, "お役に立てて嬉しいです", "2026-01-08 19:44"),
    (57, None, "春になるまで室内運動メインで行きます", "2026-01-10 19:11"),
    (58, None, "冬の運動仲間、一緒に頑張ろう", "2026-01-12 19:08"),
    (59, 58, "頑張りましょう！", "2026-01-12 19:44"),
    (60, None, "運動不足に負けないぞ", "2026-01-14 19:11"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.47")
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
