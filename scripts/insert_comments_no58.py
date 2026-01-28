#!/usr/bin/env python3
"""Insert 39 comments for thread No.58: 冬のフットケア"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "a6a632d3-7878-4923-b63c-5ea6f6661722"
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
    (2, None, "冬になると足の乾燥がひどくて毎年悩む", "2025-12-20 19:30"),
    (3, None, "かかとがガサガサでストッキング履くと引っかかる", "2025-12-20 20:45"),
    (4, None, "糖尿病だと傷が治りにくいから足のケアは気をつけてる", "2025-12-21 10:20"),
    (5, None, "診断されて半年だけど、足のケアってどこまでやればいいかわからない", "2025-12-21 14:30"),
    (6, 5, "毎日お風呂で足をよく洗って、保湿剤塗るのが基本かな", "2025-12-21 15:15"),
    (7, None, "15年やってるけど、足だけは毎日チェックしてる。習慣になった", "2025-12-21 19:50"),
    (8, None, "おすすめの保湿クリームありますか", "2025-12-21 21:20"),
    (9, 8, "ニュートロジーナのフットクリーム使ってます", "2025-12-21 22:00"),
    (10, 8, "尿素配合のやつがいいって主治医に言われた", "2025-12-22 08:30"),
    (11, None, "冬は靴下二枚重ねで過ごしてる", "2025-12-22 12:40"),
    (12, None, "こたつで足温めすぎて低温やけどしかけた。気をつけないと", "2025-12-22 18:15"),
    (13, 12, "低温やけど怖いですよね。私は湯たんぽでやらかしたことある", "2025-12-22 19:00"),
    (14, None, "爪切りが怖い。深爪したらどうしようって", "2025-12-23 11:30"),
    (15, None, "爪は皮膚科で切ってもらってる", "2025-12-23 15:20"),
    (16, 14, "まっすぐ切るのがポイントらしいですよ。深く切らない", "2025-12-23 16:45"),
    (17, None, "4年目だけど去年初めてフットケア外来行った。もっと早く行けばよかった", "2025-12-23 20:30"),
    (18, 17, "フットケア外来ってどんなことしてもらえるんですか？", "2025-12-23 21:15"),
    (19, 18, "爪切り、タコ削り、足の状態チェックとか。保湿指導もしてくれた", "2025-12-23 22:00"),
    (20, None, "足の裏にタコができやすくて困ってる", "2025-12-24 13:20"),
    (21, None, "タコを自分で削るのは危険って言われた", "2025-12-24 19:45"),
    (22, None, "電気毛布で寝てるけど足元だけ温めるタイプにした", "2025-12-25 10:30"),
    (23, None, "しもやけになりやすい人いますか", "2025-12-25 18:20"),
    (24, 23, "毎年なります。ビタミンE塗ってます", "2025-12-25 19:00"),
    (25, None, "足の感覚が鈍いから傷に気づきにくい。鏡で毎日チェックしてる", "2025-12-26 12:15"),
    (26, 25, "足の裏見るの大変ですよね。私も鏡使ってます", "2025-12-26 13:00"),
    (27, None, "靴選び慎重になった。ちょっとでも当たる靴は履かない", "2025-12-27 14:30"),
    (28, None, "冬のブーツって蒸れるから水虫も心配", "2025-12-27 20:10"),
    (29, None, "水虫になったらすぐ皮膚科行くようにしてる", "2025-12-28 11:45"),
    (30, None, "足先の冷えがひどい。血行悪いのかな", "2025-12-28 19:30"),
    (31, 30, "私も冷え性です。着圧ソックス履いたらマシになった", "2025-12-28 20:15"),
    (32, None, "お風呂上がりにすぐ保湿するようにしてから調子いい", "2025-12-29 21:00"),
    (33, None, "足のマッサージって効果ありますか", "2025-12-30 15:30"),
    (34, 33, "血行良くなるからいいと思う。私は毎晩やってる", "2025-12-30 16:20"),
    (35, None, "年末で病院休みだから足のトラブルだけは避けたい", "2025-12-31 10:20"),
    (36, None, "足のケアサボると後で後悔するんだよね…", "2026-01-02 19:45"),
    (37, None, "正月明けにフットケア外来予約した", "2026-01-03 14:30"),
    (38, None, "乾燥対策で加湿器買った。足だけじゃなく全身に効いてる", "2026-01-04 18:20"),
    (39, None, "足は第二の心臓っていうし、大事にしないとね", "2026-01-05 20:30"),
    (40, None, "このスレ見て今日から保湿ちゃんとやろうと思った", "2026-01-05 22:15"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.58")
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
