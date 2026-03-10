import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Users, BookOpen, BarChart2, MessageCircle, Shield, ArrowRight, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dライフとは | 糖尿病と向き合う人のためのコミュニティ',
  description: 'Dライフは、糖尿病と向き合うすべての人が安心して話せるコミュニティサービスです。患者さん・ご家族・医療関係者が情報を共有し、支え合える場所を目指しています。',
}

const features = [
  {
    icon: MessageCircle,
    title: 'トピック掲示板',
    description: '食事・運動・治療・メンタルなど、日常の疑問や悩みを気軽に投稿。同じ経験を持つ仲間からのアドバイスが得られます。',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-100',
    cardGradient: 'from-rose-400 to-pink-500',
    emoji: '💬',
  },
  {
    icon: BarChart2,
    title: '健康記録・グラフ',
    description: 'HbA1cや体重を継続して記録・グラフ化。変化を見える化することで日々の管理がラクになります。',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    cardGradient: 'from-blue-400 to-cyan-500',
    emoji: '📊',
  },
  {
    icon: BookOpen,
    title: '記事・情報',
    description: '糖尿病に関する知識・生活のコツ・最新情報を分かりやすくお届け。日常生活に役立つヒントが見つかります。',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
    cardGradient: 'from-emerald-400 to-teal-500',
    emoji: '📖',
  },
  {
    icon: Users,
    title: 'コミュニティ',
    description: '患者・家族・サポーターなど様々な立場の人が集まります。「ひとりじゃない」と感じられる場所です。',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100',
    cardGradient: 'from-purple-400 to-indigo-500',
    emoji: '🤝',
  },
  {
    icon: Shield,
    title: '安心・安全な環境',
    description: 'モデレーションで誰もが安心して話せる環境を維持。匿名参加もOKです。',
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    cardGradient: 'from-orange-400 to-amber-500',
    emoji: '🛡️',
  },
  {
    icon: Heart,
    title: '完全無料',
    description: '登録・利用はすべて無料。会員登録さえすれば、すべての機能をすぐに使い始められます。',
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100',
    cardGradient: 'from-pink-400 to-rose-500',
    emoji: '🎁',
  },
]

const voices = [
  {
    text: '同じ境遇の人と話せてホッとしました。一人で悩んでいた時期が嘘みたいです。',
    name: '40代・2型糖尿病・女性',
    initial: '山',
    color: 'bg-rose-400',
  },
  {
    text: 'HbA1cの記録をつけ始めてから、数値への意識が変わりました。グラフが励みになっています。',
    name: '50代・2型糖尿病・男性',
    initial: '田',
    color: 'bg-blue-400',
  },
  {
    text: '家族として参加しています。患者さんの本音が聞けて、接し方のヒントをたくさんもらえました。',
    name: '30代・家族としてサポート',
    initial: '佐',
    color: 'bg-emerald-400',
  },
]

const targets = [
  { emoji: '🩺', label: '1型・2型糖尿病の患者さん' },
  { emoji: '👨‍👩‍👧', label: '患者さんのご家族・パートナー' },
  { emoji: '💊', label: '治療中・療養中の方' },
  { emoji: '🤝', label: 'サポーターとして関わりたい方' },
  { emoji: '📚', label: '糖尿病についてもっと知りたい方' },
]

const checks = [
  '登録・利用はすべて無料',
  '匿名での参加OK',
  '個人情報の公開は任意',
  '運営によるモデレーションで安心',
  'スマートフォンでも使いやすい設計',
]

export default function AboutPage() {
  return (
    <div className="pb-16">

      {/* ヒーロー */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M-4 4l8-8M0 60L60 0M56 64l8-8'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide">
            ABOUT D-LIFE
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
            糖尿病と向き合う<br />すべての人のための場所
          </h1>
          <p className="text-rose-100 text-base leading-relaxed max-w-xl mx-auto mb-8">
            Dライフは、糖尿病患者さん・ご家族・サポーターが<br />
            安心してつながれるコミュニティサービスです。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-rose-500 font-bold px-7 py-3 rounded-full hover:bg-rose-50 transition-colors"
            >
              無料で始める <ArrowRight size={16} />
            </Link>
            <Link
              href="/threads"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-medium px-7 py-3 rounded-full hover:bg-white/20 transition-colors border border-white/30"
            >
              トピックを見る
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">

        {/* 数字カード */}
        <div className="grid grid-cols-3 gap-4 -mt-8 mb-12">
          {[
            { num: '無料', label: '完全無料で利用可能' },
            { num: '匿名', label: 'OK・個人情報任意' },
            { num: '24h', label: 'いつでも閲覧・投稿' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-rose-500 mb-1">{s.num}</div>
              <div className="text-xs text-gray-500 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 背景・コンセプト */}
        <div className="mb-12">
          <div className="rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-white text-center">
            <div className="text-5xl mb-3">🌏</div>
            <h2 className="text-xl font-bold mb-2">Dライフが生まれた背景</h2>
            <p className="text-rose-100 text-sm">日本国内だけで1,000万人以上が罹患する糖尿病</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              糖尿病は、日本国内だけで<strong>1,000万人以上</strong>が罹患しているといわれる身近な病気です。しかし、治療や日常生活の中で感じる孤独感・不安・疑問を気軽に話せる場所はまだ多くありません。
            </p>
            <p>
              「検査の数値が下がらない」「食事制限がつらい」「家族にどう話せばいいか」——そんな声を一人で抱えている方が、今もたくさんいます。
            </p>
            <p>
              Dライフは、<strong>「同じ経験を持つ仲間とつながることで、療養生活がすこし楽になるはず」</strong>という思いから立ち上げました。医療情報の提供ではなく、日常の「生きた声」を共有できる場所を大切にしています。
            </p>
          </div>
        </div>

        {/* こんな方に */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">こんな方に使っていただけます</h2>
          <div className="grid grid-cols-1 gap-3">
            {targets.map((t) => (
              <div key={t.label} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm">
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-gray-700 font-medium text-sm">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* できること */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Dライフでできること</h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className={"bg-gradient-to-br " + f.cardGradient + " p-5 flex items-center justify-center"}>
                    <span className="text-4xl">{f.emoji}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={"w-6 h-6 rounded-md flex items-center justify-center " + f.iconBg}>
                        <Icon size={13} className={f.iconColor} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ユーザーの声 */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">参加者の声</h2>
          <div className="space-y-4">
            {voices.map((v) => (
              <div key={v.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed mb-4">「{v.text}」</p>
                <div className="flex items-center gap-3">
                  <div className={"w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm " + v.color}>
                    {v.initial}
                  </div>
                  <span className="text-xs text-gray-500">{v.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 安心ポイント */}
        <div className="mb-12 bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">安心して使っていただけます</h2>
          <ul className="space-y-3">
            {checks.map((c) => (
              <li key={c} className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle size={18} className="text-rose-400 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-8 text-center text-white">
          <Heart size={32} className="mx-auto mb-3 opacity-80" />
          <h2 className="text-xl font-bold mb-2">まずは無料で登録してみましょう</h2>
          <p className="text-rose-100 text-sm mb-6">登録は1分以内・匿名でもOK・完全無料</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-rose-500 font-bold px-8 py-3 rounded-full hover:bg-rose-50 transition-colors"
          >
            無料で始める <ArrowRight size={16} />
          </Link>
          <div className="mt-4">
            <Link href="/guide" className="text-rose-200 text-sm hover:text-white transition-colors">
              まずは使い方を見る →
            </Link>
          </div>
        </div>

        {/* フッターリンク */}
        <div className="mt-8 text-center text-sm text-gray-400 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link href="/company" className="hover:text-rose-500 transition-colors">運営会社</Link>
          <Link href="/terms" className="hover:text-rose-500 transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-rose-500 transition-colors">プライバシーポリシー</Link>
          <Link href="/contact" className="hover:text-rose-500 transition-colors">お問い合わせ</Link>
        </div>

      </div>
    </div>
  )
}
