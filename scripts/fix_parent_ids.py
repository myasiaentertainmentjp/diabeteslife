#!/usr/bin/env python3
"""
Fix incorrect parent_id references for 26 comments across 6 threads.
Comments are identified by their position (created_at order) within each thread.
Comment number N = the (N-1)th comment in created_at ascending order (since #1 is the thread post).
"""

import json
import urllib.request
import urllib.parse

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# Fixes: { thread_id: [(comment_number, wrong_parent_number, correct_parent_number), ...] }
FIXES = {
    # 1. 糖尿病あるある
    "b3e3a28c-5797-4a05-a667-3d353b4cb703": [
        (149, 148, 147),
        (176, 175, 174),
    ],
    # 2. HbA1c・検査結果
    "f6c74f94-cb2d-456a-882b-5a25915a7aa5": [
        (26, 25, 24),
        (39, 38, 37),
        (44, 43, 42),
        (50, 49, 48),
        (84, 83, 81),
        (91, 90, 89),
        (95, 94, 93),
        (125, 124, 123),
        (131, 130, 128),
        (149, 148, 146),
    ],
    # 3. 食後血糖値
    "71e67423-01b5-4634-8b81-3dfae9afb479": [
        (6, 5, 4),
        (26, 25, 24),
        (29, 28, 27),
        (95, 94, 93),
        (106, 105, 104),
    ],
    # 4. リブレ
    "817f4d09-e85c-4d09-a314-1b09c08f43be": [
        (63, 62, 61),
    ],
    # 5. 糖質制限
    "668402a5-2089-4fac-90b1-7840d63130ae": [
        (20, 19, 18),
        (31, 30, 29),
        (43, 42, 41),
        (55, 54, 53),
        (63, 62, 61),
        (77, 76, 75),
        (86, 85, 84),
    ],
    # 6. 愚痴
    "4fd20952-e2db-473e-9ea4-864a79575d83": [
        (65, 64, 63),
    ],
}


def fetch_comments(thread_id):
    """Fetch all comments for a thread, ordered by created_at ascending."""
    params = urllib.parse.urlencode({
        "thread_id": f"eq.{thread_id}",
        "select": "id,body,created_at,parent_id",
        "order": "created_at.asc",
        "limit": "1000",
    })
    url = f"{SUPABASE_URL}/rest/v1/comments?{params}"
    headers = {**HEADERS, "Prefer": "return=representation"}
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def update_parent(comment_id, new_parent_id):
    """Update parent_id for a specific comment."""
    url = f"{SUPABASE_URL}/rest/v1/comments?id=eq.{comment_id}"
    headers = {**HEADERS, "Prefer": "return=minimal"}
    data = json.dumps({"parent_id": new_parent_id}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        return resp.status


def main():
    total_fixes = sum(len(fixes) for fixes in FIXES.values())
    print(f"Fixing {total_fixes} parent_id references across {len(FIXES)} threads\n")

    fixed = 0
    errors = 0

    for thread_id, fixes in FIXES.items():
        print(f"Thread: {thread_id}")

        # Fetch all comments for this thread
        comments = fetch_comments(thread_id)
        print(f"  Found {len(comments)} comments")

        # Build number -> UUID mapping
        # Comment #2 = index 0, #3 = index 1, etc.
        num_to_id = {}
        for i, c in enumerate(comments):
            num = i + 2  # comments start at #2
            num_to_id[num] = c["id"]

        for comment_num, wrong_parent_num, correct_parent_num in fixes:
            comment_id = num_to_id.get(comment_num)
            correct_parent_id = num_to_id.get(correct_parent_num)

            if not comment_id:
                print(f"  ERROR: Comment #{comment_num} not found")
                errors += 1
                continue
            if not correct_parent_id:
                print(f"  ERROR: Parent #{correct_parent_num} not found")
                errors += 1
                continue

            # Verify current parent matches expected wrong parent
            wrong_parent_id = num_to_id.get(wrong_parent_num)
            actual_comment = comments[comment_num - 2]
            if actual_comment["parent_id"] != wrong_parent_id:
                print(f"  WARNING: #{comment_num} current parent doesn't match expected wrong parent")
                print(f"    Expected wrong: {wrong_parent_id}")
                print(f"    Actual:         {actual_comment['parent_id']}")
                print(f"    Body: {actual_comment['body'][:50]}")
                # Still proceed with fix

            try:
                status = update_parent(comment_id, correct_parent_id)
                body_preview = actual_comment["body"][:40]
                print(f"  #{comment_num} parent: #{wrong_parent_num} → #{correct_parent_num} OK  \"{body_preview}\"")
                fixed += 1
            except Exception as e:
                print(f"  #{comment_num} ERROR: {e}")
                errors += 1

        print()

    print(f"Done. Fixed: {fixed}, Errors: {errors}")


if __name__ == "__main__":
    main()
