import Image from 'next/image'

const images = [
  { src: '/images/hero/studio-cyclorama.jpg',  alt: 'Photography studio — white cyclorama and professional lighting rigs' },
  { src: '/images/hero/studio-lit.jpg',         alt: 'Studio lit and ready — softboxes, white backdrop and camera gear' },
  { src: '/images/hero/studio-desk.jpg',        alt: 'Post-production editing suite with triple monitors' },
  { src: '/images/hero/studio-backdrops.jpg',   alt: 'Coloured backdrop wall — gold, cyan, orange, red and black' },
  { src: '/images/hero/studio-podcast.jpg',     alt: 'Podcast and interview studio with RODE microphone' },
]

export default function HeroGallery() {
  return (
    <section className="hg" aria-label="Studio showcase">
      {images.map((img, i) => (
        <div key={img.src} className="hg-frame">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="100vw"
            priority={i === 0}
            loading="eager"
          />
          <div className="hg-scrim" aria-hidden="true" />
          {i === 0 && (
            <div className="hg-text">
              <p className="hg-label">Photography · Videography · Studio</p>
              <h1 className="hg-brand">Imora</h1>
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
