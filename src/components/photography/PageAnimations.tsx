'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

function splitWords(el: HTMLElement) {
  if (el.querySelector('.split-word')) return
  const parts = el.innerHTML.split(/(<br\s*\/?>)/i)
  el.innerHTML = parts.map((part) => {
    if (/^<br/i.test(part)) return part
    return part.split(' ').filter((w) => w.length).map((w) =>
      `<span class="split-word"><span class="split-inner">${w}</span></span>`
    ).join(' ')
  }).join('')
}

export default function PageAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {

      // Section-head reveals: heading slides up, p fades up
      document.querySelectorAll<HTMLElement>('.section-head').forEach((block) => {
        const heading = block.querySelector<HTMLElement>('h2')
        const para = block.querySelector<HTMLElement>('p')
        if (heading) {
          splitWords(heading)
          gsap.set(heading.querySelectorAll('.split-inner'), { yPercent: 110 })
        }
        if (para) gsap.set(para, { opacity: 0, y: 20 })
        ScrollTrigger.create({
          trigger: block,
          start: 'top 85%',
          onEnter() {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            if (heading) tl.to(heading.querySelectorAll('.split-inner'), { yPercent: 0, duration: 0.9, stagger: 0.02 }, 0.08)
            if (para) tl.to(para, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
          },
        })
      })

      // CTA block reveal
      const ctaContainer = document.querySelector<HTMLElement>('.cta .container')
      if (ctaContainer) {
        const h2 = ctaContainer.querySelector<HTMLElement>('h2')
        const btn = ctaContainer.querySelector<HTMLElement>('.btn')
        if (h2) { splitWords(h2); gsap.set(h2.querySelectorAll('.split-inner'), { yPercent: 110 }) }
        if (btn) gsap.set(btn, { opacity: 0, y: 20 })
        ScrollTrigger.create({
          trigger: ctaContainer,
          start: 'top 85%',
          onEnter() {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            if (h2) tl.to(h2.querySelectorAll('.split-inner'), { yPercent: 0, duration: 0.9, stagger: 0.02 }, 0)
            if (btn) tl.to(btn, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
          },
        })
      }

      // About section: clip-path reveal + text fade
      if (document.querySelector('.about-grid')) {
        gsap.set('.about-img', { clipPath: 'inset(0% 0% 100% 0%)' })
        gsap.set('.about-text', { opacity: 0, y: 40 })
        ScrollTrigger.create({
          trigger: '.about-grid',
          start: 'top 78%',
          onEnter() {
            gsap.to('.about-img', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.out' })
            gsap.to('.about-text', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.15 })
          },
        })

        // Count-up stats
        document.querySelectorAll<HTMLElement>('.about-stats h3').forEach((el) => {
          const target = parseInt(el.textContent ?? '0', 10)
          const suffix = (el.textContent ?? '').replace(/[0-9]/g, '')
          const obj = { val: 0 }
          ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter() {
              gsap.to(obj, {
                val: target, duration: 1.6, ease: 'power2.out',
                onUpdate() { el.textContent = Math.round(obj.val) + suffix },
              })
            },
          })
        })
      }

      // Genre cards: curtain reveal
      gsap.utils.toArray<HTMLElement>('.genre-card').forEach((card, i) => {
        gsap.set(card, { clipPath: 'inset(0% 0% 100% 0%)' })
        ScrollTrigger.create({
          trigger: card,
          start: 'top 88%',
          onEnter() {
            gsap.to(card, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power4.out', delay: (i % 4) * 0.08 })
          },
        })
      })

      // Horizontal work: lead text reveal
      const hworkSect = document.querySelector('.hwork')
      if (hworkSect && window.innerWidth > 900) {
        gsap.from('.hwork-lead > *', {
          opacity: 0, y: 40, duration: 0.9, stagger: 0.14, ease: 'power3.out',
          scrollTrigger: { trigger: hworkSect, start: 'top 55%' },
        })
      }

    })
    return () => ctx.revert()
  }, [])

  return null
}
