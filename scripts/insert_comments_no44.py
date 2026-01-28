#!/usr/bin/env python3
"""Insert 64 comments for thread No.44: お正月の食事どうする？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "5d07f56b-4934-49e1-8c0b-58e254bffa7b"
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
    (2, None, "お正月の食事、みんなどうする予定ですか？", "2025-12-12 19:17"),
    (3, None, "おせちは食べるけど量を控えめにする予定", "2025-12-12 19:53"),
    (4, None, "お餅が一番悩む。食べたいけど血糖値爆上がりする", "2025-12-12 20:29"),
    (5, 4, "私は低糖質餅を通販で買いました", "2025-12-13 08:14"),
    (6, None, "診断されたばかりで初めてのお正月。何食べていいかわからない", "2025-12-13 12:22"),
    (7, 6, "糖質の多いものを避ければ大丈夫ですよ", "2025-12-13 12:58"),
    (8, None, "栗きんとんは糖質やばいから今年はパス", "2025-12-13 19:11"),
    (9, None, "黒豆も甘いんですよね", "2025-12-13 19:47"),
    (10, 8, "砂糖使わないで作るレシピもありますよ", "2025-12-13 20:23"),
    (11, None, "数の子とかまぼこは糖質低め", "2025-12-14 12:16"),
    (12, None, "田作りもタンパク質取れていいですよね", "2025-12-14 12:52"),
    (13, 11, "数の子好きだから嬉しい", "2025-12-14 19:08"),
    (14, None, "お雑煮のお餅どうしてますか", "2025-12-14 19:44"),
    (15, None, "お餅なしで具だけ食べてます", "2025-12-14 20:21"),
    (16, 14, "1個だけ入れて我慢してます", "2025-12-15 08:18"),
    (17, None, "低糖質おせち通販で頼んだ", "2025-12-15 12:27"),
    (18, None, "どこのですか？参考にしたい", "2025-12-15 12:59"),
    (19, 17, "紀文の糖質オフおせちです", "2025-12-15 19:14"),
    (20, None, "診断されて3年目、おせちは手作りで糖質カットしてます", "2025-12-15 19:51"),
    (21, 20, "手作りすごい！何作りますか？", "2025-12-15 20:28"),
    (22, 21, "伊達巻をラカントで、黒豆も砂糖控えめで作ります", "2025-12-16 08:11"),
    (23, None, "お正月は鍋で乗り切ろうかな", "2025-12-16 12:19"),
    (24, None, "鍋なら野菜もタンパク質も取れていいですよね", "2025-12-16 12:55"),
    (25, 23, "〆の雑炊は我慢ですね", "2025-12-16 19:12"),
    (26, None, "10年以上糖尿病だけど、お正月は少しくらいは楽しみたい", "2025-12-17 14:08"),
    (27, 26, "メリハリ大事ですよね", "2025-12-17 14:44"),
    (28, None, "刺身盛り合わせをメインにする予定", "2025-12-17 19:21"),
    (29, None, "刺身は糖質ゼロだから最高", "2025-12-17 19:57"),
    (30, 28, "私もお刺身たくさん買う予定", "2025-12-17 20:33"),
    (31, None, "年越しそばは糖質0麺で作る", "2025-12-18 12:14"),
    (32, None, "普通のそばの半量にして野菜増やす", "2025-12-18 12:51"),
    (33, 31, "私も糖質0麺買ってきました", "2025-12-18 19:08"),
    (34, None, "実家のおせち断れない…", "2025-12-19 12:23"),
    (35, None, "少しずつ色々食べて乗り切りましょう", "2025-12-19 12:59"),
    (36, 34, "野菜とタンパク質中心に選べばなんとかなる", "2025-12-19 19:16"),
    (37, None, "シャトレーゼの低糖質スイーツでお正月気分味わう", "2025-12-20 12:18"),
    (38, None, "ケーキより和菓子の方が糖質高いこと多いですよね", "2025-12-20 19:07"),
    (39, 37, "シャトレーゼ助かりますよね", "2025-12-20 19:43"),
    (40, None, "お正月用の低糖質食材買いだめした", "2025-12-22 12:21"),
    (41, None, "準備万端ですね！", "2025-12-22 12:57"),
    (42, 40, "何買いましたか？", "2025-12-22 19:14"),
    (43, 42, "低糖質パン、糖質0麺、ナッツ、チーズなど", "2025-12-22 19:51"),
    (44, None, "大晦日は何食べますか", "2025-12-28 19:08"),
    (45, None, "すき焼きの予定。肉メインで", "2025-12-28 19:44"),
    (46, 44, "うちは手巻き寿司。酢飯少なめで", "2025-12-28 20:21"),
    (47, None, "年越しそば食べました！糖質0麺で", "2025-12-31 22:14"),
    (48, 47, "私も今食べてます", "2025-12-31 22:51"),
    (49, None, "あけおめ！今年もよろしく", "2026-01-01 00:08"),
    (50, None, "あけましておめでとうございます！", "2026-01-01 00:31"),
    (51, 49, "あけおめ！健康に気をつけていきましょう", "2026-01-01 08:17"),
    (52, None, "お雑煮食べました。お餅1個で我慢した", "2026-01-01 10:23"),
    (53, None, "おせち少しずつつまんでます", "2026-01-01 12:18"),
    (54, 52, "えらい！私は2個食べてしまった", "2026-01-01 12:54"),
    (55, None, "お刺身おいしかった", "2026-01-01 18:11"),
    (56, None, "正月2日目、まだおせち残ってる", "2026-01-02 12:19"),
    (57, 56, "食べきるの大変ですよね", "2026-01-02 12:55"),
    (58, None, "三が日終わったら普通の食事に戻します", "2026-01-03 10:14"),
    (59, None, "なんとか乗り切った感", "2026-01-03 12:21"),
    (60, 58, "お疲れ様でした！", "2026-01-03 12:57"),
    (61, None, "このスレのおかげで乗り切れた", "2026-01-04 19:08"),
    (62, 61, "情報共有できてよかったです", "2026-01-04 19:44"),
    (63, None, "来年の参考にします", "2026-01-05 19:11"),
    (64, None, "お正月の食事、工夫次第で楽しめる", "2026-01-06 19:14"),
    (65, 64, "本当にそう思います", "2026-01-06 19:51"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.44")
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
