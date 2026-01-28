#!/usr/bin/env python3
"""
Fix HbA1c records: replace f0000001-... user_ids with real user_ids.
1. Delete all f-series HbA1c records
2. Insert new records with real user_ids
   - Medium active (10 users): 2 records (Dec + Feb)
   - Low active (29 users): 1 record
"""

import uuid
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

# 39 real user_ids (from DB, excluding b-series, f-series, Ash)
REAL_USERS_39 = [
    # Medium active (10 users) - 2 records each
    "4fb9908c-2402-5bdf-8b87-88df11efe632",  # ゆきうさぎ
    "3211a927-441e-502b-9535-cfe0280e4057",  # @SAKAE_21_
    "d9a76314-7db0-5532-bd35-0cfeebe3e2ee",  # It's Yuna
    "7cd053a6-e460-52c3-81f6-ded93d87d880",  # PJ
    "e5f74d4f-1bea-53de-90bd-d3c5733a47b4",  # Rüü13w
    "bc646570-4489-534b-87f2-93f0abf096dc",  # Y2
    "e8e0f73a-f9d5-5379-9058-8eaf4872a774",  # Yingzi
    "f8ca7b99-483b-5f6f-81ca-5c49feefe26c",  # hotaru
    "17694ffc-1fbd-5f8f-b2cf-a81cf6ee2ce9",  # macha
    "bc10f0b9-46d0-5305-b580-6515daecfd6b",  # mimi
    # Low active (29 users) - 1 record each
    "98642539-3f0f-5bdc-bbd3-2bffe66aa582",  # my
    "eeae7c99-d6f3-5764-9451-620ee952f96f",  # ドラファン
    "41cf3d7f-9ac1-5151-9417-c3bfa7afeda0",  # 仲夏トト
    "d2851c1b-67bd-5b56-b626-a9a5b1abf2f8",  # 木村
    "9344cb98-2361-56ea-a4d5-6f6101210fd7",  # 根なし草
    "41a81305-9897-5aa9-b325-0c7f681b7c97",  # 桃の香り
    "3241ef30-a9f0-57da-9964-5a96b5c6a866",  # 水野稔
    "96937524-4ebf-5bda-967c-3e084b23e499",  # 海
    "ba9dfd77-9d78-5bc6-9f60-fbc7e77bab8c",  # 熊谷！
    "08b928d5-48dd-530a-a87f-c99f9be17971",  # 猫好き
    "ca8c6399-e8e8-5017-af1a-c511399b7744",  # 玉子のキミ
    "e6e3718c-940b-54e8-a692-b52994e5e180",  # 田中 浩二
    "c2017cda-6de9-51d3-a94b-e4c78b039b04",  # 疾风姬
    "e0ec614c-0aff-5a4a-87c3-f878ce473223",  # 空
    "cd693bf4-c3ed-5e8b-8fd0-535963c48edc",  # 競艇で全財産を失った男
    "a1f53675-dfb1-5b0d-a2af-9c3c4d6f0f3c",  # 花火
    "52eddc2c-aa88-5e62-a227-139b8887696c",  # 花音hanon
    "fddb74d3-c7d7-589f-9784-601ddd953328",  # 葉子
    "6ebedde7-2e85-5f10-84e8-16307a673e55",  # 赤べこ
    "2647fa01-ac27-5b58-96be-e567fead551c",  # 野瀬邦彦
    "13607a57-414a-5765-9db7-c58fae031a11",  # 金太
    "b3688c70-36eb-5394-85e5-b08cbdbe822f",  # 陸奥 出海
    "f9fe40f7-4381-5d33-b86a-731ce010559f",  # 雷之佳
    "5a3ee246-2604-53d4-9d80-5339b63e6e29",  # 青空の夢
    "29aa12a3-5b45-5eef-8f08-da041c6be2f2",  # 鳥
    "27de7033-665e-5060-bafa-e4aed971e69c",  # 麻衣子@1型
    "b02921d4-bde7-5ba4-a168-1decd78198c9",  # Ｋ太郎
    "74add5f1-95a6-5921-a0ca-fd35cbaea101",  # ﾂﾅ
    "6e154da6-a74d-5e23-a713-60af9a9b3619",  # 𝓑
]

# Medium active: 10 users × 2 records (Dec, Feb)
MEDIUM_VALUES = [
    (7.6, 7.3),  # user 0
    (8.3, 7.8),  # user 1
    (6.1, 6.0),  # user 2
    (7.9, 7.5),  # user 3
    (5.7, 5.6),  # user 4
    (8.1, 7.6),  # user 5
    (6.9, 6.7),  # user 6
    (7.3, 7.1),  # user 7
    (8.7, 8.2),  # user 8
    (6.5, 6.4),  # user 9
]

# Low active: 29 users × 1 record
LOW_VALUES = [
    ("2025-12", 6.4),
    ("2025-12", 8.1),
    ("2026-02", 7.3),
    ("2025-12", 5.9),
    ("2026-01", 7.7),
    ("2025-12", 6.7),
    ("2026-02", 8.0),
    ("2025-12", 7.1),
    ("2026-01", 6.5),
    ("2025-12", 7.7),
    ("2026-01", 6.2),
    ("2025-12", 8.4),
    ("2026-02", 7.0),
    ("2025-12", 5.8),
    ("2026-01", 7.5),
    ("2025-12", 6.6),
    ("2026-02", 8.2),
    ("2025-12", 7.2),
    ("2026-01", 6.8),
    ("2025-12", 7.4),
    ("2026-01", 6.3),
    ("2025-12", 8.0),
    ("2026-02", 6.9),
    ("2025-12", 5.6),
    ("2026-01", 7.8),
    ("2025-12", 6.5),
    ("2026-02", 7.6),
    ("2025-12", 7.0),
    ("2026-01", 6.1),
]


def delete_fseries():
    """Delete all HbA1c records where user_id is f0000001-..."""
    # All f-series user_ids that had HbA1c records
    f_users = [
        "f0000001-0000-0000-0000-000000000001",
        "f0000001-0000-0000-0000-000000000002",
        "f0000001-0000-0000-0000-000000000003",
        "f0000001-0000-0000-0000-000000000004",
        "f0000001-0000-0000-0000-000000000005",
        "f0000001-0000-0000-0000-000000000006",
        "f0000001-0000-0000-0000-000000000008",
        "f0000001-0000-0000-0000-000000000009",
        "f0000001-0000-0000-0000-000000000010",
        "f0000001-0000-0000-0000-000000000011",
        "f0000001-0000-0000-0000-000000000012",
        "f0000001-0000-0000-0000-000000000013",
        "f0000001-0000-0000-0000-000000000014",
        "f0000001-0000-0000-0000-000000000015",
        "f0000001-0000-0000-0000-000000000016",
        "f0000001-0000-0000-0000-000000000017",
        "f0000001-0000-0000-0000-000000000018",
        "f0000001-0000-0000-0000-000000000019",
        "f0000001-0000-0000-0000-000000000020",
        "f0000001-0000-0000-0000-000000000021",
        "f0000001-0000-0000-0000-000000000022",
        "f0000001-0000-0000-0000-000000000023",
        "f0000001-0000-0000-0000-000000000024",
        "f0000001-0000-0000-0000-000000000025",
        "f0000001-0000-0000-0000-000000000026",
        "f0000001-0000-0000-0000-000000000027",
        "f0000001-0000-0000-0000-000000000028",
        "f0000001-0000-0000-0000-000000000029",
        "f0000001-0000-0000-0000-000000000030",
    ]
    in_list = ",".join(f_users)
    total_deleted = 0

    # Delete using in operator
    params = urllib.parse.urlencode({
        "user_id": f"in.({in_list})",
    })
    url = f"{SUPABASE_URL}/rest/v1/hba1c_records?{params}"
    headers_del = {**HEADERS, "Prefer": "return=representation"}
    req = urllib.request.Request(url, headers=headers_del, method="DELETE")
    try:
        with urllib.request.urlopen(req) as resp:
            deleted = json.loads(resp.read().decode())
            total_deleted = len(deleted)
            print(f"  Deleted {total_deleted} f-series records")
    except urllib.error.HTTPError as e:
        print(f"  DELETE ERROR: {e.code} - {e.read().decode()}")
    return total_deleted


def insert_batch(records, batch_num):
    url = f"{SUPABASE_URL}/rest/v1/hba1c_records"
    headers = {**HEADERS, "Prefer": "return=minimal"}
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
    # Step 1: Delete f-series records
    print("Step 1: Deleting f-series HbA1c records...")
    deleted = delete_fseries()
    print()

    # Step 2: Build new records
    print("Step 2: Building new records with real user_ids...")
    new_records = []

    # Medium active (first 10 users): Dec + Feb
    for i in range(10):
        uid = REAL_USERS_39[i]
        dec_val, feb_val = MEDIUM_VALUES[i]
        new_records.append({
            "id": str(uuid.uuid4()),
            "user_id": uid,
            "recorded_at": "2025-12-01",
            "value": dec_val,
            "is_public": True,
            "memo": None,
        })
        new_records.append({
            "id": str(uuid.uuid4()),
            "user_id": uid,
            "recorded_at": "2026-02-01",
            "value": feb_val,
            "is_public": True,
            "memo": None,
        })

    # Low active (next 29 users): 1 record each
    for i in range(29):
        uid = REAL_USERS_39[10 + i]
        month, val = LOW_VALUES[i]
        new_records.append({
            "id": str(uuid.uuid4()),
            "user_id": uid,
            "recorded_at": f"{month}-01",
            "value": val,
            "is_public": True,
            "memo": None,
        })

    print(f"  Medium: 10 users × 2 = 20 records")
    print(f"  Low: 29 users × 1 = 29 records")
    print(f"  Total: {len(new_records)} records")
    print()

    # Step 3: Insert
    print("Step 3: Inserting new records...")
    BATCH_SIZE = 50
    for i in range(0, len(new_records), BATCH_SIZE):
        batch = new_records[i:i+BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        if not insert_batch(batch, batch_num):
            print("STOPPING due to error")
            return

    print(f"\nDone! Deleted {deleted} old records, inserted {len(new_records)} new records.")
    print(f"Total HbA1c users: 30 (b-series+Ash) + 39 (real) = 69 users")


if __name__ == "__main__":
    main()
