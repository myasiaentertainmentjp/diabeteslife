#!/usr/bin/env python3
"""Insert 58 comments for thread No.69: ホットドリンクのおすすめ"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "34aab42d-aa05-4fee-b5bc-dd29a89f53c5"
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
    (2, None, "冬は温かい飲み物が欲しくなる。おすすめありますか", "2025-12-20 19:30"),
    (3, None, "ブラックコーヒーが定番。糖質ゼロだし", "2025-12-20 20:15"),
    (4, None, "診断されたばかりで何飲んでいいかわからない", "2025-12-20 21:00"),
    (5, 4, "お茶類は基本的に大丈夫ですよ", "2025-12-20 21:45"),
    (6, None, "10年以上この生活だけど、ホットの緑茶が一番落ち着く", "2025-12-21 10:30"),
    (7, None, "ルイボスティーにハマってる。カフェインないから夜も飲める", "2025-12-21 14:20"),
    (8, 7, "ルイボスティーいいですよね。私も好き", "2025-12-21 15:00"),
    (9, None, "ほうじ茶が好き。香ばしくて温まる", "2025-12-21 19:45"),
    (10, None, "生姜湯飲んでる人いますか", "2025-12-22 11:30"),
    (11, 10, "市販のは砂糖入ってるから、生姜すりおろして自分で作ってる", "2025-12-22 12:15"),
    (12, 10, "生姜パウダーをお湯に溶かすだけでも温まりますよ", "2025-12-22 13:00"),
    (13, None, "3年目だけどココアが恋しい。低糖質のやつ探してる", "2025-12-22 18:45"),
    (14, 13, "バンホーテンのピュアココアにラカント入れて飲んでます", "2025-12-22 19:30"),
    (15, 13, "無糖ココアに豆乳入れると美味しいですよ", "2025-12-22 20:15"),
    (16, None, "紅茶はストレートで飲んでる。ミルクティーは牛乳の糖質が気になる", "2025-12-23 10:30"),
    (17, 16, "無調整豆乳でソイミルクティーにしてます", "2025-12-23 11:15"),
    (18, None, "カフェオレ飲みたいけど糖質どのくらいあるんだろう", "2025-12-23 15:45"),
    (19, 18, "牛乳100mlで糖質5gくらい。砂糖なしなら許容範囲かと", "2025-12-23 16:30"),
    (20, None, "白湯が一番シンプルで安心", "2025-12-23 20:15"),
    (21, None, "昆布茶好きなんだけど塩分が気になる", "2025-12-24 11:30"),
    (22, 21, "減塩タイプのありますよ", "2025-12-24 12:15"),
    (23, None, "コンビニのホット飲料コーナー、無糖のもの増えてきた", "2025-12-24 18:30"),
    (24, None, "自販機の無糖ホット紅茶よく買う", "2025-12-24 19:45"),
    (25, None, "ハーブティーにハマってる。リラックスできる", "2025-12-25 14:20"),
    (26, 25, "おすすめのハーブティーありますか？", "2025-12-25 15:00"),
    (27, 26, "カモミールが好き。寝る前に飲むと落ち着く", "2025-12-25 15:45"),
    (28, None, "抹茶ラテ飲みたいけど砂糖入ってるの多い", "2025-12-25 20:30"),
    (29, 28, "抹茶パウダーと豆乳で自作するのがおすすめ", "2025-12-25 21:15"),
    (30, None, "チャイ好きだけど市販のは甘すぎる", "2025-12-26 11:45"),
    (31, 30, "スパイスから自分で作ると糖質コントロールできますよ", "2025-12-26 12:30"),
    (32, None, "ゆず茶は糖質高いから諦めてる", "2025-12-26 19:20"),
    (33, 32, "ゆずの皮だけお湯に入れて香りだけ楽しんでます", "2025-12-26 20:00"),
    (34, None, "黒豆茶って糖質どうなんだろう", "2025-12-27 10:30"),
    (35, 34, "ほぼゼロですよ。香ばしくて美味しい", "2025-12-27 11:15"),
    (36, None, "職場でインスタントコーヒー飲んでる。手軽", "2025-12-27 18:45"),
    (37, None, "デカフェにしてる人いますか", "2025-12-28 14:20"),
    (38, 37, "夜はデカフェにしてます。寝つきが良くなった", "2025-12-28 15:00"),
    (39, None, "甘い飲み物が恋しくなる時ある", "2025-12-28 20:30"),
    (40, 39, "ラカントで甘み足すと満足感ありますよ", "2025-12-28 21:15"),
    (41, None, "年末年始はお茶をたくさん飲む予定", "2025-12-29 15:30"),
    (42, None, "お正月は昆布茶が定番", "2025-12-30 11:45"),
    (43, None, "大晦日の夜はホットレモンで温まる", "2025-12-31 21:30"),
    (44, None, "あけおめ。今年も温かい飲み物で乗り切ろう", "2026-01-01 10:15"),
    (45, None, "正月は緑茶ばかり飲んでる", "2026-01-02 15:20"),
    (46, None, "寒い日はホットドリンクが沁みる", "2026-01-03 19:30"),
    (47, None, "スタバの無糖ドリンク何かありますか", "2026-01-04 11:45"),
    (48, 47, "ドリップコーヒーかティーラテ無糖カスタムですかね", "2026-01-04 12:30"),
    (49, None, "タリーズのほうが無糖メニュー多い気がする", "2026-01-04 18:15"),
    (50, None, "家で飲むのが一番安心", "2026-01-05 14:30"),
    (51, None, "マイボトルに無糖のお茶入れて持ち歩いてる", "2026-01-05 19:45"),
    (52, 51, "私もマイボトル派。節約にもなる", "2026-01-05 20:30"),
    (53, None, "このスレ参考になった。いろいろ試してみる", "2026-01-06 15:15"),
    (54, None, "冬の楽しみはホットドリンク", "2026-01-06 20:00"),
    (55, None, "温かい飲み物で体の中から温まろう", "2026-01-07 18:30"),
    (56, None, "みんなのおすすめ試してみたい", "2026-01-07 21:00"),
    (57, None, "糖質気にせず飲めるものがあるって幸せ", "2026-01-08 19:15"),
    (58, None, "春になってもホットドリンクは続けたい", "2026-01-08 20:45"),
    (59, None, "このスレまた見に来ます", "2026-01-09 18:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.69")
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
