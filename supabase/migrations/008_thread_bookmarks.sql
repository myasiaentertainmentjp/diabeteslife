-- Create thread_bookmarks table
CREATE TABLE IF NOT EXISTS thread_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, thread_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_thread_bookmarks_user_id ON thread_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_bookmarks_thread_id ON thread_bookmarks(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_bookmarks_created_at ON thread_bookmarks(created_at DESC);

-- Enable RLS
ALTER TABLE thread_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON thread_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can create own bookmarks" ON thread_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON thread_bookmarks
  FOR DELETE USING (auth.uid() = user_id);
