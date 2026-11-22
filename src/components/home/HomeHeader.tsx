'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomeHeader() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`home-header${solid ? ' home-header--solid' : ''}`}>
      <Link className="logo" href="/">Imora</Link>
      <div className="nav-right">
        <nav>
          <ul>
            <li><Link href="/photography">Photography</Link></li>
            <li><Link href="/photography">Videography</Link></li>
            <li><Link href="/studio">Studio</Link></li>
          </ul>
        </nav>
        <Link href="/photography" className="nav-pill">Book a Session</Link>
      </div>
    </header>
  )
}
