#!/usr/bin/env python3
"""Insert 70 comments for thread No.25: 血糖測定器おすすめ教えて
reply_to kept as original CSV. user_id logic:
1. Duration-keyword comments get a user whose illness_duration matches.
2. When B asks A a question (？), C's answer gets A's user_id.
"""

import uuid
import json
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

THREAD_ID = "8d5f0257-70c9-4013-93ed-3acfee11626a"
THREAD_OWNER_ID = "2033ee1c-28b2-5187-8ba1-c94f7964e33e"

USERS = [
    "b0000001-0000-0000-0000-000000000001",
    "b0000001-0000-0000-0000-000000000002",
    "b0000001-0000-0000-0000-000000000003",
    "b0000001-0000-0000-0000-000000000004",
    "b0000001-0000-0000-0000-000000000005",
    "b0000001-0000-0000-0000-000000000006",
    "b0000001-0000-0000-0000-000000000007",
    "b0000001-0000-0000-0000-000000000008",
    "b0000001-0000-0000-0000-000000000009",
    "b0000001-0000-0000-0000-000000000010",
    "b0000001-0000-0000-0000-000000000011",
    "b0000001-0000-0000-0000-000000000012",
    "b0000001-0000-0000-0000-000000000013",
    "b0000001-0000-0000-0000-000000000014",
    "b0000001-0000-0000-0000-000000000015",
    "b0000001-0000-0000-0000-000000000016",
    "b0000001-0000-0000-0000-000000000017",
    "b0000001-0000-0000-0000-000000000018",
    "b0000001-0000-0000-0000-000000000019",
    "b0000001-0000-0000-0000-000000000020",
    "f0000001-0000-0000-0000-000000000001",
    "f0000001-0000-0000-0000-000000000002",
    "f0000001-0000-0000-0000-000000000003",
    "f0000001-0000-0000-0000-000000000004",
    "f0000001-0000-0000-0000-000000000005",
    "f0000001-0000-0000-0000-000000000006",
    "f0000001-0000-0000-0000-000000000008",
    "f0000001-0000-0000-0000-000000000009",
    "f0000001-0000-0000-0000-000000000010",
    THREAD_OWNER_ID,
]

USER_DURATION = {
    "b0000001-0000-0000-0000-000000000001": "1_to_3",
    "b0000001-0000-0000-0000-000000000002": "less_than_1",
    "b0000001-0000-0000-0000-000000000003": "less_than_1",
    "b0000001-0000-0000-0000-000000000004": "3_to_5",
    "b0000001-0000-0000-0000-000000000005": "less_than_1",
    "b0000001-0000-0000-0000-000000000006": "1_to_3",
    "b0000001-0000-0000-0000-000000000007": "1_to_3",
    "b0000001-0000-0000-0000-000000000008": "less_than_1",
    "b0000001-0000-0000-0000-000000000009": "5_to_10",
    "b0000001-0000-0000-0000-000000000010": "3_to_5",
    "b0000001-0000-0000-0000-000000000011": "5_to_10",
    "b0000001-0000-0000-0000-000000000012": "1_to_3",
    "b0000001-0000-0000-0000-000000000013": "less_than_1",
    "b0000001-0000-0000-0000-000000000014": "1_to_3",
    "b0000001-0000-0000-0000-000000000015": "10_plus",
    "b0000001-0000-0000-0000-000000000016": "less_than_1",
    "b0000001-0000-0000-0000-000000000017": "10_plus",
    "b0000001-0000-0000-0000-000000000018": "3_to_5",
    "b0000001-0000-0000-0000-000000000019": "10_plus",
    "b0000001-0000-0000-0000-000000000020": "1_to_3",
    THREAD_OWNER_ID: "5_to_10",
}

USERS_BY_DURATION = {
    "less_than_1": [u for u in USERS if USER_DURATION.get(u) == "less_than_1"],
    "1_to_3":      [u for u in USERS if USER_DURATION.get(u) == "1_to_3"],
    "3_to_5":      [u for u in USERS if USER_DURATION.get(u) == "3_to_5"],
    "5_to_10":     [u for u in USERS if USER_DURATION.get(u) == "5_to_10"],
    "10_plus":     [u for u in USERS if USER_DURATION.get(u) == "10_plus"],
}

DURATION_KEYWORDS = [
    ("10_plus",     ["10年以上", "15年", "20年", "30年", "10年選手"]),
    ("5_to_10",     ["5年以上", "7年", "8年", "9年", "6年", "診断されて5年", "診断されて6年", "診断されて7年", "診断されて8年"]),
    ("3_to_5",      ["4年目", "5年目", "4年経", "5年経", "診断されて4年"]),
    ("1_to_3",      ["2年目", "3年目", "2年経", "3年経", "診断されて2年", "診断されて3年", "診断されて1年"]),
    ("less_than_1", ["1年未満", "半年", "最近診断", "診断されたばかり", "診断されて数ヶ月"]),
]


def detect_duration(body):
    for category, keywords in DURATION_KEYWORDS:
        for kw in keywords:
            if kw in body:
                return category
    return None


COMMENTS = [
    (2, None, "血糖測定器、何使ってますか？買い替え検討中です", "2025-12-16 19:00"),
    (3, 2, "アキュチェックガイド使ってます。穿刺の痛みが少なくていい", "2025-12-16 19:30"),
    (4, 2, "ワンタッチベリオリフレクト使ってます。Bluetooth対応で記録が楽", "2025-12-16 20:15"),
    (5, None, "診断されたばかりで、病院でもらったやつ使ってるけど他にいいのあるかな", "2025-12-16 21:00"),
    (6, 5, "最初は病院のでいいと思います。慣れてきたら好みで選べばOK", "2025-12-17 08:00"),
    (7, None, "センサーのランニングコストが気になる", "2025-12-17 12:00"),
    (8, 7, "アキュチェックは比較的安いですよ", "2025-12-17 12:30"),
    (9, 7, "Amazonで互換品買ってる人いるけど精度どうなんだろう", "2025-12-17 19:00"),
    (10, 9, "互換品は精度バラつくって聞いたことある。純正の方が安心", "2025-12-17 19:30"),
    (11, None, "リブレとかDexcomのCGM使ってる人いますか？", "2025-12-17 20:30"),
    (12, 11, "リブレ使ってます！針刺さなくていいから楽", "2025-12-17 21:00"),
    (13, 11, "Dexcom G7使ってます。アラーム機能が便利", "2025-12-18 08:00"),
    (14, 12, "リブレって保険適用ですか？", "2025-12-18 10:00"),
    (15, 14, "1型とインスリン頻回注射の人は保険適用です。私は自費で使ってます", "2025-12-18 12:00"),
    (16, 15, "自費だと月いくらくらいですか？", "2025-12-18 12:30"),
    (17, 16, "センサー1個7000円くらいで2週間もつから月14000円くらい", "2025-12-18 19:00"),
    (18, None, "穿刺器具のおすすめありますか？痛くないやつ", "2025-12-18 20:00"),
    (19, 18, "ファインタッチが痛み少ないって評判いいですよ", "2025-12-18 20:30"),
    (20, 18, "アキュチェックのファストクリックス使ってます。6本入りのドラムで便利", "2025-12-18 21:30"),
    (21, 19, "ファインタッチ試してみます！", "2025-12-19 08:00"),
    (22, None, "測定器によって数値違ったりしますか？", "2025-12-19 12:00"),
    (23, 22, "多少の誤差はありますね。同じ血で2台で測ったら10くらい違った", "2025-12-19 13:00"),
    (24, 22, "病院の検査値と比較して大きくズレてなければOKだと思います", "2025-12-19 19:00"),
    (25, None, "スマホ連携できる測定器使ってる人いますか？", "2025-12-19 20:00"),
    (26, 25, "ワンタッチベリオリフレクトがBluetooth対応です。アプリで記録見れて便利", "2025-12-19 20:30"),
    (27, 25, "リブレはスマホかざすだけで測れるから超便利", "2025-12-19 21:30"),
    (28, 26, "どのアプリ使ってますか？", "2025-12-20 08:00"),
    (29, 28, "OneTouch Revealってアプリです。無料で使えます", "2025-12-20 10:00"),
    (30, None, "10年以上同じ測定器使ってるけど、最近のは進化してるんですね", "2025-12-20 14:00"),
    (31, 30, "昔より採血量少なくて済むし、測定時間も短くなってますよ", "2025-12-20 15:00"),
    (32, None, "測定器って何年くらいで買い替えますか？", "2025-12-20 19:00"),
    (33, 32, "5年くらい使ってます。壊れるまで使う予定", "2025-12-20 19:30"),
    (34, 32, "センサーの供給が続く限り使えるんじゃないですかね", "2025-12-20 20:30"),
    (35, None, "外出時に持ち運びやすい測定器ありますか？", "2025-12-21 12:00"),
    (36, 35, "コンタータイプの小さいやつ使ってます", "2025-12-21 13:00"),
    (37, 35, "リブレなら測定器持ち歩かなくてもスマホでOK", "2025-12-21 19:00"),
    (38, None, "病院で測る値と家で測る値が違うんですが", "2025-12-21 20:00"),
    (39, 38, "病院は静脈血、家は毛細血管なので多少違いますよ", "2025-12-21 20:30"),
    (40, 38, "10〜15%くらいの誤差は許容範囲らしいです", "2025-12-21 21:30"),
    (41, None, "年末年始にセンサー切れないように買いだめした", "2025-12-22 14:00"),
    (42, 41, "大事ですよね！私も多めに買っておいた", "2025-12-22 15:00"),
    (43, None, "1型でポンプと連携できる測定器使ってる人いますか？", "2025-12-23 10:00"),
    (44, 43, "メドトロニックのガーディアン使ってます。ポンプと連動していい感じ", "2025-12-23 11:00"),
    (45, 43, "Dexcom G7とt:slim連携させてます", "2025-12-23 14:00"),
    (46, 44, "ガーディアンの精度どうですか？", "2025-12-23 15:00"),
    (47, 46, "リブレより精度いい気がします。キャリブレーション必要だけど", "2025-12-23 19:00"),
    (48, None, "測定のタイミングっていつがいいですか？", "2025-12-24 08:00"),
    (49, 48, "起床時と食後2時間がメインです", "2025-12-24 09:00"),
    (50, 48, "私は食前食後両方測ってます。差を見たいので", "2025-12-24 12:00"),
    (51, None, "リブレのセンサー、剥がれやすくないですか？", "2025-12-25 14:00"),
    (52, 51, "上からテープ貼ってます。シンプルパッチってやつ", "2025-12-25 15:00"),
    (53, 51, "スキンタック塗ってから貼ると剥がれにくいですよ", "2025-12-25 19:00"),
    (54, 52, "シンプルパッチ調べてみます！ありがとう", "2025-12-25 20:00"),
    (55, None, "測定器の消毒ってしてますか？", "2025-12-26 14:00"),
    (56, 55, "アルコール綿で軽く拭いてます", "2025-12-26 15:00"),
    (57, 55, "特にしてないです…やった方がいいのかな", "2025-12-26 19:00"),
    (58, None, "診断されて3年目、そろそろリブレ試してみようかな", "2025-12-27 19:00"),
    (59, 58, "一度使うと戻れなくなりますよ笑。便利すぎて", "2025-12-27 19:30"),
    (60, 58, "自費でも価値あると思います。食事の影響が可視化されるから", "2025-12-27 20:30"),
    (61, None, "このスレ参考になる。測定器の選び方わかってきた", "2026-01-03 14:00"),
    (62, 61, "いろんな選択肢ありますよね", "2026-01-03 15:00"),
    (63, None, "新年から新しい測定器デビューしました", "2026-01-04 10:00"),
    (64, 63, "何にしましたか？", "2026-01-04 11:00"),
    (65, 64, "リブレ2です。スマホでピッとやるの楽しい", "2026-01-04 14:00"),
    (66, None, "測定器も進化してるから、情報交換大事ですね", "2026-01-05 19:00"),
    (67, 66, "新製品とか出たらまた共有しましょう", "2026-01-05 19:30"),
    (68, None, "血糖測定は自己管理の基本だから、いい測定器選びたい", "2026-01-06 19:00"),
    (69, 68, "自分に合ったもの見つかるといいですね", "2026-01-06 19:30"),
    (70, None, "また新しい情報あったら教えてください！", "2026-01-07 19:00"),
    (71, 70, "お互い情報交換しましょう", "2026-01-07 19:30"),
]


def jst_to_utc(jst_str):
    dt = datetime.strptime(jst_str, "%Y-%m-%d %H:%M")
    dt_utc = dt - timedelta(hours=9)
    return dt_utc.strftime("%Y-%m-%dT%H:%M:%S+00:00")


def assign_user_ids(comments):
    user_map = {}
    body_map = {}
    reply_map = {}
    for num, reply_to, body, dt in comments:
        body_map[num] = body
        reply_map[num] = reply_to

    dur_idx = {k: 0 for k in USERS_BY_DURATION}
    user_idx = 0

    for num, reply_to, body, dt in comments:
        dur_cat = detect_duration(body)
        if dur_cat and USERS_BY_DURATION.get(dur_cat):
            group = USERS_BY_DURATION[dur_cat]
            idx = dur_idx[dur_cat] % len(group)
            candidate = group[idx]
            if reply_to and reply_to in user_map and candidate == user_map[reply_to]:
                dur_idx[dur_cat] += 1
                idx = dur_idx[dur_cat] % len(group)
                candidate = group[idx]
            user_map[num] = candidate
            dur_idx[dur_cat] += 1
            print(f"  #{num}: duration match ({dur_cat}) -> {candidate[-3:]}")
            continue

        if reply_to and reply_to in reply_map:
            B_num = reply_to
            A_num = reply_map[B_num]
            B_body = body_map.get(B_num, "")
            if A_num and "？" in B_body and A_num in user_map:
                user_map[num] = user_map[A_num]
                print(f"  #{num}: question-answer -> same as #{A_num}")
                continue

        if reply_to and reply_to in user_map:
            parent_user = user_map[reply_to]
            candidate = USERS[user_idx % len(USERS)]
            while candidate == parent_user:
                user_idx += 1
                candidate = USERS[user_idx % len(USERS)]
            user_map[num] = candidate
            user_idx += 1
        else:
            user_map[num] = USERS[user_idx % len(USERS)]
            user_idx += 1

    return user_map


def insert_batch(records, batch_num):
    url = f"{SUPABASE_URL}/rest/v1/comments"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    data = json.dumps(records).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  Batch {batch_num}: {resp.status} - {len(records)} records inserted")
            return True
    except urllib.error.HTTPError as e:
        print(f"  Batch {batch_num}: ERROR {e.code} - {e.read().decode()}")
        return False


def main():
    print(f"Processing {len(COMMENTS)} comments for thread No.25")
    print(f"Thread ID: {THREAD_ID}")
    print()

    comment_uuids = {}
    for num, _, _, _ in COMMENTS:
        comment_uuids[num] = str(uuid.uuid4())

    print("Assigning user IDs...")
    user_map = assign_user_ids(COMMENTS)
    print()

    records = []
    now_utc = datetime.now(timezone.utc)
    past_count = 0
    future_count = 0

    for num, reply_to, body, dt_jst in COMMENTS:
        utc_str = jst_to_utc(dt_jst)
        dt_obj = datetime.strptime(dt_jst, "%Y-%m-%d %H:%M").replace(tzinfo=timezone(timedelta(hours=9)))
        if dt_obj > now_utc:
            future_count += 1
        else:
            past_count += 1

        parent_id = comment_uuids[reply_to] if reply_to else None
        record = {
            "id": comment_uuids[num],
            "thread_id": THREAD_ID,
            "body": body,
            "user_id": user_map[num],
            "is_hidden": False,
            "created_at": utc_str,
            "parent_id": parent_id,
        }
        records.append(record)

    print(f"Past comments: {past_count}")
    print(f"Future comments: {future_count}")
    print(f"Total: {len(records)}")
    print()

    BATCH_SIZE = 50
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i+BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        if not insert_batch(batch, batch_num):
            print("STOPPING due to error")
            return

    print(f"\nAll {len(records)} comments inserted!")

    print(f"\nUpdating comments_count to {past_count}...")
    url = f"{SUPABASE_URL}/rest/v1/threads?id=eq.{THREAD_ID}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    data = json.dumps({"comments_count": past_count}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  Updated: {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"  ERROR: {e.code} - {e.read().decode()}")


if __name__ == "__main__":
    main()
