#!/usr/bin/env python3
"""Insert 54 comments for thread No.48: おせち料理の糖質"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "f11f5cde-70fe-4db3-9828-62a9f5ff03fc"
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
    (2, None, "おせち料理って糖質どのくらいあるんでしょう？", "2025-12-14 19:08"),
    (3, None, "栗きんとんがダントツで高い。1人前で糖質40gくらい", "2025-12-14 19:44"),
    (4, None, "黒豆も甘いから結構あるよね", "2025-12-14 20:21"),
    (5, 3, "40g!?ご飯1杯分じゃん…", "2025-12-15 08:17"),
    (6, None, "診断されたばかりでおせちの糖質知らなかった", "2025-12-15 12:23"),
    (7, 6, "甘い系は要注意ですよ", "2025-12-15 12:59"),
    (8, None, "数の子は糖質ほぼゼロで安心", "2025-12-15 19:14"),
    (9, None, "かまぼこも意外と糖質あるらしい", "2025-12-15 19:51"),
    (10, 8, "数の子大好きだから嬉しい", "2025-12-15 20:28"),
    (11, None, "伊達巻は甘いからダメかな", "2025-12-16 12:19"),
    (12, None, "1切れで糖質7gくらいって聞いた", "2025-12-16 12:55"),
    (13, 11, "ラカントで手作りすれば糖質カットできますよ", "2025-12-16 19:11"),
    (14, None, "田作りはタンパク質取れていい", "2025-12-16 19:47"),
    (15, None, "煮しめは根菜が糖質高め", "2025-12-16 20:23"),
    (16, 15, "里芋とか人参とかね", "2025-12-17 08:14"),
    (17, None, "診断されて4年目、おせちは選んで食べてる", "2025-12-17 12:21"),
    (18, 17, "何を選んでますか？", "2025-12-17 12:57"),
    (19, 18, "数の子、田作り、昆布巻き、なますがメイン", "2025-12-17 19:13"),
    (20, None, "なますは酢の物だから糖質低め？", "2025-12-17 19:49"),
    (21, None, "砂糖使うけど大根とにんじんだからマシかな", "2025-12-17 20:26"),
    (22, 20, "酢が血糖値の上昇を緩やかにするって聞いた", "2025-12-18 08:11"),
    (23, None, "10年以上糖尿病で、おせちは毎年悩む", "2025-12-18 12:18"),
    (24, 23, "毎年のことなのに悩みますよね", "2025-12-18 12:54"),
    (25, None, "低糖質おせち通販で頼んだ", "2025-12-18 19:09"),
    (26, None, "どこのですか？", "2025-12-18 19:45"),
    (27, 25, "紀文の糖質オフおせちです", "2025-12-18 20:22"),
    (28, None, "お餅が一番糖質高いよね", "2025-12-19 12:17"),
    (29, None, "切り餅1個で糖質25gくらい", "2025-12-19 12:53"),
    (30, 28, "お餅は我慢してます…", "2025-12-19 19:08"),
    (31, None, "昆布巻きは糖質低めで安心", "2025-12-20 12:14"),
    (32, None, "食物繊維も取れていいですよね", "2025-12-20 12:51"),
    (33, 31, "昆布巻き好きだから嬉しい", "2025-12-20 19:07"),
    (34, None, "エビは糖質ゼロでOK", "2025-12-21 12:19"),
    (35, None, "海老の煮物とかいいですね", "2025-12-21 12:55"),
    (36, 34, "殻むくの面倒だけど糖質気にせず食べられる", "2025-12-21 19:11"),
    (37, None, "おせち届いた！糖質表示確認しながら食べる", "2025-12-30 14:08"),
    (38, 37, "私も届きました！楽しみ", "2025-12-30 14:44"),
    (39, None, "あけおめ！おせち食べてます", "2026-01-01 10:17"),
    (40, None, "あけおめ！数の子おいしい", "2026-01-01 10:53"),
    (41, 39, "糖質低いものメインで食べてます", "2026-01-01 11:29"),
    (42, None, "栗きんとん一口だけ食べた", "2026-01-01 12:14"),
    (43, None, "一口で我慢えらい！", "2026-01-01 12:51"),
    (44, 42, "味わえれば満足です", "2026-01-01 19:08"),
    (45, None, "黒豆食べすぎた…", "2026-01-02 10:14"),
    (46, 45, "おいしいから仕方ない", "2026-01-02 10:51"),
    (47, None, "おせち残ってるけどもう飽きた", "2026-01-02 19:08"),
    (48, None, "三が日終わったらおせち終了", "2026-01-03 12:17"),
    (49, 47, "うちも同じ状況です笑", "2026-01-03 12:53"),
    (50, None, "このスレのおかげで糖質把握できた", "2026-01-04 19:08"),
    (51, 50, "お役に立てて嬉しいです", "2026-01-04 19:44"),
    (52, None, "来年のおせち選びの参考にします", "2026-01-05 19:11"),
    (53, None, "おせちの糖質、意外と知らないことが多かった", "2026-01-06 19:08"),
    (54, 53, "私も勉強になりました", "2026-01-06 19:44"),
    (55, None, "また来年のお正月に！", "2026-01-07 19:11"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.48")
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
