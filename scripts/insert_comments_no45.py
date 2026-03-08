#!/usr/bin/env python3
"""Insert 64 comments for thread No.45: 忘年会・新年会の乗り切り方"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "dbfd67e6-37cd-4bbf-92e9-a5955447bcf0"
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
    (2, None, "忘年会シーズン到来。みんなどう乗り切ってますか？", "2025-12-05 19:08"),
    (3, None, "飲み会は断れないから食べるもので調整してます", "2025-12-05 19:44"),
    (4, None, "お酒はハイボール一択。糖質ゼロだから", "2025-12-05 20:21"),
    (5, 3, "何食べてますか？", "2025-12-06 08:17"),
    (6, 5, "刺身、焼き鳥（塩）、枝豆が定番です", "2025-12-06 12:23"),
    (7, None, "診断されたばかりで忘年会どうしようか悩んでます", "2025-12-06 12:59"),
    (8, 7, "参加して食べるもの選べば大丈夫ですよ", "2025-12-06 19:14"),
    (9, None, "2次会は断るようにしてます", "2025-12-06 19:51"),
    (10, None, "「車で来てる」って言って断ってる", "2025-12-06 20:28"),
    (11, 9, "それいい言い訳ですね", "2025-12-07 08:11"),
    (12, None, "ビールは最初の1杯だけにしてます", "2025-12-07 12:18"),
    (13, None, "乾杯だけ付き合って後はウーロン茶", "2025-12-07 12:54"),
    (14, 12, "私もそうしてます。ビールは糖質高いから", "2025-12-07 19:09"),
    (15, None, "居酒屋だと糖質低いメニュー選びやすい", "2025-12-08 12:22"),
    (16, None, "焼き鳥はタレより塩を選んでます", "2025-12-08 12:58"),
    (17, 15, "刺身と冷奴とサラダで乗り切る", "2025-12-08 19:13"),
    (18, None, "〆のラーメンは我慢", "2025-12-08 19:49"),
    (19, None, "〆が一番の敵ですよね", "2025-12-08 20:26"),
    (20, 18, "私も〆だけは断ってます", "2025-12-09 08:14"),
    (21, None, "診断されて2年目、飲み会のコツがわかってきた", "2025-12-09 12:21"),
    (22, 21, "どんなコツですか？", "2025-12-09 12:57"),
    (23, 22, "最初に野菜とタンパク質をしっかり食べる。お酒は蒸留酒", "2025-12-09 19:11"),
    (24, None, "今週3回忘年会ある…", "2025-12-10 12:17"),
    (25, None, "多いですね！体に気をつけて", "2025-12-10 12:53"),
    (26, 24, "私も先週2回あった。疲れた", "2025-12-10 19:08"),
    (27, None, "10年以上糖尿病だけど、飲み会は楽しんでます", "2025-12-11 14:14"),
    (28, 27, "食べるもの選べば大丈夫ですよね", "2025-12-11 14:51"),
    (29, None, "職場の人に糖尿病のこと言ってないから気を使う", "2025-12-11 19:17"),
    (30, None, "「ダイエット中」って言ってごまかしてます", "2025-12-11 19:53"),
    (31, 29, "私も言ってない。色々聞かれるの面倒だから", "2025-12-11 20:29"),
    (32, None, "飲み会の前に軽く食べておくと食べすぎ防げる", "2025-12-12 12:22"),
    (33, None, "ナッツとかチーズつまんでから行きます", "2025-12-12 12:58"),
    (34, 32, "空腹で行くと危険ですよね", "2025-12-12 19:13"),
    (35, None, "コース料理だと選べなくて困る", "2025-12-13 12:19"),
    (36, None, "ご飯ものは残すようにしてます", "2025-12-13 12:55"),
    (37, 35, "食べられるものだけ食べる", "2025-12-13 19:11"),
    (38, None, "明日の忘年会、幹事だからお店選べた", "2025-12-14 19:08"),
    (39, 38, "どこにしましたか？", "2025-12-14 19:44"),
    (40, 39, "焼き鳥屋さん。単品で頼めるから", "2025-12-14 20:21"),
    (41, None, "年内最後の忘年会終わった！", "2025-12-20 22:14"),
    (42, None, "お疲れ様でした！", "2025-12-20 22:51"),
    (43, 41, "なんとか乗り切りましたね", "2025-12-21 08:17"),
    (44, None, "年明けは新年会が待ってる…", "2025-12-25 19:11"),
    (45, None, "忘年会乗り切ったと思ったらまた飲み会", "2025-12-25 19:47"),
    (46, 44, "同じコツで乗り切りましょう", "2025-12-25 20:23"),
    (47, None, "あけおめ！新年会シーズン到来", "2026-01-01 10:14"),
    (48, 47, "あけおめ！また飲み会モードですね", "2026-01-01 10:51"),
    (49, None, "来週新年会2件入ってる", "2026-01-03 19:08"),
    (50, None, "忘年会と同じ作戦で乗り切ります", "2026-01-03 19:44"),
    (51, 49, "頑張ってください！", "2026-01-03 20:21"),
    (52, None, "新年会1件目終了。なんとかセーブできた", "2026-01-08 22:17"),
    (53, 52, "お疲れ様です！", "2026-01-08 22:54"),
    (54, None, "新年会シーズンも終わりが見えてきた", "2026-01-11 19:11"),
    (55, None, "やっと落ち着きますね", "2026-01-11 19:47"),
    (56, 54, "あと1件で終わり", "2026-01-11 20:23"),
    (57, None, "このスレのおかげで乗り切れました", "2026-01-14 19:08"),
    (58, 57, "お互い頑張りましたね！", "2026-01-14 19:44"),
    (59, None, "来年もこのスレ参考にします", "2026-01-15 12:17"),
    (60, None, "飲み会シーズン終了！お疲れ様でした", "2026-01-15 19:11"),
    (61, 60, "お疲れ様でした！", "2026-01-15 19:47"),
    (62, None, "また来年の忘年会シーズンに会いましょう", "2026-01-16 19:08"),
    (63, 62, "その時まで健康でいましょう", "2026-01-16 19:44"),
    (64, None, "飲み会仲間、ありがとうございました", "2026-01-17 19:11"),
    (65, 64, "こちらこそ！", "2026-01-17 19:47"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.45")
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
