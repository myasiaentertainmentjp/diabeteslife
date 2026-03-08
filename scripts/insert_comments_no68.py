#!/usr/bin/env python3
"""Insert 61 comments for thread No.68: 鍋料理の糖質"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "010dd2ad-f934-47ef-8966-988ff0fc673c"
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
    (2, None, "鍋料理って糖質どのくらいあるんだろう", "2025-12-20 19:30"),
    (3, None, "具材によるけど基本的に低糖質じゃない？", "2025-12-20 20:15"),
    (4, None, "診断されたばかりで鍋の糖質が気になってた。このスレ助かる", "2025-12-20 21:00"),
    (5, 4, "鍋は糖尿病の味方ですよ。野菜たくさん食べられるし", "2025-12-20 21:45"),
    (6, None, "10年以上この生活だけど、冬は鍋ばっかり食べてる", "2025-12-21 10:30"),
    (7, 6, "鍋は楽だし野菜取れるしいいですよね", "2025-12-21 11:15"),
    (8, None, "〆の雑炊が問題なんだよね", "2025-12-21 14:20"),
    (9, 8, "わかる。美味しいけど糖質やばい", "2025-12-21 15:00"),
    (10, None, "〆はしらたきで代用してる", "2025-12-21 19:30"),
    (11, 10, "しらたきいいですね！どうやって食べてます？", "2025-12-21 20:15"),
    (12, 11, "そのまま鍋に入れてラーメン風に。スープ吸って美味しい", "2025-12-21 21:00"),
    (13, None, "すき焼きは糖質高いよね。割り下が甘いから", "2025-12-22 11:30"),
    (14, 13, "すき焼きの割り下、自分で作れば砂糖減らせますよ", "2025-12-22 12:15"),
    (15, None, "3年目だけど鍋のレパートリー増やしたい", "2025-12-22 18:45"),
    (16, 15, "おすすめの鍋ありますか？", "2025-12-22 19:30"),
    (17, 16, "豆乳鍋が好き。まろやかで美味しい", "2025-12-22 20:15"),
    (18, None, "キムチ鍋の素って糖質どのくらいあるんだろう", "2025-12-23 10:30"),
    (19, 18, "メーカーによるけど1人前10g前後のが多い", "2025-12-23 11:15"),
    (20, None, "水炊きなら糖質ほぼゼロでいける", "2025-12-23 15:45"),
    (21, None, "ポン酢とゴマだれ、どっちが糖質低い？", "2025-12-23 19:20"),
    (22, 21, "ポン酢のほうが低いですよ。ゴマだれは意外と糖質ある", "2025-12-23 20:00"),
    (23, None, "もつ鍋好きなんだけど糖質どうなんだろう", "2025-12-24 11:45"),
    (24, 23, "もつ自体は低糖質。スープと〆に気をつければOK", "2025-12-24 12:30"),
    (25, None, "おでんも鍋料理に入る？", "2025-12-24 18:30"),
    (26, 25, "おでんは練り物の糖質に注意。大根とか卵中心に食べてる", "2025-12-24 19:15"),
    (27, None, "しゃぶしゃぶは最強だと思う", "2025-12-25 14:20"),
    (28, 27, "肉と野菜だけで満足できるからいいですよね", "2025-12-25 15:00"),
    (29, None, "鍋に入れる春雨やめてしらたきにした", "2025-12-25 19:45"),
    (30, None, "豆腐たくさん入れてボリュームアップしてる", "2025-12-26 11:30"),
    (31, 30, "豆腐いいですよね。タンパク質も取れるし", "2025-12-26 12:15"),
    (32, None, "きのこ類は糖質低いからたくさん入れてる", "2025-12-26 18:45"),
    (33, None, "白菜の芯の部分、甘いけど糖質大丈夫かな", "2025-12-27 10:30"),
    (34, 33, "白菜は100gで2g程度だから気にしなくていいですよ", "2025-12-27 11:15"),
    (35, None, "鍋キューブとか使ってる人いますか", "2025-12-27 18:20"),
    (36, 35, "便利ですよね。糖質表示も見やすい", "2025-12-27 19:00"),
    (37, None, "年末は鍋パーティーの予定。楽しみだけど食べすぎ注意", "2025-12-28 15:30"),
    (38, None, "家族は〆のうどん食べてて羨ましい", "2025-12-28 20:15"),
    (39, 38, "糖質ゼロ麺で一緒に〆できますよ", "2025-12-28 21:00"),
    (40, None, "大晦日は寄せ鍋にする予定", "2025-12-29 14:45"),
    (41, None, "今年の冬は鍋何回食べたか分からない", "2025-12-30 19:20"),
    (42, None, "鍋は片付けも楽でいい", "2025-12-31 11:30"),
    (43, None, "年越しは鍋にした。年越しそばの代わり", "2025-12-31 21:45"),
    (44, None, "正月も鍋食べてる。おせちより血糖値安定する", "2026-01-02 19:30"),
    (45, 44, "おせちより鍋のほうが確かに安心", "2026-01-02 20:15"),
    (46, None, "冬の間ずっと鍋でもいいくらい", "2026-01-03 15:30"),
    (47, None, "鍋の残り汁でスープ作るのもあり", "2026-01-04 11:45"),
    (48, 47, "翌朝の朝食にしてます。美味しい", "2026-01-04 12:30"),
    (49, None, "トマト鍋もおすすめ。洋風で飽きない", "2026-01-05 18:20"),
    (50, 49, "トマト鍋美味しいですよね。チーズ入れても合う", "2026-01-05 19:00"),
    (51, None, "カレー鍋は糖質高めかな", "2026-01-06 14:30"),
    (52, 51, "ルー使うと糖質上がるかも。スパイスから作れば抑えられる", "2026-01-06 15:15"),
    (53, None, "このスレ見て今日は鍋にしようと思った", "2026-01-07 18:45"),
    (54, None, "鍋は糖尿病の強い味方", "2026-01-07 20:30"),
    (55, None, "春になっても鍋食べたい", "2026-01-08 19:15"),
    (56, None, "夏でも冷しゃぶとかあるしね", "2026-01-08 20:00"),
    (57, None, "鍋のレシピ交換できるスレあったらいいな", "2026-01-09 15:30"),
    (58, None, "みんなの鍋情報参考になった", "2026-01-09 19:45"),
    (59, None, "来年の冬もこのスレ見に来よう", "2026-01-09 21:00"),
    (60, None, "鍋で血糖値コントロール頑張ろう", "2026-01-10 18:30"),
    (61, None, "冬の定番メニューとして鍋は外せない", "2026-01-10 20:15"),
    (62, None, "このスレのおかげで鍋の知識増えた。ありがとう", "2026-01-10 21:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.68")
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
