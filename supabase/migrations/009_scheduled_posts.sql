-- Scheduled posts table for automated dummy content creation
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('thread', 'comment')),
  -- For threads
  title TEXT,
  category TEXT,
  -- For comments
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  -- Common fields
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'cancelled')),
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_scheduled_posts_status_scheduled ON scheduled_posts(status, scheduled_at);
CREATE INDEX idx_scheduled_posts_thread ON scheduled_posts(thread_id) WHERE thread_id IS NOT NULL;

-- Enable RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admin can manage scheduled posts"
  ON scheduled_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to auto-post scheduled content
CREATE OR REPLACE FUNCTION process_scheduled_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  scheduled RECORD;
  new_thread_id UUID;
  comment_count INT;
BEGIN
  FOR scheduled IN
    SELECT * FROM scheduled_posts
    WHERE status = 'pending'
    AND scheduled_at <= NOW()
    ORDER BY scheduled_at ASC
  LOOP
    IF scheduled.type = 'thread' THEN
      -- Insert new thread
      INSERT INTO threads (user_id, title, content, category, status)
      VALUES (scheduled.user_id, scheduled.title, scheduled.content, scheduled.category, 'normal')
      RETURNING id INTO new_thread_id;

      -- Update scheduled post
      UPDATE scheduled_posts
      SET status = 'posted', posted_at = NOW(), updated_at = NOW()
      WHERE id = scheduled.id;

    ELSIF scheduled.type = 'comment' THEN
      -- Insert new comment
      INSERT INTO comments (thread_id, user_id, body)
      VALUES (scheduled.thread_id, scheduled.user_id, scheduled.content);

      -- Update thread comments count
      SELECT COUNT(*) INTO comment_count
      FROM comments WHERE thread_id = scheduled.thread_id;

      UPDATE threads
      SET comments_count = comment_count, updated_at = NOW()
      WHERE id = scheduled.thread_id;

      -- Update scheduled post
      UPDATE scheduled_posts
      SET status = 'posted', posted_at = NOW(), updated_at = NOW()
      WHERE id = scheduled.id;
    END IF;
  END LOOP;
END;
$$;
