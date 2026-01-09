import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  name: string
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    id: 'account',
    name: 'アカウント・登録について',
    items: [
      {
        question: '会員登録は無料ですか？',
        answer: 'はい、完全無料でご利用いただけます。',
      },
      {
        question: '会員登録しなくても利用できますか？',
        answer: 'スレッドや記事の閲覧は会員登録なしでも可能です。投稿やコメントには会員登録が必要です。',
      },
      {
        question: 'パスワードを忘れました',
        answer: 'ログイン画面の「パスワードを忘れた方」からリセットできます。',
      },
      {
        question: '退会したいのですが',
        answer: 'マイページの設定から退会手続きが可能です。',
      },
    ],
  },
  {
    id: 'posting',
    name: '投稿・コミュニティについて',
    items: [
      {
        question: 'どんな内容を投稿できますか？',
        answer: '糖尿病に関する体験談、質問、情報共有などを投稿できます。ただし、医療行為に該当する内容は禁止です。',
      },
      {
        question: '投稿を削除・編集できますか？',
        answer: 'ご自身の投稿は編集・削除が可能です。',
      },
      {
        question: '不適切な投稿を見つけました',
        answer: '投稿の「報告」ボタンから通報してください。',
      },
      {
        question: '実名で投稿する必要がありますか？',
        answer: 'いいえ、ニックネームでの投稿が可能です。',
      },
    ],
  },
  {
    id: 'medical',
    name: '医療情報について',
    items: [
      {
        question: 'ここで医療相談はできますか？',
        answer: '本サービスは患者同士の情報交換の場であり、医療相談はできません。治療に関するご質問は主治医にご相談ください。',
      },
      {
        question: '投稿されている情報は正確ですか？',
        answer: '投稿はユーザー個人の体験・意見であり、医学的な正確性は保証されていません。',
      },
    ],
  },
  {
    id: 'privacy',
    name: 'プライバシー・セキュリティについて',
    items: [
      {
        question: '個人情報は安全に管理されていますか？',
        answer: 'はい、SSL暗号化通信を使用し、パスワードも暗号化して保存しています。',
      },
      {
        question: 'プロフィールは公開されますか？',
        answer: '表示名、糖尿病タイプ、自己紹介文は公開されます。メールアドレスは公開されません。',
      },
    ],
  },
  {
    id: 'other',
    name: 'その他',
    items: [
      {
        question: 'スマートフォンでも利用できますか？',
        answer: 'はい、スマートフォン、タブレット、パソコンからご利用いただけます。',
      },
      {
        question: '運営への要望はどこに送ればいいですか？',
        answer: 'お問い合わせフォームからお送りください。',
      },
    ],
  },
]

function AccordionItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="text-rose-500 font-bold shrink-0">Q.</span>
          <span className="font-medium text-gray-900">{item.question}</span>
        </div>
        <ChevronDown
          size={20}
          className={`text-rose-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-4 pb-4 flex items-start gap-3">
          <span className="text-rose-500 font-bold shrink-0">A.</span>
          <span className="text-gray-700 leading-relaxed">{item.answer}</span>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Handle hash navigation on page load
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  function toggleItem(categoryIndex: number, itemIndex: number) {
    const key = `${categoryIndex}-${itemIndex}`
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
          <HelpCircle size={24} className="text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">よくある質問</h1>
          <p className="text-gray-600 text-sm">FAQ</p>
        </div>
      </div>

      <div className="space-y-4">
        {faqData.map((category, categoryIndex) => (
          <div
            key={category.id}
            id={category.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-4 py-3 bg-rose-50 border-b border-rose-100">
              <h2 className="font-bold text-rose-700">{category.name}</h2>
            </div>
            <div>
              {category.items.map((item, itemIndex) => (
                <AccordionItem
                  key={itemIndex}
                  item={item}
                  isOpen={openItems[`${categoryIndex}-${itemIndex}`] || false}
                  onClick={() => toggleItem(categoryIndex, itemIndex)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-rose-50 rounded-xl text-center">
        <p className="text-gray-700 mb-4">
          お探しの回答が見つかりませんでしたか？
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
        >
          お問い合わせフォームへ
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-rose-500 hover:underline text-sm">
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
