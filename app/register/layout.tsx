import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規会員登録',
  description: 'Dライフに無料登録して、糖尿病患者・ご家族のコミュニティに参加しましょう。HbA1c記録・食事管理・掲示板などが無料で使えます。',
  robots: { index: false, follow: false },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
