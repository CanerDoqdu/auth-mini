# auth-mini

Auth Mini is a demo-ready Next.js authentication app with signup, login, logout, a protected `/profile` route, signed JWTs stored in HttpOnly cookies, and local JSON persistence that runs without any external services.

## Demo quick start

1. Install dependencies: `npm install`
2. Copy the demo environment file:

```bash
cp .env.example .env.local
```

```powershell
Copy-Item .env.example .env.local
```

```cmd
copy .env.example .env.local
```

3. Start the app: `npm run dev`
4. Open `http://localhost:3000`

Use one of the seeded accounts:

| Username | Password | Email |
| --- | --- | --- |
| `demo` | `demo123` | `demo@authmini.dev` |
| `guest` | `guest123` | `guest@authmini.dev` |

### What `.env.local` does

`.env.example` is already configured for the self-contained demo path:

```bash
JWT_SECRET=dev-secret-change-before-production
# AUTH_USER_STORE_FILE=./data/users.json
```

- `JWT_SECRET` signs the local demo JWTs with a safe non-production default; replace it for any shared or deployed environment.
- `AUTH_USER_STORE_FILE` is optional; if omitted, the app uses `data/users.json`.
- The public demo walkthrough uses the canonical route story: `/login` -> `/signup` -> `/profile`.

## Exact presentation walkthrough

1. Start on `/` to show the seeded credentials and the JWT-in-HttpOnly-cookie story.
2. Open `/login`, click **Use demo account**, and sign in as `demo / demo123`.
3. Land on `/profile` to show the protected route, seeded account details, and JWT-backed session state.
4. Open `/signup`, create a fresh account, and show that the app signs the user in immediately with the same session contract.
5. Refresh `/profile` to prove the JWT cookie survives navigation.
6. Click **Log out securely** to clear the JWT cookie and return to `/login`.

## Routes

- `/` - Landing page with demo credentials and the canonical JWT auth walkthrough
- `/signup` - Registration form that creates a user, signs in immediately, and routes to `/profile`
- `/login` - Login form for seeded or newly created users that routes to `/profile`
- `/profile` - Protected route rendered from the current JWT cookie on the server
- `/register` - Compatibility alias for `/signup`
- `/dashboard` - Compatibility alias for `/profile`
- `/api/signup` - Create a user and set the auth cookie
- `/api/login` - Authenticate and set the auth cookie
- `/api/logout` - Clear the auth cookie
- `/api/session` - Validate the auth cookie and return the current user

## Quality commands

```bash
npm run lint
npm run build
npm test -- tests/core/demo-ui.test.ts
npm test -- tests/core/auth.test.ts
npm test -- tests/core/homepage.test.ts
npm test -- tests/core/turn_the_repaired_demo_into_a_safe_handoff_by_adding_route_level.test.ts
```

## Notes

- The app persists users in a local JSON store, so no MongoDB setup is required for the demo.
- Session validation clears stale JWT cookies when the token or user is invalid.
- The homepage remains server-rendered and build-budget checked for the presentation path.
