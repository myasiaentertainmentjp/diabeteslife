/**
 * meal_posts テーブルへの食事画像データ投入スクリプト
 *
 * 使い方:
 *   node scripts/insert-meal-posts.js          # DRY RUN（確認のみ）
 *   node scripts/insert-meal-posts.js --execute  # 本番実行
 */

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const DATA_FILE = '/Users/koji/diabeteslife-nextjs/scripts/meal-posts-ready.json'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const isExecute = process.argv.includes('--execute')

/**
 * ユーザー情報を取得（diabetes_type, age_group）
 */
async function getUserProfiles(userIds) {
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, diabetes_type, age_group')
    .in('user_id', userIds)

  const profileMap = new Map()
  for (const p of profiles || []) {
    profileMap.set(p.user_id, {
      diabetes_type: p.diabetes_type || 'type2',
      age_group: p.age_group || '40s'
    })
  }
  return profileMap
}

/**
 * 既存のimage_urlを取得（重複チェック用）
 */
async function getExistingImageUrls() {
  const { data } = await supabase
    .from('meal_posts')
    .select('image_url')

  return new Set((data || []).map(d => d.image_url))
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== meal_posts INSERT ===\n')
  console.log('モード:', isExecute ? '🔴 本番実行' : '🔵 DRY RUN')
  console.log('')

  // データ読み込み
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  const images = data.images

  // INSERT対象: assigned_user_id あり AND inserted: false
  const toInsert = images.filter(img =>
    img.assigned_user_id &&
    img.public_url &&
    !img.inserted
  )

  console.log(`総画像数: ${images.length}`)
  console.log(`INSERT対象: ${toInsert.length}件`)
  console.log('')

  if (toInsert.length === 0) {
    console.log('✅ INSERT対象がありません')
    return
  }

  // ユーザー情報取得
  const userIds = [...new Set(toInsert.map(img => img.assigned_user_id))]
  const profileMap = await getUserProfiles(userIds)

  // 既存URL取得（重複チェック）
  const existingUrls = await getExistingImageUrls()

  // 重複チェック
  const duplicates = toInsert.filter(img => existingUrls.has(img.public_url))
  if (duplicates.length > 0) {
    console.log(`⚠️ 重複URL: ${duplicates.length}件`)
    for (const d of duplicates.slice(0, 5)) {
      console.log(`  - ${d.file_name}`)
    }
    console.log('')
  }

  // 重複を除外
  const validInserts = toInsert.filter(img => !existingUrls.has(img.public_url))
  console.log(`重複除外後: ${validInserts.length}件\n`)

  // ユーザー別集計
  const byUser = {}
  for (const img of validInserts) {
    const name = img.assigned_user_name || 'unknown'
    byUser[name] = (byUser[name] || 0) + 1
  }

  console.log('【ユーザー別件数】')
  for (const [name, count] of Object.entries(byUser)) {
    console.log(`  ${name}: ${count}件`)
  }
  console.log('')

  // サンプル表示
  console.log('【サンプル（先頭5件）】')
  for (const img of validInserts.slice(0, 5)) {
    const profile = profileMap.get(img.assigned_user_id) || {}
    console.log(`  ${img.file_name}`)
    console.log(`    user: ${img.assigned_user_name}`)
    console.log(`    caption: "${img.caption}"`)
    console.log(`    tags: [${img.tags.join(', ')}]`)
    console.log(`    blood_sugar: ${img.blood_sugar_after || '-'}`)
    console.log(`    created_at: ${img.posted_at}`)
    console.log(`    diabetes_type: ${profile.diabetes_type || 'type2'}`)
    console.log('')
  }

  if (!isExecute) {
    console.log('🔵 DRY RUN 完了')
    console.log('本番実行するには: node scripts/insert-meal-posts.js --execute')
    return
  }

  // 本番実行
  console.log('INSERT開始...\n')
  let success = 0
  let failed = 0

  for (let i = 0; i < validInserts.length; i++) {
    const img = validInserts[i]
    const profile = profileMap.get(img.assigned_user_id) || {}

    const record = {
      user_id: img.assigned_user_id,
      image_url: img.public_url,
      caption: img.caption || '',
      tags: img.tags || [],
      blood_sugar_after: img.blood_sugar_after || null,
      is_public: true,
      likes_count: 0,
      comments_count: 0,
      created_at: img.posted_at,
      diabetes_type: profile.diabetes_type || 'type2',
      age_group: profile.age_group || '40s'
    }

    const { data: inserted, error } = await supabase
      .from('meal_posts')
      .insert(record)
      .select('id')
      .single()

    if (error) {
      console.log(`[${i + 1}/${validInserts.length}] ❌ ${img.file_name}: ${error.message}`)
      failed++
    } else {
      // JSONデータ更新
      img.inserted = true
      img.meal_post_id = inserted.id
      success++

      if ((i + 1) % 20 === 0) {
        console.log(`[${i + 1}/${validInserts.length}] ✅ ${success}件完了`)
      }
    }
  }

  // JSON保存
  data.summary.inserted = images.filter(img => img.inserted).length
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))

  console.log('\n=== INSERT完了 ===')
  console.log(`  成功: ${success}件`)
  console.log(`  失敗: ${failed}件`)
  console.log(`  合計INSERT済み: ${data.summary.inserted}件`)

  // 確認用クエリ
  const { count } = await supabase
    .from('meal_posts')
    .select('*', { count: 'exact', head: true })

  console.log(`\nmeal_posts テーブル総件数: ${count}`)
}

main().catch(console.error)
