/**
 * Phase 3: 日記記録の現状確認スクリプト
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// コアユーザー20名
const CORE_USERS = [
  { id: '9516c386-2cc6-53ba-8691-396ed2abff89', name: 'たこ🐙', type: 'type2' },
  { id: '649c2749-825f-5848-a5c7-96dead7950ea', name: 'あんず', type: 'type2' },
  { id: '70ad24b3-70ad-54df-94ed-8ad696b6f4d2', name: '捜索ボラ', type: 'type2' },
  { id: '8108dd63-ac37-57eb-a000-957166677c83', name: 'りた。', type: 'type1' },
  { id: '2033ee1c-28b2-5187-8ba1-c94f7964e33e', name: 'Ash🌈🦢', type: 'type2' },
  { id: '41cf3d7f-9ac1-5151-9417-c3bfa7afeda0', name: '仲夏トト', type: 'type2' },
  { id: '27de7033-665e-5060-bafa-e4aed971e69c', name: '麻衣子@1型', type: 'type1' },
  { id: '6b77d0a7-e272-5075-be52-262fdf386cf1', name: 'かわちゃん', type: 'type2' },
  { id: '6ca9558c-e08f-5318-ae91-4ff74ae400e1', name: 'からゆうたろう', type: 'type2' },
  { id: '86c6897a-ecb0-5df3-bd51-42cb87202f78', name: 'なな＊', type: 'type2' },
  { id: '5c742ce8-46e9-5195-84b2-2988893e7a29', name: 'ぱふ', type: 'type2' },
  { id: '1ef47199-b5ca-5676-b707-094fb74dfb29', name: 'すば', type: 'type2' },
  { id: '43cddd28-0440-54a7-b3b5-87a8a4623507', name: 'まりな', type: 'type2' },
  { id: '71325971-dac7-5495-9361-48a241d5ff15', name: 'はいせ', type: 'type1' },
  { id: '52eddc2c-aa88-5e62-a227-139b8887696c', name: '花音🌻hanon', type: 'type2' },
  { id: '25c04963-f5cf-53a8-b8b4-8de16531d204', name: 'ドゥジ', type: 'type2' },
  { id: '37549bb9-c9e9-5b7c-b44e-ef43f58149de', name: '大逆無道', type: 'type2' },
  { id: '08b928d5-48dd-530a-a87f-c99f9be17971', name: '猫好き 😸', type: 'type2' },
  { id: '2ea07739-a00d-59c4-a47f-86a6ed6da68b', name: 'きりんれもん', type: 'type2' },
  { id: '5a3ee246-2604-53d4-9d80-5339b63e6e29', name: '青空の夢🌸', type: 'type2' },
]

async function check() {
  console.log('=== Phase 3: 日記記録の現状確認 ===\n')

  const userIds = CORE_USERS.map(u => u.id)

  // 1. 既存の日記スレッド確認
  const { data: diaryThreads } = await supabase
    .from('threads')
    .select('id, user_id, title, created_at')
    .eq('mode', 'diary')
    .in('user_id', userIds)

  console.log('=== 既存の日記スレッド ===')
  console.log(`  日記スレッドを持つユーザー: ${diaryThreads?.length || 0}名`)

  // 2. 既存の日記エントリ確認
  const diaryThreadIds = diaryThreads?.map(t => t.id) || []
  let diaryEntries = []
  if (diaryThreadIds.length > 0) {
    const { data } = await supabase
      .from('diary_entries')
      .select('id, thread_id, user_id, created_at')
      .in('thread_id', diaryThreadIds)
    diaryEntries = data || []
  }

  console.log(`  既存の日記エントリ: ${diaryEntries.length}件\n`)

  // 3. 各ユーザーの活動状況を確認
  const { data: threads } = await supabase
    .from('threads')
    .select('id, user_id')
    .in('user_id', userIds)

  const { data: comments } = await supabase
    .from('comments')
    .select('id, user_id')
    .in('user_id', userIds)

  const { data: weightRecords } = await supabase
    .from('weight_records')
    .select('id, user_id')
    .in('user_id', userIds)

  const { data: hba1cRecords } = await supabase
    .from('hba1c_records')
    .select('id, user_id')
    .in('user_id', userIds)

  // ユーザーごとの活動集計
  const userActivity = new Map()
  for (const u of CORE_USERS) {
    userActivity.set(u.id, {
      name: u.name,
      type: u.type,
      threads: 0,
      comments: 0,
      weightRecords: 0,
      hba1cRecords: 0,
      diaryThread: null,
      diaryEntries: 0,
    })
  }

  for (const t of threads || []) {
    const act = userActivity.get(t.user_id)
    if (act) act.threads++
  }

  for (const c of comments || []) {
    const act = userActivity.get(c.user_id)
    if (act) act.comments++
  }

  for (const w of weightRecords || []) {
    const act = userActivity.get(w.user_id)
    if (act) act.weightRecords++
  }

  for (const h of hba1cRecords || []) {
    const act = userActivity.get(h.user_id)
    if (act) act.hba1cRecords++
  }

  for (const dt of diaryThreads || []) {
    const act = userActivity.get(dt.user_id)
    if (act) act.diaryThread = dt.id
  }

  for (const de of diaryEntries) {
    const act = userActivity.get(de.user_id)
    if (act) act.diaryEntries++
  }

  // 活動スコアを計算（日記追加優先度判定用）
  console.log('=== ユーザー別活動状況 ===')
  console.log('名前             | タイプ | スレ | コメ | 体重 | A1c | 日記 | 活動スコア')
  console.log('-'.repeat(85))

  const activityList = []
  for (const [userId, act] of userActivity.entries()) {
    // 活動スコア = スレッド×3 + コメント×1 + 体重×0.5 + HbA1c×2
    const score = act.threads * 3 + act.comments * 1 + act.weightRecords * 0.5 + act.hba1cRecords * 2
    activityList.push({ userId, ...act, score })
  }

  // スコア順でソート
  activityList.sort((a, b) => b.score - a.score)

  for (const act of activityList) {
    const name = act.name.substring(0, 15).padEnd(15)
    const diaryStatus = act.diaryThread ? `${act.diaryEntries}件` : '-'
    console.log(
      `${name} | ${act.type.padEnd(6)} | ${String(act.threads).padStart(4)} | ` +
      `${String(act.comments).padStart(4)} | ${String(act.weightRecords).padStart(4)} | ` +
      `${String(act.hba1cRecords).padStart(3)} | ${diaryStatus.padStart(4)} | ${act.score.toFixed(1)}`
    )
  }

  // 4. 日記追加推奨ユーザーを提案
  console.log('\n=== 日記追加推奨ユーザー（上位12名）===')
  const recommended = activityList
    .filter(a => a.diaryEntries === 0) // 既存日記がない
    .slice(0, 12)

  console.log('順 | 名前             | タイプ | スコア | 理由')
  console.log('-'.repeat(70))

  for (let i = 0; i < recommended.length; i++) {
    const r = recommended[i]
    let reason = ''
    if (r.weightRecords > 30) reason = '体重記録多数'
    else if (r.hba1cRecords > 3) reason = 'HbA1c記録あり'
    else if (r.threads > 5) reason = 'スレッド多数'
    else if (r.comments > 10) reason = 'コメント多数'
    else reason = 'バランス良い活動'

    console.log(
      `${String(i + 1).padStart(2)} | ${r.name.substring(0, 15).padEnd(15)} | ${r.type.padEnd(6)} | ${r.score.toFixed(1).padStart(5)} | ${reason}`
    )
  }

  console.log('\n✅ 確認完了')
}

check().catch(console.error)
