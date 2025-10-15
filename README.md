# BLUG – Forumplattform

**Utvecklat av:** Team MELNware  
**Projektperiod:** 2025  
**Beskrivning:**  
BLUG är en säker forumplattform där användare kan skapa forum, trådar och inlägg samt hantera moderatorer.  
Systemet har byggts med fokus på robust säkerhet, tydlig REST-arkitektur och rollbaserad åtkomstkontroll.

---

## Innehållsförteckning

1. Projektöversikt
2. Teknisk arkitektur
3. Installation och körning
4. Databasstruktur
5. API-struktur
6. Säkerhet
7. Behörighet (ACL)
8. Rate Limiting
9. Exempel: Testning i Postman
10. Förbättringsmöjligheter
11. Team MELNware
12. Licens

---

## Projektöversikt

BLUG är ett webbaserat forum utvecklat i Node.js och Express, med MySQL som databas.  
Projektets mål var att skapa en realistisk forumbackend med tydlig struktur, säkerhet och åtkomststyrning.

**Funktionalitet:**
- Användarregistrering och inloggning
- Skapa forum, trådar och inlägg
- Rollbaserad åtkomst (ägare, moderatorer)
- Säker autentisering via sessions
- ACL-baserad rättighetskontroll
- API optimerat för integration med frontend (t.ex. React)

---

## Teknisk arkitektur

**Teknisk stack:**
- Backend: Node.js (Express)
- Databas: MySQL (via mysql2/promise)
- Autentisering: express-session
- Säkerhet: Helmet, CORS, CSRF, express-rate-limit, ACL
- Miljöhantering: dotenv (.env)
- Testning: Postman (manuell API-testning)

**Projektstruktur:**
/api
  /admin
  /forums
  /login
  /threads
    /moderators
  /users
acess-list.json
acl.js
apiRegister.js
encryption.js
passwordUsernameValidation.js
server.js

---

## Installation och körning

### Förkrav
- Node.js v18 eller senare
- MySQL-databas igång
- Skapa en .env-fil med databasuppgifter

### 1. Klona projektet
git clone https://github.com/melnware/blug.git
cd blug

### 2. Installera beroenden
npm install

### 3. Konfigurera .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=din_losenord
DB_PORT=3306
DB_DATABASE=blug
SESSION_SECRET=hemlig_nyckel
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

### 4. Starta servern
npm start

Servern körs nu på:  
http://localhost:3000

---

## Databasstruktur

Tabeller:
- admin
- blockedUser
- forum
- post
- privateThread_x_user
- terms
- terms_x_user
- thread
- threadModerator
- user
- user_x_forum 

Relationer:
- En användare kan skapa flera trådar och inlägg.
- En tråd tillhör ett forum.
- En tråd kan ha flera moderatorer.

---

## API-struktur

Alla endpoints använder prefixet /api.

Exempelendpoints:
POST /api/login – Logga in
DELETE /api/login – Logga ut
GET /api/forums – Hämta alla forum
POST /api/forums – Skapa nytt forum
GET /api/threads – Hämta alla trådar
POST /api/threads – Skapa ny tråd
POST /api/threads/:threadId/moderators – Lägg till moderator
DELETE /api/threads/:threadId/moderators/:userId – Ta bort moderator
GET /api/posts – Hämta alla inlägg
POST /api/posts – Skapa nytt inlägg
PATCH /api/posts/:id – Uppdatera inlägg
DELETE /api/posts/:id – Radera inlägg

---

## Säkerhet

BLUG har byggts med ett flerskiktat säkerhetsfokus.

1. Helmet – ger säkra HTTP-headrar och förhindrar XSS, clickjacking och andra attacker.
2. CORS – tillåter endast requests från angiven frontend (t.ex. http://localhost:5173).
3. CSRF-skydd – skyddar mot cross-site request forgery med csurf.
4. Rate Limiting – skyddar mot spam, brute-force och överbelastning.
5. Sessions & Cookies – autentisering sker med express-session. Cookies är säkra.
6. Access Control List (ACL) – styr åtkomst till endpoints baserat på roller.
7. Databassäkerhet – parameteriserade SQL-frågor skyddar mot SQL-injection.

---

## Behörighet (ACL)

ACL hanteras i access-list.json och kontrolleras via acl.js innan varje request.

Roller:
- anonymous – ej inloggad användare
- user – inloggad användare
- * – wildcard (alla)

Om en route saknas i listan returneras 403 Forbidden som standard.

---

## Rate Limiting

Projektet har separata begränsningar beroende på typ av request.

Login: 20 requests / 15 min  
Registrering: 20 requests / timme  
Skapa innehåll: 20 requests / timme  
Delete: 20 requests / 15 min  
Patch: 30 requests / 15 min  

---

## Exempel: Testning i Postman

Registrera användare:
POST http://localhost:3000/api/users

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "secret123"
}

Logga in:
POST http://localhost:3000/api/login

{
  "email": "test@example.com",
  "password": "secret123"
}

Skapa forum:
POST http://localhost:3000/api/forums

{
  "name": "Dog Talk",
  "slug": "dog-talk"
}

Skapa tråd:
POST http://localhost:3000/api/threads

{
  "forumId": 1,
  "title": "Välkommen till forumet!",
  "content": "Första inlägget i vår tråd"
}

Lägg till trådmoderator:
POST http://localhost:3000/api/threads/1/moderators

{
  "newModeratorId": 2
}

---

## Förbättringsmöjligheter

1. Införa rollbaserad access (RBAC) via databas.
2. Validering med Joi eller Zod.
3. JWT-baserad autentisering för mobilintegration.
4. Adminpanel för moderatorer.
5. Automatiska tester (Jest/Supertest).
6. Centraliserad felhantering och loggning (Winston).
7. Databasoptimering med index och pagination.
8. Frontend i React eller Vue.
9. Notiser och rapportering av inlägg.
10. Loggning av säkerhetshändelser.

---

## Team MELNware

| Malin |
| Evelina |
| Linda |
| Nadia |

---

## Licens

Detta projekt är utvecklat av Team MELNware i utbildningssyfte.  
All kod får användas fritt för icke-kommersiella syften enligt MIT-licensen.
