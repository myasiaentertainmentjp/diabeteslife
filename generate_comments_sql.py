#!/usr/bin/env python3
"""Generate SQL to insert comments for D-Life thread.
Assigns user_ids based on comment content and generates INSERT statements.
"""

import csv
import random
import uuid
from datetime import datetime, timedelta
from collections import Counter

THREAD_ID = 'a0000001-1215-0001-0001-000000000001'
THREAD_OWNER_ID = '41cf3d7f-9ac1-5151-9417-c3bfa7afeda0'
USERS_CSV = '/Users/koji/Downloads/dlife_users_154.csv'
COMMENTS_CSV = '/Users/koji/Downloads/dlife_comments_170.csv'
OUTPUT_SQL = '/Users/koji/Desktop/Dライフ/sql_comments_170.sql'

random.seed(42)

# --- Read users ---
users = []
with open(USERS_CSV, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        users.append(row)

# --- Categorize users ---
libre_users = [u for u in users if 'リブレ' in u.get('devices', '')]
non_libre_users = [u for u in users if 'リブレ' not in u.get('devices', '') and u['user_id'] != THREAD_OWNER_ID]
insulin_users = [u for u in users if 'インスリン' in u.get('treatment', '')]
non_owner_users = [u for u in users if u['user_id'] != THREAD_OWNER_ID]
non_owner_libre = [u for u in libre_users if u['user_id'] != THREAD_OWNER_ID]
non_owner_insulin = [u for u in insulin_users if u['user_id'] != THREAD_OWNER_ID]
user_name_map = {u['user_id']: u['display_name'] for u in users}

# --- Read comments ---
comments = []
with open(COMMENTS_CSV, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        comments.append({
            'num': row['番号'].strip(),
            'reply_to': row['リプライ先'].strip(),
            'body': row['本文'].strip(),
            'jst_time': row['日時'].strip(),
        })

# --- Pre-generate UUIDs ---
comment_uuids = {}
for c in comments:
    comment_uuids[c['num']] = str(uuid.uuid4())

# --- Define assignment rules ---

# スレ主 comments (仲夏トト - 2型, 50代, 女性, リブレ user)
owner_comments = {
    '32',   # 朝イチ102だった。まあまあかな
    '54',   # 今日は調子いい！全部130以下
    '57',   # リブレのグラフ見ると一目瞭然
    '76',   # 今日は全体的に安定してる✨
    '87',   # 今日は120で安定。いい感じ
    '103',  # リブレの在庫確認した
    '119',  # 今日は135。安定してる
    '148',  # 今日は全体的に安定してる
    '170',  # 今日は130で安定
    '171',  # リブレのおかげで管理しやすくなった
    '187',  # 最近安定してて嬉しい
    '189',  # 食べる時間を固定したのがよかったかも (reply to 188, same person as 187)
    '195',  # 今月は全体的にいい数値だった
    '201',  # 2月も無事乗り切れた
}

# Same-person groups (comments by the same user)
same_person_groups = [
    ['41', '43'],     # 検診A1c怖い → 0.3下がってました
    ['48', '50'],     # 低血糖で補食 → ブドウ糖で落ち着いた
    ['71', '73'],     # 外食で野菜多め → サラダバーのお店
    ['113', '115'],   # 検診行ってきた → A1c維持できてた
    ['165', '168'],   # 検診ドキドキ → A1c下がってました
    ['38', '40'],     # 空腹時95 → 間食やめたのが効いた
    ['51', '53'],     # 食後スパイクひどい → やってみます
    ['158', '160'],   # 今週良い数値 → 間食減らした
    ['162', '164'],   # 食後散歩習慣 → 全然違う
    ['181', '183'],   # ハイカカオ買った → 70%がちょうどいい
    ['155', '157'],   # 友達とランチ → ランチ後165
    ['191', '193'],   # 寒くて動きたくない → やってみる
]

# Special content-based assignments
# リブレ comments (by リブレ users, NOT スレ主)
libre_comments = {'81', '82', '104', '172'}

# Comments where user WANTS リブレ (doesn't have it)
wants_libre = {'58'}

# Low blood sugar → insulin users
insulin_comments = {'48', '50'}

# --- Build group map ---
group_map = {}   # comment_num -> group_index
for i, group in enumerate(same_person_groups):
    for num in group:
        group_map[num] = i

# --- Assign user_ids ---
comment_user_map = {}   # comment_num -> user_id
group_user_map = {}     # group_index -> user_id
last_users = []

def pick_user(candidates, exclude_ids=None, avoid_recent=5):
    pool = list(candidates)
    if exclude_ids:
        pool = [u for u in pool if u['user_id'] not in exclude_ids]
    if len(pool) > avoid_recent:
        filtered = [u for u in pool if u['user_id'] not in last_users[-avoid_recent:]]
        if filtered:
            pool = filtered
    if not pool:
        return random.choice(non_owner_users)['user_id']
    return random.choice(pool)['user_id']

for c in comments:
    num = c['num']
    reply_to = c['reply_to']

    exclude = set()
    if reply_to and reply_to in comment_user_map:
        exclude.add(comment_user_map[reply_to])

    if num in owner_comments:
        user_id = THREAD_OWNER_ID
    elif num in group_map:
        gid = group_map[num]
        if gid in group_user_map:
            user_id = group_user_map[gid]
        else:
            if num in insulin_comments:
                user_id = pick_user(non_owner_insulin, exclude)
            elif num in libre_comments:
                user_id = pick_user(non_owner_libre, exclude)
            else:
                user_id = pick_user(non_owner_users, exclude)
            group_user_map[gid] = user_id
    elif num in libre_comments:
        user_id = pick_user(non_owner_libre, exclude)
    elif num in wants_libre:
        user_id = pick_user(non_libre_users, exclude)
    elif num in insulin_comments:
        user_id = pick_user(non_owner_insulin, exclude)
    else:
        user_id = pick_user(non_owner_users, exclude)

    comment_user_map[num] = user_id
    last_users.append(user_id)

# --- Generate SQL ---
sql_lines = []
sql_lines.append(f"-- Comments for thread {THREAD_ID}")
sql_lines.append(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
sql_lines.append(f"-- Total: {len(comments)} comments")
sql_lines.append("")

for c in comments:
    num = c['num']
    reply_to = c['reply_to']
    body = c['body']
    jst_time = c['jst_time']

    comment_id = comment_uuids[num]
    user_id = comment_user_map[num]

    # Parent ID
    if reply_to and reply_to in comment_uuids:
        parent_id = f"'{comment_uuids[reply_to]}'"
    else:
        parent_id = "NULL"

    # JST -> UTC (-9 hours)
    jst_dt = datetime.strptime(jst_time, '%Y-%m-%d %H:%M')
    utc_dt = jst_dt - timedelta(hours=9)
    utc_str = utc_dt.strftime('%Y-%m-%d %H:%M:%S+00')

    # Escape body for SQL
    escaped_body = body.replace("'", "''")

    sql = (
        f"INSERT INTO comments (id, thread_id, body, user_id, is_hidden, created_at, parent_id) "
        f"VALUES ('{comment_id}', '{THREAD_ID}', E'{escaped_body}', '{user_id}', false, '{utc_str}', {parent_id});"
    )
    sql_lines.append(sql)

sql_lines.append("")
sql_lines.append("-- Update comments_count")
sql_lines.append(
    f"UPDATE threads SET comments_count = "
    f"(SELECT COUNT(*) FROM comments WHERE thread_id = '{THREAD_ID}') "
    f"WHERE id = '{THREAD_ID}';"
)

# --- Write output ---
with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

# --- Report ---
print(f"Generated {len(comments)} INSERT statements")
owner_count = len([c for c in comments if comment_user_map[c['num']] == THREAD_OWNER_ID])
unique_users = len(set(comment_user_map.values()))
print(f"Owner (仲夏トト) comments: {owner_count}")
print(f"Unique users: {unique_users}")
print(f"Saved to: {OUTPUT_SQL}")

user_counts = Counter(comment_user_map.values())
print(f"\n--- User distribution (top 20) ---")
for uid, count in user_counts.most_common(20):
    name = user_name_map.get(uid, 'unknown')
    marker = " [スレ主]" if uid == THREAD_OWNER_ID else ""
    print(f"  {name}{marker}: {count}件")
