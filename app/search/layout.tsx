import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '検索',
  description: 'ディーライフのトピック・記事を検索できます。糖尿病に関するキーワードで情報を探してみましょう。',
  alternates: {
    canonical: 'https://diabeteslife.jp/search',
  },
  openGraph: {
    title: '検索 | Dライフ',
    description: 'ディーライフのトピック・記事を検索できます。',
    type: 'website',
    siteName: 'Dライフ',
    images: [{ url: '/images/ogp.png', width: 1200, height: 630 }],
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
