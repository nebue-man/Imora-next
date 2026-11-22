import Image from 'next/image'

const reelCards = [
  {
    title: 'Wedding films',
    desc: 'The day as it actually unfolded — vows, speeches and the quiet gaps between them, cut to breathe rather than to a trailer template.',
    items: ['Highlight film', 'Full ceremony & speeches', 'Social cutdowns'],
  },
  {
    title: 'Brand films',
    desc: 'Founder stories, product pieces and campaign films made to sit on a homepage and still hold up two years later.',
    items: ['Concept & treatment', 'Direction & shoot', 'Edit, grade & sound'],
  },
  {
    title: 'Social reels',
    desc: 'Vertical cuts built for the feed — shot properly rather than salvaged from footage framed for something else.',
    items: ['9:16 native capture', 'Captions & sound design', 'Batch delivery'],
  },
]

export default function VideoSection() {
  return (
    <section className="reel" id="video">
      <div className="container">
        <div className="reel-head">
          <div>
            <h2>Some moments need to move.</h2>
          </div>
          <p>The same eye, running at 24 frames a second. Shot, edited and graded in house, so the film and the photographs feel like one body of work.</p>
        </div>
        <div className="reel-stage" id="showreel" style={{ position: 'relative' }}>
          <div className="reel-poster">
            <Image
              src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80"
              alt="Showreel"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="reel-veil" />
          <div className="reel-play" aria-label="Play showreel" role="button" tabIndex={0} />
          <div className="reel-caption">Showreel &mdash; coming soon</div>
        </div>
        <p className="reel-note">Placeholder. Drop your reel in and this plays inline — see README section 4.</p>
        <div className="reel-grid">
          {reelCards.map((c) => (
            <div className="reel-card" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <ul>
                {c.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
