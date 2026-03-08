#!/usr/bin/env python3
"""Execute comment inserts via Supabase REST API."""

import csv
import json
import random
import uuid
import urllib.request
from datetime import datetime, timedelta
from collections import Counter

SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

THREAD_ID = 'a0000001-1215-0001-0001-000000000001'
THREAD_OWNER_ID = '41cf3d7f-9ac1-5151-9417-c3bfa7afeda0'
USERS_CSV = '/Users/koji/Downloads/dlife_users_154.csv'
COMMENTS_CSV = '/Users/koji/Downloads/dlife_comments_170.csv'

random.seed(42)

# --- Read users ---
users = []
with open(USERS_CSV, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        users.append(row)

libre_users = [u for u in users if 'リブレ' in u.get('devices', '')]
non_libre_users = [u for u in users if 'リブレ' not in u.get('devices', '') and u['user_id'] != THREAD_OWNER_ID]
insulin_users = [u for u in users if 'インスリン' in u.get('treatment', '')]
non_owner_users = [u for u in users if u['user_id'] != THREAD_OWNER_ID]
non_owner_libre = [u for u in libre_users if u['user_id'] != THREAD_OWNER_ID]
non_owner_insulin = [u for u in insulin_users if u['user_id'] != THREAD_OWNER_ID]

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

# --- Assignment rules ---
owner_comments = {'32','54','57','76','87','103','119','148','170','171','187','189','195','201'}

same_person_groups = [
    ['41', '43'], ['48', '50'], ['71', '73'], ['113', '115'],
    ['165', '168'], ['38', '40'], ['51', '53'], ['158', '160'],
    ['162', '164'], ['181', '183'], ['155', '157'], ['191', '193'],
]

libre_comments = {'81', '82', '104', '172'}
wants_libre = {'58'}
insulin_comments = {'48', '50'}

group_map = {}
for i, group in enumerate(same_person_groups):
    for num in group:
        group_map[num] = i

# --- Assign user_ids ---
comment_user_map = {}
group_user_map = {}
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

# --- Build insert data ---
rows = []
for c in comments:
    num = c['num']
    jst_dt = datetime.strptime(c['jst_time'], '%Y-%m-%d %H:%M')
    utc_dt = jst_dt - timedelta(hours=9)
    utc_str = utc_dt.strftime('%Y-%m-%dT%H:%M:%S+00:00')

    row = {
        'id': comment_uuids[num],
        'thread_id': THREAD_ID,
        'body': c['body'],
        'user_id': comment_user_map[num],
        'is_hidden': False,
        'created_at': utc_str,
    }
    if c['reply_to'] and c['reply_to'] in comment_uuids:
        row['parent_id'] = comment_uuids[c['reply_to']]
    else:
        row['parent_id'] = None

    rows.append(row)

# --- Insert in batches ---
BATCH_SIZE = 50
total_inserted = 0

for i in range(0, len(rows), BATCH_SIZE):
    batch = rows[i:i+BATCH_SIZE]
    data = json.dumps(batch).encode('utf-8')

    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/comments',
        data=data,
        headers={
            'apikey': API_KEY,
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
        method='POST',
    )

    try:
        resp = urllib.request.urlopen(req)
        status = resp.getcode()
        total_inserted += len(batch)
        print(f'  Batch {i//BATCH_SIZE + 1}: {len(batch)} rows inserted (status {status})')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f'  ERROR batch {i//BATCH_SIZE + 1}: {e.code} - {body}')
        break

print(f'\nTotal inserted: {total_inserted}/{len(rows)}')

# --- Update comments_count ---
if total_inserted == len(rows):
    print('\nUpdating comments_count...')
    # Use RPC or direct PATCH - we need to count comments
    # First, count total comments for this thread
    count_url = f'{SUPABASE_URL}/rest/v1/comments?thread_id=eq.{THREAD_ID}&select=id'
    req = urllib.request.Request(count_url, headers={
        'apikey': API_KEY,
        'Authorization': f'Bearer {API_KEY}',
        'Prefer': 'count=exact',
    })
    resp = urllib.request.urlopen(req)
    count_header = resp.headers.get('Content-Range', '')
    # Content-Range: 0-199/200
    if '/' in count_header:
        total_count = int(count_header.split('/')[-1])
    else:
        data = json.loads(resp.read())
        total_count = len(data)

    print(f'Total comments in thread: {total_count}')

    # Update thread
    update_data = json.dumps({'comments_count': total_count}).encode('utf-8')
    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/threads?id=eq.{THREAD_ID}',
        data=update_data,
        headers={
            'apikey': API_KEY,
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
        method='PATCH',
    )
    try:
        resp = urllib.request.urlopen(req)
        print(f'comments_count updated to {total_count}')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f'ERROR updating count: {e.code} - {body}')

print('\nDone!')
