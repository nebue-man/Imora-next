import Link from 'next/link'

export default function ValuesSection() {
  return (
    <section className="values">
      <div className="values-rule"><div /></div>
      <div className="values-grid">
        <div className="values-left">
          <h4>Patience over pursuit</h4>
          <h4>Clarity over complexity</h4>
          <h4>Feeling over performance</h4>
        </div>
        <div className="values-right">
          <p>
            We photograph weddings, portraits, product, events, commercial work and film.
            Every project starts the same way — by listening, then looking for the frame
            that says the most with the least. Natural light where we can get it,
            honest composition, and a final edit that feels like memory.
          </p>
          <Link href="#about" className="values-link">
            About the studio <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
