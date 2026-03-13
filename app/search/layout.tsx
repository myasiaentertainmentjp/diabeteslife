import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '検索',
  description: 'Dライフのトピック・記事を検索。気になるキーワードで糖尿病に関する情報を探せます。',
  robots: { index: false, follow: false },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
