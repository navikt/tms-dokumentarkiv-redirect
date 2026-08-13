# tms-dokumentarkiv-redirect

En liten Node.js-tjeneste som videresender gamle Mine saker-lenker til dokumentarkivet.

Tjenesten bruker bare innebygde Node.js-API-er. Den har ingen npm-avhengigheter, byggesteg eller frontend.

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

ID-porten-autentisering håndteres av Nais-sidecaren. Den lokale Node.js-prosessen gjør derfor ingen tokenvalidering.

## Lokal utvikling

Krever Node.js 24 eller nyere.

```sh
npm test
npm start
```

Tjenesten lytter på `http://localhost:3000` som standard. Porten kan endres med miljøvariabelen `PORT`.

Eksempel:

```sh
curl -I http://localhost:3000/mine-saker/tema/dagpenger
```

## Deployment

GitHub Actions kjører den innebygde Node.js-testpakken, bygger Docker-imaget og deployer med Nais. Docker-imaget kopierer bare `server.mjs`; ingen pakkeinstallasjon eller applikasjonsbygging er nødvendig.

## Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.

For Nav-ansatte kan interne henvendelser sendes i Slack-kanalen `#team-personbruker`.
