import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quellen & Lizenzen',
  description: 'Datenquellen, Lizenzen und Attributionen der KumpelApp.',
}

const sources = [
  {
    name: 'OpenLigaDB',
    url: 'https://www.openligadb.de',
    usage: 'Spielplan, Ergebnisse, Tabelle (Regionalliga Nordost, soweit verfügbar)',
    license: 'Datenbereitstellung über öffentliche API; Nutzung gemäß API-Bedingungen, Caching mit Timestamp/Quellhinweis',
  },
  {
    name: 'fc-erzgebirge.de',
    url: 'https://www.fc-erzgebirge.de',
    usage: 'Offizielle Vereinsinformationen, News-Teaser und Deep-Links, Ticket-/Shop-Verweise',
    license: 'Keine Volltextübernahme; Verlinkung auf Originalinhalte, Marken- und Urheberrechte beim FC Erzgebirge Aue e.V.',
  },
  {
    name: 'fussball.de / DFB',
    url: 'https://www.fussball.de',
    usage: 'Referenz für Amateurwettbewerbe/Spielpläne; strukturierte Fallback-Informationen und manuelle Prüfung',
    license: 'Nur strukturierte, zulässige Nutzung/Verlinkung; keine ungenehmigte Übernahme geschützter Inhalte',
  },
  {
    name: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org',
    usage: 'Stadion- und Ortsdaten, Kartenlinks/POIs für Auswärts-Guides',
    license: '© OpenStreetMap-Mitwirkende, ODbL 1.0',
  },
  {
    name: 'Open-Meteo',
    url: 'https://open-meteo.com',
    usage: 'Wetterprognosen für Spielorte/Anreise',
    license: 'CC BY 4.0 (Attribution erforderlich)',
  },
  {
    name: 'Wikidata / Wikipedia',
    url: 'https://www.wikidata.org',
    usage: 'Historische Fakten, Traditions- und Quiz-Inhalte (kuratierte Aufbereitung)',
    license: 'Wikidata: CC0; Wikipedia-Inhalte: CC BY-SA 4.0 (je nach Artikel, Attribution beachten)',
  },
  {
    name: 'Vereinseigene/kuratierte Daten',
    url: '#',
    usage: 'Stadionhinweise, Fan-Informationen, redaktionelle Korrekturen und Overrides',
    license: 'Intern gepflegt; sensible personenbezogene Daten werden minimiert',
  },
]

export default function QuellenPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-fc-fg">Quellen & Lizenzen</h1>
        <p className="mt-3 max-w-3xl text-fc-fg/70">
          Transparenz über Datenherkunft, Nutzungszwecke und Lizenzhinweise. Wo möglich werden Inhalte verlinkt statt kopiert.
          Zeitstempel und Quellstatus werden im Matchcenter angezeigt, um Datenaktualität nachvollziehbar zu machen.
        </p>

        <div className="mt-8 grid gap-4">
          {sources.map((s) => (
            <Card key={s.name} className="border-fc-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-3 text-lg">
                  <span>{s.name}</span>
                  {s.url !== '#' ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light"
                    >
                      Website <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-fc-fg/75">
                <p><span className="font-medium text-fc-fg">Verwendung:</span> {s.usage}</p>
                <p><span className="font-medium text-fc-fg">Lizenz/Hinweis:</span> {s.license}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-fc-violet/25 bg-fc-violet/5">
          <CardContent className="space-y-3 py-6 text-sm text-fc-fg/75">
            <p>
              <span className="font-medium text-fc-fg">Datenvertrauen:</span> Kernansichten sollen Quelle, Stand, Prüfstatus und Fallbacks zeigen.
              Wenn Daten fehlen oder verspätet sind (insb. Regionalliga Nordost), wird dies transparent kommuniziert statt Live-Ereignisse zu simulieren.
            </p>
            <p>
              <span className="font-medium text-fc-fg">Fehler melden / Korrektur:</span> Bei fehlerhaften oder veralteten Daten bitte melden (z. B. auf der Spielseite „Datenproblem melden“ oder über Profil/Einstellungen/Redaktion).
              Redaktionen/Admins können Overrides (z. B. Verlegung, Ergebnis, Venue-Hinweise) mit Nachvollziehbarkeit setzen.
            </p>
            <p>
              <span className="font-medium text-fc-fg">Marken- & Medienrechte:</span> „FC Erzgebirge Aue“, Vereinswappen/Logos, Fotos, Texte und Streams
              können geschützt sein. Vor öffentlichem Launch sind Freigaben/Lizenzprüfungen erforderlich; die App bevorzugt Teaser + Deep-Link.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
