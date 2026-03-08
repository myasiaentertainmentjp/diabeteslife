#!/usr/bin/env python3
"""Insert 64 comments for thread No.39: 旅行時の血糖値管理"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "6a04ff8c-ab7e-44fa-b179-572b0000d574"
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
    (2, None, "旅行の時、血糖値管理どうしてますか？", "2025-12-16 19:00"),
    (3, None, "薬は多めに持っていくようにしてます", "2025-12-16 19:45"),
    (4, None, "血糖測定器とブドウ糖は必須", "2025-12-16 20:30"),
    (5, 3, "私も。何かあった時用に余分に持っていきます", "2025-12-17 08:00"),
    (6, None, "診断されたばかりで旅行不安。行っても大丈夫ですか", "2025-12-17 12:00"),
    (7, 6, "準備すれば大丈夫ですよ。楽しんできてください", "2025-12-17 12:45"),
    (8, None, "インスリン使ってる人、持ち運びどうしてますか", "2025-12-17 19:00"),
    (9, None, "FRIOの保冷ポーチ使ってます", "2025-12-17 19:45"),
    (10, 8, "保冷バッグに保冷剤入れて持っていってます", "2025-12-17 20:30"),
    (11, None, "飛行機の時、インスリンは手荷物にしてます", "2025-12-18 12:00"),
    (12, None, "預け荷物だと温度管理できないですもんね", "2025-12-18 12:45"),
    (13, 11, "英文の診断書も持っていくと安心ですよ", "2025-12-18 19:00"),
    (14, None, "旅行中は食事が不規則になりがち", "2025-12-18 19:45"),
    (15, None, "観光地だと外食ばかりになる", "2025-12-18 20:30"),
    (16, 14, "コンビニでサラダとか買って調整してます", "2025-12-19 08:00"),
    (17, None, "旅行先で低血糖になったことある", "2025-12-19 12:00"),
    (18, None, "観光で歩きすぎて低血糖になった。ブドウ糖持っててよかった", "2025-12-19 12:45"),
    (19, 17, "私もあります。運動量増えるから気をつけないと", "2025-12-19 19:00"),
    (20, None, "海外旅行の時どうしてますか", "2025-12-19 19:45"),
    (21, None, "海外の病院リスト調べておきます", "2025-12-19 20:30"),
    (22, 20, "旅行保険は必須ですね", "2025-12-20 08:00"),
    (23, None, "10年以上糖尿病で何度も旅行してるけど、準備が大事", "2025-12-20 12:00"),
    (24, 23, "ベテランの方のアドバイス参考になります", "2025-12-20 12:45"),
    (25, None, "時差があると薬のタイミング難しい", "2025-12-20 19:00"),
    (26, None, "主治医に相談して調整方法聞いておきました", "2025-12-20 19:45"),
    (27, 25, "事前に相談しておくと安心ですよね", "2025-12-20 20:30"),
    (28, None, "リブレつけてると旅行中も安心", "2025-12-21 12:00"),
    (29, None, "スマホでピッとするだけだから楽ですよね", "2025-12-21 12:45"),
    (30, 28, "針刺さなくていいから旅行向きですね", "2025-12-21 19:00"),
    (31, None, "温泉旅行の時リブレ剥がれないか心配だった", "2025-12-21 19:45"),
    (32, None, "防水テープ貼って入りました", "2025-12-21 20:30"),
    (33, 31, "私も上からテープ貼ってます。剥がれたことない", "2025-12-22 08:00"),
    (34, None, "年末年始に帰省するけど、これも旅行みたいなもの", "2025-12-22 12:00"),
    (35, None, "実家だと食事のコントロール難しい", "2025-12-22 12:45"),
    (36, 34, "帰省も準備大事ですよね", "2025-12-22 19:00"),
    (37, None, "旅行先の病院調べておくと安心", "2025-12-22 19:45"),
    (38, None, "糖尿病手帳は常に持ち歩いてます", "2025-12-23 12:00"),
    (39, 38, "何かあった時に役立ちますよね", "2025-12-23 12:45"),
    (40, None, "診断されて2年目、初めて海外旅行行ってきた", "2025-12-23 19:00"),
    (41, 40, "どこに行きました？", "2025-12-23 19:45"),
    (42, 41, "台湾です。食事気をつけながら楽しめました", "2025-12-23 20:30"),
    (43, None, "機内食は事前に糖尿病食リクエストできますよ", "2025-12-24 14:00"),
    (44, None, "知らなかった！次から頼んでみます", "2025-12-24 15:00"),
    (45, 43, "JALもANAも対応してくれますよ", "2025-12-24 19:00"),
    (46, None, "旅先でご当地グルメ食べたい気持ちとの葛藤", "2025-12-25 14:00"),
    (47, None, "少量ずつ色々食べるようにしてます", "2025-12-25 15:00"),
    (48, 46, "食べすぎなければ大丈夫。旅行は楽しまないと", "2025-12-25 19:00"),
    (49, None, "お正月は実家で過ごしてきます", "2025-12-28 14:00"),
    (50, None, "薬忘れずに持っていってくださいね", "2025-12-28 15:00"),
    (51, 49, "いってらっしゃい！", "2025-12-28 19:00"),
    (52, None, "あけおめ！帰省から戻りました", "2026-01-02 14:00"),
    (53, 52, "おかえりなさい！血糖値どうでしたか", "2026-01-02 15:00"),
    (54, 53, "食べすぎたけど薬でなんとかなりました笑", "2026-01-02 19:00"),
    (55, None, "今年は旅行たくさん行きたい", "2026-01-03 14:00"),
    (56, None, "糖尿病でも旅行楽しめますよね", "2026-01-03 15:00"),
    (57, 55, "準備すれば大丈夫！", "2026-01-03 19:00"),
    (58, None, "このスレ参考になります。旅行前に見返す", "2026-01-04 19:00"),
    (59, 58, "お役に立てて嬉しいです", "2026-01-04 19:45"),
    (60, None, "また旅行のコツあったら共有しましょう", "2026-01-05 19:00"),
    (61, 60, "よろしくお願いします", "2026-01-05 19:45"),
    (62, None, "糖尿病でも人生楽しもう。旅行も諦めない", "2026-01-06 19:00"),
    (63, 62, "その通り！", "2026-01-06 19:45"),
    (64, None, "旅行仲間、これからもよろしく", "2026-01-07 19:00"),
    (65, 64, "よろしくお願いします！", "2026-01-07 19:45"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.39")
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
