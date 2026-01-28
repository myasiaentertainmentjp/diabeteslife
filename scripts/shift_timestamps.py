#!/usr/bin/env python3
"""Shift ~70% of existing comments' timestamps by ±1 minute for natural appearance"""

import json, urllib.request, random, time
from datetime import datetime, timedelta, timezone

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

# All thread IDs for No.1-41
THREAD_IDS = [
    # No.1-9 (existing)
    "a0000001-1215-0001-0001-000000000001",
    "a0000001-0110-0007-0001-000000000001",
    "a0000001-0108-0002-0001-000000000001",
    "a0000001-0115-0007-0001-000000000002",
    "a0000001-0108-0001-0001-000000000001",
    "a0000001-0120-0001-0001-000000000001",
    "a0000001-1220-0007-0001-000000000001",
    "a0000001-0112-0001-0001-000000000001",
    "a0000001-1215-0004-0001-000000000001",
    # No.10-18 (hot)
    "f6c74f94-cb2d-456a-882b-5a25915a7aa5",
    "b3e3a28c-5797-4a05-a667-3d353b4cb703",
    "71e67423-01b5-4634-8b81-3dfae9afb479",
    "817f4d09-e85c-4d09-a314-1b09c08f43be",
    "668402a5-2089-4fac-90b1-7840d63130ae",
    "4fd20952-e2db-473e-9ea4-864a79575d83",
    "262dc88f-c42c-4cfa-bfaf-9edfdecaf441",
    "87689a5a-da97-4b4e-9fd9-e4236d825e46",
    "dfeb6b8f-4414-4cf7-8567-5024cad6e463",
    # No.19-42 (normal)
    "d2a07aea-fccc-4faa-bfcd-e635a94bafcc",
    "9dbba3dd-4470-4f55-bead-4b65006457c5",
    "82a3b12f-739b-4fa2-a5da-79d3c76b7baf",
    "e2491a37-4412-421f-9d9c-d371e67451c6",
    "63599061-f412-4a05-a8c1-89a0b4a24d81",
    "2ffbf01d-9fff-4c12-98fe-dda589234191",
    "8d5f0257-70c9-4013-93ed-3acfee11626a",
    "c728448e-9685-4ea5-a74f-a8a4709d1635",
    "496e4a94-7e8a-4a6a-9df0-b8de8765d812",
    "6d710f6a-ab03-4d0b-8210-326356bf227a",
    "9da3d755-5104-4ea6-bdf0-e174cb06e276",
    "41fb1726-8688-46df-852b-812fc38da962",
    "851e4cc5-5677-4506-849a-e9444e35dd6d",
    "8dfd9246-5500-4d16-996f-b19ab1f39787",
    "dfd436cb-e460-4a5e-be93-b25296e09f3b",
    "b18d4dcd-a7b3-46e3-951c-2191133c3397",
    "96d75e45-36ee-4ef1-a3cd-a41f3784f0dd",
    "4eee7a65-9e40-4076-ab7f-dbd2d032492c",
    "0fcb0316-4304-46a8-97d8-4f79e56038e0",
    "98bc506d-15ea-4127-9ff6-c33168e7b21d",
    "6a04ff8c-ab7e-44fa-b179-572b0000d574",
    "5a04c73d-ad94-4937-a143-e00cde36db84",
    "d861137b-b341-422b-a3af-f2feeb7105fb",
]

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

def fetch_comments(thread_id):
    """Fetch all comment IDs and created_at for a thread"""
    url = f"{SUPABASE_URL}/rest/v1/comments?thread_id=eq.{thread_id}&select=id,created_at&order=created_at.asc&limit=500"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def update_created_at(comment_id, new_created_at):
    """Update a single comment's created_at"""
    url = f"{SUPABASE_URL}/rest/v1/comments?id=eq.{comment_id}"
    data = json.dumps({"created_at": new_created_at}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=HEADERS, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        return resp.status

def parse_timestamp(ts_str):
    """Parse various timestamp formats from Supabase"""
    # Handle formats like "2025-12-16T10:00:00+00:00" or "2025-12-16T10:00:00.123456+00:00"
    ts_str = ts_str.replace("Z", "+00:00")
    if "." in ts_str:
        # Remove microseconds for simpler parsing
        parts = ts_str.split(".")
        tz_part = ""
        if "+" in parts[1]:
            tz_part = "+" + parts[1].split("+")[1]
        elif parts[1].endswith("Z"):
            tz_part = "+00:00"
        ts_str = parts[0] + tz_part
    return datetime.fromisoformat(ts_str)

def main():
    random.seed()  # true random

    # Step 1: Fetch all comments
    print("=" * 60)
    print("Fetching all comments from No.1-41...")
    print("=" * 60)
    all_comments = []
    for i, tid in enumerate(THREAD_IDS):
        comments = fetch_comments(tid)
        all_comments.extend(comments)
        print(f"  No.{i+1}: {len(comments):3d} comments (thread {tid[:8]}...)")

    total = len(all_comments)
    print(f"\nTotal comments: {total}")

    # Step 2: Select ~70%
    sample_size = int(total * 0.7)
    selected = random.sample(all_comments, sample_size)
    not_selected = total - sample_size
    print(f"Selected for shift: {sample_size} ({sample_size/total*100:.1f}%)")
    print(f"Unchanged: {not_selected} ({not_selected/total*100:.1f}%)")

    # Step 3: Shift each by ±1 minute
    print(f"\n{'=' * 60}")
    print(f"Updating {sample_size} comments...")
    print(f"{'=' * 60}")

    updated = 0
    errors = 0
    plus_count = 0
    minus_count = 0

    for i, comment in enumerate(selected):
        try:
            dt = parse_timestamp(comment["created_at"])
            shift = random.choice([-1, 1])
            new_dt = dt + timedelta(minutes=shift)
            new_ts = new_dt.strftime("%Y-%m-%dT%H:%M:%S+00:00")

            update_created_at(comment["id"], new_ts)
            updated += 1
            if shift == 1:
                plus_count += 1
            else:
                minus_count += 1

        except Exception as e:
            errors += 1
            print(f"  ERROR [{comment['id'][:8]}]: {e}")

        if (i + 1) % 200 == 0:
            print(f"  Progress: {i+1}/{sample_size} (updated: {updated}, errors: {errors})")

    print(f"\n{'=' * 60}")
    print(f"DONE!")
    print(f"  Total comments: {total}")
    print(f"  Updated: {updated} ({updated/total*100:.1f}%)")
    print(f"    +1 min: {plus_count}")
    print(f"    -1 min: {minus_count}")
    print(f"  Unchanged: {not_selected}")
    print(f"  Errors: {errors}")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
