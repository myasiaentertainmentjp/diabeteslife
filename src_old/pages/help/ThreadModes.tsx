import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, BookOpen, ArrowLeft } from 'lucide-react'

export function ThreadModes() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6"
      >
        <ArrowLeft size={20} />
        <span>前のページに戻る</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">トピックタイプについて</h1>
      <p className="text-gray-600 text-sm mb-6">通常モードと日記モードの違い</p>

      {/* Normal Mode */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageSquare size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">通常モード</h2>
            <p className="text-sm text-blue-600">みんなで話し合うトピック</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">特徴</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span><strong>誰でも投稿・コメントできる</strong>オープンなトピックです</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span>質問や相談、情報共有など<strong>議論向け</strong>のトピックタイプ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span>参加者全員が対等に意見を交換できます</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">こんな時におすすめ</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span>食事療法や運動について質問したい</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span>おすすめのレシピや商品を共有したい</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span>治療や薬について相談したい</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span>同じ悩みを持つ仲間と話したい</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Diary Mode */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <BookOpen size={24} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">日記モード</h2>
            <p className="text-sm text-purple-600">自分だけの記録トピック</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">特徴</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span><strong>トピック作成者だけ</strong>が投稿できる専用モードです</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span>他のユーザーは<strong>コメント不可</strong>、リアクション（ハートなど）で応援のみ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span>自分のペースで継続的に記録を残せます</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">こんな時におすすめ</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span>毎日の食事や血糖値を記録したい</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span>治療や体調の経過を報告したい</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span>ダイエットや運動の記録をつけたい</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span>闘病日記として活用したい</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              <strong>注意：</strong>日記モードは作成後に通常モードに変更できません。慎重にお選びください。
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pl-4 border-l-4 border-rose-500">
          比較表
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
                <th className="px-4 py-3 text-center font-medium text-blue-600 whitespace-nowrap">
                  通常モード
                </th>
                <th className="px-4 py-3 text-center font-medium text-purple-600 whitespace-nowrap">
                  日記モード
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-gray-700">投稿できる人</td>
                <td className="px-4 py-3 text-center">誰でも</td>
                <td className="px-4 py-3 text-center">作成者のみ</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700">コメント</td>
                <td className="px-4 py-3 text-center">誰でも可能</td>
                <td className="px-4 py-3 text-center text-red-500">不可</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700">リアクション</td>
                <td className="px-4 py-3 text-center">-</td>
                <td className="px-4 py-3 text-center">誰でも可能</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700">主な用途</td>
                <td className="px-4 py-3 text-center">質問・議論</td>
                <td className="px-4 py-3 text-center">記録・日記</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700">モード変更</td>
                <td className="px-4 py-3 text-center">-</td>
                <td className="px-4 py-3 text-center text-red-500">不可</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/threads/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
        >
          トピックを作成する
        </Link>
      </div>
    </div>
  )
}
