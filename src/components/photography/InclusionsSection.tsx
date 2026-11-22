'use client'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const services = [
  { title: 'Wedding',     desc: 'Full-day coverage from getting-ready to reception, delivered as one continuous story.' },
  { title: 'Portrait',    desc: 'Individual, couple and family portraits on location or in studio, with a natural, unposed feel.' },
  { title: 'Product',     desc: 'Clean, considered product sets built on controlled light and honest colour.' },
  { title: 'Event',       desc: 'Launches, functions and corporate days covered unobtrusively and turned around fast.' },
  { title: 'Commercial',  desc: 'Campaign and brand imagery made to work across print, social and everything between.' },
  { title: 'Videography', desc: 'Wedding films, brand pieces and social cuts — shot, edited and graded in house.' },
]

export default function InclusionsSection() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.service-row').forEach((row) => {
        gsap.set(row, { opacity: 0, x: -40 })
        ScrollTrigger.create({
          trigger: row,
          start: 'top 90%',
          onEnter() {
            gsap.to(row, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
          },
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section-pad" style={{ background: 'var(--bg-alt)' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <h2>Book Imora for your next shoot.</h2>
          </div>
          <p>Every package is shaped around the story you&rsquo;re trying to tell — not the other way around.</p>
        </div>
        <div className="services-list">
          {services.map((s, i) => (
            <div className="service-row" key={s.title}>
              <div className="service-num">0{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="service-arrow">↗</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
