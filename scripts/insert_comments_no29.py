#!/usr/bin/env python3
"""Insert 64 comments for thread No.29: お酒との付き合い方"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "9da3d755-5104-4ea6-bdf0-e174cb06e276"
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
    (2, None, "糖尿病でもお酒飲んでる人いますか？どう付き合ってますか", "2025-12-16 19:00"),
    (3, 2, "週末だけビール1杯って決めてます", "2025-12-16 19:30"),
    (4, 2, "ハイボールに切り替えました。糖質ゼロだから", "2025-12-16 20:15"),
    (5, None, "先生にお酒やめろって言われてるけど、完全には無理…", "2025-12-16 21:00"),
    (6, 5, "私も言われました。量を減らすところから始めてます", "2025-12-17 08:00"),
    (7, 5, "完全にやめるのはストレスになるから、適度にって言われました", "2025-12-17 12:00"),
    (8, None, "糖質ゼロのビールってどうですか？", "2025-12-17 19:00"),
    (9, 8, "味は普通のビールに比べると…でも慣れました", "2025-12-17 19:30"),
    (10, 8, "キリンのグリーンズフリー飲んでます。糖質ゼロでまあまあ", "2025-12-17 20:30"),
    (11, None, "診断されたばかりの時は禁酒してた", "2025-12-18 19:00"),
    (12, 11, "私も最初は我慢しました。今は週1くらいで", "2025-12-18 19:30"),
    (13, 11, "数値が安定してきてから少しずつ解禁した", "2025-12-18 20:30"),
    (14, None, "ワイン好きなんですけど、糖質どうなんでしょう", "2025-12-18 21:00"),
    (15, 14, "赤ワインは糖質低めですよ。グラス1杯なら大丈夫", "2025-12-19 08:00"),
    (16, 14, "辛口の白ワインも糖質少なめです", "2025-12-19 12:00"),
    (17, 15, "赤ワインいいんですね！ありがとうございます", "2025-12-19 19:00"),
    (18, None, "日本酒は糖質高いから避けてる", "2025-12-19 19:30"),
    (19, 18, "日本酒好きだったけど諦めました…", "2025-12-19 20:00"),
    (20, 18, "糖質オフの日本酒もあるらしいですよ", "2025-12-19 21:00"),
    (21, None, "焼酎とウイスキーは糖質ゼロだから助かる", "2025-12-20 19:00"),
    (22, 21, "蒸留酒は糖質ないんですよね。ハイボール最強", "2025-12-20 19:30"),
    (23, 21, "芋焼酎にハマってます", "2025-12-20 20:30"),
    (24, None, "飲み会でどうしてますか？断りづらい", "2025-12-20 21:00"),
    (25, 24, "最初の1杯だけ付き合って、あとはウーロン茶", "2025-12-21 08:00"),
    (26, 24, "ハイボールで通してます。周りも気にしない", "2025-12-21 12:00"),
    (27, 25, "それいいですね。参考にします", "2025-12-21 19:00"),
    (28, None, "お酒飲むと低血糖になりやすいって本当？", "2025-12-21 19:30"),
    (29, 28, "肝臓がアルコール分解に忙しくて糖新生が抑制されるらしい", "2025-12-21 20:00"),
    (30, 28, "SU剤やインスリン使ってる人は要注意ですね", "2025-12-21 21:00"),
    (31, None, "10年以上糖尿病だけど、お酒は適量守って楽しんでる", "2025-12-22 19:00"),
    (32, 31, "長く付き合うコツですね。参考になります", "2025-12-22 19:30"),
    (33, None, "忘年会シーズン、飲みすぎ注意だな", "2025-12-22 20:30"),
    (34, 33, "2次会は断るようにしてます", "2025-12-22 21:00"),
    (35, 33, "私も今年は控えめにしました", "2025-12-23 08:00"),
    (36, None, "メトホルミン飲んでるけど、お酒と一緒でも大丈夫？", "2025-12-23 19:00"),
    (37, 36, "大量飲酒は乳酸アシドーシスのリスクがあるから注意", "2025-12-23 19:30"),
    (38, 36, "私は飲む日はメトホルミン抜いてます。先生に確認済み", "2025-12-23 20:30"),
    (39, 37, "そうなんですね。気をつけます", "2025-12-23 21:00"),
    (40, None, "クリスマスにシャンパン飲んじゃった", "2025-12-25 20:00"),
    (41, 40, "クリスマスくらいいいでしょ！", "2025-12-25 20:30"),
    (42, None, "おつまみは何食べてますか？", "2025-12-26 19:00"),
    (43, 42, "枝豆、チーズ、刺身が定番です", "2025-12-26 19:30"),
    (44, 42, "焼き鳥（塩）もいいですよ", "2025-12-26 20:30"),
    (45, 43, "低糖質おつまみ大事ですよね", "2025-12-26 21:00"),
    (46, None, "年末年始、お酒の誘惑多すぎ", "2025-12-27 19:00"),
    (47, 46, "親戚の集まりで勧められるんですよね…", "2025-12-27 19:30"),
    (48, 46, "「薬飲んでるから」って断ってます", "2025-12-27 20:30"),
    (49, None, "お酒飲んだ翌日の血糖値どうですか？", "2025-12-28 19:00"),
    (50, 49, "私は低めになることが多い", "2025-12-28 19:30"),
    (51, 49, "つまみで食べすぎると翌朝高いです", "2025-12-28 20:30"),
    (52, None, "あけおめ！昨夜は乾杯しました", "2026-01-01 10:00"),
    (53, 52, "あけおめ！私も少しだけ飲みました", "2026-01-01 11:00"),
    (54, None, "正月三が日は飲みすぎた…反省", "2026-01-03 19:00"),
    (55, 54, "私も…今日から節制します", "2026-01-03 19:30"),
    (56, None, "診断されて2年目、お酒との付き合い方がわかってきた", "2026-01-04 19:00"),
    (57, 56, "どんな感じですか？", "2026-01-04 19:30"),
    (58, 57, "週1〜2回、蒸留酒を2杯まで。これで数値安定してます", "2026-01-04 20:30"),
    (59, None, "このスレ見て、お酒完全にやめなくていいんだって安心した", "2026-01-05 19:00"),
    (60, 59, "適量守れば大丈夫ですよね", "2026-01-05 19:30"),
    (61, None, "また飲み方のコツあったら教えてください", "2026-01-06 19:00"),
    (62, 61, "お互い情報共有しましょう！", "2026-01-06 19:30"),
    (63, None, "お酒も上手に付き合って人生楽しみたい", "2026-01-07 19:00"),
    (64, 63, "QOL大事ですよね", "2026-01-07 19:30"),
    (65, None, "無理せず、でも楽しく！が目標です", "2026-01-07 20:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.29")
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
