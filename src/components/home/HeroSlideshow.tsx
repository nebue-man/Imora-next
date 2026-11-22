'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const slides = [
  { src: '/images/hero/studio-cyclorama.jpg',  alt: 'Photography studio — white cyclorama and professional lighting rigs' },
  { src: '/images/hero/studio-desk.jpg',        alt: 'Post-production editing suite with triple monitors' },
  { src: '/images/hero/studio-backdrops.jpg',   alt: 'Coloured backdrop wall — gold, cyan, orange, red and black' },
  { src: '/images/hero/studio-podcast.jpg',     alt: 'Podcast and interview studio with RODE microphone' },
]

const DURATION = 6000

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = (i: number) => {
    if (i === current) return
    setPrev(current)
    setCurrent(i)
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(advance, DURATION)
  }

  const advance = () => {
    setCurrent(c => {
      const next = (c + 1) % slides.length
      setPrev(c)
      return next
    })
  }

  useEffect(() => {
    timer.current = setInterval(advance, DURATION)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  return (
    <section className="hs" aria-label="Studio showcase">

      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`hs-slide${i === current ? ' hs-slide--active' : ''}`}
          style={{
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1.4s ease',
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            priority={i === 0}
            loading="eager"
          />
        </div>
      ))}

      {/* gradient scrim — legibility over light and dark images */}
      <div className="hs-scrim" aria-hidden="true" />

      <div className="hs-text">
        <p className="hs-label">Photography · Videography · Studio</p>
        <h1 className="hs-brand">Imora</h1>
      </div>

      <div className="hs-dots" role="tablist" aria-label="Slide navigation">
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Show slide ${i + 1}`}
            className={`hs-dot${i === current ? ' hs-dot--active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

    </section>
  )
}
