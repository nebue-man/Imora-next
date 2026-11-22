'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const fill = fillRef.current
    const count = countRef.current
    if (!root || !fill || !count) return

    const counter = { val: 0 }
    gsap.to(counter, {
      val: 100,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate() {
        const v = Math.round(counter.val)
        count.textContent = String(v)
        fill.style.width = `${v}%`
      },
      onComplete() {
        gsap.to(root, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
          delay: 0.15,
          onComplete() {
            root.style.display = 'none'
            onComplete?.()
          },
        })
      },
    })
  }, [onComplete])

  return (
    <div ref={rootRef} className="preloader">
      <span className="preloader-logo">Imora</span>
      <div className="preloader-bar">
        <div ref={fillRef} className="preloader-fill" />
      </div>
      <span ref={countRef} className="preloader-count">0</span>
    </div>
  )
}
