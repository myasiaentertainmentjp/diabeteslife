#!/usr/bin/env python3
"""Insert 58 comments for thread No.79: 冬の感染症対策"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "a0fd21a1-5411-44a1-b856-0330c5657e38"
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
    (2, None, "糖尿病だと感染症重症化しやすいって聞いて怖い", "2025-12-20 19:30"),
    (3, None, "インフルエンザもコロナも気をつけないと", "2025-12-20 20:15"),
    (4, None, "診断されたばかりで感染症対策どこまでやればいいか分からない", "2025-12-20 21:00"),
    (5, 4, "基本的な手洗い・マスクが大事ですよ", "2025-12-20 21:45"),
    (6, None, "10年以上この病気だけど、感染症には人一倍気をつけてる", "2025-12-21 10:30"),
    (7, 6, "長く付き合ってると慎重になりますよね", "2025-12-21 11:15"),
    (8, None, "予防接種は毎年受けてますか", "2025-12-21 15:45"),
    (9, 8, "インフルエンザは毎年打ってます", "2025-12-21 16:30"),
    (10, 8, "コロナワクチンも打ってます", "2025-12-21 17:15"),
    (11, None, "3年目だけど去年インフルで血糖値ガタガタになった", "2025-12-22 11:30"),
    (12, 11, "体調崩すと血糖コントロール難しいですよね", "2025-12-22 12:15"),
    (13, None, "マスクはまだ外出時つけてる", "2025-12-22 18:45"),
    (14, 13, "私もです。周りの目は気にしない", "2025-12-22 19:30"),
    (15, None, "手洗いは帰宅後すぐにしてる", "2025-12-23 10:30"),
    (16, None, "アルコール消毒も持ち歩いてる", "2025-12-23 15:45"),
    (17, 16, "私も小さいボトル持ち歩いてます", "2025-12-23 16:30"),
    (18, None, "人混み避けるようにしてる", "2025-12-23 20:15"),
    (19, 18, "年末の買い物は空いてる時間帯に", "2025-12-23 21:00"),
    (20, None, "家族が風邪ひくと移らないかヒヤヒヤする", "2025-12-24 11:30"),
    (21, 20, "家の中でもマスクしてます", "2025-12-24 12:15"),
    (22, None, "子供が学校から菌持って帰ってくる", "2025-12-24 19:20"),
    (23, 22, "子供経由が一番怖いですよね", "2025-12-24 20:00"),
    (24, None, "睡眠しっかり取るようにしてる。免疫のために", "2025-12-25 14:30"),
    (25, 24, "睡眠大事ですよね", "2025-12-25 15:15"),
    (26, None, "栄養バランスも気をつけてる", "2025-12-25 20:30"),
    (27, None, "ビタミンCのサプリ飲んでる人いますか", "2025-12-26 11:45"),
    (28, 27, "飲んでます。効果あるかは分からないけど気休め", "2025-12-26 12:30"),
    (29, None, "加湿器で部屋の湿度保ってる", "2025-12-26 19:20"),
    (30, 29, "乾燥するとウイルス活発になるらしいですね", "2025-12-26 20:00"),
    (31, None, "うがいは効果あるのかな", "2025-12-27 10:30"),
    (32, 31, "やらないよりはマシかなと思ってやってる", "2025-12-27 11:15"),
    (33, None, "年末年始は病院休みだから体調崩したくない", "2025-12-27 18:45"),
    (34, 33, "救急のお世話になりたくないですよね", "2025-12-27 19:30"),
    (35, None, "帰省で人と会う機会増えるから心配", "2025-12-28 14:20"),
    (36, 35, "換気良くして過ごすといいですよ", "2025-12-28 15:00"),
    (37, None, "初詣も人混み怖い", "2025-12-29 11:30"),
    (38, 37, "時間ずらして行くといいかも", "2025-12-29 12:15"),
    (39, None, "大晦日は家でゆっくり過ごす予定", "2025-12-31 19:30"),
    (40, None, "あけおめ！今年も健康に過ごしたい", "2026-01-01 10:15"),
    (41, None, "正月は外出控えめにした", "2026-01-02 14:30"),
    (42, None, "今のところ無事。このまま冬を乗り切りたい", "2026-01-03 18:45"),
    (43, None, "職場でインフル流行ってて戦々恐々", "2026-01-07 19:15"),
    (44, 43, "テレワークできたらいいですね", "2026-01-07 20:00"),
    (45, None, "まだまだ油断できない季節", "2026-01-08 18:30"),
    (46, None, "このスレ参考になった", "2026-01-08 20:15"),
    (47, None, "感染症対策、続けていこう", "2026-01-09 19:00"),
    (48, None, "みんなで健康に冬を乗り切ろう", "2026-01-09 20:30"),
    (49, None, "春まであと少し", "2026-01-10 18:45"),
    (50, None, "このスレありがとう", "2026-01-10 20:00"),
    (51, None, "来年も感染症対策頑張ろう", "2026-01-10 21:15"),
    (52, None, "健康第一で過ごしましょう", "2026-01-11 18:30"),
    (53, None, "また来年も情報交換しよう", "2026-01-11 19:45"),
    (54, None, "みんなお大事に", "2026-01-11 21:00"),
    (55, None, "糖尿病でも元気に過ごせる", "2026-01-12 18:30"),
    (56, None, "感染症に負けずに頑張ろう", "2026-01-12 19:45"),
    (57, None, "このスレのおかげで心強い", "2026-01-12 20:30"),
    (58, None, "ありがとうございました！", "2026-01-12 21:15"),
    (59, None, "また来シーズンも！", "2026-01-13 19:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.79")
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
