import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Users, BookOpen, BarChart2, MessageCircle, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dライフとは | 糖尿病と向き合う人のためのコミュニティ',
  description: 'Dライフは、糖尿病と向き合うすべての人が安心して話せるコミュニティサービスです。患者さん・ご家族・医療関係者が情報を共有し、支え合える場所を目指しています。',
}

const features = [
  {
    icon: MessageCircle,
    title: 'トピック掲示板',
    description: '食事・運動・治療・メンタルなど、日常の疑問や悩みを気軽に投稿できます。同じ経験を持つ仲間からのアドバイスが得られます。',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    icon: BarChart2,
    title: '健康記録',
    description: 'HbA1cや体重を継続して記録・グラフ化できます。変化を見える化することで、日々の管理がラクになります。',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: BookOpen,
    title: '記事・情報',
    description: '糖尿病に関する知識・生活のコツ・最新情報を分かりやすくお届けします。日常生活に役立つヒントが見つかります。',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Users,
    title: 'ユーザーコミュニティ',
    description: '患者さん・ご家族・サポーターなど、様々な立場の人が集まる多様なコミュニティ。「ひとりじゃない」と感じられる場所です。',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: Shield,
    title: '安心・安全な環境',
    description: '匿名でも参加OK。コミュニティガイドラインと運営によるモデレーションで、誰もが安心して話せる場を守ります。',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Heart,
    title: '無料で使えます',
    description: '登録・利用はすべて無料。会員登録さえすれば、すべての機能をすぐに使い始めることができます。',
    color: 'text-pink-500',
    bg: 'bg-pink-50',
  },
]

const targets = [
  { emoji: '🩺', label: '1型・2型・その他の糖尿病患者さん' },
  { emoji: '👨‍👩‍👧', label: '患者さんのご家族' },
  { emoji: '💊', label: '治療中・療養中の方' },
  { emoji: '🤝', label: 'サポーターとして関わりたい方' },
  { emoji: '📚', label: '糖尿病についてもっと知りたい方' },
]

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* ヒーロー */}
      <div className="text-center mb-12">
        <span className="inline-block bg-rose-50 text-rose-500 text-sm font-medium px-4 py-1 rounded-full mb-4">
          Dライフとは
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          糖尿病と向き合う<br />
          すべての人のためのコミュニティ
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
          Dライフは、糖尿病患者さん・ご家族・サポーターが
          安心して話せる場所として生まれたコミュニティサービスです。
          日々の悩み・記録・情報を共有しながら、
          「ひとりじゃない」と感じられる環境を目指しています。
        </p>
      </div>

      {/* なぜ作ったか */}
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">💡 Dライフが生まれた背景</h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          糖尿病は、日本国内だけで1,000万人以上が罹患しているといわれる身近な病気です。
          しかし、治療や日常生活の中で感じる孤独感・不安・疑問を
          気軽に話せる場所はまだ少ないのが現状です。
        </p>
        <p className="text-gray-700 leading-relaxed text-sm mt-3">
          Dライフは、「同じ経験を持つ仲間とつながることで、
          療養生活がすこし楽になるはず」という思いから立ち上げました。
          医療情報の提供ではなく、日常の「生きた声」を共有できる場所を大切にしています。
        </p>
      </div>

      {/* 対象ユーザー */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">こんな方に使っていただけます</h2>
        <div className="space-y-3">
          {targets.map((t) => (
            <div key={t.label} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-3">
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-gray-700 font-medium">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 機能一覧 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Dライフでできること</h2>
        <div className="grid grid-cols-1 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-5 flex gap-4">
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " + f.bg}>
                  <Icon size={20} className={f.color} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-xl font-bold mb-2">まずは無料で登録してみましょう</h2>
        <p className="text-rose-100 text-sm mb-6">登録は1分以内・匿名でもOK</p>
        <Link
          href="/register"
          className="inline-block bg-white text-rose-500 font-bold px-8 py-3 rounded-full hover:bg-rose-50 transition-colors"
        >
          無料で始める
        </Link>
        <div className="mt-4">
          <Link href="/guide" className="text-rose-200 text-sm hover:text-white transition-colors">
            まずは使い方を見る →
          </Link>
        </div>
      </div>

      {/* 運営情報リンク */}
      <div className="mt-8 text-center text-sm text-gray-500 space-x-4">
        <Link href="/company" className="hover:text-rose-500 transition-colors">運営会社</Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-rose-500 transition-colors">利用規約</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-rose-500 transition-colors">プライバシーポリシー</Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-rose-500 transition-colors">お問い合わせ</Link>
      </div>

    </div>
  )
}
