import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'

interface Props {
  params: Promise<{ userId: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { userId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()

  const name = profile?.display_name || 'ユーザー'

  return {
    title: `${name}さんのプロフィール`,
    description: `${name}さんのDライフ プロフィールページ。投稿したトピックや記録をご覧いただけます。`,
    robots: { index: false, follow: false },
  }
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
