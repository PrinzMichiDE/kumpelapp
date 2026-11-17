# Plan: Die geilste App für Wismut Aue (FC Erzgebirge Aue Fans)

> **Stand:** 2026-11-17  
> **Projekt:** `kumpelapp` (Turborepo/pnpm, Next.js 16 + React 19 in `webapp/`, Prisma/PostgreSQL, Shared Packages)  
> **Ziel:** Die KumpelApp wird der digitale Lieblingsbegleiter für Veilchen-Fans: **schneller als generische Sport-Apps am Spieltag, emotional näher an Aue/Wismut im Alltag, offline belastbar im Stadion, datensparsam, rechtssicher und im Regionalliga-Nordost-Betrieb zuverlässig wartbar.**  
> **Planungsregel:** Dieser Plan enthält **nur offene/verbleibende Arbeit**. Bereits umgesetzte oder basisvorhandene Bausteine sind dokumentiert und explizit aus dem Umsetzungsbacklog entfernt.

---

## 1. Produktvision & Erfolgskriterien

### 1.1 Vision
**„Alles Wichtige für Aue – vor, während und nach dem Spiel – in einer schnellen, verlässlichen, violett-erdigen Fan-App mit echter Wismut-Seele.“**

### 1.2 Was die App zur „geilsten Aue-App“ macht
| Dimension | Zielbild | Konkretes Erfolgssignal |
|---|---|---|
| **Matchday-Speed** | Nächstes Spiel, Status, Route, Ticket/Stream, Verlegung in Sekunden | Mobil: Start → relevante Info/Aktion in < 10 s |
| **Datenvertrauen** | Jede kernrelevante Datenansicht zeigt Quelle, Stand, Prüfstatus/Fallback | Keine „still veralteten“ Spielplan-/Tabellen-/Guide-Infos |
| **Stadiontauglichkeit** | Dark-first, große Touch-Ziele, klare Aktionen, robuster Offline-Fallback | Stadionmodus/Auswärtsinfos auch bei schlechtem Netz nutzbar |
| **Aue-DNA** | Wismut/Veilchen-Identität, Erzgebirge, Rivalitäten, Tradition respektvoll & korrekt | Timeline/Quiz/Stories werden als Alleinstellungsmerkmal wahrgenommen |
| **Betriebsstabilität** | Saisonwechsel, Datenlücken, Verlegungen ohne Firefighting | Sync-Health, Overrides, Rollover, Runbooks im Alltag belastbar |
| **Recht & Vertrauen** | Datenschutz, Marken/Lizenzen, transparente Quellen | Launch ohne ungeklärte Rechtebasis, minimale Datenspeicherung |

### 1.3 Produktprinzipien
- **Matchday First:** Der kritische Spieltags-Flow hat Vorrang vor Nice-to-have-Features.
- **Capability statt Illusion:** Nur zeigen, was Quellen wirklich liefern (Events vs. Ergebnis-only vs. keine Live-Daten).
- **Bündeln, nicht kopieren:** Offizielle Angebote (Ticketshop, Verein, Streams) verlinken und mit Kontext/Offline-Nutzen anreichern.
- **Transparenz als Feature:** Quelle/Stand/Prüfstatus/Korrekturhinweis gehören zur UX.
- **Datensparsam by default:** Besonders bei Tickets, Mitfahrten, Push, Profil und Community.

---

## 2. Intensive Recherche (Wismut/Aue, Fans, Wettbewerb, Betrieb)

> Recherche-Stand: 2026-11-17. **Live-Fakten (Kader, Spielstände, Tabelle, Ansetzungen, Streams, Preise, Kontingente, Personalien)** ändern sich laufend und müssen vor Produktivanzeige tagesaktuell verifiziert werden.

### 2.1 Verein, Identität & historische DNA (Wismut/Veilchen)
| Erkenntnis | Relevanz für „geilste App“ | Produktimplikation |
|---|---|---|
| **FC Erzgebirge Aue e. V.** („Veilchen“, lila-weiß), Traditionslinie ab 1946; starke Verwurzelung in Aue-Bad Schlema/Erzgebirge | Identität ist Kern der Bindung, nicht nur Sportdaten | Aue-zentrierte Sprache, violett-erdiges Design, lokale Bezüge, klare Traditionssektion |
| **Wismut-Erbe** prägt Fanidentität bis heute (historische Namen/Epochen, Bergbau-Bezug) | Emotionaler USP gegenüber generischen Ergebnis-Apps | Kuratierte Wismut-Storys, Zeitleiste, Legenden, respektvoller Kontext statt Folklore-Kitsch |
| **Große Erfolge:** DDR-Meister **1956, 1957, 1959** (als SC Wismut Karl-Marx-Stadt), **FDGB-Pokalsieger 1955**; starke Oberliga-Tradition (39 Jahre ununterbrochen in DDR-Oberliga bis 1989/90 laut historischen Übersichten) | Einzigartige, stolz kommunizierbare Historie | „Heute in der Aue-Geschichte“, Titel-/Meilenstein-Cards, Quiz-Kategorien, Quellen/Attribution |
| **Namens-/Stadiongeschichte:** u. a. Otto-Grotewohl-Stadion, seit 1991 Erzgebirgsstadion; seit 2025 Vermarktungsname **eins Erzgebirgsstadion** (Traditionsname bleibt) | Authentizität und Aktualität wichtig | Offizielle/aktuelle Bezeichnungen korrekt verwenden, historisch einordnen |
| **Stadion:** eins Erzgebirgsstadion, **Gerd-Schädlich-Platz 1, 08280 Aue-Bad Schlema**, Kapazität **~15.500** (je Quelle Stand/Verteilung prüfen) | Heimspiel-Logistik zentral | Matchday-Card mit Adresse, Anreise, Einlass/Sektor-Hinweisen, Barriereinfos, Offline-Snapshot |

**Kerninsight:** Die App gewinnt nicht durch „noch ein Live-Score“, sondern durch **verlässliche Matchday-Hilfe + stolze, korrekt kuratierte Wismut/Aue-Identität**.

### 2.2 Sportliche Lage & RLNO-Realität (2026/27)
| Thema | Recherche-Erkenntnis | Konsequenz für die App |
|---|---|---|
| **Liga-Umfeld** | Nach Abstieg aus der 3. Liga **2025/26** Neustart in der **Regionalliga Nordost 2026/27**; emotionale Phase mit hoher Loyalität und Erwartungsdruck | Tonalität: Aufbruch/Realismus, keine falschen Versprechen; Fokus auf Spieltag, Nähe, Verlässlichkeit |
| **Faninteresse** | Öffentliche Berichte zeigen sehr starken Zuschauerzuspruch in Aue (u. a. hohe Heimspiel-Schnitte in der RLNO-Hinrunde 2026/27) | App muss Spitzenlasten am Spieltag aushalten (Performance, Caching, robuste Kernrouten) |
| **Datenheterogenität** | RLNO-Daten (Spielplan, Status, Tabelle, Events, Streams) je Quelle unterschiedlich vollständig/verzögert | Feld-/matchbezogene Capabilities, Fallbacks, „zuletzt geprüft“, manuelle Overrides |
| **Spieltagsdynamik** | Kurzfristige Änderungen (Anstoß, Platz/Wetter, Verband, Sicherheit) realistisch | Änderungsbadges, Push „verlegt/abgesagt“, sichtbare Korrekturhistorie |
| **Medien/Streams** | Übertragungen oft fragmentiert (kein einheitliches Liga-Ökosystem) | Streams nur als **kuratierte, datierte Links** mit extern-Hinweis; keine Vollständigkeitsgarantie |

### 2.3 Zielgruppen & Jobs-to-be-done
| Persona | Kontext | Wichtigste Jobs | Was die App liefern muss |
|---|---|---|---|
| **Dauerkarten-Kumpel** | Heimspiel-Routine, kurz vor Anpfiff mobil | Anstoß/Verlegung, Einlass, Ticket, Route, schneller Status | Stadionmodus, verlässliche Pushs, Offline-Kerninfos |
| **Auswärtsfahrer** | Bus/Bahn/Auto, Planung & Matchday | Stadion finden, Gästeblock, Parken/ÖPNV, Einlass, Distanz, Wetter | Verifizierte Venue-Guides mit Prüfstatus/Quelle |
| **Wismut-Traditionalist** | Identität, Erinnern, Weitergeben | Titel/Meilensteine erleben, Wissen testen | Timeline, „Heute in der Aue-Geschichte“, kuratiertes Quiz |
| **Digitaler Mitläufer** | Nutzt kicker/FotMob parallel | Score, Tabelle, Form, News schnell prüfen | Kompaktes Matchcenter, klare Statuskommunikation |
| **Exil-Veilchen** | Außerhalb der Region/andere Zeitzone | Termine planen, verfolgen, Stream finden | Kalender/ICS, lokale Zeitklarheit, Stream-/Ergebnis-Fokus |
| **Familie/Nachwuchs** | Gelegentliche Besuche, gemischte Bedürfnisse | Orientierung, Barrierefreiheit, Angebote | Klare Navigation, sichere/verständliche Hinweise, Fan-Angebote |

### 2.4 Wettbewerbs- & Best-Practice-Recherche (Benchmarks)
| Benchmark | Stärken | Lücke aus Aue-Sicht | Übertragbare Learnings für KumpelApp |
|---|---|---|---|
| **OneFootball** | Schnelle Scores/News, Personalisierung, gute Mobile-IA | Generisch, wenig Stadion-/Auswärtslogistik, wenig RLNO-Tiefe | Priorisierte Startfläche, klare Cards, starke Empty/Fallback-States |
| **FotMob** | Starkes Matchcenter, Tabellen/Stats, kompakte Darstellung | Keine Aue-DNA, keine praktische Auswärts-/Offline-Logistik | „Alles zum Spiel“ bündeln, kompakte Module, Form/Status gut lesbar |
| **kicker** | Deutsche Fußballkompetenz, klare Ergebnis-/Tabellenstruktur | Kein persönlicher Fan-Begleiter, kein Stadionmodus | Statusklarheit, Informationshierarchie, verlässliche Ergebnisdarstellung |
| **FUSSBALL.DE** | Verbandsnahe Referenz im Amateur-/Spielbetrieb | UX nüchtern, kein Fan-Erlebnis | Als Referenz/Deep-Link/Fallback in Datenstrategie einplanen |
| **Profi-/Vereinsapps (z. B. Bundesliga-Ökosystem, Top-Clubs)** | Push, Personalisierung, Ticket-Wallet/Wallet-Nähe, Spieltags-Companion, Interaktion | Ressourcenvorteil, nicht 1:1 auf RLNO übertragbar | „Premium im Kleinen“: granulare Pushs, Matchday-Hub, Spieltags-Wizard, personalisierte Shortcuts |
| **Tippspiel-/Auswärts-Tools (Best Practices)** | Live-Ranglisten, faire Punkte, Gruppenfeatures; Awayday-Planung (Routen/Checklisten) | Oft generisch oder nicht Aue-spezifisch | Fairness/Transparenz im Tippspiel, Auswärts-Checklisten, datensparsame Koordination |

**Differenzierungsformel:** `Aue-spezifische Matchday-Nützlichkeit × Wismut/Veilchen-Identität × verifizierte Datenprozesse & Transparenz`.

### 2.5 Recht, Marke, Medien & Datenschutz (Leitplanken)
| Thema | Leitplanke | Konkrete Maßnahme |
|---|---|---|
| **Marken/Namen/Wappen** | „FC Erzgebirge Aue“, Vereinswappen/geschützte Begriffe können freigabepflichtig sein | Vor öffentlichem Launch schriftliche Klärung; neutrale Branding-Option technisch vorhalten |
| **Medien/News/Streams** | Urheber-/Lizenzrechte bei Volltexten, Bildern, Grafiken, Streams beachten | Teaser + Deep-Link bevorzugen, Lizenz/Attribution je Quelle dokumentieren, keine ungeklärten Embeds/Übernahmen |
| **Ticketdaten (PDF/QR/Barcode)** | Potenziell sensible Zugangs-/personenbezogene Daten | Datenminimierung, lokale/kurzlebige Verarbeitung bevorzugen, keine unnötige Persistenz von Rohdaten/Barcodes |
| **Community/UGC** | Gruppen, Tipps, Fahrten, Check-ins erzeugen Risiken | Opt-in, minimale Felder, Rollen, Melden/Löschen, Moderation, Safety-Hinweise |
| **Push/Analytics** | Einwilligung, Zweckbindung, Widerrufbarkeit | Granulare Opt-ins, Ruhezeiten, einfache Abmeldung, datensparsame Messung |

---

## 3. Bereits umgesetzt / basisvorhanden (explizit aus dem Plan entfernt)

> Diese Punkte sind **nicht** erneut als neue Feature-Idee zu planen. Offene Arbeit dazu steht nur in Abschnitt 5 als **Verifikation/Härtung/Vervollständigung**.

### 3.1 Produkt & App-Struktur
- Monorepo-/Projektfundament (Turborepo, pnpm, Shared Packages, Prisma-Schema, API-Struktur) vorhanden.
- Umfangreiche Web-Routen vorhanden (u. a. Start, Spielplan, Tabelle, Saison, Gegner, Matchdetail, Stadien, Auswärts, Kader, News, Tradition, Quiz, Verein/Fans-Unterseiten, Kalender, Tickets, Login/Register/Profil/Einstellungen, Tippspiel, Kumpels inkl. Mitfahrten, Check-ins, Sammler, eigene Stimmen/Tipps, Offline/Quellen/Legal).
- PWA-Basis vorhanden (Manifest, Icons/Shortcuts, SW-Registrierung, Offline-Route).
- Admin-Bereich vorhanden (Dashboard + Bereiche für Sync, Matches, Teams, Venues, Tradition, Contacts, Links, Departments, Fanclubs).

### 3.2 Daten, Sync & Betrieb (Basis)
- API-v1- und Domänenstruktur vorhanden (Matches/Standings/Season, News/Streams/Venues/Squad, Tradition/Quiz, Tickets/Calendar, Sync/Admin-Sync, Gruppen/Tipps/Rides/Votes/Attendance/Favorites/Push-Preferences/Notifications etc.).
- Sync-/Ingest-Infrastruktur und Seeds/Skripte vorhanden (u. a. Venues, Tradition, Quiz, Kader, News, Streams, Tickets, Away-Info, Season-Rollover).
- Betriebsdokumente vorhanden (`docs/source-matrix-rlno-2026-27.md`, `docs/sync-runbook.md`, `docs/season-rollover-checklist.md`) als Startpunkt.
- Source-Sync-/Audit-Log-Strukturen im Datenmodell vorhanden.

### 3.3 UX-/Qualitätsbausteine (Basis)
- Service Worker mit Caching/Warmup/Fallback-Ansätzen und Outbox-Background-Sync-Handlern vorhanden.
- Transparenz-/Metadaten-Komponente (`DataMeta`) für Quelle/Stand/Review-Status als Basis vorhanden.
- Dark-first UI-Fundament und modulare Seitenstruktur vorhanden.

**Wichtig:** „Basis vorhanden“ ≠ „produktionsreif“. Genau deshalb fokussiert der Restplan auf Verifikation, Konsistenz, Robustheit und Qualität.

---

## 4. Lücken & Chancen (nur offene Punkte)

### 4.1 P0 – Datenwahrheit, Transparenz & RLNO-Betrieb
- **Reale Source-Verifikation:** OpenLigaDB/Fallbacks je Feld für RLNO 2026/27 live prüfen (Abdeckung, Latenz, Fehlerbild, Feldmapping) und dokumentieren.
- **Transparenz durchgängig:** Einheitliches Quelle/Stand/Prüfstatus/Fallback-Pattern konsistent auf allen kernrelevanten Ansichten (Match, Spielplan, Tabelle, Saison, Auswärts/Venues, News, Streams, ggf. Kader).
- **Override- & Korrekturfluss end-to-end:** Verlegung, Kickoff, Status, Ergebnis, Venue-Hinweise, Stream-Links inkl. Validierung, UI-Wirkung, Audit-Sichtbarkeit.
- **Sync-Observability:** Stale-Schwellen, Fehlerklassen, Admin-Health, klare „nächste Aktion“, ggf. Alarm-/Runbook-Pfade.
- **Saison-Rollover als Routine:** Teams/Gegner, Venue-Mapping, Seeds, Prüfstatus-Resets, Archivierung, Go-Live-Checks pro Saison.

### 4.2 P0/P1 – Matchday-Exzellenz & Offline-Verlässlichkeit
- **Stadionmodus 2.0:** Von Info-Seite zu 1-Tap-Spieltagshub (nächste Aktion, Route/Ticket/Stream, Änderungspriorität, Heim/Auswärts-Kontext).
- **Ehrliche Live-Capability-UX:** Strikte Unterscheidung `events_available` / `result_only` / `no_live_data` / `stale` / `manual_corrected`.
- **Offline-Kernflows härten:** Verlässliche Snapshots/Caching + sichtbares Sync-/Stale-Feedback für Start/Stadionmodus, Spielplan, Tabelle, Matchdetail, Auswärts.
- **Pre-/Post-Match-Nutzen:** Kompakte Vorschau, Spieltags-Hinweise, Recap, „nächstes Spiel“ als klare, priorisierte Cards.

### 4.3 P1 – Auswärtsfahrer-Pro (verlässlicher USP)
- **Venue-Verifikationspass:** RLNO-Venues redaktionell prüfen (Adresse, Gästeblock, Einlass, Parken, ÖPNV, Barriere, relevante belegbare Hinweise) mit Quelle/Prüfdatum.
- **Praxis-Module:** Checklisten, Distanz/Fahrzeit-Kontext, Route-/Wetter-Deep-Links, prominenter „zuletzt geprüft“-Status.
- **Sicherheitsbewusste Qualität:** Nur belegbare, neutrale Infos in kritischen Feldern; ungeprüfte Angaben klar kennzeichnen.

### 4.4 P1 – Personalisierung, Push & Kalender
- **Push-Reife:** Granulare Kategorien (Anstoß, Tor, HT/FT, Ergebnis, Verlegung, News), Ruhezeiten, Frequenzlimit/Dedupe, Test-Push/Diagnose.
- **Fan-Typ-Onboarding (optional):** Dauerkarte, Auswärts, Exil, Tradition, Familie → priorisierte Startkarten/Shortcuts/Push-Vorschläge.
- **Kalender-Komfort:** ICS Einzelspiel & Abo/Feed, Erinnerungs-UX, Zeitzonenklarheit (DE/lokal), einfaches Teilen.

### 4.5 P1/P2 – Community, Fairness & Moderation
- **Tippspiel Pro:** Automatische Auswertung nach finalem Import, nachvollziehbare Punkte-/Regelhistorie, Gruppen-/Saisonwertung, Edge-Cases (verlegt/abgesagt/nachgetragen).
- **Gruppen-Härtung:** Rollen/Rechte, Einladungs-/Beitritts-/Leave-Flows, robuste Empty/Error-States.
- **Mitfahrbörse verantwortungsvoll:** Melden/Löschen, minimale Kontaktdaten, Safety-Copy; **kein** Chat/Live-Ortung im MVP.
- **Veilchen-Sammler (optional, datensparsam):** Private Besuche/Saisonrückblick als Langzeitbindung.

### 4.6 P1 – Tradition, Quiz & Content-Differenzierung (Wismut-USP)
- **Wismut/Veilchen-Chronik vertiefen:** 1946, 1955, 1956/57/59, Europapokal-Ära, Wende/Neuaufbau, Auf-/Abstiege, 2026-Neustart – kuratiert mit Quellen/Attribution/Lizenzstatus.
- **Wiederkehrende Formate:** „Heute in der Aue-Geschichte“, Derby-/Rivalen-Kontext (u. a. Chemnitz, Zwickau) faktisch & deeskalierend.
- **Quiz-Qualität:** Faktencheck, Kategorien/Schwierigkeit, Duplikatprüfung, Review-Workflow, faire Statistik/Serien.
- **News-Kuration:** Dedupe, Themenfilter, klare Teaser+Deep-Link-Policy, sichtbare Quellen/Zeit.

### 4.7 P1/P2 – Tickets, Wallet & sensible Daten
- **Ticket-Import robuster:** Mehr PDF-Layouts/Golden-Files, Fehlerklassen, manuelle Korrektur-UX, nachvollziehbarer Parse-Status.
- **Wallet realistischer Scope:** Nur unterstützte/verlässliche Fälle; ansonsten starke „PDF/QR sicher griffbereit“-Assistenz statt falscher Versprechen.
- **Sensible Daten minimieren:** Speicherung von QR/Barcode/Rohtext nur wenn zwingend, mit Schutz, Zugriffskontrolle und Löschpfaden.

### 4.8 P0/P1/P2 – Barrierefreiheit, Performance, Recht & Launch-Readiness
- **A11y-Audit & Fixes:** Kontrast (Dark Mode), Fokus, Tastatur, Screenreader, Reduced Motion, Touch-Ziele.
- **Konsistente Zustände:** Einheitliche Loading/Empty/Error/Fallback-Komponenten inkl. Handlungsoption.
- **Performance-Budgets:** Mobile Ladezeiten, Bild-/Payload-Optimierung, effiziente Queries/Caching.
- **Markenfreigabe & Lizenzregister:** Name/Logo/Wappen, Daten-/Medienquellen, Attribution/Deep-Link-Regeln dokumentiert.
- **Security/Privacy-Härtung:** AuthZ-Reviews, Rate Limits, Input-Validation, Log-Redaktion, DSGVO-Flows (Auskunft/Löschung/Einwilligungen).

---

## 5. Zielbild-Features & offener Umsetzungsplan (nur verbleibende Arbeit)

### Phase A – P0: Datenwahrheit & Betrieb (Fundament)
| Paket | Maßnahmen (offen) | Deliverables | Abnahme |
|---|---|---|---|
| **A1. RLNO-Source-Audit real** | OpenLigaDB `rlno` + Fallbacks 2026/27 je Feld prüfen (Spielplan, Status, Ergebnis, Tabelle, Events, Streams); Latenz/Fehler/Coverage dokumentieren | Aktualisierte Source-Matrix, Capability-Mapping, Verifikationsprotokoll | Primär/Fallback/Update-Strategie pro Kernfeld definiert & belegt |
| **A2. Transparenz durchgängig** | Einheitliches Meta-/Status-Pattern auf Kernseiten konsistent ausrollen | Umgesetzte UI-Pattern + Abdeckungsliste | Nutzer erkennt überall Quelle/Stand/Prüfstatus/Fallback |
| **A3. Sync-Observability** | Stale-Schwellen, Fehlerklassen, Admin-Health, Runbook-Pfade/„nächste Aktion“ | Health-Ansichten/Indikatoren, Runbook-Erweiterung | Stale/Fehler sind sichtbar und handlungsfähig |
| **A4. Overrides & Audit end-to-end** | Validierte Admin-Flows für Verlegung/Kickoff/Ergebnis/Venue/Stream; UI-Wirkung & Audit-Nachvollziehbarkeit | Geprüfte Override-Workflows + Tests/Checkliste | Kritische Korrektur in Minuten möglich & transparent |
| **A5. Saison-Rollover-Routine** | Rollover/Seeds/Prüfstatus-Reset/Archivierung als wiederholbarer Prozess | Belastbare Checkliste + Routineablauf | Saisonstart ohne manuelle Dateninkonsistenzen |

### Phase B – P0/P1: Matchday-Exzellenz & Offline
| Paket | Maßnahmen (offen) | Deliverables | Abnahme |
|---|---|---|---|
| **B1. Stadionmodus 2.0** | Matchday-Aggregation, priorisierte Aktionen, Änderungslogik, Heim/Auswärts-Kontext | Überarbeiteter Stadionmodus + Snapshot-Konzept | 1-Tap-Nutzen mobil; klare Fallbacks bei Teildaten/Offline |
| **B2. Live-Capability UX** | Match-/Quellbasierte Feature-Detection und adaptive Darstellung | Adaptive Match-/Live-Komponenten | Keine irreführenden leeren Live-Ansichten |
| **B3. Offline-Kernflows** | Snapshot-/Cache-Strategie, Sync-Feedback, Outbox-Status sichtbar/verlässlich | Verbesserte SW-/Client-Strategie + UI-Feedback | Kernspieltag offline wiederaufrufbar & verständlich |
| **B4. Kalender & Teilen** | ICS Einzelspiel/Abo, Teilen von Spiel/Auswärts, Zeitzonen/Erinnerungskommunikation | Verbesserte Kalender-/Share-UX | Termine zuverlässig speicher-/teilbar |

### Phase C – P1: Auswärts, Tradition & Content-Qualität
| Paket | Maßnahmen (offen) | Deliverables | Abnahme |
|---|---|---|---|
| **C1. Auswärts-Verifikationspass** | Redaktionelle Prüfung aller relevanten RLNO-Venues; Quellen/Prüfdatum/Status pflegen | Verifizierte Venue-Daten + Review-Workflow | Kein kritischer Guide ohne nachvollziehbaren Prüfstatus |
| **C2. Auswärtsfahrer-Tools** | Checklisten, Distanz/Fahrzeit, Route-/Wetter-Links, Saisonübersicht | Erweiterte Auswärts-Module | Auswärtsplanung weitgehend in der App möglich |
| **C3. Wismut/Veilchen-Content** | Timeline/Story-Cards/„Heute in der Aue-Geschichte“, Derby-/Rivalen-Kontext | Kuratierter Traditionsbereich | Korrekt, emotional, quellengesichert, lizenzkonform |
| **C4. Quiz-Qualität** | Faktencheck, Kategorien/Schwierigkeit, Duplikat-/Review-Prozess | Überarbeiteter Fragenbestand + Pflegeprozess | Vertrauenswürdig und wiederspielbar |
| **C5. News-Kuration** | Dedupe, Themenfilter, bessere Teaser/Sortierung, externe Quellenführung | Verbesserter News-Explorer | Schneller Überblick ohne Urheberrechtsrisiko |

### Phase D – P1/P2: Community, Personalisierung & Bindung
| Paket | Maßnahmen (offen) | Deliverables | Abnahme |
|---|---|---|---|
| **D1. Push- & Präferenzsystem** | Kategorien, Ruhezeiten, Test-Push, Dedupe/Frequenzlimit, klare Opt-ins | Reifes Push-/Settings-Erlebnis | Relevant, geringe Störquote, nachvollziehbar steuerbar |
| **D2. Fan-Typ-Onboarding** | Optionales Onboarding, personalisierte Start-/Shortcut-Priorisierung | Personalisierte Home-/Leitpfade | Nutzer finden schneller „ihre“ Module |
| **D3. Tippspiel Pro** | Auto-Auswertung, Punktehistorie, Gruppen-/Saisonlogik, Edge-Cases & Regeln | Konsistente Tippspiel-Logik + UI | Fair, nachvollziehbar, korrekt |
| **D4. Gruppen & Mitfahrten** | Rollen, Einladungen, Melden/Löschen, minimale Daten, Safety-Copy | Moderierbare Community-Flows | Nutzbar mit reduziertem Missbrauchs-/Datenrisiko |
| **D5. Veilchen-Sammler (optional)** | Private Besuche/Saisonrückblick, datensparsam | Opt-in Sammler-Modul | Langzeitnutzen ohne Social-Zwang |

### Phase E – P1/P2: Tickets, Sicherheit, Recht & Launch
| Paket | Maßnahmen (offen) | Deliverables | Abnahme |
|---|---|---|---|
| **E1. Ticket-Parser-Härtung** | Golden-Files/Layouts, Fehlerklassen, manuelle Korrektur, Statuskommunikation | Stabilerer Import-/Korrekturflow | Weniger Fehlimporte, klare nächste Schritte |
| **E2. Wallet realistischer Scope** | Unterstützte Fälle definieren/umsetzen; sonst assistiver Fallback | Verlässliche Ticket-Assistenz | Kein kaputtes Wallet-Versprechen |
| **E3. Security & Privacy** | AuthZ, Rate Limits, Validation, Log-Redaktion, Datenminimierung, Export/Löschung | Umgesetzte Security-/Privacy-Checkliste | Kernrisiken reduziert, sensible Daten minimiert |
| **E4. A11y, QA & Performance** | Audits, Kernflow-Tests, Monitoring/Web-Vitals, Fixes | Audit-/Test-Reports + Fixes | Kernflows robust, inklusiv, schnell |
| **E5. Recht & Markenfreigabe** | Marken-/Lizenzklärung, Quellenregister, Compliance-Doku finalisieren | Freigabe-/Compliance-Unterlagen | Öffentlicher Launch ohne ungeklärte Rechtebasis |

### Cross-Cutting (nach P0/P1-Stabilisierung)
- **Mobile-Parität (Flutter):** Erst nach stabilen Web-Contracts/Datenprozessen; Fokus auf Stadionmodus, Offline, Push, Kerninfos.
- **Keine Feature-Explosion:** Jede neue Idee muss Matchday-Nutzen, Aue-DNA oder Datenvertrauen messbar stärken.

---

## 6. Priorisiertes Backlog (empfohlene Reihenfolge)

1. **A1 + A2** – Source-Audit real verifizieren und Transparenz-Pattern auf Kernseiten durchgängig.
2. **A3 + A4** – Sync-Health/Alerting und Override-/Audit-Flows produktionsreif.
3. **B1 + B2** – Stadionmodus 2.0 und ehrliche Live-Capability-UX.
4. **B3 + B4** – Offline-Kernflows härten und Kalender/Share verbessern.
5. **C1 + C2** – Auswärts-Verifikationspass und Auswärtsfahrer-Tools.
6. **D1 + D2** – Push-System reifen und optionales Fan-Typ-Onboarding.
7. **D3 + D4** – Tippspiel-Fairness/Autoauswertung und Community-Safety/Moderation.
8. **C3–C5** – Wismut-Tradition, Quiz-Qualität, News-Kuration vertiefen.
9. **E1–E3** – Ticket-Parser/Wallet-Scope, Security/Privacy, Datenminimierung.
10. **E4 + E5** – A11y/QA/Performance und Marken-/Rechtefreigaben als Launch-Gates.

**P0-Definition of Done (Minimum vor breiterem Launch):** A1–A4, B1–B3, E5-Grundklärung abgeschlossen; Kernseiten zeigen verlässliche Datenzustände inkl. Fallbacks.

---

## 7. Qualität, Metriken & Risiken

### 7.1 Erfolgsmessung (Kernmetriken)
| Bereich | Ziel | Messung |
|---|---|---|
| Matchday-Utility | Schnell zur relevanten Info/Aktion | Zeit Start → Stadionmodus/Matchinfo, Task-Success |
| Datenvertrauen | Transparente, aktuelle Kerninfos | Anteil Kernansichten mit Quelle/Stand/Status; Stale-Inzidenzen |
| RLNO-Resilienz | Verlegung/Lücken sauber behandelt | Testszenarien: postponement, correction, no-events, stale-source |
| Offline | Kernspieltag brauchbar ohne Netz | Offline-Tests: Start/Stadionmodus, Spielplan, Tabelle, Auswärts |
| Push | Relevant statt störend | Opt-in-Rate, Opt-out, Zustell-/Fehlerquote, Ruhezeiten-Wirksamkeit |
| Community | Fair & moderierbar | Korrekte Auswertung, Regelklarheit, Melde-/Löschpfade |
| Qualität | Stabil, inklusiv, performant | A11y-Checks, Crash-/Error-Rate, Web-Vitals/Budgets |

### 7.2 Risiken & Gegenmaßnahmen
| Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|
| RLNO-Daten lückenhaft/verzögert | Vertrauensverlust | Source-Matrix, Capability-Handling, Fallbacks, Overrides, Zeitstempel |
| Kurzfristige Verlegungen | Nutzer falsch informiert | Änderungsbadges, Verlegungs-Push, Editor-Notes, Override-Runbook |
| Marken-/Lizenzrechte ungeklärt | Launch-/Rechtsrisiko | Frühe Freigabe, neutrale Fallbacks, Lizenz-/Quellenregister |
| Sensible Ticketdaten | Datenschutz-/Sicherheitsrisiko | Datenminimierung, lokale/temporäre Verarbeitung, Zugriffsschutz, Löschung |
| Community-Missbrauch | Moderations-/Sicherheitsproblem | Minimale Daten, Rollen, Melden/Löschen, Safety-Hinweise, Rate Limits |
| Feature-Overload | Wartbarkeit sinkt | Strikte Priorisierung: P0 Datenvertrauen/Matchday zuerst |
| Saisonwechsel bricht Daten | Veraltete Gegner/Venues/Seeds | Rollover-Checkliste, versionierte Seeds, Prüfstatus-Reset |

---

## 8. Quellen & Referenzen (Recherchebasis)

### Projektintern (Ist-Stand/Artefakte)
- `README.md`, `package.json`, `webapp/package.json`, Routen unter `webapp/src/app/**`
- `webapp/public/manifest.json`, `webapp/public/sw.js`, `webapp/src/components/data-meta.tsx`
- `packages/**` (api-contracts, auth, db, domain, ingest, ticket-parser, wallet-pass, ui, utils, firebase-admin)
- `tooling/scripts/**`, `tooling/seed-data/*`
- `docs/source-matrix-rlno-2026-27.md`, `docs/sync-runbook.md`, `docs/season-rollover-checklist.md`

### Verein, Stadion, Historie, Wettbewerb (vor Nutzung live verifizieren)
- FC Erzgebirge Aue (offiziell): https://www.fc-erzgebirge.de  
- eins Erzgebirgsstadion / Stadioninfos: https://www.fc-erzgebirge.de/verein/stadion/erzgebirgsstadion  
- FC Erzgebirge Aue (historischer Kontext): https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue  
- Erzgebirgsstadion (historischer Kontext): https://de.wikipedia.org/wiki/Erzgebirgsstadion  
- BSG/SC Wismut Aue Historie (Kontext): http://m.bsg-wismut-aue.de/index.php/geschichte  
- Vereinskontext/aktuelle Einordnung: https://www.mdr.de/sport/fussball/vereine/vereinsinfos-fc-erzgebirge-aue-100.html  
- Regionalliga Nordost / Spielbetrieb: https://de.wikipedia.org/wiki/Fu%C3%9Fball-Regionalliga_Nordost_(2012), https://www.fussball.de  

### Datenquellen & Lizenzen (projekt-/einsatzbezogen prüfen)
- OpenLigaDB: https://www.openligadb.de  
- OpenStreetMap/ODbL: https://www.openstreetmap.org/copyright  
- Open-Meteo: https://open-meteo.com  

### Wettbewerbs-/Best-Practice-Benchmarks (Produktlernen)
- OneFootball: https://onefootball.com  
- FotMob: https://www.fotmob.com  
- kicker: https://www.kicker.de  
- Sofascore: https://www.sofascore.com  
- Bundesliga App / Matchday-Personalisierung: https://www.bundesliga.com/de/bundesliga/app  
- Stadion-/Vereinsapp-Features (Beispiele/Trends): https://www.stadion.de/blog/beste-stadion-apps-bundesliga-vergleich/ , https://ahoisports.com/module/app  
- Tippspiel-UX/Fairness (Benchmark): https://tippblitz.de/ratgeber/beste-tippspiel-apps  
- Auswärtsplanung (Benchmark-Idee): https://routa.uk/

> **Hinweis:** Externe Quellen dienen der Produkt- und Kontextrecherche. Für produktive Anzeige, redaktionelle Fakten und rechtliche Bewertung sind jeweils aktuelle Primärquellen, Lizenzprüfungen und ggf. Freigaben maßgeblich.
