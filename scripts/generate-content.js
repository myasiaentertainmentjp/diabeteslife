/**
 * Generate contextually appropriate dummy threads and comments
 * Based on user profiles (diabetes type, treatment, HbA1c, etc.)
 *
 * Usage:
 *   node scripts/generate-content.js --date 2026-01-17 --preview
 *   node scripts/generate-content.js --date 2026-01-17 --insert
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Categories
const CATEGORIES = [
  'treatment',
  'todays_meal',
  'food_recipe',
  'exercise_lifestyle',
  'mental_concerns',
  'free_talk'
]

// Thread templates by category
const THREAD_TEMPLATES = {
  treatment: [
    { title: 'インスリン注射のタイミングについて', content: '食前と食後、どちらがいいのか悩んでいます。皆さんはどうされていますか？' },
    { title: 'リブレのセンサーが剥がれやすい', content: '夏場は汗で剥がれやすくて困っています。何か良い対策ありますか？' },
    { title: '低血糖対策どうしてますか？', content: '外出時の低血糖が心配です。皆さんの対策を教えてください。' },
    { title: 'ポンプとペンどちらがいい？', content: 'インスリンポンプへの切り替えを検討中です。経験者の方、メリットデメリット教えてください。' },
    { title: 'HbA1cがなかなか下がらない', content: '食事も運動も頑張っているのに、なかなか改善しません。アドバイスお願いします。' },
    { title: '通院の頻度について', content: '皆さんはどのくらいの頻度で通院されていますか？月1回は多いでしょうか？' },
    { title: '夜間低血糖が怖い', content: '寝ている間の低血糖が不安です。何か対策されていますか？' },
    { title: '薬の副作用について', content: '新しい薬を始めてから胃の調子が悪いです。同じ経験された方いますか？' },
  ],
  todays_meal: [
    { title: '今日のお昼ご飯', content: '糖質控えめの和定食にしました。血糖値の上がり方が穏やかでした！' },
    { title: '朝食記録', content: '今日はオートミールと目玉焼き。食後血糖値も安定しています。' },
    { title: '外食ランチ', content: 'ファミレスでステーキランチ。ライス抜きでサラダ多めにしました。' },
    { title: '手作りお弁当', content: '野菜たっぷりのお弁当を作りました。見た目も彩りよくできました！' },
    { title: '夕食の献立', content: '今日は魚メインの和食。糖質量は控えめに抑えられました。' },
  ],
  food_recipe: [
    { title: '低糖質パンのレシピ', content: 'おからパウダーを使った低糖質パンを作りました。レシピ共有します！' },
    { title: '糖質オフスイーツ', content: 'ラカントを使ったチーズケーキのレシピです。罪悪感なく食べられます。' },
    { title: '野菜たっぷりスープ', content: '具沢山で満足感のあるスープのレシピです。血糖値にも優しい！' },
    { title: 'こんにゃく麺レシピ', content: 'こんにゃく麺を使った焼きそば風。カロリーも糖質も控えめです。' },
    { title: '鶏むね肉の簡単レシピ', content: '高タンパク低糖質な鶏むね肉のおすすめレシピを紹介します。' },
  ],
  exercise_lifestyle: [
    { title: 'ウォーキング始めました', content: '毎日30分のウォーキングを始めました。血糖値に良い影響出てきています。' },
    { title: '運動後の血糖値管理', content: '運動後に血糖値が下がりすぎることがあります。皆さんはどう対処していますか？' },
    { title: '筋トレと血糖値', content: '筋トレを始めてからインスリン抵抗性が改善してきた気がします。' },
    { title: '仕事中の運動不足', content: 'デスクワークで運動不足です。仕事中にできる運動はありますか？' },
    { title: '朝の散歩習慣', content: '朝食前の散歩を習慣にしています。血糖コントロールに効果的です。' },
  ],
  mental_concerns: [
    { title: '糖尿病の不安', content: '将来の合併症が不安です。同じ気持ちの方、お話しませんか？' },
    { title: '周囲の理解が得られない', content: '職場で糖尿病のことを理解してもらえず辛いです。' },
    { title: '食事制限のストレス', content: '好きなものが食べられないストレスが溜まっています。' },
    { title: '自己管理に疲れた', content: '毎日の血糖測定や食事管理に疲れてきました。皆さんはどうリフレッシュしていますか？' },
    { title: '診断されたばかりで不安', content: '最近糖尿病と診断されました。これからどうすればいいか不安です。' },
  ],
  free_talk: [
    { title: '今日の出来事', content: '糖尿病とは関係ないですが、今日あった嬉しいことをシェアします！' },
    { title: '週末の予定', content: '週末何されますか？私は家でゆっくり過ごす予定です。' },
    { title: '趣味の話', content: '皆さんの趣味は何ですか？私は最近読書にハマっています。' },
    { title: '季節の変わり目', content: '気温差で体調崩しやすい季節ですね。皆さんお気をつけて。' },
  ],
}

// Comment templates based on context
const COMMENT_TEMPLATES = {
  // Type 1 specific
  type1: [
    'インスリンの調整、私も苦労しています。一緒に頑張りましょう！',
    'ポンプユーザーですが、本当に便利ですよ。',
    '1型歴{years}年です。最初は大変でしたが、慣れてきました。',
    'カーボカウント、最初は難しかったですが今は慣れました。',
    '低血糖対策、私はブドウ糖を常に持ち歩いています。',
    'リブレ使ってますが、夜間の血糖値が見えるのは安心です。',
    'インスリンの効きが日によって違うの、あるあるですよね。',
  ],
  // Type 2 specific
  type2: [
    '2型歴{years}年です。食事療法で頑張っています。',
    '私も最初は薬だけでしたが、今はインスリンも使っています。',
    '運動を始めてから数値が改善してきました。',
    '食事の順番を変えるだけでも血糖値が違いますよね。',
    'メトホルミン飲んでいます。副作用も落ち着いてきました。',
    '糖質制限、最初は辛かったですが慣れてきました。',
    '体重を落としてから数値が良くなりました。',
  ],
  // Treatment specific
  pump: [
    'ポンプ歴{years}年です。QOLが上がりました！',
    'ポンプの設定、最初は試行錯誤でした。',
    '入浴時のポンプ管理、コツがありますよね。',
  ],
  libre: [
    'リブレ愛用しています。血糖値の傾向が分かりやすいですよね。',
    'リブレのアラーム機能、夜間は特に助かっています。',
    'センサーの貼り替え、2週間ごとは面倒ですが必要ですよね。',
  ],
  // General supportive
  supportive: [
    '私も同じような経験があります。一緒に頑張りましょう！',
    '共感します。お気持ちわかります。',
    '参考になります！ありがとうございます。',
    '勉強になりました。シェアありがとうございます。',
    '私も試してみます！',
    '素晴らしいですね！励みになります。',
    'お互い頑張りましょうね。',
    'とても参考になりました！',
    '応援しています！',
    '情報共有ありがとうございます。',
    'なるほど、そういう方法もあるんですね。',
    '教えていただきありがとうございます。',
  ],
  // Food related
  food: [
    'このレシピ美味しそうですね！今度作ってみます。',
    '糖質量はどのくらいですか？気になります。',
    '写真ありがとうございます。参考になります！',
    '野菜たっぷりで良いですね。栄養バランス素晴らしい。',
    '彩りが綺麗ですね！美味しそう。',
    '私もよく作ります。美味しいですよね。',
    '糖質オフでも美味しそう！',
    'これなら血糖値も安心ですね。',
  ],
  // Exercise related
  exercise: [
    '運動後の血糖値、下がりすぎることありますよね。補食大事です。',
    '私もウォーキング続けてます。一緒に頑張りましょう！',
    '無理せず続けることが大切ですよね。',
    '運動する時間を作るのが難しいですよね。',
    'いい運動習慣ですね！見習いたいです。',
    '継続は力なり、ですね。',
  ],
  // Mental support
  mental: [
    '気持ち、よくわかります。ここで話せてよかったです。',
    '一人で抱え込まないでくださいね。私たちがいます。',
    '私も落ち込むことあります。でも一緒に乗り越えましょう。',
    'ここで話せて良かったです。お互い支え合いましょう。',
    '無理しないでくださいね。自分のペースで大丈夫です。',
    '応援しています。いつでも話聞きますよ。',
    '同じ気持ちの人がいると知って、少し安心しました。',
  ],
  // Reply templates (will be prefixed with >>N)
  reply: [
    'さん\n詳しくありがとうございます！',
    'さん\n私も経験あります！',
    'さん\nとても参考になります。',
    'さん\n共感します。',
    'さん\nなるほど、そういう方法もあるんですね。',
    'さん\n教えていただきありがとうございます。',
    'さん\n私も同じです！',
    'さん\nそうなんですね、勉強になります。',
    'さん\nありがとうございます、試してみます！',
  ],
}

// Helper functions
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Get comment based on user profile and thread context
function getContextualComment(user, profile, thread, existingComments) {
  const templates = []

  // Add type-specific templates
  if (profile?.diabetes_type === 'type1') {
    templates.push(...COMMENT_TEMPLATES.type1)
  } else if (profile?.diabetes_type === 'type2') {
    templates.push(...COMMENT_TEMPLATES.type2)
  }

  // Add treatment-specific templates
  const treatments = profile?.treatment || []
  if (treatments.includes('pump') || treatments.includes('insulin_pump')) {
    templates.push(...COMMENT_TEMPLATES.pump)
  }
  if (profile?.device === 'libre' || treatments.some(t => t.includes('libre'))) {
    templates.push(...COMMENT_TEMPLATES.libre)
  }

  // Add category-specific templates
  switch (thread.category) {
    case 'todays_meal':
    case 'food_recipe':
      templates.push(...COMMENT_TEMPLATES.food)
      break
    case 'exercise_lifestyle':
      templates.push(...COMMENT_TEMPLATES.exercise)
      break
    case 'mental_concerns':
      templates.push(...COMMENT_TEMPLATES.mental)
      break
  }

  // Always include supportive templates
  templates.push(...COMMENT_TEMPLATES.supportive)

  // If no templates, use supportive only
  if (templates.length === 0) {
    return randomElement(COMMENT_TEMPLATES.supportive)
  }

  let comment = randomElement(templates)

  // Replace placeholders
  const years = profile?.illness_duration ?
    (profile.illness_duration === '10_plus' ? randomInt(10, 20) :
     profile.illness_duration === '5_to_10' ? randomInt(5, 10) :
     profile.illness_duration === '3_to_5' ? randomInt(3, 5) :
     profile.illness_duration === '1_to_3' ? randomInt(1, 3) : 1) : randomInt(1, 10)

  comment = comment.replace('{years}', years)

  return comment
}

// Generate reply comment with >>N reference
function generateReplyComment(user, profile, thread, commentNumber, targetComment, targetUser) {
  const replyTemplate = randomElement(COMMENT_TEMPLATES.reply)
  const userName = targetUser?.display_name || ''
  return `>>${commentNumber} ${userName}${replyTemplate}`
}

// Main generation function
async function generateContent(targetDate) {
  console.log(`\n=== Generating content for ${targetDate} ===\n`)

  // Fetch dummy users with profiles
  const { data: dummyUsers, error: usersError } = await supabase
    .from('users')
    .select('id, display_name, is_dummy')
    .eq('is_dummy', true)

  if (usersError || !dummyUsers?.length) {
    console.error('Error fetching dummy users:', usersError)
    return null
  }

  console.log(`Found ${dummyUsers.length} dummy users`)

  // Fetch profiles
  const userIds = dummyUsers.map(u => u.id)
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, diabetes_type, treatment, illness_duration, device')
    .in('user_id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
  const userMap = new Map(dummyUsers.map(u => [u.id, u]))

  // Fetch existing threads
  const { data: threads } = await supabase
    .from('threads')
    .select('id, thread_number, title, category, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  console.log(`Found ${threads?.length || 0} existing threads`)

  // Get actual comment counts for each thread
  const threadCommentCounts = new Map()
  if (threads?.length) {
    for (const thread of threads) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
      threadCommentCounts.set(thread.id, count || 0)
    }
  }

  // Fetch existing comments to get user names for replies
  const { data: existingComments } = await supabase
    .from('comments')
    .select('id, thread_id, user_id, created_at')
    .in('thread_id', threads?.map(t => t.id) || [])
    .order('created_at', { ascending: true })

  const threadCommentsMap = new Map()
  for (const comment of existingComments || []) {
    if (!threadCommentsMap.has(comment.thread_id)) {
      threadCommentsMap.set(comment.thread_id, [])
    }
    threadCommentsMap.get(comment.thread_id).push(comment)
  }

  const generatedContent = {
    threads: [],
    comments: [],
  }

  const baseDate = new Date(targetDate)

  // Generate new threads (5-9 per day)
  const numNewThreads = randomInt(5, 9)
  console.log(`\nGenerating ${numNewThreads} new threads...`)

  for (let i = 0; i < numNewThreads; i++) {
    const category = randomElement(CATEGORIES)
    const template = randomElement(THREAD_TEMPLATES[category])
    const user = randomElement(dummyUsers)

    // Random time during the day (7:00 - 23:00 JST = -2:00 - 14:00 UTC)
    const hour = randomInt(-2, 14)
    const minute = randomInt(0, 59)
    const threadTime = new Date(baseDate)
    threadTime.setUTCHours(hour, minute, randomInt(0, 59), 0)

    generatedContent.threads.push({
      title: template.title,
      content: template.content,
      category,
      user_id: user.id,
      created_at: threadTime.toISOString(),
      _user: user,
    })
  }

  // Sort threads by time
  generatedContent.threads.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Generate comments for existing threads
  // Target: 80-120 comments per active thread, total 600-800 per day
  const totalComments = randomInt(80, 120)
  console.log(`\nGenerating ${totalComments} comments across threads...`)

  // Distribute comments throughout the day
  const commentTimes = []
  for (let i = 0; i < totalComments; i++) {
    const hour = randomInt(-2, 14) // 7:00-23:00 JST
    const minute = randomInt(0, 59)
    const commentTime = new Date(baseDate)
    commentTime.setUTCHours(hour, minute, randomInt(0, 59), 0)
    commentTimes.push(commentTime)
  }
  commentTimes.sort((a, b) => a.getTime() - b.getTime())

  // Track scheduled comments per thread for >>N validation
  const scheduledCounts = new Map()

  for (const commentTime of commentTimes) {
    // Pick a thread (prefer threads with fewer comments)
    const thread = randomElement(threads)
    if (!thread) continue

    const existingCount = threadCommentCounts.get(thread.id) || 0
    const scheduledCount = scheduledCounts.get(thread.id) || 0
    const totalCount = existingCount + scheduledCount

    // Pick a user (not the thread owner)
    let availableUsers = dummyUsers.filter(u => u.id !== thread.user_id)
    if (availableUsers.length === 0) availableUsers = dummyUsers
    const user = randomElement(availableUsers)
    const profile = profileMap.get(user.id)

    // Decide if this should be a reply (40% chance if there are existing comments)
    const shouldReply = totalCount > 0 && Math.random() < 0.4

    let content
    if (shouldReply) {
      // Reply to an existing comment
      const maxRef = totalCount + 1 // +1 for OP
      const refNum = randomInt(1, maxRef)

      // Get the target user's name
      let targetUser = null
      if (refNum === 1) {
        targetUser = userMap.get(thread.user_id)
      } else {
        const threadComments = threadCommentsMap.get(thread.id) || []
        const targetComment = threadComments[refNum - 2]
        if (targetComment) {
          targetUser = userMap.get(targetComment.user_id)
        }
      }

      content = generateReplyComment(user, profile, thread, refNum, null, targetUser)
    } else {
      content = getContextualComment(user, profile, thread, [])
    }

    generatedContent.comments.push({
      thread_id: thread.id,
      user_id: user.id,
      body: content,
      created_at: commentTime.toISOString(),
      _thread: thread,
      _user: user,
    })

    // Update scheduled count
    scheduledCounts.set(thread.id, scheduledCount + 1)
  }

  return generatedContent
}

// Preview content
function previewContent(content) {
  console.log('\n=== Generated Threads ===\n')

  for (const thread of content.threads) {
    const time = new Date(thread.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    console.log(`[${time}] ${thread.category}`)
    console.log(`  Title: ${thread.title}`)
    console.log(`  User: ${thread._user.display_name}`)
    console.log(`  Content: ${thread.content.substring(0, 50)}...`)
    console.log('')
  }

  console.log('\n=== Generated Comments (first 20) ===\n')

  for (const comment of content.comments.slice(0, 20)) {
    const time = new Date(comment.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    console.log(`[${time}]`)
    console.log(`  Thread: #${comment._thread.thread_number} ${comment._thread.title.substring(0, 30)}...`)
    console.log(`  User: ${comment._user.display_name}`)
    console.log(`  Content: ${comment.body.substring(0, 60)}${comment.body.length > 60 ? '...' : ''}`)
    console.log('')
  }

  console.log(`\n=== Summary ===`)
  console.log(`New threads: ${content.threads.length}`)
  console.log(`New comments: ${content.comments.length}`)
}

// Insert content into database
async function insertContent(content) {
  console.log('\n=== Inserting content ===\n')

  // Insert threads
  if (content.threads.length > 0) {
    console.log(`Inserting ${content.threads.length} threads...`)

    for (const thread of content.threads) {
      const { _user, ...threadData } = thread

      const { data, error } = await supabase
        .from('threads')
        .insert({
          title: threadData.title,
          body: threadData.content,
          category: threadData.category,
          user_id: threadData.user_id,
          created_at: threadData.created_at,
        })
        .select()

      if (error) {
        console.error('Error inserting thread:', error)
      } else {
        console.log(`  Created thread: ${threadData.title.substring(0, 30)}...`)
      }
    }
  }

  // Insert comments
  if (content.comments.length > 0) {
    console.log(`\nInserting ${content.comments.length} comments...`)

    // Insert in batches
    const batchSize = 50
    for (let i = 0; i < content.comments.length; i += batchSize) {
      const batch = content.comments.slice(i, i + batchSize).map(c => ({
        thread_id: c.thread_id,
        user_id: c.user_id,
        body: c.body,
        created_at: c.created_at,
      }))

      const { error } = await supabase
        .from('comments')
        .insert(batch)

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      } else {
        console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(content.comments.length / batchSize)}`)
      }
    }
  }

  console.log('\nDone!')
}

// Main
async function main() {
  const args = process.argv.slice(2)
  const dateIndex = args.indexOf('--date')
  const isPreview = args.includes('--preview')
  const isInsert = args.includes('--insert')

  if (dateIndex === -1 || !args[dateIndex + 1]) {
    console.log('Usage: node scripts/generate-content.js --date YYYY-MM-DD [--preview|--insert]')
    process.exit(1)
  }

  const targetDate = args[dateIndex + 1]

  try {
    const content = await generateContent(targetDate)

    if (!content) {
      console.log('No content generated.')
      return
    }

    previewContent(content)

    if (isInsert) {
      await insertContent(content)
    } else {
      console.log('\nTo insert this content, run with --insert flag')
    }

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
