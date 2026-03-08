#!/usr/bin/env python3
"""Insert 48 comments for thread No.61: 福袋で低糖質食品買う人"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "05872fdf-20f3-49fe-b9de-53f91c9d63c6"
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
    (2, None, "低糖質食品の福袋って売ってるのかな", "2025-12-20 19:30"),
    (3, 2, "楽天とかで見たことある。ロカボ系のやつ", "2025-12-20 20:15"),
    (4, None, "シャトレーゼの福袋狙ってる。低糖質スイーツ入ってるといいな", "2025-12-20 21:00"),
    (5, None, "診断されたばかりで初めての正月。福袋で低糖質おやつ探してみようかな", "2025-12-21 10:30"),
    (6, None, "無印の福袋に糖質オフのお菓子入ってたことあるよ", "2025-12-21 14:20"),
    (7, 6, "無印も低糖質シリーズあるんですね。知らなかった", "2025-12-21 15:00"),
    (8, None, "10年以上この生活してるけど、最近は低糖質の選択肢増えて嬉しい", "2025-12-21 19:45"),
    (9, 8, "昔に比べたら本当に増えましたよね", "2025-12-21 20:30"),
    (10, None, "SUNAOの福袋あったら絶対買う", "2025-12-22 11:15"),
    (11, None, "ローソンの低糖質パンまとめ買いしようかな", "2025-12-22 15:30"),
    (12, None, "コストコの福袋って低糖質系あるのかな", "2025-12-22 19:20"),
    (13, 12, "コストコはナッツ系とか入ってること多いから当たりかも", "2025-12-22 20:00"),
    (14, None, "3年目だけど福袋で失敗したことある。甘すぎて食べられなかった", "2025-12-23 10:45"),
    (15, 14, "どこの福袋でした？", "2025-12-23 11:30"),
    (16, 15, "通販の詰め合わせ。味が好みじゃなくて結局家族にあげた", "2025-12-23 12:15"),
    (17, None, "福袋って中身見えないからリスクあるよね", "2025-12-23 18:30"),
    (18, None, "最近は中身見える福袋も増えてきた", "2025-12-23 20:45"),
    (19, None, "カルディの福袋毎年買ってる。ナッツとかドライフルーツ入ってて使える", "2025-12-24 12:30"),
    (20, 19, "ドライフルーツは糖質高くないですか？", "2025-12-24 13:15"),
    (21, 20, "確かに食べすぎ注意だけど少量なら大丈夫かなと", "2025-12-24 14:00"),
    (22, None, "成城石井の福袋気になる。高級路線だから期待してる", "2025-12-24 19:30"),
    (23, None, "福袋じゃないけど年末セールで低糖質食品まとめ買いした", "2025-12-25 11:20"),
    (24, None, "楽天のお買い物マラソンで低糖質パスタ買い溜めした", "2025-12-25 15:45"),
    (25, None, "正月用にこんにゃく麺ストックしてる", "2025-12-25 20:30"),
    (26, None, "おからパウダーの福袋見つけた。お菓子作りに使えそう", "2025-12-26 10:15"),
    (27, 26, "おからパウダーでお菓子作るんですか？レシピ知りたい", "2025-12-26 11:00"),
    (28, 27, "クックパッドで「おからパウダー ケーキ」で検索するといっぱい出てきますよ", "2025-12-26 11:45"),
    (29, None, "低糖質チョコの福袋ないかな。バレンタイン前に欲しい", "2025-12-26 19:20"),
    (30, None, "iHerbで低糖質プロテインバーまとめ買いした", "2025-12-27 14:30"),
    (31, 30, "iHerb使うんですね。送料どのくらいかかります？", "2025-12-27 15:15"),
    (32, 31, "まとめ買いすれば送料無料になりますよ。確か4600円以上で", "2025-12-27 16:00"),
    (33, None, "ふるさと納税で低糖質食品もらった人いる？", "2025-12-28 11:30"),
    (34, 33, "こんにゃく米もらいました。結構使える", "2025-12-28 12:15"),
    (35, None, "年末のドンキで低糖質食品コーナー見てきた。意外と充実してた", "2025-12-28 19:45"),
    (36, None, "福袋の予約もう始まってるね。出遅れた", "2025-12-29 10:20"),
    (37, None, "元旦に並んで買う気力はもうない…通販派になった", "2025-12-29 18:30"),
    (38, None, "福袋じゃなくて単品で好きなの買ったほうがいい気もしてきた", "2025-12-30 14:15"),
    (39, 38, "それも一理ある。ハズレ引くリスクないし", "2025-12-30 15:00"),
    (40, None, "明日の初売り楽しみ", "2025-12-31 20:30"),
    (41, None, "あけおめ！さっそく福袋買ってきた", "2026-01-01 14:30"),
    (42, 41, "何買いました？", "2026-01-01 15:15"),
    (43, 42, "シャトレーゼの。低糖質アイス入っててラッキーだった", "2026-01-01 16:00"),
    (44, None, "カルディの福袋ゲットした。ナッツ入っててあたり", "2026-01-02 11:30"),
    (45, None, "福袋の戦利品報告楽しい", "2026-01-02 19:20"),
    (46, None, "来年は低糖質福袋の情報もっと早く集めよう", "2026-01-03 15:45"),
    (47, None, "このスレ来年も参考にしたい", "2026-01-04 18:30"),
    (48, None, "みんなの情報助かる。また来年！", "2026-01-05 20:15"),
    (49, None, "低糖質生活仲間がいると心強いね", "2026-01-05 21:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.61")
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
