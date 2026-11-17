# Skill-Policy – KumpelApp

> Stand: 2026-11-17. Verbindliche Ergänzung zu `AGENTS.md` im Projektroot und zur globalen `AGENTS.md`.
> Installierte Skills: `.agents/skills/` (projektlokal, kopiert), Lockfile: `skills-lock.json`.
> Aktualisieren mit `npx skills update` / `npx skills add <owner/repo@skill> -a opencode -y`.

## 1. Grundsatz

Ein Skill ist ein Arbeitsmodus mit Anweisungen – kein Automationstrip. „Alle Skills sinnvoll nutzen“ bedeutet:

- **Passung vor Menge:** höchstens ein primärer Domänen-Skill plus 1–2 Querschnitts-Skills pro Aufgabe.
- **Prozess vor Domain:** `using-superpowers` regelt den Check; Prozess-Skills legen das *Wie* fest, Domänen-Skills das *Was*.
- **Ankündigen und umsetzen:** geladener Skill wird benannt; seine Checkliste wird zur Todo-Liste.
- **Repo ist Wahrheit:** `webapp/AGENTS.md`, `node_modules/next/dist/docs/`, `packages/*/package.json`, `README.md`, `plan.md`, `docs/` stehen vor Skill- und Trainingswissen.
- **Keine Skill-Übung:** Erkenntnisse landen in echten Dateien, Tests oder Entscheidungen – nicht in Wegwerfbeispielen.

## 2. Prozess-Skills – Reihenfolge

| Phase | Skill | Einsatz | Grenze |
|---|---|---|---|
| Skill-Check | `using-superpowers`, `find-skills` | Vor jeder Aktion prüfen; bei Bedarf neuen Skill suchen | `find-skills` installiert nur nach Qualitätsprüfung |
| Idee / Anforderung | `brainstorming` → `feature-forge` | Neues Feature, Verhalten, PRD, User Stories, EARS | Nicht für reine Bugfixes |
| Architektur | `architecture-designer` | Neue Systemgrenzen, ADRs, Skalierungsentscheidungen | Nur bei echter Architekturarbeit, nicht für kleine Refactors |
| Planung | `writing-plans` → `executing-plans` | Mehrschrittige Umsetzung im aktuellen Session | Bei unabhängigen Tasks: `subagent-driven-development` / `dispatching-parallel-agents` |
| Implementierung | `test-driven-development` | Feature oder Bugfix mit Test zuerst | Kein TDD-Theater: Test muss Verhalten schützen |
| Debugging | `systematic-debugging` → `debugging-wizard` | Fehler, Crash, Log, Stacktrace, Root Cause | Hypothesis → Evidenz → Fix; nie raten |
| Abschluss | `verification-before-completion` | Behauptung „fertig/passing“ nur mit Commands und Output | `pnpm typecheck && pnpm lint && pnpm test` |
| Review | `requesting-code-review` → `code-reviewer` → `receiving-code-review` | PR vorbereiten, prüfen, Feedback technisch verifizieren | Feedback nicht blind übernehmen |
| Integration | `finishing-a-development-branch` | Merge/PR-Entscheidung nach grünen Checks | – |
| Isolation | `using-git-worktrees` | Featurearbeit mit sauberer Arbeitskopie | Nur auf expliziten Wunsch oder bei Bedarf |
| Risiko | `the-fool` | Pre-Mortem, Red Team, kritische Review Entscheidungen | Nicht als Dauer-Modus |
| Doku | `code-documenter`, `writing-guidelines` | OpenAPI, JSDoc, Guides, Prosa-Review | Fachinhalte aus `docs/` übernehmen |

## 3. Domänen-Skills nach Layer

### 3.1 Next.js / React / TypeScript

| Skill | Wann | Hinweis / Grenze |
|---|---|---|
| `nextjs-developer` | Jede Änderung an `webapp/src/app/**`, Routing, RSC, Server Actions | **Vorher** `webapp/AGENTS.md` und `node_modules/next/dist/docs/` lesen – Next 16.4.5 hat Breaking Changes |
| `next-dev-loop` | Laufende App vorhanden; Verhalten im Browser verifizieren | Benötigt `next dev`; nicht als Ersatz für Unit-Tests |
| `next-bundle-optimizer` | Langsame Routen, großer Client-Bundle, doppelte Dependencies | Nur mit messbarem Anlass (Phase E4 / Performance-Budgets) |
| `next-cache-components-adoption` | Explizite Adoption von `cacheComponents`, Blocking-Prerender-Fehler | nicht automatisch Flags umschalten; vorher `next.config.ts` prüfen |
| `next-partial-prefetching-adoption` | Explizite Adoption von `partialPrefetching`, `instant()`-Tests | nur mit Adoptionswunsch, nicht als Default |
| `react-expert`, `javascript-pro`, `typescript-pro` | Hook-/Render-Probleme, RSC/Suspense, strikte Typen | Keine `any`-Slips; `tsconfig` des Pakets beachten |
| `vercel-composition-patterns` | Compound Components, Render Props, Context, Boolean-Prop-Wildwuchs | Bevorzugt bei wiederverwendbaren UI-APIs |
| `vercel-optimize` | Vercel-Kosten/Performance, Core Web Vitals, Function Invocations | **Nur metrikbasiert** – Skill verlangt Metriken und Code-Scan |

### 3.2 UI, UX, Barrierefreiheit

| Skill | Wann | Hinweis / Grenze |
|---|---|---|
| `frontend-design` | Neue Seiten/Komponenten, bewusste Gestaltungsrichtung | Dark-first, Touch-Ziele im Stadion, keine generischen Templates |
| `ui-ux-pro-max` | Palette, Typografie, Layout, Patterns, responsive Entscheidungen | Designsystem von `packages/ui` respektieren |
| `shadcn` | Komponenten hinzufügen/fixen/stylen, `components.json`, Registry | Radix bleibt die Grundlage; kein automatischer Wechsel zu Base UI |
| `frontend-a11y` | Formulare, Modals, Dropdowns, Tabs, Fokus, Screenreader, A11y-Lint | Pflicht bei Phase E4; Kontrast im Dark Mode prüfen |
| `web-design-guidelines` | Review von UI-Code gegen Best Practices | Ergänzt `frontend-a11y`, ersetzt es nicht |
| `web-quality-audit` | Site-Audit: Performance, A11y, SEO, Best Practices | Vor Launch und nach größeren UI-Änderungen |

### 3.3 Daten, Prisma, PostgreSQL

| Skill | Wann | Hinweis / Grenze |
|---|---|---|
| `prisma-client-api` | Queries, Filter, CRUD, `$transaction`, Client-Konfiguration | Grundkonzepte versionsunabhängig nutzbar |
| `prisma-cli` | `generate`, `migrate`, `db push`, `studio` | Skill ist **Prisma-7-orientiert**; Projekt nutzt `^5.18.0` → Kommandos gegen `packages/db/package.json` prüfen |
| `prisma-postgres-setup` | Echtes neues Postgres-Setup / neue Connection | Nur wenn kein `DATABASE_URL` vorhanden; hier bereits konfiguriert |
| `prisma-postgres` | Nur bei explizitem Aufruf dieses Namens | **Veralteter Kompatibilitäts-Alias** – stattdessen `prisma-postgres-setup` verwenden |
| `prisma-driver-adapter-implementation` | Eigene SQL-Driver-Adapter, Transactions, Savepoints | Prisma-7-Thema; hier nur bei entsprechendem Upgrade/Adapter-Vorhaben |
| `postgres-pro`, `sql-pro`, `database-optimizer` | EXPLAIN, Indizes, langsame Queries, Locking, Partitionierung | Vor Optimierung `EXPLAIN ANALYZE` auf echter Datenlage |
| `api-designer` | REST-/API-Struktur, Versionierung, Pagination, Fehlerstandard | API v1 in `webapp/src/app/api/v1/**` folgt bestehenden Mustern, nicht neu erfinden |

### 3.4 Auth, Sicherheit, Community

| Skill | Wann | Hinweis / Grenze |
|---|---|---|
| `better-auth-best-practices` | `packages/auth/**`, `auth.ts`, Sessions, Plugins, Env | Bestehende Config lesen; keine Neu-Initialisierung |
| `better-auth-security-best-practices` | Rate Limits, Secrets, CSRF, Trusted Origins, Cookies, Audit-Log | Pflicht bei Phase E3 |
| `email-and-password-best-practices` | Login, Sign-up, Reset, Passwortpolicy, Email-Verification | DSGVO: minimale Daten, keine unnötige Persistenz |
| `organization-best-practices` | Gruppen, Rollen, Einladungen, Mitglieder, RBAC | Direkt relevant für `Kumpels`/Gruppen; keine Überstruktur |
| `two-factor-authentication-best-practices` | MFA/TOTP, Backup-Codes, Trusted Devices | Nur wenn 2FA tatsächlich angeboten werden soll |
| `secure-code-guardian`, `security-reviewer`, `fullstack-guardian` | Input-Validation, AuthZ, OWASP, sicherheitskritische Fullstack-Flows | Bei Auth/Ticket/Community immer mindestens einen davon |

### 3.5 API-Contracts, Zod, Doku

| Skill | Wann | Hinweis / Grenze |
|---|---|---|
| `zod` | Neue/geänderte Schemas in `packages/api-contracts`, `safeParse`, `z.infer` | Projekt nutzt `zod ^3.23.0` – v4-spezifische Empfehlungen nicht blind übernehmen |
| `code-documenter` | OpenAPI/Swagger, JSDoc, Guides | Nur dokumentieren, was der Code wirklich tut |
| `spec-miner` | Undokumentierte historische Logik verstehen, Contracts zurückführen | Nur lesend; Ergebnisse in `docs/` festhalten |
| `writing-guidelines` | Review von Docs/Prosa gegen Sprach- und Tonregeln | Deutsch, kurz, direkt – keine Marketing-Floskeln |

### 3.6 Monorepo, Build, Deployment, Betrieb

| Skill | Wann | Hinweis / Grenze |
|---|---|---|
| `turborepo` | `turbo.json`, Task-Pipeline, Caching, Filtering, Env, CI | `pnpm-workspace.yaml` und vorhandene Tasks beachten |
| `devops-engineer` | Docker, CI/CD, Deployment-Automatisierung | docker-compose und bestehende Pipelines zuerst lesen |
| `netlify-frameworks` | Netlify-Build, SSR/Edge-Adapter, Env-Vars, Redirects | Projekt deployt zusätzlich auf Netlify; `netlify.toml` ist Ausgangspunkt |
| `sre-engineer`, `monitoring-expert`, `cloud-architect` | SLOs, Error Budgets, Alerting, Observability, Capacity | Kontext: Sync-Health/Stale-Schwellen aus `plan.md` A3 |
| `vercel-optimize` | Vercel-Kosten/Performance | siehe 3.1 – metrikbasiert |

### 3.7 Cache, Rate-Limit, Push, PWA, Mobile

| Skill | Wann | Hinweis / Grenze |
|---|---|---|
| `upstash-redis-js` | Cache, TTL, Counter, Sorted Sets, Sessions, Leaderboards | `UPSTASH_REDIS_REST_*` aus `.env.example`; serverless HTTP-Client |
| `upstash-ratelimit-js` | Rate Limiting in API-Routes/Middleware, 429, Brute-Force-Schutz | Kombiniert mit `better-auth-security-best-practices` |
| `pwa-development` | Service Worker, Caching-Strategien, Offline, Workbox | `webapp/public/sw.js` und `plan.md` B3 sind Ausgangspunkt; Offline-Fallbacks sichtbar machen |
| `firebase-basics` | **Nur** Firebase-CLI-Login, Projektwahl, Config-Dateien | **Nicht** für FCM-Code, Hosting, Firestore oder Crashlytics verwenden |
| `firebase-crashlytics` | Crash-Reporting einrichten/erweitern | Relevant für Flutter/Mobile; Web nutzt derzeit Umami |
| `flutter-expert` | `apps/mobile` / zukünftige Flutter-Parität | Erst nach stabilen Web-Contracts (plan.md Cross-Cutting) |
| `playwright-expert`, `playwright-best-practices` | E2E, flaky Tests, Page Objects, CI, Offline-Modus, A11y-Tests | `playwright-best-practices` ist die ausführlichere Referenz |

### 3.8 Tests

| Skill | Wann | Hinweis / Grenze |
|---|---|---|
| `test-master` | Teststrategie, Coverage, Testarchitektur, Defect Reports | Dach für Unit/E2E/Performance/Security |
| `test-driven-development` | Jeder Feature-/Bugfix-Implementierung | Rot → Grün → Refactor |
| `vitest` | Unit-/Komponententests in den Workspaces | `vitest run` in `package.json`-Scripts; kein Jest-Modus unterstellen |
| `playwright-expert` / `playwright-best-practices` | Browser-E2E, Offline, Mobile-Layout, Auth-Flows | Siehe 3.7 |

## 4. Versions- und Konfliktregeln

| Thema | Ist-Stand im Repo | Konsequenz für Skills |
|---|---|---|
| Next.js | `16.4.5` | `webapp/AGENTS.md` + `node_modules/next/dist/docs/` sind Pflichtlektüre; keine Next-15-Annahmen |
| React | `19.3.0` | `vercel-composition-patterns` (React-19-Anschnitt) gegenüber Doku prüfen |
| Prisma | `^5.18.0` | Prisma-Skills sind teils v7/v8; keine v7-APIs ungeprüft übernehmen; Upgrade separat planen |
| Better Auth | `^1.0.0` | Plugin-Namen/Optionen gegen installierte Version prüfen |
| Zod | `^3.23.0` | v4-Hinweise des `zod`-Skills nicht ungeprüft anwenden |
| Tailwind | `^4` | Keine v3-Konfigurationsannahmen (`tailwind.config.*`) |
| Cache Components / Partial Prefetching | nicht aktiviert | Adoptions-Skills nur auf expliziten Wunsch anwenden |
| Next.js-Build | `vercel-build` kopiert `.next` ins Root | Bei Build-/Deploy-Änderungen `turborepo` + `vercel-optimize`/`netlify-frameworks` hinzuziehen |

**Konfliktauflösung:** Repo-Dateien > Skill-Inhalte > Trainingswissen. Bei Abweichung im PR kurz dokumentieren.

## 5. Aufnahme neuer Skills

1. `npx skills find <query>` (oder Leaderboard `https://skills.sh/`).
2. Qualitätscheck: offizielle Quelle (`vercel-labs`, `anthropics`, `prisma`, `better-auth`, `shadcn-ui`, `firebase`, `upstash`, …) oder ≥ 1K Installs; GitHub-Sterne/Security-Assessment prüfen.
3. Installation projektlokal: `npx skills add <owner/repo@skill> -a opencode -y`.
4. `skills-lock.json` und diese Datei im selben Commit aktualisieren (Trigger, Grenze, Versionshinweis).
5. Keine Doppelinstallation mit anderem Anbieter ohne klaren Mehrwert; vorhandene globale Skills zuerst prüfen (`npx skills ls -g`).

## 6. Außerhalb des Projekt-Scopes

Skills für andere Stacks (Angular, Vue, Django, Rails, Laravel, PHP, Go, Rust, Kotlin, Swift, Shopify, WordPress, Salesforce, Game/Console, ML-Pipeline usw.) werden **nicht** installiert oder aktiviert, solange das Projekt diese Technologien nicht einsetzt. `console-*` Skills gehören zu einem anderen Projektkontext und bleiben hier ungenutzt.

## 7. Pflege

- Bei Dependency-Updates: `npx skills update`, danach Abschnitt 4 gegenprüfen.
- Bei jeder phasenweisen Planänderung (`plan.md`): Abschnitt 3 auf neue Trigger prüfen.
- Eintrag hier ist nur gültig, wenn der Skill auch tatsächlich installiert ist (`npx skills ls`).
