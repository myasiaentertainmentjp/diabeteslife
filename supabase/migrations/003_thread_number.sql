-- Add thread_number column for cleaner URLs
-- Run this in Supabase SQL Editor

-- 1. Add thread_number column
ALTER TABLE threads ADD COLUMN IF NOT EXISTS thread_number SERIAL;

-- 2. Create unique index on thread_number
CREATE UNIQUE INDEX IF NOT EXISTS threads_thread_number_idx ON threads(thread_number);

-- 3. Update existing threads to have sequential numbers based on created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM threads
)
UPDATE threads
SET thread_number = numbered.rn
FROM numbered
WHERE threads.id = numbered.id;

-- 4. Reset sequence to continue from max
SELECT setval(
  pg_get_serial_sequence('threads', 'thread_number'),
  COALESCE((SELECT MAX(thread_number) FROM threads), 0) + 1,
  false
);
