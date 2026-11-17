# Source Matrix – Regionalliga Nordost 2026/27 (KumpelApp)

> **Stand:** 2026-11-17  
> **Status:** Betriebsgrundlage v3 (A1-Dokumentation, A2-Transparenzmuster, A3/A4-Grundflüsse in App/Admin vorbereitet). **Live-Verifikation der RLNO-Quellen 2026/27 (API-Abdeckung, Latenz, Feldmapping, Fehlerbilder) steht noch aus** und muss mit realem Netzwerk-/Datenzugriff pro Feld protokolliert werden.  
> **Zweck:** Verlässliche, nachvollziehbare Datenversorgung für Matchday, Ergebnisse, Tabelle, Auswärts-Guides, Streams, News und redaktionelle Korrekturen.

## 1. Leitprinzipien
- **Capability statt Illusion:** Nur anzeigen, was die Quelle je Match/Feld wirklich liefert (`events_available`, `result_only`, `no_live_data`, `stale`, `manual_corrected`).
- **Transparenz immer sichtbar:** Quelle, Stand (`fetchedAt`/Sync-Zeit), Prüfstatus (`AUTO/DRAFT/CHECKED`) und Korrekturhinweise auf Kernansichten.
- **Overrides sind First-Class:** Redaktionelle Korrekturen (Kickoff, Status, Ergebnis, Venue, Stream) müssen validiert, nachvollziehbar und gegenüber UI wirksam sein.
- **Kein stiller Fallback:** Bei Unsicherheit/Veraltung klare Nutzerkommunikation + nächste Aktion (Sync/Override/offizieller Link).

## 2. Priorisierte Quellen & Fallback-Ketten

| Datenfeld | Primärquelle | Fallback 1 | Fallback 2 | Update-Strategie | Capability / UI-Vertrag |
|---|---|---|---|---|---|
| Spielplan (Paarungen, Spieltag, Ansetzungen) | OpenLigaDB `rlno` (API, saisonbezogen) | fussball.de/Verbandsansetzung (manuell geprüft/importiert) | Offizielle Vereinsmeldung + Admin-Override | Vor Saisonstart, täglich, vor Spieltag, bei Verlegungsfenstern | `schedule_available` / `stale` / `manual_corrected`; Kickoff lokal + Verlegungsbadge |
| Ergebnisse & Spielstatus (`SCHEDULED/LIVE/FINISHED/POSTPONED/CANCELLED`) | OpenLigaDB `rlno` | fussball.de Ergebnisreferenz (manuell) | Vereins/Verband + Redaktioneller Override | Spieltag hochfrequent/best effort; sonst regelmäßig | Status immer explizit; Korrekturhinweis sichtbar |
| Tabelle (Platz, Punkte, Tore, Form) | OpenLigaDB `rlno` | fussball.de Tabelle (Stichprobe/manuell) | Redaktioneller Override nur Ausnahme mit Audit | Nach Spielende/Spieltag + nightly | Quelle/Stand/Stale anzeigen; keine stille Neubewertung |
| Live-Events (Tore/Karten/Wechsel/Minuten) | OpenLigaDB Match-Events (falls geliefert) | **kein** Event-Ersatz | Ergebnis-/Statusdarstellung + redaktionelle Notiz | Best effort während/nach Spiel | `events_available` vs `result_only` vs `no_live_data` |
| Streams/Übertragung | Kuratierte Links (Admin/Seed/Verifikation) | Offizielle Vereins-/Plattformhinweise | „Kein verifizierter Stream bekannt“ | Vor Spieltag prüfen, kurzfristig änderbar | Extern, Prüfstatus/Datum, kein Vollständigkeitsversprechen |
| Stadion-/Auswärtsinfos (Adresse, Gästeblock, Einlass, Parken, ÖPNV, Barriere) | DB/Seeds + redaktionelle Pflege | OSM/Vereins-/Stadionseiten (manuell) | „Noch nicht geprüft“ | Saisonstart + Review-Pässe + anlassbezogen | `AUTO/DRAFT/CHECKED`, `fetchedAt`, Feldquellen/Attribution |
| Wetter | Open-Meteo/Deep-Links (optional) | Externe Prognose-Links | Kein Block erzwingen | Kurz vor Anstoß/on-demand | Nur Hinweischarakter |
| News | Kuratierte Quellen (Teaser + Deep-Link) | Redaktionell gepflegte Einträge | Leerer Zustand mit Hinweis | Mehrmals täglich / bei Bedarf | Quelle/Zeit/extern; keine Volltext-/Bildübernahme ohne Lizenz |
| Tickets/Verkaufshinweise | Offizielle Shops/Links, Parser-Assistenz | Redaktionelle Hinweise | Kein Ticketversprechen | Anlassbezogen, vor Spieltag | Parse-Status klar; sensible Daten minimieren |

## 3. Feldbasierte Capability-Definitionen (fachlich)

| Capability | Bedeutung | UI-Regel |
|---|---|---|
| `schedule_available` | Kickoff/Teams/Spieltag vorhanden | Normale Anzeige + Quelle/Stand |
| `result_available` | Finales/aktuelles Ergebnis plausibel vorhanden | Score anzeigen, bei Override Hinweis |
| `events_available` | Eventliste aus Quelle plausibel | Eventliste/Ticker erlaubt |
| `result_only` | Ergebnis/Status vorhanden, Events fehlen/unzuverlässig | Kein leerer Ticker; ehrlich kommunizieren |
| `no_live_data` | Keine Live-/Eventdaten | Ergebnis/Status + Hinweis/Fallback-Link |
| `stale` | Letzter erfolgreicher Stand überschreitet Schwelle | Warnbadge + letzte Aktualisierung |
| `manual_corrected` | Redaktioneller Override aktiv | „Manuell korrigiert/prüfen“ + Notiz/Audit-Kontext |
| `review_checked` | Redaktionell geprüft (Venue/Content) | Prüfstatus + Datum anzeigen |

## 4. Stale-Schwellen & Betriebsgrenzen (Empfehlung)

| Quelle/Job | Normal | Stale-Warnung | Kritisch | Empfohlene Aktion |
|---|---:|---:|---:|---|
| `openligadb` (Spieltag/Live-Fenster) | <= 30 min / ereignisbasiert | > 6 h | > 24 h oder Fehlerserie | Resync, API prüfen, ggf. manuelles Update kritischer Spiele |
| `openligadb` (spielfrei) | <= 6 h | > 24 h | > 48 h | Health prüfen, Logs analysieren, Retry mit Backoff |
| `away-info` / Venues | review-basiert | > 30 Tage ungeprüft | Saisonstart/Spieltag ungeprüft | Review-Pass, `fetchedAt`/Status aktualisieren |
| `news` / `streams` | <= 12 h | > 24 h | > 72 h | Quelle prüfen, tote Links deaktivieren, kuratieren |
| `traditions` / `quiz` / `squad` | versioniert/manuell | > 90 Tage | vor Release/Saison ungeprüft | Faktencheck, Review, Seed-Update |

## 5. RLNO-Spezifika (Betriebsrealität)
- **Heterogene Datenqualität:** Nicht jedes Spiel liefert Events/Streams in gleicher Tiefe. Produkt muss feld-/matchbezogen degradieren.
- **Kurzfristige Änderungen:** Wetter, Platz, Verband, Sicherheit → Kickoff/Ort/Status können sich kurzfristig ändern. Overrides müssen schnell und sichtbar sein.
- **Saisonwechsel:** Teilnehmerfeld, Venues, Zuordnungen und Deep-Links ändern sich saisonal → versionierte Seeds + Rollover-Check.
- **Streaming fragmentiert:** Keine Liga-Garantie; nur kuratierte, datierte Links mit extern-Hinweis.

## 6. Verifikations-Checkliste (vor Produktivnutzung, je Saison/Release)

### 6.1 OpenLigaDB / Wettbewerb
- [ ] Endpunkte/League-Shortcut für RLNO-Saison(en) prüfen (`rlno/<jahr>` etc.), Antwortformat dokumentieren.
- [ ] Feldabdeckung verifizieren: Spieltag, Kickoff (UTC/Lokal), Teams, Venue, Status, Ergebnis, Halbzeit, Events.
- [ ] Statusübergänge testen: `SCHEDULED -> LIVE -> FINISHED`, plus `POSTPONED/CANCELLED`.
- [ ] Stichprobenvergleich Tabelle/Ergebnisse gegen offizielle Referenz (fussball.de/Verband/Verein).

### 6.2 Venues / Auswärts (17 RLNO-Venues Saison 2026/27)
- [ ] Pro Venue kritische Felder prüfen: Name, Adresse, Gästeblock, Einlass, Auto/ÖPNV, Parken, Barrierehinweise (nur belegbar).
- [ ] Quelle(n), `fetchedAt`, `reviewStatus`, `fieldSources`/Attribution pflegen.
- [ ] Maps/Route-Links stichprobenartig validieren.

### 6.3 Streams / News / Inhalte
- [ ] Streamlinks vor Spieltag manuell prüfen, tote Links deaktivieren/ersetzen.
- [ ] News nur Teaser+Deep-Link; Quelle/Zeit sichtbar; Dedupe/Themenbezug prüfen.
- [ ] Traditions-/Quiz-Inhalte auf Fakten, Quellen und Lizenzlage prüfen.

### 6.4 Overrides & Audit (3 Pflicht-Szenarien)
- [ ] **Verlegung:** Kickoff/Status geändert, UI + Historienhinweis korrekt.
- [ ] **Ergebniskorrektur:** Score/Status geändert, Transparenz + Folgeeffekte geprüft.
- [ ] **Venue-Hinweis:** Kritische Info aktualisiert, `reviewStatus`/`fetchedAt`/Audit korrekt.

## 7. Admin-/UI-Anforderungen (A2/A3/A4 Ableitung)
- Jede Kernansicht mit Datenbezug zeigt **Quelle, Stand, Prüfstatus/Fallback** (einheitliches Pattern/`DataMeta`).
- Match/Spielplan/Tabelle/Stadionmodus unterscheiden **frisch / stale / manuell korrigiert / nur Ergebnis**.
- Admin-Sync zeigt **letzten Erfolg, Alter, Fehlerklasse, nächste Aktion**.
- Overrides benötigen **Pflichtkontext** (Was, Warum, Quelle/Referenz, Zeitpunkt, Bearbeiter).

## 8. Offene Verifikationspunkte (bewusst dokumentiert)
- Live-Feldabdeckung OpenLigaDB für RLNO 2026/27 (Events/Timing) ist **noch real zu verifizieren** (API-Antworten, Match-Samples, Statuswechsel, Event-Lieferung je Spieltag).
- Vollständigkeit/Verlässlichkeit kuratierter Streams bleibt **saison- und spieltagabhängig**; vor jedem Spieltag manuell prüfen.
- Venue-Feinangaben (Einlass/Block/Regeln/Barriere/ÖPNV) erfordern **laufende redaktionelle Prüfung** mit Quelle und Prüfdatum.
- Fallback-Referenzen (fussball.de/Verbandsseiten/Vereinsmeldungen) müssen je kritischem Feld mit Zitier-URL im Override-/Review-Prozess dokumentiert werden.

## 9. A1-Verifikationsprotokoll (auszufüllen bei Live-Check)
| Feld / Bereich | Primärquelle geprüft | Fallback geprüft | Beobachtung (Abdeckung/Latenz/Format) | Ergebnis | Datum | Prüfer | Maßnahme |
|---|---|---|---|---|---|---|---|
| Spielplan (Kickoff/Matchday/Teams) | ☐ OpenLigaDB `rlno/<saison>` | ☐ fussball.de / Verein |  | offen |  |  |  |
| Statuswechsel (SCHEDULED/LIVE/FINISHED/POSTPONED/CANCELLED) | ☐ | ☐ |  | offen |  |  |  |
| Ergebnisse / Halbzeit | ☐ | ☐ |  | offen |  |  |  |
| Tabelle (Punkte/Tore/Form) | ☐ | ☐ |  | offen |  |  |  |
| Live-Events (Tore/Karten/Wechsel) | ☐ | n/a (result_only fallback) |  | offen |  |  |  |
| Streams (kuratierte Links) | ☐ Admin/Seed | ☐ Verein/Plattform |  | offen |  |  |  |
| Venues/Auswärtsinfos | ☐ DB/Seeds | ☐ OSM/Verein/Stadion |  | offen |  |  |  |

> **Betriebsentscheidung:** Lieber ehrlich eingeschränkt und aktuell gekennzeichnet als scheinbar vollständig. Live-Verifikation ist vor breitem Launch zwingend abzuschließen.
