/**
 * Comprehensive Dummy User Analysis Script
 * Usage: node scripts/analyze-dummy-users.js
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function analyze() {
  console.log('=== Comprehensive Dummy User Analysis ===\n')

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
  console.log(`Total dummy users: ${dummyUsers.length}\n`)

  // 2. Get extended profiles
  const { data: profiles } = await supabase
    .from('extended_user_profiles')
    .select('*')
    .in('user_id', userIds)

  // Also check user_profiles table
  const { data: userProfiles } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', userIds)

  const profileMap = new Map()
  for (const p of profiles || []) {
    profileMap.set(p.user_id, { ...profileMap.get(p.user_id), ...p, source: 'extended' })
  }
  for (const p of userProfiles || []) {
    profileMap.set(p.user_id, { ...profileMap.get(p.user_id), ...p, source: 'user_profiles' })
  }

  // 3. Get HbA1c records count per user
  const { data: hba1cData } = await supabase
    .from('hba1c_records')
    .select('user_id')
    .in('user_id', userIds)

  const hba1cCount = new Map()
  for (const r of hba1cData || []) {
    hba1cCount.set(r.user_id, (hba1cCount.get(r.user_id) || 0) + 1)
  }

  // 4. Get weight records count per user
  const { data: weightData } = await supabase
    .from('weight_records')
    .select('user_id')
    .in('user_id', userIds)

  const weightCount = new Map()
  for (const r of weightData || []) {
    weightCount.set(r.user_id, (weightCount.get(r.user_id) || 0) + 1)
  }

  // 5. Get diary entries count per user
  const { data: diaryData } = await supabase
    .from('diary_entries')
    .select('user_id')
    .in('user_id', userIds)

  const diaryCount = new Map()
  for (const r of diaryData || []) {
    diaryCount.set(r.user_id, (diaryCount.get(r.user_id) || 0) + 1)
  }

  // 6. Get threads count per user
  const { data: threadData } = await supabase
    .from('threads')
    .select('user_id')
    .in('user_id', userIds)

  const threadCount = new Map()
  for (const r of threadData || []) {
    threadCount.set(r.user_id, (threadCount.get(r.user_id) || 0) + 1)
  }

  // 7. Get comments count per user
  const { data: commentData } = await supabase
    .from('comments')
    .select('user_id')
    .in('user_id', userIds)

  const commentCount = new Map()
  for (const r of commentData || []) {
    commentCount.set(r.user_id, (commentCount.get(r.user_id) || 0) + 1)
  }

  // Analyze and categorize users
  const analysis = dummyUsers.map(user => {
    const profile = profileMap.get(user.id) || {}
    const hba1c = hba1cCount.get(user.id) || 0
    const weight = weightCount.get(user.id) || 0
    const diary = diaryCount.get(user.id) || 0
    const threads = threadCount.get(user.id) || 0
    const comments = commentCount.get(user.id) || 0

    // Calculate fullness score
    let score = 0
    if (user.display_name) score += 10
    if (profile.diabetes_type) score += 10
    if (profile.treatment_methods?.length > 0 || profile.treatment?.length > 0) score += 5
    if (profile.bio && profile.bio.length > 10) score += 5
    if (profile.age_group) score += 3
    if (profile.gender) score += 3
    if (profile.illness_duration) score += 3
    if (profile.device || profile.devices?.length > 0) score += 3
    if (hba1c > 0) score += Math.min(hba1c * 2, 20)
    if (weight > 0) score += Math.min(weight, 10)
    if (diary > 0) score += Math.min(diary * 2, 10)
    if (threads > 0) score += Math.min(threads * 3, 15)
    if (comments > 0) score += Math.min(comments, 10)

    // Determine tier
    let tier
    if (score >= 60) tier = 'コア'
    else if (score >= 40) tier = '準アクティブ'
    else if (score >= 20) tier = 'ライト'
    else tier = '閲覧専用'

    return {
      id: user.id,
      display_name: user.display_name || '(未設定)',
      email: user.email,
      diabetes_type: profile.diabetes_type || '(未設定)',
      has_treatment: !!(profile.treatment_methods?.length > 0 || profile.treatment?.length > 0),
      has_bio: !!(profile.bio && profile.bio.length > 10),
      has_age_group: !!profile.age_group,
      has_gender: !!profile.gender,
      hba1c,
      weight,
      diary,
      threads,
      comments,
      score,
      tier,
      issues: []
    }
  })

  // Identify issues
  for (const u of analysis) {
    if (u.display_name === '(未設定)') u.issues.push('display_name未設定')
    if (u.diabetes_type === '(未設定)') u.issues.push('diabetes_type未設定')
    if (u.diabetes_type === 'family' && u.hba1c > 0) u.issues.push('family型なのにHbA1c記録あり')
    if (!u.has_treatment && u.diabetes_type !== 'family' && u.diabetes_type !== 'prediabetes') {
      u.issues.push('治療法未設定')
    }
  }

  // Sort by score descending
  analysis.sort((a, b) => b.score - a.score)

  // Output summary
  console.log('=== Tier Distribution ===')
  const tierCounts = { 'コア': 0, '準アクティブ': 0, 'ライト': 0, '閲覧専用': 0 }
  for (const u of analysis) {
    tierCounts[u.tier]++
  }
  console.log(`コアユーザー: ${tierCounts['コア']}名`)
  console.log(`準アクティブ: ${tierCounts['準アクティブ']}名`)
  console.log(`ライトユーザー: ${tierCounts['ライト']}名`)
  console.log(`閲覧専用: ${tierCounts['閲覧専用']}名`)

  console.log('\n=== Data Summary ===')
  console.log(`HbA1c記録あり: ${analysis.filter(u => u.hba1c > 0).length}名`)
  console.log(`体重記録あり: ${analysis.filter(u => u.weight > 0).length}名`)
  console.log(`日記あり: ${analysis.filter(u => u.diary > 0).length}名`)
  console.log(`投稿あり: ${analysis.filter(u => u.threads > 0).length}名`)
  console.log(`コメントあり: ${analysis.filter(u => u.comments > 0).length}名`)

  console.log('\n=== Issues ===')
  const usersWithIssues = analysis.filter(u => u.issues.length > 0)
  console.log(`問題のあるユーザー: ${usersWithIssues.length}名`)
  for (const u of usersWithIssues.slice(0, 20)) {
    console.log(`  ${u.display_name}: ${u.issues.join(', ')}`)
  }

  console.log('\n=== Top 20 Users (Highest Score) ===')
  console.log('名前 | タイプ | HbA1c | 体重 | 日記 | 投稿 | コメ | スコア | 層')
  console.log('-'.repeat(80))
  for (const u of analysis.slice(0, 20)) {
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.weight).padStart(4)} | ` +
      `${String(u.diary).padStart(4)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.score).padStart(5)} | ` +
      `${u.tier}`
    )
  }

  console.log('\n=== Bottom 20 Users (Lowest Score) ===')
  console.log('名前 | タイプ | HbA1c | 体重 | 日記 | 投稿 | コメ | スコア | 層')
  console.log('-'.repeat(80))
  for (const u of analysis.slice(-20).reverse()) {
    console.log(
      `${u.display_name.substring(0, 15).padEnd(15)} | ` +
      `${(u.diabetes_type || '-').substring(0, 5).padEnd(5)} | ` +
      `${String(u.hba1c).padStart(5)} | ` +
      `${String(u.weight).padStart(4)} | ` +
      `${String(u.diary).padStart(4)} | ` +
      `${String(u.threads).padStart(4)} | ` +
      `${String(u.comments).padStart(4)} | ` +
      `${String(u.score).padStart(5)} | ` +
      `${u.tier}`
    )
  }

  console.log('\n=== Diabetes Type Distribution ===')
  const typeCounts = {}
  for (const u of analysis) {
    typeCounts[u.diabetes_type] = (typeCounts[u.diabetes_type] || 0) + 1
  }
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}名`)
  }
}

analyze().catch(console.error)
