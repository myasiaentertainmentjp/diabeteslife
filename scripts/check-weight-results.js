/**
 * Phase 2: 体重記録投入結果確認
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function check() {
  console.log('=== Phase 2: 体重記録投入結果確認 ===\n')

  // 1. 全体サマリー
  const { data: summary } = await supabase
    .from('weight_records')
    .select('id, user_id')

  const { data: dummyUsers } = await supabase
    .from('users')
    .select('id')
    .eq('is_dummy', true)

  const dummyIds = new Set(dummyUsers?.map(u => u.id) || [])
  const dummyRecords = summary?.filter(r => dummyIds.has(r.user_id)) || []
  const uniqueUsers = new Set(dummyRecords.map(r => r.user_id))

  console.log('=== 全体サマリー ===')
  console.log(`  ダミーユーザーの体重記録数: ${dummyRecords.length}件`)
  console.log(`  体重記録があるダミーユーザー: ${uniqueUsers.size}名`)

  // 2. ユーザー別件数（直接クエリ）
  {
    const { data: records } = await supabase
      .from('weight_records')
      .select('user_id, value, recorded_at')

    const userStats = new Map()
    for (const r of records || []) {
      if (!dummyIds.has(r.user_id)) continue
      if (!userStats.has(r.user_id)) {
        userStats.set(r.user_id, { count: 0, values: [], dates: [] })
      }
      const stats = userStats.get(r.user_id)
      stats.count++
      stats.values.push(r.value)
      stats.dates.push(r.recorded_at)
    }

    // ユーザー名を取得
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', [...userStats.keys()])

    const userNameMap = new Map(users?.map(u => [u.id, u.display_name]) || [])

    console.log('\n=== ユーザー別サマリー ===')
    console.log('ユーザー         | 件数 | 最小   | 最大   | 平均   | 期間')
    console.log('-'.repeat(75))

    const sortedStats = [...userStats.entries()].sort((a, b) => b[1].count - a[1].count)
    for (const [userId, stats] of sortedStats) {
      const name = userNameMap.get(userId) || userId.substring(0, 8)
      const minVal = Math.min(...stats.values)
      const maxVal = Math.max(...stats.values)
      const avgVal = stats.values.reduce((a, b) => a + b, 0) / stats.values.length
      const minDate = stats.dates.sort()[0]
      const maxDate = stats.dates.sort()[stats.dates.length - 1]

      console.log(
        `${name.substring(0, 15).padEnd(15)} | ` +
        `${String(stats.count).padStart(4)} | ` +
        `${minVal.toFixed(1).padStart(5)}kg | ` +
        `${maxVal.toFixed(1).padStart(5)}kg | ` +
        `${avgVal.toFixed(1).padStart(5)}kg | ` +
        `${minDate} 〜 ${maxDate}`
      )
    }
  }

  // 3. 体重値の分布
  const { data: allRecords } = await supabase
    .from('weight_records')
    .select('value, user_id')

  const dummyWeights = allRecords?.filter(r => dummyIds.has(r.user_id)).map(r => r.value) || []

  console.log('\n=== 体重値の分布 ===')
  const ranges = [
    { label: '50kg未満', min: 0, max: 50 },
    { label: '50-60kg', min: 50, max: 60 },
    { label: '60-70kg', min: 60, max: 70 },
    { label: '70-80kg', min: 70, max: 80 },
    { label: '80kg以上', min: 80, max: 200 },
  ]

  for (const range of ranges) {
    const count = dummyWeights.filter(v => v >= range.min && v < range.max).length
    const pct = ((count / dummyWeights.length) * 100).toFixed(1)
    const bar = '█'.repeat(Math.round(count / 10))
    console.log(`  ${range.label.padEnd(10)}: ${String(count).padStart(3)}件 (${pct.padStart(5)}%) ${bar}`)
  }

  console.log('\n✅ 確認完了')
}

check().catch(console.error)
