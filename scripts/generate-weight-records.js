/**
 * Phase 2: 体重記録投入スクリプト
 * コア候補20名に自然な体重記録を追加
 *
 * Usage:
 *   DRY RUN: node scripts/generate-weight-records.js
 *   EXECUTE: node scripts/generate-weight-records.js --execute
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const isExecute = process.argv.includes('--execute')

/**
 * 体重記録追加候補20名（Phase 1で確定）
 *
 * 記録タイプで3グループに分ける:
 * - A: しっかり記録（週2-3回、6ヶ月分）→ 50-70件
 * - B: たまに記録（週1回程度、4-5ヶ月分）→ 15-25件
 * - C: 最低限（月1-2回、3ヶ月分）→ 5-10件
 */
const TARGET_USERS = [
  // グループA: しっかり記録する人（7名）
  { id: '9516c386-2cc6-53ba-8691-396ed2abff89', name: 'たこ🐙', type: 'type2', group: 'A', baseWeight: 78, trend: 'decrease' },
  { id: '649c2749-825f-5848-a5c7-96dead7950ea', name: 'あんず', type: 'type2', group: 'A', baseWeight: 65, trend: 'stable' },
  { id: '70ad24b3-70ad-54df-94ed-8ad696b6f4d2', name: '捜索ボラ', type: 'type2', group: 'A', baseWeight: 82, trend: 'decrease' },
  { id: '8108dd63-ac37-57eb-a000-957166677c83', name: 'りた。', type: 'type1', group: 'A', baseWeight: 52, trend: 'stable' },
  { id: '2033ee1c-28b2-5187-8ba1-c94f7964e33e', name: 'Ash🌈🦢', type: 'type2', group: 'A', baseWeight: 75, trend: 'fluctuate' },
  { id: '41cf3d7f-9ac1-5151-9417-c3bfa7afeda0', name: '仲夏トト', type: 'type2', group: 'A', baseWeight: 68, trend: 'decrease' },
  { id: '27de7033-665e-5060-bafa-e4aed971e69c', name: '麻衣子@1型', type: 'type1', group: 'A', baseWeight: 48, trend: 'stable' },

  // グループB: たまに記録する人（8名）
  { id: '6b77d0a7-e272-5075-be52-262fdf386cf1', name: 'かわちゃん', type: 'type2', group: 'B', baseWeight: 72, trend: 'decrease' },
  { id: '6ca9558c-e08f-5318-ae91-4ff74ae400e1', name: 'からゆうたろう', type: 'type2', group: 'B', baseWeight: 85, trend: 'fluctuate' },
  { id: '86c6897a-ecb0-5df3-bd51-42cb87202f78', name: 'なな＊', type: 'type2', group: 'B', baseWeight: 58, trend: 'stable' },
  { id: '5c742ce8-46e9-5195-84b2-2988893e7a29', name: 'ぱふ', type: 'type2', group: 'B', baseWeight: 70, trend: 'increase' },
  { id: '1ef47199-b5ca-5676-b707-094fb74dfb29', name: 'すば', type: 'type2', group: 'B', baseWeight: 76, trend: 'decrease' },
  { id: '43cddd28-0440-54a7-b3b5-87a8a4623507', name: 'まりな', type: 'type2', group: 'B', baseWeight: 55, trend: 'stable' },
  { id: '71325971-dac7-5495-9361-48a241d5ff15', name: 'はいせ', type: 'type1', group: 'B', baseWeight: 56, trend: 'stable' },
  { id: '52eddc2c-aa88-5e62-a227-139b8887696c', name: '花音🌻hanon', type: 'type2', group: 'B', baseWeight: 62, trend: 'fluctuate' },

  // グループC: 最低限だけの人（5名）
  { id: '25c04963-f5cf-53a8-b8b4-8de16531d204', name: 'ドゥジ', type: 'type2', group: 'C', baseWeight: 80, trend: 'stable' },
  { id: '37549bb9-c9e9-5b7c-b44e-ef43f58149de', name: '大逆無道', type: 'type2', group: 'C', baseWeight: 74, trend: 'decrease' },
  { id: '08b928d5-48dd-530a-a87f-c99f9be17971', name: '猫好き 😸', type: 'type2', group: 'C', baseWeight: 67, trend: 'increase' },
  { id: '2ea07739-a00d-59c4-a47f-86a6ed6da68b', name: 'きりんれもん', type: 'type2', group: 'C', baseWeight: 71, trend: 'fluctuate' },
  { id: '5a3ee246-2604-53d4-9d80-5339b63e6e29', name: '青空の夢🌸', type: 'type2', group: 'C', baseWeight: 60, trend: 'stable' },
]

/**
 * 記録間隔の設定
 */
const GROUP_CONFIG = {
  A: {
    description: 'しっかり記録',
    monthsBack: 6,
    recordsPerWeek: { min: 2, max: 4 },
    skipWeekChance: 0.05,  // 5%の確率で週をスキップ
    targetRecords: { min: 50, max: 70 }
  },
  B: {
    description: 'たまに記録',
    monthsBack: 5,
    recordsPerWeek: { min: 0.8, max: 1.5 },
    skipWeekChance: 0.2,  // 20%の確率で週をスキップ
    targetRecords: { min: 15, max: 25 }
  },
  C: {
    description: '最低限',
    monthsBack: 3,
    recordsPerMonth: { min: 1, max: 3 },  // 月単位で指定
    skipMonthChance: 0.2,  // 20%の確率で月をスキップ
    targetRecords: { min: 5, max: 10 }
  }
}

/**
 * トレンド別の体重変動設定
 */
const TREND_CONFIG = {
  stable: {
    description: '横ばい',
    monthlyChange: { min: -0.3, max: 0.3 },  // 月あたり±0.3kg
    dailyVariation: { min: -0.5, max: 0.5 }  // 日々の変動±0.5kg
  },
  decrease: {
    description: '微減',
    monthlyChange: { min: -1.0, max: -0.3 }, // 月あたり-0.3〜-1.0kg
    dailyVariation: { min: -0.6, max: 0.4 }  // 減少傾向でも日々の増減あり
  },
  increase: {
    description: '微増',
    monthlyChange: { min: 0.2, max: 0.8 },   // 月あたり+0.2〜+0.8kg
    dailyVariation: { min: -0.4, max: 0.6 }  // 増加傾向でも日々の増減あり
  },
  fluctuate: {
    description: '変動',
    monthlyChange: { min: -0.8, max: 0.8 },  // 月によってバラバラ
    dailyVariation: { min: -0.8, max: 0.8 }  // 日々の変動も大きめ
  }
}

/**
 * ランダム値生成
 */
function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1))
}

/**
 * 日付をYYYY-MM-DD形式で返す
 */
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * 記録日時を生成（朝・夜の時間帯をランダムに）
 */
function generateRecordTime(date) {
  const hours = Math.random() > 0.5
    ? randomInt(6, 9)   // 朝 6:00-9:59
    : randomInt(20, 23) // 夜 20:00-23:59
  const minutes = randomInt(0, 59)
  const seconds = randomInt(0, 59)
  return `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}+09:00`
}

/**
 * ユーザーごとの体重記録を生成
 */
function generateWeightRecords(user) {
  const config = GROUP_CONFIG[user.group]
  const trendConfig = TREND_CONFIG[user.trend]

  const records = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setMonth(startDate.getMonth() - config.monthsBack)

  let currentWeight = user.baseWeight
  let currentDate = new Date(startDate)

  // グループCは月単位で処理
  if (user.group === 'C') {
    while (currentDate <= today) {
      // スキップ判定
      if (Math.random() < config.skipMonthChance) {
        currentDate.setMonth(currentDate.getMonth() + 1)
        currentWeight += randomBetween(trendConfig.monthlyChange.min, trendConfig.monthlyChange.max)
        continue
      }

      // 月あたりの記録数を決定
      const recordsThisMonth = Math.round(randomBetween(config.recordsPerMonth.min, config.recordsPerMonth.max))

      for (let i = 0; i < recordsThisMonth; i++) {
        const dailyVariation = randomBetween(trendConfig.dailyVariation.min, trendConfig.dailyVariation.max)
        const recordedWeight = Math.max(30, currentWeight + dailyVariation)

        // 月内でランダムな日を選択
        const recordDate = new Date(currentDate)
        recordDate.setDate(randomInt(1, 28))

        if (recordDate <= today && recordDate >= startDate) {
          records.push({
            user_id: user.id,
            recorded_at: formatDate(recordDate),
            value: Math.round(recordedWeight * 10) / 10,
            is_public: Math.random() > 0.4, // 60%は公開
            created_at: generateRecordTime(formatDate(recordDate))
          })
        }
      }

      currentDate.setMonth(currentDate.getMonth() + 1)
      currentWeight += randomBetween(trendConfig.monthlyChange.min, trendConfig.monthlyChange.max)
    }
  } else {
    // グループA, Bは週単位で処理
    while (currentDate <= today) {
      // スキップ判定
      if (Math.random() < config.skipWeekChance) {
        currentDate.setDate(currentDate.getDate() + 7)
        currentWeight += randomBetween(trendConfig.monthlyChange.min, trendConfig.monthlyChange.max) / 4
        continue
      }

      // 週あたりの記録数を決定
      const recordsThisWeek = Math.round(randomBetween(config.recordsPerWeek.min, config.recordsPerWeek.max))

      for (let i = 0; i < recordsThisWeek && currentDate <= today; i++) {
        const dailyVariation = randomBetween(trendConfig.dailyVariation.min, trendConfig.dailyVariation.max)
        const recordedWeight = Math.max(30, currentWeight + dailyVariation)

        const recordDate = new Date(currentDate)
        recordDate.setDate(recordDate.getDate() + randomInt(0, Math.min(2, 6 - i * 2)))

        if (recordDate <= today) {
          records.push({
            user_id: user.id,
            recorded_at: formatDate(recordDate),
            value: Math.round(recordedWeight * 10) / 10,
            is_public: Math.random() > 0.3, // 70%は公開
            created_at: generateRecordTime(formatDate(recordDate))
          })
        }
      }

      currentDate.setDate(currentDate.getDate() + 7)
      currentWeight += randomBetween(trendConfig.monthlyChange.min, trendConfig.monthlyChange.max) / 4
    }
  }

  // 重複日付を除去
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

/**
 * メイン処理
 */
async function main() {
  console.log('=== Phase 2: 体重記録投入 ===\n')
  console.log(`実行モード: ${isExecute ? '【本番実行】' : '【DRY RUN】'}\n`)

  // 既存の体重記録を確認
  const { data: existingRecords, error: checkError } = await supabase
    .from('weight_records')
    .select('user_id')
    .in('user_id', TARGET_USERS.map(u => u.id))

  if (checkError) {
    console.error('Error checking existing records:', checkError)
    return
  }

  const existingUserIds = new Set((existingRecords || []).map(r => r.user_id))
  if (existingUserIds.size > 0) {
    console.log(`⚠️  既存の体重記録があるユーザー: ${existingUserIds.size}名`)
    console.log('    これらのユーザーはスキップします\n')
  }

  // 各ユーザーの記録を生成
  const allRecords = []
  const summary = []

  console.log('=== 投入予定サマリー ===')
  console.log('名前             | グループ | タイプ | トレンド | 件数 | 期間')
  console.log('-'.repeat(70))

  for (const user of TARGET_USERS) {
    // 既存記録があるユーザーはスキップ
    if (existingUserIds.has(user.id)) {
      console.log(`${user.name.padEnd(15)} | SKIP (既存記録あり)`)
      continue
    }

    const records = generateWeightRecords(user)
    allRecords.push(...records)

    const firstDate = records[0]?.recorded_at || '-'
    const lastDate = records[records.length - 1]?.recorded_at || '-'

    summary.push({
      name: user.name,
      group: user.group,
      type: user.type,
      trend: user.trend,
      count: records.length,
      firstDate,
      lastDate
    })

    const groupDesc = GROUP_CONFIG[user.group].description
    const trendDesc = TREND_CONFIG[user.trend].description
    console.log(
      `${user.name.substring(0, 15).padEnd(15)} | ` +
      `${user.group} ${groupDesc.padEnd(6)} | ` +
      `${user.type.padEnd(5)} | ` +
      `${trendDesc.padEnd(4)} | ` +
      `${String(records.length).padStart(3)}件 | ` +
      `${firstDate} 〜 ${lastDate}`
    )
  }

  console.log('-'.repeat(70))
  console.log(`合計: ${allRecords.length}件\n`)

  // グループ別集計
  console.log('=== グループ別集計 ===')
  for (const group of ['A', 'B', 'C']) {
    const groupUsers = summary.filter(s => s.group === group)
    const totalRecords = groupUsers.reduce((sum, u) => sum + u.count, 0)
    const avgRecords = groupUsers.length > 0 ? (totalRecords / groupUsers.length).toFixed(1) : 0
    const config = GROUP_CONFIG[group]
    console.log(
      `グループ${group} (${config.description}): ` +
      `${groupUsers.length}名, ` +
      `合計${totalRecords}件, ` +
      `平均${avgRecords}件/人 ` +
      `(目標: ${config.targetRecords.min}-${config.targetRecords.max}件)`
    )
  }

  // トレンド別集計
  console.log('\n=== トレンド別集計 ===')
  for (const trend of ['stable', 'decrease', 'increase', 'fluctuate']) {
    const trendUsers = summary.filter(s => s.trend === trend)
    const config = TREND_CONFIG[trend]
    console.log(`${config.description}: ${trendUsers.length}名`)
  }

  // サンプルデータ表示
  console.log('\n=== サンプルデータ（先頭3名の最初と最後の記録）===')
  for (const user of TARGET_USERS.slice(0, 3)) {
    if (existingUserIds.has(user.id)) continue

    const userRecords = allRecords.filter(r => r.user_id === user.id)
    if (userRecords.length === 0) continue

    console.log(`\n${user.name} (${user.type}, ${TREND_CONFIG[user.trend].description}):`)
    console.log(`  基準体重: ${user.baseWeight}kg`)
    console.log(`  最初: ${userRecords[0].recorded_at} → ${userRecords[0].value}kg`)
    console.log(`  最後: ${userRecords[userRecords.length - 1].recorded_at} → ${userRecords[userRecords.length - 1].value}kg`)
    const change = userRecords[userRecords.length - 1].value - userRecords[0].value
    console.log(`  変動: ${change >= 0 ? '+' : ''}${change.toFixed(1)}kg`)
  }

  // 本番実行
  if (isExecute && allRecords.length > 0) {
    console.log('\n=== 本番実行中 ===')

    // バッチ挿入（100件ずつ）
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, i + batchSize)
      const { error } = await supabase.from('weight_records').insert(batch)

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        return
      }

      inserted += batch.length
      console.log(`  ${inserted}/${allRecords.length}件 挿入完了`)
    }

    console.log(`\n✅ 完了: ${inserted}件の体重記録を追加しました`)

    // 確認用クエリ
    console.log('\n=== 確認用SQL ===')
    console.log(`
-- 投入後の確認
SELECT
  u.display_name,
  COUNT(w.id) as record_count,
  MIN(w.recorded_at) as first_record,
  MAX(w.recorded_at) as last_record,
  MIN(w.value) as min_weight,
  MAX(w.value) as max_weight,
  ROUND(AVG(w.value)::numeric, 1) as avg_weight
FROM weight_records w
JOIN users u ON w.user_id = u.id
WHERE u.is_dummy = true
GROUP BY u.id, u.display_name
ORDER BY record_count DESC;
`)
  } else if (!isExecute) {
    console.log('\n📋 これはDRY RUNです。実際に投入するには --execute オプションを付けてください:')
    console.log('   node scripts/generate-weight-records.js --execute')
  }

  // JSON出力（デバッグ用）
  if (process.argv.includes('--json')) {
    console.log('\n=== JSON出力 ===')
    console.log(JSON.stringify({ summary, recordCount: allRecords.length }, null, 2))
  }
}

main().catch(console.error)
