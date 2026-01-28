#!/usr/bin/env python3
"""Insert 55 comments for thread No.70: 節分の恵方巻き"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "953d6926-a456-4e64-bd4d-107f0290f033"
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
    (2, None, "恵方巻き食べたいけど糖質やばいよね", "2025-12-21 19:30"),
    (3, None, "酢飯がたっぷりだから結構糖質あるよね", "2025-12-21 20:15"),
    (4, None, "診断されたばかりで初めての節分。恵方巻きどうしよう", "2025-12-21 21:00"),
    (5, 4, "具だけ食べるって手もありますよ", "2025-12-21 21:45"),
    (6, None, "10年以上糖尿病だけど、節分だけは恵方巻き食べてる", "2025-12-22 10:30"),
    (7, 6, "年に一度の楽しみですもんね", "2025-12-22 11:15"),
    (8, None, "低糖質の恵方巻きってどこかで売ってないかな", "2025-12-22 15:45"),
    (9, 8, "去年ローソンで見たような気がする", "2025-12-22 16:30"),
    (10, 8, "今年も出るかチェックしないと", "2025-12-22 17:15"),
    (11, None, "3年目だけど去年はカリフラワーライスで自作した", "2025-12-23 11:30"),
    (12, 11, "カリフラワーライスで巻けるんですか？", "2025-12-23 12:15"),
    (13, 12, "結構バラバラになるけど、なんとか形になりました笑", "2025-12-23 13:00"),
    (14, None, "こんにゃく米で恵方巻き作った人いますか", "2025-12-23 18:45"),
    (15, 14, "やったことあります。普通の米と混ぜると巻きやすい", "2025-12-23 19:30"),
    (16, None, "海苔で具だけ巻いて食べるのもありかな", "2025-12-24 11:30"),
    (17, 16, "それなら糖質ほぼゼロでいけますね", "2025-12-24 12:15"),
    (18, None, "恵方巻きの具って何が入ってるのが正式なんだろう", "2025-12-24 19:20"),
    (19, 18, "七福神にちなんで7種類らしいですよ", "2025-12-24 20:00"),
    (20, None, "刺身だけ買って手巻き寿司風にする予定", "2025-12-25 14:30"),
    (21, None, "恵方巻き1本で糖質どのくらいあるんだろう", "2025-12-25 19:45"),
    (22, 21, "サイズによるけど70〜100gくらいじゃないかな", "2025-12-25 20:30"),
    (23, 21, "ご飯茶碗2杯分くらいと思っておけば", "2025-12-25 21:15"),
    (24, None, "半分だけ食べて残りは家族に食べてもらう作戦", "2025-12-26 11:30"),
    (25, 24, "切ったら縁起悪いって言うけど気にしない派", "2025-12-26 12:15"),
    (26, None, "ミニサイズの恵方巻き探そうかな", "2025-12-26 19:20"),
    (27, None, "恵方巻き食べたあとは運動するしかない", "2025-12-27 14:30"),
    (28, 27, "食後のウォーキング大事ですよね", "2025-12-27 15:15"),
    (29, None, "薄焼き卵で巻いたらどうだろう", "2025-12-28 10:45"),
    (30, 29, "卵焼き寿司みたいでいいかも", "2025-12-28 11:30"),
    (31, None, "オートミールで酢飯風に作れないかな", "2025-12-28 18:30"),
    (32, 31, "オートミール米化して酢飯にしたことあります。いける", "2025-12-28 19:15"),
    (33, None, "今年は豆まきだけにしようかな", "2025-12-29 15:20"),
    (34, None, "豆も食べすぎると糖質あるよね", "2025-12-30 11:30"),
    (35, 34, "年の数だけ食べるって言うけど何十粒も食べたら結構な量", "2025-12-30 12:15"),
    (36, None, "節分の献立どうしようか考え中", "2025-12-31 19:45"),
    (37, None, "恵方巻きの予約もう始まってるね", "2026-01-05 11:30"),
    (38, None, "低糖質恵方巻き、今年はどこか出してくれないかな", "2026-01-07 14:20"),
    (39, None, "コンビニの恵方巻き情報チェックしてる", "2026-01-10 18:30"),
    (40, None, "シャリ少なめのやつあったらいいのに", "2026-01-12 15:45"),
    (41, None, "サラダ巻きなら糖質少しマシかな", "2026-01-15 19:20"),
    (42, 41, "マヨネーズ入ってる分、普通の巻き寿司よりカロリーは高いかも", "2026-01-15 20:00"),
    (43, None, "海鮮恵方巻きにしようかな。具が豪華なやつ", "2026-01-18 14:30"),
    (44, None, "あと2週間で節分だ", "2026-01-20 19:15"),
    (45, None, "今年は自作することにした。糖質コントロールしやすい", "2026-01-22 18:30"),
    (46, None, "恵方巻き用の具だけ買ってきた", "2026-01-25 15:20"),
    (47, None, "こんにゃく米届いた。これで作る", "2026-01-27 19:00"),
    (48, None, "明後日が節分。楽しみになってきた", "2026-01-31 20:30"),
    (49, None, "今年の恵方は南南東だっけ", "2026-02-01 11:45"),
    (50, None, "明日の準備完了。自作恵方巻き頑張る", "2026-02-02 19:30"),
    (51, None, "恵方巻き食べた！美味しかった", "2026-02-03 19:45"),
    (52, 51, "血糖値どうでした？", "2026-02-03 20:30"),
    (53, 52, "こんにゃく米で作ったから思ったより上がらなかった", "2026-02-03 21:15"),
    (54, None, "海苔で具だけ巻いて食べた。これはこれでアリ", "2026-02-03 21:45"),
    (55, None, "来年も低糖質バージョンで楽しもう", "2026-02-04 18:30"),
    (56, None, "このスレ来年も参考にする", "2026-02-04 20:15"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.70")
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
