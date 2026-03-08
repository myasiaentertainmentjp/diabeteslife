/**
 * Generate sample dummy data for 2026-01-16
 *
 * Usage:
 *   node scripts/generate-sample.js --preview
 *   node scripts/generate-sample.js --insert
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Comment templates
const COMMENT_TEMPLATES = {
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
  ],
  reply: [
    'さん\n詳しくありがとうございます',
    'さん\n私も経験あります！',
    'さん\nとても参考になります',
    'さん\n共感します',
    'さん\nなるほど、そういう方法もあるんですね',
    'さん\n教えていただきありがとうございます',
    'さん\n私も同じです！',
  ],
  treatment: [
    'インスリンの量の調整、難しいですよね。私も最初は苦労しました。',
    '私も最初は苦労しました。慣れると大丈夫になりますよ。',
    '主治医に相談してみてはいかがでしょうか？',
    'リブレ使ってますが、とても便利ですよ。',
    '食後の血糖値、気になりますよね。私も毎回計ってます。',
    'HbA1c、少しずつ改善できると良いですね。',
    '通院お疲れ様です。定期検診大事ですよね。',
    '薬の副作用、心配ですよね。先生に相談してみてください。',
  ],
  food: [
    'このレシピ美味しそうですね！今度作ってみます。',
    '糖質量はどのくらいですか？気になります。',
    '私も作ってみます！写真ありがとうございます。',
    '野菜たっぷりで良いですね。栄養バランス素晴らしい。',
    '彩りが綺麗ですね！美味しそう。',
    '参考になります。今度試してみます。',
    '糖質オフでも美味しそう！',
    '食事記録、参考になります！',
  ],
  exercise: [
    '運動後の血糖値、下がりすぎることありますよね。補食大事です。',
    '私もウォーキング続けてます。一緒に頑張りましょう！',
    '無理せず続けることが大切ですよね。',
    '運動する時間を作るのが難しいですよね。',
    '一緒に頑張りましょう！継続は力なり。',
    'いい運動習慣ですね！見習いたいです。',
  ],
  mental: [
    '気持ち、よくわかります。ここで話せてよかったです。',
    '一人で抱え込まないでくださいね。私たちがいます。',
    '私も落ち込むことあります。でも一緒に乗り越えましょう。',
    'ここで話せて良かったです。お互い支え合いましょう。',
    '無理しないでくださいね。自分のペースで大丈夫です。',
    '応援しています。いつでも話聞きますよ。',
  ],
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getTemplatesByCategory(category) {
  switch (category) {
    case 'treatment':
      return [...COMMENT_TEMPLATES.treatment, ...COMMENT_TEMPLATES.supportive]
    case 'food_recipe':
    case 'todays_meal':
      return [...COMMENT_TEMPLATES.food, ...COMMENT_TEMPLATES.supportive]
    case 'exercise_lifestyle':
      return [...COMMENT_TEMPLATES.exercise, ...COMMENT_TEMPLATES.supportive]
    case 'mental_concerns':
      return [...COMMENT_TEMPLATES.mental, ...COMMENT_TEMPLATES.supportive]
    default:
      return COMMENT_TEMPLATES.supportive
  }
}

function generateComment(thread, existingCommentCount, userName) {
  const templates = getTemplatesByCategory(thread.category)

  // 40% chance to reply to an existing comment if there are any
  const shouldReply = existingCommentCount > 0 && Math.random() < 0.4

  if (shouldReply) {
    // CRITICAL: Only reference comments that ALREADY EXIST
    // maxRef = existingCommentCount + 1 (1 is OP, rest are comments)
    const maxRef = existingCommentCount + 1
    const refNum = randomInt(1, maxRef)

    const replyTemplate = randomElement(COMMENT_TEMPLATES.reply)
    return `>>${refNum} ${userName || ''}${replyTemplate}`
  }

  return randomElement(templates)
}

async function generateSampleData() {
  const targetDate = '2026-01-16'
  console.log(`\n=== Generating dummy data for ${targetDate} ===\n`)

  // Fetch dummy users
  const { data: dummyUsers, error: usersError } = await supabase
    .from('users')
    .select('id, display_name, is_dummy')
    .eq('is_dummy', true)

  if (usersError || !dummyUsers || dummyUsers.length === 0) {
    console.error('Error fetching dummy users:', usersError)
    console.log('\nNo dummy users found. Please create dummy users first.')
    return null
  }

  console.log(`Found ${dummyUsers.length} dummy users:`)
  dummyUsers.forEach(u => console.log(`  - ${u.display_name || 'No name'}`))

  // Fetch active threads with their comment counts
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select('id, thread_number, title, category, user_id, comments_count, created_at')
    .order('created_at', { ascending: false })
    .limit(30)

  if (threadsError || !threads || threads.length === 0) {
    console.error('Error fetching threads:', threadsError)
    return null
  }

  console.log(`\nFound ${threads.length} active threads:`)
  threads.slice(0, 5).forEach(t => console.log(`  - #${t.thread_number}: ${t.title.substring(0, 40)}... (${t.comments_count} comments)`))
  if (threads.length > 5) console.log(`  ... and ${threads.length - 5} more`)

  // Get user display names for threads
  const threadUserIds = [...new Set(threads.map(t => t.user_id))]
  const { data: threadUsers } = await supabase
    .from('users')
    .select('id, display_name')
    .in('id', threadUserIds)

  const threadUserMap = new Map(threadUsers?.map(u => [u.id, u.display_name]) || [])

  // Fetch existing comments for accurate counts and user names
  const threadIds = threads.map(t => t.id)
  const { data: existingComments } = await supabase
    .from('comments')
    .select('id, thread_id, user_id, created_at')
    .in('thread_id', threadIds)
    .order('created_at', { ascending: true })

  // Get comment user names
  const commentUserIds = [...new Set(existingComments?.map(c => c.user_id) || [])]
  const { data: commentUsers } = await supabase
    .from('users')
    .select('id, display_name')
    .in('id', commentUserIds)

  const userNameMap = new Map([
    ...(threadUsers?.map(u => [u.id, u.display_name]) || []),
    ...(commentUsers?.map(u => [u.id, u.display_name]) || []),
  ])

  // Build comment count map with detailed info
  const threadCommentMap = new Map()
  for (const thread of threads) {
    const comments = existingComments?.filter(c => c.thread_id === thread.id) || []
    threadCommentMap.set(thread.id, {
      count: comments.length,
      comments: comments,
      opName: threadUserMap.get(thread.user_id) || 'Unknown',
    })
  }

  // Generate scheduled posts for 1/16
  const scheduledPosts = []
  const baseDate = new Date(targetDate)

  // Generate 8-12 comments spread throughout the day
  const numComments = randomInt(8, 12)

  // Generate random times throughout the day (7:00 - 23:00)
  const times = []
  for (let i = 0; i < numComments; i++) {
    const hour = randomInt(7, 23)
    const minute = randomInt(0, 59)
    const time = new Date(baseDate)
    time.setHours(hour, minute, randomInt(0, 59), 0)
    times.push(time)
  }

  // Sort by time
  times.sort((a, b) => a.getTime() - b.getTime())

  // Track scheduled comments per thread (for >>N validation)
  const scheduledCountMap = new Map()

  console.log(`\n=== Generating ${numComments} scheduled comments ===\n`)

  for (let i = 0; i < times.length; i++) {
    const time = times[i]

    // Pick a random thread (prefer threads with fewer scheduled comments)
    const thread = randomElement(threads)

    // Get current state
    const threadInfo = threadCommentMap.get(thread.id)
    const existingCount = threadInfo?.count || 0
    const scheduledCount = scheduledCountMap.get(thread.id) || 0
    const totalCount = existingCount + scheduledCount

    // Pick a random dummy user (preferably not the thread owner)
    let availableUsers = dummyUsers.filter(u => u.id !== thread.user_id)
    if (availableUsers.length === 0) availableUsers = dummyUsers
    const user = randomElement(availableUsers)

    // Determine what user name to use if replying
    let replyToName = ''
    if (totalCount > 0) {
      // If replying, we might reference OP or a commenter
      const refNum = randomInt(1, totalCount + 1)
      if (refNum === 1) {
        replyToName = threadInfo?.opName || ''
      } else {
        // Get the (refNum-2)th comment's user name
        const comment = threadInfo?.comments?.[refNum - 2]
        if (comment) {
          replyToName = userNameMap.get(comment.user_id) || ''
        }
      }
    }

    // Generate comment
    const content = generateComment(thread, totalCount, replyToName)

    scheduledPosts.push({
      type: 'comment',
      thread_id: thread.id,
      content,
      user_id: user.id,
      scheduled_at: time.toISOString(),
      status: 'pending',
      // For display only
      _thread: thread,
      _user: user,
    })

    // Update scheduled count
    scheduledCountMap.set(thread.id, scheduledCount + 1)
  }

  return scheduledPosts
}

function validatePosts(posts, threadCommentMap) {
  const errors = []
  const runningCounts = new Map()

  // Initialize with existing counts
  for (const [threadId, info] of threadCommentMap) {
    runningCounts.set(threadId, info.count)
  }

  // Sort by time
  const sorted = [...posts].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )

  for (const post of sorted) {
    if (post.type === 'comment' && post.thread_id) {
      const refs = post.content.match(/>>(\d+)/g)
      if (refs) {
        const currentCount = runningCounts.get(post.thread_id) || 0
        const maxRef = currentCount + 1 // +1 for OP

        for (const ref of refs) {
          const num = parseInt(ref.replace('>>', ''))
          if (num > maxRef) {
            errors.push({
              post,
              error: `Invalid reference ${ref}. Max valid: >>${maxRef}`,
            })
          }
        }
      }

      // Increment for next validation
      runningCounts.set(post.thread_id, (runningCounts.get(post.thread_id) || 0) + 1)
    }
  }

  return errors
}

async function main() {
  const args = process.argv.slice(2)
  const isPreview = args.includes('--preview')
  const isInsert = args.includes('--insert')

  try {
    const posts = await generateSampleData()

    if (!posts || posts.length === 0) {
      console.log('No posts generated.')
      return
    }

    console.log('\n=== Generated Schedule ===\n')

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      const time = new Date(post.scheduled_at)
      const timeStr = time.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })

      console.log(`${i + 1}. [${timeStr}]`)
      console.log(`   Thread: #${post._thread.thread_number} ${post._thread.title.substring(0, 35)}...`)
      console.log(`   User: ${post._user.display_name}`)
      console.log(`   Content: ${post.content.replace(/\n/g, ' ').substring(0, 60)}${post.content.length > 60 ? '...' : ''}`)
      console.log('')
    }

    console.log(`Total: ${posts.length} comments scheduled for 2026-01-16`)

    // Validate - get actual comment counts, not the cached field
    const threadIds = [...new Set(posts.map(p => p.thread_id))]
    const threadCommentMap = new Map()

    for (const threadId of threadIds) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)
      threadCommentMap.set(threadId, { count: count || 0 })
    }

    const errors = validatePosts(posts, threadCommentMap)

    if (errors.length > 0) {
      console.log('\n=== VALIDATION ERRORS ===')
      for (const { post, error } of errors) {
        console.log(`  - ${error}`)
        console.log(`    Content: ${post.content.substring(0, 40)}...`)
      }
      console.log('\nPlease fix errors before inserting.')
      return
    }

    console.log('\nValidation: PASSED (all >>N references are valid)')

    if (isInsert) {
      console.log('\nInserting into database...')

      // Remove display-only fields
      const cleanPosts = posts.map(({ _thread, _user, ...rest }) => rest)

      const { error } = await supabase
        .from('scheduled_posts')
        .insert(cleanPosts)

      if (error) {
        console.error('Error inserting:', error)
        console.log('\nMake sure you have run the migration first!')
        console.log('Run this SQL in Supabase SQL Editor:')
        console.log('  supabase/migrations/009_scheduled_posts.sql')
      } else {
        console.log('\nSuccessfully inserted! View in admin panel:')
        console.log('  /admin/scheduled-posts')
      }
    } else {
      console.log('\nTo insert these posts, run:')
      console.log('  node scripts/generate-sample.js --insert')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

main()
