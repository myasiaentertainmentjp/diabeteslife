/**
 * meal_posts の caption / tags を CSV から更新するスクリプト
 *
 * 使い方:
 *   DRY RUN:  node scripts/update-meal-captions.js
 *   本番実行: node scripts/update-meal-captions.js --execute
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// CSV path
const CSV_PATH = '/Users/koji/Downloads/dlife_image_comments.csv'

// Parse hashtags string to array
// "#和食 #定食" → ["和食", "定食"]
function parseHashtags(hashtagsStr) {
  if (!hashtagsStr || hashtagsStr.trim() === '') return []

  // Split by space or # and filter
  return hashtagsStr
    .split(/[\s　]+/)  // space or full-width space
    .map(tag => tag.replace(/^#/, '').trim())
    .filter(tag => tag.length > 0)
}

// Extract filename from URL
// https://.../meal-posts/IMG_0001.jpg → IMG_0001.jpg
function extractFilename(url) {
  if (!url) return null
  const parts = url.split('/')
  return parts[parts.length - 1]
}

// Parse CSV (simple parser for this format)
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n')
  const header = lines[0].replace(/^\uFEFF/, '') // Remove BOM if present
  const headerParts = header.split(',')

  const records = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Simple CSV parsing (assuming no commas in values)
    const parts = line.split(',')
    if (parts.length >= 3) {
      records.push({
        file_name: parts[0].trim(),
        comment: parts[1].trim(),
        hashtags: parts.slice(2).join(',').trim()  // In case hashtags contain commas
      })
    }
  }
  return records
}

async function main() {
  const isExecute = process.argv.includes('--execute')

  console.log('='.repeat(60))
  console.log('meal_posts caption/tags 更新スクリプト')
  console.log(isExecute ? '【本番実行モード】' : '【DRY RUN モード】')
  console.log('='.repeat(60))
  console.log()

  // 1. Read CSV
  console.log('① CSV読み込み中...')
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSVファイルが見つかりません: ${CSV_PATH}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const csvRecords = parseCSV(csvContent)
  console.log(`   CSV件数: ${csvRecords.length}件`)
  console.log()

  // Create lookup map
  const csvMap = new Map()
  for (const rec of csvRecords) {
    csvMap.set(rec.file_name, rec)
  }

  // 2. Get all meal_posts
  console.log('② meal_posts 取得中...')
  const { data: mealPosts, error } = await supabase
    .from('meal_posts')
    .select('id, image_url, caption, tags')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('meal_posts取得エラー:', error)
    process.exit(1)
  }

  console.log(`   meal_posts件数: ${mealPosts.length}件`)
  console.log()

  // 3. Match and prepare updates
  console.log('③ 照合中...')
  const toUpdate = []
  const notInCSV = []
  const notInDB = new Set(csvMap.keys())

  for (const post of mealPosts) {
    const filename = extractFilename(post.image_url)

    if (csvMap.has(filename)) {
      const csvRec = csvMap.get(filename)
      const newTags = parseHashtags(csvRec.hashtags)

      toUpdate.push({
        id: post.id,
        filename: filename,
        oldCaption: post.caption,
        newCaption: csvRec.comment,
        oldTags: post.tags || [],
        newTags: newTags,
      })

      notInDB.delete(filename)
    } else {
      notInCSV.push({
        id: post.id,
        filename: filename,
        image_url: post.image_url,
      })
    }
  }

  console.log()
  console.log('='.repeat(60))
  console.log('④ 照合結果サマリー')
  console.log('='.repeat(60))
  console.log(`   ✅ 更新対象 (CSVとマッチ): ${toUpdate.length}件`)
  console.log(`   ⚠️  CSVに未記載 (DBのみ存在): ${notInCSV.length}件`)
  console.log(`   ❌ DBに未存在 (CSVのみ存在): ${notInDB.size}件`)
  console.log()

  // 5. Show sample updates
  console.log('='.repeat(60))
  console.log('⑤ 更新サンプル (先頭5件)')
  console.log('='.repeat(60))
  for (let i = 0; i < Math.min(5, toUpdate.length); i++) {
    const u = toUpdate[i]
    console.log(`[${i + 1}] ${u.filename}`)
    console.log(`    caption: "${u.oldCaption || '(空)'}" → "${u.newCaption}"`)
    console.log(`    tags: [${(u.oldTags || []).join(', ')}] → [${u.newTags.join(', ')}]`)
    console.log()
  }

  // 6. Show unmatched files
  if (notInCSV.length > 0) {
    console.log('='.repeat(60))
    console.log('⑥ CSVに未記載のファイル (DBのみ存在)')
    console.log('='.repeat(60))
    for (const item of notInCSV) {
      console.log(`   - ${item.filename}`)
    }
    console.log()
  }

  if (notInDB.size > 0) {
    console.log('='.repeat(60))
    console.log('⑦ DBに未存在のファイル (CSVのみ存在)')
    console.log('='.repeat(60))
    for (const filename of notInDB) {
      console.log(`   - ${filename}`)
    }
    console.log()
  }

  // 7. Execute if flag is set
  if (isExecute) {
    console.log('='.repeat(60))
    console.log('⑧ 本番更新実行中...')
    console.log('='.repeat(60))

    let successCount = 0
    let errorCount = 0

    for (const u of toUpdate) {
      const { error: updateError } = await supabase
        .from('meal_posts')
        .update({
          caption: u.newCaption,
          tags: u.newTags
        })
        .eq('id', u.id)

      if (updateError) {
        console.error(`   ❌ ${u.filename}: ${updateError.message}`)
        errorCount++
      } else {
        successCount++
      }
    }

    console.log()
    console.log('='.repeat(60))
    console.log('⑨ 更新完了')
    console.log('='.repeat(60))
    console.log(`   ✅ 成功: ${successCount}件`)
    console.log(`   ❌ 失敗: ${errorCount}件`)
    console.log()
  } else {
    console.log('='.repeat(60))
    console.log('【DRY RUN完了】')
    console.log('本番実行するには: node scripts/update-meal-captions.js --execute')
    console.log('='.repeat(60))
  }
}

main().catch(console.error)
