'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

interface HeroSectionProps {
  preloaderDone: boolean
}

export default function HeroSection({ preloaderDone }: HeroSectionProps) {
  useEffect(() => {
    if (!preloaderDone) return

    const titleEl = document.querySelector<HTMLElement>('.hero-title')
    if (!titleEl) return

    // Split title into blur-word > blur-char spans
    titleEl.innerHTML = (titleEl.textContent ?? '').split(' ').map((word) =>
      `<span class="blur-word">${word.split('').map((ch) =>
        `<span class="blur-char">${ch}</span>`
      ).join('')}</span>`
    ).join(' ')

    const chars = titleEl.querySelectorAll<HTMLElement>('.blur-char')
    gsap.set(chars, { filter: 'blur(14px)', opacity: 0, y: 12 })

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to(gsap.utils.shuffle(Array.from(chars)), {
      filter: 'blur(0px)', opacity: 1, y: 0, duration: 1.1, stagger: 0.018,
    })
    tl.to('.hero-cta',    { opacity: 1, duration: 0.8 }, '-=0.7')
    tl.to('.hero-meta',   { opacity: 1, duration: 0.8 }, '-=0.6')
    tl.to('.hero-hint',   { opacity: 1, duration: 0.8 }, '-=0.5')
    tl.to('.hero-scroll', { opacity: 1, duration: 0.8 }, '-=0.5')
  }, [preloaderDone])

  return (
    <section className="hero">
      <div className="hero-inner">
        <div>
          <h1 className="hero-title">Moments, held a little longer.</h1>
          <Link href="#contact" className="hero-cta">
            Start a Project <span className="arrow">→</span>
          </Link>
        </div>
        <div className="hero-foot">
          <div className="hero-hint">
            Hold to burst &mdash; move to bend the light
          </div>
          <div className="hero-meta">
            <div className="hero-badge">
              <div>Est. 2016</div>
              <div>9+ years<br />behind the lens</div>
            </div>
            <p>Weddings, portraits, product, events, commercials and film &mdash; shot for clarity, patience and feeling.</p>
          </div>
        </div>
      </div>
      <div className="hero-scroll">↓</div>
    </section>
  )
}
