import { Link, useNavigate } from 'react-router-dom'
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
  FileText
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Guide() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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

      {/* Getting Started Steps */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500">
          はじめの3ステップ
        </h2>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">アカウント登録</h3>
              <p className="text-gray-600 text-sm">
                メールアドレスで簡単に登録できます。
              </p>
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 mt-2 text-rose-500 hover:text-rose-600 text-sm font-medium"
                >
                  <UserCircle size={16} />
                  新規登録はこちら
                </Link>
              )}
              {user && (
                <span className="inline-flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <CheckCircle2 size={16} />
                  登録済み
                </span>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">プロフィールを充実させる</h3>
              <p className="text-gray-600 text-sm mb-2">
                プロフィールを設定すると、同じ境遇の仲間と繋がりやすくなります。
              </p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="text-rose-400">●</span>
                  <span><strong>糖尿病タイプ</strong>：1型・2型など</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-rose-400">●</span>
                  <span><strong>発症時期</strong>：いつ頃からか</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-rose-400">●</span>
                  <span><strong>治療法</strong>：インスリン、内服薬など</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-rose-400">●</span>
                  <span><strong>自己紹介</strong>：あなたのことを教えてください</span>
                </p>
              </div>
              {user ? (
                <Link
                  to="/mypage/profile"
                  className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm font-medium transition-colors"
                >
                  <Settings size={16} />
                  プロフィールを設定する
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm font-medium transition-colors"
                >
                  <UserCircle size={16} />
                  新規登録してプロフィールを設定
                </Link>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">コミュニティに参加</h3>
              <p className="text-gray-600 text-sm">
                気になるトピックにコメントしたり、新しいトピックを作成してみましょう。
              </p>
              <Link
                to="/threads"
                className="inline-flex items-center gap-1 mt-2 text-rose-500 hover:text-rose-600 text-sm font-medium"
              >
                <MessageSquare size={16} />
                トピック一覧を見る
              </Link>
            </div>
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

          {/* Food Record */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Camera size={20} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-900">食事を記録する</h3>
            </div>
            <ul className="space-y-2 text-gray-600 ml-13">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">-</span>
                <span>「食事の記録」カテゴリで写真付きの食事記録を投稿</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">-</span>
                <span>みんなの食事を参考にしたり、コメントで交流できる</span>
              </li>
            </ul>
            <Link
              to="/threads?category=todays_meal"
              className="inline-flex items-center gap-1 mt-3 text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              <MessageSquare size={16} />
              食事の記録を見る
            </Link>
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

      {/* Medical Expense Deduction Guide */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Receipt size={20} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">医療費控除の活用方法</h2>
        </div>

        <p className="text-gray-600 mb-4">
          糖尿病の治療にかかる医療費は、確定申告で「医療費控除」の対象になります。
        </p>

        <div className="space-y-4">
          {/* What's covered */}
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Calculator size={16} className="text-emerald-600" />
              控除対象になる主な費用
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>通院費・入院費</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>インスリン・経口薬などの薬代</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>血糖測定器・センサー代</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>注射針・消毒綿などの消耗品</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>通院のための交通費（電車・バス）</span>
              </li>
            </ul>
          </div>

          {/* How to apply */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-gray-600" />
              確定申告の流れ
            </h3>
            <ol className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-500">1.</span>
                <span>1年間（1/1〜12/31）の医療費の領収書を保管</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-500">2.</span>
                <span>医療費が年間10万円を超えるか確認</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-500">3.</span>
                <span>確定申告書と医療費控除の明細書を作成</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-500">4.</span>
                <span>翌年2月16日〜3月15日に税務署へ提出</span>
              </li>
            </ol>
          </div>

          <div className="text-sm text-gray-500 bg-amber-50 p-3 rounded-lg">
            <p className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <span>
                詳細は最寄りの税務署または税理士にご相談ください。
                e-Taxを使えばオンラインでも申告できます。
              </span>
            </p>
          </div>
        </div>
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
        <button
          onClick={() => navigate(-1)}
          className="text-rose-500 hover:underline text-sm"
        >
          前のページに戻る
        </button>
      </div>
    </div>
  )
}
