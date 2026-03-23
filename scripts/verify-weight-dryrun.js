/**
 * Phase 2: 体重記録 DRY RUN 詳細チェック
 * Usage: node scripts/verify-weight-dryrun.js
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 同じ設定をgenerate-weight-records.jsから持ってくる
const TARGET_USERS = [
  { id: '9516c386-2cc6-53ba-8691-396ed2abff89', name: 'たこ🐙', type: 'type2', group: 'A', baseWeight: 78, trend: 'decrease' },
  { id: '649c2749-825f-5848-a5c7-96dead7950ea', name: 'あんず', type: 'type2', group: 'A', baseWeight: 65, trend: 'stable' },
  { id: '70ad24b3-70ad-54df-94ed-8ad696b6f4d2', name: '捜索ボラ', type: 'type2', group: 'A', baseWeight: 82, trend: 'decrease' },
  { id: '8108dd63-ac37-57eb-a000-957166677c83', name: 'りた。', type: 'type1', group: 'A', baseWeight: 52, trend: 'stable' },
  { id: '2033ee1c-28b2-5187-8ba1-c94f7964e33e', name: 'Ash🌈🦢', type: 'type2', group: 'A', baseWeight: 75, trend: 'fluctuate' },
  { id: '41cf3d7f-9ac1-5151-9417-c3bfa7afeda0', name: '仲夏トト', type: 'type2', group: 'A', baseWeight: 68, trend: 'decrease' },
  { id: '27de7033-665e-5060-bafa-e4aed971e69c', name: '麻衣子@1型', type: 'type1', group: 'A', baseWeight: 48, trend: 'stable' },
  { id: '6b77d0a7-e272-5075-be52-262fdf386cf1', name: 'かわちゃん', type: 'type2', group: 'B', baseWeight: 72, trend: 'decrease' },
  { id: '6ca9558c-e08f-5318-ae91-4ff74ae400e1', name: 'からゆうたろう', type: 'type2', group: 'B', baseWeight: 85, trend: 'fluctuate' },
  { id: '86c6897a-ecb0-5df3-bd51-42cb87202f78', name: 'なな＊', type: 'type2', group: 'B', baseWeight: 58, trend: 'stable' },
  { id: '5c742ce8-46e9-5195-84b2-2988893e7a29', name: 'ぱふ', type: 'type2', group: 'B', baseWeight: 70, trend: 'increase' },
  { id: '1ef47199-b5ca-5676-b707-094fb74dfb29', name: 'すば', type: 'type2', group: 'B', baseWeight: 76, trend: 'decrease' },
  { id: '43cddd28-0440-54a7-b3b5-87a8a4623507', name: 'まりな', type: 'type2', group: 'B', baseWeight: 55, trend: 'stable' },
  { id: '71325971-dac7-5495-9361-48a241d5ff15', name: 'はいせ', type: 'type1', group: 'B', baseWeight: 56, trend: 'stable' },
  { id: '52eddc2c-aa88-5e62-a227-139b8887696c', name: '花音🌻hanon', type: 'type2', group: 'B', baseWeight: 62, trend: 'fluctuate' },
  { id: '25c04963-f5cf-53a8-b8b4-8de16531d204', name: 'ドゥジ', type: 'type2', group: 'C', baseWeight: 80, trend: 'stable' },
  { id: '37549bb9-c9e9-5b7c-b44e-ef43f58149de', name: '大逆無道', type: 'type2', group: 'C', baseWeight: 74, trend: 'decrease' },
  { id: '08b928d5-48dd-530a-a87f-c99f9be17971', name: '猫好き 😸', type: 'type2', group: 'C', baseWeight: 67, trend: 'increase' },
  { id: '2ea07739-a00d-59c4-a47f-86a6ed6da68b', name: 'きりんれもん', type: 'type2', group: 'C', baseWeight: 71, trend: 'fluctuate' },
  { id: '5a3ee246-2604-53d4-9d80-5339b63e6e29', name: '青空の夢🌸', type: 'type2', group: 'C', baseWeight: 60, trend: 'stable' },
]

const GROUP_CONFIG = {
  A: { monthsBack: 6, recordsPerWeek: { min: 2, max: 4 }, skipWeekChance: 0.05 },
  B: { monthsBack: 5, recordsPerWeek: { min: 0.8, max: 1.5 }, skipWeekChance: 0.2 },
  C: { monthsBack: 3, recordsPerMonth: { min: 1, max: 3 }, skipMonthChance: 0.2 }
}

const TREND_CONFIG = {
  stable: { monthlyChange: { min: -0.3, max: 0.3 }, dailyVariation: { min: -0.5, max: 0.5 } },
  decrease: { monthlyChange: { min: -1.0, max: -0.3 }, dailyVariation: { min: -0.6, max: 0.4 } },
  increase: { monthlyChange: { min: 0.2, max: 0.8 }, dailyVariation: { min: -0.4, max: 0.6 } },
  fluctuate: { monthlyChange: { min: -0.8, max: 0.8 }, dailyVariation: { min: -0.8, max: 0.8 } }
}

function randomBetween(min, max) { return min + Math.random() * (max - min) }
function randomInt(min, max) { return Math.floor(randomBetween(min, max + 1)) }
function formatDate(date) { return date.toISOString().split('T')[0] }

function generateWeightRecords(user) {
  const config = GROUP_CONFIG[user.group]
  const trendConfig = TREND_CONFIG[user.trend]
  const records = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setMonth(startDate.getMonth() - config.monthsBack)
  let currentWeight = user.baseWeight
  let currentDate = new Date(startDate)

  if (user.group === 'C') {
    while (currentDate <= today) {
      if (Math.random() < config.skipMonthChance) {
        currentDate.setMonth(currentDate.getMonth() + 1)
        currentWeight += randomBetween(trendConfig.monthlyChange.min, trendConfig.monthlyChange.max)
        continue
      }
      const recordsThisMonth = Math.round(randomBetween(config.recordsPerMonth.min, config.recordsPerMonth.max))
      for (let i = 0; i < recordsThisMonth; i++) {
        const dailyVariation = randomBetween(trendConfig.dailyVariation.min, trendConfig.dailyVariation.max)
        const recordedWeight = Math.max(30, currentWeight + dailyVariation)
        const recordDate = new Date(currentDate)
        recordDate.setDate(randomInt(1, 28))
        if (recordDate <= today && recordDate >= startDate) {
          records.push({ user_id: user.id, recorded_at: formatDate(recordDate), value: Math.round(recordedWeight * 10) / 10 })
        }
      }
      currentDate.setMonth(currentDate.getMonth() + 1)
      currentWeight += randomBetween(trendConfig.monthlyChange.min, trendConfig.monthlyChange.max)
    }
  } else {
    while (currentDate <= today) {
      if (Math.random() < config.skipWeekChance) {
        currentDate.setDate(currentDate.getDate() + 7)
        currentWeight += randomBetween(trendConfig.monthlyChange.min, trendConfig.monthlyChange.max) / 4
        continue
      }
      const recordsThisWeek = Math.round(randomBetween(config.recordsPerWeek.min, config.recordsPerWeek.max))
      for (let i = 0; i < recordsThisWeek && currentDate <= today; i++) {
        const dailyVariation = randomBetween(trendConfig.dailyVariation.min, trendConfig.dailyVariation.max)
        const recordedWeight = Math.max(30, currentWeight + dailyVariation)
        const recordDate = new Date(currentDate)
        recordDate.setDate(recordDate.getDate() + randomInt(0, Math.min(2, 6 - i * 2)))
        if (recordDate <= today) {
          records.push({ user_id: user.id, recorded_at: formatDate(recordDate), value: Math.round(recordedWeight * 10) / 10 })
        }
      }
      currentDate.setDate(currentDate.getDate() + 7)
      currentWeight += randomBetween(trendConfig.monthlyChange.min, trendConfig.monthlyChange.max) / 4
    }
  }

  const uniqueRecords = []
  const seenDates = new Set()
  for (const record of records.reverse()) {
    if (!seenDates.has(record.recorded_at)) {
      seenDates.add(record.recorded_at)
      uniqueRecords.push(record)
    }
  }
  return uniqueRecords.sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
}

async function verify() {
  console.log('=== Phase 2: 体重記録 詳細チェック ===\n')

  // 全ユーザーの記録を生成
  const allRecords = []
  const userRecordsMap = new Map()

  for (const user of TARGET_USERS) {
    const records = generateWeightRecords(user)
    allRecords.push(...records)
    userRecordsMap.set(user.id, { user, records })
  }

  // ============================
  // チェック1: type2の平均体重帯
  // ============================
  console.log('=== チェック1: type2の平均体重帯 ===')
  const type2Users = TARGET_USERS.filter(u => u.type === 'type2')
  const type2Records = allRecords.filter(r => type2Users.some(u => u.id === r.user_id))
  const type2Avg = type2Records.reduce((sum, r) => sum + r.value, 0) / type2Records.length
  const type2Min = Math.min(...type2Records.map(r => r.value))
  const type2Max = Math.max(...type2Records.map(r => r.value))

  console.log(`  type2ユーザー数: ${type2Users.length}名`)
  console.log(`  type2記録数: ${type2Records.length}件`)
  console.log(`  平均体重: ${type2Avg.toFixed(1)}kg`)
  console.log(`  最小値: ${type2Min}kg`)
  console.log(`  最大値: ${type2Max}kg`)

  // 基準体重の分布
  const baseWeights = type2Users.map(u => u.baseWeight)
  console.log(`  基準体重の分布: ${Math.min(...baseWeights)}kg 〜 ${Math.max(...baseWeights)}kg`)
  console.log(`  基準体重の平均: ${(baseWeights.reduce((a, b) => a + b, 0) / baseWeights.length).toFixed(1)}kg`)

  if (type2Avg > 80) {
    console.log('  ⚠️  警告: type2の平均体重が80kgを超えています')
  } else if (type2Avg > 75) {
    console.log('  ⚠️  注意: type2の平均体重がやや高め（75kg超）')
  } else {
    console.log('  ✅ OK: type2の平均体重は適正範囲')
  }

  // ============================
  // チェック2: 45kg未満の値
  // ============================
  console.log('\n=== チェック2: 45kg未満の値 ===')
  const under45 = allRecords.filter(r => r.value < 45)
  console.log(`  45kg未満の記録数: ${under45.length}件`)

  if (under45.length > 0) {
    console.log('  詳細:')
    for (const r of under45.slice(0, 10)) {
      const user = TARGET_USERS.find(u => u.id === r.user_id)
      console.log(`    ${user?.name}: ${r.recorded_at} → ${r.value}kg`)
    }

    // 45kg未満を持つユーザーの詳細
    const type1Users = TARGET_USERS.filter(u => u.type === 'type1')
    const under45Type1 = under45.filter(r => type1Users.some(u => u.id === r.user_id))
    console.log(`  うちtype1の記録: ${under45Type1.length}件`)

    if (under45Type1.length === under45.length) {
      console.log('  ✅ OK: 45kg未満はすべてtype1（体格が小さい可能性）')
    } else {
      console.log('  ⚠️  警告: type2で45kg未満の記録があります')
    }
  } else {
    console.log('  ✅ OK: 45kg未満の記録なし')
  }

  // ============================
  // チェック3: 開始日の分布
  // ============================
  console.log('\n=== チェック3: 開始日の分布 ===')
  const startDates = []
  for (const [userId, data] of userRecordsMap) {
    if (data.records.length > 0) {
      startDates.push({
        user: data.user.name,
        group: data.user.group,
        startDate: data.records[0].recorded_at
      })
    }
  }

  // グループ別に表示
  console.log('  グループA（6ヶ月前から）:')
  for (const s of startDates.filter(s => s.group === 'A')) {
    console.log(`    ${s.user}: ${s.startDate}`)
  }
  console.log('  グループB（5ヶ月前から）:')
  for (const s of startDates.filter(s => s.group === 'B')) {
    console.log(`    ${s.user}: ${s.startDate}`)
  }
  console.log('  グループC（3ヶ月前から）:')
  for (const s of startDates.filter(s => s.group === 'C')) {
    console.log(`    ${s.user}: ${s.startDate}`)
  }

  // 同じ日に開始しているユーザー数
  const startDateCounts = {}
  for (const s of startDates) {
    startDateCounts[s.startDate] = (startDateCounts[s.startDate] || 0) + 1
  }
  const maxSameStart = Math.max(...Object.values(startDateCounts))
  console.log(`\n  同じ開始日のユーザー最大数: ${maxSameStart}名`)

  if (maxSameStart > 5) {
    console.log('  ⚠️  警告: 開始日が偏りすぎています')
  } else {
    console.log('  ✅ OK: 開始日の分散は適正')
  }

  // ============================
  // チェック4: 時系列の直線性チェック（5名分）
  // ============================
  console.log('\n=== チェック4: 時系列の直線性チェック（5名分）===')

  const sampleUsers = [
    TARGET_USERS.find(u => u.name === 'たこ🐙'),
    TARGET_USERS.find(u => u.name === 'りた。'),
    TARGET_USERS.find(u => u.name === 'Ash🌈🦢'),
    TARGET_USERS.find(u => u.name === 'かわちゃん'),
    TARGET_USERS.find(u => u.name === 'ドゥジ'),
  ]

  for (const user of sampleUsers) {
    if (!user) continue
    const data = userRecordsMap.get(user.id)
    if (!data || data.records.length < 5) continue

    console.log(`\n  ${user.name} (${user.type}, ${user.trend}):`)
    console.log(`    記録数: ${data.records.length}件`)

    // 最初の10件を表示
    const sample = data.records.slice(0, 10)
    console.log('    日付       | 体重   | 前回差')
    console.log('    ' + '-'.repeat(35))

    let prevValue = null
    let increases = 0
    let decreases = 0
    let sameDirection = 0
    let maxSameDirection = 0

    for (const r of sample) {
      const diff = prevValue !== null ? (r.value - prevValue) : null
      const diffStr = diff !== null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}kg` : '-'
      console.log(`    ${r.recorded_at} | ${r.value.toString().padStart(5)}kg | ${diffStr}`)

      if (diff !== null) {
        if (diff > 0) {
          if (decreases > 0) sameDirection = 0
          increases++
          sameDirection++
        } else if (diff < 0) {
          if (increases > 0) sameDirection = 0
          decreases++
          sameDirection++
        }
        maxSameDirection = Math.max(maxSameDirection, sameDirection)
      }
      prevValue = r.value
    }

    // 全データで直線性チェック
    const allDiffs = []
    for (let i = 1; i < data.records.length; i++) {
      allDiffs.push(data.records[i].value - data.records[i - 1].value)
    }

    const positiveDiffs = allDiffs.filter(d => d > 0.1).length
    const negativeDiffs = allDiffs.filter(d => d < -0.1).length
    const neutralDiffs = allDiffs.filter(d => Math.abs(d) <= 0.1).length

    console.log(`    全体: 増加${positiveDiffs}回, 減少${negativeDiffs}回, 横ばい${neutralDiffs}回`)

    // 直線性の判定
    const totalChanges = positiveDiffs + negativeDiffs
    const majorDirection = Math.max(positiveDiffs, negativeDiffs)
    const linearityRatio = totalChanges > 0 ? majorDirection / totalChanges : 0

    if (linearityRatio > 0.85) {
      console.log(`    ⚠️  警告: 直線的すぎる (${(linearityRatio * 100).toFixed(0)}%が同方向)`)
    } else {
      console.log(`    ✅ OK: 自然な変動 (${(linearityRatio * 100).toFixed(0)}%が優勢方向)`)
    }
  }

  // ============================
  // 総合判定
  // ============================
  console.log('\n=== 総合判定 ===')
  let issues = 0

  if (type2Avg > 80) issues++
  if (under45.filter(r => TARGET_USERS.find(u => u.id === r.user_id)?.type === 'type2').length > 0) issues++
  if (maxSameStart > 5) issues++

  if (issues === 0) {
    console.log('✅ すべてのチェックをパスしました。executeを実行できます。')
    console.log('\n実行コマンド:')
    console.log('  node scripts/generate-weight-records.js --execute')
  } else {
    console.log(`⚠️  ${issues}件の問題が検出されました。修正を検討してください。`)
  }
}

verify().catch(console.error)
