'use client'
import { useEffect } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  useEffect(() => {
    const dot = document.querySelector<HTMLElement>('.cursor-dot')
    const outline = document.querySelector<HTMLElement>('.cursor-outline')
    if (!dot || !outline) return

    gsap.set([dot, outline], { xPercent: -50, yPercent: -50 })
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' })
    const outX = gsap.quickTo(outline, 'x', { duration: 0.45, ease: 'power3' })
    const outY = gsap.quickTo(outline, 'y', { duration: 0.45, ease: 'power3' })

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX); dotY(e.clientY)
      outX(e.clientX); outY(e.clientY)
    }
    window.addEventListener('mousemove', onMove)

    // Hover state on interactive elements
    const hoverEls = document.querySelectorAll<HTMLElement>('a, .genre-card, .hwork-item, .btn, .service-row')
    const onEnter = () => outline.classList.add('hover')
    const onLeave = () => outline.classList.remove('hover')
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    // Magnetic button effect on .btn elements
    const setupMagnetic = () => {
      document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
        const onBtnMove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect()
          gsap.to(btn, {
            x: (e.clientX - r.left - r.width / 2) * 0.35,
            y: (e.clientY - r.top - r.height / 2) * 0.35,
            duration: 0.3,
            ease: 'power2.out',
          })
        }
        const onBtnLeave = () =>
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' })
        btn.addEventListener('mousemove', onBtnMove)
        btn.addEventListener('mouseleave', onBtnLeave)
      })
    }
    setupMagnetic()

    return () => {
      window.removeEventListener('mousemove', onMove)
      hoverEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" />
      <div className="cursor-outline">
        <span className="cursor-label">View</span>
      </div>
    </>
  )
}
