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
    <footer className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-700 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* 4 Column Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: コンテンツ */}
          <div>
            <h3 className="text-white font-bold mb-4">コンテンツ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/threads" className="hover:text-white transition-colors">
                  スレッド一覧
                </Link>
              </li>
              <li>
                <Link to="/articles" className="hover:text-white transition-colors">
                  記事一覧
                </Link>
              </li>
              <li>
                <Link to="/threads?category=todays_meal" className="hover:text-white transition-colors">
                  食事の記録
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: サポート */}
          <div>
            <h3 className="text-white font-bold mb-4">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">
                  使い方ガイド
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  よくある質問
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="hover:text-white transition-colors">
                  ガイドライン
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 運営情報 */}
          <div>
            <h3 className="text-white font-bold mb-4">運営情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/company" className="hover:text-white transition-colors">
                  会社概要
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors">
                  免責事項
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: 設定 */}
          <div>
            <h3 className="text-white font-bold mb-4">設定</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type size={14} className="text-gray-400" />
                <span className="text-sm text-gray-400">文字サイズ</span>
              </div>
              <div className="flex border border-gray-600 rounded overflow-hidden w-fit">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.key}
                    onClick={() => handleFontSizeChange(size.key)}
                    className={`px-3 py-1.5 text-sm transition-colors ${
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
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6">
          {/* Medical Disclaimer */}
          <p className="text-xs text-gray-500 text-center mb-4">
            ※このサイトの情報は医療アドバイスの代わりにはなりません。治療に関する判断は必ず医師にご相談ください。
          </p>

          {/* Copyright */}
          <p className="text-sm text-gray-400 text-center">
            &copy; 2025 D-LIFE / MYASIA LLC. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
