#!/usr/bin/env python3
"""Insert 49 comments for thread No.42: 糖尿病と妊娠・出産"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "6333da80-260e-4210-92cf-581a61833c86"
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
    (2, None, "糖尿病で妊娠・出産した人いますか？経験談聞きたいです", "2025-12-16 19:12"),
    (3, None, "2型で出産しました。妊娠前からの血糖コントロールが大事って言われた", "2025-12-16 19:58"),
    (4, None, "1型で2人産みました。計画妊娠で準備しっかりしました", "2025-12-16 20:34"),
    (5, 3, "妊娠前のHbA1cどのくらいでしたか？", "2025-12-17 08:21"),
    (6, 5, "6.0まで下げてから妊活始めました", "2025-12-17 12:07"),
    (7, None, "妊娠糖尿病で出産後も境界型のまま", "2025-12-17 12:53"),
    (8, None, "診断されたばかりで将来の妊娠が不安です", "2025-12-17 19:18"),
    (9, 8, "ちゃんと管理すれば大丈夫ですよ。主治医に相談してみて", "2025-12-17 19:52"),
    (10, None, "妊娠中はインスリンに切り替えました", "2025-12-17 20:27"),
    (11, None, "飲み薬は妊娠中使えないものが多いですよね", "2025-12-18 08:14"),
    (12, 10, "私もです。産後は元の薬に戻りました", "2025-12-18 12:38"),
    (13, None, "妊娠中の血糖管理、食後1時間140以下って厳しかった", "2025-12-18 19:06"),
    (14, None, "分食にして乗り切りました", "2025-12-18 19:41"),
    (15, 13, "妊娠中は基準厳しいですよね", "2025-12-18 20:19"),
    (16, None, "帝王切開になった人いますか", "2025-12-19 12:23"),
    (17, None, "私は予定帝王切開でした。赤ちゃんが大きめだったので", "2025-12-19 12:57"),
    (18, 16, "私は普通分娩できました。管理次第だと思います", "2025-12-19 19:08"),
    (19, None, "産後の血糖値どうでしたか", "2025-12-19 19:43"),
    (20, None, "授乳中は低血糖になりやすかった", "2025-12-19 20:22"),
    (21, 19, "私は産後悪化して2型に移行しました", "2025-12-20 08:09"),
    (22, None, "赤ちゃんへの遺伝が心配", "2025-12-20 12:31"),
    (23, None, "子供には健康的な食生活教えてあげたい", "2025-12-20 12:56"),
    (24, 22, "予防のために生活習慣気をつけてあげるしかないですよね", "2025-12-20 19:17"),
    (25, None, "妊娠中のリブレ、保険適用になって助かった", "2025-12-20 19:48"),
    (26, None, "10年以上1型で、妊娠出産を2回経験しました", "2025-12-20 20:24"),
    (27, 26, "すごい！色々大変だったと思います", "2025-12-21 08:16"),
    (28, None, "妊娠糖尿病から産後に正常値に戻った人いますか", "2025-12-21 12:33"),
    (29, None, "戻りました。でも定期検査は続けてます", "2025-12-21 12:58"),
    (30, 28, "私は戻らなくて境界型のまま…", "2025-12-21 19:11"),
    (31, None, "産婦人科と内科の連携が大事ですよね", "2025-12-21 19:46"),
    (32, None, "総合病院で出産しました。何かあった時安心だから", "2025-12-22 12:09"),
    (33, 31, "私は糖尿病専門病院と産科で連携してもらいました", "2025-12-22 12:47"),
    (34, None, "つわりの時の血糖管理が辛かった", "2025-12-22 19:21"),
    (35, None, "食べられない時のインスリン調整が難しかった", "2025-12-22 19:53"),
    (36, 34, "つわり大変ですよね。無理せず乗り越えてください", "2025-12-23 08:18"),
    (37, None, "出産後、育児で自分の管理が疎かになりがち", "2025-12-23 12:29"),
    (38, 37, "わかります。でも自分の体も大事にしてくださいね", "2025-12-23 13:04"),
    (39, None, "あけおめ！今年妊活始める予定です", "2026-01-01 10:17"),
    (40, 39, "応援してます！頑張ってください", "2026-01-01 11:08"),
    (41, None, "このスレ参考になります", "2026-01-03 14:22"),
    (42, None, "経験者の話聞けて安心しました", "2026-01-03 15:06"),
    (43, 41, "お役に立てて嬉しいです", "2026-01-03 19:31"),
    (44, None, "糖尿病でも出産できる。希望持てる", "2026-01-04 19:14"),
    (45, 44, "ちゃんと管理すれば大丈夫ですよ", "2026-01-04 19:52"),
    (46, None, "また妊娠出産の話あったら共有しましょう", "2026-01-05 19:08"),
    (47, 46, "よろしくお願いします", "2026-01-05 19:43"),
    (48, None, "妊娠出産を考えてる人、応援してます", "2026-01-06 19:16"),
    (49, 48, "ありがとうございます！", "2026-01-06 19:51"),
    (50, None, "糖尿病ママ仲間、これからもよろしく", "2026-01-07 19:23"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.42")
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
