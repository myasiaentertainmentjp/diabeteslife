import { useNavigate } from 'react-router-dom'

export function ContactComplete() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">お問い合わせを受け付けました</h1>
        <p className="text-gray-600 mb-2">
          お問い合わせいただきありがとうございます。
        </p>
        <p className="text-gray-600 mb-6">
          内容を確認の上、3営業日以内にご返信いたします。
        </p>
        <p className="text-sm text-gray-500 mb-8">
          ※返信は入力いただいたメールアドレス宛にお送りします。
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors"
        >
          トップページへ戻る
        </button>
      </div>
    </div>
  )
}
