import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'マイページ | ディーライフ',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
