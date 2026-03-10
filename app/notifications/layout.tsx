import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お知らせ | ディーライフ',
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
