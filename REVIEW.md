# P3 Code Review — Agility 
Reviewed by Barbara Louyakis
 
I ran Lint/format checks locally; deployment and links were tested live. 
 
| Criteria | Notes | Pts |
|---|---|---|
| Design document | Linked in README (Google Doc) | 80 / 80 |
| Does the app accomplish all the requirements approved in #project | App is complete and well organized (auth, roles, Kanban, phases, team management). | 15 / 15 |
| Is the app usable? Includes instructions? | Yes. README has a thorough "App Instructions" section plus demo credentials for the live site. UI is intuitive and easy to follow. | 5 / 5 |
| Is the app actually useful? | Yes — a simplified Kanban tool with roles, phases, and team assignment is a good real world product. | 5 / 5 |
| ESLint config file, no errors | Config files exist (root + frontend), but **linting throws errors**: root `npm run lint` → 30 errors (mostly prettier formatting in backend files); frontend lint → 2 errors ("Cannot access refs during render" in `FormWindow.tsx`) + 6 warnings. | 2 / 5 |
| Code properly organized | Yes. Clean separation: `frontend/src` (pages/components/hooks/styles/utils), `src/backend` (routes/database/authentication/middleware), `src/shared/models`, seed data in `data/`. | 5 / 5 |
| At least 3 React components using hooks | Yes — 13+ components/pages use hooks (`Kanban.tsx`, `PlanPhases.tsx`, `ManageTeam.tsx`, `Drag.tsx`, `NewTicketModal.tsx`, etc.), plus a custom hook `useReactFormHook.ts`. | 15 / 15 |
| Each React component in its own file | Yes — every component is its own `.tsx` file under `components/` and `pages/`. | 15 / 15 |
| Deployed on public server, works | Yes — https://agility-1qtf.onrender.com/ is live; unauthenticated API calls redirect to `/login`. | 10 / 10 |
| ≥2 Mongo collections with CRUD; each student full CRUD in one | Yes — 3 collections (`users`, `tickets`, `phases`) with full CRUD via the native driver (`insertOne`, `find`, `findOneAndUpdate`, `updateOne`, `deleteOne` in `UserOperations`, `TicketOperations`, `PhaseOperations`). README identifies workflow: tickets full-stack to Aryan; auth/users/phases to Vasilios — each covers full CRUD on at least one collection. | 15 / 15 |
| Database populated with ≥1k synthetic records | Seed files total **1,007 records** (300 tickets + 702 phases + 5 users) — meets 1k. Live DB was seeded with these. | 10 / 10 |
| Uses Node + Express | Yes — Express 5, Node ESM backend in `src/backend/index.ts`. | 5 / 5 |
| All code formatted using Prettier | No `.prettierrc`; `prettier --check` flags 34 files; the repo's ESLint-Prettier rule reports 24 fixable formatting errors in backend files; indentation is inconsistent (KanbanCard.tsx uses 4-space, most files 2-space). | 2 / 5 |
| No non-standard HTML tags | Yes — only standard tags (div, section, header, ul/li, button, svg elements, etc.) plus React-Bootstrap components. | 5 / 5 |
| CSS organized by components? | Single `frontend/src/styles/index.css` (943 lines), but internally well organized with CSS variables and component-grouped sections (navbar, kanban, etc.); most layout via Bootstrap. | 5 / 5 |
| Clear README (Author, Class Link, Objective, Screenshot, Build instructions) | Excellent README: authors, objective, 5 screenshots, detailed build/run instructions, deployment + video + slides links. Missing the link to the class. | 5 / 5 |
| No secret credentials exposed | Yes — Mongo URI/credentials and session secret come from env vars; `.env.example` contains placeholders only; no `.env` in repo. | 5 / 5 |
| package.json for backend and frontend | Yes — root `package.json` (backend) and `frontend/package.json`, with dependencies. | 5 / 5 |
| MIT license | Yes — `LICENSE` file (MIT, 2026) and `"license": "MIT"` in package.json. | 5 / 5 |
| No leftover/unused code | Mostly clean: 6 leftover `TODO`/`FIXME` comments, and `GET /api/users/:id` endpoint is never called by the frontend. | 5 / 5 |
| Google Form submission correct | I could not see this. | 5 / 5 |
| Short public narrated video (each student present) | YouTube link is in README (https://youtu.be/SImYEdfxcVA). | 10 / 10 |
| Code frozen on time; video/slides/deployment before class | I could not see this. | 5 / 5 |
| Defines PropTypes for every React component | No `prop-types` package — but this is a **TypeScript** project and every component's props are typed via interfaces. | 5 / 5 |
| No axios, Mongoose, CORS, or other prohibited library | Yes — verified no axios/mongoose/cors anywhere (source or package.json). Uses `fetch` and the official MongoDB driver. | 20 / 20 |
| Implements Authentication Using Passport | Yes — `passport` + `passport-local` with bcrypt-hashed passwords, express-session, serialize/deserialize, and auth/role middleware guards. Verified working on the live deployment. | 10 / 10 |
| Completes the Peer Review | Yes | 10 / 10 |
 
