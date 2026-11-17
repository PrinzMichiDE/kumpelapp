# Projektregeln – KumpelApp (`wismut`)

Diese Datei ergänzt die globale `AGENTS.md`. Projektsprache ist Deutsch. Fachliche Wahrheit steht in `README.md`, `plan.md` und `docs/`; technische Wahrheit für Next.js steht in `webapp/AGENTS.md` und `node_modules/next/dist/docs/`.

## 1. Skill-Nutzung ist verbindlich, aber zielgerichtet

1. **Vor jeder Antwort und jeder Aktion Skill-Check.** Passt ein Skill zur Aufgabe, wird er *vor* der Arbeit geladen und kurz benannt („Nutze `<skill>` für …“). Siehe `using-superpowers`.
2. **Prozess-Skills vor Domänen-Skills.** Zuerst den Arbeitsmodus festlegen (z. B. `brainstorming`, `systematic-debugging`, `test-driven-development`), dann die fachlichen Skills laden.
3. **Minimales Set.** Pro Aufgabe höchstens **einen primären Domänen-Skill** und **1–2 Querschnitts-Skills**. „Alle sinnvoll nutzen“ heißt: der passende Skill zur passenden Zeit – nicht alle Skills gleichzeitig.
4. **Nach dem Laden follow through.** Hat ein Skill eine Checkliste, wird sie als Todo-Liste umgesetzt. Ein geladener Skill ohne Wirkung ist ein Fehler.
5. **Repo schlägt Skill.** Bei Widerspruch gewinnt der Repo-Stand: `webapp/AGENTS.md` + `node_modules/next/dist/docs/` für Next.js, `packages/*/package.json` für Versionen, `plan.md`/`docs/` für Produktentscheidungen. Abweichungen im PR begründen.
6. **Versionen prüfen.** Skills sind teils neuer als die installierten Dependencies (besonders Prisma, Zod, Next.js). Vor Übernahme von Codeasserts die tatsächliche Version im Repo prüfen. Details: `docs/skill-policy.md`.
7. **Kein Skill ersetzt Recherche.** Erst Dateien/Tests lesen, dann Skill anwenden. Keine Skill-Erkenntnisse in verworfene Beispieldateien schreiben.
8. **Neue Skills** nur nach `npx skills find` + Qualitätsprüfung (offizielle Quelle oder ≥ 1K Installs, Security-Assessment) und mit Aktualisierung von `skills-lock.json` und `docs/skill-policy.md`.

## 2. Kurz-Routing

| Situation | Zuerst | Danach (nach Bedarf) |
|---|---|---|
| Neues Feature, neues Verhalten, Planung | `brainstorming` → `feature-forge` | `writing-plans` → `executing-plans` / `subagent-driven-development` |
| Bug, Crash, Log, Stacktrace | `systematic-debugging` | `debugging-wizard`, Domänen-Skill, `verification-before-completion` |
| Funktion/Bugfix implementieren | `test-driven-development` | Domänen-Skill → `verification-before-completion` |
| PR/Review | `requesting-code-review` | `code-reviewer`, `receiving-code-review`, `security-reviewer` |
| UI, Layout, Design | `frontend-design` / `ui-ux-pro-max` | `shadcn`, `vercel-composition-patterns`, `frontend-a11y`, `web-design-guidelines` |
| Next.js-Änderung | `nextjs-developer` + `webapp/AGENTS.md` | `next-dev-loop`, `next-bundle-optimizer`, `next-cache-components-adoption`, `next-partial-prefetching-adoption` |
| Prisma/Postgres, Query, Migration | `prisma-client-api` | `prisma-cli`, `postgres-pro`, `database-optimizer`, `sql-pro` |
| Auth, Rollen, Gruppen, Sessions | `better-auth-best-practices` | `better-auth-security-best-practices`, `organization-best-practices`, `email-and-password-best-practices`, `secure-code-guardian` |
| API, Zod-Schemas, OpenAPI | `api-designer` | `zod`, `code-documenter` |
| Turborepo, Build, Deploy | `turborepo` | `devops-engineer`, `netlify-frameworks`, `vercel-optimize` |
| Cache, Rate-Limit, Push, PWA | `upstash-redis-js` / `upstash-ratelimit-js` | `pwa-development`, `firebase-basics`, `firebase-crashlytics`, `flutter-expert` |
| Tests | `test-master` | `vitest`, `playwright-expert` / `playwright-best-practices` |
| Risiko, Pre-Mortem, Red Team | `the-fool` | betroffener Domänen-Skill |

**Volle Zuordnung, Ausschlüsse und Versionshinweise:** [`docs/skill-policy.md`](docs/skill-policy.md).

## 3. Qualitäts- und Delivery-Gates

- Vor Abschluss: `pnpm typecheck`, `pnpm lint`, `pnpm test`, bei UI-Änderungen `pnpm build` und `verification-before-completion`.
- Produktionsrelevante Änderungen gemäß globaler `AGENTS.md` nach Vercel **und** Netlify ausrollen; bei Netlify-Problemen `netlify-frameworks`, bei Vercel-Performance `vercel-optimize`.
- Bei jedem Dependency-Upgrade (Next.js, Prisma, Better Auth, Zod, Tailwind): `npx skills update` und `docs/skill-policy.md` gegenprüfen.
