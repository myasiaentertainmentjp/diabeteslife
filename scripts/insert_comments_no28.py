#!/usr/bin/env python3
"""Insert 65 comments for thread No.28: ストレスで血糖値上がる人"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "6d710f6a-ab03-4d0b-8210-326356bf227a"
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
    (2, None, "ストレス溜まると血糖値上がりませんか？仕事忙しいと確実に高くなる", "2025-12-16 19:00"),
    (3, 2, "わかります。締め切り前とか明らかに高くなる", "2025-12-16 19:30"),
    (4, 2, "コルチゾール（ストレスホルモン）の影響らしいですね", "2025-12-16 20:15"),
    (5, None, "人間関係のストレスで血糖値乱れる", "2025-12-16 21:00"),
    (6, 5, "職場の人間関係って本当にストレスですよね", "2025-12-17 08:00"),
    (7, None, "ストレス解消法何かありますか？", "2025-12-17 12:00"),
    (8, 7, "散歩してます。気分転換になるし運動にもなる", "2025-12-17 12:30"),
    (9, 7, "音楽聴くとリラックスできます", "2025-12-17 19:00"),
    (10, 8, "散歩いいですね。血糖値も下がりそう", "2025-12-17 19:30"),
    (11, None, "診断されたばかりの頃、ストレスで血糖値コントロールできなかった", "2025-12-17 20:30"),
    (12, 11, "最初は病気自体がストレスですよね", "2025-12-18 08:00"),
    (13, 11, "私も診断直後はメンタルやられました", "2025-12-18 12:00"),
    (14, None, "睡眠不足もストレスになって血糖値上がる", "2025-12-18 19:00"),
    (15, 14, "睡眠大事ですよね。7時間は寝るようにしてます", "2025-12-18 19:30"),
    (16, 14, "夜勤ある仕事だから睡眠リズム乱れがち", "2025-12-18 20:30"),
    (17, None, "怒りを感じた時、血糖値測ったら高かった", "2025-12-19 12:00"),
    (18, 17, "感情で上がるの実感しますよね", "2025-12-19 12:30"),
    (19, 17, "アドレナリンの影響もあるみたいです", "2025-12-19 19:00"),
    (20, None, "ストレス食いしちゃう人いますか？", "2025-12-19 20:00"),
    (21, 20, "イライラすると甘いもの食べたくなる…", "2025-12-19 20:30"),
    (22, 20, "私もです。で、食べた後に後悔する", "2025-12-19 21:30"),
    (23, 21, "ストレス食いの代わりにナッツ食べるようにしてます", "2025-12-20 08:00"),
    (24, None, "瞑想やマインドフルネスやってる人いますか？", "2025-12-20 12:00"),
    (25, 24, "アプリで瞑想してます。寝る前に10分くらい", "2025-12-20 13:00"),
    (26, 24, "興味あるけど続かない…", "2025-12-20 19:00"),
    (27, 25, "何のアプリ使ってますか？", "2025-12-20 19:30"),
    (28, 27, "Meditopiaってやつです。無料でも使えますよ", "2025-12-20 20:30"),
    (29, None, "10年以上糖尿病だけど、ストレス管理が一番難しい", "2025-12-21 14:00"),
    (30, 29, "食事や運動よりコントロール難しいですよね", "2025-12-21 15:00"),
    (31, 29, "ストレスは避けられないから、対処法が大事", "2025-12-21 19:00"),
    (32, None, "年末の忙しさでストレスMAX", "2025-12-22 19:00"),
    (33, 32, "仕事納め前は本当に大変ですよね", "2025-12-22 19:30"),
    (34, 32, "私も12月は毎年HbA1c上がる", "2025-12-22 20:30"),
    (35, None, "運動がストレス解消になってる", "2025-12-23 12:00"),
    (36, 35, "何の運動してますか？", "2025-12-23 12:30"),
    (37, 36, "ジムで筋トレしてます。無心になれる", "2025-12-23 19:00"),
    (38, 37, "筋トレいいですね。ストレス発散になりそう", "2025-12-23 19:30"),
    (39, None, "家族の介護でストレスがすごい", "2025-12-24 14:00"),
    (40, 39, "介護しながら自分の健康管理も大変ですよね", "2025-12-24 15:00"),
    (41, 39, "無理しないでください。頼れるものは頼って", "2025-12-24 19:00"),
    (42, None, "クリスマス、一人で過ごすストレス笑", "2025-12-24 20:00"),
    (43, 42, "ここにいますよ！一緒に過ごしましょう笑", "2025-12-24 20:30"),
    (44, None, "お風呂にゆっくり浸かるとリラックスできる", "2025-12-25 19:00"),
    (45, 44, "入浴剤入れてゆっくり浸かってます", "2025-12-25 19:30"),
    (46, 44, "熱すぎると血圧に良くないから注意してます", "2025-12-25 20:30"),
    (47, None, "趣味に没頭するのがストレス解消になってる", "2025-12-26 14:00"),
    (48, 47, "何の趣味ですか？", "2025-12-26 15:00"),
    (49, 48, "ゲームです。嫌なこと忘れられる", "2025-12-26 19:00"),
    (50, None, "診断されて2年目、ストレスとの付き合い方がわかってきた", "2025-12-27 19:00"),
    (51, 50, "どう対処してますか？", "2025-12-27 19:30"),
    (52, 51, "完璧を目指さない、無理しない、を心がけてます", "2025-12-27 20:30"),
    (53, None, "年末年始、親戚付き合いがストレス", "2025-12-28 14:00"),
    (54, 53, "わかります。あれこれ聞かれるのが辛い", "2025-12-28 15:00"),
    (55, 53, "短時間で切り上げるようにしてます", "2025-12-28 19:00"),
    (56, None, "あけおめ！今年はストレス少なく過ごしたい", "2026-01-01 10:00"),
    (57, 56, "あけおめです！穏やかな1年にしたいですね", "2026-01-01 11:00"),
    (58, None, "正月休みでストレス解消できた気がする", "2026-01-03 14:00"),
    (59, 58, "休息大事ですよね", "2026-01-03 15:00"),
    (60, None, "このスレ見てストレス管理の大切さ再確認した", "2026-01-05 19:00"),
    (61, 60, "食事や運動と同じくらい大事ですよね", "2026-01-05 19:30"),
    (62, None, "ストレスは完全には無くせないから、上手に付き合うしかない", "2026-01-06 19:00"),
    (63, 62, "その通りですね。対処法を増やしていきたい", "2026-01-06 19:30"),
    (64, None, "また効果あったストレス解消法あったら教えてください", "2026-01-07 19:00"),
    (65, 64, "お互い情報共有していきましょう", "2026-01-07 19:30"),
    (66, None, "ストレスに負けずに頑張ろう！", "2026-01-07 20:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.28")
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
