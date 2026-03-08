/**
 * Dummy Data Generator for Dライフ
 *
 * This script generates contextually appropriate dummy comments and threads
 * with proper >>N reference validation.
 *
 * Usage:
 *   npx ts-node scripts/generate-dummy.ts --date 2026-01-16 --preview
 *   npx ts-node scripts/generate-dummy.ts --date 2026-01-16 --insert
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Comment templates for diabetes community
const COMMENT_TEMPLATES = {
  // General supportive comments
  supportive: [
    '私も同じような経験があります。一緒に頑張りましょう！',
    '共感します。お気持ちわかります。',
    '参考になります！ありがとうございます。',
    '勉強になりました。シェアありがとうございます。',
    '私も試してみます！',
    '素晴らしいですね！励みになります。',
    'お互い頑張りましょうね。',
    'とても参考になりました！',
  ],
  // Reply templates (will be prefixed with >>N)
  reply: [
    'さん\n詳しくありがとうございます',
    'さん\n私も経験あります！',
    'さん\nとても参考になります',
    'さん\n共感します',
    'さん\nなるほど、そういう方法もあるんですね',
    'さん\n教えていただきありがとうございます',
  ],
  // Treatment related
  treatment: [
    'インスリンの量の調整、難しいですよね。',
    '私も最初は苦労しました。慣れると大丈夫になりますよ。',
    '主治医に相談してみてはいかがでしょうか？',
    'リブレ使ってますが、とても便利ですよ。',
    '食後の血糖値、気になりますよね。',
    'HbA1c、少しずつ改善できると良いですね。',
  ],
  // Food related
  food: [
    'このレシピ美味しそうですね！',
    '糖質量はどのくらいですか？',
    '私も作ってみます！',
    '野菜たっぷりで良いですね。',
    '彩りが綺麗ですね',
    '参考になります。今度試してみます。',
  ],
  // Exercise related
  exercise: [
    '運動後の血糖値、下がりすぎることありますよね。',
    '私もウォーキング続けてます。',
    '無理せず続けることが大切ですよね。',
    '運動する時間を作るのが難しいです。',
    '一緒に頑張りましょう！',
  ],
  // Mental/emotional
  mental: [
    '気持ち、よくわかります。',
    '一人で抱え込まないでくださいね。',
    '私も落ち込むことあります。',
    'ここで話せて良かったです。',
    '無理しないでくださいね。',
    '応援しています。',
  ],
}

// Interfaces
interface DummyUser {
  id: string
  display_name: string | null
  is_dummy: boolean
}

interface Thread {
  id: string
  thread_number: number
  title: string
  content: string
  category: string
  user_id: string
  comments_count: number
  created_at: string
}

interface Comment {
  id: string
  thread_id: string
  user_id: string
  body: string
  created_at: string
}

interface ScheduledPost {
  type: 'thread' | 'comment'
  title?: string
  category?: string
  thread_id?: string
  content: string
  user_id: string
  scheduled_at: string
  status: 'pending'
}

// Helper functions
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getTemplatesByCategory(category: string): string[] {
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

// Generate a comment for a specific thread
function generateComment(
  thread: Thread,
  existingCommentCount: number,
  user: DummyUser,
  allUsers: Map<string, DummyUser>
): string {
  const templates = getTemplatesByCategory(thread.category)

  // Decide whether to include a reply reference
  const shouldReply = existingCommentCount > 0 && Math.random() < 0.4

  if (shouldReply) {
    // Pick a valid comment number to reply to (1 = OP, 2+ = comments)
    // CRITICAL: Only reference comments that ALREADY EXIST
    const maxRef = existingCommentCount + 1 // +1 for OP
    const refNum = randomInt(1, maxRef)

    const replyTemplate = randomElement(COMMENT_TEMPLATES.reply)

    // Try to get the user's name for the reference
    // For now, just use a generic reply
    return `>>${refNum} ${replyTemplate}`
  }

  return randomElement(templates)
}

// Generate scheduled posts for a specific date
async function generateScheduledPosts(targetDate: string): Promise<ScheduledPost[]> {
  console.log(`Generating dummy data for ${targetDate}...`)

  // Fetch dummy users
  const { data: dummyUsers, error: usersError } = await supabase
    .from('users')
    .select('id, display_name, is_dummy')
    .eq('is_dummy', true)

  if (usersError || !dummyUsers || dummyUsers.length === 0) {
    console.error('Error fetching dummy users:', usersError)
    throw new Error('No dummy users found')
  }

  console.log(`Found ${dummyUsers.length} dummy users`)

  const usersMap = new Map(dummyUsers.map(u => [u.id, u as DummyUser]))

  // Fetch active threads
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select('*')
    .eq('status', 'normal')
    .order('created_at', { ascending: false })
    .limit(50)

  if (threadsError || !threads) {
    console.error('Error fetching threads:', threadsError)
    throw new Error('Failed to fetch threads')
  }

  console.log(`Found ${threads.length} active threads`)

  // Fetch existing comments for each thread
  const threadCommentCounts = new Map<string, number>()
  for (const thread of threads) {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('thread_id', thread.id)

    threadCommentCounts.set(thread.id, count || 0)
  }

  // Generate scheduled posts for the target date
  const scheduledPosts: ScheduledPost[] = []
  const baseDate = new Date(targetDate)

  // Generate 5-15 comments spread throughout the day
  const numComments = randomInt(5, 15)

  // Generate random times throughout the day (6:00 - 23:00)
  const times: Date[] = []
  for (let i = 0; i < numComments; i++) {
    const hour = randomInt(6, 23)
    const minute = randomInt(0, 59)
    const time = new Date(baseDate)
    time.setHours(hour, minute, 0, 0)
    times.push(time)
  }

  // Sort by time
  times.sort((a, b) => a.getTime() - b.getTime())

  // Track comment counts as we schedule them (to validate >>N references)
  const scheduledCommentCounts = new Map<string, number>()

  for (const time of times) {
    // Pick a random thread
    const thread = randomElement(threads)

    // Get current comment count (existing + already scheduled)
    const existingCount = threadCommentCounts.get(thread.id) || 0
    const scheduledCount = scheduledCommentCounts.get(thread.id) || 0
    const totalCount = existingCount + scheduledCount

    // Pick a random dummy user (not the thread owner)
    const availableUsers = dummyUsers.filter(u => u.id !== thread.user_id)
    if (availableUsers.length === 0) continue

    const user = randomElement(availableUsers) as DummyUser

    // Generate comment content
    const content = generateComment(thread, totalCount, user, usersMap)

    scheduledPosts.push({
      type: 'comment',
      thread_id: thread.id,
      content,
      user_id: user.id,
      scheduled_at: time.toISOString(),
      status: 'pending',
    })

    // Update scheduled count for this thread
    scheduledCommentCounts.set(thread.id, (scheduledCommentCounts.get(thread.id) || 0) + 1)
  }

  return scheduledPosts
}

// Validate >>N references in scheduled posts
function validateScheduledPosts(
  posts: ScheduledPost[],
  threadCommentCounts: Map<string, number>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const runningCounts = new Map(threadCommentCounts)

  // Sort by scheduled time
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )

  for (const post of sortedPosts) {
    if (post.type === 'comment' && post.thread_id) {
      const refs = post.content.match(/>>(\d+)/g)
      if (refs) {
        const currentCount = runningCounts.get(post.thread_id) || 0
        const maxRef = currentCount + 1 // +1 for OP

        for (const ref of refs) {
          const num = parseInt(ref.replace('>>', ''))
          if (num > maxRef) {
            errors.push(
              `Invalid reference ${ref} in comment at ${post.scheduled_at}. ` +
              `Max valid reference is >>${maxRef}`
            )
          }
        }
      }

      // Increment count for next validation
      runningCounts.set(post.thread_id, (runningCounts.get(post.thread_id) || 0) + 1)
    }
  }

  return { valid: errors.length === 0, errors }
}

// Insert scheduled posts into database
async function insertScheduledPosts(posts: ScheduledPost[]): Promise<void> {
  console.log(`Inserting ${posts.length} scheduled posts...`)

  const { error } = await supabase
    .from('scheduled_posts')
    .insert(posts as never[])

  if (error) {
    console.error('Error inserting scheduled posts:', error)
    throw error
  }

  console.log('Successfully inserted scheduled posts!')
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  const dateIndex = args.indexOf('--date')
  const isPreview = args.includes('--preview')
  const isInsert = args.includes('--insert')

  if (dateIndex === -1 || !args[dateIndex + 1]) {
    console.error('Usage: npx ts-node scripts/generate-dummy.ts --date YYYY-MM-DD [--preview|--insert]')
    process.exit(1)
  }

  const targetDate = args[dateIndex + 1]

  try {
    const posts = await generateScheduledPosts(targetDate)

    // Get thread comment counts for validation
    const threadIds = [...new Set(posts.filter(p => p.thread_id).map(p => p.thread_id!))]
    const counts = new Map<string, number>()

    for (const threadId of threadIds) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)
      counts.set(threadId, count || 0)
    }

    // Validate
    const validation = validateScheduledPosts(posts, counts)

    if (!validation.valid) {
      console.error('Validation errors:')
      validation.errors.forEach(e => console.error(`  - ${e}`))
      process.exit(1)
    }

    console.log('\n=== Generated Scheduled Posts ===\n')

    // Fetch thread info for display
    const { data: threadInfo } = await supabase
      .from('threads')
      .select('id, thread_number, title')
      .in('id', threadIds)

    const threadMap = new Map(threadInfo?.map(t => [t.id, t]) || [])

    // Fetch user info for display
    const userIds = [...new Set(posts.map(p => p.user_id))]
    const { data: userInfo } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', userIds)

    const userMap = new Map(userInfo?.map(u => [u.id, u]) || [])

    for (const post of posts) {
      const thread = post.thread_id ? threadMap.get(post.thread_id) : null
      const user = userMap.get(post.user_id)

      console.log(`[${new Date(post.scheduled_at).toLocaleString('ja-JP')}]`)
      console.log(`  Type: ${post.type}`)
      console.log(`  User: ${user?.display_name || 'Unknown'}`)
      if (thread) {
        console.log(`  Thread: #${thread.thread_number} ${thread.title.substring(0, 30)}...`)
      }
      console.log(`  Content: ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`)
      console.log('')
    }

    console.log(`Total: ${posts.length} posts`)
    console.log('Validation: PASSED')

    if (isInsert) {
      await insertScheduledPosts(posts)
    } else if (!isPreview) {
      console.log('\nUse --insert to actually insert these posts, or --preview to just preview.')
    }

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
