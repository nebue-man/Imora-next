'use client'
import Preloader from '@/components/ui/Preloader'
import HomeHeader from '@/components/home/HomeHeader'
import HeroGallery from '@/components/home/HeroGallery'
import Footer from '@/components/shared/Footer'

export default function HomePage() {
  return (
    <>
      <Preloader onComplete={() => {}} />

      <HomeHeader />

      <main>
        <HeroGallery />
      </main>

      <Footer
        tagline="Photography, Videography & Studio Services in Colombo."
        colTwoTitle="Services"
        colTwoLinks={[
          { label: 'Photography',  href: '/photography#photography' },
          { label: 'Videography',  href: '/photography#videography' },
          { label: 'Studio Hire',  href: '/studio' },
        ]}
        copyright="© 2024 Imora Studio. All rights reserved."
        subtitle="Built by Clickx Studio"
      />

      {/*
        TEMPORARILY HIDDEN — entry chooser (Photography / Studio pick panels)
        Restore by uncommenting and re-adding the useRef + GSAP entrance animation.

      <div className="pick" ref={pickRef}>
        <div className="pick-mark">Imora</div>
        <Link className="pick-panel" href="/photography" style={{ opacity: 0, transform: 'translateY(40px)' }}>
          <div className="pick-media">
            <Image
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"
              alt="Photography and film"
              fill sizes="50vw" priority
            />
          </div>
          <div className="pick-in">
            <h2>Photography<br />&amp; Videography</h2>
            <p>Weddings, portraits, product, events, commercial work and film.</p>
            <span className="pick-go">Enter <span>→</span></span>
          </div>
        </Link>
        <Link className="pick-panel" href="/studio" style={{ opacity: 0, transform: 'translateY(40px)' }}>
          <div className="pick-media">
            <Image
              src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=80"
              alt="Studio services"
              fill sizes="50vw"
            />
          </div>
          <div className="pick-in">
            <h2>Studio<br />Services</h2>
            <p>A fully treated room for podcasts and long-form conversation.</p>
            <span className="pick-go">Enter <span>→</span></span>
          </div>
        </Link>
        <div className="pick-foot">Choose a side — or say hello on WhatsApp</div>
      </div>
      */}
    </>
  )
}
