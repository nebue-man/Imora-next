'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Preloader from '@/components/ui/Preloader'
import Header from '@/components/shared/Header'
import HeroSection from '@/components/photography/HeroSection'
import StatementSection from '@/components/photography/StatementSection'
import ValuesSection from '@/components/photography/ValuesSection'
import MarqueeSection from '@/components/photography/MarqueeSection'
import AboutSection from '@/components/photography/AboutSection'
import ServicesGridSection from '@/components/photography/ServicesGridSection'
import KeyFactsSection from '@/components/photography/KeyFactsSection'
import HorizontalWorkSection from '@/components/photography/HorizontalWorkSection'
import InclusionsSection from '@/components/photography/InclusionsSection'
import TestimonialsSection from '@/components/photography/TestimonialsSection'
import FramesInMotionSection from '@/components/photography/FramesInMotionSection'
import VideoSection from '@/components/photography/VideoSection'
import CtaSection from '@/components/photography/CtaSection'
import PageAnimations from '@/components/photography/PageAnimations'
import Footer from '@/components/shared/Footer'

const HeroBg = dynamic(
  () => import('@/components/photography/HeroBg'),
  { ssr: false }
)

const StoneSection = dynamic(
  () => import('@/components/photography/StoneSection'),
  { ssr: false }
)

const navItems = [
  { label: 'Work', href: '#work' },
  { label: 'Studio', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Video', href: '#video' },
  { label: 'Studio Hire', href: '/studio' },
]

export default function PhotographyPage() {
  const [preloaderDone, setPreloaderDone] = useState(false)

  return (
    <>
      <Preloader onComplete={() => setPreloaderDone(true)} />
      <PageAnimations />
      <Header navItems={navItems} ctaLabel="Let's Talk" ctaHref="#contact" />

      <div className="stage" id="zone3d">
        <HeroBg preloaderDone={preloaderDone} />
        <HeroSection preloaderDone={preloaderDone} />
        <StatementSection />
        <ValuesSection />
        <MarqueeSection />
      </div>

      <div className="page-solid">
        <AboutSection />
        <ServicesGridSection />
        <KeyFactsSection />
        <HorizontalWorkSection />
        <StoneSection />
        <InclusionsSection />
        <TestimonialsSection />
        <FramesInMotionSection />
        <VideoSection />
        <CtaSection />
        <Footer
          tagline="Photography and film for weddings, portraits, product, events and brands — based in India, shooting worldwide."
          colTwoTitle="Work"
          colTwoLinks={[
            { label: 'What We Shoot', href: '#work' },
            { label: 'Services', href: '#services' },
            { label: 'Videography', href: '#video' },
          ]}
          copyright="© 2026 Imora Photography Studio. All rights reserved."
          subtitle="Photography & Videography"
        />
      </div>
    </>
  )
}
