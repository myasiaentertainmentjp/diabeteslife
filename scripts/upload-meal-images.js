/**
 * 食事画像を Supabase Storage にアップロードし、public_url を埋める
 *
 * 使い方:
 *   node scripts/upload-meal-images.js          # DRY RUN
 *   node scripts/upload-meal-images.js --execute  # 本番実行
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const STORAGE_BUCKET = 'images'
const DATA_FILE = '/Users/koji/diabeteslife-nextjs/scripts/meal-posts-ready.json'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const isExecute = process.argv.includes('--execute')

async function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  }
  return mimeTypes[ext] || 'image/jpeg'
}

async function uploadImage(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath)
  const mimeType = await getMimeType(localPath)

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true // 既存ファイルは上書き
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // public URL を生成
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath)

  return urlData.publicUrl
}

async function main() {
  console.log('=== 食事画像 Supabase Storage アップロード ===\n')
  console.log('モード:', isExecute ? '🔴 本番実行' : '🔵 DRY RUN')
  console.log('')

  // データ読み込み
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  const images = data.images

  // 未アップロードのみ対象
  const toUpload = images.filter(img => !img.uploaded)
  console.log(`対象画像: ${toUpload.length}枚（未アップロード）`)
  console.log(`アップロード済み: ${images.length - toUpload.length}枚\n`)

  if (toUpload.length === 0) {
    console.log('✅ すべてアップロード済みです')
    return
  }

  // DRY RUN: 最初の5件を表示
  if (!isExecute) {
    console.log('【アップロード予定（先頭5件）】')
    for (const img of toUpload.slice(0, 5)) {
      console.log(`  ${img.file_name}`)
      console.log(`    → ${img.storage_path}`)
      console.log(`    → ${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${img.storage_path}`)
    }
    console.log('')
    console.log('🔵 DRY RUN 完了')
    console.log('本番実行するには: node scripts/upload-meal-images.js --execute')
    return
  }

  // 本番実行
  console.log('アップロード開始...\n')
  let success = 0
  let failed = 0

  for (let i = 0; i < toUpload.length; i++) {
    const img = toUpload[i]
    const progress = `[${i + 1}/${toUpload.length}]`

    try {
      // ファイル存在確認
      if (!fs.existsSync(img.local_path)) {
        console.log(`${progress} ❌ ファイルなし: ${img.file_name}`)
        failed++
        continue
      }

      // アップロード
      const publicUrl = await uploadImage(img.local_path, img.storage_path)

      // データ更新
      img.public_url = publicUrl
      img.uploaded = true

      console.log(`${progress} ✅ ${img.file_name}`)
      success++

      // 10件ごとに保存
      if ((i + 1) % 10 === 0) {
        data.summary.uploaded = images.filter(img => img.uploaded).length
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
        console.log(`    💾 中間保存 (${data.summary.uploaded}/${images.length})`)
      }

    } catch (err) {
      console.log(`${progress} ❌ エラー: ${img.file_name} - ${err.message}`)
      failed++
    }
  }

  // 最終保存
  data.summary.uploaded = images.filter(img => img.uploaded).length
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))

  console.log('\n=== アップロード完了 ===')
  console.log(`  成功: ${success}枚`)
  console.log(`  失敗: ${failed}枚`)
  console.log(`  合計アップロード済み: ${data.summary.uploaded}/${images.length}枚`)
}

main().catch(console.error)
