/**
 * Daily Content Generator for Dライフ
 *
 * 仕様:
 * - 1日あたり新規スレッド: 5-9個
 * - 新規スレッドは初日10-30コメント、その後数日かけて増える
 * - 固定スレッド4つに毎日コメント追加
 * - 既存スレッドにも毎日コメント追加（古いほど少なめ）
 * - 1日の総コメント数: 600-800件
 * - リプライ率: 20-60%（平均40%）
 * - リプライ形式: >>番号 名前さん
 *
 * Usage:
 *   node scripts/generate-daily-content.js --date 2025-12-01 --insert
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 固定スレッド
const FIXED_THREADS = [
  { title: '【雑談】独り言スレ', category: 'free_talk', dailyComments: [15, 25] },
  { title: '【質問】なんでも質問スレ', category: 'free_talk', dailyComments: [8, 15] },
  { title: '【報告】HbA1c報告スレ', category: 'treatment', dailyComments: [5, 12] },
  { title: '【集合】リブレユーザー集まれ！', category: 'treatment', dailyComments: [5, 12] },
]

// スレッドテンプレート
const THREAD_TEMPLATES = {
  treatment: [
    { title: 'インスリン注射のタイミングについて相談', body: '食前と食後、どちらがいいのか悩んでいます。皆さんはどうされていますか？主治医には聞いたのですが、人によって違うと言われて…' },
    { title: 'リブレのセンサーが剥がれやすい', body: '夏場は汗で剥がれやすくて困っています。テープで補強してる方いますか？おすすめあれば教えてください！' },
    { title: '低血糖対策、皆さんどうしてますか？', body: '外出時の低血糖が心配です。ブドウ糖以外で携帯しやすいものありますか？' },
    { title: 'ポンプかペンか迷ってます', body: 'インスリンポンプへの切り替えを検討中です。ポンプユーザーの方、メリット・デメリット教えてください' },
    { title: 'HbA1cがなかなか下がらない…', body: '食事も運動も頑張っているのに、なかなか7%を切れません。同じような方いますか？' },
    { title: '通院の頻度について', body: '皆さんはどのくらいの頻度で通院されていますか？私は月1回ですが、多いのかな？' },
    { title: '夜間低血糖が怖い', body: '寝ている間の低血糖が不安で眠れないことがあります。対策されている方いますか？' },
    { title: '新しい薬の副作用がつらい', body: '先週から新しい薬を始めたのですが、胃の調子が悪くて…同じ経験された方いますか？' },
    { title: 'Dexcom G7 使ってる方いますか？', body: 'リブレから乗り換え検討中です。精度とか使い勝手どうですか？' },
    { title: '採血の痛み、慣れますか？', body: '毎月の採血が苦手です…何年経っても慣れません。皆さんはどうですか？' },
  ],
  food_recipe: [
    { title: '今日のお昼ご飯', body: '糖質控えめの和定食にしました！鮭の塩焼き、ほうれん草のおひたし、きのこの味噌汁。血糖値の上がり方が穏やかでした' },
    { title: '低糖質パンのレシピ共有します！', body: 'おからパウダーとサイリウムで作る低糖質パン、ふわふわに焼けました！レシピ載せますね' },
    { title: '糖質オフのスイーツ作ってみた', body: 'ラカントとクリームチーズで作ったチーズケーキ、罪悪感なく食べられます！写真載せますね' },
    { title: 'こんにゃく麺、美味しく食べるコツ', body: 'こんにゃく麺って独特の匂いがありますよね。美味しく食べるコツ教えます！' },
    { title: '外食時の糖質管理どうしてますか？', body: '友達とのランチ、メニュー選びに困ります。皆さんはどうされていますか？' },
    { title: '朝食、何食べてますか？', body: '朝は時間がなくて、つい簡単なものになりがち。皆さんの朝食教えてください！' },
    { title: 'コンビニで買える低糖質食品', body: 'コンビニでよく買う低糖質食品をシェアしませんか？私のおすすめはローソンのブランパンです！' },
    { title: '調味料の糖質、気にしてますか？', body: 'ケチャップやソースって意外と糖質高いですよね。代わりに使えるもの教えてください！' },
  ],
  exercise_lifestyle: [
    { title: 'ウォーキング始めました', body: '毎日30分のウォーキングを始めて2週間。少しずつ血糖値に良い影響が出てきた気がします！' },
    { title: '運動後の血糖値、下がりすぎ問題', body: '運動後に血糖値が下がりすぎることがあります。補食のタイミングとか、皆さんはどう対処していますか？' },
    { title: '筋トレ始めたら数値改善！', body: '週2回の筋トレを始めて3ヶ月。インスリン抵抗性が改善してきた気がします' },
    { title: 'デスクワークの運動不足解消法', body: '一日中座りっぱなしで運動不足です。仕事中にできる運動ありますか？' },
    { title: '朝の散歩習慣、おすすめです！', body: '朝食前の散歩を習慣にして半年。空腹時血糖値が安定してきました！' },
    { title: '雨の日の運動どうしてますか？', body: '梅雨時期、外に出られないと運動不足になりがち。室内でできる運動教えてください！' },
    { title: '睡眠と血糖値の関係', body: '寝不足の日は血糖値が高くなる気がします。皆さんはどうですか？' },
  ],
  complications: [
    { title: '眼科検診、行ってますか？', body: '糖尿病性網膜症が心配で、半年に1回眼科に行ってます。皆さんはどのくらいの頻度ですか？' },
    { title: '足のケア、大事ですね', body: '主治医から足のケアが大事と言われました。フットケアどうされていますか？' },
    { title: '腎臓の数値が気になる', body: 'eGFRが少し下がってきました。同じような方、どんなケアしていますか？' },
    { title: '手足のしびれ、ありますか？', body: '最近手足がしびれることがあります。神経障害の初期症状でしょうか…心配です。' },
    { title: '歯周病と糖尿病の関係', body: '歯医者さんに糖尿病だと歯周病になりやすいと言われました。ケア方法教えてください！' },
  ],
  mental_concerns: [
    { title: '将来が不安で眠れない夜がある', body: '合併症のことを考えると不安で…同じ気持ちの方、お話しませんか？' },
    { title: '職場で糖尿病のこと言えない', body: '職場で糖尿病のことを話していません。皆さんはオープンにしていますか？' },
    { title: '食事制限のストレス、溜まりませんか？', body: '好きなものが食べられないストレスが溜まっています。どう発散していますか？' },
    { title: '自己管理に疲れました…', body: '毎日の血糖測定や食事管理、正直疲れてきました。皆さんはどうリフレッシュしていますか？' },
    { title: '診断されたばかりで不安です', body: '先月糖尿病と診断されました。これからどうすればいいか、不安でいっぱいです。先輩方、アドバイスください' },
    { title: '家族の理解が得られない', body: '家族に「甘いもの食べるから」と言われるのがつらいです。遺伝もあるのに…' },
    { title: '一人で頑張るのがつらい時', body: 'たまに一人で頑張るのがつらくなります。ここで愚痴っていいですか？' },
  ],
  free_talk: [
    { title: '週末の予定', body: '週末何されますか？私は久しぶりに友達とカフェに行く予定です！' },
    { title: '最近ハマっていること', body: '皆さんの趣味は何ですか？私は最近読書にハマっています' },
    { title: '季節の変わり目、体調崩しやすいですね', body: '気温差で体調崩しやすい季節ですね。皆さんお気をつけて！' },
    { title: 'ペットいる方いますか？', body: 'うちには猫がいます。癒されますよね〜皆さんのペット見せてください！' },
    { title: '今日の一言', body: '何気ない日常をシェアしましょう！今日は天気が良くて気持ちいいです' },
  ],
}

// コメントテンプレート
const GENERAL_COMMENTS = [
  '私も同じような経験があります！一緒に頑張りましょう',
  '共感します。お気持ちわかります',
  '参考になります！ありがとうございます',
  '勉強になりました。シェアありがとうございます',
  '私も試してみます！',
  '素晴らしいですね！励みになります',
  'お互い頑張りましょうね',
  'とても参考になりました！',
  '応援しています',
  '情報共有ありがとうございます',
  '私もそう思います！',
  'いい情報ですね',
  '続報待ってます！',
  '頑張ってください！応援してます',
  '同じこと悩んでました',
]

const REPLY_TEMPLATES = [
  '>>{num} {name}さん\nありがとうございます！参考になります',
  '>>{num} {name}さん\n私も同じです！共感します',
  '>>{num} {name}さん\nなるほど〜勉強になります！',
  '>>{num} {name}さん\nそうなんですね！試してみます',
  '>>{num} {name}さん\n詳しくありがとうございます',
  '>>{num} {name}さん\n心強いです！ありがとうございます',
  '>>{num} {name}さん\n同感です！',
  '>>{num} {name}さん\nいい情報ですね！',
  '>>{num} {name}さん\n私もやってみます',
  '>>{num} {name}さん\nそれ良さそうですね！',
]

const THREAD_OWNER_REPLY_TEMPLATES = [
  '>>{num} {name}さん\nコメントありがとうございます！参考になります',
  '>>{num} {name}さん\nアドバイスありがとうございます！試してみますね',
  '>>{num} {name}さん\n共感してもらえて嬉しいです',
  '>>{num} {name}さん\n詳しく教えていただきありがとうございます！',
  '>>{num} {name}さん\nありがとうございます！心強いです',
]

const HITORIGOTO_COMMENTS = [
  '今日も1日頑張った。血糖値も安定してて嬉しい',
  '眠い…でも測定しなきゃ',
  '今日のごはん美味しかった〜血糖値も大丈夫だった',
  'リブレのセンサー交換完了！また2週間頑張ろう',
  '主治医に褒められた〜嬉しい',
  '低血糖きた。ブドウ糖タイム',
  '散歩気持ちよかった〜',
  '今日は疲れたけど、血糖コントロールは良好',
  'お菓子の誘惑と戦った…勝った',
  'HbA1c下がってた！努力が報われた',
  '雨だから運動サボっちゃった…明日は頑張る',
  '新しい低糖質レシピ発見！今度作ってみよう',
  'インスリンの残り少ない…明日病院行かなきゃ',
  '寝る前の血糖値、いい感じ。おやすみなさい',
  '朝から高血糖…暁現象かな',
  '今日は友達とランチ！メニュー選び頑張った',
  '足のしびれが気になる…次の検診で相談しよう',
  '天気いいから散歩してきた。気持ちよかった〜',
  'ストレスで血糖値上がった気がする…',
  '糖質制限料理、だいぶ上手くなってきたかも',
]

const HBA1C_REPORT_TEMPLATES = [
  '今月のHbA1c、{value}%でした！{feedback}',
  '報告です〜{value}%！{feedback}',
  '{value}%だった！{feedback}頑張ります',
  '検査結果出ました。{value}%。{feedback}',
]

const QUESTION_COMMENTS = [
  'インスリンの保管方法について教えてください',
  '低血糖の時、皆さんは何を食べますか？',
  'リブレの誤差って気になりますか？',
  '運動前後の血糖管理、どうしてますか？',
  '糖質何gまでOKにしてますか？',
  '外食の時、何を基準にメニュー選んでますか？',
  'HbA1cと日々の血糖値、どっちを重視してますか？',
  '夜食、食べたくなった時どうしてますか？',
  '飲み会の時、お酒どうしてますか？',
  'ストレスで血糖値上がる方いますか？',
]

const LIBRE_COMMENTS = [
  'リブレ3、待ち遠しいですね〜',
  'センサー装着位置、皆さんどこにしてますか？私は二の腕です',
  '誤差が気になる時ありますよね。指先と比較してます',
  'アラーム設定、何mg/dLにしてますか？',
  'センサー代、高いですよね…でも手放せない',
  'リブレLinkアプリ、便利ですよね',
  '低血糖アラーム、夜助かってます',
  'センサーの上からテープ貼ってる方いますか？',
  'スキャン忘れがち…アラームセットしてます',
  'グラフ見るの楽しいですよね',
]

// ヘルパー関数
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateTimeForJSTHour(baseDate, jstHour, minute = null) {
  const m = minute !== null ? minute : randomInt(0, 59)
  const s = randomInt(0, 59)
  let utcHour = jstHour - 9
  let dayOffset = 0
  if (utcHour < 0) {
    utcHour += 24
    dayOffset = -1
  }
  const time = new Date(baseDate)
  time.setUTCDate(time.getUTCDate() + dayOffset)
  time.setUTCHours(utcHour, m, s, 0)
  return time
}

function generateRandomJSTTime(baseDate) {
  const weights = {
    0: 3, 1: 1, 2: 0.5, 3: 0.3, 4: 0.2, 5: 0.5,
    6: 2, 7: 4, 8: 5, 9: 5, 10: 4, 11: 4,
    12: 8, 13: 7,
    14: 4, 15: 4, 16: 4, 17: 5, 18: 6,
    19: 8, 20: 9, 21: 10, 22: 8, 23: 5,
  }
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  let jstHour = 0
  for (const [hour, weight] of Object.entries(weights)) {
    random -= weight
    if (random <= 0) {
      jstHour = parseInt(hour)
      break
    }
  }
  return generateTimeForJSTHour(baseDate, jstHour)
}

function generateHba1cComment() {
  const value = (Math.random() * 3 + 5.5).toFixed(1)
  const feedback = parseFloat(value) <= 6.5 ? '目標達成！嬉しい' :
                   parseFloat(value) <= 7 ? 'まずまず。この調子で！' :
                   parseFloat(value) <= 8 ? 'もう少し頑張りたい' : '要改善…頑張ります'
  return randomElement(HBA1C_REPORT_TEMPLATES).replace('{value}', value).replace('{feedback}', feedback)
}

// スレッドの経過日数に基づくコメント数を計算
function getCommentsForThreadAge(daysOld, isNewToday) {
  if (isNewToday) {
    // 新規スレッド初日: 15-40コメント
    return randomInt(15, 40)
  } else if (daysOld <= 3) {
    // 1-3日目: まだ活発 20-50コメント
    return randomInt(20, 50)
  } else if (daysOld <= 7) {
    // 4-7日目: やや落ち着く 10-30コメント
    return randomInt(10, 30)
  } else if (daysOld <= 14) {
    // 8-14日目: さらに落ち着く 5-15コメント
    return randomInt(5, 15)
  } else {
    // 15日以上: たまにコメント 0-5コメント
    return randomInt(0, 5)
  }
}

// メイン生成関数
async function generateDailyContent(targetDate) {
  console.log(`\n=== Generating content for ${targetDate} ===\n`)

  const { data: dummyUsers, error: usersError } = await supabase
    .from('users')
    .select('id, display_name, is_dummy')
    .eq('is_dummy', true)

  if (usersError || !dummyUsers?.length) {
    console.error('Error fetching dummy users:', usersError)
    return null
  }

  console.log(`Found ${dummyUsers.length} dummy users`)
  const userMap = new Map(dummyUsers.map(u => [u.id, u]))

  const { data: existingThreads } = await supabase
    .from('threads')
    .select('id, title, category, user_id, created_at')
    .order('created_at', { ascending: true })

  console.log(`Found ${existingThreads?.length || 0} existing threads`)

  // 既存コメントを取得してコメントリストを構築
  const threadCommentsMap = new Map()
  if (existingThreads?.length) {
    const { data: existingComments } = await supabase
      .from('comments')
      .select('id, thread_id, user_id, created_at')
      .in('thread_id', existingThreads.map(t => t.id))
      .order('created_at', { ascending: true })

    for (const thread of existingThreads) {
      const owner = userMap.get(thread.user_id)
      const commentList = [{
        number: 1,
        user_id: thread.user_id,
        user_name: owner?.display_name || 'unknown'
      }]
      const threadComments = existingComments?.filter(c => c.thread_id === thread.id) || []
      for (let i = 0; i < threadComments.length; i++) {
        const user = userMap.get(threadComments[i].user_id)
        commentList.push({
          number: i + 2,
          user_id: threadComments[i].user_id,
          user_name: user?.display_name || 'unknown'
        })
      }
      threadCommentsMap.set(thread.id, commentList)
    }
  }

  const baseDate = new Date(targetDate + 'T00:00:00Z')
  const generatedThreads = []
  const generatedComments = []

  // 固定スレッドを識別
  const fixedThreadMap = new Map()
  for (const ft of FIXED_THREADS) {
    const key = ft.title.split('】')[1]
    const existing = existingThreads?.find(t => t.title.includes(key))
    if (existing) fixedThreadMap.set(key, existing)
  }

  // 1. 固定スレッド処理（なければ作成）
  console.log('\n--- Fixed Threads ---')
  for (const fixedThread of FIXED_THREADS) {
    const key = fixedThread.title.split('】')[1]
    let thread = fixedThreadMap.get(key)

    if (!thread) {
      const user = randomElement(dummyUsers)
      const time = generateTimeForJSTHour(baseDate, randomInt(6, 9))
      thread = {
        title: fixedThread.title,
        body: `${fixedThread.title}です。お気軽にどうぞ！`,
        category: fixedThread.category,
        user_id: user.id,
        created_at: time.toISOString(),
        _user: user,
        _isNew: true,
      }
      generatedThreads.push(thread)
      threadCommentsMap.set(thread.title, [{
        number: 1,
        user_id: user.id,
        user_name: user.display_name
      }])
      console.log(`  [NEW] ${fixedThread.title}`)
    } else {
      console.log(`  [EXISTS] ${fixedThread.title} (${threadCommentsMap.get(thread.id)?.length || 0} comments)`)
    }
  }

  // 2. 新規一般スレッド生成
  console.log('\n--- New Threads ---')
  const numNewThreads = randomInt(5, 9)
  const existingTitles = new Set(existingThreads?.map(t => t.title) || [])
  const usedCategories = new Set()

  for (let i = 0; i < numNewThreads; i++) {
    let category
    const availableCategories = Object.keys(THREAD_TEMPLATES).filter(c => !usedCategories.has(c))
    if (availableCategories.length > 0) {
      category = randomElement(availableCategories)
      usedCategories.add(category)
    } else {
      usedCategories.clear()
      category = randomElement(Object.keys(THREAD_TEMPLATES))
    }

    const templates = THREAD_TEMPLATES[category].filter(t => !existingTitles.has(t.title))
    if (templates.length === 0) continue

    const template = randomElement(templates)
    existingTitles.add(template.title)

    const user = randomElement(dummyUsers)
    const time = generateRandomJSTTime(baseDate)
    const thread = {
      title: template.title,
      body: template.body,
      category,
      user_id: user.id,
      created_at: time.toISOString(),
      _user: user,
      _isNew: true,
    }
    generatedThreads.push(thread)
    threadCommentsMap.set(thread.title, [{
      number: 1,
      user_id: user.id,
      user_name: user.display_name
    }])
    console.log(`  ${template.title.substring(0, 40)}...`)
  }

  // 3. コメント生成
  console.log('\n--- Generating Comments ---')

  const totalTarget = randomInt(600, 800)
  let totalGenerated = 0

  // 固定スレッドへのコメント
  for (const ft of FIXED_THREADS) {
    const key = ft.title.split('】')[1]
    const thread = fixedThreadMap.get(key) || generatedThreads.find(t => t.title === ft.title)
    if (!thread) continue

    const threadId = thread.id || thread.title
    const numComments = randomInt(ft.dailyComments[0], ft.dailyComments[1])
    const commentList = threadCommentsMap.get(threadId)

    for (let i = 0; i < numComments; i++) {
      const user = randomElement(dummyUsers)
      const time = generateRandomJSTTime(baseDate)
      const commentNumber = commentList.length + 1

      let content
      if (key === '独り言スレ') content = randomElement(HITORIGOTO_COMMENTS)
      else if (key === 'HbA1c報告スレ') content = generateHba1cComment()
      else if (key === 'リブレユーザー集まれ！') content = randomElement(LIBRE_COMMENTS)
      else if (key === 'なんでも質問スレ') content = randomElement(QUESTION_COMMENTS)

      generatedComments.push({
        thread_id: threadId,
        user_id: user.id,
        body: content,
        created_at: time.toISOString(),
        _thread_title: thread.title,
        _user: user,
        _comment_number: commentNumber,
      })
      commentList.push({ number: commentNumber, user_id: user.id, user_name: user.display_name })
      totalGenerated++
    }
  }

  // 一般スレッドへのコメント（新規 + 既存）
  const allGeneralThreads = [
    ...generatedThreads.filter(t => !FIXED_THREADS.some(f => t.title === f.title)),
    ...(existingThreads || []).filter(t => !FIXED_THREADS.some(f => t.title.includes(f.title.split('】')[1])))
  ]

  for (const thread of allGeneralThreads) {
    const threadId = thread.id || thread.title
    const isNewToday = thread._isNew === true

    // スレッド経過日数を計算
    const threadDate = new Date(thread.created_at)
    const daysOld = Math.floor((baseDate - threadDate) / (1000 * 60 * 60 * 24))

    const numComments = getCommentsForThreadAge(daysOld, isNewToday)
    if (numComments === 0) continue

    const commentList = threadCommentsMap.get(threadId)

    for (let i = 0; i < numComments && totalGenerated < totalTarget; i++) {
      const user = randomElement(dummyUsers.filter(u => u.id !== thread.user_id))
      if (!user) continue

      const time = generateRandomJSTTime(baseDate)
      const commentNumber = commentList.length + 1

      // リプライ判定
      const shouldReply = commentList.length > 1 && Math.random() < (0.2 + Math.random() * 0.4)
      let content

      if (shouldReply) {
        const replyTargets = commentList.filter(c => c.user_id !== user.id)
        if (replyTargets.length > 0) {
          const target = randomElement(replyTargets)
          content = randomElement(REPLY_TEMPLATES).replace('{num}', target.number).replace('{name}', target.user_name)
        } else {
          content = randomElement(GENERAL_COMMENTS)
        }
      } else {
        content = randomElement(GENERAL_COMMENTS)
      }

      generatedComments.push({
        thread_id: threadId,
        user_id: user.id,
        body: content,
        created_at: time.toISOString(),
        _thread_title: thread.title,
        _user: user,
        _comment_number: commentNumber,
      })
      commentList.push({ number: commentNumber, user_id: user.id, user_name: user.display_name })
      totalGenerated++

      // スレ主返信（5%の確率）
      if (Math.random() < 0.05 && totalGenerated < totalTarget) {
        const ownerReplyNumber = commentList.length + 1
        const ownerReplyTime = new Date(time.getTime() + randomInt(5, 60) * 60 * 1000)
        const owner = thread._user || userMap.get(thread.user_id)
        if (owner) {
          const ownerContent = randomElement(THREAD_OWNER_REPLY_TEMPLATES)
            .replace('{num}', commentNumber)
            .replace('{name}', user.display_name)

          generatedComments.push({
            thread_id: threadId,
            user_id: thread.user_id,
            body: ownerContent,
            created_at: ownerReplyTime.toISOString(),
            _thread_title: thread.title,
            _user: owner,
            _comment_number: ownerReplyNumber,
          })
          commentList.push({ number: ownerReplyNumber, user_id: thread.user_id, user_name: owner.display_name })
          totalGenerated++
        }
      }
    }
  }

  generatedComments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  console.log(`\nGenerated ${generatedThreads.length} threads, ${generatedComments.length} comments`)

  return { threads: generatedThreads, comments: generatedComments }
}

// プレビュー
function previewContent(content) {
  console.log('\n========== PREVIEW ==========\n')

  console.log('=== NEW THREADS ===')
  for (const t of content.threads) {
    const time = new Date(t.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    console.log(`  [${time}] ${t.title}`)
  }

  console.log(`\n=== COMMENTS (${content.comments.length} total) ===`)

  // スレッド別コメント数
  const commentsByThread = {}
  for (const c of content.comments) {
    commentsByThread[c._thread_title] = (commentsByThread[c._thread_title] || 0) + 1
  }
  for (const [title, count] of Object.entries(commentsByThread).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${title.substring(0, 35)}... : ${count}`)
  }
}

// 挿入
async function insertContent(content) {
  console.log('\n=== INSERTING CONTENT ===\n')

  const threadIdMap = new Map()

  const { data: existingThreads } = await supabase.from('threads').select('id, title')
  for (const t of existingThreads || []) {
    threadIdMap.set(t.title, t.id)
  }

  if (content.threads.length > 0) {
    console.log(`Inserting ${content.threads.length} threads...`)
    for (const thread of content.threads) {
      const { data, error } = await supabase
        .from('threads')
        .insert({
          title: thread.title,
          body: thread.body,
          category: thread.category,
          user_id: thread.user_id,
          created_at: thread.created_at,
        })
        .select()

      if (error) {
        console.error('Error:', error)
      } else if (data?.[0]) {
        threadIdMap.set(thread.title, data[0].id)
      }
    }
  }

  if (content.comments.length > 0) {
    console.log(`Inserting ${content.comments.length} comments...`)

    const commentsToInsert = content.comments.map(c => {
      const threadId = threadIdMap.get(c._thread_title)
      if (!threadId) return null
      return {
        thread_id: threadId,
        user_id: c.user_id,
        body: c.body,
        created_at: c.created_at,
      }
    }).filter(c => c !== null)

    const batchSize = 100
    for (let i = 0; i < commentsToInsert.length; i += batchSize) {
      const batch = commentsToInsert.slice(i, i + batchSize)
      const { error } = await supabase.from('comments').insert(batch)
      if (error) console.error('Batch error:', error)
    }
  }

  console.log('✓ Done!')
}

// メイン
async function main() {
  const args = process.argv.slice(2)
  const dateIndex = args.indexOf('--date')
  const isInsert = args.includes('--insert')

  if (dateIndex === -1 || !args[dateIndex + 1]) {
    console.log('Usage: node scripts/generate-daily-content.js --date YYYY-MM-DD [--insert]')
    process.exit(1)
  }

  const targetDate = args[dateIndex + 1]

  try {
    const content = await generateDailyContent(targetDate)
    if (!content) return

    previewContent(content)

    if (isInsert) {
      await insertContent(content)
    } else {
      console.log('\n💡 Run with --insert to save')
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
