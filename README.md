# tms-dokumentarkiv-redirect

En liten Node.js-tjeneste som videresender gamle Mine saker-lenker til dokumentarkivet.

Tjenesten bruker Node.js og `@navikt/oasis`. Den har ikke noe byggesteg eller
frontend.

## Ruter

| Fra | Til |
| --- | --- |
| `/mine-saker` | `https://www.nav.no/dokumentarkiv` |
| `/mine-saker/tema/:temakode` | `https://www.nav.no/dokumentarkiv/tema/:temakode` |
| `/mine-saker/tema/:temakode/:journalpostId` | `https://www.nav.no/dokumentarkiv/tema/:temakode/:journalpostId` |

Alle videresendinger bruker HTTP 302.

Helsesjekkene er tilgjengelige på:

- `/mine-saker/api/internal/isAlive`
- `/mine-saker/api/internal/isReady`

Nais-sidecaren håndterer innlogging med ID-porten. Node.js-prosessen validerer
tokenet med `@navikt/oasis` før den videresender brukeren. Manglende eller
ugyldige tokens sendes til Wonderwalls innloggingsendepunkt med opprinnelig
path og query som redirect-mål. Autentisering hoppes over når
`NODE_ENV=development`.

## Lokal utvikling

Krever Node.js 24 eller nyere og tilgang til Navs GitHub Packages-register.

```sh
NODE_AUTH_TOKEN=<github-token> pnpm install
pnpm test
pnpm start
```

Tjenesten lytter på `http://localhost:3000` som standard. Porten kan endres med miljøvariabelen `PORT`.

Eksempel:

```sh
curl -I http://localhost:3000/mine-saker/api/internal/isAlive
```

## Deployment

GitHub Actions installerer avhengigheter med `READER_TOKEN`, kjører testene,
bygger Docker-imaget og deployer med Nais. Imaget inneholder `server.mjs` og
de ferdig installerte runtime-avhengighetene.

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

For Nav-ansatte kan interne henvendelser sendes i Slack-kanalen `#team-personbruker`.
