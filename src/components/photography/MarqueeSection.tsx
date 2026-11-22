const ITEMS = [
  'Photography', 'Film', 'Weddings', 'Portraits',
  'Product', 'Events', 'Commercial', 'Editorial',
]

export default function MarqueeSection() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <section className="big-marquee">
      <div className="bm-top">
        <p>A studio built on patience, precision and the honest frame.</p>
        <p style={{ marginTop: '8px', color: 'rgba(244,237,227,0.55)' }}>
          Ratnapura · Sri Lanka · Shooting worldwide since 2016
        </p>
      </div>
      <div className="bm-track">
        {doubled.map((item, i) => (
          <span key={i}>
            {item}
            {i < doubled.length - 1 && <i>·</i>}
          </span>
        ))}
      </div>
      <p className="bm-foot">
        Every shoot is different. Every frame is <b>deliberate.</b>
      </p>
    </section>
  )
}
