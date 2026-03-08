#!/usr/bin/env python3
"""Insert 68 comments for thread No.38: 低糖質パン・麺のおすすめ"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "98bc506d-15ea-4127-9ff6-c33168e7b21d"
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
    (2, None, "低糖質パンや麺でおすすめありますか？", "2025-12-16 12:00"),
    (3, None, "ローソンのブランパンが定番です", "2025-12-16 12:45"),
    (4, None, "紀文の糖質0麺愛用してます", "2025-12-16 19:00"),
    (5, 3, "ブランパンおいしいですよね。糖質2gくらい", "2025-12-16 19:45"),
    (6, None, "シャトレーゼの低糖質パンもおすすめ", "2025-12-16 20:30"),
    (7, None, "診断されたばかりでパン食べられないと思ってた。低糖質あるんですね", "2025-12-17 12:00"),
    (8, 7, "選べば大丈夫ですよ！", "2025-12-17 12:45"),
    (9, None, "ベースブレッド試した人いますか", "2025-12-17 19:00"),
    (10, None, "食べてます。完全栄養食で便利", "2025-12-17 19:45"),
    (11, 9, "糖質はどのくらいですか？", "2025-12-17 20:30"),
    (12, 11, "1個あたり20g前後ですね。普通のパンよりは低い", "2025-12-18 08:00"),
    (13, None, "こんにゃく麺どうですか？匂いが気になる", "2025-12-18 12:00"),
    (14, None, "水で洗って乾煎りすると匂い消えますよ", "2025-12-18 12:45"),
    (15, 13, "私も最初苦手だったけど調理法で変わりました", "2025-12-18 19:00"),
    (16, None, "オーマイの低糖質パスタ使ってます", "2025-12-18 19:45"),
    (17, None, "普通のパスタの半分くらいの糖質らしい", "2025-12-18 20:30"),
    (18, 16, "味はどうですか？", "2025-12-19 08:00"),
    (19, 18, "普通のパスタと変わらないくらいおいしいですよ", "2025-12-19 12:00"),
    (20, None, "しらたきをパスタ代わりにしてます", "2025-12-19 12:45"),
    (21, None, "ふすまパンミックスで自分で焼いてます", "2025-12-19 19:00"),
    (22, 21, "自作すごい！ホームベーカリー使ってますか？", "2025-12-19 19:45"),
    (23, 22, "はい、週末に焼いて冷凍してます", "2025-12-19 20:30"),
    (24, None, "ソイドルって大豆麺試した人いますか", "2025-12-20 12:00"),
    (25, None, "食べたことあります。大豆の味がするけど慣れる", "2025-12-20 12:45"),
    (26, 24, "タンパク質も取れていいですよね", "2025-12-20 19:00"),
    (27, None, "10年以上低糖質生活してるけど、最近は選択肢増えて嬉しい", "2025-12-20 19:45"),
    (28, 27, "昔より全然選べるようになりましたよね", "2025-12-20 20:30"),
    (29, None, "セブンの低糖質パンどうですか", "2025-12-21 12:00"),
    (30, None, "糖質オフのクロワッサンおいしかった", "2025-12-21 12:45"),
    (31, 29, "ブレッドシリーズありますよね", "2025-12-21 19:00"),
    (32, None, "ファミマの全粒粉サンドイッチ好き", "2025-12-21 19:45"),
    (33, None, "低糖質麺で焼きそば作ってます", "2025-12-21 20:30"),
    (34, 33, "いいですね。何の麺使ってますか？", "2025-12-22 08:00"),
    (35, 34, "糖質0麺を焼きそばソースで炒めてます", "2025-12-22 12:00"),
    (36, None, "年末年始用に低糖質パン買いだめした", "2025-12-22 12:45"),
    (37, None, "冷凍できるから便利ですよね", "2025-12-22 19:00"),
    (38, 36, "私も。冷凍庫パンパン笑", "2025-12-22 19:45"),
    (39, None, "低糖質うどん探してるんですけどおすすめありますか", "2025-12-23 12:00"),
    (40, None, "からだシフトの糖質コントロールうどんあります", "2025-12-23 12:45"),
    (41, 39, "糖質50%オフのやつスーパーで見かけますよ", "2025-12-23 19:00"),
    (42, None, "診断されて3年目、低糖質パンに詳しくなった", "2025-12-24 14:00"),
    (43, 42, "知識増えますよね", "2025-12-24 15:00"),
    (44, None, "クリスマスにシャトレーゼの低糖質ピザ食べた", "2025-12-25 19:00"),
    (45, 44, "ピザもあるんですね！知らなかった", "2025-12-25 19:45"),
    (46, None, "低糖質ラーメンで年越しした", "2025-12-31 22:00"),
    (47, None, "明星のロカボシリーズですか？", "2025-12-31 22:45"),
    (48, 46, "私は糖質0麺で作りました", "2026-01-01 10:00"),
    (49, None, "あけおめ！今年も低糖質パン麺にお世話になります", "2026-01-01 10:30"),
    (50, 49, "あけおめ！情報共有しましょう", "2026-01-01 11:00"),
    (51, None, "正月太り防止に低糖質麺活用してます", "2026-01-02 12:00"),
    (52, None, "Amazonで低糖質パンまとめ買いしてる人いますか", "2026-01-03 14:00"),
    (53, 52, "たまに買ってます。送料無料で便利", "2026-01-03 15:00"),
    (54, None, "楽天でも低糖質専門店ありますよね", "2026-01-03 19:00"),
    (55, None, "コストコの低糖質パンどうですか", "2026-01-04 12:00"),
    (56, None, "量が多いから冷凍必須ですね", "2026-01-04 12:45"),
    (57, 55, "プロテインブレッド人気らしいですよ", "2026-01-04 19:00"),
    (58, None, "このスレの情報めっちゃ参考になる", "2026-01-05 12:00"),
    (59, 58, "みんなの知識が集まるのいいですよね", "2026-01-05 12:45"),
    (60, None, "新商品出たら教えてください", "2026-01-05 19:00"),
    (61, None, "低糖質パン麺のおかげで食事楽しめてる", "2026-01-06 12:00"),
    (62, 60, "新商品チェックしてます！", "2026-01-06 12:45"),
    (63, None, "また新しいおすすめ見つけたら書き込みます", "2026-01-06 19:00"),
    (64, 63, "よろしくお願いします", "2026-01-06 19:45"),
    (65, None, "パンも麺も我慢しなくていい時代になった", "2026-01-07 12:00"),
    (66, None, "選択肢が増えてありがたい", "2026-01-07 12:45"),
    (67, 65, "本当にそう思います", "2026-01-07 19:00"),
    (68, None, "低糖質パン麺仲間、これからもよろしく", "2026-01-07 19:45"),
    (69, 68, "よろしくお願いします！", "2026-01-07 20:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.38")
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
