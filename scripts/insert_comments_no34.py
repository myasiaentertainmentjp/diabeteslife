#!/usr/bin/env python3
"""Insert 54 comments for thread No.34: 足のしびれ・神経障害について"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "b18d4dcd-a7b3-46e3-951c-2191133c3397"
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
    (2, None, "足の先がしびれる症状ある人いますか？", "2025-12-16 19:00"),
    (3, None, "私も足の裏がジンジンする感じあります", "2025-12-16 19:45"),
    (4, None, "糖尿病性神経障害かもしれないから主治医に相談した方がいいですよ", "2025-12-16 20:30"),
    (5, 2, "私も同じ症状で検査したら末梢神経障害って言われました", "2025-12-17 08:00"),
    (6, None, "診断されたばかりなのに足がしびれる。進行早いのかな", "2025-12-17 12:00"),
    (7, 6, "早めに血糖コントロールすれば改善することもあるみたいですよ", "2025-12-17 13:00"),
    (8, None, "夜寝る時に足がつる", "2025-12-17 19:00"),
    (9, None, "ビタミンB12のサプリ飲んでます", "2025-12-17 19:45"),
    (10, 8, "私も夜中に足つる。マグネシウム取るようにしてます", "2025-12-17 20:30"),
    (11, None, "メチコバール処方されてる人いますか", "2025-12-18 12:00"),
    (12, None, "飲んでます。効果は緩やかだけど続けてる", "2025-12-18 12:45"),
    (13, 11, "私も処方されてます。神経の修復を助けるらしい", "2025-12-18 19:00"),
    (14, None, "足の感覚が鈍くなってきた気がする", "2025-12-18 19:45"),
    (15, None, "怪我に気づかないのが怖い", "2025-12-18 20:30"),
    (16, 15, "毎日お風呂で足をチェックしてます", "2025-12-19 08:00"),
    (17, None, "10年以上経って神経障害が出てきた。血糖コントロール大事だった", "2025-12-19 12:00"),
    (18, 17, "やっぱり長期間だと出やすいんですね", "2025-12-19 13:00"),
    (19, None, "フットケア外来行ってる人いますか", "2025-12-19 19:00"),
    (20, None, "3ヶ月に1回行ってます。爪の切り方とか教えてもらった", "2025-12-19 19:45"),
    (21, 19, "そういうのあるんですね。私も行ってみようかな", "2025-12-19 20:30"),
    (22, None, "足の冷えが気になる。靴下2枚履いてる", "2025-12-20 12:00"),
    (23, None, "電気毛布使う時は低温やけどに注意って言われた", "2025-12-20 12:45"),
    (24, 22, "私も冬は足が冷える。足湯してます", "2025-12-20 19:00"),
    (25, None, "神経伝導検査受けたことある人いますか", "2025-12-20 19:45"),
    (26, None, "受けました。ちょっとビリビリするけど痛くはなかった", "2025-12-20 20:30"),
    (27, 25, "どんな検査ですか？", "2025-12-21 08:00"),
    (28, 27, "電気刺激で神経の伝わり具合を測る検査です", "2025-12-21 12:00"),
    (29, None, "しびれの薬でリリカ飲んでる人いますか", "2025-12-21 19:00"),
    (30, None, "飲んでます。眠気の副作用あるから寝る前に飲んでる", "2025-12-21 19:45"),
    (31, 29, "効果ありますか？", "2025-12-21 20:30"),
    (32, 31, "しびれは完全には消えないけど楽にはなりました", "2025-12-22 08:00"),
    (33, None, "靴選びも大事って言われた", "2025-12-22 12:00"),
    (34, None, "きつい靴は避けてゆったりめのを履いてます", "2025-12-22 12:45"),
    (35, 33, "糖尿病用の靴とかあるんですかね", "2025-12-22 19:00"),
    (36, None, "冬場は乾燥でかかとがひび割れやすい", "2025-12-23 12:00"),
    (37, None, "クリームで保湿してます", "2025-12-23 13:00"),
    (38, 36, "ひび割れから感染することもあるから気をつけて", "2025-12-23 19:00"),
    (39, None, "診断されて4年目、最近しびれが出てきて不安", "2025-12-24 14:00"),
    (40, 39, "早めに主治医に相談した方がいいですよ", "2025-12-24 15:00"),
    (41, None, "足のマッサージ効果ありますか", "2025-12-25 14:00"),
    (42, None, "血行良くなる気がして毎日やってます", "2025-12-25 15:00"),
    (43, 41, "やりすぎると良くないから優しくって言われました", "2025-12-25 19:00"),
    (44, None, "年末年始も足のケア忘れずに", "2025-12-27 14:00"),
    (45, None, "あけおめ！今年は足の状態改善させたい", "2026-01-01 10:00"),
    (46, 45, "あけおめ！お互い頑張りましょう", "2026-01-01 11:00"),
    (47, None, "血糖コントロール良くなったら神経障害改善した人いますか", "2026-01-03 14:00"),
    (48, 47, "完全には治らないけど進行は止まった気がする", "2026-01-03 15:00"),
    (49, None, "このスレ見て足のケアの大切さわかった", "2026-01-04 19:00"),
    (50, None, "合併症怖いけど向き合っていくしかない", "2026-01-05 12:00"),
    (51, 50, "早期発見・早期対処が大事ですよね", "2026-01-05 13:00"),
    (52, None, "また足の症状や対策あったら共有してください", "2026-01-06 19:00"),
    (53, 52, "お互い情報交換しましょう", "2026-01-06 19:45"),
    (54, None, "足大事にして生活していきます", "2026-01-07 19:00"),
    (55, 54, "頑張りましょう！", "2026-01-07 19:45"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.34")
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
