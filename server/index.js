import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

// ---- DB setup ----
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'jogobitcoin.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  nickname TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY(player_id) REFERENCES players(id)
);
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  points REAL NOT NULL,
  btc REAL DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  duration REAL DEFAULT 0,
  ts INTEGER NOT NULL,
  FOREIGN KEY(player_id) REFERENCES players(id)
);
CREATE TABLE IF NOT EXISTS rooms (
  room_id TEXT PRIMARY KEY,
  room_name TEXT NOT NULL,
  description TEXT DEFAULT ''
);
`);

const defaultRoomStmt = db.prepare('INSERT OR IGNORE INTO rooms(room_id, room_name, description) VALUES (?,?,?)');
defaultRoomStmt.run('public', 'Lobby', 'Default public room');

const insertPlayer = db.prepare('INSERT OR IGNORE INTO players(id, nickname) VALUES (?, ?)');
const insertSession = db.prepare('INSERT OR REPLACE INTO sessions(token, player_id, expires_at) VALUES (?, ?, ?)');
const getSession = db.prepare('SELECT player_id, expires_at FROM sessions WHERE token = ?');
const insertScore = db.prepare('INSERT INTO scores(player_id, points, btc, blocks, duration, ts) VALUES (?,?,?,?,?,?)');
const selectRanking = db.prepare(`
  SELECT s.player_id, p.nickname, s.points, s.btc, s.blocks, s.duration, s.ts
  FROM scores s
  LEFT JOIN players p ON p.id = s.player_id
  ORDER BY s.points DESC, s.duration ASC
  LIMIT 50
`);
const selectRooms = db.prepare('SELECT room_id, room_name, description FROM rooms ORDER BY room_name');
const insertRoom = db.prepare('INSERT INTO rooms(room_id, room_name, description) VALUES (?,?,?)');
const deleteRoom = db.prepare('DELETE FROM rooms WHERE room_id = ?');

// ---- Helpers ----
const SESSION_TTL_MS = 1000 * 60 * 60 * 6; // 6h
const MAX_MESSAGE_LEN = 400;
const MAX_POINTS = 1_000_000;
const MAX_BTC = 0.1; // limite de BTC por partida
const MAX_POINTS_PER_BLOCK = 5000;
const MIN_SECONDS_PER_BLOCK = 0.7;

function makeToken() {
  return uuidv4();
}

function now() {
  return Date.now();
}

function validateScore(body) {
  const { points, btc, blocks, duration } = body;
  if (typeof points !== 'number' || typeof btc !== 'number' || typeof blocks !== 'number' || typeof duration !== 'number') {
    return 'Invalid types';
  }
  if (points < 0 || points > MAX_POINTS) return 'Points out of range';
  if (blocks < 0 || blocks > 10_000) return 'Blocks out of range';
  if (btc < 0 || btc > MAX_BTC) return 'BTC out of range';
  if (duration < 0 || duration > 4 * 60 * 60) return 'Duration out of range';
  if (blocks > 0) {
    if (duration / blocks < MIN_SECONDS_PER_BLOCK) return 'Unrealistic speed';
    if (points / blocks > MAX_POINTS_PER_BLOCK) return 'Points per block too high';
  }
  if (points > 0 && blocks === 0) return 'Score requires blocks';
  return null;
}

function authSession(token) {
  if (!token) return null;
  const sess = getSession.get(token);
  if (!sess) return null;
  if (sess.expires_at < now()) {
    return null;
  }
  return sess;
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(helmet());
app.set('trust proxy', 1);

// Relaxed CSP for game (allow inline handlers and CoinGecko)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' http: https:; script-src 'self' 'unsafe-inline' http: https:; style-src 'self' 'unsafe-inline' http: https:; connect-src 'self' http: https: ws: wss: https://api.coingecko.com; img-src 'self' data:; media-src 'self' data:;");
  next();
});

const limiter = rateLimit({ windowMs: 60 * 1000, limit: 120 });
app.use(limiter);

app.post('/api/session', (req, res) => {
  const { nickname } = req.body || {};
  const playerId = uuidv4();
  insertPlayer.run(playerId, typeof nickname === 'string' ? nickname.slice(0, 40) : `Player-${playerId.slice(0, 6)}`);
  const token = makeToken();
  insertSession.run(token, playerId, now() + SESSION_TTL_MS);
  return res.json({ playerId, token, expiresAt: now() + SESSION_TTL_MS });
});

app.post('/api/score', (req, res) => {
  const { token, points, btc = 0, blocks = 0, duration = 0 } = req.body || {};
  const sess = authSession(token);
  if (!sess) return res.status(401).json({ error: 'Invalid session' });
  const invalidReason = validateScore({ points, btc, blocks, duration });
  if (invalidReason) return res.status(400).json({ error: invalidReason });
  insertScore.run(sess.player_id, points, btc, blocks, duration, now());
  return res.json({ ok: true });
});

app.get('/api/ranking', (_req, res) => {
  const rows = selectRanking.all();
  return res.json({ ranking: rows });
});

app.get('/api/rooms', (_req, res) => {
  return res.json({ rooms: selectRooms.all() });
});

app.post('/api/rooms', (req, res) => {
  const { roomName } = req.body || {};
  if (!roomName || typeof roomName !== 'string') {
    return res.status(400).json({ error: 'roomName required' });
  }
  const roomId = uuidv4();
  insertRoom.run(roomId, roomName.slice(0, 50), '');
  return res.status(201).json({ roomId, roomName: roomName.slice(0, 50), description: '' });
});

app.delete('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (roomId === 'public') return res.status(400).json({ error: 'Cannot delete default room' });
  deleteRoom.run(roomId);
  return res.json({ ok: true });
});

app.get('/api/negotiate', (req, res) => {
  const roomId = req.query.roomId || 'public';
  const url = `${req.protocol}://${req.get('host')}/socket.io/?roomId=${encodeURIComponent(roomId)}&EIO=4&transport=websocket`;
  return res.json({ url });
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

// ---- serve static front (repo root) ----
const staticRoot = path.resolve(__dirname, '..');
app.use(express.static(staticRoot));
app.get('/', (_req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('API error:', err);
  res.status(500).json({ error: 'internal', detail: err?.message });
});

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: CLIENT_ORIGIN } });

io.on('connection', (socket) => {
  const roomId = socket.handshake.query.roomId || 'public';
  socket.join(roomId);
  socket.emit('join', { roomId });

  socket.on('message', (payload) => {
    const text = (payload?.text || '').toString();
    if (!text || text.length > MAX_MESSAGE_LEN) return;
    io.to(roomId).emit('message', {
      id: uuidv4(),
      text,
      roomId,
      userId: payload?.userId || 'anon',
      ts: now(),
    });
  });

  socket.on('typing', (payload) => {
    io.to(roomId).emit('typing', { roomId, userId: payload?.userId || 'anon' });
  });

  socket.on('disconnect', () => {
    io.to(roomId).emit('leave', { roomId });
  });
});

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
