'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    const rafFn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(rafFn)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    const handleAnchor = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement
      const href = a.getAttribute('href') ?? ''
      const target = href.length > 1 ? document.querySelector(href) : null
      if (target) {
        e.preventDefault()
        lenis.scrollTo(target as HTMLElement, { offset: -20, duration: 1.4 })
      }
    }
    anchors.forEach((a) => a.addEventListener('click', handleAnchor))

    return () => {
      gsap.ticker.remove(rafFn)
      anchors.forEach((a) => a.removeEventListener('click', handleAnchor))
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
