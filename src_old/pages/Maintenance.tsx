import { Helmet } from 'react-helmet-async'
import { Wrench } from 'lucide-react'

export function Maintenance() {
  return (
    <>
      <Helmet>
        <title>メンテナンス中 | Dライフ</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-10 h-10 text-rose-500" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              メンテナンス中
            </h1>

            <p className="text-gray-600 mb-6 leading-relaxed">
              現在、サイトのメンテナンスを行っております。<br />
              ご不便をおかけして申し訳ございません。
            </p>

            <div className="bg-rose-50 rounded-lg p-4 text-sm text-rose-700">
              <p>メンテナンス終了後、</p>
              <p>自動的にサイトが復旧いたします。</p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Dライフ - 糖尿病コミュニティ
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
