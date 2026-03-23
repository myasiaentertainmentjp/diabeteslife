/**
 * 食事画像をダミーユーザーへ割り当てるスクリプト
 *
 * 使い方:
 *   node scripts/assign-meal-images.js          # DRY RUN（確認のみ）
 *   node scripts/assign-meal-images.js --execute  # 本番実行（JSONに書き込み）
 */

import fs from 'fs'

const DATA_FILE = '/Users/koji/diabeteslife-nextjs/scripts/meal-posts-ready.json'
const isExecute = process.argv.includes('--execute')

/**
 * 対象ユーザー17名
 */
const TARGET_USERS = {
  // コア層（12名）: 5〜7枚ずつ
  core: [
    { id: '2033ee1c-28b2-5187-8ba1-c94f7964e33e', name: 'Ash🌈🦢', type: 'type2', style: 'casual', imageCount: 7 },
    { id: '9516c386-2cc6-53ba-8691-396ed2abff89', name: 'たこ🐙', type: 'type2', style: 'reflective', imageCount: 7 },
    { id: '41cf3d7f-9ac1-5151-9417-c3bfa7afeda0', name: '仲夏トト', type: 'type2', style: 'positive', imageCount: 6 },
    { id: '8108dd63-ac37-57eb-a000-957166677c83', name: 'りた。', type: 'type1', style: 'casual', imageCount: 6 },
    { id: '649c2749-825f-5848-a5c7-96dead7950ea', name: 'あんず', type: 'type2', style: 'matter-of-fact', imageCount: 6 },
    { id: '70ad24b3-70ad-54df-94ed-8ad696b6f4d2', name: '捜索ボラ', type: 'type2', style: 'reflective', imageCount: 5 },
    { id: '27de7033-665e-5060-bafa-e4aed971e69c', name: '麻衣子@1型', type: 'type1', style: 'detail', imageCount: 5 },
    { id: '43cddd28-0440-54a7-b3b5-87a8a4623507', name: 'まりな', type: 'type2', style: 'casual', imageCount: 5 },
    { id: '52eddc2c-aa88-5e62-a227-139b8887696c', name: '花音🌻hanon', type: 'type2', style: 'positive', imageCount: 5 },
    { id: '6ca9558c-e08f-5318-ae91-4ff74ae400e1', name: 'からゆうたろう', type: 'type2', style: 'matter-of-fact', imageCount: 5 },
    { id: '5c742ce8-46e9-5195-84b2-2988893e7a29', name: 'ぱふ', type: 'type2', style: 'casual', imageCount: 5 },
    { id: '6b77d0a7-e272-5075-be52-262fdf386cf1', name: 'かわちゃん', type: 'type2', style: 'positive', imageCount: 5 },
  ],
  // 準アクティブ層（5名）: 2〜3枚ずつ
  semi_active: [
    { id: '28c65a26-798b-526e-ad0f-8fb1ebef8e78', name: 'おかわり', type: 'type2', style: 'casual', imageCount: 3 },
    { id: '359601e4-5485-5193-bbd0-67134e36ab56', name: 'ナミキ', type: 'type2', style: 'matter-of-fact', imageCount: 3 },
    { id: '6e142c0e-7b84-54f0-bb2b-96091c2d8b9a', name: 'マローダ19xx', type: 'type2', style: 'casual', imageCount: 2 },
    { id: '41a81305-9897-5aa9-b325-0c7f681b7c97', name: '桃の香り', type: 'type2', style: 'positive', imageCount: 2 },
    { id: '66124db1-411c-5183-861d-c8e0fd379c6f', name: 'アリサ🎇', type: 'type2', style: 'casual', imageCount: 2 },
  ]
}

/**
 * タグ生成ルール
 */
const CATEGORY_TAGS = {
  set_meal: ['定食', '外食', 'ランチ', 'バランス'],
  donburi: ['丼もの', 'がっつり', 'お昼ごはん'],
  noodles: ['麺類', 'ラーメン', 'うどん', '温かい'],
  salad_vegetable: ['サラダ', '野菜', 'ヘルシー', '糖質制限'],
  meat_main: ['肉', 'たんぱく質', 'がっつり'],
  seafood_sashimi: ['魚', '刺身', '海鮮', 'たんぱく質'],
  japanese_side: ['和食', '煮物', '家庭料理'],
  cafe_light: ['カフェ', '軽食', 'ブランチ'],
  asian_cuisine: ['韓国料理', '中華', 'アジア飯', '野菜たっぷり'],
  onigiri_simple: ['おにぎり', '軽め', '簡単']
}

const MOOD_TAGS = {
  homemade: '手作り',
  eating_out: '外食',
  light: '軽め',
  hearty: 'ボリューム',
  healthy: 'ヘルシー',
  casual: 'カジュアル',
  special: '特別な日'
}

/**
 * 血糖値生成ルール（30-40%のポストにのみ付与）
 */
function shouldHaveBloodSugar() {
  return Math.random() < 0.35 // 35%の確率
}

function generateBloodSugar(category) {
  // カテゴリに応じた血糖値の傾向
  const baseRanges = {
    donburi: { min: 140, max: 200 },       // 丼物は高め
    noodles: { min: 130, max: 180 },       // 麺類も高め
    onigiri_simple: { min: 120, max: 160 }, // おにぎりは中程度
    cafe_light: { min: 110, max: 150 },    // カフェは低め〜中
    set_meal: { min: 110, max: 160 },      // 定食はまあまあ
    salad_vegetable: { min: 90, max: 130 }, // サラダは低め
    meat_main: { min: 100, max: 140 },     // 肉は低め
    seafood_sashimi: { min: 90, max: 130 }, // 魚は低め
    japanese_side: { min: 100, max: 140 },  // 和食は低め
    asian_cuisine: { min: 110, max: 160 }   // アジアは中程度
  }

  const range = baseRanges[category] || { min: 100, max: 160 }
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
}

/**
 * 投稿日時生成（2025-12〜2026-03）
 * JST（日本時間）で自然な食事時間帯に分散
 */
function generatePostedAt(globalImageIndex, totalAssignments) {
  // 期間: 2025-12-01 ~ 2026-03-20 (約110日間)
  const startDate = new Date('2025-12-01T00:00:00+09:00')
  const endDate = new Date('2026-03-20T00:00:00+09:00')
  const totalDays = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000))

  // 画像を全期間に均等に分散
  const dayIndex = Math.floor((globalImageIndex / totalAssignments) * totalDays)
  const randomDayOffset = Math.floor(Math.random() * 5) - 2 // ±2日の揺らぎ

  const targetDay = Math.max(0, Math.min(totalDays - 1, dayIndex + randomDayOffset))
  const date = new Date(startDate.getTime() + targetDay * 24 * 60 * 60 * 1000)

  // 食事の時間帯を設定（JST: 朝7-9時、昼12-14時、夕18-20時）
  // UTC換算: 朝-2〜0時、昼3〜5時、夕9〜11時
  const mealTimesUTC = [
    { hour: 22, variance: 2 },  // JST朝7-9時 = UTC前日22-24時
    { hour: 3, variance: 2 },   // JST昼12-14時 = UTC 3-5時
    { hour: 9, variance: 2 }    // JST夕18-20時 = UTC 9-11時
  ]
  const mealTime = mealTimesUTC[Math.floor(Math.random() * mealTimesUTC.length)]
  const hour = mealTime.hour + Math.floor(Math.random() * mealTime.variance)
  const minute = Math.floor(Math.random() * 60)

  date.setUTCHours(hour, minute, 0, 0)

  return date.toISOString()
}

/**
 * タグ生成
 */
function generateTags(image) {
  const tags = []

  // カテゴリから1-2個
  const catTags = CATEGORY_TAGS[image.category] || []
  const numCatTags = Math.min(catTags.length, 1 + Math.floor(Math.random() * 2))
  const shuffledCatTags = [...catTags].sort(() => Math.random() - 0.5)
  tags.push(...shuffledCatTags.slice(0, numCatTags))

  // mood_styleから0-1個
  if (image.mood_style && Math.random() > 0.5) {
    const mood = image.mood_style[Math.floor(Math.random() * image.mood_style.length)]
    if (MOOD_TAGS[mood]) {
      tags.push(MOOD_TAGS[mood])
    }
  }

  return [...new Set(tags)] // 重複排除
}

/**
 * キャプション選択（comment_poolから）
 */
function selectCaption(image, commentPools) {
  const poolName = image.comment_pool
  const pool = commentPools[poolName] || []

  if (pool.length === 0) return ''

  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== 食事画像 ユーザー割り当て ===\n')
  console.log('モード:', isExecute ? '🔴 本番実行' : '🔵 DRY RUN')
  console.log('')

  // データ読み込み
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  const images = data.images
  const commentPools = data.comment_pools

  console.log(`総画像数: ${images.length}`)

  // 使用する画像を選定（113枚中約80枚）
  // カテゴリのバランスを保つ
  const categoryImages = {}
  for (const img of images) {
    if (!categoryImages[img.category]) categoryImages[img.category] = []
    categoryImages[img.category].push(img)
  }

  // 各カテゴリから何枚使うか計算
  const categoryUsage = {}
  let totalToUse = 0
  for (const [cat, imgs] of Object.entries(categoryImages)) {
    // 各カテゴリの70%を使用
    const useCount = Math.ceil(imgs.length * 0.70)
    categoryUsage[cat] = useCount
    totalToUse += useCount
  }

  console.log(`\n使用予定画像: ${totalToUse}枚`)
  console.log('カテゴリ別:')
  for (const [cat, count] of Object.entries(categoryUsage)) {
    console.log(`  ${cat}: ${count}/${categoryImages[cat].length}枚`)
  }

  // ユーザー配列を作成
  const allUsers = [...TARGET_USERS.core, ...TARGET_USERS.semi_active]
  const totalNeeded = allUsers.reduce((sum, u) => sum + u.imageCount, 0)

  console.log(`\n必要画像数: ${totalNeeded}枚 (17ユーザー)`)
  console.log('  コア層 (12名):', TARGET_USERS.core.reduce((sum, u) => sum + u.imageCount, 0), '枚')
  console.log('  準アクティブ層 (5名):', TARGET_USERS.semi_active.reduce((sum, u) => sum + u.imageCount, 0), '枚')

  // 画像をシャッフル
  const shuffledImages = [...images].sort(() => Math.random() - 0.5)

  // ユーザーごとに割り当て
  const assignments = []
  let imageIndex = 0
  let globalAssignmentIndex = 0 // 全体での割り当て番号
  const usedCategories = {} // ユーザーごとのカテゴリ使用回数

  for (let userIdx = 0; userIdx < allUsers.length; userIdx++) {
    const user = allUsers[userIdx]
    usedCategories[user.id] = {}

    let assignedCount = 0
    let attempts = 0
    const maxAttempts = shuffledImages.length

    while (assignedCount < user.imageCount && attempts < maxAttempts) {
      const img = shuffledImages[imageIndex % shuffledImages.length]
      imageIndex++
      attempts++

      // 既に割り当て済みならスキップ
      if (img.assigned_user_id) continue

      // 同じカテゴリが3回以上ならスキップ（自然さのため）
      const catCount = usedCategories[user.id][img.category] || 0
      if (catCount >= 2 && user.imageCount > 3) {
        // 他の画像を探す
        continue
      }

      // 割り当て
      img.assigned_user_id = user.id
      img.assigned_user_name = user.name
      img.caption = selectCaption(img, commentPools)
      img.tags = generateTags(img)
      img.posted_at = generatePostedAt(globalAssignmentIndex, totalNeeded)

      if (shouldHaveBloodSugar()) {
        img.blood_sugar_after = generateBloodSugar(img.category)
      }

      usedCategories[user.id][img.category] = catCount + 1
      assignedCount++
      globalAssignmentIndex++

      assignments.push({
        image_id: img.id,
        file_name: img.file_name,
        user_name: user.name,
        category: img.category,
        caption: img.caption,
        tags: img.tags,
        blood_sugar: img.blood_sugar_after,
        posted_at: img.posted_at
      })
    }
  }

  // 結果表示
  console.log(`\n=== 割り当て結果 ===`)
  console.log(`割り当て済み: ${assignments.length}枚`)

  // ユーザー別集計
  const byUser = {}
  for (const a of assignments) {
    if (!byUser[a.user_name]) byUser[a.user_name] = { count: 0, categories: {} }
    byUser[a.user_name].count++
    byUser[a.user_name].categories[a.category] = (byUser[a.user_name].categories[a.category] || 0) + 1
  }

  console.log('\n【ユーザー別】')
  for (const [name, info] of Object.entries(byUser)) {
    const cats = Object.entries(info.categories).map(([c, n]) => `${c}:${n}`).join(', ')
    console.log(`  ${name}: ${info.count}枚 (${cats})`)
  }

  // blood_sugar_after の集計
  const withBloodSugar = assignments.filter(a => a.blood_sugar)
  console.log(`\n【血糖値あり】: ${withBloodSugar.length}枚 (${(withBloodSugar.length / assignments.length * 100).toFixed(1)}%)`)

  // 投稿日時の分布
  const byMonth = {}
  for (const a of assignments) {
    const month = a.posted_at.substring(0, 7)
    byMonth[month] = (byMonth[month] || 0) + 1
  }
  console.log('\n【月別分布】')
  for (const [month, count] of Object.entries(byMonth).sort()) {
    console.log(`  ${month}: ${count}枚`)
  }

  // サンプル表示
  console.log('\n【サンプル（先頭5件）】')
  for (const a of assignments.slice(0, 5)) {
    console.log(`  ${a.file_name}`)
    console.log(`    → ${a.user_name}`)
    console.log(`    → "${a.caption}"`)
    console.log(`    → tags: [${a.tags.join(', ')}]`)
    console.log(`    → 血糖: ${a.blood_sugar || '-'}, 日時: ${a.posted_at}`)
  }

  if (!isExecute) {
    console.log('\n🔵 DRY RUN 完了')
    console.log('本番実行するには: node scripts/assign-meal-images.js --execute')
    return
  }

  // 本番実行: JSONに保存
  data.summary.assigned = assignments.length
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))

  console.log('\n🔴 本番実行完了')
  console.log(`meal-posts-ready.json を更新しました`)
  console.log(`割り当て済み: ${assignments.length}枚`)
}

main().catch(console.error)
