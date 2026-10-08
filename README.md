# Book API

NestJS API voor gebruikers, boeken, leeslijsten en leesprofielen. Gebruikers en leeslijsten worden opgeslagen in PostgreSQL. De boekencatalogus wordt opgeslagen in MongoDB.

## Vereisten

- Node.js 20 of hoger
- npm
- Een PostgreSQL-database
- Een MongoDB-database

## Lokaal opzetten

1. Installeer de dependencies:

   ```bash
   npm install
   ```

2. Maak in de projectroot een bestand `.env` aan. Dit bestand staat bewust in `.gitignore`.

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   MONGODB_URI="mongodb://USER:PASSWORD@HOST:27017/book-api"
   SECRET="kies-een-lange-lokale-geheime-sleutel"
   PORT=3000
   ```

3. Genereer de Prisma Client en pas de PostgreSQL-database aan:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Start de API in watch mode:

   ```bash
   npm run dev
   ```

   De API is daarna beschikbaar op `http://localhost:3000`.

5. Vul de MongoDB-boekencatalogus optioneel met de meegeleverde dataset:

   ```bash
   node src/scripts/seed-books.mjs
   ```

   Het seed-script stopt als er al boeken zijn. Gebruik `node src/scripts/seed-books.mjs --reset` om de collectie eerst leeg te maken.

## Belangrijkste scripts

| Commando | Doel |
| --- | --- |
| `npm run dev` | API starten met automatisch herladen |
| `npm run start` | API eenmalig starten |
| `npm run build` | TypeScript compileren naar `dist/` |
| `npm run start:prod` | Gecompileerde API starten |
| `npm test` | Unit tests uitvoeren |
| `npm run test:e2e` | End-to-endtests uitvoeren |
| `npm run test:cov` | Tests uitvoeren met coverage |
| `npm run lint` | Oxlint uitvoeren |
| `npm run format` | TypeScript-bestanden formatteren met Prettier |

## Mappenstructuur

```text
src/
  auth/             Registreren, inloggen en JWT-authenticatie
  books/            Boekenmodel en boek-endpoints via Mongoose/MongoDB
  prisma/           Prisma-module, databaseclient en schema voor PostgreSQL
  reading-list/     Eigen leeslijst en leesstatussen
  reading-profile/  Leesniveau, genres, onderwerpen en leesdoel
  roles/            Rollen-decorator en globale rollen-guard
  users/            Gebruikersbeheer en koppeling aan docenten
  main.ts           Bootstrap van de NestJS-applicatie
  app.module.ts     Rootmodule die alle featuremodules samenbrengt
  scripts/          Hulpscripts en seeddata voor de boekencatalogus
test/               End-to-endtests
prisma/migrations/  Gedeelde Prisma-migraties
```

Een featuremodule bevat meestal een module, controller en service. De controller vertaalt HTTP-requests naar method calls; de service bevat de domeinlogica en database-aanroepen. Voor een eenvoudige wijziging aan een endpoint:

1. Pas de controller aan voor route, request-body of response.
2. Pas de bijbehorende service aan voor validatie of database-logica.
3. Voeg of wijzig de unit test naast de service/controller.
4. Draai `npm run format`, `npm run lint` en de relevante tests.

## API-overzicht

De belangrijkste routes zijn:

- `POST /auth/register`, `POST /auth/login` en `GET /auth/profile`
- `GET /books` en `POST /books` (boeken toevoegen is alleen toegestaan voor docenten)
- `GET`, `POST`, `DELETE` en `PATCH` onder `/reading-list`
- `GET /reading-profile/me` en `PUT /reading-profile/me`
- Gebruikers- en docentrelaties onder `/users`

Routes achter authenticatie verwachten een JWT in de header:

```text
Authorization: Bearer <access_token>
```

De exacte requestvelden en autorisatieregels staan in de controllers en services van de betreffende map.

## Databases en Prisma

`src/prisma/schema.prisma` beschrijft de PostgreSQL-modellen `User`, `ReadingListItem` en `ReadingProfile`. Prisma gebruikt `prisma.config.ts` voor de connection string en de migratiemap. Na een wijziging aan het Prisma-schema:

```bash
npx prisma migrate dev --name beschrijf-de-wijziging
npx prisma generate
```

Boeken gebruiken het Mongoose-schema in `src/books/book.schema.ts` en de MongoDB-connection uit `MONGODB_URI`. De seeddata staat in `src/scripts/books.json`.

## Coding style

De code volgt de [NestJS/TypeScript-conventies](https://docs.nestjs.com/techniques/quality) met Prettier als formatter en Oxlint als linter:

- enkele quotes in TypeScript;
- trailing commas waar Prettier die voorschrijft;
- twee spaties voor inspringing;
- expliciete types waar dat de leesbaarheid of typeveiligheid verbetert;
- geen nieuwe `any`-types tenzij daar bewust voor is gekozen;
- promises mogen niet stil worden genegeerd (`typescript/no-floating-promises`).

Deze afspraken zijn vastgelegd in `.prettierrc` en `.oxlintrc.json` en worden uitgevoerd met `npm run format` en `npm run lint`. Draai beide commando's voor een pull request.

## Tests en controle

Een normale controle voor je werk deelt:

```bash
npm run format
npm run lint
npm test
npm run build
```

Voor wijzigingen aan HTTP-routes voeg je ook `npm run test:e2e` toe. De tests gebruiken dezelfde `.env`-variabelen als de applicatie; zorg dat de databases bereikbaar zijn.