'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const slides = [
  {
    id: 1,
    eyebrow: 'D-LIFEとは',
    title: '糖尿病と向き合う
すべての人へ',
    body: '患者さん・ご家族・支える人たちが
安心して話せる場所がここにあります。',
    cta: { label: 'D-LIFEについて', href: '/about' },
    bg: 'bg1',
  },
  {
    id: 2,
    eyebrow: 'コミュニティ',
    title: 'ひとりじゃない
と気づける場所',
    body: '食事・薬・日常の悩みを
同じ経験を持つ仲間と共有できます。',
    cta: { label: 'トピックを見る', href: '/threads' },
    bg: 'bg2',
  },
  {
    id: 3,
    eyebrow: '健康記録',
    title: '毎月の記録が
未来の自分を守る',
    body: 'HbA1cや体重を記録するだけ。
データの積み重ねが改善への近道です。',
    cta: { label: 'マイページで記録する', href: '/mypage' },
    bg: 'bg3',
  },
  {
    id: 4,
    eyebrow: 'まずは登録',
    title: 'あなたの経験が
誰かの力になる',
    body: '登録無料・匿名OK。
あなたの一言が、同じ悩みを持つ誰かを救います。',
    cta: { label: '無料で始める', href: '/register' },
    bg: 'bg4',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 300)
  }, [animating])

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [current, goTo])

  const slide = slides[current]

  return (
    <>
      <style>{`
        .hero-bg1 {
          background-color: #be185d;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(251,113,133,0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(159,18,57,0.5) 0%, transparent 40%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-bg2 {
          background-color: #c2410c;
          background-image:
            radial-gradient(ellipse at 70% 80%, rgba(251,146,60,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 20%, rgba(154,52,18,0.6) 0%, transparent 40%),
            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M0 0h40v1H0zM0 20h40v1H0zM0 39h40v1H0zM0 0v40h1V0zM20 0v40h1V0zM39 0v40h1V0z'/%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-bg3 {
          background-color: #0f4c81;
          background-image:
            radial-gradient(circle at 50% 0%, rgba(56,189,248,0.3) 0%, transparent 60%),
            radial-gradient(circle at 90% 90%, rgba(14,165,233,0.2) 0%, transparent 40%),
            url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='40' cy='40' r='38' stroke='%23ffffff' stroke-opacity='0.04' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='20' stroke='%23ffffff' stroke-opacity='0.04' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-bg4 {
          background-color: #4c1d95;
          background-image:
            linear-gradient(135deg, rgba(124,58,237,0.8) 0%, rgba(76,29,149,1) 50%, rgba(139,92,246,0.4) 100%),
            url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-slide-enter { opacity: 0; transform: translateY(12px); }
        .hero-slide-active { opacity: 1; transform: translateY(0); transition: opacity 0.4s ease, transform 0.4s ease; }
        .hero-slide-exit { opacity: 0; transform: translateY(-8px); }
      `}</style>

      <div className={`relative w-full overflow-hidden hero-bg${slide.id}`} style={{ minHeight: 280 }}>
        {/* デコレーション要素 */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-2xl"
          style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

        {/* コンテンツ */}
        <div className={`relative z-10 px-6 pt-8 pb-6 max-w-lg mx-auto ${animating ? 'hero-slide-exit' : 'hero-slide-active'}`}
          style={{ minHeight: 280 }}>

          {/* eyebrow */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-5 h-0.5 bg-white opacity-60 rounded" />
            <span className="text-white text-xs font-medium tracking-widest uppercase opacity-80">
              {slide.eyebrow}
            </span>
          </div>

          {/* タイトル */}
          <h2 className="text-white font-bold leading-tight mb-3"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', whiteSpace: 'pre-line' }}>
            {slide.title}
          </h2>

          {/* 本文 */}
          <p className="text-white opacity-80 text-sm leading-relaxed mb-6"
            style={{ whiteSpace: 'pre-line' }}>
            {slide.body}
          </p>

          {/* CTA */}
          <Link href={slide.cta.href}
            className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm font-bold transition hover:bg-opacity-90 active:scale-95"
            style={{ color: slide.bg === 'bg1' ? '#be185d' : slide.bg === 'bg2' ? '#c2410c' : slide.bg === 'bg3' ? '#0f4c81' : '#4c1d95' }}>
            {slide.cta.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* インジケーター */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6 h-2' : 'bg-white opacity-40 w-2 h-2'}`}
              aria-label={`スライド${i + 1}`}
            />
          ))}
        </div>

        {/* スライド番号 */}
        <div className="absolute top-4 right-4 z-20">
          <span className="text-white opacity-50 text-xs font-mono">
            {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </>
  )
}
