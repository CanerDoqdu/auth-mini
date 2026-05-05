# auth-mini

Auth Mini is a focused Next.js authentication starter with JWT cookies, MongoDB persistence, a protected profile flow, and a responsive dark-and-gold landing page.

## What ships today

- Signup, login, logout, and session-check API routes
- Cookie-backed JWT auth with shared signing and verification helpers
- Middleware protection for `/profile`
- Server-rendered profile loading for a smoother post-auth transition
- Responsive home hero and proof sections without pointer-tracking rerenders

## Environment

Create `.env.local` with:

```bash
MONGO_URI=your_mongodb_connection_string
# or MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm test -- tests/core/auth.test.ts
```

## Routes

- `/` - Landing page with hero, proof cards, feature grid, and CTA
- `/signup` - Registration form that creates a session and routes to `/profile`
- `/login` - Login form that restores a session and routes to `/profile`
- `/profile` - Protected route rendered from the current session cookie
- `/api/signup` - Create a user and set the auth cookie
- `/api/login` - Authenticate and set the auth cookie
- `/api/logout` - Clear the auth cookie
- `/api/session` - Validate the auth cookie and return the current user

## Notes

- Database connection setup now reuses a cached Mongoose promise.
- Session validation clears stale cookies when the token or user is invalid.
- The homepage keeps the original theme while reducing unnecessary client-side rendering work.
