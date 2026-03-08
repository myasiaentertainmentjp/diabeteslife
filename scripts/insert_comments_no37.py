#!/usr/bin/env python3
"""Insert 59 comments for thread No.37: 主治医との関係どうですか？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "0fcb0316-4304-46a8-97d8-4f79e56038e0"
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
    (2, None, "主治医との関係どうですか？うまくコミュニケーション取れてますか", "2025-12-16 19:00"),
    (3, None, "今の先生は話しやすくて信頼してます", "2025-12-16 19:45"),
    (4, None, "正直あまり相性良くない。でも変えるのも面倒で", "2025-12-16 20:30"),
    (5, 4, "病院変えてもいいと思いますよ。長く付き合うんだから", "2025-12-17 08:00"),
    (6, None, "診断されたばかりで主治医との付き合い方がわからない", "2025-12-17 12:00"),
    (7, 6, "遠慮せず質問していいと思いますよ。わからないことはわからないって言って", "2025-12-17 13:00"),
    (8, None, "診察時間短くて聞きたいこと聞けない", "2025-12-17 19:00"),
    (9, None, "メモに書いて持っていくようにしてます", "2025-12-17 19:45"),
    (10, 8, "私も質問リスト作って行きます。忘れないように", "2025-12-17 20:30"),
    (11, None, "先生が忙しそうで質問しにくい", "2025-12-18 12:00"),
    (12, None, "数値だけ見て話を聞いてくれない先生だった。変えた", "2025-12-18 12:45"),
    (13, 12, "そういう先生いますよね。変えて正解", "2025-12-18 19:00"),
    (14, None, "今の先生は生活のことも聞いてくれて嬉しい", "2025-12-18 19:45"),
    (15, None, "病院変えた人いますか？どうやって探しました？", "2025-12-18 20:30"),
    (16, 15, "口コミサイトで探しました", "2025-12-19 08:00"),
    (17, None, "糖尿病専門医のいる病院がいいですよ", "2025-12-19 12:00"),
    (18, 15, "知り合いの紹介で変えました", "2025-12-19 12:45"),
    (19, None, "10年以上同じ先生。お互い信頼関係できてる", "2025-12-19 19:00"),
    (20, 19, "長いお付き合いですね。羨ましい", "2025-12-19 19:45"),
    (21, None, "先生に怒られるのが怖くて正直に言えない時がある", "2025-12-19 20:30"),
    (22, None, "正直に言った方がいいですよ。隠しても意味ないから", "2025-12-20 08:00"),
    (23, 21, "怒る先生は変えた方がいいかも。サポートしてくれる先生がいい", "2025-12-20 12:00"),
    (24, None, "セカンドオピニオン取ったことある人いますか", "2025-12-20 12:45"),
    (25, None, "一度取りました。結果同じ意見だったけど納得できた", "2025-12-20 19:00"),
    (26, 24, "迷った時は取るのもありですよね", "2025-12-20 19:45"),
    (27, None, "先生が若くて経験あるか不安だったけど、勉強熱心でいい先生だった", "2025-12-20 20:30"),
    (28, None, "診察前に血糖値ノート見返して報告してます", "2025-12-21 12:00"),
    (29, 28, "記録見せると先生も判断しやすいですよね", "2025-12-21 13:00"),
    (30, None, "リブレのデータ見せたら話が早くなった", "2025-12-21 19:00"),
    (31, None, "先生との相性って大事だと思う", "2025-12-21 19:45"),
    (32, 31, "長く付き合うから妥協したくない", "2025-12-21 20:30"),
    (33, None, "診断されて2年目、やっと先生に本音言えるようになった", "2025-12-22 12:00"),
    (34, 33, "時間かかりますよね", "2025-12-22 13:00"),
    (35, None, "先生が異動になって新しい先生に変わった", "2025-12-22 19:00"),
    (36, None, "大学病院だと先生が変わることありますよね", "2025-12-22 19:45"),
    (37, 35, "また一から関係作るの大変ですよね", "2025-12-22 20:30"),
    (38, None, "先生に感謝の気持ちを伝えたことある人いますか", "2025-12-23 12:00"),
    (39, None, "HbA1c下がった時にありがとうございますって言いました", "2025-12-23 13:00"),
    (40, 38, "年末に「良いお年を」って言ったら喜んでくれた", "2025-12-23 19:00"),
    (41, None, "先生も人間だからコミュニケーション大事", "2025-12-24 14:00"),
    (42, None, "薬変えてほしいって言いにくい", "2025-12-24 19:00"),
    (43, 42, "副作用辛いなら正直に言った方がいいですよ", "2025-12-24 19:45"),
    (44, None, "年末最後の診察で「よくがんばりましたね」って言われて嬉しかった", "2025-12-25 14:00"),
    (45, 44, "そういう言葉、嬉しいですよね", "2025-12-25 15:00"),
    (46, None, "あけおめ！今年も主治医と二人三脚で頑張る", "2026-01-01 10:00"),
    (47, 46, "あけおめ！いいチーム関係ですね", "2026-01-01 11:00"),
    (48, None, "年明け最初の診察緊張する", "2026-01-03 14:00"),
    (49, None, "正月の数値怖いけど正直に報告します", "2026-01-03 15:00"),
    (50, 48, "お互い頑張りましょう", "2026-01-03 19:00"),
    (51, None, "このスレ見て主治医との関係見直そうと思った", "2026-01-04 19:00"),
    (52, 51, "コミュニケーション大事ですよね", "2026-01-04 19:45"),
    (53, None, "先生を信頼できると治療も頑張れる", "2026-01-05 12:00"),
    (54, None, "患者側からも歩み寄りが必要かも", "2026-01-05 19:00"),
    (55, 54, "双方向のコミュニケーションですね", "2026-01-05 19:45"),
    (56, None, "また主治医との話あったら共有しましょう", "2026-01-06 19:00"),
    (57, 56, "よろしくお願いします", "2026-01-06 19:45"),
    (58, None, "主治医との良い関係を築いていきたい", "2026-01-07 12:00"),
    (59, None, "治療はチームワーク", "2026-01-07 19:00"),
    (60, 59, "その通りですね！", "2026-01-07 19:45"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.37")
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
