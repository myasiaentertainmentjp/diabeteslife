import { Link } from 'react-router-dom'
import {
  BookOpen,
  MessageSquare,
  PenSquare,
  BookHeart,
  LineChart,
  AlertTriangle,
  HelpCircle,
  Mail,
  Users,
  Heart
} from 'lucide-react'

export function Guide() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
          <BookOpen size={24} className="text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">使い方</h1>
          <p className="text-gray-600 text-sm">はじめての方へ</p>
        </div>
      </div>

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
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
              <Heart size={24} className="text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">同じ悩みを持つ仲間と繋がる</h3>
              <p className="text-gray-600">
                日々の悩みや体験を共有し、お互いに支え合える場所です。
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              Dライフは医療機関ではありません。ユーザー同士の体験共有の場としてご利用ください。
            </p>
          </div>
        </div>
      </div>

      {/* What You Can Do */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500">
          できること
        </h2>

        <div className="space-y-6">
          {/* Join Topics */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-900">トピックに参加する</h3>
            </div>
            <ul className="space-y-2 text-gray-600 ml-13">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span>気になるトピックを見つけてコメントしよう</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">-</span>
                <span>質問したり、自分の体験を共有したり</span>
              </li>
            </ul>
          </div>

          {/* Create Topics */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <PenSquare size={20} className="text-green-500" />
              </div>
              <h3 className="font-bold text-gray-900">トピックを作成する</h3>
            </div>
            <ul className="space-y-2 text-gray-600 ml-13">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">-</span>
                <span>聞きたいこと、相談したいことを投稿</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">-</span>
                <span>カテゴリを選んで投稿</span>
              </li>
            </ul>
          </div>

          {/* Diary */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookHeart size={20} className="text-purple-500" />
              </div>
              <h3 className="font-bold text-gray-900">日記をつける</h3>
            </div>
            <ul className="space-y-2 text-gray-600 ml-13">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span>「日記スレッド」で毎日の食事や体調を記録</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">-</span>
                <span>他のユーザーから応援コメントをもらえる</span>
              </li>
            </ul>
          </div>

          {/* HbA1c Records */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <LineChart size={20} className="text-rose-500" />
              </div>
              <h3 className="font-bold text-gray-900">HbA1cを記録する</h3>
            </div>
            <ul className="space-y-2 text-gray-600 ml-13">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-1">-</span>
                <span>マイページでHbA1cの推移をグラフで管理</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-1">-</span>
                <span>公開設定にすると他のユーザーにも見せられる</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Precautions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">利用上の注意</h2>
        </div>

        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">-</span>
            <span>医療上の判断は必ず主治医に相談してください</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">-</span>
            <span>投稿内容は個人の体験であり、医学的正確性は保証されません</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">-</span>
            <span>
              詳しくは
              <Link to="/disclaimer" className="text-rose-500 hover:underline mx-1">免責事項</Link>
              をご確認ください
            </span>
          </li>
        </ul>
      </div>

      {/* Help Section */}
      <div className="bg-rose-50 rounded-xl border border-rose-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pl-4 border-l-4 border-rose-500">困ったときは</h2>
        <div className="space-y-3">
          <Link
            to="/faq"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
              <HelpCircle size={20} className="text-rose-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">よくある質問</p>
              <p className="text-sm text-gray-600">使い方やよくある疑問をまとめています</p>
            </div>
          </Link>
          <Link
            to="/contact"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Mail size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">お問い合わせ</p>
              <p className="text-sm text-gray-600">解決しない場合はこちらから</p>
            </div>
          </Link>
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
