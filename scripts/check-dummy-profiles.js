/**
 * Check dummy user profiles and HbA1c records
 *
 * Usage: node scripts/check-dummy-profiles.js
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkDummyProfiles() {
  console.log('=== Checking Dummy Users ===\n')

  // Fetch all dummy users
  const { data: dummyUsers, error: usersError } = await supabase
    .from('users')
    .select('id, email, display_name, is_dummy, role, created_at')
    .eq('is_dummy', true)
    .order('display_name')

  if (usersError) {
    console.error('Error fetching dummy users:', usersError)
    return
  }

  console.log(`Found ${dummyUsers?.length || 0} dummy users\n`)

  if (!dummyUsers || dummyUsers.length === 0) {
    console.log('No dummy users found.')
    return
  }

  // Get user IDs for further queries
  const userIds = dummyUsers.map(u => u.id)

  // Fetch user_profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', userIds)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

  // Fetch HbA1c records
  const { data: hba1cRecords, error: hba1cError } = await supabase
    .from('hba1c_records')
    .select('*')
    .in('user_id', userIds)
    .order('recorded_at', { ascending: false })

  if (hba1cError) {
    console.error('Error fetching HbA1c records:', hba1cError)
  }

  // Group HbA1c records by user
  const hba1cMap = new Map()
  for (const record of hba1cRecords || []) {
    if (!hba1cMap.has(record.user_id)) {
      hba1cMap.set(record.user_id, [])
    }
    hba1cMap.get(record.user_id).push(record)
  }

  // Display each user
  console.log('=== User Details ===\n')

  for (const user of dummyUsers) {
    const profile = profileMap.get(user.id)
    const hba1c = hba1cMap.get(user.id) || []

    console.log(`📧 ${user.display_name || user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)

    if (profile) {
      console.log(`   糖尿病タイプ: ${profile.diabetes_type || '未設定'}`)
      console.log(`   治療法: ${JSON.stringify(profile.treatment_methods || profile.treatment || [])}`)
      console.log(`   年代: ${profile.age_group || '未設定'}`)
      console.log(`   性別: ${profile.gender || '未設定'}`)
      console.log(`   罹病期間: ${profile.illness_duration || '未設定'}`)
      console.log(`   デバイス: ${profile.device || JSON.stringify(profile.devices || [])}`)
      console.log(`   Bio: ${(profile.bio || '').substring(0, 50)}${(profile.bio || '').length > 50 ? '...' : ''}`)
    } else {
      console.log(`   プロフィール: 未作成`)
    }

    if (hba1c.length > 0) {
      console.log(`   HbA1c記録: ${hba1c.length}件`)
      console.log(`   最新HbA1c: ${hba1c[0].value}% (${hba1c[0].recorded_at})`)
    } else {
      console.log(`   HbA1c記録: なし`)
    }

    console.log('')
  }

  // Summary
  console.log('=== Summary ===\n')
  const withProfiles = dummyUsers.filter(u => profileMap.has(u.id))
  const withHba1c = dummyUsers.filter(u => hba1cMap.has(u.id))
  const withDiabetesType = dummyUsers.filter(u => {
    const p = profileMap.get(u.id)
    return p && p.diabetes_type
  })

  console.log(`Total dummy users: ${dummyUsers.length}`)
  console.log(`With user_profiles: ${withProfiles.length}`)
  console.log(`With diabetes_type set: ${withDiabetesType.length}`)
  console.log(`With HbA1c records: ${withHba1c.length}`)
  console.log(`Total HbA1c records: ${hba1cRecords?.length || 0}`)
}

checkDummyProfiles().catch(console.error)
