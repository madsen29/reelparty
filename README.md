# ReelParty

Watch TikToks, Reels & YouTube Shorts together with friends — build a shared
queue, react with emojis, and see who watched what.

Monorepo layout:

- `apps/web` — Vite + React web app
- `apps/mobile` — Expo React Native app (iOS & Android)
- `packages/api` — Express + MongoDB API shared by web and mobile

## Prerequisites

- Node 18+
- MongoDB (default `mongodb://127.0.0.1:27017`)
- For mobile: [Expo Go](https://expo.dev/go) on your phone, or an iOS Simulator /
  Android Emulator

## Install

```bash
npm install
```

## Development

### Web + API (typical local setup)

```bash
npm run dev
```

Opens the web app at http://localhost:5173. The API listens on port 3001 and is
proxied through Vite at `/api`.

Data is stored in the `reelparty` MongoDB database. Override with `MONGODB_URI`
and `MONGODB_DB` when starting the API.

### Individual workspaces

```bash
npm run dev:api      # API only (port 3001)
npm run dev:web      # Vite dev server only
npm run dev:mobile   # Expo dev server
```

### Mobile on a physical device

The phone cannot reach `localhost` on your computer. Start the API (via
`npm run dev` or `npm run dev:api`), then point the mobile app at your LAN IP:

```bash
EXPO_PUBLIC_API_URL="http://192.168.1.20:3001" npm run dev:mobile
```

Defaults if `EXPO_PUBLIC_API_URL` is unset:

- iOS Simulator: `http://localhost:3001`
- Android Emulator: `http://10.0.2.2:3001`

Set `EXPO_PUBLIC_WEB_ORIGIN` for invite links shared with friends (e.g.
`https://reelparty.app`).

## Play with friends on the same Wi-Fi

When you run `npm run dev`, Vite prints a "Network:" URL like
`http://192.168.1.x:5173`. Share that with friends on the same network. They
open it, tap Join, enter your code.

## Build

```bash
npm run build
```

## Notes

- Web and mobile clients share one API and one MongoDB database.
- Clipboard auto-read works on localhost/HTTPS. Over a LAN IP it is blocked, so
  guests use the paste sheet.
- YouTube Shorts fetch real metadata and play embedded. TikTok/Reels show
  platform cards (in-app playback needs each platform's SDK).
- Mobile invite links use the `reelparty://` scheme plus a web URL
  (`EXPO_PUBLIC_WEB_ORIGIN`) for friends without the app.
