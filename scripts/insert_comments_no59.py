#!/usr/bin/env python3
"""Insert 47 comments for thread No.59: インフルエンザと血糖値"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "f9c6e31d-f1f7-40f3-ad50-e813b8b18d2a"
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
    (2, None, "インフルかかったとき血糖値めちゃくちゃ上がった。400超えてビビった", "2025-12-20 19:45"),
    (3, None, "熱出ると血糖値上がるのわかってても焦るよね", "2025-12-20 20:30"),
    (4, None, "診断されて3ヶ月で初めての冬。インフル怖い", "2025-12-20 21:15"),
    (5, 4, "予防接種は受けました？", "2025-12-20 21:45"),
    (6, 5, "受けました！糖尿病だと重症化しやすいって言われて", "2025-12-20 22:20"),
    (7, None, "去年インフルで入院した。血糖コントロール不能になって", "2025-12-21 10:30"),
    (8, 7, "入院って相当ですね…どのくらい入ってました？", "2025-12-21 11:15"),
    (9, 8, "5日間。点滴でインスリン入れてもらってやっと落ち着いた", "2025-12-21 12:00"),
    (10, None, "12年この病気と付き合ってるけど、シックデイルールちゃんと覚えてなかった…", "2025-12-21 14:20"),
    (11, None, "シックデイルールって具体的に何すればいいの", "2025-12-21 18:45"),
    (12, 11, "水分しっかり摂る、血糖値こまめに測る、食べられなくても薬は相談、とかかな", "2025-12-21 19:30"),
    (13, 11, "主治医に事前に聞いておくといいですよ。私は紙にまとめてもらった", "2025-12-21 20:10"),
    (14, None, "高熱で食欲ないとき薬どうするか迷う", "2025-12-22 09:30"),
    (15, None, "メトホルミン飲んでるけど、体調悪いとき飲んでいいのかわからん", "2025-12-22 12:45"),
    (16, 15, "メトホルミンは脱水のとき危険だから、食べられないときは主治医に相談したほうがいい", "2025-12-22 13:30"),
    (17, None, "インフルのとき何食べてましたか", "2025-12-22 19:20"),
    (18, 17, "おかゆとかゼリー飲料とか", "2025-12-22 20:00"),
    (19, 17, "経口補水液OS-1ずっと飲んでた", "2025-12-22 20:45"),
    (20, None, "5年目だけど毎年この時期ビクビクしてる", "2025-12-23 11:30"),
    (21, None, "家族がインフルになったとき隔離が難しい。うつされる", "2025-12-23 15:40"),
    (22, None, "子供が学校からもらってくるのが怖い", "2025-12-23 19:15"),
    (23, 22, "わかります。子供経由で毎年もらってる気がする", "2025-12-23 20:00"),
    (24, None, "予防接種しててもかかるときはかかるんだよね", "2025-12-24 10:30"),
    (25, None, "でも予防接種してると軽く済むって聞いた", "2025-12-24 14:20"),
    (26, None, "マスクと手洗いは徹底してる", "2025-12-24 19:45"),
    (27, None, "職場でインフル流行ってて戦々恐々", "2025-12-25 12:30"),
    (28, 27, "テレワークできるならしたほうがいいですよ", "2025-12-25 13:15"),
    (29, None, "インフルで血糖値上がったとき、追加でインスリン打っていいのかわからなかった", "2025-12-26 18:20"),
    (30, 29, "自己判断は危険だから主治医に連絡したほうがいいですよ", "2025-12-26 19:00"),
    (31, None, "タミフル飲んでも血糖値への影響ってあるのかな", "2025-12-27 11:45"),
    (32, None, "解熱剤との飲み合わせも気になる", "2025-12-27 15:30"),
    (33, None, "年末年始は病院休みだから特に気をつけないと", "2025-12-28 10:20"),
    (34, None, "救急外来のお世話になりたくない…", "2025-12-28 19:30"),
    (35, None, "診断されたばかりの頃、風邪で血糖値300超えてパニックになった思い出", "2025-12-29 14:15"),
    (36, 35, "最初は焦りますよね。今は慣れました？", "2025-12-29 15:00"),
    (37, 36, "今は落ち着いて対処できるようになりました", "2025-12-29 15:45"),
    (38, None, "熱下がっても血糖値なかなか戻らないのがつらい", "2025-12-30 11:30"),
    (39, None, "回復期も油断できない", "2025-12-30 18:45"),
    (40, None, "今年はまだ無事。このまま乗り切りたい", "2025-12-31 19:20"),
    (41, None, "皆さん良いお年を。インフルに負けずに頑張りましょう", "2025-12-31 23:30"),
    (42, None, "年明けてもまだ流行ってるから油断禁物", "2026-01-03 14:20"),
    (43, None, "正月明けに体調崩す人多いらしいね", "2026-01-04 10:30"),
    (44, None, "やっとインフルの山越えたかな", "2026-01-05 15:45"),
    (45, None, "2月くらいまでは気をつけたほうがいいですよ", "2026-01-05 16:30"),
    (46, None, "来年こそは予防接種早めに受けよう", "2026-01-05 20:15"),
    (47, None, "このスレ参考になった。シックデイルールちゃんと確認しとこ", "2026-01-05 21:40"),
    (48, None, "みんなで無事に冬を乗り切ろう💪", "2026-01-05 22:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.59")
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
