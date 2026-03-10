import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくある質問 | Dライフ',
  description: 'Dライフのよくある質問をまとめました。登録方法・使い方・プライバシーについてご確認いただけます。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '会員登録は無料ですか？',
        acceptedAnswer: { '@type': 'Answer', text: 'はい、完全無料でご利用いただけます。' },
      },
      {
        '@type': 'Question',
        name: '会員登録しなくても利用できますか？',
        acceptedAnswer: { '@type': 'Answer', text: 'トピックや記事の閲覧は会員登録なしでも可能です。投稿やコメントには会員登録が必要です。' },
      },
      {
        '@type': 'Question',
        name: 'パスワードを忘れました',
        acceptedAnswer: { '@type': 'Answer', text: 'ログイン画面の「パスワードを忘れた方」からリセットできます。' },
      },
      {
        '@type': 'Question',
        name: '退会したいのですが',
        acceptedAnswer: { '@type': 'Answer', text: 'マイページの設定から退会手続きが可能です。' },
      },
      {
        '@type': 'Question',
        name: 'どんな内容を投稿できますか？',
        acceptedAnswer: { '@type': 'Answer', text: '糖尿病に関する体験談、質問、情報共有などを投稿できます。ただし、医療行為に該当する内容は禁止です。' },
      },
      {
        '@type': 'Question',
        name: '投稿を削除・編集できますか？',
        acceptedAnswer: { '@type': 'Answer', text: 'ご自身の投稿は編集・削除が可能です。' },
      },
      {
        '@type': 'Question',
        name: '実名で投稿する必要がありますか？',
        acceptedAnswer: { '@type': 'Answer', text: 'いいえ、ニックネームでの投稿が可能です。' },
      },
      {
        '@type': 'Question',
        name: 'ここで医療相談はできますか？',
        acceptedAnswer: { '@type': 'Answer', text: '本サービスは患者同士の情報交換の場であり、医療相談はできません。治療に関するご質問は主治医にご相談ください。' },
      },
      {
        '@type': 'Question',
        name: '個人情報は安全に管理されていますか？',
        acceptedAnswer: { '@type': 'Answer', text: 'はい、SSL暗号化通信を使用し、パスワードも暗号化して保存しています。' },
      },
      {
        '@type': 'Question',
        name: 'スマートフォンでも利用できますか？',
        acceptedAnswer: { '@type': 'Answer', text: 'はい、スマートフォン、タブレット、パソコンからご利用いただけます。' },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
