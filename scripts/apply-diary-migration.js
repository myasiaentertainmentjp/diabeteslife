/**
 * diary_entries マイグレーション適用スクリプト
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigration() {
  console.log('=== diary_entries マイグレーション適用 ===\n')

  // 1. 現在の状態を確認
  console.log('1. カラム状態を確認...')
  const { data: sample } = await supabase
    .from('diary_entries')
    .select('*')
    .limit(1)

  if (sample && sample.length > 0) {
    console.log('   現在のカラム:', Object.keys(sample[0]).join(', '))
  }

  // 2. title が既にあるか確認
  const hasTitle = sample && sample[0] && 'title' in sample[0]
  const hasMood = sample && sample[0] && 'mood' in sample[0]

  console.log('   title カラム:', hasTitle ? '存在' : 'なし')
  console.log('   mood カラム:', hasMood ? '存在' : 'なし')

  // 3. titleがない場合、手動実行を案内
  if (!hasTitle) {
    console.log('\n title カラムが存在しません。')
    console.log('   Supabase SQL Editor で以下を実行してください:')
    console.log('')
    console.log('   ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS title TEXT;')
    console.log('   ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS mood TEXT;')
    console.log('')
    return
  }

  // 4. title が null のエントリを更新
  console.log('\n2. title が null のエントリを確認...')
  const { data: nullTitles, count } = await supabase
    .from('diary_entries')
    .select('id, content', { count: 'exact' })
    .is('title', null)

  console.log('   title が null のエントリ:', count, '件')

  if (nullTitles && nullTitles.length > 0) {
    console.log('\n3. title を content から生成して更新...')
    let updated = 0
    for (const entry of nullTitles) {
      // content の先頭20文字をtitleに
      const title = entry.content.slice(0, 20)
      const { error } = await supabase
        .from('diary_entries')
        .update({ title })
        .eq('id', entry.id)

      if (!error) updated++
    }
    console.log('   更新完了:', updated, '/', nullTitles.length, '件')
  }

  // 5. 最終確認
  console.log('\n4. 最終状態確認...')
  const { data: finalSample } = await supabase
    .from('diary_entries')
    .select('id, title, content, mood, created_at')
    .limit(5)

  console.log('\n=== サンプルエントリ ===')
  for (const e of finalSample || []) {
    const titleDisplay = e.title || '(なし)'
    const moodDisplay = e.mood || '-'
    console.log('  [' + (e.created_at?.slice(0, 10) || '') + '] title: "' + titleDisplay + '" | mood: ' + moodDisplay)
  }

  console.log('\n マイグレーション確認完了')
}

applyMigration().catch(console.error)
