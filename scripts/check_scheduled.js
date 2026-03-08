const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://josanlblwfjdaaezqbnw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'
)

async function checkScheduled() {
  const now = new Date().toISOString()

  // 未来の日付のスレッド
  const { data: threads, error: threadError } = await supabase
    .from('threads')
    .select('id, thread_number, title, created_at')
    .gt('created_at', now)
    .order('created_at', { ascending: true })

  console.log('=== 予約スレッド ===')
  if (threadError) {
    console.log('Error:', threadError.message)
  } else {
    console.log('件数:', threads ? threads.length : 0)
    if (threads) {
      threads.slice(0, 5).forEach(t => {
        console.log('  #' + t.thread_number + ': ' + t.title + ' (' + t.created_at + ')')
      })
      if (threads.length > 5) console.log('  ... 他 ' + (threads.length - 5) + '件')
    }
  }

  // 未来の日付のコメント
  const { data: comments, error: commentError } = await supabase
    .from('comments')
    .select('id, thread_id, body, created_at, threads:thread_id(thread_number, title)')
    .gt('created_at', now)
    .order('created_at', { ascending: true })

  console.log('\n=== 予約コメント ===')
  if (commentError) {
    console.log('Error:', commentError.message)
  } else {
    console.log('件数:', comments ? comments.length : 0)
    if (comments) {
      comments.slice(0, 10).forEach((c, i) => {
        const threadInfo = Array.isArray(c.threads) ? c.threads[0] : c.threads
        console.log('  [' + (i+1) + '] スレッド#' + (threadInfo ? threadInfo.thread_number : '?') + ' (' + c.created_at + ')')
        console.log('      "' + (c.body ? c.body.substring(0, 60) : '') + '..."')
      })
      if (comments.length > 10) console.log('  ... 他 ' + (comments.length - 10) + '件')
    }
  }

  // 最後の予約投稿日
  console.log('\n=== 予約投稿の最終日 ===')
  if (threads && threads.length > 0) {
    const lastThread = threads[threads.length - 1]
    console.log('スレッド: ' + lastThread.created_at)
  }
  if (comments && comments.length > 0) {
    const lastComment = comments[comments.length - 1]
    console.log('コメント: ' + lastComment.created_at)
  }
}

checkScheduled().catch(console.error)
