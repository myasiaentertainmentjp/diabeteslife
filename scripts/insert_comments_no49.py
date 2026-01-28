#!/usr/bin/env python3
"""Insert 54 comments for thread No.49: 寒いと血糖値上がりませんか？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "1aeb5bab-b8b7-4d31-93dc-46cdb55bf77b"
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
    (2, None, "冬になると血糖値上がりませんか？寒さのせい？", "2025-12-10 19:14"),
    (3, None, "私も冬は高めになります。運動不足もあるかも", "2025-12-10 19:51"),
    (4, None, "寒いとストレスホルモン出るから上がるらしい", "2025-12-10 20:28"),
    (5, 4, "コルチゾールってやつですか？", "2025-12-11 08:11"),
    (6, 5, "そうです。体温維持のために血糖値上げるらしい", "2025-12-11 12:17"),
    (7, None, "診断されたばかりで初めての冬。確かに数値高め", "2025-12-11 12:53"),
    (8, 7, "季節の変動あるから気にしすぎないでくださいね", "2025-12-11 19:09"),
    (9, None, "朝の冷え込みがきつい日は特に高い", "2025-12-11 19:45"),
    (10, None, "暁現象が冬に悪化する気がする", "2025-12-11 20:22"),
    (11, 9, "私もです。朝起きた時点で140超えてる", "2025-12-12 08:14"),
    (12, None, "部屋を暖かくしておくと少しマシ", "2025-12-12 12:21"),
    (13, None, "タイマーで暖房つけておくといいかも", "2025-12-12 12:57"),
    (14, 12, "起床前に部屋暖めておくと体の負担も減りそう", "2025-12-12 19:13"),
    (15, None, "診断されて2年目、去年も冬は高かった", "2025-12-13 12:19"),
    (16, 15, "毎年のことなんですね", "2025-12-13 12:55"),
    (17, None, "運動不足も原因だと思う。外出たくない", "2025-12-13 19:11"),
    (18, None, "室内運動で補ってます", "2025-12-13 19:47"),
    (19, 17, "ジムに通うようにしてます", "2025-12-13 20:23"),
    (20, None, "10年以上糖尿病で、冬の血糖上昇は毎年の課題", "2025-12-14 14:11"),
    (21, 20, "長年の経験で対策ありますか？", "2025-12-14 14:47"),
    (22, 21, "冬は薬を少し増やしてもらってます。主治医と相談で", "2025-12-14 19:08"),
    (23, None, "食事の量は変わってないのに上がる", "2025-12-15 12:17"),
    (24, None, "基礎代謝が変わるんですかね", "2025-12-15 12:53"),
    (25, 23, "活動量が減ってるのかも", "2025-12-15 19:09"),
    (26, None, "温かい飲み物で体温めるようにしてる", "2025-12-15 19:45"),
    (27, None, "白湯飲んでます", "2025-12-15 20:22"),
    (28, 26, "生姜湯もいいですよ。体ぽかぽかになる", "2025-12-16 08:14"),
    (29, None, "お風呂でしっかり温まるようにしてます", "2025-12-16 12:21"),
    (30, None, "血行良くなると血糖値にもいいのかな", "2025-12-16 12:57"),
    (31, 29, "入浴後は血糖値下がることが多いです", "2025-12-16 19:13"),
    (32, None, "リブレで見ると冬の変動がよくわかる", "2025-12-17 12:18"),
    (33, None, "CGMあると季節変動も把握できていいですよね", "2025-12-17 12:54"),
    (34, 32, "データで見ると納得できる", "2025-12-17 19:09"),
    (35, None, "年末年始はさらに上がりそうで怖い", "2025-12-22 19:11"),
    (36, 35, "食事と寒さのダブルパンチですね", "2025-12-22 19:47"),
    (37, None, "今日めちゃくちゃ寒い。血糖値高め", "2025-12-25 08:14"),
    (38, None, "クリスマス寒波ですね", "2025-12-25 12:21"),
    (39, 37, "私も今朝高かった", "2025-12-25 12:57"),
    (40, None, "あけおめ！年明けも寒いですね", "2026-01-01 10:14"),
    (41, 40, "あけおめ！寒さと正月食で血糖値やばい", "2026-01-01 10:51"),
    (42, None, "正月明けの検査が怖い", "2026-01-03 14:08"),
    (43, None, "冬だから多少は仕方ないって開き直ってる", "2026-01-03 14:44"),
    (44, 42, "私も。でもできることはやっておきたい", "2026-01-03 19:09"),
    (45, None, "暖かくなるまであと数ヶ月…頑張ろう", "2026-01-05 19:11"),
    (46, None, "春が待ち遠しい", "2026-01-05 19:47"),
    (47, 45, "一緒に乗り切りましょう", "2026-01-05 20:23"),
    (48, None, "このスレで冬の血糖上昇が自分だけじゃないってわかって安心", "2026-01-07 19:08"),
    (49, 48, "みんな同じ悩み持ってますよね", "2026-01-07 19:44"),
    (50, None, "冬の対策、また情報共有しましょう", "2026-01-10 19:11"),
    (51, 50, "よろしくお願いします", "2026-01-10 19:47"),
    (52, None, "寒さに負けずに血糖管理頑張ろう", "2026-01-12 19:08"),
    (53, 52, "頑張りましょう！", "2026-01-12 19:44"),
    (54, None, "冬の血糖管理仲間、これからもよろしく", "2026-01-14 19:11"),
    (55, 54, "よろしくお願いします！", "2026-01-14 19:47"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.49")
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
