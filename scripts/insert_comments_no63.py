#!/usr/bin/env python3
"""Insert 51 comments for thread No.63: 七草粥は糖質高い？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "cdc414a1-ff1e-4520-b2fe-a61707d3e9b5"
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
    (2, None, "七草粥って糖質どのくらいあるんだろう", "2025-12-21 19:30"),
    (3, None, "お粥だから普通のご飯より糖質低いと思ってた", "2025-12-21 20:15"),
    (4, 3, "水分多いだけで米の量同じなら糖質も同じでは…", "2025-12-21 21:00"),
    (5, None, "診断されたばかりで初めての1月7日。七草粥食べていいか迷う", "2025-12-22 10:30"),
    (6, 5, "量を控えめにすれば大丈夫だと思いますよ", "2025-12-22 11:15"),
    (7, None, "10年以上糖尿病だけど毎年食べてる。行事だし", "2025-12-22 14:20"),
    (8, 7, "行事食は気持ちの問題もありますよね", "2025-12-22 15:00"),
    (9, None, "お粥って血糖値上がりやすいって聞いたことある", "2025-12-22 19:45"),
    (10, 9, "GI値高いらしいね。消化吸収が早いから", "2025-12-22 20:30"),
    (11, None, "正月で食べすぎた胃を休めるって意味もあるんだよね", "2025-12-23 11:30"),
    (12, None, "七草粥より普通のご飯のほうがまだマシなのかな", "2025-12-23 15:40"),
    (13, 12, "粒が残ってるほうが血糖値上がりにくいって主治医に言われた", "2025-12-23 16:30"),
    (14, None, "カリフラワーで代用したらどうだろう", "2025-12-23 20:15"),
    (15, 14, "カリフラワー粥？作り方気になる", "2025-12-23 21:00"),
    (16, 15, "カリフラワー細かくして煮込むだけ。七草入れたら雰囲気出るかも", "2025-12-23 21:45"),
    (17, None, "3年目だけど去年はこんにゃく米で作ってみた", "2025-12-24 10:20"),
    (18, 17, "こんにゃく米いいですね！どんな感じでした？", "2025-12-24 11:00"),
    (19, 18, "食感はちょっと違うけど許容範囲。血糖値もマシだった", "2025-12-24 11:45"),
    (20, None, "オートミールで七草粥作る人いる？", "2025-12-24 18:30"),
    (21, 20, "やったことある。和風だしで煮ると意外といける", "2025-12-24 19:15"),
    (22, None, "七草セット買うか迷う。使いきれるかな", "2025-12-25 14:30"),
    (23, None, "スーパーで七草セット見かけた。もうそんな時期か", "2025-12-26 11:45"),
    (24, None, "七草粥って朝食べるものだっけ", "2025-12-26 19:20"),
    (25, 24, "朝に食べるのが正式らしいですよ", "2025-12-26 20:00"),
    (26, None, "朝からお粥だと昼前にお腹空きそう", "2025-12-27 10:30"),
    (27, None, "卵入れてタンパク質追加するといいかも", "2025-12-27 15:45"),
    (28, 27, "卵粥美味しいよね。七草と合う", "2025-12-27 16:30"),
    (29, None, "鶏ささみ入れてボリュームアップさせてる", "2025-12-28 12:15"),
    (30, None, "塩加減が難しい。薄味だと物足りないし", "2025-12-28 19:30"),
    (31, None, "梅干し添えると満足感増す", "2025-12-29 11:20"),
    (32, None, "七草粥に餅入れる地域あるらしいけど、それは無理だわ", "2025-12-29 18:45"),
    (33, 32, "餅入りは糖質やばそう…", "2025-12-29 19:30"),
    (34, None, "七草の効能調べたら体にいいらしい。食べたくなってきた", "2025-12-30 14:20"),
    (35, None, "せり、なずな、ごぎょう…全部言える人すごい", "2025-12-30 20:30"),
    (36, None, "1月7日に向けてレシピ検索中", "2025-12-31 15:45"),
    (37, None, "あけおめ！七草粥の準備した人いますか", "2026-01-01 10:30"),
    (38, None, "まだ正月料理消化しきれてない…", "2026-01-02 19:20"),
    (39, None, "七草セット買ってきた。あとは7日を待つだけ", "2026-01-04 11:30"),
    (40, None, "明日だね。楽しみ", "2026-01-06 20:15"),
    (41, None, "今朝七草粥食べた。やっぱり美味しい", "2026-01-07 08:30"),
    (42, 41, "血糖値どうでした？", "2026-01-07 12:15"),
    (43, 42, "少なめにしたから150くらいで済んだ", "2026-01-07 13:00"),
    (44, None, "オートミール七草粥にしたら血糖値ほぼ上がらなかった", "2026-01-07 18:30"),
    (45, None, "こんにゃく米バージョン成功。来年もこれでいく", "2026-01-07 19:45"),
    (46, None, "結局普通に食べちゃった。美味しかったからOK", "2026-01-07 20:30"),
    (47, None, "年に一回だし楽しむのが大事", "2026-01-07 21:15"),
    (48, None, "来年は低糖質バージョン試してみようかな", "2026-01-08 14:20"),
    (49, None, "このスレ参考になった。みんなありがとう", "2026-01-08 19:30"),
    (50, None, "また来年も語りましょう", "2026-01-08 21:00"),
    (51, None, "七草粥スレ、毎年恒例になりそう", "2026-01-09 18:45"),
    (52, None, "糖尿病でも工夫次第で楽しめるよね", "2026-01-09 20:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.63")
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
