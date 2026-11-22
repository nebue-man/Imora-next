'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const works = [
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    alt: 'Wedding story',
    title: 'The Mehta Wedding',
    desc: 'Two days in Udaipur, shot as one continuous story.',
  },
  {
    src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Product campaign',
    title: 'Studio Nine',
    desc: 'A product campaign built on hard light and clean edges.',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Travel editorial',
    title: 'Northbound',
    desc: 'Six weeks on the road, shot for a travel publication.',
  },
  {
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    alt: 'Portrait series',
    title: 'Quiet Portraits',
    desc: 'An ongoing series on people photographed without a brief.',
  },
]

export default function HorizontalWorkSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const section = sectionRef.current
      const inner = innerRef.current
      if (!section || !inner) return

      // Only pin on desktop (hwork-inner has width:max-content + height:100svh on desktop)
      if (window.innerWidth < 768) return

      const totalWidth = inner.scrollWidth
      const viewportWidth = window.innerWidth

      gsap.to(inner, {
        x: -(totalWidth - viewportWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${totalWidth - viewportWidth}`,
          invalidateOnRefresh: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hwork" ref={sectionRef}>
      <div className="hwork-inner" ref={innerRef}>
        <div className="hwork-lead">
          <h2>Selected work<br />&amp; explorations</h2>
          <Link href="#">View all projects <span>&rarr;</span></Link>
        </div>
        {works.map((w) => (
          <div className="hwork-item" key={w.title}>
            <figure>
              <Image
                src={w.src}
                alt={w.alt}
                width={1200}
                height={780}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </figure>
            <h3>{w.title}</h3>
            <div className="hwork-meta">
              <p>{w.desc}</p>
              <Link href="#">Explore project <span>&rarr;</span></Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
