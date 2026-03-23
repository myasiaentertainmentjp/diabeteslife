/**
 * ダミーユーザーの活動量を直接計算して層分けを確認
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function check() {
  console.log('=== ダミーユーザー活動量分析 ===\n')

  // 1. ダミーユーザー取得
  const { data: dummyUsers } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('is_dummy', true)

  const userIds = dummyUsers?.map(u => u.id) || []

  // 2. プロフィール取得
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, diabetes_type, bio')
    .in('user_id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

  // 3. 活動データ取得
  const { data: threads } = await supabase
    .from('threads')
    .select('id, user_id')
    .in('user_id', userIds)

  const { data: comments } = await supabase
    .from('comments')
    .select('id, user_id')
    .in('user_id', userIds)

  const { data: mealPosts } = await supabase
    .from('meal_posts')
    .select('id, user_id')
    .in('user_id', userIds)

  const { data: weightRecords } = await supabase
    .from('weight_records')
    .select('id, user_id')
    .in('user_id', userIds)

  const { data: hba1cRecords } = await supabase
    .from('hba1c_records')
    .select('id, user_id')
    .in('user_id', userIds)

  const { data: diaryEntries } = await supabase
    .from('diary_entries')
    .select('id, user_id')
    .in('user_id', userIds)

  // 4. ユーザーごとのスコア計算
  const userScores = []

  for (const u of dummyUsers || []) {
    const profile = profileMap.get(u.id)
    const threadCount = threads?.filter(t => t.user_id === u.id).length || 0
    const commentCount = comments?.filter(c => c.user_id === u.id).length || 0
    const mealCount = mealPosts?.filter(m => m.user_id === u.id).length || 0
    const weightCount = weightRecords?.filter(w => w.user_id === u.id).length || 0
    const hba1cCount = hba1cRecords?.filter(h => h.user_id === u.id).length || 0
    const diaryCount = diaryEntries?.filter(d => d.user_id === u.id).length || 0

    // スコア計算
    const score =
      threadCount * 10 +
      commentCount * 3 +
      mealCount * 8 +
      weightCount * 1 +
      hba1cCount * 2 +
      diaryCount * 2

    // 層分類
    let tier = 'read_only'
    if (score >= 50 && threadCount >= 1 && commentCount >= 3) {
      tier = 'core'
    } else if ((threadCount > 0 || commentCount > 0) && score >= 20) {
      tier = 'semi_active'
    } else if (hba1cCount > 0 || (profile?.bio?.length || 0) > 10) {
      tier = 'light'
    }

    userScores.push({
      id: u.id,
      name: u.display_name,
      type: profile?.diabetes_type || '-',
      threads: threadCount,
      comments: commentCount,
      meals: mealCount,
      weight: weightCount,
      hba1c: hba1cCount,
      diary: diaryCount,
      score,
      tier,
    })
  }

  // 5. 層別集計
  const tierCounts = { core: 0, semi_active: 0, light: 0, read_only: 0 }
  for (const u of userScores) {
    tierCounts[u.tier]++
  }

  console.log('=== 層別分布 ===')
  console.log('  コア (core):', tierCounts.core, '名')
  console.log('  準アクティブ (semi_active):', tierCounts.semi_active, '名')
  console.log('  ライト (light):', tierCounts.light, '名')
  console.log('  閲覧専用 (read_only):', tierCounts.read_only, '名')

  // 6. 層別ユーザー一覧
  const sorted = userScores.sort((a, b) => b.score - a.score)

  console.log('\n=== コア層（食事画像 優先配布対象）===')
  const coreUsers = sorted.filter(u => u.tier === 'core')
  console.log('名前           | Type   | スレ | コメ | 食事 | スコア')
  console.log('-'.repeat(60))
  for (const u of coreUsers.slice(0, 20)) {
    console.log(`${(u.name || '').substring(0, 12).padEnd(12)} | ${(u.type || '-').padEnd(6)} | ${String(u.threads).padStart(4)} | ${String(u.comments).padStart(4)} | ${String(u.meals).padStart(4)} | ${String(u.score).padStart(5)}`)
  }

  console.log('\n=== 準アクティブ層（食事画像 配布候補）===')
  const semiUsers = sorted.filter(u => u.tier === 'semi_active')
  console.log('名前           | Type   | スレ | コメ | 食事 | スコア')
  console.log('-'.repeat(60))
  for (const u of semiUsers.slice(0, 10)) {
    console.log(`${(u.name || '').substring(0, 12).padEnd(12)} | ${(u.type || '-').padEnd(6)} | ${String(u.threads).padStart(4)} | ${String(u.comments).padStart(4)} | ${String(u.meals).padStart(4)} | ${String(u.score).padStart(5)}`)
  }

  // 7. 食事画像配分シミュレーション
  console.log('\n=== 食事画像配分シミュレーション（70枚想定）===')

  const allocation = {
    core: { users: coreUsers.slice(0, 12), perUser: '4-8枚', total: '48-60枚' },
    semi_active: { users: semiUsers.slice(0, 5), perUser: '2-4枚', total: '10-20枚' },
  }

  console.log('\nコア層（12名）: 一人あたり4-8枚 → 合計48-60枚')
  for (const u of allocation.core.users) {
    console.log(`  ${u.name}`)
  }

  console.log('\n準アクティブ層（5名）: 一人あたり2-4枚 → 合計10-20枚')
  for (const u of allocation.semi_active.users) {
    console.log(`  ${u.name}`)
  }

  console.log('\nライト層・閲覧専用: 0枚（食事画像は配布しない）')

  console.log('\n✅ 分析完了')
}

check().catch(console.error)
