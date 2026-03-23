/**
 * 外部画像由来のmeal_postsを削除するスクリプト
 * バックアップを取ってから削除
 */

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const idsToDelete = [
  'e2bce87e-37ad-44d5-bde6-7966a3afb107',
  '9e3a4604-5358-4d28-afc7-8f22fd809d2b',
  'de2d0171-3898-49fa-98ca-feffb1c8911b',
  '1cf1f340-ab00-4151-b55c-97381429e47e',
  'b0b6dddc-fbda-4fb2-ab3b-a8b9e3073ac8',
  'd91ee925-6e47-40e7-80d3-4c4d97f98de7',
  'ce8816a3-8c8d-4179-8cb7-4bc0c36fe7e6',
  '5742086b-32a7-45fd-b55d-1f6e7e35f995',
  '0efe899e-b4cc-4f41-861c-f1a10c5c1c66',
  '47ddd67d-3214-4011-8122-296eaead6455',
  '47f186af-dee5-4716-8ebc-2a0b92df6adf',
  '8dc5f8c4-29c4-41e7-9bfb-aec78592d74d'
]

async function main() {
  console.log('=== 外部画像由来 meal_posts 削除 ===\n')

  // Step 1: バックアップ
  console.log('【Step 1: バックアップ取得】')
  const { data: backup, error: backupError } = await supabase
    .from('meal_posts')
    .select('*')
    .in('id', idsToDelete)

  if (backupError) {
    console.log('バックアップエラー:', backupError.message)
    return
  }

  if (!backup || backup.length === 0) {
    console.log('対象レコードが見つかりません（既に削除済み？）')
    return
  }

  fs.writeFileSync(
    '/Users/koji/diabeteslife-nextjs/scripts/meal-posts-backup-old.json',
    JSON.stringify(backup, null, 2)
  )
  console.log('  バックアップ保存:', backup.length, '件')
  console.log('  ファイル: scripts/meal-posts-backup-old.json')

  // Step 2: 削除
  console.log('\n【Step 2: 削除実行】')
  const { error: deleteError } = await supabase
    .from('meal_posts')
    .delete()
    .in('id', idsToDelete)

  if (deleteError) {
    console.log('削除エラー:', deleteError.message)
    return
  }

  console.log('  削除完了:', idsToDelete.length, '件')

  // Step 3: 確認
  console.log('\n【Step 3: 結果確認】')
  const { count } = await supabase
    .from('meal_posts')
    .select('*', { count: 'exact', head: true })

  console.log('  残り件数:', count, '件')

  // ユーザー別集計
  const { data: remaining } = await supabase
    .from('meal_posts')
    .select('user_id, users(display_name)')

  const byUser = {}
  for (const r of remaining || []) {
    const name = r.users?.display_name || 'unknown'
    byUser[name] = (byUser[name] || 0) + 1
  }

  console.log('\n【ユーザー別投稿数（上位10名）】')
  const sorted = Object.entries(byUser).sort((a, b) => b[1] - a[1])
  for (const [name, cnt] of sorted.slice(0, 10)) {
    console.log('  ' + name + ':', cnt, '件')
  }

  console.log('\n✅ 完了')
}

main().catch(console.error)
