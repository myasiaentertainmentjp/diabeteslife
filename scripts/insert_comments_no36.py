#!/usr/bin/env python3
"""Insert 69 comments for thread No.36: 糖尿病になってよかったこと"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "4eee7a65-9e40-4076-ab7f-dbd2d032492c"
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
    (2, None, "糖尿病になって良かったことってありますか？ポジティブに考えたい", "2025-12-16 19:00"),
    (3, None, "健康意識が高くなった。食事と運動に気を使うようになった", "2025-12-16 19:45"),
    (4, None, "痩せた。診断前より10kg減ってむしろ健康になった気がする", "2025-12-16 20:30"),
    (5, 3, "私もです。糖尿病じゃなかったら不摂生続けてたと思う", "2025-12-17 08:00"),
    (6, None, "料理するようになった。外食ばかりだったのに", "2025-12-17 12:00"),
    (7, None, "診断されたばかりの時は絶望したけど、今は前向きに考えられるようになった", "2025-12-17 12:45"),
    (8, None, "自分の体と向き合うきっかけになった", "2025-12-17 19:00"),
    (9, 7, "時間が経つと受け入れられますよね", "2025-12-17 19:45"),
    (10, None, "お酒の量が減って出費も減った笑", "2025-12-17 20:30"),
    (11, None, "定期的に健康診断受けるようになった", "2025-12-18 12:00"),
    (12, None, "血液検査の数値に詳しくなった", "2025-12-18 12:45"),
    (13, 12, "HbA1cとか昔は知らなかったもんね", "2025-12-18 19:00"),
    (14, None, "同じ病気の仲間ができた。このコミュニティとか", "2025-12-18 19:45"),
    (15, None, "家族の健康も気にするようになった", "2025-12-18 20:30"),
    (16, 15, "家族にも遺伝のリスクあるから気をつけてもらってる", "2025-12-19 08:00"),
    (17, None, "早く見つかって良かったと思ってる。放置してたら合併症出てた", "2025-12-19 12:00"),
    (18, None, "規則正しい生活になった", "2025-12-19 12:45"),
    (19, 17, "早期発見大事ですよね", "2025-12-19 19:00"),
    (20, None, "運動習慣がついた。ジム通うようになった", "2025-12-19 19:45"),
    (21, None, "食べ物の栄養成分を見るようになった", "2025-12-19 20:30"),
    (22, 21, "糖質とカロリーはチェックするようになった", "2025-12-20 08:00"),
    (23, None, "10年以上糖尿病だけど、病気になって生活改善できたのは良かった", "2025-12-20 12:00"),
    (24, None, "血圧も気にするようになって結果的に健康診断オールAになった", "2025-12-20 12:45"),
    (25, 23, "長く付き合ってる方の前向きな言葉、励みになります", "2025-12-20 19:00"),
    (26, None, "ストレス管理を意識するようになった", "2025-12-20 19:45"),
    (27, None, "睡眠の大切さがわかった", "2025-12-20 20:30"),
    (28, 27, "睡眠も血糖値に影響しますもんね", "2025-12-21 08:00"),
    (29, None, "医療費控除のこと詳しくなった笑", "2025-12-21 12:00"),
    (30, None, "体重管理できるようになった", "2025-12-21 12:45"),
    (31, 29, "確定申告ちゃんとするようになったw", "2025-12-21 19:00"),
    (32, None, "野菜をたくさん食べるようになった", "2025-12-21 19:45"),
    (33, None, "間食しなくなって虫歯も減った", "2025-12-21 20:30"),
    (34, 33, "意外なメリット笑", "2025-12-22 08:00"),
    (35, None, "人の気持ちがわかるようになった。病気の人の辛さ", "2025-12-22 12:00"),
    (36, None, "自己管理能力が上がった気がする", "2025-12-22 12:45"),
    (37, 35, "優しくなれますよね", "2025-12-22 19:00"),
    (38, None, "水をたくさん飲むようになった。肌の調子も良くなった", "2025-12-22 19:45"),
    (39, None, "このスレ読んでて前向きになれる", "2025-12-23 12:00"),
    (40, 39, "ポジティブな話できる場所って大事ですよね", "2025-12-23 13:00"),
    (41, None, "夜更かししなくなった", "2025-12-23 19:00"),
    (42, None, "診断されて3年目、今では糖尿病に感謝してる部分もある", "2025-12-24 14:00"),
    (43, 42, "すごい前向きですね。見習いたい", "2025-12-24 15:00"),
    (44, None, "タバコやめられた。これは本当に良かった", "2025-12-24 19:00"),
    (45, None, "健康寿命を意識するようになった", "2025-12-25 14:00"),
    (46, 44, "禁煙できたのすごい！", "2025-12-25 15:00"),
    (47, None, "歩くのが好きになった", "2025-12-25 19:00"),
    (48, None, "年末年始も暴飲暴食しなくなった", "2025-12-26 12:00"),
    (49, 48, "昔は正月太りひどかったけど今はない", "2025-12-26 13:00"),
    (50, None, "自分を大切にするようになった", "2025-12-26 19:00"),
    (51, None, "医療の知識が増えた", "2025-12-27 12:00"),
    (52, 50, "それ大事ですよね。自己肯定感も上がった", "2025-12-27 13:00"),
    (53, None, "あけおめ！今年も前向きに頑張ろう", "2026-01-01 10:00"),
    (54, 53, "あけおめ！ポジティブにいきましょう", "2026-01-01 11:00"),
    (55, None, "新年の抱負は健康第一", "2026-01-01 19:00"),
    (56, None, "糖尿病になって人生観変わった", "2026-01-03 14:00"),
    (57, 56, "悪いことばかりじゃないですよね", "2026-01-03 15:00"),
    (58, None, "限りある人生を大切にしようと思うようになった", "2026-01-03 19:00"),
    (59, None, "このスレ好き。読むと元気出る", "2026-01-04 19:00"),
    (60, 59, "ポジティブな仲間がいるのは心強い", "2026-01-04 19:45"),
    (61, None, "病気があっても幸せに生きられる", "2026-01-05 12:00"),
    (62, None, "また良かったこと見つけたら書き込みます", "2026-01-05 19:00"),
    (63, 62, "よろしくお願いします！", "2026-01-05 19:45"),
    (64, None, "糖尿病でも人生楽しもう", "2026-01-06 19:00"),
    (65, 64, "その通り！", "2026-01-06 19:45"),
    (66, None, "前向きな気持ちで付き合っていきたい", "2026-01-07 12:00"),
    (67, None, "このコミュニティに出会えたのも良かったこと", "2026-01-07 19:00"),
    (68, 67, "同じ病気の仲間って心強いですよね", "2026-01-07 19:45"),
    (69, None, "これからも一緒に頑張りましょう", "2026-01-07 20:30"),
    (70, 69, "よろしくお願いします！", "2026-01-07 21:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.36")
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
