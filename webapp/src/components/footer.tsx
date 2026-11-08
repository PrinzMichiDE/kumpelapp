import Link from 'next/link'
import { Facebook, Instagram, Youtube, Twitter, Mail } from 'lucide-react'

const footerLinks = {
  app: [
    { name: 'Spieltag', href: '/spielplan' },
    { name: 'Tabelle', href: '/tabelle' },
    { name: 'Kader', href: '/kader' },
    { name: 'News', href: '/news' },
    { name: 'Auswärts', href: '/auswaerts' },
    { name: 'Verein', href: '/verein' },
    { name: 'Tradition', href: '/tradition' },
    { name: 'Fans', href: '/fans' },
  ],
  kumpels: [
    { name: 'Tippspiel', href: '/tippspiel' },
    { name: 'Gruppen', href: '/kumpels' },
    { name: 'Mitfahrbörse', href: '/kumpels/mitfahrten' },
    { name: 'Spieler des Spiels', href: '/tippspiel/mvp' },
  ],
  verein: [
    { name: 'Offizielle Website', href: 'https://www.fc-erzgebirge.de', external: true },
    { name: 'Tickets', href: 'https://customer59.ticketing.cloud.sap/shop?shopid=103', external: true },
    { name: 'Fanshop', href: 'https://www.fc-erzgebirge.shop', external: true },
    { name: 'Mitglied werden', href: '/verein/mitgliedschaft' },
    { name: 'Fanbeauftragter', href: '/fans/fanbeauftragter' },
    { name: 'Fanprojekt', href: '/fans/fanprojekt' },
    { name: 'Barrierefreiheit', href: '/fans/barrierefreiheit' },
  ],
  legal: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
    { name: 'AGB', href: '/agb' },
    { name: 'Quellen & Lizenzen', href: '/quellen' },
    { name: 'Barrierefreiheitserklärung', href: '/barrierefreiheit' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/FCErzgebirgeAue/', icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/fcerzgebirgeaue/', icon: Instagram },
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UChnv2SceLVgWU-mRoOVGKSA', icon: Youtube },
  { name: 'Twitter/X', href: 'https://twitter.com/FCErzgebirgeAue', icon: Twitter },
]

export function Footer() {
  return (
    <footer className="border-t border-fc-border bg-fc-surface" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4" aria-label="KumpelApp Startseite">
              <svg className="h-8 w-8 text-fc-violet" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4"/>
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <span className="font-bold text-xl text-fc-fg">KumpelApp</span>
            </Link>
            <p className="text-sm text-fc-fg/60 mb-4 max-w-xs">
              Die ultimative Fan-App für den FC Erzgebirge Aue. Vom Spieltag bis zur Tradition – alles an einem Ort.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fc-fg/50 hover:text-fc-violet transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="App Navigation">
            <h3 className="font-semibold text-fc-fg mb-4">App</h3>
            <ul className="space-y-2">
              {footerLinks.app.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-fc-fg/70 hover:text-fc-violet transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Kumpels & Tippspiel">
            <h3 className="font-semibold text-fc-fg mb-4">Kumpels</h3>
            <ul className="space-y-2">
              {footerLinks.kumpels.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-fc-fg/70 hover:text-fc-violet transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Verein & Offizielles">
            <h3 className="font-semibold text-fc-fg mb-4">Verein</h3>
            <ul className="space-y-2">
              {footerLinks.verein.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-fc-fg/70 hover:text-fc-violet transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    {link.external && (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Rechtliches">
            <h3 className="font-semibold text-fc-fg mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-fc-fg/70 hover:text-fc-violet transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-fc-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-fc-fg/50">
              © {new Date().getFullYear()} KumpelApp. Nicht offiziell mit dem FC Erzgebirge Aue e.V. verbunden.
            </p>
            <p className="text-sm text-fc-fg/50">
              Datenquellen: OpenLigaDB, fc-erzgebirge.de, fussball.de, Open-Meteo, OpenStreetMap, Wikidata
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}