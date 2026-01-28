#!/usr/bin/env python3
"""Insert 54 comments for thread No.80: こたつで動かない問題"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "ed5943bc-c8d7-4f3d-b88e-91f35cba8989"
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
    (2, None, "こたつから出られない。もう3時間入ってる", "2025-12-20 19:30"),
    (3, None, "こたつは人をダメにする家電", "2025-12-20 20:15"),
    (4, None, "診断されたばかりだけど、こたつでゴロゴロしてたら血糖値上がるよね", "2025-12-20 21:00"),
    (5, 4, "動かないと上がりやすいですね", "2025-12-20 21:45"),
    (6, None, "10年以上糖尿病だけど、冬はこたつの誘惑に負ける", "2025-12-21 10:30"),
    (7, 6, "ベテランでも負けるんですね笑", "2025-12-21 11:15"),
    (8, None, "こたつでみかん食べながらテレビ見るの最高すぎる", "2025-12-21 15:45"),
    (9, 8, "それやると血糖値やばいやつ笑", "2025-12-21 16:30"),
    (10, None, "3年目だけど冬は毎年体重増える。こたつのせい", "2025-12-21 19:30"),
    (11, 10, "同じです。春になって焦る", "2025-12-21 20:15"),
    (12, None, "こたつに入ったまま運動できないかな", "2025-12-22 11:30"),
    (13, 12, "足パタパタさせるくらいしかできなそう", "2025-12-22 12:15"),
    (14, 12, "こたつde足踏みとか笑", "2025-12-22 13:00"),
    (15, None, "タイマーで切れるようにして強制的に出るようにしてる", "2025-12-22 18:45"),
    (16, 15, "それいいですね！真似しよう", "2025-12-22 19:30"),
    (17, None, "こたつ出たくないからおやつ取りに行けない。ある意味ダイエット", "2025-12-23 10:30"),
    (18, 17, "逆転の発想笑", "2025-12-23 11:15"),
    (19, None, "トイレ行くのすら億劫になる", "2025-12-23 15:45"),
    (20, 19, "それは我慢しないでください笑", "2025-12-23 16:30"),
    (21, None, "こたつ出たら寒すぎて秒で戻る", "2025-12-23 20:15"),
    (22, None, "1時間に1回は立ち上がるようにしてる", "2025-12-24 11:30"),
    (23, 22, "偉い！私は無理…", "2025-12-24 12:15"),
    (24, None, "こたつで寝落ちすると風邪ひく", "2025-12-24 19:20"),
    (25, 24, "体の半分だけ温まって良くないらしいね", "2025-12-24 20:00"),
    (26, None, "こたつで過ごす休日が幸せすぎる", "2025-12-25 14:30"),
    (27, 26, "最高ですよね。でも血糖値が…", "2025-12-25 15:15"),
    (28, None, "リモートワークでこたつで仕事してる", "2025-12-25 20:30"),
    (29, 28, "羨ましい。でも動かなさそう", "2025-12-25 21:15"),
    (30, None, "年末年始はこたつが定位置になる", "2025-12-26 11:45"),
    (31, None, "こたつで正月番組見るの楽しみ", "2025-12-27 10:30"),
    (32, None, "こたつに入りながらストレッチしてみた", "2025-12-27 18:45"),
    (33, 32, "どうでした？", "2025-12-27 19:30"),
    (34, 33, "上半身だけならなんとか。足は動かせない笑", "2025-12-27 20:15"),
    (35, None, "大晦日はこたつで年越し", "2025-12-31 22:30"),
    (36, None, "あけおめ！こたつから失礼します", "2026-01-01 00:30"),
    (37, 36, "新年早々こたつ民笑", "2026-01-01 01:00"),
    (38, None, "正月三が日ほぼこたつで過ごした", "2026-01-03 18:30"),
    (39, 38, "私もです。動いてない…", "2026-01-03 19:15"),
    (40, None, "仕事始まったらこたつ恋しくなる", "2026-01-06 20:00"),
    (41, None, "こたつ依存症かもしれない", "2026-01-07 18:30"),
    (42, 41, "冬だけだから大丈夫笑", "2026-01-07 19:15"),
    (43, None, "こたつあると運動する気なくなる", "2026-01-08 20:00"),
    (44, 43, "分かりすぎる", "2026-01-08 20:45"),
    (45, None, "春になったらこたつしまって強制的に動く", "2026-01-09 18:30"),
    (46, 45, "それまでの辛抱笑", "2026-01-09 19:15"),
    (47, None, "こたつ問題、糖尿病の大敵だね", "2026-01-09 20:30"),
    (48, None, "でも幸せだからやめられない", "2026-01-10 18:30"),
    (49, 48, "わかる。冬の楽しみだし", "2026-01-10 19:15"),
    (50, None, "適度に動くことを忘れずに", "2026-01-10 20:30"),
    (51, None, "このスレ共感しかない", "2026-01-10 21:15"),
    (52, None, "来年もこたつと戦う", "2026-01-11 18:45"),
    (53, None, "みんなありがとう！", "2026-01-11 20:00"),
    (54, None, "こたつ仲間がいて嬉しい", "2026-01-11 21:00"),
    (55, None, "また来年の冬も語ろう", "2026-01-12 19:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.80")
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
