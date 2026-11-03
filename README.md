![CI](https://github.com/Oluwagbenga9999/Teamwork/actions/workflows/ci.yml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/Oluwagbenga9999/Teamwork/badge.svg?branch=develop)](https://coveralls.io/github/Oluwagbenga9999/Teamwork?branch=develop)

# Teamwork API
Internal social network API for employees: articles, GIFs, comments and a combined feed.

- **Live API:** https://teamwork-backend-cyan.vercel.app
- **API docs (Swagger):** https://teamwork-backend-cyan.vercel.app/api-docs
- **Frontend:** https://teamwork-frontend-mauve.vercel.app (repo: Oluwagbenga9999/teamwork-frontend)

## Stack
Node.js, Express 5, PostgreSQL, JWT, bcrypt, Cloudinary (GIF storage), Mocha/Chai/Supertest.

## Run locally
1. `npm install`
2. Create `.env`: `DATABASE_URL`, `TEST_DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Load the schema: `psql "$DATABASE_URL" -f src/db/schema.sql`
4. Create the first admin: `ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seed-admin.js`
5. `npm run dev`; tests: `npm test`

## Endpoints (all under /api/v1)
| Method | Path | Notes |
|---|---|---|
| POST | /auth/create-user | admin only |
| POST | /auth/signin | |
| POST | /articles | |
| GET / PATCH / DELETE | /articles/:articleId | edit and delete: owner only |
| POST | /articles/:articleId/comment | |
| POST | /gifs | multipart: title, image (GIF, max 4MB) |
| GET / DELETE | /gifs/:gifId | delete: owner only |
| POST | /gifs/:gifId/comment | |
| GET | /feed | articles and gifs, newest first |

Auth: send `Authorization: Bearer <token>` (or a `token` header).