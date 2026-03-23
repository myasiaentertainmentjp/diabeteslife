/**
 * Phase 1: ダミーユーザー層再定義スクリプト
 * 活動実績を重視した新スコアリングで再分類
 * Usage: node scripts/reclassify-dummy-users.js
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * 新スコアリングルール（活動実績重視）
 *
 * 【旧ルール問題点】
 * - プロフィール完成度で31点も獲得できた
 * - 活動ゼロでもライト層に入ってしまう
 *
 * 【新ルール】
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
 * 新しい層判定ルール
 *
 * コア（20-30名目標）: スコア50以上 AND 投稿1件以上 AND コメント3件以上
 * 準アクティブ（40-50名目標）: スコア20以上 AND (投稿1件以上 OR コメント1件以上 OR HbA1c3件以上)
 * ライト（60-80名目標）: スコア5以上 AND (HbA1c1件以上 OR プロフィール充実)
 * 閲覧専用（40-50名目標）: それ以外（活動・記録なし）
 */
function determineTier(score, threads, comments, hba1c, profile) {
  // コア: 高スコア + 投稿実績 + コメント実績
  if (score >= 50 && threads >= 1 && comments >= 3) {
    return 'コア'
  }

  // 準アクティブ: 中スコア + 何らかの活動
  if (score >= 20 && (threads >= 1 || comments >= 1 || hba1c >= 3)) {
    return '準アクティブ'
  }

  // ライト: 低スコアだが記録あり、またはプロフィール充実
  const hasRecord = hba1c >= 1
  const hasProfile = profile.diabetes_type && (profile.bio?.length > 10 || profile.treatment_methods?.length > 0)
  if (score >= 5 && (hasRecord || hasProfile)) {
    return 'ライト'
  }

  // 閲覧専用: 活動・記録なし
  return '閲覧専用'
}

async function reclassify() {
  console.log('=== Phase 1: ダミーユーザー層再定義 ===\n')

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
  console.log('層           | 旧分類 | 新分類 | 目標   | 差分')
  console.log('-'.repeat(55))
  console.log(`コア         |   ${String(oldTierCounts['コア']).padStart(3)} |   ${String(newTierCounts['コア']).padStart(3)} | 20-30 | ${newTierCounts['コア'] >= 20 && newTierCounts['コア'] <= 30 ? '✓' : '調整要'}`)
  console.log(`準アクティブ |   ${String(oldTierCounts['準アクティブ']).padStart(3)} |   ${String(newTierCounts['準アクティブ']).padStart(3)} | 40-50 | ${newTierCounts['準アクティブ'] >= 40 && newTierCounts['準アクティブ'] <= 50 ? '✓' : '調整要'}`)
  console.log(`ライト       |   ${String(oldTierCounts['ライト']).padStart(3)} |   ${String(newTierCounts['ライト']).padStart(3)} | 60-80 | ${newTierCounts['ライト'] >= 60 && newTierCounts['ライト'] <= 80 ? '✓' : '調整要'}`)
  console.log(`閲覧専用     |   ${String(oldTierCounts['閲覧専用']).padStart(3)} |   ${String(newTierCounts['閲覧専用']).padStart(3)} | 40-50 | ${newTierCounts['閲覧専用'] >= 40 && newTierCounts['閲覧専用'] <= 50 ? '✓' : '調整要'}`)

  // 再分類されたユーザー
  const reclassified = analysis.filter(u => u.tierChanged)
  console.log(`\n=== 再分類されたユーザー: ${reclassified.length}名 ===`)

  // 層別に詳細表示
  console.log('\n--- コアユーザー（新分類）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | 新スコア | 旧層→新層')
  console.log('-'.repeat(75))
  const coreUsers = analysis.filter(u => u.newTier === 'コア')
  for (const u of coreUsers) {
    const change = u.tierChanged ? `${u.oldTier}→コア` : '(変更なし)'
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(8)} | ` +
      `${change}`
    )
  }

  console.log('\n--- 準アクティブユーザー（新分類）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | 新スコア | 旧層→新層')
  console.log('-'.repeat(75))
  const semiActiveUsers = analysis.filter(u => u.newTier === '準アクティブ')
  for (const u of semiActiveUsers.slice(0, 20)) {
    const change = u.tierChanged ? `${u.oldTier}→準アク` : '(変更なし)'
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(8)} | ` +
      `${change}`
    )
  }
  if (semiActiveUsers.length > 20) {
    console.log(`... 他 ${semiActiveUsers.length - 20}名`)
  }

  console.log('\n--- ライトユーザー（新分類）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | 新スコア | 旧層→新層')
  console.log('-'.repeat(75))
  const lightUsers = analysis.filter(u => u.newTier === 'ライト')
  for (const u of lightUsers.slice(0, 15)) {
    const change = u.tierChanged ? `${u.oldTier}→ライト` : '(変更なし)'
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(8)} | ` +
      `${change}`
    )
  }
  if (lightUsers.length > 15) {
    console.log(`... 他 ${lightUsers.length - 15}名`)
  }

  console.log('\n--- 閲覧専用ユーザー（新分類）---')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | 新スコア | 旧層→新層')
  console.log('-'.repeat(75))
  const viewOnlyUsers = analysis.filter(u => u.newTier === '閲覧専用')
  for (const u of viewOnlyUsers) {
    const change = u.tierChanged ? `${u.oldTier}→閲覧専用` : '(変更なし)'
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.newScore).padStart(8)} | ` +
      `${change}`
    )
  }

  // Phase 2用のコア候補20名（体重記録追加対象）
  console.log('\n=== Phase 2: 体重記録追加候補（コア層から20名）===')
  console.log('名前             | タイプ | 投稿 | コメ | HbA1c | 新スコア | 選定理由')
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
      `${String(u.newScore).padStart(8)} | ` +
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

  console.log('タイプ        | コア | 準アク | ライト | 閲覧専用')
  console.log('-'.repeat(55))
  for (const type of types) {
    const row = tiers.map(tier => String(typeByTier[`${type}|${tier}`] || 0).padStart(4)).join(' | ')
    console.log(`${type.padEnd(13)} | ${row}`)
  }

  // JSON出力（後続処理用）
  const output = {
    summary: {
      total: analysis.length,
      oldDistribution: oldTierCounts,
      newDistribution: newTierCounts,
      reclassifiedCount: reclassified.length
    },
    coreUsers: coreUsers.map(u => ({ id: u.id, display_name: u.display_name, diabetes_type: u.diabetes_type })),
    viewOnlyUsers: viewOnlyUsers.map(u => ({ id: u.id, display_name: u.display_name, diabetes_type: u.diabetes_type })),
    weightCandidates: weightCandidates.map(u => ({ id: u.id, display_name: u.display_name, diabetes_type: u.diabetes_type, hba1c: u.hba1c }))
  }

  console.log('\n=== JSON出力（後続処理用）===')
  console.log(JSON.stringify(output, null, 2))
}

reclassify().catch(console.error)
