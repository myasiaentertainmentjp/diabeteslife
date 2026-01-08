export function Company() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">会社概要</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8">
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">運営会社</h2>
          <p className="text-gray-600">合同会社マイアジアエンターテインメント</p>
          <p className="text-gray-600">(MYASIA Entertainment LLC.)</p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">代表</h2>
          <p className="text-gray-600">三木 慎太朗</p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">住所</h2>
          <p className="text-gray-600">〒184-0011</p>
          <p className="text-gray-600">東京都小金井市本町6-9-39</p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">設立</h2>
          <p className="text-gray-600">2021年11月</p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">メール</h2>
          <a
            href="mailto:diabetes@myasia.jp"
            className="text-green-600 hover:underline"
          >
            diabetes@myasia.jp
          </a>
        </div>
      </div>
    </div>
  )
}
