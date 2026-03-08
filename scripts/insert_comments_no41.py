#!/usr/bin/env python3
"""Insert 56 comments for thread No.41: 境界型から改善した人いますか？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "d861137b-b341-422b-a3af-f2feeb7105fb"
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
    (2, None, "境界型から正常値に戻った人いますか？希望を持ちたい", "2025-12-16 19:00"),
    (3, None, "HbA1c 6.2から5.6まで下がりました。食事と運動で", "2025-12-16 19:45"),
    (4, None, "私も境界型から正常に戻りました。糖質制限が効いた", "2025-12-16 20:30"),
    (5, 3, "どのくらいの期間で下がりましたか？", "2025-12-17 08:00"),
    (6, 5, "8ヶ月くらいかかりました", "2025-12-17 12:00"),
    (7, None, "境界型と診断されたばかりで不安です", "2025-12-17 12:45"),
    (8, 7, "今なら間に合いますよ。生活習慣変えれば改善できます", "2025-12-17 19:00"),
    (9, None, "体重減らしたら数値良くなった", "2025-12-17 19:45"),
    (10, None, "5kg痩せたらHbA1c 0.5下がった", "2025-12-17 20:30"),
    (11, 9, "体重と血糖値って連動しますよね", "2025-12-18 08:00"),
    (12, None, "運動始めたら3ヶ月で数値改善した", "2025-12-18 12:00"),
    (13, None, "ウォーキング毎日30分続けてます", "2025-12-18 12:45"),
    (14, 12, "何の運動してますか？", "2025-12-18 19:00"),
    (15, 14, "ジョギングと筋トレです", "2025-12-18 19:45"),
    (16, None, "境界型のうちに対策できてよかったと思ってる", "2025-12-18 20:30"),
    (17, None, "糖尿病に移行するのが怖くて頑張ってる", "2025-12-19 12:00"),
    (18, 17, "その気持ちわかります。予防が大事ですよね", "2025-12-19 12:45"),
    (19, None, "白米を玄米に変えたら食後血糖値下がった", "2025-12-19 19:00"),
    (20, None, "野菜から食べるようにしてます", "2025-12-19 19:45"),
    (21, 19, "私ももち麦ごはんにしてます", "2025-12-19 20:30"),
    (22, None, "境界型2年目、まだ正常には戻ってないけど維持できてる", "2025-12-20 12:00"),
    (23, 22, "維持できてるだけでも十分すごいですよ", "2025-12-20 12:45"),
    (24, None, "OGTT検査で境界型って言われた", "2025-12-20 19:00"),
    (25, None, "空腹時は正常なのに食後だけ高い", "2025-12-20 19:45"),
    (26, 24, "私もOGTTで引っかかりました", "2025-12-20 20:30"),
    (27, None, "間食やめたら数値良くなった", "2025-12-21 12:00"),
    (28, None, "お菓子断ちが一番効いたかも", "2025-12-21 12:45"),
    (29, 27, "間食の影響大きいですよね", "2025-12-21 19:00"),
    (30, None, "境界型のまま10年以上。悪化してないだけマシかな", "2025-12-21 19:45"),
    (31, 30, "10年維持できてるのすごいですね", "2025-12-21 20:30"),
    (32, None, "メトホルミン処方されてる境界型の人いますか", "2025-12-22 12:00"),
    (33, None, "飲んでます。予防的に処方されました", "2025-12-22 12:45"),
    (34, 32, "境界型でも薬出ることあるんですね", "2025-12-22 19:00"),
    (35, None, "お酒やめたら数値改善した", "2025-12-22 19:45"),
    (36, None, "ストレスも関係あると思う。転職したら良くなった", "2025-12-23 12:00"),
    (37, 36, "ストレスで血糖値上がりますもんね", "2025-12-23 12:45"),
    (38, None, "年末年始、悪化しないように気をつけないと", "2025-12-23 19:00"),
    (39, None, "せっかく改善したのに戻りたくない", "2025-12-23 19:45"),
    (40, 38, "お互い頑張りましょう", "2025-12-23 20:30"),
    (41, None, "睡眠改善したら血糖値も良くなった", "2025-12-24 14:00"),
    (42, None, "7時間は寝るようにしてます", "2025-12-24 15:00"),
    (43, 41, "睡眠と血糖値の関係、最近知りました", "2025-12-24 19:00"),
    (44, None, "あけおめ！今年こそ正常値目指す", "2026-01-01 10:00"),
    (45, 44, "あけおめ！一緒に頑張りましょう", "2026-01-01 11:00"),
    (46, None, "正月太りしないように気をつけてた", "2026-01-02 14:00"),
    (47, None, "次の検査が楽しみでもあり怖くもある", "2026-01-03 14:00"),
    (48, 47, "わかります。ドキドキしますよね", "2026-01-03 15:00"),
    (49, None, "このスレ励みになる。改善した人いるんだって", "2026-01-04 19:00"),
    (50, 49, "希望持てますよね", "2026-01-04 19:45"),
    (51, None, "境界型は可逆性がある。諦めずに頑張りたい", "2026-01-05 12:00"),
    (52, None, "早期発見できたことをプラスに考えてる", "2026-01-05 19:00"),
    (53, 51, "その通りですね。まだ間に合う", "2026-01-05 19:45"),
    (54, None, "また改善報告あったら書き込みます", "2026-01-06 19:00"),
    (55, 54, "よろしくお願いします！", "2026-01-06 19:45"),
    (56, None, "境界型仲間、一緒に頑張ろう", "2026-01-07 19:00"),
    (57, 56, "頑張りましょう！", "2026-01-07 19:45"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.41")
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
