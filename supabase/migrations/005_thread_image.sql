-- 005: Add image support to threads
-- Run this in Supabase SQL Editor

-- threads テーブルに画像URLカラムを追加
ALTER TABLE threads
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- インデックス追加（オプション）
CREATE INDEX IF NOT EXISTS idx_threads_image_url ON threads(image_url) WHERE image_url IS NOT NULL;
