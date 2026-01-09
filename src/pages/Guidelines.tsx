import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Flag, AlertTriangle, HelpCircle, BookOpen } from 'lucide-react'

export function Guidelines() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
          <BookOpen size={24} className="text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dライフ コミュニティガイドライン</h1>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500">
          大切にしていること
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
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
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
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
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
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
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500">
          投稿のルール
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recommended */}
          <div className="bg-green-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-500" />
              <h3 className="font-bold text-green-700">推奨される投稿</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1">✓</span>
                <span>自分の体験談・経験の共有</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1">✓</span>
                <span>糖尿病に関する質問・相談</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1">✓</span>
                <span>励まし・応援のメッセージ</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1">✓</span>
                <span>役立った情報の紹介</span>
              </li>
            </ul>
          </div>

          {/* Prohibited */}
          <div className="bg-rose-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={20} className="text-rose-500" />
              <h3 className="font-bold text-rose-700">禁止される投稿</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-rose-500 mt-1">✗</span>
                <span>医療行為（診断、処方、治療指示など）</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-rose-500 mt-1">✗</span>
                <span>特定の治療法や薬を強く勧める行為</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-rose-500 mt-1">✗</span>
                <span>他のユーザーへの誹謗中傷</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-rose-500 mt-1">✗</span>
                <span>個人情報の無断公開</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-rose-500 mt-1">✗</span>
                <span>営利目的の宣伝・勧誘</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <Flag size={20} className="text-rose-500" />
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
      <div className="bg-rose-50 rounded-xl border border-rose-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pl-4 border-l-4 border-rose-500">困ったときは</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">体調が悪い・緊急の場合</p>
              <p className="text-sm text-gray-600">すぐに医療機関へ</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
              <HelpCircle size={20} className="text-rose-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">サービスの使い方がわからない</p>
              <p className="text-sm text-gray-600">
                <Link to="/faq" className="text-rose-500 hover:underline">FAQ</Link>
                または
                <Link to="/contact" className="text-rose-500 hover:underline ml-1">お問い合わせ</Link>
                へ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-rose-500 hover:underline text-sm">
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
