#!/usr/bin/env python3
"""Fix parent_id issues in threads 1 and 7 (14 total fixes)."""

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

FIXES = {
    # 1. 今日の血糖値どうだった (12 fixes)
    "a0000001-1215-0001-0001-000000000001": [
        (40, 39, 38),    # "寝る前の間食やめたのが効いたかも" → #38へ
        (43, 42, 41),    # "0.3下がってました！嬉しい😊" → #41へ
        (50, 49, 48),    # "ブドウ糖舐めたら落ち着きました" → #48へ
        (53, 52, 51),    # "やってみます！ありがとう" → #51へ
        (73, 72, 71),    # "サラダバー付きのお店にしました" → #71へ
        (115, 114, 113), # "A1c維持できてました！" → #113へ
        (160, 159, 158), # "間食減らしたのが効いたかも" → #158へ
        (164, 163, 162), # "食後1時間で歩くと全然違う！" → #162へ
        (168, 167, 165), # "A1c下がってました！嬉しい😊" → #165へ
        (183, 182, 181), # "85%は苦かった笑 70%がちょうどいい" → #181へ
        (189, 188, 187), # "食べる時間を固定したのがよかったかも" → #187へ
        (193, 192, 191), # "それいいね！やってみる" → #191へ
    ],
    # 7. 低血糖による悩み (2 fixes)
    "a0000001-1220-0007-0001-000000000001": [
        (15, 14, 13),    # "対処療法的には甘いものなんだけど..." → #13へ
        (16, 14, 13),    # "ナッツがいいらしいよ..." → #13へ
    ],
}


def fetch_comments(thread_id):
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
    url = f"{SUPABASE_URL}/rest/v1/comments?id=eq.{comment_id}"
    headers = {**HEADERS, "Prefer": "return=minimal"}
    data = json.dumps({"parent_id": new_parent_id}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        return resp.status


def main():
    total = sum(len(f) for f in FIXES.values())
    print(f"Fixing {total} parent_id references across {len(FIXES)} threads\n")

    fixed = 0
    errors = 0

    for thread_id, fixes in FIXES.items():
        comments = fetch_comments(thread_id)
        print(f"Thread: {thread_id} ({len(comments)} comments)")

        num_to_id = {}
        for i, c in enumerate(comments):
            num = i + 2
            num_to_id[num] = c["id"]

        for comment_num, wrong_parent_num, correct_parent_num in fixes:
            comment_id = num_to_id.get(comment_num)
            correct_parent_id = num_to_id.get(correct_parent_num)

            if not comment_id or not correct_parent_id:
                print(f"  ERROR: #{comment_num} or #{correct_parent_num} not found")
                errors += 1
                continue

            actual = comments[comment_num - 2]
            try:
                update_parent(comment_id, correct_parent_id)
                body = actual["body"][:40]
                print(f"  #{comment_num} parent: #{wrong_parent_num} → #{correct_parent_num} OK  \"{body}\"")
                fixed += 1
            except Exception as e:
                print(f"  #{comment_num} ERROR: {e}")
                errors += 1

        print()

    print(f"Done. Fixed: {fixed}, Errors: {errors}")


if __name__ == "__main__":
    main()
