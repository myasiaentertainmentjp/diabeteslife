/**
 * Run migration 009_scheduled_posts.sql
 */
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://josanlblwfjdaaezqbnw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2FubGJsd2ZqZGFhZXpxYm53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg0MjYwNiwiZXhwIjoyMDgzNDE4NjA2fQ.JlTXBmY5HJAqfRD_AazsiBORpgLZfB74fPkNyyfVSQY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runMigration() {
  const sqlPath = path.join(__dirname, '../supabase/migrations/009_scheduled_posts.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('Running migration...')

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    // Try direct query approach using REST API
    console.log('RPC not available, trying alternative...')

    // Split SQL into statements and run each
    const statements = sql.split(';').filter(s => s.trim())

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...')
        // We can't run raw SQL through the JS client, need to use Supabase dashboard
      }
    }

    console.log('\n=== IMPORTANT ===')
    console.log('Please run this migration manually in Supabase SQL Editor:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Paste and run the content of: supabase/migrations/009_scheduled_posts.sql')
    console.log('\nAlternatively, if you have Supabase CLI installed:')
    console.log('  supabase db push')
    return false
  }

  console.log('Migration completed successfully!')
  return true
}

runMigration().catch(console.error)
