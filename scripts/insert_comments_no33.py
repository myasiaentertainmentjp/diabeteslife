#!/usr/bin/env python3
"""Insert 71 comments for thread No.33: コンビニで買える低糖質おすすめ"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "dfd436cb-e460-4a5e-be93-b25296e09f3b"
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
    (2, None, "コンビニで買える低糖質商品教えてください！", "2025-12-16 12:00"),
    (3, None, "ローソンのブランパンが定番", "2025-12-16 12:45"),
    (4, None, "セブンのサラダチキンは常にストックしてる", "2025-12-16 19:00"),
    (5, 3, "ブランパンおいしいですよね。糖質2gくらいだっけ", "2025-12-16 19:45"),
    (6, None, "ファミマのRIZAPコラボスイーツおすすめ", "2025-12-16 20:30"),
    (7, None, "診断されたばかりでコンビニ何買えばいいかわからなかった", "2025-12-17 12:00"),
    (8, 7, "最初は成分表示見るの大変ですよね", "2025-12-17 12:45"),
    (9, None, "ゆで卵は最強。どのコンビニにもある", "2025-12-17 19:00"),
    (10, None, "ローソンの低糖質シリーズ充実してて助かる", "2025-12-17 19:45"),
    (11, None, "セブンの寒天ゼリー0カロリーでおすすめ", "2025-12-17 20:30"),
    (12, 11, "りんご味おいしいですよね", "2025-12-18 08:00"),
    (13, None, "サラダは何選んでますか？", "2025-12-18 12:00"),
    (14, None, "蒸し鶏のサラダよく買います。タンパク質も取れる", "2025-12-18 12:45"),
    (15, 13, "ドレッシングの糖質に注意ですよね", "2025-12-18 19:00"),
    (16, None, "チーズは糖質低いから助かる", "2025-12-18 19:45"),
    (17, None, "ナッツの小袋常備してます", "2025-12-18 20:30"),
    (18, None, "ローソンのブランドーナツ食べた人いますか？", "2025-12-19 12:00"),
    (19, 18, "糖質13gくらいでドーナツ食べられるのすごい", "2025-12-19 13:00"),
    (20, None, "おでんは具を選べば低糖質でいける", "2025-12-19 19:00"),
    (21, None, "大根、こんにゃく、卵、牛すじが定番", "2025-12-19 19:45"),
    (22, 20, "練り物は糖質あるから注意ですね", "2025-12-19 20:30"),
    (23, None, "焼き魚の弁当よく買います", "2025-12-20 12:00"),
    (24, None, "セブンのたんぱく質シリーズ気になる", "2025-12-20 12:45"),
    (25, 24, "サラダチキンバー便利ですよ。片手で食べられる", "2025-12-20 19:00"),
    (26, None, "SUNAOのアイスどのコンビニにもある", "2025-12-20 19:45"),
    (27, None, "10年以上糖尿病だけど、最近の低糖質商品の充実すごい", "2025-12-20 20:30"),
    (28, 27, "昔より選択肢増えましたよね", "2025-12-21 08:00"),
    (29, None, "ホットスナックで低糖質なのある？", "2025-12-21 12:00"),
    (30, None, "からあげクンは衣あるから微妙かも", "2025-12-21 12:45"),
    (31, 29, "フランクフルトは糖質低めですよ", "2025-12-21 19:00"),
    (32, None, "冬はおでんとサラダチキンのコンボが多い", "2025-12-21 19:45"),
    (33, None, "糖質オフのカップ麺どうですか？", "2025-12-22 12:00"),
    (34, 33, "明星のロカボシリーズまあまあおいしい", "2025-12-22 13:00"),
    (35, None, "年末年始、コンビニ空いてるから助かる", "2025-12-22 19:00"),
    (36, None, "豆腐そうめん見つけた時は感動した", "2025-12-22 19:45"),
    (37, 36, "紀文の糖質0麺も置いてる店ありますよね", "2025-12-22 20:30"),
    (38, None, "ファミマのバターコーヒー飲んでる人いますか", "2025-12-23 12:00"),
    (39, None, "飲んでます。朝これで済ませることも", "2025-12-23 13:00"),
    (40, 38, "MCTオイル入ってるやつですよね", "2025-12-23 19:00"),
    (41, None, "無糖のヨーグルトにナッツ入れて食べてる", "2025-12-23 19:45"),
    (42, None, "クリスマスにコンビニのローストチキン買った", "2025-12-25 19:00"),
    (43, 42, "チキンは糖質低くていいですよね", "2025-12-25 19:45"),
    (44, None, "お正月もコンビニにお世話になりそう", "2025-12-26 12:00"),
    (45, None, "診断されて2年目、コンビニ活用術が身についた", "2025-12-26 19:00"),
    (46, 45, "どんな組み合わせで買ってますか？", "2025-12-26 19:45"),
    (47, 46, "サラダ＋サラダチキン＋ゆで卵が定番です", "2025-12-26 20:30"),
    (48, None, "ローソンのもち麦おにぎりは普通のより血糖値上がりにくい", "2025-12-27 12:00"),
    (49, None, "おにぎりは我慢してます…", "2025-12-27 12:45"),
    (50, 48, "もち麦だと食物繊維多いからいいのかな", "2025-12-27 19:00"),
    (51, None, "セブンのサバの塩焼き好き", "2025-12-27 19:45"),
    (52, None, "年末年始、コンビニおでんにお世話になってる", "2025-12-29 19:00"),
    (53, None, "あけおめ！今年もコンビニ活用していきます", "2026-01-01 10:00"),
    (54, 53, "あけおめ！情報共有しましょう", "2026-01-01 11:00"),
    (55, None, "正月、コンビニのサラダに助けられた", "2026-01-02 12:00"),
    (56, None, "新商品で低糖質のやつあったら教えてほしい", "2026-01-03 19:00"),
    (57, None, "ローソンの新作ブランパンチェックしてます", "2026-01-03 19:45"),
    (58, 56, "見つけたら報告しますね", "2026-01-03 20:30"),
    (59, None, "コンビニ各社もっと低糖質増やしてほしい", "2026-01-04 12:00"),
    (60, None, "このスレの情報めっちゃ参考になる", "2026-01-04 19:00"),
    (61, 60, "みんなの知恵が集まるのいいですよね", "2026-01-04 19:45"),
    (62, None, "仕事帰りにコンビニ寄るのが日課になってる", "2026-01-05 19:00"),
    (63, None, "セブン、ローソン、ファミマで品揃え違うから使い分けてる", "2026-01-05 19:45"),
    (64, 63, "ローソンが低糖質は一番充実してる気がする", "2026-01-05 20:30"),
    (65, None, "また新しいおすすめ見つけたら書き込みます", "2026-01-06 12:00"),
    (66, None, "コンビニのおかげで糖質制限続けられてる", "2026-01-06 19:00"),
    (67, 65, "よろしくお願いします！", "2026-01-06 19:45"),
    (68, None, "忙しい時の強い味方", "2026-01-07 12:00"),
    (69, None, "自炊できない日もコンビニあれば安心", "2026-01-07 12:45"),
    (70, 68, "手軽に低糖質できるのありがたい", "2026-01-07 19:00"),
    (71, None, "コンビニ低糖質仲間、これからもよろしく", "2026-01-07 19:45"),
    (72, 71, "よろしくお願いします！", "2026-01-07 20:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.33")
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
