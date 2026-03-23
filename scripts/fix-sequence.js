/**
 * thread_number シーケンスの状態確認と修正
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function diagnose() {
  console.log('=== thread_number シーケンス診断 ===\n')

  // 1. 現在の最大thread_number取得
  const { data: maxData } = await supabase
    .from('threads')
    .select('thread_number')
    .order('thread_number', { ascending: false })
    .limit(1)
    .single()

  console.log('現在の最大 thread_number:', maxData?.thread_number || 'なし')

  // 2. thread_number の分布確認
  const { data: countData } = await supabase
    .from('threads')
    .select('id', { count: 'exact', head: true })

  console.log('総スレッド数:', countData)

  // 3. 直近のスレッド確認
  const { data: recentThreads } = await supabase
    .from('threads')
    .select('id, thread_number, title, mode, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('\n=== 直近5件のスレッド ===')
  for (const t of recentThreads || []) {
    console.log(`  #${t.thread_number}: "${t.title?.substring(0,20)}" (${t.mode}) - ${t.created_at?.slice(0,10)}`)
  }

  // 4. diary mode のスレッド確認
  const { data: diaryThreads, count: diaryCount } = await supabase
    .from('threads')
    .select('id, thread_number, user_id, title', { count: 'exact' })
    .eq('mode', 'diary')

  console.log('\n=== diary モードのスレッド ===')
  console.log(`  総数: ${diaryCount || 0}件`)
  if (diaryThreads?.length > 0) {
    for (const t of diaryThreads.slice(0, 5)) {
      console.log(`  #${t.thread_number}: ${t.title}`)
    }
  }

  // 5. テスト挿入（ロールバック）
  console.log('\n=== テスト挿入を試みる ===')
  const testInsert = await supabase
    .from('threads')
    .insert({
      user_id: '9516c386-2cc6-53ba-8691-396ed2abff89', // たこ🐙
      title: 'テストスレッド（削除予定）',
      body: 'テスト',
      category: 'chat_other',
      mode: 'normal',
    })
    .select('id, thread_number')
    .single()

  if (testInsert.error) {
    console.log('  エラー:', testInsert.error.message)
    console.log('  → シーケンスがズレている可能性あり')
  } else {
    console.log('  成功: thread_number =', testInsert.data.thread_number)
    // 削除
    await supabase.from('threads').delete().eq('id', testInsert.data.id)
    console.log('  テストスレッドを削除しました')
  }
}

diagnose().catch(console.error)
