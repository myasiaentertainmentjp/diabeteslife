import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Type } from 'lucide-react'

type FontSize = 'small' | 'medium' | 'large'

const FONT_SIZES: { key: FontSize; label: string; desktop: string; mobile: string }[] = [
  { key: 'small', label: '小', desktop: '15px', mobile: '14px' },
  { key: 'medium', label: '中', desktop: '17px', mobile: '16px' },
  { key: 'large', label: '大', desktop: '19px', mobile: '18px' },
]

function applyFontSize(size: FontSize) {
  const config = FONT_SIZES.find(f => f.key === size) || FONT_SIZES[1]
  const isMobile = window.innerWidth < 640
  document.documentElement.style.fontSize = isMobile ? config.mobile : config.desktop
}

// Initialize font size on page load
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('fontSize') as FontSize | null
  if (saved && FONT_SIZES.some(f => f.key === saved)) {
    applyFontSize(saved)
  }
}

export function Footer() {
  const [fontSize, setFontSize] = useState<FontSize>('medium')

  useEffect(() => {
    const saved = localStorage.getItem('fontSize') as FontSize | null
    if (saved && FONT_SIZES.some(f => f.key === saved)) {
      setFontSize(saved)
    }

    // Re-apply on resize
    function handleResize() {
      applyFontSize(fontSize)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [fontSize])

  function handleFontSizeChange(size: FontSize) {
    setFontSize(size)
    localStorage.setItem('fontSize', size)
    applyFontSize(size)
  }

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
          <Link to="/help/thread-modes" className="hover:text-white transition-colors">
            スレッドタイプ
          </Link>
          <Link to="/faq" className="hover:text-white transition-colors">
            よくある質問
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors">
            お問い合わせ
          </Link>
        </nav>

        {/* Font Size Toggle */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Type size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500">文字サイズ</span>
          <div className="flex border border-gray-600 rounded overflow-hidden">
            {FONT_SIZES.map((size) => (
              <button
                key={size.key}
                onClick={() => handleFontSizeChange(size.key)}
                className={`px-3 py-1 text-xs transition-colors ${
                  fontSize === size.key
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

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
