#!/usr/bin/env python3
"""
Fetch all comments for threads 1-9 and output them with parent chain info.
Also detect potential parent_id issues (A->B->C where C should reply to A not B).
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

THREADS = [
    ("a0000001-1215-0001-0001-000000000001", "1. 今日の血糖値どうだった"),
    ("a0000001-0110-0007-0001-000000000001", "2. 糖尿病に気づいたきっかけ"),
    ("a0000001-0108-0002-0001-000000000001", "3. 糖尿病の人、語りませんか"),
    ("a0000001-0115-0007-0001-000000000002", "4. 初心者です。質問させてください"),
    ("a0000001-0108-0001-0001-000000000001", "5. 彼氏が糖尿病と診断されました"),
    ("a0000001-0120-0001-0001-000000000001", "6. 糖尿病と診断されました"),
    ("a0000001-1220-0007-0001-000000000001", "7. 低血糖による悩み"),
    ("a0000001-0112-0001-0001-000000000001", "8. 1型糖尿病です"),
    ("a0000001-1215-0004-0001-000000000001", "9. 診断されたばかりで不安です"),
]


def fetch_comments(thread_id):
    params = urllib.parse.urlencode({
        "thread_id": f"eq.{thread_id}",
        "select": "id,body,created_at,parent_id,user_id",
        "order": "created_at.asc",
        "limit": "1000",
    })
    url = f"{SUPABASE_URL}/rest/v1/comments?{params}"
    headers = {**HEADERS, "Prefer": "return=representation"}
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def main():
    all_suspects = []

    for thread_id, thread_name in THREADS:
        comments = fetch_comments(thread_id)
        if not comments:
            print(f"\n{'='*80}")
            print(f"{thread_name} - コメントなし")
            continue

        # Build mappings
        id_to_num = {}
        num_to_comment = {}
        for i, c in enumerate(comments):
            num = i + 2
            id_to_num[c["id"]] = num
            num_to_comment[num] = c

        print(f"\n{'='*80}")
        print(f"{thread_name} ({len(comments)}件)")
        print(f"{'='*80}")
        print(f"{'番号':>4} {'リプライ先':>8} 本文")
        print(f"{'-'*4} {'-'*8} {'-'*60}")

        for i, c in enumerate(comments):
            num = i + 2
            parent_num = id_to_num.get(c["parent_id"], "") if c["parent_id"] else ""
            body = c["body"][:60]
            print(f"{num:>4} {str(parent_num):>8} {body}")

        # Detect suspect patterns: A->B->C chains where C might need to reply to A
        print(f"\n  --- 要確認パターン検出 ---")
        suspects_found = 0

        for i, c in enumerate(comments):
            num = i + 2
            if not c["parent_id"]:
                continue

            parent_num = id_to_num.get(c["parent_id"])
            if not parent_num:
                continue

            parent = num_to_comment.get(parent_num)
            if not parent or not parent["parent_id"]:
                continue

            # C (num) replies to B (parent_num), B replies to A (grandparent_num)
            grandparent_num = id_to_num.get(parent["parent_id"])
            if not grandparent_num:
                continue

            grandparent = num_to_comment.get(grandparent_num)
            if not grandparent:
                continue

            # Pattern: C is answering A's question/statement via B
            # Heuristic: B contains a question mark (B asks a question about A)
            # and C answers it (C should reply to A, not B)
            b_body = parent["body"]
            c_body = c["body"]
            a_body = grandparent["body"]

            is_suspect = False
            reason = ""

            # Pattern 1: B asks a question, C answers
            if "？" in b_body or "?" in b_body:
                # C doesn't ask a question (it's an answer)
                if "？" not in c_body and "?" not in c_body:
                    is_suspect = True
                    reason = "Bが質問→Cが回答（Aに返すべき？）"

            # Pattern 2: C and A have same user (original poster answering back)
            if c["user_id"] == grandparent["user_id"]:
                is_suspect = True
                reason = "CとAが同じユーザー（元の投稿者が回答）"

            if is_suspect:
                suspects_found += 1
                print(f"  #{num}: parent #{parent_num}→#{grandparent_num}？ [{reason}]")
                print(f"    A(#{grandparent_num}): {a_body[:50]}")
                print(f"    B(#{parent_num}): {b_body[:50]}")
                print(f"    C(#{num}): {c_body[:50]}")
                print()
                all_suspects.append((thread_name, num, parent_num, grandparent_num, c_body[:40]))

        if suspects_found == 0:
            print("  問題なし")

    print(f"\n{'='*80}")
    print(f"全体サマリー: {len(all_suspects)}件の要確認パターン")
    print(f"{'='*80}")
    for name, num, parent, gp, body in all_suspects:
        print(f"  {name} #{num}: #{parent}→#{gp}? \"{body}\"")


if __name__ == "__main__":
    main()
