import Link from 'next/link'

interface FooterLink {
  label: string
  href: string
}

interface FooterProps {
  tagline: string
  colTwoTitle: string
  colTwoLinks: FooterLink[]
  copyright: string
  subtitle: string
}

export default function Footer({ tagline, colTwoTitle, colTwoLinks, copyright, subtitle }: FooterProps) {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-logo">Imora</div>
            <p>{tagline}</p>
          </div>
          <div className="footer-col">
            <h4>{colTwoTitle}</h4>
            <ul>
              {colTwoLinks.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Elsewhere</h4>
            <ul>
              <li><Link href="/studio">Studio Hire</Link></li>
              <li><Link href="/">Home</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@imora.studio">hello@imora.studio</a></li>
              <li><a href="tel:+910000000000">+91 00000 00000</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{copyright}</span>
          <span>{subtitle}</span>
        </div>
      </div>
    </footer>
  )
}
