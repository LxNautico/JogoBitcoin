# JogoBitcoin Server (SQLite-backed)

Express + Socket.IO with SQLite persistence for sessions, players, scores and rooms. Serves the static front from repo root.

## Endpoints
- `POST /api/session` → `{ playerId, token, expiresAt }`
- `POST /api/score` → `{ token, points, btc, blocks, duration }`
- `GET /api/ranking`
- `GET /api/rooms` / `POST /api/rooms` / `DELETE /api/rooms/:roomId`
- `GET /api/negotiate?roomId=public`
- `GET /healthz`

## Running
```
cd server
npm install
npm run dev            # http://localhost:4000
```
Env vars:
- `PORT` (default 4000)
- `CLIENT_ORIGIN` (default `*`, set to your front URL)

Data: SQLite file at `server/data/jogobitcoin.db`. Default room `public` is auto-seeded.

## Notes
- CSP relaxed to allow inline handlers and CoinGecko fetch; Socket.IO allowed via ws/wss.
- Storage is now persistent; restart does not erase ranking/sessions/rooms.
- Scores are validated (faixas simples) e order by pontos desc / duração asc.
