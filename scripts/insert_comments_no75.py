#!/usr/bin/env python3
"""Insert 62 comments for thread No.75: みかんは食べる？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "c477dc6f-2048-4379-9d8e-427bb351ff3d"
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
    (2, None, "冬といえばみかん。でも糖質気になる", "2025-12-20 19:30"),
    (3, None, "みかん1個の糖質ってどのくらいあるんだろう", "2025-12-20 20:15"),
    (4, 3, "Mサイズで10g前後らしいですよ", "2025-12-20 21:00"),
    (5, None, "診断されたばかりで果物全般どうしていいかわからない", "2025-12-20 21:45"),
    (6, 5, "適量なら食べていいと思いますよ。ビタミンも取れるし", "2025-12-20 22:30"),
    (7, None, "10年以上糖尿病だけど、みかんは1日1〜2個って決めてる", "2025-12-21 10:30"),
    (8, 7, "ルール決めておくといいですよね", "2025-12-21 11:15"),
    (9, None, "こたつでみかんが幸せすぎて止まらない", "2025-12-21 15:45"),
    (10, 9, "わかる。気づいたら5個くらい食べてる", "2025-12-21 16:30"),
    (11, None, "実家に帰るとみかん箱買いしてあって危険", "2025-12-21 19:30"),
    (12, 11, "実家あるある。親が「食べなさい」って勧めてくる", "2025-12-21 20:15"),
    (13, None, "3年目だけどみかんの誘惑に勝てない", "2025-12-22 11:30"),
    (14, 13, "私も負けてます笑", "2025-12-22 12:15"),
    (15, None, "みかん食べた後に血糖値測ったら結構上がってた", "2025-12-22 18:45"),
    (16, 15, "何個食べました？", "2025-12-22 19:30"),
    (17, 16, "3個…食べすぎた", "2025-12-22 20:15"),
    (18, None, "小さいみかんなら罪悪感少ない", "2025-12-23 10:30"),
    (19, 18, "Sサイズを選ぶようにしてる", "2025-12-23 11:15"),
    (20, None, "みかんの代わりにいちごにしてる。糖質低めだから", "2025-12-23 15:45"),
    (21, 20, "いちごいいですね。でもみかんが食べたい", "2025-12-23 16:30"),
    (22, None, "みかんの白い筋は食べたほうがいいって聞いた", "2025-12-23 20:15"),
    (23, 22, "食物繊維あるから血糖値の上昇を緩やかにするらしい", "2025-12-23 21:00"),
    (24, None, "みかん好きな人多いね。このスレ見てたら食べたくなってきた", "2025-12-24 11:30"),
    (25, None, "みかん農家の親戚から箱で届いた。嬉しいけど困る", "2025-12-24 19:20"),
    (26, 25, "冷凍みかんにすると長持ちしますよ", "2025-12-24 20:00"),
    (27, 25, "ご近所におすそ分けするのも手", "2025-12-24 20:45"),
    (28, None, "食後のデザートとして1個だけ食べてる", "2025-12-25 14:30"),
    (29, 28, "食後のほうが血糖値上がりにくいのかな", "2025-12-25 15:15"),
    (30, 29, "食物繊維と一緒に食べると吸収緩やかになるらしい", "2025-12-25 16:00"),
    (31, None, "みかんジュースは糖質やばいから避けてる", "2025-12-25 20:30"),
    (32, 31, "液体だと吸収早いですもんね", "2025-12-25 21:15"),
    (33, None, "皮ごと食べられるみかんってどうなんだろう", "2025-12-26 11:45"),
    (34, 33, "金柑とか？あれも甘いから糖質あるよね", "2025-12-26 12:30"),
    (35, None, "みかん断ちしてる人いますか", "2025-12-26 19:20"),
    (36, 35, "冬だけの楽しみだから我慢しないで食べてる", "2025-12-26 20:00"),
    (37, None, "年末年始はみかんの消費量増える", "2025-12-27 10:30"),
    (38, None, "紅まどんなとかの高級みかん食べたい", "2025-12-27 18:45"),
    (39, 38, "高いけど美味しいですよね", "2025-12-27 19:30"),
    (40, None, "甘くて美味しいみかんほど糖質高そう", "2025-12-28 14:20"),
    (41, None, "酸っぱいみかんのほうがまだマシなのかな", "2025-12-28 19:30"),
    (42, 41, "糖度の違いはあるかも。でも微々たる差かな", "2025-12-28 20:15"),
    (43, None, "大晦日もみかん食べながら紅白見る予定", "2025-12-31 19:45"),
    (44, None, "あけおめ。今年もみかんと上手に付き合う", "2026-01-01 10:15"),
    (45, None, "正月はみかん食べすぎた反省", "2026-01-03 18:30"),
    (46, 45, "私も…でも美味しかったからOK", "2026-01-03 19:15"),
    (47, None, "みかんの季節もあと少し。名残惜しい", "2026-01-05 14:30"),
    (48, None, "デコポンとか伊予柑もそろそろ出てくる時期", "2026-01-06 11:45"),
    (49, 48, "柑橘類の誘惑は続く…", "2026-01-06 12:30"),
    (50, None, "みかんは1日1個ルール、来年も続ける", "2026-01-07 18:30"),
    (51, None, "このスレ見て適量を意識するようになった", "2026-01-07 20:15"),
    (52, None, "みかん好きな人が多くて嬉しい", "2026-01-08 19:00"),
    (53, None, "果物は適量なら楽しんでいいよね", "2026-01-08 20:30"),
    (54, None, "来年の冬もみかんスレ立てたい", "2026-01-09 15:45"),
    (55, None, "みかんとの付き合い方、参考になった", "2026-01-09 19:15"),
    (56, None, "糖尿病でもみかんは楽しめる", "2026-01-09 21:00"),
    (57, None, "量を守れば大丈夫", "2026-01-10 18:30"),
    (58, None, "このスレありがとう", "2026-01-10 20:00"),
    (59, None, "来年もみかんの季節を楽しもう", "2026-01-10 21:15"),
    (60, None, "みかんスレ最高でした", "2026-01-11 18:45"),
    (61, None, "また来年！", "2026-01-11 20:30"),
    (62, None, "みかん万歳🍊", "2026-01-11 21:00"),
    (63, None, "糖尿病仲間でみかんを語れて楽しかった", "2026-01-12 19:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.75")
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
