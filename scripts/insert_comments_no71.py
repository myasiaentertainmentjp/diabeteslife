#!/usr/bin/env python3
"""Insert 52 comments for thread No.71: 冬季うつと血糖値"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "b306d341-4d9d-4483-af64-ca601a7408d3"
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
    (2, None, "冬になると気分が落ち込む。血糖値も不安定になる気がする", "2025-12-20 19:45"),
    (3, None, "日照時間短いとメンタルにくるよね", "2025-12-20 20:30"),
    (4, None, "診断されたばかりで気持ちが沈みがち。冬だから余計に", "2025-12-20 21:15"),
    (5, 4, "最初は落ち込みますよね。無理しないでくださいね", "2025-12-20 22:00"),
    (6, None, "10年以上この病気と付き合ってるけど、冬は毎年つらい", "2025-12-21 10:30"),
    (7, 6, "長く付き合ってても冬は気分下がりますよね", "2025-12-21 11:15"),
    (8, None, "うつっぽいと甘いもの食べたくなる。悪循環", "2025-12-21 15:45"),
    (9, 8, "わかる。ストレス食いしちゃう", "2025-12-21 16:30"),
    (10, None, "冬季うつ対策何かしてますか", "2025-12-21 19:30"),
    (11, 10, "光療法用のライト使ってます", "2025-12-21 20:15"),
    (12, 10, "朝起きたらカーテン全開にしてる", "2025-12-21 21:00"),
    (13, None, "3年目だけど冬になると血糖コントロールも乱れる", "2025-12-22 11:30"),
    (14, 13, "ストレスと血糖値って関係ありますよね", "2025-12-22 12:15"),
    (15, None, "運動するといいって分かってるけど動く気力がない", "2025-12-22 18:45"),
    (16, 15, "5分だけでも歩くと違いますよ", "2025-12-22 19:30"),
    (17, None, "心療内科にも通ってる人いますか", "2025-12-23 10:30"),
    (18, 17, "通ってます。糖尿病の主治医とも情報共有してもらってる", "2025-12-23 11:15"),
    (19, 17, "薬の相互作用とか気になるから両方の先生に伝えてます", "2025-12-23 12:00"),
    (20, None, "朝起きるのがつらい。布団から出られない", "2025-12-23 19:20"),
    (21, 20, "目覚ましライト使ったら少しマシになりました", "2025-12-23 20:00"),
    (22, None, "血糖値測るのもサボりがちになる", "2025-12-24 14:30"),
    (23, 22, "リブレにしたら測定は楽になりましたよ", "2025-12-24 15:15"),
    (24, None, "年末年始は特に気分が落ちる。みんな楽しそうで", "2025-12-24 20:45"),
    (25, 24, "SNS見ないようにしてます。余計落ち込むから", "2025-12-24 21:30"),
    (26, None, "糖尿病と診断されてからメンタルが不安定", "2025-12-25 11:30"),
    (27, 26, "最初の1年は特にきついですよね", "2025-12-25 12:15"),
    (28, None, "ビタミンDのサプリ飲んでる人いますか", "2025-12-25 19:20"),
    (29, 28, "冬だけ飲んでます。気休めかもだけど", "2025-12-25 20:00"),
    (30, None, "趣味を見つけたら少しマシになった", "2025-12-26 14:45"),
    (31, 30, "何か始めましたか？", "2025-12-26 15:30"),
    (32, 31, "編み物始めました。手を動かすと気が紛れる", "2025-12-26 16:15"),
    (33, None, "このスレがあって救われる。一人じゃないって思える", "2025-12-27 19:30"),
    (34, 33, "同じ悩みを持つ人がいると心強いですよね", "2025-12-27 20:15"),
    (35, None, "夜が長いのがつらい。早く春にならないかな", "2025-12-28 18:30"),
    (36, None, "大晦日も気分が上がらない", "2025-12-31 19:45"),
    (37, 36, "無理に楽しもうとしなくていいですよ", "2025-12-31 20:30"),
    (38, None, "新年だけど気持ちは変わらない", "2026-01-01 15:20"),
    (39, None, "正月休み、家にこもってたら余計落ち込んだ", "2026-01-03 18:45"),
    (40, 39, "少しでも外の空気吸うといいですよ", "2026-01-03 19:30"),
    (41, None, "仕事始まったほうがマシかも。規則正しい生活になるから", "2026-01-05 20:15"),
    (42, None, "日が少しずつ長くなってきた気がする", "2026-01-10 17:30"),
    (43, 42, "冬至過ぎたから少しずつ明るくなりますよね", "2026-01-10 18:15"),
    (44, None, "春が待ち遠しい", "2026-01-15 19:20"),
    (45, None, "まだまだ寒いけど、あと少しの辛抱", "2026-01-18 18:30"),
    (46, None, "同じ悩み持ってる人がいて安心した", "2026-01-20 20:00"),
    (47, None, "冬季うつと糖尿病、両方あると大変だよね", "2026-01-22 19:15"),
    (48, 47, "お互い無理せず乗り越えましょう", "2026-01-22 20:00"),
    (49, None, "このスレに救われてる人多いと思う", "2026-01-25 18:45"),
    (50, None, "2月になったら少し楽になるかな", "2026-01-28 19:30"),
    (51, None, "みんなで春を待とう", "2026-01-28 20:15"),
    (52, None, "一人じゃないって思えるだけで違う", "2026-01-28 21:00"),
    (53, None, "来年の冬もこのスレがあるといいな", "2026-01-29 19:45"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.71")
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
