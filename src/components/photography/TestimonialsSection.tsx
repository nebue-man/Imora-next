'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const testimonials = [
  {
    quote: '"Imora photographed our wedding and somehow disappeared into the day — the photos feel like we\'re back there. Every frame is exactly how it felt."',
    name: 'Ananya Mehta',
    role: 'Wedding Client',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote: '"Our product shoot needed to feel premium without trying too hard. Imora nailed the brief in one session — clean, considered, on brand."',
    name: 'Rohan Kapoor',
    role: 'Founder, Studio Nine',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote: '"I\'ve done a lot of portrait sessions and always felt stiff on camera. This was the first time I actually looked like myself in the photos."',
    name: 'Priya Shah',
    role: 'Portrait Client',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote: '"Professional, unobtrusive, and fast to deliver. Our campaign shots have outperformed everything else we shot this year."',
    name: 'Devika Rao',
    role: 'Marketing Lead',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80',
  },
]

export default function TestimonialsSection() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.testi-card').forEach((card, i) => {
        gsap.set(card, { opacity: 0, y: 40 })
        ScrollTrigger.create({
          trigger: card,
          start: 'top 92%',
          onEnter() {
            gsap.to(card, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: i * 0.06 })
          },
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section-pad">
      <div className="container">
        <div className="section-head">
          <div>
            <h2>What clients say after the shoot.</h2>
          </div>
        </div>
        <div className="testi-track">
          {testimonials.map((t) => (
            <div className="testi-card" key={t.name}>
              <p>{t.quote}</p>
              <div className="testi-person">
                <div className="testi-avatar">
                  <Image src={t.avatar} alt={t.name} width={100} height={100} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
