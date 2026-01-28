#!/usr/bin/env python3
"""Insert 57 comments for thread No.66: 受験生の子供がいる糖尿病親"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "86e7941d-9ef4-411c-bad5-0645d3a0561c"
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
    (2, None, "子供が受験生で毎日ピリピリしてる。ストレスで血糖値上がる", "2025-12-20 19:30"),
    (3, None, "うちも高3。親のほうが緊張してるかも", "2025-12-20 20:15"),
    (4, None, "診断されたばかりなのに子供の受験と重なって大変", "2025-12-20 21:00"),
    (5, 4, "それは大変ですね…無理しないでください", "2025-12-20 21:45"),
    (6, None, "10年以上この病気だけど、子供の受験は初めてで緊張する", "2025-12-21 10:30"),
    (7, None, "夜食作ってあげたいけど自分は食べられないのがつらい", "2025-12-21 14:20"),
    (8, 7, "わかる。おにぎり作りながらお腹空く", "2025-12-21 15:00"),
    (9, None, "子供のためにインスタント食品買い置きしてるけど誘惑がすごい", "2025-12-21 19:45"),
    (10, None, "受験当日、付き添いで朝早いから低血糖心配", "2025-12-22 11:30"),
    (11, 10, "ブドウ糖持っていったほうがいいですよ", "2025-12-22 12:15"),
    (12, None, "3年目だけど子供には病気のこと詳しく話してない", "2025-12-22 18:30"),
    (13, 12, "受験終わったら話す予定ですか？", "2025-12-22 19:15"),
    (14, 13, "落ち着いたら話そうと思ってます。今は集中させたい", "2025-12-22 20:00"),
    (15, None, "子供の合格祈願でお守り買いに行った。自分の健康もお願いしてきた", "2025-12-23 10:45"),
    (16, None, "塾の送迎で運動する時間がない", "2025-12-23 15:30"),
    (17, 16, "送迎の待ち時間に歩いたりしてます", "2025-12-23 16:15"),
    (18, None, "子供の食事優先で自分の食事が適当になりがち", "2025-12-23 20:15"),
    (19, 18, "自分のことも大事にしてくださいね", "2025-12-23 21:00"),
    (20, None, "合格発表の日、血糖値測るの忘れそう", "2025-12-24 11:30"),
    (21, None, "子供がストレスで甘いもの食べまくってて心配。遺伝もあるし", "2025-12-24 18:45"),
    (22, 21, "受験終わったら食生活見直したほうがいいかもですね", "2025-12-24 19:30"),
    (23, None, "年末年始も勉強漬け。家族の時間が取れない", "2025-12-25 14:20"),
    (24, None, "正月料理作っても子供は食べる暇なさそう", "2025-12-25 19:30"),
    (25, None, "受験のストレスで夜眠れない。血糖値にも悪影響", "2025-12-26 21:15"),
    (26, 25, "睡眠大事ですよね。私も子供より先に寝られない", "2025-12-26 22:00"),
    (27, None, "共通テストまであと少し。緊張してきた", "2025-12-27 15:30"),
    (28, None, "子供の体調管理もしながら自分の血糖値管理も…大変", "2025-12-27 20:45"),
    (29, 28, "本当にお疲れ様です。親も頑張ってますよね", "2025-12-27 21:30"),
    (30, None, "インフルエンザだけは避けたい。家族全員気をつけてる", "2025-12-28 11:20"),
    (31, None, "受験生の親あるあるだけど、ゲン担ぎでカツ丼作った", "2025-12-28 19:15"),
    (32, 31, "自分は食べられないけど作るんですね。優しい", "2025-12-28 20:00"),
    (33, None, "子供の前では元気でいたい。心配かけたくない", "2025-12-29 14:30"),
    (34, None, "年末の検診、子供の塾送迎と被って行けなかった", "2025-12-29 19:45"),
    (35, 34, "年明けに必ず行ってくださいね", "2025-12-29 20:30"),
    (36, None, "大晦日も勉強してる子供を見守ってる", "2025-12-31 22:30"),
    (37, None, "あけおめ。今年こそ子供の合格と自分の健康管理を", "2026-01-01 10:15"),
    (38, None, "正月返上で頑張ってる子供を見ると泣けてくる", "2026-01-02 15:30"),
    (39, None, "共通テスト近づいてきた。親のほうがソワソワする", "2026-01-10 19:20"),
    (40, None, "明日から共通テスト。子供より緊張してる", "2026-01-17 21:30"),
    (41, 40, "お子さんを信じて！親は見守るしかないですよね", "2026-01-17 22:15"),
    (42, None, "共通テスト1日目終わった。子供は手応えあるって", "2026-01-18 19:00"),
    (43, 42, "よかったですね！明日も頑張って", "2026-01-18 19:45"),
    (44, None, "共通テスト終わった。ホッとしたのか血糖値下がった", "2026-01-19 18:30"),
    (45, None, "自己採点ドキドキ。子供より親が緊張", "2026-01-20 15:15"),
    (46, None, "二次試験に向けてまた緊張の日々が始まる", "2026-01-21 20:30"),
    (47, None, "出願どこにするか家族会議。ストレスで血糖値上がった", "2026-01-22 21:00"),
    (48, None, "私立の受験も控えてるから気が休まらない", "2026-01-23 19:45"),
    (49, None, "ここで愚痴れるの助かる。リアルじゃ言えない", "2026-01-24 20:30"),
    (50, 49, "同じ境遇の人がいると心強いですよね", "2026-01-24 21:15"),
    (51, None, "受験終わったら自分のご褒美に何か買おうかな", "2026-01-25 14:30"),
    (52, None, "子供の合格祝いの食事、どこにしようか考え中", "2026-01-25 19:20"),
    (53, 52, "気が早い笑 でもその気持ちわかります", "2026-01-25 20:00"),
    (54, None, "あと少し。親子で乗り越えよう", "2026-01-26 18:45"),
    (55, None, "このスレのみんなのお子さんも合格しますように", "2026-01-26 21:30"),
    (56, None, "桜咲くまでもう少し。血糖値管理も頑張る", "2026-01-27 19:15"),
    (57, None, "受験生の親、みんなお疲れ様です", "2026-01-27 21:00"),
    (58, None, "春になったら落ち着いて自分の体のケアしよう", "2026-01-28 18:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.66")
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
