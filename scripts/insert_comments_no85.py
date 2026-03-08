#!/usr/bin/env python3
"""Insert 63 comments for thread No.85: 冬の夜食やめられない"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "1978a4f8-1480-4627-a0d3-1039c8c68582"
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
    (2, None, "冬になると夜食が止まらない。こたつでぬくぬくしながら食べちゃう", "2025-12-20 19:30"),
    (3, None, "寒いとお腹空くの早い気がする", "2025-12-20 20:15"),
    (4, None, "診断されたばかりなのに夜食がやめられない。どうしよう", "2025-12-20 21:00"),
    (5, 4, "低糖質のものに置き換えるところから始めてみては", "2025-12-20 21:45"),
    (6, None, "10年以上糖尿病だけど、冬の夜食は毎年の悩み", "2025-12-21 10:30"),
    (7, 6, "ベテランでも悩むんですね", "2025-12-21 11:15"),
    (8, None, "夜中にカップ麺食べたくなる衝動がすごい", "2025-12-21 15:45"),
    (9, 8, "わかりすぎる。お湯沸かすだけだから手軽で危険", "2025-12-21 16:30"),
    (10, None, "3年目だけど夜食の誘惑に勝てない", "2025-12-21 19:30"),
    (11, 10, "同じです。意志が弱い…", "2025-12-21 20:15"),
    (12, None, "夜食食べると翌朝の血糖値高い", "2025-12-22 11:30"),
    (13, 12, "寝てる間に消費されないからですよね", "2025-12-22 12:15"),
    (14, None, "夜食に何食べてますか", "2025-12-22 18:45"),
    (15, 14, "チーズとか低糖質のもの選んでる", "2025-12-22 19:30"),
    (16, 14, "ゆで卵ストックしてます", "2025-12-22 20:15"),
    (17, 14, "ナッツ食べてる。でも食べすぎ注意", "2025-12-22 21:00"),
    (18, None, "夜中にアイス食べたくなる", "2025-12-23 10:30"),
    (19, 18, "SUNAOのアイス冷凍庫に入れてある", "2025-12-23 11:15"),
    (20, None, "お菓子を家に置かないようにしてる", "2025-12-23 15:45"),
    (21, 20, "それが一番の対策ですよね", "2025-12-23 16:30"),
    (22, None, "でも家族がお菓子買ってくるから誘惑が…", "2025-12-23 20:15"),
    (23, 22, "見えない場所に隠してもらうとか", "2025-12-23 21:00"),
    (24, None, "夜更かしすると夜食食べたくなる。早く寝るのが一番", "2025-12-24 11:30"),
    (25, 24, "それができれば苦労しない笑", "2025-12-24 12:15"),
    (26, None, "テレビ見てるとCMでお腹空く", "2025-12-24 19:20"),
    (27, 26, "深夜のラーメン特集とか罪深い", "2025-12-24 20:00"),
    (28, None, "ホットミルク飲むと落ち着く", "2025-12-25 14:30"),
    (29, 28, "温かい飲み物でごまかす作戦いいですね", "2025-12-25 15:15"),
    (30, None, "歯磨きしたら食べないルールにしてる", "2025-12-25 20:30"),
    (31, 30, "それいいですね！真似しよう", "2025-12-25 21:15"),
    (32, None, "夜食食べたあとの罪悪感がすごい", "2025-12-26 11:45"),
    (33, 32, "わかる。でもまた繰り返す…", "2025-12-26 12:30"),
    (34, None, "糖質ゼロ麺で夜食作ってる", "2025-12-26 19:20"),
    (35, 34, "それなら罪悪感少なめですね", "2025-12-26 20:00"),
    (36, None, "コンビニ行くと余計なもの買っちゃうから行かない", "2025-12-27 10:30"),
    (37, 36, "深夜のコンビニは危険地帯", "2025-12-27 11:15"),
    (38, None, "年末年始は夜更かしするから夜食増えそう", "2025-12-27 18:45"),
    (39, 38, "紅白見ながら食べちゃうやつ", "2025-12-27 19:30"),
    (40, None, "大晦日は特別ってことで許す", "2025-12-31 22:30"),
    (41, None, "年越しそば食べた。夜食カウントかな", "2026-01-01 00:30"),
    (42, 41, "大晦日は特例でOK", "2026-01-01 01:15"),
    (43, None, "正月は夜食三昧だった…", "2026-01-03 18:30"),
    (44, 43, "私も。反省", "2026-01-03 19:15"),
    (45, None, "今日から夜食やめる宣言", "2026-01-04 20:00"),
    (46, 45, "頑張って！応援してます", "2026-01-04 20:45"),
    (47, None, "3日坊主で終わりそう", "2026-01-05 19:30"),
    (48, 47, "まずは週3日夜食なしを目指すとか", "2026-01-05 20:15"),
    (49, None, "夜食やめたら朝ごはん美味しく感じる", "2026-01-06 08:30"),
    (50, 49, "それいいですね！好循環", "2026-01-06 09:15"),
    (51, None, "このスレ見て夜食我慢できた", "2026-01-07 22:30"),
    (52, 51, "おめでとう！その調子", "2026-01-07 23:15"),
    (53, None, "夜食との戦いは続く", "2026-01-08 20:00"),
    (54, None, "同じ悩みの仲間がいると心強い", "2026-01-08 21:00"),
    (55, None, "みんなで頑張ろう", "2026-01-09 19:30"),
    (56, None, "このスレ参考になった", "2026-01-09 20:30"),
    (57, None, "低糖質夜食の情報助かる", "2026-01-10 18:30"),
    (58, None, "来年の冬もこのスレ見に来る", "2026-01-10 19:45"),
    (59, None, "夜食仲間がいて嬉しい笑", "2026-01-10 20:30"),
    (60, None, "一緒に夜食減らそう", "2026-01-10 21:15"),
    (61, None, "このスレありがとう", "2026-01-11 19:00"),
    (62, None, "また来年も情報交換しましょう", "2026-01-11 20:15"),
    (63, None, "夜食との戦い、終わりなき戦い", "2026-01-11 21:00"),
    (64, None, "でも諦めずに頑張ろう", "2026-01-12 19:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.85")
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
