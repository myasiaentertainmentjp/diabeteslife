import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  id: number
  title: string
  subtitle: string
  buttonText?: string
  buttonLink?: string
  bgGradient: string
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: '相談できる安心が、ここにある。',
    subtitle: '糖尿病患者とその家族のためのコミュニティ',
    buttonText: 'コミュニティに参加する',
    buttonLink: '/register',
    bgGradient: 'bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300',
  },
  {
    id: 2,
    title: '毎日の記録が、明日の自信に。',
    subtitle: '食事や血糖値を記録して、仲間と共有しよう',
    buttonText: '日記をはじめる',
    buttonLink: '/threads/new',
    bgGradient: 'bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300',
  },
  {
    id: 3,
    title: '専門家監修の記事で学ぶ',
    subtitle: '糖尿病管理の実践的なヒントをお届けします',
    buttonText: '記事を読む',
    buttonLink: '/articles',
    bgGradient: 'bg-gradient-to-r from-pink-400 via-rose-300 to-red-300',
  },
]

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className="relative overflow-hidden">
      {/* Carousel Container */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0"
            >
              <div
                className={`${slide.bgGradient} py-16 md:py-24 px-4`}
              >
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-8">
                    {slide.subtitle}
                  </p>
                  {slide.buttonText && slide.buttonLink && (
                    <Link
                      to={slide.buttonLink}
                      className="inline-block px-8 py-3 bg-white text-rose-500 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                    >
                      {slide.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/50 rounded-full backdrop-blur-sm transition-colors hidden md:block"
        aria-label="前のスライド"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/50 rounded-full backdrop-blur-sm transition-colors hidden md:block"
        aria-label="次のスライド"
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      {/* Dot Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === selectedIndex
                ? 'bg-white'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`スライド ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
