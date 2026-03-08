#!/usr/bin/env python3
"""Insert 54 comments for thread No.35: 眼科検診行ってますか？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "96d75e45-36ee-4ef1-a3cd-a41f3784f0dd"
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
    ("less_than_1", ["1年未満","最近診断","診断されたばかり","診断されて数ヶ月"]),
]

def detect_duration(body):
    for cat, kws in DURATION_KEYWORDS:
        for kw in kws:
            if kw in body: return cat
    return None

COMMENTS = [
    (2, None, "糖尿病の人は眼科検診大事って言われたけど、みんな行ってますか？", "2025-12-16 19:00"),
    (3, None, "年1回行ってます。眼底検査", "2025-12-16 19:45"),
    (4, None, "私は半年に1回。網膜症の初期があるから", "2025-12-16 20:30"),
    (5, 4, "網膜症あると頻度上がるんですね", "2025-12-17 08:00"),
    (6, None, "診断されたばかりで眼科まだ行ってない。行った方がいい？", "2025-12-17 12:00"),
    (7, 6, "早めに行った方がいいですよ。ベースラインを知っておくのが大事", "2025-12-17 13:00"),
    (8, None, "眼底検査って瞳孔開くやつですか？", "2025-12-17 19:00"),
    (9, None, "散瞳検査ですね。検査後しばらく眩しい", "2025-12-17 19:45"),
    (10, 8, "目薬さして瞳孔開きます。車の運転できなくなるから注意", "2025-12-17 20:30"),
    (11, None, "OCT検査も毎回受けてます", "2025-12-18 12:00"),
    (12, None, "OCTって何の検査ですか？", "2025-12-18 12:45"),
    (13, 12, "網膜の断面を撮影する検査です。むくみとかわかる", "2025-12-18 19:00"),
    (14, None, "10年以上糖尿病で眼科サボってたら網膜症見つかった。後悔してる", "2025-12-18 19:45"),
    (15, 14, "定期検診大事ですね…私も気をつけます", "2025-12-18 20:30"),
    (16, None, "糖尿病網膜症って自覚症状ないの怖い", "2025-12-19 12:00"),
    (17, None, "進行してから気づいても遅いですもんね", "2025-12-19 12:45"),
    (18, 16, "だからこそ定期検診が大事なんですよね", "2025-12-19 19:00"),
    (19, None, "レーザー治療受けた人いますか", "2025-12-19 19:45"),
    (20, None, "受けました。チカチカして少し痛かった", "2025-12-19 20:30"),
    (21, 19, "視力への影響ありましたか？", "2025-12-20 08:00"),
    (22, 21, "視野が少し狭くなった気がするけど進行は止まった", "2025-12-20 12:00"),
    (23, None, "眼科の選び方ってありますか", "2025-12-20 19:00"),
    (24, None, "糖尿病専門の眼科医がいるところがいいですよ", "2025-12-20 19:45"),
    (25, 23, "大学病院とか大きい病院の眼科がおすすめ", "2025-12-20 20:30"),
    (26, None, "内科と眼科で情報共有してもらってます", "2025-12-21 12:00"),
    (27, None, "診療情報提供書書いてもらってる", "2025-12-21 12:45"),
    (28, 26, "連携大事ですよね", "2025-12-21 19:00"),
    (29, None, "眼底検査の写真もらって見せてもらうと怖くなる", "2025-12-21 19:45"),
    (30, None, "血管の状態が見えるんですよね", "2025-12-21 20:30"),
    (31, 29, "でも変化がわかるから比較できて安心もある", "2025-12-22 08:00"),
    (32, None, "年末年始で眼科休みだから年内に行っておいた", "2025-12-22 14:00"),
    (33, None, "私も先週行ってきた。異常なしでホッとした", "2025-12-22 15:00"),
    (34, 32, "定期的に行ってるの偉いですね", "2025-12-22 19:00"),
    (35, None, "白内障も糖尿病だと進みやすいらしい", "2025-12-23 12:00"),
    (36, None, "手術受けた人いますか？", "2025-12-23 12:45"),
    (37, 35, "私は白内障で手術しました。日帰りでした", "2025-12-23 19:00"),
    (38, None, "診断されて5年目、今のところ眼は大丈夫", "2025-12-24 14:00"),
    (39, 38, "血糖コントロール頑張ってるおかげですね", "2025-12-24 15:00"),
    (40, None, "抗VEGF注射受けてる人いますか", "2025-12-25 14:00"),
    (41, None, "黄斑浮腫で受けてます。効果あります", "2025-12-25 15:00"),
    (42, 40, "眼に注射って怖くないですか？", "2025-12-25 19:00"),
    (43, 42, "麻酔するから痛くないですよ。でも緊張はする", "2025-12-25 19:45"),
    (44, None, "あけおめ！今年も眼を大事にしよう", "2026-01-01 10:00"),
    (45, 44, "あけおめ！定期検診忘れずに", "2026-01-01 11:00"),
    (46, None, "今年の目標は眼科サボらないこと", "2026-01-03 14:00"),
    (47, None, "予約入れておくと忘れないですよ", "2026-01-03 15:00"),
    (48, 46, "私は内科の検診と同じ時期に予約入れてます", "2026-01-03 19:00"),
    (49, None, "このスレ見て眼科予約した", "2026-01-04 19:00"),
    (50, 49, "いいですね！早期発見大事", "2026-01-04 19:45"),
    (51, None, "失明は絶対避けたい。検診続けます", "2026-01-05 19:00"),
    (52, None, "また眼科の情報あったら共有しましょう", "2026-01-06 19:00"),
    (53, 52, "よろしくお願いします", "2026-01-06 19:45"),
    (54, None, "眼を守って糖尿病と付き合っていこう", "2026-01-07 19:00"),
    (55, 54, "お互い頑張りましょう！", "2026-01-07 19:45"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.35")
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
