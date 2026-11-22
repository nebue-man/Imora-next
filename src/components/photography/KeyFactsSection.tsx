'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function KeyFactsSection() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const grid = document.querySelector<HTMLElement>('.kf-grid')
      if (!grid) return

      gsap.fromTo(grid,
        { rotateX: 24, rotateZ: 3.5, y: 90, scale: 0.9 },
        {
          rotateX: 0, rotateZ: 0, y: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: '.kf', start: 'top 62%', end: 'top -5%', scrub: 0.6 },
        }
      )

      gsap.utils.toArray<HTMLElement>('.kf-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0.15, y: 40 },
          {
            opacity: 1, y: 0, ease: 'none',
            scrollTrigger: { trigger: '.kf', start: `top ${60 - i * 4}%`, end: 'top 8%', scrub: 0.6 },
          }
        )
      })

      gsap.from('.kf-head > *', {
        opacity: 0, y: 34, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.kf', start: 'top 78%' },
      })
      gsap.from('.kf-logos b', {
        opacity: 0, y: 18, duration: 0.7, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: '.kf-partners', start: 'top 88%' },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="kf">
      <div className="kf-head">
        <h2>Key facts</h2>
        <p>A snapshot of our<br />experience and impact.</p>
      </div>
      <div className="kf-grid">
        <div className="kf-card dark" style={{ position: 'relative' }}>
          <div className="kf-media">
            <Image
              src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=700&q=80"
              alt="Awards"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="kf-label">Featured &amp; Awards</div>
          <div className="kf-bottom">
            <p>Featured on top photography platforms worldwide.</p>
            <div className="kf-num">50<sup>+</sup></div>
          </div>
        </div>
        <div className="kf-card light">
          <div className="kf-label">Shoots Completed</div>
          <div className="kf-circle">1.5K<sup style={{ fontSize: '.45em', verticalAlign: 'super' }}>+</sup></div>
          <div className="kf-label" style={{ maxWidth: '80%', margin: '0 auto', textTransform: 'none', letterSpacing: 0, fontSize: '14px', lineHeight: '1.45' }}>
            90% of our clients book us again within the year.
          </div>
        </div>
        <div className="kf-card dark" style={{ position: 'relative' }}>
          <div className="kf-media">
            <Image
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80"
              alt="Team"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="kf-label">Our Team</div>
          <div className="kf-bottom">
            <p>Different eyes.<br />One standard.</p>
            <div className="kf-num">20<sup>+</sup></div>
          </div>
        </div>
      </div>
      <div className="kf-partners">
        <span>Trusted By</span>
        <div className="kf-logos">
          <b>Lumen</b><b>Vestra</b><b>Northbound</b><b>Atelier&nbsp;9</b><b>Solace</b>
        </div>
      </div>
    </section>
  )
}
