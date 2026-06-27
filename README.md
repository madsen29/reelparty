# ReelParty

## Setup
1. Install and start MongoDB locally (default: `mongodb://127.0.0.1:27017`).
2. Install dependencies:
   npm install
3. Start the app (local API + frontend):
   npm run dev
4. Open http://localhost:5173

Data is stored in the `reelparty` MongoDB database. Override the connection with `MONGODB_URI` and `MONGODB_DB` if needed.

## Play with friends on the same Wi-Fi
When you run `npm run dev`, Vite prints a "Network:" URL like http://192.168.1.x:5173
Share that with friends on the same network. They open it, tap Join, enter your code.

## Notes
- Clipboard auto-read works on localhost/HTTPS. Over a LAN IP it is blocked, so guests use the paste sheet.
- YouTube Shorts fetch real metadata and play embedded. TikTok/Reels show platform cards (in-app playback needs each platform's SDK).
- The local API listens on port 3001 and is proxied through Vite at `/api`.
