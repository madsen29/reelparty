# ReelParty Mobile

Expo React Native app. See the [root README](../../README.md) for setup.

Quick start (from the monorepo root):

```bash
npm install
npm run dev:api
EXPO_PUBLIC_API_URL="http://<your-lan-ip>:3001" npm run dev:mobile
```

On iOS Simulator you can omit `EXPO_PUBLIC_API_URL` if the API runs on
`localhost:3001`.
