#!/usr/bin/env python3
"""Insert 48 comments for thread No.64: 冬のむくみ対策"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "7e773a23-004a-4c61-8779-e70a8826e616"
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
    (2, None, "冬になると足のむくみがひどくなる", "2025-12-20 19:45"),
    (3, None, "寒いと動かなくなるからむくみやすいのかな", "2025-12-20 20:30"),
    (4, None, "診断されたばかりだけど、むくみって糖尿病と関係あるの？", "2025-12-20 21:15"),
    (5, 4, "腎機能低下するとむくみやすくなるって聞いた", "2025-12-20 22:00"),
    (6, None, "10年以上この病気だけど、冬のむくみは毎年悩む", "2025-12-21 10:30"),
    (7, None, "着圧ソックス履いてる人いますか", "2025-12-21 14:20"),
    (8, 7, "毎日履いてます。メディキュットとか", "2025-12-21 15:00"),
    (9, 7, "夜寝るとき用の着圧ソックスおすすめ", "2025-12-21 15:45"),
    (10, None, "塩分控えめにしたらむくみマシになった", "2025-12-21 19:30"),
    (11, 10, "塩分とむくみって関係あるんですね", "2025-12-21 20:15"),
    (12, 11, "ナトリウムが水分溜め込むからね", "2025-12-21 21:00"),
    (13, None, "カリウム摂るといいって聞いたけど腎臓悪いと制限あるんだよね", "2025-12-22 11:30"),
    (14, None, "3年目だけど最近むくみがひどくなってきた。腎臓大丈夫かな", "2025-12-22 15:45"),
    (15, 14, "検査で腎機能の数値見てもらったほうがいいですよ", "2025-12-22 16:30"),
    (16, None, "夕方になると靴がきつくなる", "2025-12-22 19:20"),
    (17, 16, "わかる。朝と夕方で足のサイズ違う気がする", "2025-12-22 20:00"),
    (18, None, "デスクワークだからむくみやすい。定期的に立ち上がるようにしてる", "2025-12-23 10:30"),
    (19, None, "足を高くして寝るといいって本当？", "2025-12-23 14:45"),
    (20, 19, "クッション入れて寝てます。朝スッキリする気がする", "2025-12-23 15:30"),
    (21, None, "マッサージ効果ありますか", "2025-12-23 19:30"),
    (22, 21, "私は毎晩お風呂でマッサージしてる。気持ちいい", "2025-12-23 20:15"),
    (23, 21, "リンパ流すイメージでやるといいらしい", "2025-12-23 21:00"),
    (24, None, "利尿剤飲んでる人いますか", "2025-12-24 11:30"),
    (25, 24, "処方されてます。トイレ近くなるけどむくみは改善した", "2025-12-24 12:15"),
    (26, None, "水分摂りすぎてもむくむし、少なすぎても良くないし難しい", "2025-12-24 18:45"),
    (27, None, "顔もむくみやすくなった。朝起きたらパンパン", "2025-12-25 10:20"),
    (28, 27, "顔のむくみつらいですよね。写真撮りたくない", "2025-12-25 11:00"),
    (29, None, "冬は汗かかないからむくみやすいのかも", "2025-12-25 19:30"),
    (30, None, "指輪が入らなくなった…", "2025-12-26 14:15"),
    (31, 30, "私も結婚指輪きつくなりました", "2025-12-26 15:00"),
    (32, None, "体重増えたのかむくみなのか分からない", "2025-12-27 11:30"),
    (33, 32, "押してへこみが戻らないならむくみらしいですよ", "2025-12-27 12:15"),
    (34, None, "運動したらむくみ解消されるかな", "2025-12-27 19:45"),
    (35, 34, "ウォーキングしたら夕方のむくみマシになった", "2025-12-27 20:30"),
    (36, None, "年末で検診行けないから不安。むくみひどくなってきた", "2025-12-28 18:20"),
    (37, 36, "急にひどくなったなら救急も考えたほうがいいかも", "2025-12-28 19:00"),
    (38, None, "正月は塩分多い料理ばかりでむくみそう", "2025-12-29 15:30"),
    (39, None, "おせちの黒豆とかカリウム多いから食べてる", "2025-12-30 11:45"),
    (40, None, "年明けは減塩生活に戻す", "2025-12-31 19:20"),
    (41, None, "正月明け、予想通りむくんでる", "2026-01-03 10:30"),
    (42, 41, "同じく…着圧ソックス履いて過ごしてます", "2026-01-03 11:15"),
    (43, None, "検診で相談してみようかな", "2026-01-04 14:20"),
    (44, None, "主治医にむくみのこと話したら薬調整してくれた", "2026-01-05 18:30"),
    (45, 44, "薬で改善することもあるんですね", "2026-01-05 19:15"),
    (46, None, "冬のむくみ、春になると自然と治まる気がする", "2026-01-06 15:45"),
    (47, None, "運動習慣つけるのが一番かも", "2026-01-06 20:30"),
    (48, None, "このスレ参考になった。着圧ソックス買ってみる", "2026-01-07 19:15"),
    (49, None, "みんなで冬を乗り切ろう", "2026-01-07 21:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.64")
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
