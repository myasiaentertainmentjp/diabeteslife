import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const threadNumber = parseInt(process.argv[2]) || 918

async function check() {
  const { data: thread, error } = await supabase
    .from('threads')
    .select('*')
    .eq('thread_number', threadNumber)
    .single()

  if (error || thread === null) {
    console.log('Thread', threadNumber, 'not found:', error?.message)
    return
  }

  const { data: author } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', thread.user_id)
    .single()

  console.log('='.repeat(60))
  console.log('スレッド #' + thread.thread_number + ':', thread.title)
  console.log('作成者:', author?.display_name)
  console.log('内容:', thread.body)
  console.log('作成日:', thread.created_at)
  console.log('-'.repeat(40))

  const { data: comments } = await supabase
    .from('comments')
    .select('id, body, created_at, user_id')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })
    .limit(25)

  let num = 1
  for (const c of comments || []) {
    const { data: commenter } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', c.user_id)
      .single()

    console.log('[#' + num + ' ' + c.created_at?.substring(0, 16) + '] ' + (commenter?.display_name || 'Unknown'))
    console.log(c.body)
    console.log('')
    num++
  }
}

check()
