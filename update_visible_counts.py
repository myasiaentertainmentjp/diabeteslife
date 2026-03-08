#!/usr/bin/env python3
"""Update all thread comments_count to only count visible (past, non-hidden) comments."""

import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone

SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

HEADERS = {
    'apikey': API_KEY,
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
}

now_utc = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S+00:00')
print(f"Current UTC time: {now_utc}")

# 1. Get all threads
req = urllib.request.Request(
    f'{SUPABASE_URL}/rest/v1/threads?select=id,title,comments_count',
    headers=HEADERS,
)
resp = urllib.request.urlopen(req)
threads = json.loads(resp.read())
print(f"Found {len(threads)} threads")

# 2. For each thread, count visible comments (past + not hidden)
updated = 0
for thread in threads:
    tid = thread['id']
    old_count = thread.get('comments_count', 0)

    # Count visible comments
    params = urllib.parse.urlencode({
        'thread_id': f'eq.{tid}',
        'created_at': f'lte.{now_utc}',
        'is_hidden': 'eq.false',
        'select': 'id',
    })
    count_url = f'{SUPABASE_URL}/rest/v1/comments?{params}'
    req = urllib.request.Request(count_url, headers={
        **HEADERS,
        'Prefer': 'count=exact',
        'Range-Unit': 'items',
        'Range': '0-0',
    })
    resp = urllib.request.urlopen(req)
    content_range = resp.headers.get('Content-Range', '')
    if '/' in content_range:
        visible_count = int(content_range.split('/')[-1])
    else:
        data = json.loads(resp.read())
        visible_count = len(data)

    if old_count != visible_count:
        # Update
        update_data = json.dumps({'comments_count': visible_count}).encode('utf-8')
        req = urllib.request.Request(
            f'{SUPABASE_URL}/rest/v1/threads?id=eq.{tid}',
            data=update_data,
            headers={**HEADERS, 'Prefer': 'return=minimal'},
            method='PATCH',
        )
        urllib.request.urlopen(req)
        title = thread.get('title', '')[:30]
        print(f"  Updated: {title}... ({old_count} -> {visible_count})")
        updated += 1

print(f"\nDone! Updated {updated}/{len(threads)} threads")
