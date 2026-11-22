import Link from 'next/link'
import { WA_HREF } from '@/lib/constants'

export default function CtaSection() {
  return (
    <section id="contact" className="cta">
      <div className="container">
        <h2>Ready to make<br />your next memory?</h2>
        <Link href={WA_HREF} className="btn wa-link" target="_blank" rel="noopener noreferrer">
          Book on WhatsApp ↗
        </Link>
      </div>
    </section>
  )
}
