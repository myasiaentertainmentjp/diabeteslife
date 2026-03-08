#!/usr/bin/env python3
"""
未来コメントが時間経過で表示対象になった際に comments_count を更新するスクリプト。
定期的に実行（1日1回程度）することで、カウントを正確に保つ。

使い方:
  python3 scripts/update_visible_counts.py
"""

import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


def api_get(path):
    """GET request to Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {**HEADERS, "Prefer": "return=representation"}
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def api_patch(path, data):
    """PATCH request to Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {**HEADERS, "Prefer": "return=minimal"}
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        return resp.status


def main():
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"Updating comments_count for all threads (as of {now_iso})")
    print()

    # 1. 全スレッド取得
    threads = api_get("threads?select=id,title,comments_count&order=created_at.asc")
    print(f"Found {len(threads)} threads")

    updated = 0
    for t in threads:
        thread_id = t["id"]
        old_count = t.get("comments_count", 0) or 0

        # 2. created_at <= now かつ is_hidden = false のコメント数を取得
        params = urllib.parse.urlencode({
            "thread_id": f"eq.{thread_id}",
            "created_at": f"lte.{now_iso}",
            "is_hidden": "eq.false",
            "select": "id",
        })
        url = f"{SUPABASE_URL}/rest/v1/comments?{params}"
        headers = {
            **HEADERS,
            "Prefer": "count=exact",
            "Range-Unit": "items",
            "Range": "0-0",
        }
        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req) as resp:
                content_range = resp.headers.get("Content-Range", "")
                # Format: "0-0/123" or "*/0"
                if "/" in content_range:
                    new_count = int(content_range.split("/")[1])
                else:
                    new_count = 0
        except urllib.error.HTTPError:
            # No comments for this thread
            new_count = 0

        if new_count != old_count:
            # 3. 更新が必要
            status = api_patch(
                f"threads?id=eq.{thread_id}",
                {"comments_count": new_count}
            )
            print(f"  [{t['title'][:30]}] {old_count} → {new_count} (updated)")
            updated += 1

    print()
    print(f"Done. {updated}/{len(threads)} threads updated.")


if __name__ == "__main__":
    main()
