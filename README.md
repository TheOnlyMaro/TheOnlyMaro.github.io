# Portal_Game
# MUST READ BEFORE PROJECT DEVELOPMENT


Quick start

Prerequisites: Node.js

1. Install

```powershell
cd D:\Portal\Portal_Game
npm install
```

2. Run (dev server with no-cache headers)

```powershell
npm run dev
# or a quick static server:
npx http-server -p 8000 -c-1
```

Developer must-do

- Open DevTools (F12) → Network → **Disable cache** (while DevTools is open) before reloading. This forces fresh JS/CSS during development.
- If assets still appear stale, check Application → Service Workers and unregister any worker.

Minimal file map

- `index.html` — entry & import map
- `main.js` — app bootstrap
- `core/` — renderer, camera, main loop
- `levels/` — level data
- `textures/` — image assets
- `server.js` — optional dev server (no-cache)
