'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const slides = [
  {
    id: 1,
    eyebrow: 'D-LIFEとは',
    title: '糖尿病と向き合う\nすべての人へ',
    body: '患者さん・ご家族・支える人たちが\n安心して話せる場所がここにあります。',
    cta: { label: 'Dライフとは', href: '/about' },
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80&fit=crop',
  },
  {
    id: 2,
    eyebrow: 'コミュニティ',
    title: 'ひとりじゃないと\n気づける場所',
    body: '食事・薬・日常の悩みを\n同じ経験を持つ仲間と共有できます。',
    cta: { label: 'トピックを見る', href: '/threads' },
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80&fit=crop',
  },
  {
    id: 3,
    eyebrow: '健康記録',
    title: '毎月の記録が\n未来の自分を守る',
    body: 'HbA1cや体重を継続して記録するだけ。\nデータの積み重ねが改善への近道です。',
    cta: { label: '記録してみる', href: '/mypage' },
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80&fit=crop',
  },
  {
    id: 4,
    eyebrow: 'まずは登録',
    title: 'あなたの経験が\n誰かの力になる',
    body: '登録無料・匿名OK。\nあなたの一言が同じ悩みを持つ誰かを救います。',
    cta: { label: '無料で始める', href: '/register' },
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&q=80&fit=crop',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goTo = useCallback((idx: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent(idx)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
  }, [])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resetTimer])

  const handleDotClick = (idx: number) => {
    goTo(idx)
    resetTimer()
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600">
      {/* メインスライダー */}
      <div
        className="relative w-full"
        style={{
          height: 'clamp(420px, 55vh, 650px)',
        }}
      >
        {/* 背景画像群 */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: idx === current ? 1 : 0,
              zIndex: idx === current ? 1 : 0,
            }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/* グラデーションオーバーレイ */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(190,24,93,0.85) 0%, rgba(190,24,93,0.6) 50%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          </div>
        ))}

        {/* デコレーション要素 */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 rounded-full bg-white/5 blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 rounded-full bg-white/5 blur-3xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none z-10" />

        {/* コンテンツ */}
        <div className="relative z-20 h-full flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl md:max-w-2xl">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="transition-all duration-700 ease-out"
                  style={{
                    opacity: idx === current ? 1 : 0,
                    transform: idx === current ? 'translateY(0)' : 'translateY(24px)',
                    position: idx === current ? 'relative' : 'absolute',
                    visibility: idx === current ? 'visible' : 'hidden',
                  }}
                >
                  {/* アイブロウ */}
                  <p className="inline-block px-3 py-1 mb-4 text-xs md:text-sm font-semibold tracking-wider uppercase bg-white/15 backdrop-blur-sm rounded-full text-white/90">
                    {slide.eyebrow}
                  </p>

                  {/* タイトル */}
                  <h1
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 md:mb-6"
                    style={{
                      whiteSpace: 'pre-line',
                      textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    {slide.title}
                  </h1>

                  {/* 説明文 */}
                  <p
                    className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed mb-6 md:mb-8"
                    style={{
                      whiteSpace: 'pre-line',
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    }}
                  >
                    {slide.body}
                  </p>

                  {/* CTAボタン */}
                  <Link
                    href={slide.cta.href}
                    className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white text-rose-600 font-bold text-sm md:text-base rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {slide.cta.label}
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ドットナビゲーション */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2 md:gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              aria-label={`スライド${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-8 md:w-10 h-2 md:h-2.5 bg-white'
                  : 'w-2 md:w-2.5 h-2 md:h-2.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* 矢印ナビゲーション（PC） */}
        <button
          onClick={() => {
            goTo((current - 1 + slides.length) % slides.length)
            resetTimer()
          }}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all duration-300"
          aria-label="前のスライド"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => {
            goTo((current + 1) % slides.length)
            resetTimer()
          }}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all duration-300"
          aria-label="次のスライド"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
