#!/usr/bin/env python3
"""Insert 64 comments for thread No.31: GLP-1使ってる人いますか？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "851e4cc5-5677-4506-849a-e9444e35dd6d"
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
    (2, None, "GLP-1使ってる人いますか？どんな感じですか", "2025-12-16 19:00"),
    (3, None, "リベルサス飲んでます。食欲が自然に減った", "2025-12-16 19:45"),
    (4, None, "オゼンピック週1で打ってます", "2025-12-16 20:30"),
    (5, 3, "リベルサスって飲み薬ですよね？注射じゃないの気になる", "2025-12-16 21:15"),
    (6, None, "診断されたばかりでGLP-1勧められてる。副作用どうですか", "2025-12-17 12:00"),
    (7, 6, "最初1ヶ月は吐き気あったけど慣れました", "2025-12-17 12:45"),
    (8, None, "マンジャロ始めた人いますか？", "2025-12-17 19:00"),
    (9, None, "トルリシティ使ってます。週1の注射で楽", "2025-12-17 19:45"),
    (10, 8, "先月から始めました。オゼンピックより効いてる気がする", "2025-12-17 20:30"),
    (11, None, "GLP-1で何kg痩せましたか？", "2025-12-18 12:00"),
    (12, None, "私はオゼンピックで半年で8kg減りました", "2025-12-18 12:45"),
    (13, 11, "リベルサスで5kg減。食欲減るのが大きい", "2025-12-18 19:00"),
    (14, None, "ビクトーザ使ってる人いますか？毎日注射だけど", "2025-12-18 19:45"),
    (15, None, "GLP-1の副作用で便秘になった", "2025-12-18 20:30"),
    (16, 15, "私も！水分と食物繊維意識して取ってます", "2025-12-19 08:00"),
    (17, None, "リベルサスの飲み方が面倒。起床後すぐ、水で、30分絶食", "2025-12-19 12:00"),
    (18, None, "オゼンピック高くないですか？月いくらくらい？", "2025-12-19 19:00"),
    (19, 18, "3割負担で月5000円くらいです", "2025-12-19 19:45"),
    (20, None, "GLP-1始めてからHbA1c 1.5%下がった", "2025-12-19 20:30"),
    (21, None, "吐き気対策どうしてますか？", "2025-12-20 12:00"),
    (22, 21, "少量ずつゆっくり食べるようにしてます", "2025-12-20 13:00"),
    (23, None, "週1注射と毎日飲み薬、どっちがいいんだろう", "2025-12-20 19:00"),
    (24, None, "注射苦手だからリベルサスにした", "2025-12-20 19:45"),
    (25, 23, "私は注射の方が効果実感ある。人によるかも", "2025-12-20 20:30"),
    (26, None, "GLP-1とメトホルミン併用してます", "2025-12-21 14:00"),
    (27, None, "10年以上糖尿病でGLP-1に変えてから調子いい", "2025-12-21 19:00"),
    (28, 27, "他の薬からの切り替えですか？", "2025-12-21 19:45"),
    (29, 28, "SU剤からの変更です。低血糖なくなって楽", "2025-12-21 20:30"),
    (30, None, "マンジャロとオゼンピックの違いって何ですか", "2025-12-22 12:00"),
    (31, None, "マンジャロはGLP-1とGIPのダブルらしい", "2025-12-22 12:45"),
    (32, 30, "マンジャロの方が体重減りやすいって聞いた", "2025-12-22 19:00"),
    (33, None, "年末年始、GLP-1の在庫確認しなきゃ", "2025-12-22 19:45"),
    (34, None, "食欲なさすぎて逆に心配になることある", "2025-12-23 12:00"),
    (35, 34, "わかる。でも少量でも栄養取るようにしてます", "2025-12-23 13:00"),
    (36, None, "オゼンピックの注射、全然痛くなくて拍子抜けした", "2025-12-23 19:00"),
    (37, None, "GLP-1始めてから外食の量減らせるようになった", "2025-12-24 14:00"),
    (38, None, "リベルサス7mgから14mgに増量になった", "2025-12-24 19:00"),
    (39, 38, "効果どうですか？", "2025-12-24 19:45"),
    (40, 39, "吐き気増えたけどHbA1cも下がってきた", "2025-12-24 20:30"),
    (41, None, "クリスマスケーキ、GLP-1のおかげで少量で満足できた", "2025-12-25 20:00"),
    (42, None, "GLP-1って筋肉も落ちるって本当？", "2025-12-26 12:00"),
    (43, 42, "タンパク質しっかり取って筋トレしてます", "2025-12-26 13:00"),
    (44, None, "週1注射忘れそうになる。曜日固定にしてる", "2025-12-26 19:00"),
    (45, None, "GLP-1やめたらリバウンドするのかな", "2025-12-27 14:00"),
    (46, 45, "食生活戻したらリバウンドするって聞いた", "2025-12-27 15:00"),
    (47, None, "年末年始、食欲なくて助かるかも笑", "2025-12-28 19:00"),
    (48, None, "オゼンピックの供給不足って解消された？", "2025-12-28 19:45"),
    (49, 48, "最近は普通に処方されてます", "2025-12-28 20:30"),
    (50, None, "あけおめ！今年もGLP-1と一緒に頑張ります", "2026-01-01 10:00"),
    (51, None, "正月太りしなかったのはGLP-1のおかげかも", "2026-01-01 19:00"),
    (52, None, "診断されて2年目、GLP-1でコントロール良好です", "2026-01-03 14:00"),
    (53, 52, "どの薬使ってますか？", "2026-01-03 15:00"),
    (54, 53, "オゼンピック0.5mgです", "2026-01-03 19:00"),
    (55, None, "GLP-1の情報交換できて助かる", "2026-01-04 19:00"),
    (56, None, "新しいGLP-1薬が出たら試してみたい", "2026-01-05 12:00"),
    (57, None, "胃もたれがなかなか治らない", "2026-01-05 19:00"),
    (58, 57, "脂っこいもの避けると楽になりますよ", "2026-01-05 19:45"),
    (59, None, "GLP-1って心血管にもいいらしいですね", "2026-01-06 12:00"),
    (60, None, "このスレ参考になります", "2026-01-06 19:00"),
    (61, 60, "お互い情報共有しましょう", "2026-01-06 19:45"),
    (62, None, "GLP-1のおかげで糖尿病管理が楽になった", "2026-01-07 12:00"),
    (63, None, "また新しい情報あったら書き込みます", "2026-01-07 19:00"),
    (64, 63, "よろしくお願いします！", "2026-01-07 19:45"),
    (65, None, "GLP-1仲間、これからも頑張ろう", "2026-01-07 20:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.31")
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
