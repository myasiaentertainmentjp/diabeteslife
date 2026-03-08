#!/usr/bin/env python3
"""Insert 44 comments for thread No.76: 年賀状に病気のこと書く？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "e1582f6e-a118-4f31-9fe6-d210e4d5d3f3"
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
    (2, None, "年賀状に「今年は健康に気をつけます」とか書くか迷う", "2025-12-20 19:30"),
    (3, None, "糖尿病のこと年賀状で報告した人いますか", "2025-12-20 20:15"),
    (4, None, "診断されたばかりで、親戚への年賀状にどう書くか悩む", "2025-12-20 21:00"),
    (5, 4, "わざわざ書かなくていいと思いますよ", "2025-12-20 21:45"),
    (6, None, "10年以上この病気だけど、年賀状には書いたことない", "2025-12-21 10:30"),
    (7, 6, "私も書かない派です", "2025-12-21 11:15"),
    (8, None, "「健康第一で過ごします」くらいなら書いてもいいかな", "2025-12-21 15:45"),
    (9, 8, "それなら違和感ないですね", "2025-12-21 16:30"),
    (10, None, "3年目だけど親しい友人にだけ伝えてある", "2025-12-21 19:30"),
    (11, 10, "年賀状じゃなくて直接伝えるほうがいいですよね", "2025-12-21 20:15"),
    (12, None, "年賀状に病気のこと書くと心配されそう", "2025-12-22 11:30"),
    (13, 12, "余計な心配かけたくないですよね", "2025-12-22 12:15"),
    (14, None, "年賀状自体もう出してない。LINEで済ませてる", "2025-12-22 18:45"),
    (15, 14, "時代ですね。私も減らしてる", "2025-12-22 19:30"),
    (16, None, "去年「ダイエット頑張ってます」って書いたら痩せた？って聞かれた", "2025-12-23 10:30"),
    (17, 16, "それは気まずい笑", "2025-12-23 11:15"),
    (18, None, "病気のことは聞かれたら答えるスタンス", "2025-12-23 15:45"),
    (19, None, "年賀状はポジティブな内容にしたい", "2025-12-23 20:15"),
    (20, 19, "おめでたいものだから明るくいきたいですよね", "2025-12-23 21:00"),
    (21, None, "「今年は運動を始めます」って書こうかな", "2025-12-24 11:30"),
    (22, 21, "それなら自然でいいですね", "2025-12-24 12:15"),
    (23, None, "親に年賀状で報告しようか迷ってる。直接言えなくて", "2025-12-24 19:20"),
    (24, 23, "大事なことは直接伝えたほうがいいと思う", "2025-12-24 20:00"),
    (25, 23, "電話でもいいから声で伝えたほうが", "2025-12-24 20:45"),
    (26, None, "年賀状書く時期だなぁ。まだ手つけてない", "2025-12-25 14:30"),
    (27, None, "結局いつもの定型文になりそう", "2025-12-25 20:30"),
    (28, None, "年賀状に近況報告するの好きじゃない", "2025-12-26 11:45"),
    (29, 28, "プライベートさらけ出さなくていいですよね", "2025-12-26 12:30"),
    (30, None, "今年最後の投函日ギリギリ", "2025-12-27 18:45"),
    (31, None, "結局病気のことは書かずに出した", "2025-12-28 15:20"),
    (32, 31, "それでいいと思います", "2025-12-28 16:00"),
    (33, None, "年賀状届くの楽しみ", "2025-12-31 19:30"),
    (34, None, "あけおめ！年賀状届いた", "2026-01-01 10:15"),
    (35, None, "友達から「元気？」って書いてあってドキッとした", "2026-01-02 14:30"),
    (36, 35, "深い意味はないと思いますよ", "2026-01-02 15:15"),
    (37, None, "来年は年賀状やめようかな", "2026-01-03 18:45"),
    (38, None, "このスレ参考になった", "2026-01-04 19:30"),
    (39, None, "病気のことは自分のタイミングで伝えればいい", "2026-01-05 15:45"),
    (40, 39, "その通りですね", "2026-01-05 16:30"),
    (41, None, "来年の年賀状シーズンにまた悩みそう", "2026-01-06 20:00"),
    (42, None, "毎年恒例の悩みになりそう笑", "2026-01-07 18:30"),
    (43, None, "このスレまた来年見に来ます", "2026-01-07 21:00"),
    (44, None, "みんなありがとう", "2026-01-08 19:15"),
    (45, None, "年賀状問題、解決した気がする", "2026-01-08 20:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.76")
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
