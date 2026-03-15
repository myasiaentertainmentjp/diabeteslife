import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MessageSquare,
  PenSquare,
  Camera,
  LineChart,
  AlertTriangle,
  HelpCircle,
  Mail,
  Users,
  Heart,
  UserCircle,
  Settings,
  CheckCircle2,
  Receipt,
  Calculator,
  FileText,
  ArrowLeft
} from 'lucide-react'

export const metadata: Metadata = {
  title: '使い方ガイド',
  description: 'ディーライフの使い方をご紹介します。トピック投稿・HbA1c記録・プロフィール設定など、各機能の説明をまとめています。',
  alternates: {
    canonical: 'https://diabeteslife.jp/guide',
  },
  openGraph: {
    title: '使い方ガイド | Dライフ',
    description: 'ディーライフの使い方をご紹介します。トピック投稿・HbA1c記録・プロフィール設定など、各機能の説明をまとめています。',
    type: 'website',
    siteName: 'Dライフ',
    images: [{ url: '/images/ogp.png', width: 1200, height: 630 }],
  },
}

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>トップに戻る</span>
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">使い方</h1>
      <p className="text-gray-600 text-sm mb-6">はじめての方へ</p>

      {/* What is D-Life */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500">
          Dライフとは
        </h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
              <Users size={24} className="text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">糖尿病患者とご家族のためのコミュニティ</h3>
              <p className="text-gray-600">
                Dライフは、糖尿病とともに生きる方々が集まるコミュニティサイトです。
                患者さん・ご家族・支える人たちが安心して話せる場所を目指しています。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Heart size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">匿名・無料で使える</h3>
              <p className="text-gray-600">
                会員登録は無料で、ニックネームでの参加が可能です。
                実名を公開する必要はありません。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500">
          主な機能
        </h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
              <MessageSquare size={24} className="text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">掲示板（トピック）</h3>
              <p className="text-gray-600">
                食事・治療・運動・メンタルケアなど、カテゴリ別に話題を立てて交流できます。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <LineChart size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">HbA1c・体重記録</h3>
              <p className="text-gray-600">
                検査結果や体重をグラフで記録・管理できます。長期的な変化を可視化して、
                日々の管理に役立てましょう。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <FileText size={24} className="text-purple-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">記事・コラム</h3>
              <p className="text-gray-600">
                糖尿病の食事・治療・運動などに関する専門的な情報記事を掲載しています。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <UserCircle size={24} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">プロフィール</h3>
              <p className="text-gray-600">
                糖尿病の種別・治療法・使用デバイスなどを登録でき、同じ状況の仲間を
                見つけやすくなります。公開範囲は自分で設定できます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to start */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500">
          はじめ方
        </h2>
        <div className="space-y-4">
          {[
            { step: 1, icon: Mail, label: '無料会員登録（メールまたはGoogle）' },
            { step: 2, icon: UserCircle, label: 'プロフィールを設定' },
            { step: 3, icon: MessageSquare, label: '気になるトピックに参加' },
            { step: 4, icon: PenSquare, label: '自分でトピックを立てる' },
          ].map(({ step, icon: Icon, label }) => (
            <div key={step} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                {step}
              </div>
              <div className="flex items-center gap-2">
                <Icon size={18} className="text-gray-400" />
                <span className="text-gray-700">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-amber-50 rounded-xl p-6 mb-4 border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 mb-2">ご注意</h3>
            <p className="text-amber-700 text-sm">
              本サービスは患者同士の情報交換の場です。医療相談・診断・治療の指示は行いません。
              治療に関するご判断は必ず主治医にご相談ください。
            </p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/register"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
        >
          <CheckCircle2 size={18} />
          無料で始める
        </Link>
        <Link
          href="/faq"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <HelpCircle size={18} />
          よくある質問
        </Link>
      </div>
    </div>
  )
}
