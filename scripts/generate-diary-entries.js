/**
 * Phase 3: 日記記録投入スクリプト
 * コア層の一部ユーザーに自然な日記データを投入
 *
 * Usage:
 *   DRY RUN: node scripts/generate-diary-entries.js
 *   EXECUTE: node scripts/generate-diary-entries.js --execute
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const isExecute = process.argv.includes('--execute')

/**
 * 日記追加対象ユーザー（12名）
 *
 * グループA（よく書く人）: 15-25件、過去3ヶ月
 * グループB（たまに書く人）: 8-12件、過去2ヶ月
 * グループC（最低限）: 3-6件、過去1-2ヶ月
 */
const TARGET_USERS = [
  // グループA: よく書く人（3名）
  { id: '2033ee1c-28b2-5187-8ba1-c94f7964e33e', name: 'Ash🌈🦢', type: 'type2', group: 'A', style: 'casual' },
  { id: '9516c386-2cc6-53ba-8691-396ed2abff89', name: 'たこ🐙', type: 'type2', group: 'A', style: 'reflective' },
  { id: '41cf3d7f-9ac1-5151-9417-c3bfa7afeda0', name: '仲夏トト', type: 'type2', group: 'A', style: 'positive' },

  // グループB: たまに書く人（4名）
  { id: '8108dd63-ac37-57eb-a000-957166677c83', name: 'りた。', type: 'type1', group: 'B', style: 'casual' },
  { id: '649c2749-825f-5848-a5c7-96dead7950ea', name: 'あんず', type: 'type2', group: 'B', style: 'matter-of-fact' },
  { id: '70ad24b3-70ad-54df-94ed-8ad696b6f4d2', name: '捜索ボラ', type: 'type2', group: 'B', style: 'reflective' },
  { id: '27de7033-665e-5060-bafa-e4aed971e69c', name: '麻衣子@1型', type: 'type1', group: 'B', style: 'detail' },

  // グループC: 最低限だけ（5名）
  { id: '43cddd28-0440-54a7-b3b5-87a8a4623507', name: 'まりな', type: 'type2', group: 'C', style: 'casual' },
  { id: '6b77d0a7-e272-5075-be52-262fdf386cf1', name: 'かわちゃん', type: 'type2', group: 'C', style: 'positive' },
  { id: '6ca9558c-e08f-5318-ae91-4ff74ae400e1', name: 'からゆうたろう', type: 'type2', group: 'C', style: 'matter-of-fact' },
  { id: '5c742ce8-46e9-5195-84b2-2988893e7a29', name: 'ぱふ', type: 'type2', group: 'C', style: 'casual' },
  { id: '52eddc2c-aa88-5e62-a227-139b8887696c', name: '花音🌻hanon', type: 'type2', group: 'C', style: 'positive' },
]

const GROUP_CONFIG = {
  A: { monthsBack: 3, entries: { min: 15, max: 22 }, description: 'よく書く人' },
  B: { monthsBack: 2, entries: { min: 8, max: 12 }, description: 'たまに書く人' },
  C: { monthsBack: 2, entries: { min: 3, max: 6 }, description: '最低限' },
}

/**
 * 日記テンプレート（短文中心）
 */
const DIARY_TEMPLATES = {
  // 食事系
  food_good: [
    '今日は野菜多めに食べられた',
    '昼ごはん、糖質控えめにできた',
    'サラダチキンとサラダで済ませた。満足',
    '炭水化物少なめ意識できた日',
    '夕飯は魚メインにした',
    '間食なしで過ごせた',
    'お弁当持参、外食回避',
  ],
  food_bad: [
    'つい食べすぎた…反省',
    'ラーメン食べてしまった',
    '甘いもの我慢できず。明日から頑張る',
    '飲み会で食べすぎ。仕方ない',
    'コンビニ弁当。野菜足りない',
    'ストレスで食べすぎた',
  ],
  food_neutral: [
    '普通に3食',
    'いつも通りの食事',
    '特に何もなし。平穏',
  ],

  // 運動系
  exercise_good: [
    '30分歩いた',
    '散歩できた。気持ちいい',
    'ジム行けた',
    '階段使うようにした',
    '久しぶりに運動',
    '買い物がてら歩いた',
    'ストレッチした',
  ],
  exercise_bad: [
    '運動できず…',
    '雨で歩けなかった',
    '忙しくて運動なし',
    '体調悪くて休養',
    'サボってしまった',
  ],

  // 血糖値・数値系
  blood_sugar_good: [
    '血糖値安定してた',
    '食後も数値良好',
    'いい感じの値だった',
    '最近数値が安定してきた',
  ],
  blood_sugar_bad: [
    '食後の血糖値高め…',
    '数値がちょっと気になる',
    '朝の血糖値高かった',
    '間食したら上がった',
  ],

  // 通院・薬
  clinic: [
    '病院行ってきた',
    '定期検診。特に問題なし',
    '先生に褒められた',
    '薬もらってきた',
    '採血した。結果待ち',
    'A1c下がってた！嬉しい',
    'A1c微増…気をつけよう',
  ],

  // 体調・気分
  mood_good: [
    '今日は調子いい',
    '気分良く過ごせた',
    'モチベーション高い日',
    '体調◎',
    'やる気ある日だった',
  ],
  mood_bad: [
    'ちょっと疲れ気味',
    'だるい。休もう',
    'モチベーション低下中',
    '眠い…',
    'なんとなく不調',
  ],
  mood_neutral: [
    'まあまあな一日',
    '特になし',
    'ふつう',
    '可もなく不可もなく',
  ],

  // 1型特有
  type1_insulin: [
    'インスリン調整した',
    '低血糖気をつけないと',
    'カーボカウント頑張った',
    'ポンプの調子確認',
    '補食持ち歩いた',
    'センサー交換した',
  ],
  type1_hypo: [
    '低血糖なりかけた。ブドウ糖で対処',
    '低血糖…ジュース飲んだ',
    '夜中に低血糖。つらい',
  ],

  // 2型特有
  type2_weight: [
    '体重ちょっと減った',
    '体重キープ中',
    '体重増えてた…気をつけよう',
    '目標体重まであと少し',
  ],
  type2_lifestyle: [
    '生活習慣気をつけてる',
    '早寝早起きできた',
    '夜更かししてしまった',
    '規則正しく過ごせた',
  ],

  // 小さな成功・振り返り
  success: [
    '今日は頑張れた',
    '自分を褒めたい',
    '続けることが大事',
    '小さな進歩',
    'できることからコツコツ',
  ],
  reflection: [
    '明日また頑張ろう',
    '無理せずマイペースで',
    '完璧じゃなくていい',
    '一歩ずつ',
    '今週は良かった',
    '来週も続けたい',
  ],
}

/**
 * ユーザーのスタイルに応じて日記を選択
 */
function selectDiaryContent(user) {
  const contents = []
  const type = user.type
  const style = user.style

  // テーマの重み付け
  const themes = [
    { category: 'food_good', weight: 20 },
    { category: 'food_bad', weight: 10 },
    { category: 'food_neutral', weight: 15 },
    { category: 'exercise_good', weight: 15 },
    { category: 'exercise_bad', weight: 10 },
    { category: 'blood_sugar_good', weight: 10 },
    { category: 'blood_sugar_bad', weight: 8 },
    { category: 'clinic', weight: 5 },
    { category: 'mood_good', weight: 12 },
    { category: 'mood_bad', weight: 8 },
    { category: 'mood_neutral', weight: 15 },
    { category: 'success', weight: 8 },
    { category: 'reflection', weight: 10 },
  ]

  // 1型/2型特有のテーマを追加
  if (type === 'type1') {
    themes.push({ category: 'type1_insulin', weight: 15 })
    themes.push({ category: 'type1_hypo', weight: 5 })
  } else {
    themes.push({ category: 'type2_weight', weight: 12 })
    themes.push({ category: 'type2_lifestyle', weight: 10 })
  }

  // スタイルに応じて重み調整
  if (style === 'positive') {
    themes.find(t => t.category === 'mood_good').weight *= 1.5
    themes.find(t => t.category === 'success').weight *= 1.5
  } else if (style === 'reflective') {
    themes.find(t => t.category === 'reflection').weight *= 1.5
    themes.find(t => t.category === 'blood_sugar_bad').weight *= 1.3
  }

  // 重み付きランダム選択
  const totalWeight = themes.reduce((sum, t) => sum + t.weight, 0)
  const random = Math.random() * totalWeight
  let cumulative = 0
  let selectedCategory = 'food_neutral'

  for (const theme of themes) {
    cumulative += theme.weight
    if (random <= cumulative) {
      selectedCategory = theme.category
      break
    }
  }

  const templates = DIARY_TEMPLATES[selectedCategory]
  const content = templates[Math.floor(Math.random() * templates.length)]

  // たまに2文にする（30%の確率）
  if (Math.random() < 0.3) {
    const extraCategories = ['reflection', 'mood_neutral', 'mood_good']
    const extraCat = extraCategories[Math.floor(Math.random() * extraCategories.length)]
    const extraTemplates = DIARY_TEMPLATES[extraCat]
    const extra = extraTemplates[Math.floor(Math.random() * extraTemplates.length)]
    return content + '。' + extra
  }

  return content
}

/**
 * 日記エントリの日付を生成
 */
function generateDiaryDates(user) {
  const config = GROUP_CONFIG[user.group]
  const now = new Date()
  const startDate = new Date(now)
  startDate.setMonth(startDate.getMonth() - config.monthsBack)

  const entryCount = Math.floor(
    Math.random() * (config.entries.max - config.entries.min + 1) + config.entries.min
  )

  const dates = []
  const totalDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))

  // ランダムに日付を選択（重複なし）
  const usedDays = new Set()
  let attempts = 0
  while (dates.length < entryCount && attempts < 1000) {
    attempts++
    const daysAgo = Math.floor(Math.random() * totalDays) + 1
    if (usedDays.has(daysAgo)) continue

    // 週に1-2回程度になるよう、近い日付を避ける
    const tooClose = [...usedDays].some(d => Math.abs(d - daysAgo) < 3)
    if (tooClose && Math.random() < 0.7) continue

    usedDays.add(daysAgo)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    // 時刻をランダムに設定（6時〜23時）
    date.setHours(Math.floor(Math.random() * 17) + 6, Math.floor(Math.random() * 60), 0, 0)
    dates.push(date)
  }

  // 古い順にソート
  dates.sort((a, b) => a - b)
  return dates
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== Phase 3: 日記記録投入 ===\n')
  console.log(`実行モード: ${isExecute ? '【本番実行】' : '【DRY RUN】'}\n`)

  // 既存の日記スレッドを確認
  const userIds = TARGET_USERS.map(u => u.id)
  const { data: existingThreads } = await supabase
    .from('threads')
    .select('id, user_id')
    .eq('mode', 'diary')
    .in('user_id', userIds)

  const existingDiaryUsers = new Set(existingThreads?.map(t => t.user_id) || [])

  // 投入予定を計算
  const plans = []
  let totalEntries = 0

  for (const user of TARGET_USERS) {
    if (existingDiaryUsers.has(user.id)) {
      plans.push({ user, skip: true, reason: '既存日記スレッドあり' })
      continue
    }

    const dates = generateDiaryDates(user)
    const entries = dates.map(date => ({
      content: selectDiaryContent(user),
      created_at: date.toISOString(),
    }))

    plans.push({ user, skip: false, entries })
    totalEntries += entries.length
  }

  // サマリー表示
  console.log('=== 投入予定サマリー ===')
  console.log('名前             | グループ | タイプ | スタイル | 件数 | 期間')
  console.log('-'.repeat(75))

  for (const plan of plans) {
    const { user } = plan
    if (plan.skip) {
      console.log(`${user.name.substring(0, 15).padEnd(15)} | SKIP (${plan.reason})`)
    } else {
      const config = GROUP_CONFIG[user.group]
      console.log(
        `${user.name.substring(0, 15).padEnd(15)} | ${user.group}(${config.description.padEnd(6)}) | ` +
        `${user.type.padEnd(5)} | ${user.style.padEnd(12)} | ${String(plan.entries.length).padStart(4)}件 | ` +
        `過去${config.monthsBack}ヶ月`
      )
    }
  }

  console.log('-'.repeat(75))
  console.log(`合計: ${totalEntries}件 (${plans.filter(p => !p.skip).length}名)\n`)

  // グループ別集計
  console.log('=== グループ別集計 ===')
  for (const [group, config] of Object.entries(GROUP_CONFIG)) {
    const groupPlans = plans.filter(p => !p.skip && p.user.group === group)
    const count = groupPlans.reduce((sum, p) => sum + p.entries.length, 0)
    const avg = groupPlans.length > 0 ? (count / groupPlans.length).toFixed(1) : 0
    console.log(
      `グループ${group} (${config.description}): ${groupPlans.length}名, ` +
      `合計${count}件, 平均${avg}件/人 (目標: ${config.entries.min}-${config.entries.max}件)`
    )
  }

  // サンプル表示（3名分）
  console.log('\n=== サンプルエントリ（3名分の最初と最後）===')
  const samplePlans = plans.filter(p => !p.skip).slice(0, 3)
  for (const plan of samplePlans) {
    console.log(`\n【${plan.user.name}】(${plan.user.type}, ${plan.user.style})`)
    const entries = plan.entries
    if (entries.length >= 2) {
      console.log(`  最初: ${entries[0].created_at.slice(0, 10)} - "${entries[0].content}"`)
      console.log(`  最後: ${entries[entries.length - 1].created_at.slice(0, 10)} - "${entries[entries.length - 1].content}"`)
    } else if (entries.length === 1) {
      console.log(`  ${entries[0].created_at.slice(0, 10)} - "${entries[0].content}"`)
    }
  }

  // 本番実行
  if (isExecute) {
    console.log('\n=== 本番実行開始 ===')

    // 現在の最大thread_numberを取得
    const { data: maxData } = await supabase
      .from('threads')
      .select('thread_number')
      .order('thread_number', { ascending: false })
      .limit(1)
      .single()

    let nextThreadNumber = (maxData?.thread_number || 0) + 1
    console.log(`  開始 thread_number: ${nextThreadNumber}`)

    for (const plan of plans) {
      if (plan.skip) continue

      const { user, entries } = plan

      // 1. 日記スレッドを作成（mode='diary'は日記専用）
      // thread_numberを明示的に指定してシーケンス問題を回避
      const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert({
          user_id: user.id,
          title: `${user.name}の日記`,
          body: '日々の記録をつけています',
          category: 'chat_other',
          mode: 'diary',
          thread_number: nextThreadNumber,
          created_at: entries[0].created_at, // 最初のエントリと同じ日
        })
        .select('id')
        .single()

      nextThreadNumber++

      if (threadError) {
        console.error(`  ❌ ${user.name}: スレッド作成失敗 - ${threadError.message}`)
        continue
      }

      // 2. 日記エントリを投入
      const diaryEntries = entries.map(e => ({
        thread_id: thread.id,
        user_id: user.id,
        content: e.content,
        created_at: e.created_at,
      }))

      const { error: entryError } = await supabase
        .from('diary_entries')
        .insert(diaryEntries)

      if (entryError) {
        console.error(`  ❌ ${user.name}: エントリ投入失敗 - ${entryError.message}`)
      } else {
        console.log(`  ✅ ${user.name}: ${entries.length}件投入完了`)
      }
    }

    console.log('\n✅ 本番実行完了')
  } else {
    console.log('\n📋 これはDRY RUNです。実際に投入するには --execute オプションを付けてください:')
    console.log('   node scripts/generate-diary-entries.js --execute')
  }
}

main().catch(console.error)
