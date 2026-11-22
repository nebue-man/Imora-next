'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function StatementSection() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const el = document.querySelector<HTMLElement>('[data-words]')
      if (!el) return
      el.innerHTML = (el.textContent ?? '').split(' ').map((w) =>
        `<span class="w">${w}</span>`
      ).join(' ')
      gsap.to(el.querySelectorAll('.w'), {
        color: '#f4ede3',
        ease: 'none',
        stagger: 0.4,
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          end: 'bottom 55%',
          scrub: 0.6,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="statement">
      <div className="statement-label">Our approach</div>
      <div className="statement-text" data-words>
        We don&rsquo;t chase the shot. We wait for the one that&rsquo;s already there.
      </div>
    </section>
  )
}
