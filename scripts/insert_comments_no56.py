#!/usr/bin/env python3
"""Insert 45 comments for thread No.56: 帰省時の食事管理"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "b7efafec-7cce-4595-8ada-db1b1e2bce06"
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
    (2, None, "年末に実家帰るんだけど、母の料理が美味しすぎて毎回食べ過ぎちゃう…", "2025-12-20 19:32"),
    (3, None, "わかりすぎる。うちも実家帰ると血糖値爆上がりする", "2025-12-20 20:15"),
    (4, 2, "お母さんの手料理は断りにくいですよね😭", "2025-12-20 21:03"),
    (5, None, "診断されたばかりで初めての帰省なんですが、親に病気のこと言うべきか迷ってます", "2025-12-21 09:45"),
    (6, 5, "私は言いましたよ。言わないと「もっと食べなさい」攻撃がすごくて", "2025-12-21 10:22"),
    (7, 5, "言わない派です。心配かけたくなくて…", "2025-12-21 12:08"),
    (8, None, "実家に自分用の低糖質おやつ持参してる人いますか？", "2025-12-21 14:30"),
    (9, 8, "持っていきます！ロカボナッツとか", "2025-12-21 15:45"),
    (10, 8, "SUNAOのクッキー持参してます。見た目普通だからバレない笑", "2025-12-21 16:20"),
    (11, None, "10年以上この病気と付き合ってるけど、帰省のたびに親戚から「痩せた？大丈夫？」って聞かれるのがストレス", "2025-12-21 19:55"),
    (12, 11, "あー親戚の集まりキツいですよね。私も苦手", "2025-12-21 20:30"),
    (13, None, "義実家への帰省が憂鬱。姑が「糖尿病なのにそんなの食べて大丈夫なの？」っていちいち言ってくる", "2025-12-22 11:15"),
    (14, 13, "うわ、それはキツい…", "2025-12-22 12:00"),
    (15, 13, "逆に何も言わずにどんどん食べ物出してくる義母もしんどいですよ😅", "2025-12-22 13:22"),
    (16, None, "帰省中の血糖測定ってどうしてます？家族の前で測りにくくて", "2025-12-22 19:40"),
    (17, 16, "トイレで測ってます", "2025-12-22 20:05"),
    (18, 16, "リブレなのでスマホかざすだけだから楽。家族には「アプリ見てる」って言ってる", "2025-12-22 20:48"),
    (19, 16, "私は堂々と測ってます。隠すと余計気になるかなと思って", "2025-12-22 21:30"),
    (20, None, "3年目だけど帰省のコツがやっとわかってきた。食べる順番だけは死守する", "2025-12-23 08:20"),
    (21, 20, "食べる順番って効果ありますか？", "2025-12-23 09:15"),
    (22, 21, "私は野菜から食べるようにしたら食後血糖値マシになりましたよ", "2025-12-23 10:02"),
    (23, None, "新幹線での移動中に低血糖になったことある人いますか？対策知りたい", "2025-12-23 14:55"),
    (24, 23, "ブドウ糖タブレット必ず持ち歩いてます", "2025-12-23 15:30"),
    (25, 23, "駅弁食べるタイミング計算してる。乗車30分後くらいに食べ始めるとちょうどいい", "2025-12-23 16:18"),
    (26, None, "実家に泊まるとき、インスリン保管どうしてますか？冷蔵庫入れると家族にバレそうで", "2025-12-24 10:30"),
    (27, 26, "開封済みなら常温でOKですよ。未開封だけ冷蔵庫", "2025-12-24 11:05"),
    (28, 26, "保冷バッグに入れて自分の荷物に紛れ込ませてます", "2025-12-24 12:40"),
    (29, None, "今年は帰省しないことにした。正直ホッとしてる", "2025-12-25 19:20"),
    (30, 29, "わかる。血糖値管理考えると自宅が一番", "2025-12-25 20:00"),
    (31, None, "明日から実家。緊張してきた…", "2025-12-27 22:15"),
    (32, 31, "がんばって！無理しないでね", "2025-12-27 22:45"),
    (33, None, "実家着いた。さっそく「痩せたね」って言われた", "2025-12-28 15:30"),
    (34, 33, "あるある笑 健康的に痩せたのにね", "2025-12-28 16:10"),
    (35, None, "母に糖尿病のこと話したら泣かれた…申し訳ない気持ちになる", "2025-12-29 20:45"),
    (36, 35, "親世代は糖尿病＝不摂生ってイメージ強いみたいですよね", "2025-12-29 21:20"),
    (37, 35, "うちも最初泣かれたけど、今は理解してくれてます。時間かかるかもだけど", "2025-12-29 22:00"),
    (38, None, "大晦日。紅白見ながらおせちつまんでる。血糖値怖いけどまあいいか", "2025-12-31 21:30"),
    (39, 38, "年に一度くらいは許容範囲！", "2025-12-31 22:05"),
    (40, None, "帰省から戻ってきた。体重1.5kg増えてた…", "2026-01-03 18:20"),
    (41, 40, "私は2kg増💦明日から節制します", "2026-01-03 19:00"),
    (42, None, "HbA1c上がってそうで次の検査が怖い", "2026-01-04 10:15"),
    (43, 42, "1週間くらいなら大丈夫ですよ！これから戻せばOK", "2026-01-04 11:30"),
    (44, None, "来年は帰省の食事対策もっとちゃんとしよう…毎年同じこと言ってる気がする", "2026-01-05 14:40"),
    (45, 44, "私もです笑 学習しない", "2026-01-05 15:20"),
    (46, None, "でも家族に会えたのはよかった。来年もがんばろう", "2026-01-05 20:00"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.56")
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
