import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'Dライフへのお問い合わせはこちらから。サービスに関するご質問、不具合報告、ご意見・ご要望をお寄せください。',
  openGraph: {
    title: 'お問い合わせ | Dライフ',
    description: 'Dライフへのお問い合わせはこちらから。',
    type: 'website',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
