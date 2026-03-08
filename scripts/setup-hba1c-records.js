/**
 * Setup HbA1c records for dummy users
 *
 * Creates realistic HbA1c history based on user profiles:
 * - Type 1: typically 6.5-8.5%, more variation
 * - Type 2: wider range 6.0-10.0%, depends on treatment
 * - Prediabetes: 5.7-6.4%
 * - Gestational: 5.5-6.5%
 *
 * Usage:
 *   node scripts/setup-hba1c-records.js --preview
 *   node scripts/setup-hba1c-records.js --insert
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function randomFloat(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate HbA1c values based on diabetes type and treatment
function generateHbA1cRange(diabetesType, treatments) {
  const hasPump = treatments?.includes('pump') || treatments?.includes('insulin_pump')
  const hasInsulin = treatments?.includes('insulin')
  const hasGlp1 = treatments?.includes('glp1')
  const hasMedication = treatments?.includes('oral_medication')

  switch (diabetesType) {
    case 'type1':
      // Type 1: Good control with pump, variable otherwise
      if (hasPump) {
        return { min: 6.0, max: 7.5, variation: 0.3 }  // Well controlled
      } else if (hasInsulin) {
        return { min: 6.5, max: 8.5, variation: 0.5 }  // Typical range
      }
      return { min: 7.0, max: 9.0, variation: 0.6 }

    case 'type2':
      // Type 2: Depends heavily on treatment
      if (hasInsulin || hasGlp1) {
        return { min: 6.5, max: 8.0, variation: 0.4 }  // Moderate control
      } else if (hasMedication) {
        return { min: 6.5, max: 8.5, variation: 0.5 }  // Variable
      }
      return { min: 6.5, max: 9.5, variation: 0.6 }  // Diet/exercise only

    case 'prediabetes':
      return { min: 5.7, max: 6.4, variation: 0.2 }

    case 'gestational':
      return { min: 5.5, max: 6.5, variation: 0.2 }

    default:
      return { min: 6.0, max: 8.0, variation: 0.4 }
  }
}

// Generate a trend (improving, stable, or worsening)
function generateTrend() {
  const rand = Math.random()
  if (rand < 0.4) return 'improving'  // 40% improving
  if (rand < 0.75) return 'stable'    // 35% stable
  return 'worsening'                   // 25% worsening
}

// Generate historical HbA1c values
function generateHbA1cHistory(userId, diabetesType, treatments, monthsBack = 12) {
  const range = generateHbA1cRange(diabetesType, treatments)
  const trend = generateTrend()
  const records = []

  // Start value (current)
  let currentValue = randomFloat(range.min, range.max)

  // How many months of data to generate (3-12)
  const numMonths = randomInt(3, Math.min(12, monthsBack))

  // Generate from oldest to newest
  const now = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth() - numMonths + 1, 1)

  for (let i = 0; i < numMonths; i++) {
    const recordDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 15)  // Mid-month
    const recordedAt = recordDate.toISOString().slice(0, 10)  // YYYY-MM-DD

    // Calculate value based on trend
    let monthOffset = i / numMonths
    let value

    if (trend === 'improving') {
      // Start higher, improve over time
      const startValue = randomFloat(range.min + 1, range.max)
      const endValue = randomFloat(range.min, range.min + 1)
      value = startValue - (startValue - endValue) * monthOffset
    } else if (trend === 'worsening') {
      // Start lower, worsen over time
      const startValue = randomFloat(range.min, range.min + 1)
      const endValue = randomFloat(range.max - 1, range.max)
      value = startValue + (endValue - startValue) * monthOffset
    } else {
      // Stable with variation
      value = currentValue + randomFloat(-range.variation, range.variation)
    }

    // Clamp to valid range
    value = Math.max(4.0, Math.min(15.0, Math.round(value * 10) / 10))

    records.push({
      user_id: userId,
      recorded_at: recordedAt,
      value,
      memo: generateMemo(value, trend, i === numMonths - 1),
      is_public: Math.random() < 0.6,  // 60% public
    })
  }

  return records
}

// Generate a realistic memo
function generateMemo(value, trend, isLatest) {
  const memos = {
    good: [
      '目標達成！',
      '安定してきた',
      '食事療法が効いてる',
      '運動を続けた成果',
      '主治医に褒められた',
      '',
      '',
    ],
    improving: [
      '少し改善',
      '頑張った甲斐があった',
      '薬を変えてから安定',
      '食事を見直した',
      '',
      '',
    ],
    stable: [
      '安定',
      '変わらず',
      '現状維持',
      '',
      '',
      '',
    ],
    concerning: [
      '少し上がった...',
      '食べ過ぎに注意',
      '運動不足かも',
      '次回は下げたい',
      '',
      '',
    ],
    high: [
      '要改善',
      '生活習慣見直し中',
      '薬の調整が必要かも',
      '',
      '',
    ],
  }

  let category
  if (value <= 6.5) {
    category = 'good'
  } else if (value <= 7.0) {
    category = trend === 'improving' ? 'improving' : 'stable'
  } else if (value <= 8.0) {
    category = 'stable'
  } else if (value <= 9.0) {
    category = 'concerning'
  } else {
    category = 'high'
  }

  const options = memos[category]
  return options[Math.floor(Math.random() * options.length)]
}

async function main() {
  const args = process.argv.slice(2)
  const isPreview = args.includes('--preview')
  const isInsert = args.includes('--insert')

  console.log('=== Setting up HbA1c Records for Dummy Users ===\n')

  // Fetch dummy users with their profiles
  const { data: dummyUsers, error: usersError } = await supabase
    .from('users')
    .select('id, display_name, is_dummy')
    .eq('is_dummy', true)

  if (usersError) {
    console.error('Error fetching users:', usersError)
    return
  }

  console.log(`Found ${dummyUsers?.length || 0} dummy users`)

  if (!dummyUsers || dummyUsers.length === 0) {
    console.log('No dummy users found.')
    return
  }

  // Fetch profiles
  const userIds = dummyUsers.map(u => u.id)
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('user_id, diabetes_type, treatment')
    .in('user_id', userIds)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return
  }

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

  // Check existing HbA1c records
  const { data: existingRecords } = await supabase
    .from('hba1c_records')
    .select('user_id')
    .in('user_id', userIds)

  const usersWithRecords = new Set(existingRecords?.map(r => r.user_id) || [])

  console.log(`Users with existing records: ${usersWithRecords.size}`)

  // Generate records for users without them
  const allRecords = []
  let usersProcessed = 0

  for (const user of dummyUsers) {
    if (usersWithRecords.has(user.id)) {
      continue  // Skip users who already have records
    }

    const profile = profileMap.get(user.id)
    if (!profile) {
      console.log(`  Skipping ${user.display_name}: No profile`)
      continue
    }

    const treatments = profile.treatment || []
    const records = generateHbA1cHistory(user.id, profile.diabetes_type, treatments)

    if (isPreview && usersProcessed < 5) {
      console.log(`\n📧 ${user.display_name}`)
      console.log(`   Type: ${profile.diabetes_type}, Treatment: ${JSON.stringify(treatments)}`)
      console.log(`   Generated ${records.length} records:`)
      for (const r of records) {
        console.log(`     ${r.recorded_at}: ${r.value}% ${r.is_public ? '(public)' : '(private)'} ${r.memo || ''}`)
      }
    }

    allRecords.push(...records)
    usersProcessed++
  }

  console.log(`\n=== Summary ===`)
  console.log(`Users to update: ${usersProcessed}`)
  console.log(`Total records to create: ${allRecords.length}`)

  if (isInsert && allRecords.length > 0) {
    console.log('\nInserting records...')

    // Insert in batches of 100
    const batchSize = 100
    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, i + batchSize)
      const { error } = await supabase
        .from('hba1c_records')
        .insert(batch)

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        return
      }

      console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allRecords.length / batchSize)}`)
    }

    console.log('\nSuccessfully inserted all HbA1c records!')
  } else if (!isInsert) {
    console.log('\nTo insert these records, run:')
    console.log('  node scripts/setup-hba1c-records.js --insert')
  }
}

main().catch(console.error)
