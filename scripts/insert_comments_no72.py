#!/usr/bin/env python3
"""Insert 56 comments for thread No.72: 乾燥肌と糖尿病"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "05d869c2-7b5e-4ea8-817d-e856a14f8a4e"
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
    (2, None, "冬になると肌の乾燥がひどい。糖尿病と関係あるのかな", "2025-12-20 19:30"),
    (3, None, "血糖値高いと肌が乾燥しやすいって聞いたことある", "2025-12-20 20:15"),
    (4, None, "診断されたばかりだけど、最近やたら肌がカサカサする", "2025-12-20 21:00"),
    (5, 4, "血糖コントロールが安定すると肌も落ち着きますよ", "2025-12-20 21:45"),
    (6, None, "10年以上この病気だけど、冬の乾燥は毎年悩む", "2025-12-21 10:30"),
    (7, 6, "長く付き合ってても乾燥は避けられないですよね", "2025-12-21 11:15"),
    (8, None, "かかとがガサガサでひび割れそう", "2025-12-21 15:45"),
    (9, 8, "ひび割れると傷になるから気をつけてくださいね", "2025-12-21 16:30"),
    (10, None, "保湿剤何使ってますか", "2025-12-21 19:30"),
    (11, 10, "ヒルドイドを皮膚科で処方してもらってます", "2025-12-21 20:15"),
    (12, 10, "ニベア青缶を毎日塗ってます。コスパいい", "2025-12-21 21:00"),
    (13, None, "3年目だけど乾燥肌がひどくなった気がする", "2025-12-22 11:30"),
    (14, 13, "年齢もあるかもですね", "2025-12-22 12:15"),
    (15, None, "すねがカサカサで粉吹いてる", "2025-12-22 18:45"),
    (16, 15, "すねは特に乾燥しやすいですよね", "2025-12-22 19:30"),
    (17, None, "お風呂上がりにすぐ保湿するようにしてる", "2025-12-23 10:30"),
    (18, 17, "3分以内がいいらしいですよ", "2025-12-23 11:15"),
    (19, None, "尿素配合のクリームって効果ありますか", "2025-12-23 15:45"),
    (20, 19, "かかとには効きますよ。顔には刺激強いから注意", "2025-12-23 16:30"),
    (21, 19, "ケラチナミン使ってます。ガサガサが改善した", "2025-12-23 17:15"),
    (22, None, "顔の乾燥も気になる。化粧ノリが悪い", "2025-12-24 11:30"),
    (23, 22, "セラミド入りの化粧水おすすめです", "2025-12-24 12:15"),
    (24, None, "かゆみもあるんだけど掻いちゃダメなんだよね", "2025-12-24 19:20"),
    (25, 24, "掻くと傷になるから保湿でかゆみ抑えるしかない", "2025-12-24 20:00"),
    (26, None, "加湿器使ってる人いますか", "2025-12-25 14:30"),
    (27, 26, "寝室に置いてます。朝の乾燥がマシになった", "2025-12-25 15:15"),
    (28, 26, "加湿器と保湿剤のダブル使いが最強", "2025-12-25 16:00"),
    (29, None, "熱いお風呂は肌に良くないって聞いた", "2025-12-25 20:30"),
    (30, 29, "ぬるめのお湯がいいらしいですね。でも冬は寒い", "2025-12-25 21:15"),
    (31, None, "ボディソープも低刺激のに変えた", "2025-12-26 11:45"),
    (32, 31, "どこのメーカー使ってますか？", "2025-12-26 12:30"),
    (33, 32, "キュレルのやつ。しっとりする", "2025-12-26 13:15"),
    (34, None, "ワセリンってどうなんだろう", "2025-12-26 19:20"),
    (35, 34, "ベタつくけど保湿力は高い。唇に使ってる", "2025-12-26 20:00"),
    (36, None, "手荒れもひどい。ハンドクリームが手放せない", "2025-12-27 10:30"),
    (37, None, "血糖値下げたら肌の調子良くなった人いますか", "2025-12-27 18:45"),
    (38, 37, "HbA1c下がったら明らかに肌がしっとりしてきた", "2025-12-27 19:30"),
    (39, None, "皮膚科と内科、両方通ってる", "2025-12-28 14:20"),
    (40, 39, "連携してもらえると安心ですよね", "2025-12-28 15:00"),
    (41, None, "乾燥で肌がかゆくて夜眠れない", "2025-12-28 21:30"),
    (42, 41, "寝る前に保湿たっぷり塗ると少しマシですよ", "2025-12-28 22:15"),
    (43, None, "年末年始、保湿サボらないようにしないと", "2025-12-29 15:30"),
    (44, None, "正月も保湿は欠かさず", "2026-01-02 19:20"),
    (45, None, "帰省先にも保湿剤持っていった", "2026-01-03 14:30"),
    (46, None, "冬はとにかく保湿が大事", "2026-01-04 18:15"),
    (47, None, "このスレ参考になった。保湿頑張る", "2026-01-05 19:30"),
    (48, None, "春になったら少し楽になるかな", "2026-01-06 15:45"),
    (49, 48, "花粉の季節は肌荒れする人もいるから油断できない", "2026-01-06 16:30"),
    (50, None, "年中保湿が必要なのかも", "2026-01-07 19:15"),
    (51, None, "糖尿病と乾燥肌、セットで悩んでる人多いんだね", "2026-01-08 18:30"),
    (52, 51, "同じ悩みの人がいると心強い", "2026-01-08 19:15"),
    (53, None, "保湿剤の情報交換できて助かる", "2026-01-09 14:20"),
    (54, None, "みんなで冬を乗り切ろう", "2026-01-09 20:00"),
    (55, None, "肌のケアも血糖管理も頑張る", "2026-01-10 18:45"),
    (56, None, "来年の冬もこのスレ参考にする", "2026-01-10 21:00"),
    (57, None, "乾燥肌対策、続けていこう", "2026-01-11 19:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.72")
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
