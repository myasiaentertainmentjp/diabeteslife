#!/usr/bin/env python3
"""Create 30 additional dummy users (users + profiles tables)."""

import json
import urllib.request
import random

SUPABASE_URL = "https://josanlblwfjdaaezqbnw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY"

# 30 new users to create
NEW_USERS = [
    # b series: 021-030
    "b0000001-0000-0000-0000-000000000021",
    "b0000001-0000-0000-0000-000000000022",
    "b0000001-0000-0000-0000-000000000023",
    "b0000001-0000-0000-0000-000000000024",
    "b0000001-0000-0000-0000-000000000025",
    "b0000001-0000-0000-0000-000000000026",
    "b0000001-0000-0000-0000-000000000027",
    "b0000001-0000-0000-0000-000000000028",
    "b0000001-0000-0000-0000-000000000029",
    "b0000001-0000-0000-0000-000000000030",
    # f series: 011-030
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

DISPLAY_NAMES = [
    "ゆうき", "はるか", "そうた", "あかり", "けんた",
    "みさき", "たくや", "さくら", "こうへい", "なつみ",
    "りょう", "まいか", "しゅん", "ことね", "だいき",
    "あおい", "ゆうた", "ひなた", "かいと", "のぞみ",
    "れん", "ちはる", "あきら", "みずき", "しょうた",
    "ゆい", "はやと", "まなみ", "こうき", "さやか",
]

DIABETES_TYPES = ["type1", "type2", "type2", "type2", "prediabetes"]
TREATMENTS_OPTIONS = [
    ["insulin"],
    ["oral_medication"],
    ["oral_medication", "diet_therapy"],
    ["diet_therapy", "exercise_therapy"],
    ["insulin", "diet_therapy"],
    ["oral_medication", "exercise_therapy"],
    ["glp1"],
]
AGE_GROUPS = ["20s", "30s", "40s", "50s", "60s"]
GENDERS = ["male", "female", "other", "private"]


def insert_batch(table, records, batch_num):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
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
            print(f"  {table} batch {batch_num}: {resp.status} - {len(records)} records")
            return True
    except urllib.error.HTTPError as e:
        print(f"  {table} batch {batch_num}: ERROR {e.code} - {e.read().decode()}")
        return False


def main():
    print(f"Creating {len(NEW_USERS)} dummy users\n")

    # 1. Insert into users table (skip - already created in previous run)
    print("Step 1: Users already created in previous run, skipping...")

    # 2. Insert into user_profiles table
    print("\nStep 2: Creating user_profiles...")
    profile_records = []
    for i, uid in enumerate(NEW_USERS):
        profile_records.append({
            "user_id": uid,
            "display_name": DISPLAY_NAMES[i],
            "diabetes_type": random.choice(DIABETES_TYPES),
            "treatment": random.choice(TREATMENTS_OPTIONS),
            "age_group": random.choice(AGE_GROUPS),
            "gender": random.choice(GENDERS),
            "hba1c_public": True,
            "is_public": True,
        })

    if not insert_batch("user_profiles", profile_records, 1):
        print("STOPPING: Failed to create profiles")
        return

    print(f"\nAll {len(NEW_USERS)} dummy users created!")


if __name__ == "__main__":
    main()
