# ಸಪ್ನಾ ಫಿಟ್ನೆಸ್ · Sapna Fitness

A small, Kannada-first workout PWA for Sapna (45): one body part a day, six days a week, Sunday rest.
No login, no backend — the plan, progress and settings live in the phone's `localStorage`, and progress can optionally be mirrored to Firestore so the family can follow along.

**Live:** https://anishh978-del.github.io/GYM-casual/ · **Family view:** https://anishh978-del.github.io/GYM-casual/?view=family

## What's inside

- **Today** — greeting, today's workout card with a big **ಪ್ರಾರಂಭಿಸಿ / START**, 7-day strip, weekly progress and streak.
- **Day plan** — one exercise card per movement with tap-to-tick completion and a celebration when the day is done.
- **Exercise** — looping demo (photo pair or animated stick figure), set circles, 60-second rest timer with a soft beep, large countdown for timed exercises, steps and a red safety banner.
- **Week** — any week, per-day completion and today marker.
- **Help** — what a set/reps mean, rest and safety, call the trainer (once a phone number is added), image credits.
- **Editor** (⚙️) — PIN-protected planning: edit days and exercises, reorder, change media, edit the profile, cloud sync, export/import JSON, reset to the default plan.
- **Family progress** (`?view=family`) — read-only page that follows the synced progress live.

### Language

The header toggle switches between **ಕನ್ನಡ** and **English**, and the choice is remembered in `localStorage`.

- **Kannada mode** — Kannada first, with the English name smaller underneath.
- **English mode** — everything is English: day and exercise names, steps, targets, buttons, rest timer, celebration, help, editor, tooltips, aria-labels and the browser tab title. It never falls back to Kannada. The Listen button uses an English (`en-IN`) voice.

All text, including the day and exercise names of the default plan, lives in `src/lib/i18n.js` (`UI.kn`, `UI.en` and `PLAN_TEXT`).

## Development

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build (http://localhost:4173)
```

The build is a complete static site. `vite.config.js` uses `base: './'` and hash routing (`#/day/...`), so it works from a domain root or a sub-folder without server rewrite rules.

### Install on the phone

Open the deployed URL in Chrome (Android) → menu → **Add to Home screen**. After the first visit the service worker precaches the app, plan, fonts and all exercise images, so it keeps working offline. On first load while online, wait a few seconds for precaching to finish.

## Cloud sync (optional, Firebase free tier)

Sync is off until you add a Firebase project. Without it the app is unchanged: everything works offline from `localStorage`.

**How it works**

- `localStorage` stays the main storage. Every change is saved on the phone first.
- When online, the app writes one compact snapshot to a single Firestore document: member name, the plan, completed exercises and sets for the last 120 days, the current streak and this week's count.
- The write is debounced (about 2.5 s after a change) and retried when the device comes back online. Offline changes are kept and pushed on reconnect; the newest write wins.
- The family page listens to that document with `onSnapshot`, shows it read-only, and caches the last snapshot so it can still display something offline.
- No login is used. The document ID is the only secret — keep it long and unguessable and keep the Firestore rules restricted to it (below).

### 1. Create the Firebase project

1. Open <https://console.firebase.google.com> and click **Add project**.
2. Name it (for example `sapna-fitness`), continue, and you can disable Google Analytics.
3. In the new project, open **Build → Firestore Database → Create database**.
4. Choose a location close to you and start in **production mode** (rules are added in step 4).

### 2. Register the web app

1. In **Project settings → Your apps**, click the `</>` (web) icon.
2. Give it a nickname and register (no hosting needed).
3. Copy the `firebaseConfig` object shown.

### 3. Paste the config

Open `src/data/firebaseConfig.js` and paste the values:

```js
export const firebaseConfig = {
  apiKey: 'AIza…',
  authDomain: 'sapna-fitness.firebaseapp.com',
  projectId: 'sapna-fitness',
  storageBucket: 'sapna-fitness.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
};
```

`isCloudConfigured()` turns sync on as soon as `apiKey` and `projectId` are filled in — the Firebase SDK is only loaded at that point, so the app stays offline-first. Rebuild (`npm run build`) and deploy again.

### 4. Firestore rules

Because there is no login, the rules must allow anonymous access to exactly this one document (no other data in the project). In **Firestore → Rules**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /familyProgress/sapna-daily-progress-7c4e91 {
      allow read, write: if true;
    }
  }
}
```

The collection is `familyProgress` and the document ID is `CLOUD_DOC_ID` in `src/data/firebaseConfig.js` — change both if you want a different secret. Anyone who knows the deployed URL and the doc ID can read (and, with these rules, overwrite) this document, so do not store anything more personal than a first name and exercise progress. If you need stronger protection, use Firebase Anonymous Auth or App Check and tighten the rules.

### 5. Open the family page

After deploying, open:

```
https://<your-site>/?view=family
```

(the query string goes **before** the `#`). The page shows the badge **Family view · Read only**, today's workout, streak and this week, plus the same 7-day strip. It updates live while open and shows the last cached snapshot when offline. Language and text size on that page follow that phone's own settings.

## Adding a real video or photo

Open **⚙️ → PIN → days → ✏️ day → ✏️ exercise → Demo media**. Default PIN: **1234** (change it under Profile).

| Source | What it does |
| --- | --- |
| **Auto** | Uses the mapped photo pair / SVG animation below. |
| **Image pair** | Pick one of the 31 locally stored free-exercise-db pairs. |
| **YouTube link** | Paste a normal YouTube URL; it plays in the exercise screen (needs internet). |
| **Upload video** | Upload an MP4/WebM/MOV up to 2.5 MB, stored in localStorage as a data URL. |
| **Upload image / GIF** | Upload a GIF or image up to 2.5 MB. |

Exercise images can also be changed in code: `src/data/exerciseMedia.js` maps every plan exercise to a free-exercise-db `datasetId` (files in `public/exercises/<id>/0.jpg` and `1.jpg`). The app never hotlinks the dataset at runtime. Exercises without a good dataset match (`cardio`, `cycling`, `walking`, `stretching`, `surya-namaskar`, `pushups-modified`) use the animated stick-figure fallback in `src/lib/animations.js`.

## Data and backup

Everything is stored under the localStorage key `sapna-fitness:v1` (older `vani-fitness:v1` data is migrated on first load, including the name). In **Editor → Data** you can:

- download or copy a JSON backup of the profile + plan (file name `sapna-fitness-plan-<date>.json`),
- import a JSON file or pasted JSON,
- reset to the default plan.

Local times of the last sync are kept under `sapna-fitness:lastSync`; the family page caches its snapshot under `sapna-family:cache`.

Default plan: 01-10-2026 → 01-04-2027, "One day one body part" at U.S. Fitness Club, trainer ಉಮೇಶ್ / Umesh. Stretching is set to 5 minutes and Russian Twist to 15 × 2 as specified.

## Deploy for free

The output is plain static files — no server required.

**Netlify** — drag `dist/` into Netlify Drop, or connect the repo with build command `npm run build` and publish directory `dist`. No redirects needed (hash routing).

**Vercel** — import the repo; framework preset **Vite**, build `npm run build`, output `dist`. No rewrites needed.

**GitHub Pages** — run `npm run build`, then publish `dist/` (for example with an Actions workflow or the `gh-pages` package). The relative `base` and hash routes make it work at `https://<user>.github.io/<repo>/` without extra configuration.

Remember to add your deployed domain to **Firebase → Authentication → Settings → Authorized domains** only if you later enable Auth; plain Firestore rules do not require it.

## Credits

Exercise images and names come from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense, public domain) and are bundled locally in `public/exercises/`. Font: Noto Sans Kannada (SIL Open Font License). Icons are generated by `tools/make-icons.mjs`.
