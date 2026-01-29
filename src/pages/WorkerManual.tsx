import { useEffect, useState } from 'react'
import {
  FileText,
  UserPlus,
  Camera,
  AlertTriangle,
  Coins,
  HelpCircle,
  Image,
  CheckCircle,
  XCircle,
  ChevronRight,
  LogIn,
  X
} from 'lucide-react'

export function WorkerManual() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // スムーズスクロール
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    // ページタイトル設定
    document.title = '食事記録モニター マニュアル | Dライフ'
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-rose-500 to-rose-400 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Dライフ 食事記録モニター
          </h1>
          <p className="text-rose-100 text-lg">作業マニュアル</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 目次 */}
        <nav className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-rose-500" />
            目次
          </h2>
          <ul className="space-y-2">
            {[
              { id: 'overview', label: 'お仕事の概要' },
              { id: 'registration', label: '会員登録の手順' },
              { id: 'login', label: 'ログイン方法' },
              { id: 'posting', label: '食事記録の投稿方法' },
              { id: 'rules', label: '投稿ルール・注意事項' },
              { id: 'reward', label: '報酬について' },
              { id: 'faq', label: 'よくある質問（FAQ）' },
              { id: 'sample', label: '投稿サンプル' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 w-full text-left px-3 py-2 rounded-lg transition-colors"
                >
                  <ChevronRight size={16} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* 1. お仕事の概要 */}
        <section id="overview" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500 flex items-center gap-2">
            <FileText size={20} className="text-rose-500" />
            お仕事の概要
          </h2>

          <div className="bg-rose-50 rounded-xl p-5 mb-4">
            <p className="text-gray-700 leading-relaxed">
              Dライフに会員登録し、<strong className="text-rose-600">食事の写真を投稿する</strong>モニター業務です。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700 w-1/3">契約期間</td>
                  <td className="py-3 px-4 text-gray-900">1ヶ月ごとの更新</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">投稿頻度</td>
                  <td className="py-3 px-4 text-gray-900">最低3日に1回以上（毎日投稿も歓迎）</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">投稿回数</td>
                  <td className="py-3 px-4 text-gray-900">1日最大5回まで</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">投稿タイミング</td>
                  <td className="py-3 px-4 text-gray-900">朝食・昼食・夕食・おやつなど自由</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">報酬</td>
                  <td className="py-3 px-4 text-gray-900">
                    <span className="text-rose-600 font-bold">1投稿あたり3円</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">支払い</td>
                  <td className="py-3 px-4 text-gray-900">月末締め、クラウドワークス経由でお支払い</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 会員登録の手順 */}
        <section id="registration" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500 flex items-center gap-2">
            <UserPlus size={20} className="text-rose-500" />
            会員登録の手順
          </h2>

          <div className="space-y-4">
            {[
              { step: 1, title: '登録ページにアクセス', content: '下記URLから会員登録ページを開きます。' },
              { step: 2, title: '登録方法を選択', content: 'メールアドレスまたはGoogleアカウントで登録できます。' },
              { step: 3, title: '確認メールをチェック', content: 'メール登録の場合、届いたメールのリンクをクリックして登録を完了します。' },
              { step: 4, title: 'プロフィールを設定', content: 'ニックネームを設定します。実名は不要です。' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-rose-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">登録URL</p>
            <a
              href="https://diabeteslife.jp/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 font-medium hover:underline break-all"
            >
              https://diabeteslife.jp/register
            </a>
            <p className="text-xs text-gray-500 mt-2">※Googleアカウントでも簡単に登録できます</p>
          </div>
        </section>

        {/* 3. ログイン方法 */}
        <section id="login" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500 flex items-center gap-2">
            <LogIn size={20} className="text-rose-500" />
            ログイン方法
          </h2>

          <p className="text-gray-600 mb-4">
            登録完了後は、下記URLからログインしてください。
          </p>

          <div className="p-4 bg-rose-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">ログインURL</p>
            <a
              href="https://diabeteslife.jp/login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 font-medium hover:underline break-all"
            >
              https://diabeteslife.jp/login
            </a>
          </div>
        </section>

        {/* 4. 食事記録の投稿方法 */}
        <section id="posting" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500 flex items-center gap-2">
            <Camera size={20} className="text-rose-500" />
            食事記録の投稿方法
          </h2>

          <div className="space-y-4">
            {[
              { step: 1, title: 'ログイン', content: 'Dライフにログインします。' },
              { step: 2, title: '食事記録ページを開く', content: '下記URLから食事記録ページにアクセスします。' },
              { step: 3, title: '新規投稿', content: '「新規投稿」ボタンをタップします。' },
              { step: 4, title: '写真を選択', content: '撮影した食事の写真を選択します。' },
              { step: 5, title: 'コメント入力（任意）', content: '必要に応じてコメントを入力します。' },
              { step: 6, title: '投稿', content: '「投稿する」ボタンを押して完了です。' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-rose-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">食事記録ページURL</p>
            <a
              href="https://diabeteslife.jp/threads?category=todays_meal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 font-medium hover:underline break-all"
            >
              https://diabeteslife.jp/threads?category=todays_meal
            </a>
          </div>
        </section>

        {/* 5. 投稿ルール・注意事項 */}
        <section id="rules" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500 flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-500" />
            投稿ルール・注意事項
          </h2>

          {/* 投稿頻度・回数 */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">投稿頻度・回数</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                <span>最低3日に1回は投稿してください</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                <span>毎日の投稿を歓迎します</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                <span>1日最大5回まで投稿可能</span>
              </li>
            </ul>
          </div>

          {/* 食事写真について */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">食事写真について</h3>
            <div className="bg-green-50 rounded-xl p-5">
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                  <span>実際に食べた食事の写真を撮影してください</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                  <span>食事内容は自由です（特別な糖尿病食でなくても、普段の食事でOKです）</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                  <span>本人でなくても家族（親・パートナー等）の食事でもOK</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                  <span>写真は鮮明で料理がはっきり見えるもの</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 禁止事項 */}
          <div className="mb-6">
            <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
              <XCircle size={18} />
              禁止事項
            </h3>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shrink-0">NG</span>
                  <span className="text-gray-900 font-medium">他サイトからの画像転載</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shrink-0">NG</span>
                  <span className="text-gray-900 font-medium">フリー素材の使用</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shrink-0">NG</span>
                  <span className="text-gray-900 font-medium">過去に撮影した古い写真の使い回し</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium">注意事項：</span>
              こちらが不適切と判断した写真（フリー素材、他サイトからの転載、使い回し等）については、削除依頼を行い、報酬には反映されません。
            </p>
          </div>
        </section>

        {/* 6. 報酬について */}
        <section id="reward" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500 flex items-center gap-2">
            <Coins size={20} className="text-rose-500" />
            報酬について
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700 w-1/3">報酬単価</td>
                  <td className="py-3 px-4 text-gray-900">
                    <span className="text-rose-600 font-bold text-lg">1投稿あたり3円</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">計算方法</td>
                  <td className="py-3 px-4 text-gray-900">月間投稿数 × 単価 = 報酬額</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">支払い</td>
                  <td className="py-3 px-4 text-gray-900">月末締め、クラウドワークス経由でお支払い</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. よくある質問（FAQ） */}
        <section id="faq" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500 flex items-center gap-2">
            <HelpCircle size={20} className="text-rose-500" />
            よくある質問（FAQ）
          </h2>

          <div className="space-y-4">
            {[
              {
                q: '自分は糖尿病ではないのですが、参加できますか？',
                a: 'はい、参加可能です。ご家族の食事を撮影いただいても構いません。'
              },
              {
                q: '糖尿病向けの食事じゃないとダメですか？',
                a: 'いいえ、食事内容は自由です。普段の食事をそのまま撮影してください。'
              },
              {
                q: 'コメントは必ず書かないといけませんか？',
                a: 'いいえ、コメントは任意です。写真のみの投稿でもOKです。'
              },
              {
                q: '1日に何回まで投稿できますか？',
                a: '1日最大5回までです。'
              },
              {
                q: '質問や困ったことがあった場合は？',
                a: 'クラウドワークスのメッセージ機能でご連絡ください。'
              },
            ].map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex gap-2 mb-2">
                  <span className="bg-rose-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">Q</span>
                  <p className="font-medium text-gray-900">{item.q}</p>
                </div>
                <div className="flex gap-2 ml-8">
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">A</span>
                  <p className="text-gray-600">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. 投稿サンプル */}
        <section id="sample" className="bg-white rounded-xl shadow-sm p-6 mb-6 scroll-mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pl-4 border-l-4 border-rose-500 flex items-center gap-2">
            <Image size={20} className="text-rose-500" />
            投稿サンプル
          </h2>

          <p className="text-gray-600 mb-4">このような形で投稿してください。</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { src: '/images/sample-meal-1.jpg', alt: 'サンプル：和食の朝食' },
              { src: '/images/sample-meal-2.jpg', alt: 'サンプル：クロワッサンと野菜' },
              { src: '/images/sample-meal-3.jpg', alt: 'サンプル：野菜中心の食事' },
              { src: '/images/sample-meal-4.jpg', alt: 'サンプル：焼き魚定食' },
            ].map((img) => (
              <button
                key={img.src}
                onClick={() => setSelectedImage(img.src)}
                className="w-full h-44 bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">※画像をタップで拡大表示</p>

          <div className="mt-4 bg-rose-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">ポイント：</span>
              料理全体が見えるように撮影し、明るい場所で撮ると綺麗に写ります。
            </p>
          </div>
        </section>

        {/* フッター注意書き */}
        <div className="text-center py-6 border-t border-gray-200 mt-8">
          <p className="text-xs text-gray-400">
            本資料は業務委託者様専用です。無断転載・共有はご遠慮ください。
          </p>
        </div>
      </div>

      {/* 画像ポップアップ */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="拡大画像"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
