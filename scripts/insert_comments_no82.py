#!/usr/bin/env python3
"""Insert 58 comments for thread No.82: 冬の血圧管理"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "90a42048-47aa-4968-8898-c5c3dedc8358"
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
    (2, None, "糖尿病で血圧も高い人いますか", "2025-12-20 19:30"),
    (3, None, "冬になると血圧上がりやすい気がする", "2025-12-20 20:15"),
    (4, None, "診断されたばかりで血圧も気にするようになった", "2025-12-20 21:00"),
    (5, 4, "糖尿病と高血圧はセットの人多いですよね", "2025-12-20 21:45"),
    (6, None, "10年以上この病気で血圧の薬も飲んでる", "2025-12-21 10:30"),
    (7, 6, "私も降圧剤飲んでます", "2025-12-21 11:15"),
    (8, None, "寒いと血管が収縮して血圧上がるらしい", "2025-12-21 15:45"),
    (9, 8, "冬は特に気をつけないとですね", "2025-12-21 16:30"),
    (10, None, "朝起きたとき血圧測ってる人いますか", "2025-12-21 19:30"),
    (11, 10, "毎朝測ってます。記録もつけてる", "2025-12-21 20:15"),
    (12, 10, "起床時と寝る前の2回測ってます", "2025-12-21 21:00"),
    (13, None, "3年目だけど最近血圧も高くなってきた", "2025-12-22 11:30"),
    (14, 13, "主治医に相談したほうがいいですよ", "2025-12-22 12:15"),
    (15, None, "塩分控えるの難しい。味が薄く感じる", "2025-12-22 18:45"),
    (16, 15, "慣れると薄味でも美味しく感じますよ", "2025-12-22 19:30"),
    (17, 15, "出汁を効かせると塩分少なくても満足できる", "2025-12-22 20:15"),
    (18, None, "血圧計のおすすめありますか", "2025-12-23 10:30"),
    (19, 18, "オムロンの上腕式使ってます", "2025-12-23 11:15"),
    (20, 18, "手首式より上腕式のほうが正確らしい", "2025-12-23 12:00"),
    (21, None, "冬の朝は特に血圧高い", "2025-12-23 15:45"),
    (22, 21, "起きてすぐ測ると高いですよね", "2025-12-23 16:30"),
    (23, None, "ヒートショックも血圧関係あるよね", "2025-12-23 20:15"),
    (24, 23, "急激な温度差で血圧乱高下するから危険", "2025-12-23 21:00"),
    (25, None, "お風呂上がりに血圧下がりすぎることある", "2025-12-24 11:30"),
    (26, 25, "急に立ち上がらないほうがいいですよ", "2025-12-24 12:15"),
    (27, None, "運動すると血圧下がるらしいけど寒いと運動できない", "2025-12-24 19:20"),
    (28, 27, "室内でできる運動がいいですよね", "2025-12-24 20:00"),
    (29, None, "ストレスでも血圧上がる", "2025-12-25 14:30"),
    (30, 29, "年末は何かとストレス多いですよね", "2025-12-25 15:15"),
    (31, None, "カリウム摂ると血圧下がるって聞いた", "2025-12-25 20:30"),
    (32, 31, "でも腎臓悪いとカリウム制限あるから注意", "2025-12-25 21:15"),
    (33, None, "血糖値と血圧、両方管理するの大変", "2025-12-26 11:45"),
    (34, 33, "本当に。数字に追われる毎日", "2025-12-26 12:30"),
    (35, None, "薬飲み忘れないように気をつけてる", "2025-12-26 19:20"),
    (36, 35, "ピルケースで管理してます", "2025-12-26 20:00"),
    (37, None, "年末年始は塩分多い料理増えるから心配", "2025-12-27 10:30"),
    (38, 37, "おせちも塩分多いですよね", "2025-12-27 11:15"),
    (39, None, "正月はゆっくりして血圧安定させたい", "2025-12-28 18:30"),
    (40, None, "大晦日も血圧測定忘れずに", "2025-12-31 19:30"),
    (41, None, "あけおめ！今年も血圧管理頑張る", "2026-01-01 10:15"),
    (42, None, "正月の暴飲暴食で血圧上がった人いそう", "2026-01-02 14:30"),
    (43, 42, "はい、私です…", "2026-01-02 15:15"),
    (44, None, "年明け検診で血圧指摘されそう", "2026-01-03 18:45"),
    (45, None, "今から節制して間に合うかな", "2026-01-04 19:30"),
    (46, 45, "やらないよりはマシですよ", "2026-01-04 20:15"),
    (47, None, "このスレ参考になった", "2026-01-05 18:30"),
    (48, None, "血圧管理、地道に続けよう", "2026-01-06 19:15"),
    (49, None, "糖尿病と高血圧、仲間がいると心強い", "2026-01-07 20:00"),
    (50, None, "みんなで健康管理頑張ろう", "2026-01-08 19:15"),
    (51, None, "冬の血圧対策、勉強になった", "2026-01-09 18:30"),
    (52, None, "来年も気をつけていこう", "2026-01-09 20:00"),
    (53, None, "このスレありがとう", "2026-01-10 19:00"),
    (54, None, "血圧も血糖値も安定しますように", "2026-01-10 20:30"),
    (55, None, "健康第一で過ごしましょう", "2026-01-10 21:15"),
    (56, None, "また情報交換しましょう", "2026-01-11 18:45"),
    (57, None, "みんなお大事に", "2026-01-11 20:00"),
    (58, None, "来年の冬もこのスレで", "2026-01-11 21:00"),
    (59, None, "ありがとうございました！", "2026-01-12 19:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.82")
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
