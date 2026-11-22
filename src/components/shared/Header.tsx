import Link from 'next/link'

interface NavItem {
  label: string
  href: string
}

interface HeaderProps {
  navItems: NavItem[]
  ctaLabel: string
  ctaHref: string
}

export default function Header({ navItems, ctaLabel, ctaHref }: HeaderProps) {
  return (
    <header>
      <Link className="logo" href="/">Imora</Link>
      <div className="nav-right">
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href={ctaHref} className="nav-pill">{ctaLabel}</Link>
      </div>
    </header>
  )
}
