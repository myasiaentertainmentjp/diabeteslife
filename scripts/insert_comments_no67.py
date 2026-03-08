#!/usr/bin/env python3
"""Insert 54 comments for thread No.67: 雪道の運動どうしてる？"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "f4329a2a-32ae-4325-9917-f3c5638929a2"
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
    (2, None, "雪降ると外歩けなくて運動できない", "2025-12-20 19:45"),
    (3, None, "北海道住みだけど冬は本当に運動困る", "2025-12-20 20:30"),
    (4, None, "診断されたばかりで初めての冬。雪道怖くて外出たくない", "2025-12-20 21:15"),
    (5, 4, "転倒怖いですよね。無理しないでください", "2025-12-20 22:00"),
    (6, None, "10年以上糖尿病だけど、冬の運動は毎年悩む", "2025-12-21 10:30"),
    (7, None, "雪かきが運動になってる", "2025-12-21 14:20"),
    (8, 7, "雪かきって結構な運動量ですよね", "2025-12-21 15:00"),
    (9, 7, "低血糖に気をつけてくださいね", "2025-12-21 15:45"),
    (10, None, "ショッピングモール歩いてる。暖かいし", "2025-12-21 19:30"),
    (11, 10, "それいいですね！買い物ついでに運動になる", "2025-12-21 20:15"),
    (12, None, "室内でできる運動何かありますか", "2025-12-22 11:45"),
    (13, 12, "YouTubeの室内ウォーキング動画おすすめ", "2025-12-22 12:30"),
    (14, 12, "踏み台昇降してます。テレビ見ながらできる", "2025-12-22 13:15"),
    (15, None, "3年目だけど冬は毎年体重増える", "2025-12-22 18:30"),
    (16, 15, "同じです。春になると焦る", "2025-12-22 19:15"),
    (17, None, "スポーツジム通い始めた。冬だけ会員になってる", "2025-12-23 10:45"),
    (18, 17, "冬だけ会員ってできるんですね", "2025-12-23 11:30"),
    (19, 18, "月額制のところなら好きな時にやめられますよ", "2025-12-23 12:15"),
    (20, None, "温水プールいいですよ。膝に優しい", "2025-12-23 18:45"),
    (21, None, "エアロバイク買った。部屋に置いてる", "2025-12-24 11:30"),
    (22, 21, "場所取りませんか？", "2025-12-24 12:15"),
    (23, 22, "折りたたみ式だからなんとか。使わないときは畳んでる", "2025-12-24 13:00"),
    (24, None, "ラジオ体操馬鹿にできない。ちゃんとやると汗かく", "2025-12-24 19:30"),
    (25, 24, "第二まで真剣にやるとかなりの運動量", "2025-12-24 20:15"),
    (26, None, "階段の上り下りを意識してやってる", "2025-12-25 14:20"),
    (27, None, "スクワット始めた。筋肉つくと血糖値にもいいらしい", "2025-12-25 19:45"),
    (28, 27, "筋トレ効果ありますよね。私も続けてます", "2025-12-25 20:30"),
    (29, None, "雪道用の滑らない靴買った。これで少し歩ける", "2025-12-26 11:30"),
    (30, 29, "どこのメーカーですか？", "2025-12-26 12:15"),
    (31, 30, "北海道の靴屋で買いました。地元のやつがやっぱり強い", "2025-12-26 13:00"),
    (32, None, "アイスバーン怖すぎて外出る気にならない", "2025-12-26 19:20"),
    (33, None, "転んで骨折したら大変。慎重になってる", "2025-12-27 10:45"),
    (34, 33, "糖尿病だと治りにくいから本当に気をつけないと", "2025-12-27 11:30"),
    (35, None, "リングフィット買おうか迷ってる", "2025-12-27 18:30"),
    (36, 35, "楽しく運動できるからおすすめ", "2025-12-27 19:15"),
    (37, None, "年末年始は家にこもりがち。運動不足確定", "2025-12-28 15:20"),
    (38, None, "大掃除を運動と思ってやってる", "2025-12-29 11:30"),
    (39, 38, "窓拭きとか結構疲れますよね", "2025-12-29 12:15"),
    (40, None, "正月太り対策で今から運動貯金しとく", "2025-12-30 14:45"),
    (41, None, "元旦から歩くぞと思ってたけど雪すごくて断念", "2026-01-01 15:30"),
    (42, None, "正月は室内運動で乗り切った", "2026-01-03 18:20"),
    (43, None, "雪解けが待ち遠しい", "2026-01-04 19:30"),
    (44, None, "今日は天気良かったから少し歩けた", "2026-01-05 17:45"),
    (45, 44, "貴重な晴れ間を活用するの大事ですよね", "2026-01-05 18:30"),
    (46, None, "除雪した道だけ歩くようにしてる", "2026-01-06 11:20"),
    (47, None, "冬の運動、工夫次第でなんとかなる", "2026-01-06 19:15"),
    (48, None, "このスレ参考になった。室内運動やってみる", "2026-01-07 15:30"),
    (49, None, "春になったらまたウォーキング再開する", "2026-01-07 20:45"),
    (50, None, "あと2〜3ヶ月の辛抱だ", "2026-01-08 18:30"),
    (51, None, "みんなで冬を乗り切ろう", "2026-01-08 21:00"),
    (52, None, "雪国の糖尿病仲間、一緒に頑張ろう", "2026-01-09 19:30"),
    (53, None, "室内でも運動続けるのが大事だね", "2026-01-09 20:45"),
    (54, None, "来年の冬に向けて室内運動器具揃えようかな", "2026-01-10 18:15"),
    (55, None, "このスレまた来年も見に来る", "2026-01-10 21:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.67")
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
