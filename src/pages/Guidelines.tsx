import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Stethoscope, CheckCircle, XCircle, Flag, AlertTriangle, HelpCircle } from 'lucide-react'

export function Guidelines() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dライフ コミュニティガイドライン</h1>

      {/* Values Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          大切にしていること
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl">🤝</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">互いを尊重する</h3>
              <p className="text-gray-600">
                糖尿病の症状や治療法は人それぞれです。異なる意見も尊重しましょう。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">体験をシェアする</h3>
              <p className="text-gray-600">
                「私の場合は」という形で、個人の体験として共有しましょう。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">医療の専門家を信頼する</h3>
              <p className="text-gray-600">
                最終的な医療判断は、必ず主治医と相談してください。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Posting Rules Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          投稿のルール
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recommended */}
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-emerald-600" />
              <h3 className="font-bold text-emerald-700">推奨される投稿</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>自分の体験談・経験の共有</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>糖尿病に関する質問・相談</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>励まし・応援のメッセージ</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>役立った情報の紹介</span>
              </li>
            </ul>
          </div>

          {/* Prohibited */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={20} className="text-red-600" />
              <h3 className="font-bold text-red-700">禁止される投稿</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-red-500 mt-1">✗</span>
                <span>医療行為（診断、処方、治療指示など）</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-red-500 mt-1">✗</span>
                <span>特定の治療法や薬を強く勧める行為</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-red-500 mt-1">✗</span>
                <span>他のユーザーへの誹謗中傷</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-red-500 mt-1">✗</span>
                <span>個人情報の無断公開</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-red-500 mt-1">✗</span>
                <span>営利目的の宣伝・勧誘</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Flag size={20} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">不適切な投稿を見つけたら</h2>
        </div>
        <p className="text-gray-700 mb-2">
          投稿の「報告」ボタンから通報してください。
        </p>
        <p className="text-gray-600 text-sm">
          運営チームが確認し、必要に応じて対応します。
        </p>
      </div>

      {/* Help Section */}
      <div className="bg-green-50 rounded-xl border border-green-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">困ったときは</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">体調が悪い・緊急の場合</p>
              <p className="text-sm text-gray-600">すぐに医療機関へ</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <HelpCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">サービスの使い方がわからない</p>
              <p className="text-sm text-gray-600">
                <Link to="/faq" className="text-green-600 hover:underline">FAQ</Link>
                または
                <Link to="/contact" className="text-green-600 hover:underline ml-1">お問い合わせ</Link>
                へ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-green-600 hover:underline text-sm">
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
