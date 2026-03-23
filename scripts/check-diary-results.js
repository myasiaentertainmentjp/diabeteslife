/**
 * Phase 3: 日記記録投入結果確認
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function check() {
  console.log('=== Phase 3: 日記記録投入結果確認 ===\n')

  // 1. ダミーユーザー取得
  const { data: dummyUsers } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('is_dummy', true)

  const dummyIds = new Set(dummyUsers?.map(u => u.id) || [])
  const userNameMap = new Map(dummyUsers?.map(u => [u.id, u.display_name]) || [])

  // 2. 日記スレッド取得
  const { data: diaryThreads } = await supabase
    .from('threads')
    .select('id, user_id, title, created_at')
    .eq('mode', 'diary')

  const dummyDiaryThreads = diaryThreads?.filter(t => dummyIds.has(t.user_id)) || []

  // 3. 日記エントリ取得
  const threadIds = dummyDiaryThreads.map(t => t.id)
  let diaryEntries = []
  if (threadIds.length > 0) {
    const { data } = await supabase
      .from('diary_entries')
      .select('id, thread_id, user_id, content, created_at')
      .in('thread_id', threadIds)
    diaryEntries = data || []
  }

  console.log('=== 全体サマリー ===')
  console.log(`  日記スレッドを持つダミーユーザー: ${dummyDiaryThreads.length}名`)
  console.log(`  ダミーユーザーの日記エントリ数: ${diaryEntries.length}件`)

  // 4. ユーザー別集計
  const userStats = new Map()
  for (const entry of diaryEntries) {
    if (!userStats.has(entry.user_id)) {
      userStats.set(entry.user_id, { count: 0, entries: [], dates: [] })
    }
    const stats = userStats.get(entry.user_id)
    stats.count++
    stats.entries.push(entry.content)
    stats.dates.push(entry.created_at)
  }

  console.log('\n=== ユーザー別サマリー ===')
  console.log('ユーザー         | 件数 | 期間')
  console.log('-'.repeat(60))

  const sortedStats = [...userStats.entries()].sort((a, b) => b[1].count - a[1].count)
  for (const [userId, stats] of sortedStats) {
    const name = userNameMap.get(userId) || userId.substring(0, 8)
    const minDate = stats.dates.sort()[0]
    const maxDate = stats.dates.sort()[stats.dates.length - 1]

    console.log(
      `${name.substring(0, 15).padEnd(15)} | ${String(stats.count).padStart(4)} | ` +
      `${minDate.slice(0, 10)} 〜 ${maxDate.slice(0, 10)}`
    )
  }

  // 5. 月別分布
  const monthCounts = new Map()
  for (const entry of diaryEntries) {
    const month = entry.created_at.slice(0, 7)
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
  }

  console.log('\n=== 月別分布 ===')
  const sortedMonths = [...monthCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  for (const [month, count] of sortedMonths) {
    const bar = '█'.repeat(Math.round(count / 3))
    console.log(`  ${month}: ${String(count).padStart(3)}件 ${bar}`)
  }

  // 6. 内容の長さ分布
  const lengthDist = { short: 0, medium: 0, long: 0 }
  for (const entry of diaryEntries) {
    const len = entry.content.length
    if (len < 15) lengthDist.short++
    else if (len < 30) lengthDist.medium++
    else lengthDist.long++
  }

  console.log('\n=== 内容の長さ分布 ===')
  console.log(`  短文(15文字未満): ${lengthDist.short}件`)
  console.log(`  普通(15-30文字): ${lengthDist.medium}件`)
  console.log(`  長め(30文字以上): ${lengthDist.long}件`)

  // 7. サンプルエントリ表示
  console.log('\n=== サンプルエントリ（最新3件）===')
  const recentEntries = diaryEntries
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3)

  for (const entry of recentEntries) {
    const name = userNameMap.get(entry.user_id) || '不明'
    console.log(`  [${entry.created_at.slice(0, 10)}] ${name}: "${entry.content}"`)
  }

  console.log('\n✅ 確認完了')
}

check().catch(console.error)
