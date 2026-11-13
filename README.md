# Sapna Fitness · ಸಪ್ನಾ ಫಿಟ್ನೆಸ್

A Kannada-first workout PWA: one body part a day, six days a week, Sunday rest. No login and no backend — the plan, progress and settings live in the device's `localStorage`, and progress can optionally be mirrored to Firestore so family members can follow along.

**Live:** https://anishh978-del.github.io/GYM-casual/ · **Read-only progress page:** https://anishh978-del.github.io/GYM-casual/?view=family

## Features

- **Today** — greeting, today's workout card with a large start button, a 7-day strip, weekly progress and streak.
- **Day plan** — one card per exercise with tap-to-tick completion and a celebration when the day is done.
- **Exercise** — looping demo (photo pair or animated stick figure), set circles, 60-second rest timer with a soft beep, large countdown for timed exercises, numbered steps and a safety banner, optional spoken instructions.
- **Week** — any week, per-day completion and today marker.
- **Help** — what a set and reps mean, rest and safety, trainer contact (once a number is set), credits.
- **Editor** (⚙️) — PIN-protected: edit days and exercises, reorder, change demo media, edit the profile, configure cloud sync, export/import JSON, reset to the default plan.
- **Family progress** (`?view=family`) — read-only page that follows synced progress live.
- **Offline-first PWA** — installable, precached by a service worker, works without a connection.

## Language

The header toggle switches between **ಕನ್ನಡ** and **English**; the choice is remembered in `localStorage`.

- **Kannada mode** — Kannada first, with the English name in smaller type underneath.
- **English mode** — everything is English: day and exercise names, steps, targets, buttons, rest timer, celebration, help, editor, tooltips, aria-labels and the browser tab title. It never falls back to Kannada. The Listen button uses an English (`en-IN`) voice.

All strings, including the day and exercise names of the default plan, live in `src/lib/i18n.js` (`UI.kn`, `UI.en`, `PLAN_TEXT`). Text size is adjustable in the header (`A−` / `A+`).

## Tech stack

- React 18 + Vite 5, plain CSS, hash routing (`#/day/2026-11-14`, `#/week`, …)
- `vite-plugin-pwa` (Workbox) for the manifest, precaching and offline support
- Optional Firebase 11 (Firestore only, loaded lazily when configured)
- Capacitor 7 for the Android build
- Noto Sans Kannada webfont, bundled locally

```
src/
  screens/       Today, Day, Exercise, Week, Help, Editor, Family progress
  components/    Header, WeekStrip, ExerciseMedia, RestTimer, Celebration, …
  lib/           i18n, store, cloudSync, dates, hooks
  data/          plan, exercise image mapping, Firebase config
public/
  exercises/     bundled free-exercise-db image pairs
  icons/         PWA icons
android/         Capacitor Android project
tools/           icon, asset and media generators
```

## Development

Node 20+ (`@capacitor/cli` requires it).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build (http://localhost:4173)
```

The output is a plain static site. `vite.config.js` uses `base: './'` and hash routing, so it works from a domain root, a sub-folder or inside a native WebView without server rewrite rules.

### Install as a phone app

Open the deployed URL in Chrome on Android → menu → **Add to Home screen**. After the first visit the service worker precaches the app, fonts and exercise images, so it keeps working offline. Leave the first load online for a few seconds so precaching can finish.

## Android app (Capacitor)

The same build is wrapped with [Capacitor](https://capacitorjs.com). `capacitor.config.json` sets `appId` `com.sapna.fitness`, `appName` `Sapna Fitness` and `webDir` `dist`. Relative asset paths and hash routes keep everything working inside the app's `https://localhost` WebView, and the service worker still registers, so the app works offline.

### Prerequisites

- **Android Studio** (recommended), with **Android SDK Platform 35**, SDK Build-Tools and either an emulator or a phone with USB debugging.
- Or the command-line SDK only:

```bash
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
```

and point Gradle at it in `android/local.properties` (gitignored):

```properties
sdk.dir=/path/to/Android/Sdk
```

Use **JDK 21**. Gradle 8.11.1 supports Java 17–21; newer JDKs fail with `Unsupported class file major version`. Android Studio's bundled JDK 21 works. For a command-line build on a machine whose default Java is newer, add to `~/.gradle/gradle.properties` (`%USERPROFILE%\.gradle\gradle.properties` on Windows):

```properties
org.gradle.java.home=/path/to/jdk-21
```

`cd android && ./gradlew --version` should report a JVM 21 for **Daemon JVM**.

### Build

```bash
npm install
npm run build
npx cap add android      # first time only: creates android/
npx cap sync android     # after every web build: copies dist/ and plugins
npx cap open android     # opens the project in Android Studio
```

In Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**. The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`; copy it to the phone and install it (allow "install unknown apps" for the file manager).

Without Android Studio: `cd android && ./gradlew assembleDebug` (Windows: `gradlew.bat assembleDebug`).

After any web change: `npm run build && npx cap sync android`, then rebuild the APK.

### Icons and splash

Both come from the same dumbbell mark as the PWA:

```bash
node tools/make-icons.mjs          # public/icons/*.png, including 1024px
node tools/make-android-assets.mjs # assets/: icon, adaptive foreground/background, splash
npx capacitor-assets generate --android \
  --iconBackgroundColor "#fdf6e9" --iconBackgroundColorDark "#fdf6e9" \
  --splashBackgroundColor "#fdf6e9" --splashBackgroundColorDark "#fdf6e9"
```

`android/app/src/main/assets/public/` is generated by `npx cap sync` and is gitignored — run the sync before building from a fresh clone.

## Cloud sync (optional, Firebase free tier)

Sync stays off until a Firebase project is configured; without it the app is unchanged and fully offline.

- `localStorage` remains the source of truth. Changes are written on the device first.
- When online, the app writes one compact snapshot to a single Firestore document: member name, plan, completed exercises and sets for the last 120 days, current streak and this week's total.
- Writes are debounced (~2.5 s) and retried on reconnect; the newest write wins.
- The family page subscribes with `onSnapshot`, renders read-only, and caches the last snapshot for offline display.
- There is no login. The document ID is the only access control — keep it long and unguessable.

### 1. Create the project

1. <https://console.firebase.google.com> → **Add project**.
2. In the project: **Build → Firestore Database → Create database**, choose a region, start in **production mode**.

### 2. Register the web app

In **Project settings → Your apps**, click `</>`, register the app (hosting not needed) and copy the `firebaseConfig` object.

### 3. Paste the config

Fill in `src/data/firebaseConfig.js`:

```js
export const firebaseConfig = {
  apiKey: 'AIza…',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
};
```

Sync switches on as soon as `apiKey` and `projectId` are set — the SDK is only loaded at that point, so the app stays offline-first. Rebuild and redeploy.

### 4. Firestore rules

With no login, the rules must allow anonymous access to exactly one document. Replace `<DOC_ID>` with the value of `CLOUD_DOC_ID` in `src/data/firebaseConfig.js`:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /familyProgress/<DOC_ID> {
      allow read, write: if true;
    }
  }
}
```

The collection is `familyProgress`. Anyone who knows the site URL and the document ID can read — and with these rules overwrite — that document, so store nothing more personal than a first name and exercise progress. For stronger protection, enable Firebase Anonymous Auth or App Check and tighten the rules.

### 5. Open the family page

```
https://<your-site>/?view=family
```

The query string goes **before** the `#`. The page shows a read-only badge, today's workout, streak, this week and the 7-day strip. It updates live while open and falls back to the cached snapshot offline. Language and text size follow that device's own settings.

## Exercise media

Open **⚙️ → PIN → days → ✏️ day → ✏️ exercise → Demo media**. The default PIN is `1234`; change it under **Editor → Profile**.

| Source | What it does |
| --- | --- |
| **Auto** | Uses the mapped photo pair or SVG animation. |
| **Image pair** | One of the 31 bundled free-exercise-db pairs. |
| **YouTube link** | Plays a normal YouTube URL in the exercise screen (needs internet). |
| **Upload video** | MP4/WebM/MOV up to 2.5 MB, stored in `localStorage` as a data URL. |
| **Upload image / GIF** | Image or GIF up to 2.5 MB. |

In code, `src/data/exerciseMedia.js` maps each plan exercise to a free-exercise-db `datasetId` (`public/exercises/<id>/0.jpg` and `1.jpg`). Images are bundled, never hotlinked at runtime. Exercises without a good dataset match (cardio, cycling, walking, stretching, Surya Namaskar, modified push-ups) use the animated stick-figure fallback in `src/lib/animations.js`.

## Data and storage

Everything is stored under the `sapna-fitness:v1` key. **Editor → Data** can:

- download or copy a JSON backup of the profile and plan (`sapna-fitness-plan-<date>.json`),
- import a JSON file or pasted JSON,
- reset to the default plan.

The last sync time is kept under `sapna-fitness:lastSync`; the family page caches its snapshot under `sapna-family:cache`.

## Deploy

Static files only — no server.

- **GitHub Pages** — this repo deploys automatically: `.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.
- **Netlify** — drag `dist/` into Netlify Drop, or connect the repo with build command `npm run build` and publish directory `dist`. No redirects needed.
- **Vercel** — import the repo, framework preset **Vite**, build `npm run build`, output `dist`. No rewrites needed.

If you later enable Firebase Auth, add the deployed domain under **Authentication → Settings → Authorized domains**; plain Firestore rules do not need it.

## Credits

Exercise images and names come from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense, public domain) and are bundled in `public/exercises/`. Font: Noto Sans Kannada (SIL Open Font License). Icons are generated by `tools/make-icons.mjs`.
