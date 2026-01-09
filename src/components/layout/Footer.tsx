import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Links - Centered */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link to="/company" className="hover:text-white transition-colors">
            会社概要
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            利用規約
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors">
            プライバシーポリシー
          </Link>
          <Link to="/disclaimer" className="hover:text-white transition-colors">
            免責事項
          </Link>
          <Link to="/guidelines" className="hover:text-white transition-colors">
            ガイドライン
          </Link>
          <Link to="/guide" className="hover:text-white transition-colors">
            使い方
          </Link>
          <Link to="/faq" className="hover:text-white transition-colors">
            よくある質問
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors">
            お問い合わせ
          </Link>
        </nav>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            &copy;2025 MYASIA LLC All Rights Reserved.
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            ※このサイトの情報は医療アドバイスの代わりにはなりません。治療に関する判断は必ず医師にご相談ください。
          </p>
        </div>
      </div>
    </footer>
  )
}
