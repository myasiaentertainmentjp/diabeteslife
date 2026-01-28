#!/usr/bin/env python3
"""Insert 69 comments for thread No.30: インスリン注射してる人の悩み"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "41fb1726-8688-46df-852b-812fc38da962"
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
    (2, None, "インスリン注射始めて1ヶ月。みんなどんな悩みありますか？", "2025-12-16 19:00"),
    (3, 2, "注射の場所がマンネリ化して硬くなってきた", "2025-12-16 19:30"),
    (4, 2, "外出先で打つ場所に困る", "2025-12-16 20:15"),
    (5, 3, "リポハイパートロフィーですね。場所をローテーションした方がいいですよ", "2025-12-16 21:00"),
    (6, 5, "お腹以外にどこに打ってますか？", "2025-12-17 08:00"),
    (7, 6, "太ももと二の腕も使ってます", "2025-12-17 12:00"),
    (8, None, "診断されたばかりでインスリン始まったけど、怖くてうまく打てない", "2025-12-17 19:00"),
    (9, 8, "最初は怖いですよね。慣れると数秒で終わりますよ", "2025-12-17 19:30"),
    (10, 8, "針が細いから思ったより痛くないですよ。大丈夫", "2025-12-17 20:30"),
    (11, 9, "どのくらいで慣れましたか？", "2025-12-18 08:00"),
    (12, 11, "1週間くらいで日常になりました", "2025-12-18 12:00"),
    (13, None, "インスリン始めてから体重増えた人いますか？", "2025-12-18 19:00"),
    (14, 13, "5kg増えました…インスリンあるあるらしい", "2025-12-18 19:30"),
    (15, 13, "私も増えた。食事と運動で調整してます", "2025-12-18 20:30"),
    (16, 14, "やっぱり増えるんですね。対策どうしてますか？", "2025-12-18 21:00"),
    (17, 16, "糖質減らして筋トレ増やしました", "2025-12-19 08:00"),
    (18, None, "職場でインスリン打つのが恥ずかしい", "2025-12-19 12:00"),
    (19, 18, "トイレで打ってます", "2025-12-19 12:30"),
    (20, 18, "私は堂々とデスクで打ってます。最初は見られたけど今は誰も気にしない", "2025-12-19 19:00"),
    (21, 20, "堂々と打てるのすごい。私はまだ抵抗ある", "2025-12-19 19:30"),
    (22, None, "低血糖が怖い。夜中になったことある", "2025-12-19 20:30"),
    (23, 22, "枕元にブドウ糖置いてます", "2025-12-20 08:00"),
    (24, 22, "リブレつけてアラート設定してます", "2025-12-20 12:00"),
    (25, 23, "私もブドウ糖常備してます。安心感が違う", "2025-12-20 19:00"),
    (26, None, "針の太さってどれ使ってますか？", "2025-12-20 19:30"),
    (27, 26, "4mm使ってます。短い方が痛くない気がする", "2025-12-20 20:00"),
    (28, 26, "私は5mmです。先生に相談して決めました", "2025-12-20 21:00"),
    (29, None, "インスリンの保管どうしてますか？旅行の時とか", "2025-12-21 12:00"),
    (30, 29, "保冷バッグに入れて持ち歩いてます", "2025-12-21 13:00"),
    (31, 29, "開封後は常温でOKって言われました。未開封は冷蔵庫", "2025-12-21 19:00"),
    (32, 30, "おすすめの保冷バッグありますか？", "2025-12-21 19:30"),
    (33, 32, "FRIOってやつ使ってます。水に浸すと冷える", "2025-12-21 20:30"),
    (34, None, "10年以上インスリン打ってるけど、今でも面倒だなって思う時ある", "2025-12-22 14:00"),
    (35, 34, "10年以上はすごい。尊敬します", "2025-12-22 15:00"),
    (36, 34, "慣れても面倒は面倒ですよね", "2025-12-22 19:00"),
    (37, None, "単位数の調整って自分でしてますか？", "2025-12-22 19:30"),
    (38, 37, "先生と相談して、血糖値見ながら±2単位の範囲で調整OKもらってます", "2025-12-22 20:00"),
    (39, 37, "カーボカウントで食事に合わせて調整してます", "2025-12-22 21:00"),
    (40, 38, "そういう指導受けてるんですね。私も相談してみよう", "2025-12-23 08:00"),
    (41, None, "打ち忘れた時どうしてますか？", "2025-12-23 12:00"),
    (42, 41, "気づいた時に打ってます。ただ次の食事が近かったらスキップ", "2025-12-23 13:00"),
    (43, 41, "アラームセットして忘れないようにしてます", "2025-12-23 19:00"),
    (44, None, "年末年始、インスリンの在庫確認しとかないと", "2025-12-24 14:00"),
    (45, 44, "病院休みになる前に多めにもらいました", "2025-12-24 15:00"),
    (46, 44, "私も昨日処方してもらった。安心", "2025-12-24 19:00"),
    (47, None, "ペン型とシリンジ、どっち使ってますか？", "2025-12-25 14:00"),
    (48, 47, "ペン型です。簡単で持ち運びも楽", "2025-12-25 15:00"),
    (49, 47, "私もペン型。シリンジは使ったことない", "2025-12-25 19:00"),
    (50, None, "注射痕が目立つのが気になる", "2025-12-26 14:00"),
    (51, 50, "私も夏は半袖で二の腕見えるの気になる", "2025-12-26 15:00"),
    (52, 50, "お腹中心にすれば見えないですよ", "2025-12-26 19:00"),
    (53, None, "1型でポンプに変えようか迷ってる", "2025-12-27 14:00"),
    (54, 53, "ポンプにしてから注射の手間なくなって楽ですよ", "2025-12-27 15:00"),
    (55, 53, "費用が気になるけど、QOLは上がるって聞く", "2025-12-27 19:00"),
    (56, 54, "どこのポンプ使ってますか？", "2025-12-27 19:30"),
    (57, 56, "メドトロニックの770Gです", "2025-12-27 20:30"),
    (58, None, "正月も普通にインスリン打たないといけないのが少し切ない", "2025-12-28 19:00"),
    (59, 58, "休みの日も関係ないですもんね", "2025-12-28 19:30"),
    (60, None, "あけおめ！今年もインスリンと共に頑張ります", "2026-01-01 10:00"),
    (61, 60, "あけおめ！お互い頑張りましょう", "2026-01-01 11:00"),
    (62, None, "診断されて3年目、インスリンにも慣れてきた", "2026-01-03 19:00"),
    (63, 62, "最初の頃と比べてどう変わりましたか？", "2026-01-03 19:30"),
    (64, 63, "打つのが当たり前になった。歯磨きと同じ感覚", "2026-01-03 20:30"),
    (65, None, "このスレ見て同じ悩み持ってる人いるって安心した", "2026-01-05 19:00"),
    (66, 65, "一人じゃないって思えると心強いですよね", "2026-01-05 19:30"),
    (67, None, "またインスリンの悩みあったら共有しましょう", "2026-01-06 19:00"),
    (68, 67, "よろしくお願いします！", "2026-01-06 19:30"),
    (69, None, "インスリン仲間、これからも一緒に頑張ろう", "2026-01-07 19:00"),
    (70, 69, "頑張りましょう！", "2026-01-07 19:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.30")
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
