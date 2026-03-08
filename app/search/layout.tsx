import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '検索',
  description: 'Dライフ内のトピックや記事を検索できます。キーワードを入力して、糖尿病に関する情報を探しましょう。',
  openGraph: {
    title: '検索 | Dライフ',
    description: 'Dライフ内のトピックや記事を検索できます。',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
