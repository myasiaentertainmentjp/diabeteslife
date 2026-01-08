import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const sections = [
  { id: 'article1', title: '第1条（適用）' },
  { id: 'article2', title: '第2条（定義）' },
  { id: 'article3', title: '第3条（会員登録）' },
  { id: 'article4', title: '第4条（アカウント管理）' },
  { id: 'article5', title: '第5条（禁止事項）' },
  { id: 'article6', title: '第6条（投稿コンテンツ）' },
  { id: 'article7', title: '第7条（免責事項）' },
  { id: 'article8', title: '第8条（サービスの変更・終了）' },
  { id: 'article9', title: '第9条（規約の変更）' },
  { id: 'article10', title: '第10条（準拠法・管轄）' },
]

export function Terms() {
  useEffect(() => {
    // Handle hash navigation on page load
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dライフ利用規約</h1>
      <p className="text-sm text-gray-500 mb-8">最終更新日：2026年1月8日</p>

      {/* Table of Contents */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">目次</h2>
        <nav>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-green-600 hover:underline text-sm"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-8">
        <section id="article1">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第1条（適用）
          </h2>
          <p className="text-gray-700 leading-relaxed">
            本規約は、MYASIA LLC（以下「当社」）が運営する糖尿病患者向けコミュニティサイト「Dライフ」（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーの皆様には、本規約に同意いただいた上で、本サービスをご利用いただきます。
          </p>
        </section>

        <section id="article2">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第2条（定義）
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>「ユーザー」とは、本サービスを利用するすべての方を指します。</li>
            <li>「会員」とは、本サービスに会員登録を行ったユーザーを指します。</li>
            <li>「投稿コンテンツ」とは、会員が本サービスに投稿した文章、画像、その他の情報を指します。</li>
          </ul>
        </section>

        <section id="article3">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第3条（会員登録）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-3">
            <li>会員登録を希望する方は、当社の定める方法により登録を申請してください。</li>
            <li>
              以下の場合、登録を承認しないことがあります。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>虚偽の情報を申告した場合</li>
                <li>過去に本規約に違反したことがある場合</li>
                <li>その他、当社が不適切と判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section id="article4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第4条（アカウント管理）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>会員は、自己の責任においてアカウント情報を管理してください。</li>
            <li>アカウント情報の管理不十分による損害について、当社は責任を負いません。</li>
            <li>アカウントの第三者への譲渡・貸与は禁止します。</li>
          </ol>
        </section>

        <section id="article5">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第5条（禁止事項）
          </h2>
          <p className="text-gray-700 mb-3">本サービスの利用にあたり、以下の行為を禁止します。</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>医療行為、診断、処方に該当する行為</li>
            <li>特定の医療機関・医薬品の宣伝・勧誘</li>
            <li>虚偽または誤解を招く医療情報の投稿</li>
            <li>他のユーザーへの誹謗中傷、嫌がらせ</li>
            <li>個人情報の無断収集・公開</li>
            <li>営利目的の宣伝・勧誘</li>
            <li>公序良俗に反する行為</li>
            <li>法令に違反する行為</li>
            <li>本サービスの運営を妨害する行為</li>
          </ul>
        </section>

        <section id="article6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第6条（投稿コンテンツ）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>会員は、投稿コンテンツについて、自らが投稿する権利を有していることを保証します。</li>
            <li>投稿コンテンツの著作権は投稿者に帰属しますが、当社は本サービスの運営に必要な範囲で利用できるものとします。</li>
            <li>当社は、投稿コンテンツが本規約に違反すると判断した場合、予告なく削除できるものとします。</li>
          </ol>
        </section>

        <section id="article7">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第7条（免責事項）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>本サービスで提供される情報は、医療アドバイスの代わりではありません。</li>
            <li>健康上の判断は、必ず医師にご相談ください。</li>
            <li>本サービスの利用により生じた損害について、当社は責任を負いません。</li>
            <li>ユーザー間のトラブルについて、当社は責任を負いません。</li>
          </ol>
        </section>

        <section id="article8">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第8条（サービスの変更・終了）
          </h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、ユーザーへの事前通知なく、本サービスの内容を変更または終了できるものとします。
          </p>
        </section>

        <section id="article9">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第9条（規約の変更）
          </h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、必要に応じて本規約を変更できるものとします。変更後の規約は、本サービス上に掲載した時点から効力を生じます。
          </p>
        </section>

        <section id="article10">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            第10条（準拠法・管轄）
          </h2>
          <p className="text-gray-700 leading-relaxed">
            本規約は日本法に準拠し、本サービスに関する紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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
