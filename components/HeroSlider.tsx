'use client'

import { useState, useEffect, useCallback, useRef, TouchEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    title: '糖尿病と向き合うすべての人へ',
    description: '患者さん・ご家族・支える人たちの居場所',
    image: 'https://josanlblwfjdaaezqbnw.supabase.co/storage/v1/object/public/images/hero/hero_slide_1.png',
    link: '/about',
  },
  {
    id: 2,
    title: '糖尿病と診断されたあなたへ',
    description: '同じ経験を持つ仲間と悩みを共有',
    image: 'https://josanlblwfjdaaezqbnw.supabase.co/storage/v1/object/public/images/hero/hero_slide_2.png',
    link: '/threads?category=mental_concerns',
  },
  {
    id: 3,
    title: 'その足跡が未来を守る',
    description: 'HbA1cや体重を継続して記録',
    image: 'https://josanlblwfjdaaezqbnw.supabase.co/storage/v1/object/public/images/hero/hero_slide_3.png',
    link: '/mypage/hba1c',
  },
  {
    id: 4,
    title: 'みんなの食事がここに',
    description: '登録無料・匿名OK',
    image: 'https://josanlblwfjdaaezqbnw.supabase.co/storage/v1/object/public/images/hero/hero_slide_4.png',
    link: '/meals',
  },
]

const SLIDE_COUNT = slides.length
const INFINITE_SLIDES = [slides[SLIDE_COUNT - 1], ...slides, slides[0]]

export function HeroSlider() {
  const [pos, setPos] = useState(1)
  const [animated, setAnimated] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setAnimated(true)
      setPos((p) => p + 1)
    }, 5000)
  }, [])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resetTimer])

  const handleTransitionEnd = useCallback(() => {
    if (pos === 0) {
      setAnimated(false)
      setPos(SLIDE_COUNT)
    } else if (pos === SLIDE_COUNT + 1) {
      setAnimated(false)
      setPos(1)
    }
  }, [pos])

  const goToPos = (nextPos: number) => {
    setAnimated(true)
    setPos(nextPos)
    resetTimer()
  }

  const handlePrev = () => goToPos(pos - 1)
  const handleNext = () => goToPos(pos + 1)
  const handleDotClick = (index: number) => goToPos(index + 1)

  // タッチスワイプ対応
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50 // スワイプと判定する最小距離
    if (diff > threshold) {
      handleNext() // 左スワイプ → 次へ
    } else if (diff < -threshold) {
      handlePrev() // 右スワイプ → 前へ
    }
  }

  const dotIndex = (pos - 1 + SLIDE_COUNT) % SLIDE_COUNT

  // PC: 3カード表示、SP: 1カード表示
  const pcTranslate = `translateX(calc(${(1 - pos) * 100 / 3}%))`
  const spTranslate = `translateX(calc(8vw - ${pos} * (84vw + 12px)))`

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-rose-50 to-white">
      {/* SP版 (モバイル) */}
      <div
        className="md:hidden py-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex"
          style={{
            transition: animated ? 'transform 0.5s ease' : 'none',
            transform: spTranslate,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {INFINITE_SLIDES.map((slide, i) => {
            const isActive = i === pos
            return (
              <div
                key={`sp-${i}`}
                className="flex-shrink-0"
                style={{ width: '84vw', marginRight: '12px' }}
              >
                <Link href={slide.link}>
                  <div
                    className="relative overflow-hidden cursor-pointer select-none transition-all duration-500"
                    style={{
                      height: '52vw',
                      borderRadius: '16px',
                      transform: isActive ? 'scale(1)' : 'scale(0.95)',
                      opacity: isActive ? 1 : 0.5,
                      boxShadow: isActive
                        ? '0 16px 40px rgba(0,0,0,0.25)'
                        : '0 4px 16px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={i <= 2}
                      className="object-cover"
                      sizes="84vw"
                    />
                    {/* グラデーションオーバーレイ（下部を濃く） */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%)',
                      }}
                    />
                    {/* テキスト */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h2
                        className="text-white font-bold leading-tight mb-1"
                        style={{
                          fontSize: 'clamp(0.95rem, 3.5vw, 1.4rem)',
                          whiteSpace: 'pre-line',
                          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                        }}
                      >
                        {slide.title}
                      </h2>
                      <p
                        className="text-white/90 text-sm leading-snug"
                        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
                      >
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* PC版 */}
      <div className="hidden md:block py-8 overflow-hidden">
        <div
          className="flex"
          style={{
            transition: animated ? 'transform 0.5s cubic-bezier(0.25,0.1,0.25,1)' : 'none',
            transform: pcTranslate,
            willChange: 'transform',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {INFINITE_SLIDES.map((slide, i) => {
            const isCenter = i === pos
            return (
              <div
                key={`pc-${i}`}
                className="flex-shrink-0 px-3"
                style={{ width: 'calc(100% / 3)' }}
              >
                <Link href={slide.link}>
                  <div
                    className="relative overflow-hidden cursor-pointer select-none transition-all duration-500"
                    style={{
                      height: 320,
                      borderRadius: '20px',
                      transform: isCenter ? 'scale(1)' : 'scale(0.92)',
                      opacity: isCenter ? 1 : 0.5,
                      boxShadow: isCenter
                        ? '0 24px 60px rgba(0,0,0,0.25)'
                        : '0 8px 24px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={i <= 2}
                      className="object-cover"
                      sizes="33vw"
                    />
                    {/* グラデーションオーバーレイ（下部を濃く） */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%)',
                      }}
                    />
                    {/* テキスト */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
                      <h2
                        className="text-white font-bold leading-tight mb-1"
                        style={{
                          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
                          whiteSpace: 'pre-line',
                          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                        }}
                      >
                        {slide.title}
                      </h2>
                      <p
                        className="text-white/90 text-sm md:text-base leading-snug"
                        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
                      >
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* 左矢印（PC） */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-300"
        aria-label="前のスライド"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* 右矢印（PC） */}
      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-300"
        aria-label="次のスライド"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* ドットナビゲーション */}
      <div className="flex justify-center gap-2 pb-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`rounded-full transition-all duration-300 ${
              i === dotIndex
                ? 'w-6 h-2 bg-rose-500'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`スライド ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
