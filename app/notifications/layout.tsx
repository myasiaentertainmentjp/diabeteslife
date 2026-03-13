import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お知らせ・通知',
  description: 'Dライフからのお知らせと通知一覧。',
  robots: { index: false, follow: false },
}

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
