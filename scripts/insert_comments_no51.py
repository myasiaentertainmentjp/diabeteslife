#!/usr/bin/env python3
"""Insert 57 comments for thread No.51: 今年の目標HbA1c"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "3b7cd3bd-132e-497c-b74d-59c15d16d15f"
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
    (2, None, "今年の目標HbA1c、みんなどのくらいに設定してますか？", "2026-01-01 10:14"),
    (3, None, "7.0以下をキープしたい", "2026-01-01 10:51"),
    (4, None, "今6.8だから6.5を目指します", "2026-01-01 11:28"),
    (5, 3, "7.0以下いいですね。私も同じ目標です", "2026-01-01 12:17"),
    (6, None, "診断されたばかりで目標の立て方がわからない", "2026-01-01 19:08"),
    (7, 6, "主治医と相談して決めるといいですよ", "2026-01-01 19:44"),
    (8, None, "あけおめ！今年こそ6%台に入りたい", "2026-01-01 20:21"),
    (9, None, "去年は7.2だったから今年は7.0切りたい", "2026-01-02 10:14"),
    (10, None, "現実的な目標が大事ですよね", "2026-01-02 10:51"),
    (11, 9, "0.2下げるのでも大変ですもんね", "2026-01-02 14:08"),
    (12, None, "目標高すぎると挫折するから無理のない範囲で", "2026-01-02 19:11"),
    (13, None, "診断されて2年目、去年より0.5下げたい", "2026-01-02 19:47"),
    (14, 13, "具体的な数値目標いいですね", "2026-01-02 20:23"),
    (15, None, "5%台は難しいのかな", "2026-01-03 10:17"),
    (16, None, "薬なしで5%台は相当頑張らないと", "2026-01-03 10:53"),
    (17, 15, "低すぎると低血糖リスクもあるから主治医と相談を", "2026-01-03 14:08"),
    (18, None, "今年は食事改善で0.3下げるのが目標", "2026-01-03 19:11"),
    (19, None, "運動も頑張って数値改善したい", "2026-01-03 19:47"),
    (20, 18, "食事大事ですよね。私も糖質制限続けます", "2026-01-03 20:23"),
    (21, None, "10年以上糖尿病で、今年も7%以下キープが目標", "2026-01-04 14:11"),
    (22, 21, "長年キープできてるのすごいですね", "2026-01-04 14:47"),
    (23, None, "合併症予防のためにも7%以下を維持したい", "2026-01-04 19:08"),
    (24, None, "目標は立てたけど正月で早速やばい", "2026-01-04 19:44"),
    (25, 24, "今日から頑張れば大丈夫ですよ", "2026-01-04 20:21"),
    (26, None, "次の検査でどのくらいか楽しみ", "2026-01-05 12:17"),
    (27, None, "正月明けの検査怖い…", "2026-01-05 12:53"),
    (28, 26, "私は来週検査です。ドキドキ", "2026-01-05 19:08"),
    (29, None, "HbA1cは1〜2ヶ月の平均だから正月の影響は次の次かも", "2026-01-05 19:44"),
    (30, None, "そうなんですね。少し安心した", "2026-01-05 20:21"),
    (31, 29, "だから今から頑張れば間に合う", "2026-01-06 08:14"),
    (32, None, "目標達成したらご褒美決めてます", "2026-01-06 12:19"),
    (33, None, "いいですね！何にするんですか？", "2026-01-06 12:55"),
    (34, 32, "旅行に行きたい", "2026-01-06 19:11"),
    (35, None, "モチベーション維持が大事", "2026-01-07 12:17"),
    (36, None, "毎月の検査で進捗確認してます", "2026-01-07 12:53"),
    (37, 35, "目標があると頑張れますよね", "2026-01-07 19:08"),
    (38, None, "小さな目標を積み重ねるのがいいかも", "2026-01-08 12:17"),
    (39, None, "まずは0.1下げることから", "2026-01-08 12:53"),
    (40, 38, "スモールステップ大事ですよね", "2026-01-08 19:08"),
    (41, None, "このスレ見てモチベ上がった", "2026-01-09 19:11"),
    (42, 41, "一緒に頑張りましょう！", "2026-01-09 19:47"),
    (43, None, "年末に振り返って目標達成してたら嬉しい", "2026-01-10 12:17"),
    (44, None, "1年後が楽しみですね", "2026-01-10 12:53"),
    (45, 43, "達成報告しに来ます！", "2026-01-10 19:08"),
    (46, None, "目標仲間、今年1年頑張ろう", "2026-01-11 19:11"),
    (47, 46, "頑張りましょう！", "2026-01-11 19:47"),
    (48, None, "定期的にこのスレで進捗報告したい", "2026-01-12 12:17"),
    (49, 48, "いいですね！励みになります", "2026-01-12 12:53"),
    (50, None, "今年の目標、絶対達成するぞ", "2026-01-13 19:08"),
    (51, 50, "応援してます！", "2026-01-13 19:44"),
    (52, None, "みんなの目標聞けて刺激になった", "2026-01-14 19:11"),
    (53, None, "お互い頑張ろうって思える", "2026-01-14 19:47"),
    (54, 52, "仲間がいると心強いですよね", "2026-01-14 20:23"),
    (55, None, "また経過報告しに来ます", "2026-01-15 19:08"),
    (56, 55, "待ってます！", "2026-01-15 19:44"),
    (57, None, "今年の目標HbA1c、みんなで達成しよう", "2026-01-16 19:11"),
    (58, 57, "ファイト！", "2026-01-16 19:47"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.51")
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
