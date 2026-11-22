'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const WHEEL_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
]

const MGRID_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
]

export default function FramesInMotionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const t1Ref = useRef<HTMLHeadingElement>(null)
  const t2Ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const sect = sectionRef.current
      const wheel = wheelRef.current
      if (!sect || !wheel) return

      const isMobile = window.innerWidth < 900
      const R = isMobile ? 700 : 980
      const STEP = isMobile ? 13 : 9.4
      const cards = Array.from(wheel.querySelectorAll<HTMLElement>('.wcard'))
      const SPAN = (cards.length - 1) * STEP

      cards.forEach((card, i) => {
        const a = -SPAN / 2 + i * STEP
        card.style.transform = `rotate(${a}deg) translateY(${-R}px) rotate(${-a * 0.82}deg)`
      })

      const FROM = SPAN / 2 + 26
      const TO = -SPAN / 2 - 26

      ScrollTrigger.create({
        trigger: sect,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate(self) {
          const p = self.progress
          wheel.style.transform = `rotate(${FROM + (TO - FROM) * p}deg)`
          if (t1Ref.current) t1Ref.current.style.transform = `translateX(${-p * 16}vw)`
          if (t2Ref.current) t2Ref.current.style.transform = `translateX(${p * 16}vw)`
        },
      })

      // mgrid figures fade up
      gsap.from('.mgrid figure', {
        opacity: 0,
        y: 60,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.mgrid', start: 'top 78%' },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <>
      <section className="motion" ref={sectionRef}>
        <div className="motion-sticky">
          <svg className="motion-guides" viewBox="0 0 1600 900" preserveAspectRatio="none">
            <path d="M 240 760 Q 700 300 1500 470" />
            <path d="M 300 880 Q 820 420 1560 560" />
            <path d="M 700 120 Q 1050 60 1400 210" />
          </svg>
          <h2 className="motion-t motion-t1" ref={t1Ref}>Frames in</h2>
          <h2 className="motion-t motion-t2" ref={t2Ref}>Motion</h2>
          <p className="motion-mid">Exploring light through<br />daily practice.</p>
          <p className="motion-note">Tests, outtakes and frame studies shared openly as part of how we work.</p>
          <Link href="#" className="motion-link">View the journal <span>&rarr;</span></Link>
          <div className="wheel" ref={wheelRef}>
            {WHEEL_IMAGES.map((src, i) => (
              <div className="wcard" key={i}>
                <Image src={src} alt="Frame study" width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mgrid">
        <div className="mgrid-in">
          {MGRID_IMAGES.map((src, i) => (
            <figure key={i}>
              <Image src={src} alt="Frame study" width={800} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </figure>
          ))}
        </div>
        <div className="mgrid-foot">
          <p>Tests, outtakes and frame studies shared openly as part of how we work.</p>
          <Link href="#">View the journal <span>&rarr;</span></Link>
        </div>
      </section>
    </>
  )
}
