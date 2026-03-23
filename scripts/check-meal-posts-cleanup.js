/**
 * meal_posts の整理対象を確認するスクリプト
 */

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function check() {
  // JSONから今回投入した meal_post_id を取得
  const data = JSON.parse(fs.readFileSync('/Users/koji/diabeteslife-nextjs/scripts/meal-posts-ready.json', 'utf8'))
  const newMealPostIds = new Set(
    data.images
      .filter(img => img.inserted && img.meal_post_id)
      .map(img => img.meal_post_id)
  )

  console.log('=== meal_posts 分類確認 ===')
  console.log('')
  console.log('【JSON: 今回投入分】')
  console.log('  meal_post_id 数:', newMealPostIds.size)

  // DBから全件取得
  const { data: allPosts, error } = await supabase
    .from('meal_posts')
    .select('id, user_id, image_url, caption, created_at, users(display_name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log('')
  console.log('【DB: 全 meal_posts】')
  console.log('  総件数:', allPosts?.length || 0)

  // 分類
  const posts = allPosts || []
  const newPosts = posts.filter(p => newMealPostIds.has(p.id))
  const oldPosts = posts.filter(p => !newMealPostIds.has(p.id))

  console.log('')
  console.log('【分類結果】')
  console.log('  今回投入分（残す）:', newPosts.length, '件')
  console.log('  既存分（除外対象）:', oldPosts.length, '件')

  console.log('')
  console.log('【除外対象一覧】')
  for (const p of oldPosts) {
    const urlShort = p.image_url.includes('unsplash') ? '[unsplash]' :
                     p.image_url.includes('placeholder') ? '[placeholder]' :
                     p.image_url.substring(0, 70)
    console.log('  id:', p.id)
    console.log('    user:', p.users?.display_name)
    console.log('    caption:', (p.caption || '').substring(0, 40))
    console.log('    image:', urlShort)
    console.log('    created:', p.created_at)
    console.log('')
  }

  // IDリスト出力
  console.log('【除外対象ID一覧（SQL用）】')
  const ids = oldPosts.map(p => "'" + p.id + "'").join(',\n  ')
  console.log(ids)
}

check().catch(console.error)
