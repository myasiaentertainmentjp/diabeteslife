import { Link } from 'react-router-dom'

export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-gray-500 mb-8">最終更新日：2026年1月8日</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-8">
        <p className="text-gray-700 leading-relaxed">
          MYASIA LLC（以下「当社」）は、糖尿病患者向けコミュニティサイト「Dライフ」（以下「本サービス」）における個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
        </p>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            収集する情報
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">（1）会員登録時に提供いただく情報</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>メールアドレス</li>
                <li>パスワード（暗号化して保存）</li>
                <li>表示名（ニックネーム）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">（2）プロフィールとして任意で提供いただく情報</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>糖尿病のタイプ（1型、2型など）</li>
                <li>診断年</li>
                <li>治療方法</li>
                <li>自己紹介文</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">（3）サービス利用時に自動的に収集される情報</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>アクセスログ（IPアドレス、ブラウザ情報など）</li>
                <li>Cookie情報</li>
                <li>利用履歴</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            情報の利用目的
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>本サービスの提供・運営</li>
            <li>ユーザーサポート</li>
            <li>サービスの改善・新機能開発</li>
            <li>利用規約違反への対応</li>
            <li>統計データの作成（個人を特定できない形式）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            情報の第三者提供
          </h2>
          <p className="text-gray-700 mb-3">当社は、以下の場合を除き、個人情報を第三者に提供しません。</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護に必要な場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            情報の管理
          </h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、個人情報の漏洩・紛失・改ざんを防止するため、適切なセキュリティ対策を講じます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Cookieの使用
          </h2>
          <p className="text-gray-700 leading-relaxed">
            本サービスでは、ユーザー体験向上のためCookieを使用しています。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            個人情報の開示・訂正・削除
          </h2>
          <p className="text-gray-700 leading-relaxed">
            ユーザーは、当社が保有する自己の個人情報について、開示・訂正・削除を請求できます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            お問い合わせ
          </h2>
          <p className="text-gray-700">
            本ポリシーに関するお問い合わせは、
            <Link to="/contact" className="text-green-600 hover:underline">
              お問い合わせフォーム
            </Link>
            よりお願いします。
          </p>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-green-600 hover:underline text-sm">
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
