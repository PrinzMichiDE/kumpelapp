import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AGB & Nutzungsbedingungen',
  description: 'Nutzungsbedingungen und Community-Richtlinien der KumpelApp.',
}

export default function AgbPage() {
  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-fc-fg">Nutzungsbedingungen</h1>
        <div className="mt-6 space-y-6 text-fc-fg/80">
          <p className="text-fc-fg/70">
            Diese Bedingungen regeln die Nutzung der KumpelApp als Fan-Informations- und Community-Angebot. Für den Produktivbetrieb sind sie rechtlich zu prüfen und anzupassen.
          </p>
          <section>
            <h2 className="text-xl font-semibold text-fc-fg">1. Angebot & Verfügbarkeit</h2>
            <p className="mt-2">Die App bündelt Informationen rund um den FC Erzgebirge Aue. Daten stammen aus unterschiedlichen Quellen; es besteht kein Anspruch auf ständige Verfügbarkeit, Vollständigkeit oder Echtzeitgenauigkeit.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-fc-fg">2. Accounts & Community</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Registrierung nur mit korrekten Angaben; Zugangsdaten vertraulich behandeln.</li>
              <li>Respektvoller Umgang in Gruppen, Tippspiel, Mitfahrbörse und Check-ins.</li>
              <li>Keine rechtswidrigen, beleidigenden, hetzerischen oder irreführenden Inhalte.</li>
              <li>Moderation: Inhalte/Nutzer können bei Verstößen eingeschränkt oder entfernt werden; Meldefunktion vorgesehen.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-fc-fg">3. Tickets & externe Dienste</h2>
            <p className="mt-2">Die Ticket-Funktion dient der assistierenden Anzeige/Verwaltung eigener Ticketdaten. Offizieller Verkauf und Ticketgültigkeit richten sich nach den jeweiligen Anbietern/Vereinen. Für externe Links und Drittinhalte sind deren Betreiber verantwortlich.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-fc-fg">4. Haftung</h2>
            <p className="mt-2">Haftung im gesetzlich zulässigen Rahmen. Insbesondere keine Haftung für verpasste Spiele/Anstöße aufgrund fehlerhafter Drittquellen, Push-Zustellung oder Offline-Situationen.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
