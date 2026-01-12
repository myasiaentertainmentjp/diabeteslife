import { Link } from 'react-router-dom'

export function RegisterComplete() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-6">✉️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">確認メールを送信しました</h1>
        <p className="text-gray-600 mb-2">
          ご登録いただいたメールアドレスに確認メールを送信しました。
        </p>
        <p className="text-gray-600 mb-6">
          メール内のリンクをクリックして、登録を完了してください。
        </p>
        <p className="text-sm text-red-500 mb-8">
          ※メールが届かない場合は、迷惑メールフォルダをご確認ください。
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors"
        >
          ログインページへ
        </Link>
      </div>
    </div>
  )
}
