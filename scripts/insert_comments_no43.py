#!/usr/bin/env python3
"""Insert 69 comments for thread No.43: 年末年始の血糖値管理"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "ad4de479-c099-4d75-a4bc-1c2591fa5865"
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
    (2, None, "年末年始の血糖値管理どうしてますか？毎年乱れる", "2025-12-08 19:14"),
    (3, None, "私も毎年正月明けにHbA1c上がる…", "2025-12-08 19:52"),
    (4, None, "今年こそは気をつけたい", "2025-12-08 20:28"),
    (5, 3, "わかります。1月の検査が怖い", "2025-12-09 08:17"),
    (6, None, "診断されたばかりで初めての年末年始。どう乗り切ればいい？", "2025-12-09 12:33"),
    (7, 6, "食べすぎない、運動する、薬は忘れない。これだけ守れば大丈夫", "2025-12-09 12:58"),
    (8, None, "帰省すると食事のコントロールが難しい", "2025-12-09 19:21"),
    (9, None, "実家だと「食べろ食べろ」攻撃がすごい", "2025-12-09 19:56"),
    (10, 8, "親にちゃんと説明しておくといいですよ", "2025-12-09 20:31"),
    (11, None, "年末年始は外食も多くなる", "2025-12-10 12:18"),
    (12, None, "忘年会ラッシュで血糖値やばい", "2025-12-10 19:07"),
    (13, 12, "私も先週2回忘年会あった…", "2025-12-10 19:42"),
    (14, None, "薬は多めに処方してもらいました", "2025-12-11 12:23"),
    (15, None, "病院休みになる前に受診しておかないと", "2025-12-11 19:08"),
    (16, 15, "私は先週行ってきました。1月中旬まで薬もらった", "2025-12-11 19:43"),
    (17, None, "診断されて2年目だけど、去年の年末年始は失敗した", "2025-12-12 12:11"),
    (18, 17, "今年はリベンジですね！", "2025-12-12 12:46"),
    (19, None, "おせちの糖質が気になる", "2025-12-12 19:22"),
    (20, None, "栗きんとんとか黒豆とか甘いもの多いですよね", "2025-12-12 19:57"),
    (21, 19, "低糖質おせち作ろうかな", "2025-12-12 20:32"),
    (22, None, "お餅は何個まで食べていいんだろう", "2025-12-13 12:14"),
    (23, None, "1個で我慢してます。血糖値爆上がりするから", "2025-12-13 12:49"),
    (24, 22, "私は食べない選択をしました…辛いけど", "2025-12-13 19:16"),
    (25, None, "10年以上糖尿病だけど、年末年始の管理は未だに難しい", "2025-12-14 14:08"),
    (26, 25, "ベテランでも難しいんですね…", "2025-12-14 14:43"),
    (27, None, "年末年始こそリブレが活躍する", "2025-12-14 19:21"),
    (28, None, "食べた後すぐ数値見れるから調整しやすい", "2025-12-14 19:56"),
    (29, 27, "CGMあると安心感違いますよね", "2025-12-14 20:31"),
    (30, None, "夜更かしも血糖値に悪いから気をつけないと", "2025-12-15 12:17"),
    (31, None, "紅白見て夜更かし確定だけど…", "2025-12-15 19:08"),
    (32, 30, "睡眠リズム乱れると翌朝高くなりますよね", "2025-12-15 19:43"),
    (33, None, "年末年始も運動は続けたい", "2025-12-16 12:22"),
    (34, None, "初詣で歩くのも運動になるかな", "2025-12-16 12:57"),
    (35, 33, "私は朝の散歩だけは続けるつもり", "2025-12-16 19:14"),
    (36, None, "お酒も控えめにしないと", "2025-12-17 12:19"),
    (37, None, "ハイボールで乗り切ります", "2025-12-17 19:06"),
    (38, 36, "日本酒は糖質高いから避けてます", "2025-12-17 19:41"),
    (39, None, "今週で仕事納め。気が緩みそう", "2025-12-22 12:13"),
    (40, None, "休みに入ると生活リズム乱れがち", "2025-12-22 19:08"),
    (41, 39, "私も明日から休み。気をつけなきゃ", "2025-12-22 19:43"),
    (42, None, "クリスマスケーキ食べちゃった…", "2025-12-25 20:17"),
    (43, 42, "私も少しだけ食べました。ご褒美ということで", "2025-12-25 20:52"),
    (44, None, "大掃除で動いたから運動になったはず", "2025-12-28 15:21"),
    (45, None, "明日から実家。薬忘れないようにしないと", "2025-12-29 19:08"),
    (46, 45, "いってらっしゃい！気をつけて", "2025-12-29 19:43"),
    (47, None, "大晦日、年越しそば食べる予定", "2025-12-31 18:14"),
    (48, None, "私は糖質0麺で年越しします", "2025-12-31 18:49"),
    (49, 47, "量控えめにして食べます", "2025-12-31 19:24"),
    (50, None, "あけおめ！今年もよろしくお願いします", "2026-01-01 00:07"),
    (51, None, "あけましておめでとうございます！", "2026-01-01 00:23"),
    (52, 50, "あけおめ！健康第一で頑張りましょう", "2026-01-01 08:11"),
    (53, None, "お雑煮のお餅1個だけにした", "2026-01-01 10:18"),
    (54, None, "おせち少しずつ食べてます", "2026-01-01 12:33"),
    (55, 53, "えらい！私は2個食べちゃった…", "2026-01-01 12:58"),
    (56, None, "初詣行ってきた。結構歩いた", "2026-01-01 15:21"),
    (57, None, "正月太りしないように気をつけてる", "2026-01-02 12:14"),
    (58, None, "実家のご飯おいしくて食べすぎた", "2026-01-02 19:08"),
    (59, 58, "わかる…断れないですよね", "2026-01-02 19:43"),
    (60, None, "今日から節制モードに入ります", "2026-01-03 10:17"),
    (61, None, "三が日終わったし普通の食事に戻す", "2026-01-03 12:22"),
    (62, 60, "私も今日から頑張る", "2026-01-03 12:57"),
    (63, None, "血糖値測ったら案の定高かった…", "2026-01-04 08:14"),
    (64, None, "まあ年末年始だし仕方ない", "2026-01-04 12:19"),
    (65, 63, "私も。今日から切り替えましょう", "2026-01-04 12:54"),
    (66, None, "仕事始まったら生活リズム戻るかな", "2026-01-05 19:11"),
    (67, None, "1月の検査に向けて頑張る", "2026-01-06 12:16"),
    (68, 67, "お互い頑張りましょう！", "2026-01-06 12:51"),
    (69, None, "来年の年末年始はもっとうまくやりたい", "2026-01-07 19:08"),
    (70, 69, "経験を活かしていきましょう", "2026-01-07 19:43"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.43")
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
