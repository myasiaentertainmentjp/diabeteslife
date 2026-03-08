#!/usr/bin/env python3
"""Insert 44 comments for thread No.50: 年越しそばは食べる？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "a2882b88-4a03-49de-960a-b6dc5d035d3d"
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
    (2, None, "年越しそば食べますか？糖質気になるけど食べたい", "2025-12-20 19:11"),
    (3, None, "糖質0麺で年越しそば作る予定", "2025-12-20 19:47"),
    (4, None, "普通のそばを半量にして食べます", "2025-12-20 20:23"),
    (5, 3, "糖質0麺でそば風になりますか？", "2025-12-21 08:14"),
    (6, 5, "つゆの味でそれっぽくなりますよ", "2025-12-21 12:21"),
    (7, None, "診断されたばかりで年越しそば諦めるべきか悩んでる", "2025-12-21 12:57"),
    (8, 7, "量を調整すれば大丈夫ですよ", "2025-12-21 19:13"),
    (9, None, "そば1人前で糖質50gくらいあるんですよね", "2025-12-22 12:18"),
    (10, None, "うどんよりはマシだけど結構ある", "2025-12-22 12:54"),
    (11, 9, "半量で25gなら許容範囲かな", "2025-12-22 19:09"),
    (12, None, "具をたくさん入れて麺少なめにする", "2025-12-23 12:17"),
    (13, None, "天ぷらそばは衣の糖質もあるから注意", "2025-12-23 12:53"),
    (14, 12, "鶏肉とか卵入れるとタンパク質も取れていいですね", "2025-12-23 19:08"),
    (15, None, "診断されて3年目、毎年糖質0麺で年越ししてる", "2025-12-24 14:11"),
    (16, 15, "もう慣れましたか？", "2025-12-24 14:47"),
    (17, 16, "最初は物足りなかったけど今は平気", "2025-12-24 19:09"),
    (18, None, "10年以上糖尿病だけど、年越しそばは毎年食べてます", "2025-12-25 14:08"),
    (19, 18, "普通のそばですか？", "2025-12-25 14:44"),
    (20, 19, "半量にして具沢山にしてます", "2025-12-25 19:11"),
    (21, None, "低糖質そばって売ってないのかな", "2025-12-26 12:17"),
    (22, None, "探したけど見つからなかった", "2025-12-26 12:53"),
    (23, 21, "糖質0麺にそばつゆが現実的かも", "2025-12-26 19:08"),
    (24, None, "大晦日に備えて糖質0麺買ってきた", "2025-12-28 14:11"),
    (25, 24, "準備万端ですね！", "2025-12-28 14:47"),
    (26, None, "年越しそばの具は何入れますか", "2025-12-29 19:08"),
    (27, None, "ネギ、かまぼこ、鶏肉が定番", "2025-12-29 19:44"),
    (28, 26, "私は卵とわかめ", "2025-12-29 20:21"),
    (29, None, "今夜年越しそば食べます！", "2025-12-31 18:08"),
    (30, None, "私も今から準備", "2025-12-31 18:44"),
    (31, 29, "楽しんでください！", "2025-12-31 19:21"),
    (32, None, "年越しそば食べました！糖質0麺で満足", "2025-12-31 22:14"),
    (33, None, "私も食べた。半量で我慢した", "2025-12-31 22:51"),
    (34, 32, "おいしかったですか？", "2025-12-31 23:28"),
    (35, 34, "つゆがおいしければ満足できます", "2026-01-01 00:07"),
    (36, None, "あけおめ！無事年越しできました", "2026-01-01 00:23"),
    (37, 36, "あけおめ！お互い頑張りましたね", "2026-01-01 08:11"),
    (38, None, "年越しそば問題、クリアできてよかった", "2026-01-01 10:17"),
    (39, None, "このスレ参考になりました", "2026-01-02 19:08"),
    (40, 39, "お役に立てて嬉しいです", "2026-01-02 19:44"),
    (41, None, "来年も参考にします", "2026-01-03 19:11"),
    (42, None, "年越しそば、工夫次第で楽しめる", "2026-01-04 19:08"),
    (43, 42, "本当にそう思います", "2026-01-04 19:44"),
    (44, None, "また来年の大晦日に！", "2026-01-05 19:11"),
    (45, 44, "来年もよろしくお願いします", "2026-01-05 19:47"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.50")
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
