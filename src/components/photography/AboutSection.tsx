import Image from 'next/image'

export default function AboutSection() {
  return (
    <section id="about" className="section-pad">
      <div className="container about-grid">
        <div className="about-img">
          <Image
            src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=900&q=80"
            alt="Photographer at work"
            width={900}
            height={1125}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="about-text">
          <h2 style={{ fontSize: 'clamp(28px,3.5vw,42px)', marginBottom: '24px' }}>
            We photograph the moments people go back to.
          </h2>
          <p>Imora is an independent studio working across weddings, portraits, product, events, commercial work and film. Every project starts the same way — by listening, then looking for the frame that says the most with the least.</p>
          <p>No two shoots look alike, but every one carries the same restraint: natural light where we can get it, honest composition, and a final edit that feels like memory rather than performance.</p>
          <div className="about-stats">
            <div><h3>9+</h3><span>Years Shooting</span></div>
            <div><h3>420+</h3><span>Projects Delivered</span></div>
            <div><h3>30+</h3><span>Cities Covered</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
