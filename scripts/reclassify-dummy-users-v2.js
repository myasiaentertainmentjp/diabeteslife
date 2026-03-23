/**
 * Phase 1: ダミーユーザー層再定義スクリプト v2
 * 閾値を調整して目標分布に近づける
 * Usage: node scripts/reclassify-dummy-users-v2.js
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * 新スコアリングルール v2（活動実績重視）
 *
 * 【調整ポイント】
 * - プロフィール: 最大10点（基本情報のみ）
 * - 活動実績: 最大90点（投稿・コメント・記録を重視）
 */
function calculateNewScore(user, profile, hba1c, weight, diary, threads, comments) {
  let score = 0

  // === プロフィール基礎点（最大10点）===
  if (user.display_name) score += 3
  if (profile.diabetes_type) score += 3
  if (profile.bio && profile.bio.length > 10) score += 2
  if (profile.treatment_methods?.length > 0 || profile.treatment?.length > 0) score += 2

  // === 活動実績（最大90点）===

  // 投稿（スレッド作成）: 1件=10点、最大30点
  score += Math.min(threads * 10, 30)

  // コメント: 1件=3点、最大30点
  score += Math.min(comments * 3, 30)

  // HbA1c記録: 1件=2点、最大20点
  score += Math.min(hba1c * 2, 20)

  // 体重記録: 1件=1点、最大5点
  score += Math.min(weight, 5)

  // 日記記録: 1件=1点、最大5点
  score += Math.min(diary, 5)

  return score
}

/**
 * 新しい層判定ルール v2
 *
 * 目標分布:
 * - コア: 20-30名
 * - 準アクティブ: 40-50名
 * - ライト: 60-80名
 * - 閲覧専用: 40-50名
 *
 * 【v1からの調整】
 * - 準アクティブの条件を厳しく: 投稿またはコメントが必須（HbA1c記録だけでは不可）
 * - ライトの条件を緩く: HbA1c記録1件以上、またはプロフィール充実
 * - 閲覧専用: HbA1c記録なし AND プロフィール最小限
 */
function determineTier(score, threads, comments, hba1c, profile) {
  // 活動実績
  const hasThreads = threads >= 1
  const hasComments = comments >= 1
  const hasActivity = hasThreads || hasComments
  const hasMultipleComments = comments >= 3

  // 記録
  const hasHba1c = hba1c >= 1
  const hasGoodHba1c = hba1c >= 5

  // プロフィール
  const hasProfile = profile.diabetes_type && (profile.bio?.length > 10 || profile.treatment_methods?.length > 0)

  // コア: 高スコア + 投稿1件以上 + コメント3件以上
  // → 投稿とコメント両方の実績がある活発なユーザー
  if (score >= 50 && hasThreads && hasMultipleComments) {
    return 'コア'
  }

  // 準アクティブ: 何らかの活動（投稿orコメント）がある
  // → 記録だけではダメ、実際にコミュニティに参加している
  if (hasActivity && score >= 20) {
    return '準アクティブ'
  }

  // ライト: HbA1c記録あり OR プロフィール充実（活動なし）
  // → 自分の記録は管理しているが、コミュニティ活動はしない
  if (hasHba1c || hasProfile) {
    return 'ライト'
  }

  // 閲覧専用: それ以外
  // → プロフィール最小限、記録なし、活動なし
  return '閲覧専用'
}

async function reclassify() {
  console.log('=== Phase 1: ダミーユーザー層再定義 v2 ===\n')

  // 1. Get all dummy users
  const { data: dummyUsers } = await supabase
    .from('users')
    .select('id, email, display_name, is_dummy, created_at')
    .eq('is_dummy', true)

  if (!dummyUsers) {
    console.log('No dummy users found')
    return
  }

  const userIds = dummyUsers.map(u => u.id)

  // 2. Get profiles
  const { data: profiles } = await supabase
    .from('extended_user_profiles')
    .select('*')
    .in('user_id', userIds)

  const { data: userProfiles } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', userIds)

  const profileMap = new Map()
  for (const p of profiles || []) {
    profileMap.set(p.user_id, { ...profileMap.get(p.user_id), ...p })
  }
  for (const p of userProfiles || []) {
    profileMap.set(p.user_id, { ...profileMap.get(p.user_id), ...p })
  }

  // 3. Get activity counts
  const { data: hba1cData } = await supabase.from('hba1c_records').select('user_id').in('user_id', userIds)
  const { data: weightData } = await supabase.from('weight_records').select('user_id').in('user_id', userIds)
  const { data: diaryData } = await supabase.from('diary_entries').select('user_id').in('user_id', userIds)
  const { data: threadData } = await supabase.from('threads').select('user_id').in('user_id', userIds)
  const { data: commentData } = await supabase.from('comments').select('user_id').in('user_id', userIds)

  const countMap = (data) => {
    const map = new Map()
    for (const r of data || []) {
      map.set(r.user_id, (map.get(r.user_id) || 0) + 1)
    }
    return map
  }

  const hba1cCount = countMap(hba1cData)
  const weightCount = countMap(weightData)
  const diaryCount = countMap(diaryData)
  const threadCount = countMap(threadData)
  const commentCount = countMap(commentData)

  // 4. Calculate new scores and tiers
  const analysis = dummyUsers.map(user => {
    const profile = profileMap.get(user.id) || {}
    const hba1c = hba1cCount.get(user.id) || 0
    const weight = weightCount.get(user.id) || 0
    const diary = diaryCount.get(user.id) || 0
    const threads = threadCount.get(user.id) || 0
    const comments = commentCount.get(user.id) || 0

    // 旧スコア計算（比較用）
    let oldScore = 0
    if (user.display_name) oldScore += 10
    if (profile.diabetes_type) oldScore += 10
    if (profile.treatment_methods?.length > 0 || profile.treatment?.length > 0) oldScore += 5
    if (profile.bio && profile.bio.length > 10) oldScore += 5
    if (profile.age_group) oldScore += 3
    if (profile.gender) oldScore += 3
    if (profile.illness_duration) oldScore += 3
    if (profile.device || profile.devices?.length > 0) oldScore += 3
    if (hba1c > 0) oldScore += Math.min(hba1c * 2, 20)
    if (weight > 0) oldScore += Math.min(weight, 10)
    if (diary > 0) oldScore += Math.min(diary * 2, 10)
    if (threads > 0) oldScore += Math.min(threads * 3, 15)
    if (comments > 0) oldScore += Math.min(comments, 10)

    let oldTier
    if (oldScore >= 60) oldTier = 'コア'
    else if (oldScore >= 40) oldTier = '準アクティブ'
    else if (oldScore >= 20) oldTier = 'ライト'
    else oldTier = '閲覧専用'

    // 新スコア計算
    const newScore = calculateNewScore(user, profile, hba1c, weight, diary, threads, comments)
    const newTier = determineTier(newScore, threads, comments, hba1c, profile)

    return {
      id: user.id,
      display_name: user.display_name || '(未設定)',
      diabetes_type: profile.diabetes_type || '(未設定)',
      hba1c,
      weight,
      diary,
      threads,
      comments,
      oldScore,
      oldTier,
      newScore,
      newTier,
      tierChanged: oldTier !== newTier
    }
  })

  // Sort by new score descending
  analysis.sort((a, b) => b.newScore - a.newScore)

  // 5. Output results

  // 層別集計
  const oldTierCounts = { 'コア': 0, '準アクティブ': 0, 'ライト': 0, '閲覧専用': 0 }
  const newTierCounts = { 'コア': 0, '準アクティブ': 0, 'ライト': 0, '閲覧専用': 0 }
  for (const u of analysis) {
    oldTierCounts[u.oldTier]++
    newTierCounts[u.newTier]++
  }

  console.log('=== 層分布の変化 ===')
  console.log('層           | 旧分類 | 新分類 | 目標   | 達成')
  console.log('-'.repeat(55))
  const checkTarget = (count, min, max) => count >= min && count <= max ? '✓' : `${count < min ? '少' : '多'}`
  console.log(`コア         |   ${String(oldTierCounts['コア']).padStart(3)} |   ${String(newTierCounts['コア']).padStart(3)} | 20-30 | ${checkTarget(newTierCounts['コア'], 20, 30)}`)
  console.log(`準アクティブ |   ${String(oldTierCounts['準アクティブ']).padStart(3)} |   ${String(newTierCounts['準アクティブ']).padStart(3)} | 40-50 | ${checkTarget(newTierCounts['準アクティブ'], 40, 50)}`)
  console.log(`ライト       |   ${String(oldTierCounts['ライト']).padStart(3)} |   ${String(newTierCounts['ライト']).padStart(3)} | 60-80 | ${checkTarget(newTierCounts['ライト'], 60, 80)}`)
  console.log(`閲覧専用     |   ${String(oldTierCounts['閲覧専用']).padStart(3)} |   ${String(newTierCounts['閲覧専用']).padStart(3)} | 40-50 | ${checkTarget(newTierCounts['閲覧専用'], 40, 50)}`)

  // 再分類されたユーザー数
  const reclassified = analysis.filter(u => u.tierChanged)
  console.log(`\n再分類されたユーザー: ${reclassified.length}名 / ${analysis.length}名`)

  // 層別に詳細表示
  console.log('\n--- コアユーザー（新分類）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | スコア | 旧層')
  console.log('-'.repeat(70))
  const coreUsers = analysis.filter(u => u.newTier === 'コア')
  for (const u of coreUsers) {
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(6)} | ` +
      `${u.oldTier}`
    )
  }

  console.log('\n--- 準アクティブユーザー（新分類・上位20名）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | スコア | 旧層')
  console.log('-'.repeat(70))
  const semiActiveUsers = analysis.filter(u => u.newTier === '準アクティブ')
  for (const u of semiActiveUsers.slice(0, 20)) {
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(6)} | ` +
      `${u.oldTier}`
    )
  }
  if (semiActiveUsers.length > 20) {
    console.log(`... 他 ${semiActiveUsers.length - 20}名`)
  }

  // 境界ユーザー（準アクティブの下位）
  console.log('\n--- 準アクティブ／ライト境界（準アクティブ下位10名）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | スコア | 理由')
  console.log('-'.repeat(75))
  for (const u of semiActiveUsers.slice(-10)) {
    const reason = u.threads >= 1 ? '投稿あり' : 'コメントあり'
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(6)} | ` +
      `${reason}`
    )
  }

  console.log('\n--- ライトユーザー（新分類・代表15名）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | スコア | 旧層')
  console.log('-'.repeat(70))
  const lightUsers = analysis.filter(u => u.newTier === 'ライト')
  for (const u of lightUsers.slice(0, 15)) {
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(6)} | ` +
      `${u.oldTier}`
    )
  }
  if (lightUsers.length > 15) {
    console.log(`... 他 ${lightUsers.length - 15}名`)
  }

  console.log('\n--- 閲覧専用ユーザー（新分類・全員）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | スコア | 旧層')
  console.log('-'.repeat(70))
  const viewOnlyUsers = analysis.filter(u => u.newTier === '閲覧専用')
  for (const u of viewOnlyUsers) {
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(6)} | ` +
      `${u.oldTier}`
    )
  }

  // Phase 2用のコア候補20名（体重記録追加対象）
  console.log('\n=== Phase 2: 体重記録追加候補（コア層から20名）===')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | スコア | 選定理由')
  console.log('-'.repeat(80))

  // コア層から、2型・1型を優先、活動量が多い順
  const weightCandidates = coreUsers
    .filter(u => u.diabetes_type === 'type2' || u.diabetes_type === 'type1')
    .slice(0, 20)

  for (const u of weightCandidates) {
    const reason = u.diabetes_type === 'type2' ? '2型・体重管理重要' : '1型・記録習慣'
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(6)} | ` +
      `${reason}`
    )
  }

  // 糖尿病タイプ別分布
  console.log('\n=== 糖尿病タイプ別・層別分布 ===')
  const typeByTier = {}
  for (const u of analysis) {
    const key = `${u.diabetes_type}|${u.newTier}`
    typeByTier[key] = (typeByTier[key] || 0) + 1
  }

  const types = ['type1', 'type2', 'prediabetes', 'family', 'gestational']
  const tiers = ['コア', '準アクティブ', 'ライト', '閲覧専用']

  console.log('タイプ        | コア | 準アク | ライト | 閲覧専用 | 計')
  console.log('-'.repeat(60))
  for (const type of types) {
    const counts = tiers.map(tier => typeByTier[`${type}|${tier}`] || 0)
    const total = counts.reduce((a, b) => a + b, 0)
    const row = counts.map(c => String(c).padStart(4)).join(' | ')
    console.log(`${type.padEnd(13)} | ${row} | ${String(total).padStart(3)}`)
  }

  // JSON出力（後続処理用）
  const output = {
    summary: {
      total: analysis.length,
      oldDistribution: oldTierCounts,
      newDistribution: newTierCounts,
      reclassifiedCount: reclassified.length,
      targetAchieved: {
        core: newTierCounts['コア'] >= 20 && newTierCounts['コア'] <= 30,
        semiActive: newTierCounts['準アクティブ'] >= 40 && newTierCounts['準アクティブ'] <= 50,
        light: newTierCounts['ライト'] >= 60 && newTierCounts['ライト'] <= 80,
        viewOnly: newTierCounts['閲覧専用'] >= 40 && newTierCounts['閲覧専用'] <= 50
      }
    },
    scoringRules: {
      description: 'v2: 活動実績（投稿・コメント）を重視、記録のみでは準アクティブにならない',
      core: 'スコア50以上 AND 投稿1件以上 AND コメント3件以上',
      semiActive: '投稿またはコメントあり AND スコア20以上',
      light: 'HbA1c記録あり OR プロフィール充実',
      viewOnly: 'それ以外（活動なし、記録なし、プロフィール最小限）'
    },
    coreUsers: coreUsers.map(u => ({
      id: u.id,
      display_name: u.display_name,
      diabetes_type: u.diabetes_type,
      threads: u.threads,
      comments: u.comments,
      hba1c: u.hba1c,
      score: u.newScore
    })),
    viewOnlyUsers: viewOnlyUsers.map(u => ({
      id: u.id,
      display_name: u.display_name,
      diabetes_type: u.diabetes_type
    })),
    weightCandidates: weightCandidates.map(u => ({
      id: u.id,
      display_name: u.display_name,
      diabetes_type: u.diabetes_type,
      hba1c: u.hba1c
    }))
  }

  console.log('\n=== JSON出力（後続処理用）===')
  console.log(JSON.stringify(output, null, 2))
}

reclassify().catch(console.error)
