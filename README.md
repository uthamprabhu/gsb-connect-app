# GSB Connect (MVP)

GSB Connect is a mobile-first, gamified matchmaking web app. Users sign in with phone OTP, set up profile + unique magic key, send/accept/reject match requests, and reveal Instagram only after mutual acceptance.

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style reusable UI components
- Zustand
- Firebase Auth (Phone OTP only) + Firebase Admin SDK
- MongoDB Atlas + Mongoose
- Framer Motion + Lottie + Canvas Confetti
- Lucide React + React Icons

## Folder Structure

- `app/` - pages and route handlers
- `app/api/` - backend API endpoints
- `components/` - reusable UI
- `lib/` - db/auth/firebase/helpers
- `models/` - Mongoose models
- `store/` - Zustand store

## Step-by-Step Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Firebase setup

1. Create a Firebase project.
2. Enable **Authentication > Sign-in method > Phone**.
3. Add a web app and copy config keys.
4. Create a service account key JSON and copy:
   - `project_id` -> `FIREBASE_PROJECT_ID`
   - `client_email` -> `FIREBASE_CLIENT_EMAIL`
   - `private_key` -> `FIREBASE_PRIVATE_KEY`

### 3) MongoDB Atlas setup

1. Create a free cluster.
2. Create DB user + password.
3. Add your IP in network access.
4. Copy the connection URI into `MONGODB_URI`.

### 4) Fill `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

MONGODB_URI=
APP_SESSION_SECRET=
```

For `FIREBASE_PRIVATE_KEY`, keep new lines escaped (`\n`).

## How Auth Works

1. User enters phone and verifies OTP via Firebase client SDK.
2. Frontend sends Firebase ID token to `/api/auth/verify`.
3. Backend verifies token via Firebase Admin SDK and creates/fetches Mongo user.
4. Backend returns session token for app APIs.
5. Returning users can use `magicKey` in `/api/auth/magic-login` (OTP-free fast login).

## How Matching Works

1. Every user has `attemptsLeft = 3`.
2. `/api/match/find` decreases attempts and looks for candidate by preference/age-range.
3. Excludes blocked + previously matched users.
4. Candidate gets `match_request` notification.
5. Accept -> both users matched + freeze for 48 hours + reveal state enabled.
6. Reject -> blocked so they never match again.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy (Vercel)

1. Push repo to GitHub.
2. Import project in [Vercel](https://vercel.com/new).
3. Add all env variables in Vercel project settings.
4. Deploy.

## Future Improvements

- Daily attempt reset via cron
- Better match scoring using tags
- WebSocket real-time notifications
- Report/abuse moderation flows
- Stronger session security + audit logs
