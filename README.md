# Mondialito — Platfòm jwèt an liy

Platfòm jwèt Mondialito, rebati sou pwòp enfrastrikti li (Node.js + Express +
PostgreSQL + React), san okenn depandans Base44. Achitekti a fèt pou li ka
resevwa lòt jwèt apre Penalti a, chak ak pwòp mòd yo (Tounwa / Fasafas).

## Estrikti pwojè a

```
mondialito-platform/
├── server/     Backend API (Node.js + Express + Prisma + PostgreSQL)
├── web/        Frontend (React + Vite)
└── docker-compose.yml   Òkestrasyon konplè (baz done + backend + frontend)
```

## Demare an lokal (devlopman)

Prerekizi: Node.js 20+, PostgreSQL 16 (lokal oswa Docker), npm.

```bash
# 1. Baz done — pi senp lè l ap kouri nan Docker
docker run -d --name mondialito-db -e POSTGRES_USER=mondialito \
  -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=mondialito -p 5432:5432 postgres:16-alpine

# 2. Backend
cd server
cp .env.example .env
# ranpli DATABASE_URL ak JWT secrets nan .env
npm install
npx prisma migrate dev
npm run seed      # kreye kont admin + jwèt Penalti + yon tounwa/chanm egzanp
npm run dev        # http://localhost:4000

# 3. Frontend (nan yon lòt tèminal)
cd web
npm install
npm run dev        # http://localhost:5173 (pwoksi /api → backend lokal la)
```

## Deplwaman an pwodiksyon ak Docker Compose

Sa a se fason rekòmande a pou yon sèvè/VPS ou deja genyen.

```bash
cd mondialito-platform
cp .env.example .env
# Ouvri .env, ranpli:
#   - POSTGRES_PASSWORD (modpas fò)
#   - JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (chèn alewa long — egzanp: openssl rand -hex 32)
#   - SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (kont admin ou ap itilize pou konekte premye fwa a)
#   - CORS_ORIGIN (domèn sit ou a, egzanp https://mondialito.com)

docker compose up -d --build
```

Sa deklannche:
1. Yon konteneur PostgreSQL ak yon volim pèsistan (`db_data`).
2. Backend la — li aplike migrasyon Prisma yo otomatikman (`prisma migrate deploy`),
   epi li fè seed (kreye kont admin + jwèt Penalti si yo pa egziste — san danje pou
   relanse plizyè fwa, li verifye anvan li kreye).
3. Frontend la bati an fichye estatik epi sèvi pa Nginx, ki redireksyone `/api/*`
   bay backend la otomatikman.

Sit la ap aksesib sou `http://<sèvè-ou>:8080` (chanje `WEB_PORT` nan `.env` si
ou vle yon lòt pò, oswa mete yon reverse proxy/HTTPS devan li — egzanp Caddy
oswa Nginx sou lame ak Let's Encrypt).

Dokiman KYC yo (pyès idantite) estoke nan yon volim Docker separe (`kyc_uploads`)
— yo PA piblik, yo sèvi sèlman atravè yon wout backend ki verifye idantite epi
wòl (pwopriyetè dokiman an oswa yon admin).

Pou wè logs oswa rale ajou kòd yo:
```bash
docker compose logs -f server
docker compose pull && docker compose up -d --build   # apre yon nouvo vèsyon kòd
```

## Kont admin

Premye admin lan kreye otomatikman ak imèl/modpas ki nan `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`. **Chanje modpas sa a imedyatman apre premye koneksyon**
(pa gen fòm "chanje modpas" pou pwòp tèt ou nan kont admin toujou — nou ka
ajoute l apre si sa itil).

## Ajoute yon nouvo jwèt

Achitekti a bati kòm yon sistèm "plugin jwèt" pou respekte objektif orijinal
la (kapasite ajoute lòt jwèt san repran tout platfòm nan):

1. Kreye yon dosye `server/src/games/<slug-jwèt>/index.js` ki ekspòte:
   - `slug`, `name`, `modes` (`['TOURNAMENT']`, `['HEAD_TO_HEAD']`, oswa toude)
   - `headToHead: { initialState(), applyMove(match, userId, moveType, payload) }`
     — lojik jwèt la SÈVÈ-kote (okenn kliyan pa ka ekri yon skò/genyan
     dirèkteman, sa a se korije prensipal odit sekirite a te idantifye).
   - `tournament: { validateTournamentScore(score) }` — kontwòl rezonabilite
     sou skò tounwa yo.
2. Anrejistre plugin nan `server/src/games/registry.js`.
3. Kreye antre `Game` la nan baz done a (atravè seed oswa panno admin — n ap
   ajoute yon fòm kreyasyon jwèt nan panno admin pita si sa nesesè).
4. Frontend lan (`GameCenter.jsx`) deja jenere tuil yo otomatikman pou chak
   konbinezon jwèt × mòd ki soti nan `GET /games` — pa gen okenn kòd frontend
   pou modifye pou jwèt la parèt nan lobi a.

Wè `server/src/games/penalty/index.js` kòm modèl referans.

## Sa ki fèt vs sa ki rete

**Fèt nan migrasyon sa a:**
- Tout depandans Base44 retire (SDK, plugin Vite, imaj/son CDN, OAuth MCP).
- Otantifikasyon pwòp tèt li (JWT + OTP imèl) — ranplase `base44.auth`.
- Balans, skò tounwa, ak rezilta match fasafas kounye a **kalkile ak valide
  sèvè-kote** — okenn kliyan pa ka ekri yo dirèkteman (te idantifye kòm
  vilnerabilite kritik nan odit la).
- Wout admin pwoteje sèvè-kote (`requireAdmin` middleware), pa sèlman UI.
- Verifikasyon laj (18 an) obligatwa nan enskripsyon.
- Paj legal (Kondisyon, Konfidansyalite, Jwèt Responsab).
- Dokiman KYC estoke prive, aksè kontwole.
- Panno admin (tounwa, chanm defi, match an dirèk, rapò/estatistik) rebati
  pou pale ak backend pwòp platfòm nan.

**Rete pou pita (deja klarifye ak ou):**
- Entegrasyon otomatik peman (MonCash/Stripe) — kounye a se admin ki kredite
  depo yo manyèlman apre l verifye resepsyon lajan an, tankou anvan.
- Lòt jwèt aprè Penalti — kad/achitekti a pare (wè seksyon anwo a), men
  okenn lòt jwèt pa t mande pou nou bati kounye a.
- Self-exclusion (oto-esklizyon jwè responsab) — modèl baz done a egziste
  (`SelfExclusion`), men pa gen entèfas itilizatè ankò pou aktive l.
