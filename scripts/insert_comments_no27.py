#!/usr/bin/env python3
"""Insert 75 comments for thread No.27: 糖尿病と仕事の両立"""

import uuid, json, urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"
THREAD_ID = "496e4a94-7e8a-4a6a-9df0-b8de8765d812"
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
    (2, None, "仕事しながら糖尿病管理してる人、どうやって両立してますか？", "2025-12-16 19:00"),
    (3, 2, "昼食の時間が不規則で困ってます", "2025-12-16 19:30"),
    (4, 2, "営業職で外食多くて血糖値コントロール難しい", "2025-12-16 20:15"),
    (5, None, "職場の人に糖尿病のこと言ってますか？", "2025-12-16 21:00"),
    (6, 5, "上司にだけ伝えてます。通院で休む時のために", "2025-12-17 08:00"),
    (7, 5, "言ってないです。昼食の時に色々言われそうで", "2025-12-17 12:00"),
    (8, None, "通院のために有給使うの辛い", "2025-12-17 19:00"),
    (9, 8, "土曜日やってる病院に変えました", "2025-12-17 19:30"),
    (10, 8, "オンライン診療使えないですか？薬だけの時は便利ですよ", "2025-12-17 20:30"),
    (11, 9, "土曜診療いいですね。探してみます", "2025-12-17 21:00"),
    (12, None, "デスクワークで運動不足になりがち", "2025-12-18 12:00"),
    (13, 12, "昼休みに15分だけ歩くようにしてます", "2025-12-18 12:30"),
    (14, 12, "1時間に1回は立ち上がってストレッチしてます", "2025-12-18 19:00"),
    (15, None, "残業で夕食が遅くなると翌朝の血糖値高くなる", "2025-12-18 20:00"),
    (16, 15, "わかります。22時過ぎに食べると翌朝確実に高い", "2025-12-18 20:30"),
    (17, 15, "残業の日は軽めに食べるようにしてます", "2025-12-18 21:30"),
    (18, None, "診断されたばかりで、仕事との両立が不安です", "2025-12-19 12:00"),
    (19, 18, "最初は大変だけど、慣れればルーティンになりますよ", "2025-12-19 12:30"),
    (20, 18, "私も最初は不安だったけど、今は普通に仕事できてます", "2025-12-19 19:00"),
    (21, None, "飲み会断りづらくないですか？", "2025-12-19 20:00"),
    (22, 21, "「車で来てるから」って言って断ってます", "2025-12-19 20:30"),
    (23, 21, "参加しても烏龍茶で乗り切ってます", "2025-12-19 21:30"),
    (24, 22, "それいい言い訳ですね！使わせてもらいます", "2025-12-20 08:00"),
    (25, None, "出張が多くて食事管理が難しい", "2025-12-20 12:00"),
    (26, 25, "コンビニでサラダとタンパク質中心に選んでます", "2025-12-20 13:00"),
    (27, 25, "ナッツとか低糖質おやつ持参してます", "2025-12-20 19:00"),
    (28, None, "仕事中に低血糖になったことある人いますか？", "2025-12-20 20:00"),
    (29, 28, "会議中に冷や汗出て焦った。ブドウ糖で復活した", "2025-12-20 20:30"),
    (30, 28, "SU剤飲んでた時はよくあった。今は薬変えてもらった", "2025-12-20 21:30"),
    (31, 29, "会議中は怖いですね。常にブドウ糖持ってた方がいいですよね", "2025-12-21 08:00"),
    (32, None, "シフト勤務で生活リズムがバラバラ", "2025-12-21 14:00"),
    (33, 32, "看護師ですか？私も夜勤あって大変です", "2025-12-21 15:00"),
    (34, 32, "工場勤務です。3交代で薬の時間が難しい", "2025-12-21 19:00"),
    (35, 33, "夜勤の時の食事どうしてますか？", "2025-12-21 20:00"),
    (36, 35, "夜中の食事は軽めにして、朝しっかり食べるようにしてます", "2025-12-21 21:00"),
    (37, None, "忘年会シーズン、断るのも参加するのも辛い", "2025-12-22 12:00"),
    (38, 37, "今年は2次会だけパスしました", "2025-12-22 13:00"),
    (39, 37, "参加して食べるもの選べば大丈夫ですよ", "2025-12-22 19:00"),
    (40, None, "リブレつけてると仕事中も血糖値気になって集中できない時ある", "2025-12-22 20:00"),
    (41, 40, "わかる！気になってスマホ見ちゃう", "2025-12-22 20:30"),
    (42, 40, "アラート設定絞って、普段は見ないようにしてます", "2025-12-22 21:30"),
    (43, None, "10年以上働きながら糖尿病と付き合ってます。なんとかなるよ", "2025-12-23 14:00"),
    (44, 43, "先輩の言葉、励みになります", "2025-12-23 15:00"),
    (45, None, "転職活動で糖尿病のこと聞かれるか心配", "2025-12-23 19:00"),
    (46, 45, "健康診断の結果提出求められることあるけど、それくらいかな", "2025-12-23 19:30"),
    (47, 45, "業務に支障なければ言う必要ないと思います", "2025-12-23 20:30"),
    (48, None, "年末年始休みで生活リズム乱れそう", "2025-12-24 12:00"),
    (49, 48, "休みでも起きる時間は変えないようにしてます", "2025-12-24 13:00"),
    (50, 48, "私は諦めて休み明けに頑張る派笑", "2025-12-24 19:00"),
    (51, None, "在宅勤務になってから運動量減った", "2025-12-25 14:00"),
    (52, 51, "私も！通勤で歩いてた分がなくなって", "2025-12-25 15:00"),
    (53, 51, "意識して散歩するようにしないとダメですよね", "2025-12-25 19:00"),
    (54, None, "仕事のストレスで血糖値上がる気がする", "2025-12-26 19:00"),
    (55, 54, "コルチゾールの影響ありますよね", "2025-12-26 19:30"),
    (56, 54, "締め切り前とか確実に高くなる", "2025-12-26 20:30"),
    (57, None, "インスリン注射してる人、職場でどうやって打ってますか？", "2025-12-27 12:00"),
    (58, 57, "トイレで打ってます", "2025-12-27 12:30"),
    (59, 57, "私は堂々とデスクで打ってます。周りも慣れた", "2025-12-27 19:00"),
    (60, 59, "堂々と打てるの羨ましい。私はまだ抵抗ある", "2025-12-27 19:30"),
    (61, None, "仕事始め、正月ボケで血糖値管理も緩んでそう", "2026-01-03 19:00"),
    (62, 61, "明日から仕事だから今日から気を引き締めます", "2026-01-03 19:30"),
    (63, None, "新年の目標は仕事と糖尿病管理の両立", "2026-01-04 19:00"),
    (64, 63, "いい目標ですね。私も頑張ります", "2026-01-04 19:30"),
    (65, None, "このスレ見て、みんな工夫して両立してるんだなって励まされた", "2026-01-05 19:00"),
    (66, 65, "仲間がいると心強いですよね", "2026-01-05 19:30"),
    (67, None, "診断されて3年目、やっと仕事との両立のコツがわかってきた", "2026-01-06 12:00"),
    (68, 67, "どんなコツですか？教えてほしいです", "2026-01-06 12:30"),
    (69, 68, "完璧を目指さないこと。8割できてればOKって思うようにした", "2026-01-06 19:00"),
    (70, 69, "いい考え方ですね。参考にします", "2026-01-06 19:30"),
    (71, None, "仕事も糖尿病管理も、無理しすぎないのが大事", "2026-01-07 12:00"),
    (72, 71, "本当にそう思います", "2026-01-07 12:30"),
    (73, None, "また仕事との両立で困ったことあったら相談させてください", "2026-01-07 19:00"),
    (74, 73, "いつでもどうぞ！", "2026-01-07 19:30"),
    (75, None, "お互い仕事頑張りながら健康管理していきましょう", "2026-01-07 20:00"),
    (76, 75, "頑張りましょう！", "2026-01-07 20:30"),
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
    print(f"Processing {len(COMMENTS)} comments for thread No.27")
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
