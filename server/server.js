// MY COMPANY TYCOON — Co-op server (Node.js, no npm packages needed)
// - serves the game website (index.html, js, css, assets) like muchen-mmo does
// - rooms over WebSocket at /ws: room code, players, positions, chat, shared money / quests, cutscene events
// Run:  node server/server.js        (port: env PORT or 3000)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
const MAX_ROOM = 4;                         // players per room
const TICK_MS = 100;                        // snapshot rate (10/s)
const MAX_ROOMS = 200;

// ------------------------------------------------------------------ static files
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.mp4': 'video/mp4', '.md': 'text/plain; charset=utf-8' };
const BLOCK = /(^|\/)(server|dist|node_modules|\.git)(\/|$)|\.py$|\.bat$|\.gitignore$|^build\.js$/;
const server = http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') url = '/index.html';
  if (url === '/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok rooms=' + rooms.size + ' players=' + players.size); }
  const file = path.normalize(path.join(ROOT, url));
  if (!file.startsWith(ROOT) || BLOCK.test(path.relative(ROOT, file).split(path.sep).join('/'))) { res.writeHead(404); return res.end('not found'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('not found'); }
    const cc = url.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache';
    const ext = path.extname(file).toLowerCase(), etag = `"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag, 'Cache-Control': cc }); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': st.size, ETag: etag, 'Cache-Control': cc });
    fs.createReadStream(file).pipe(res);
  });
});

// ------------------------------------------------------------------ minimal WebSocket (RFC 6455)
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
function wsFrame(str) {
  const data = Buffer.from(str, 'utf8'), n = data.length;
  let head;
  if (n < 126) { head = Buffer.alloc(2); head[1] = n; }
  else if (n < 65536) { head = Buffer.alloc(4); head[1] = 126; head.writeUInt16BE(n, 2); }
  else { head = Buffer.alloc(10); head[1] = 127; head.writeBigUInt64BE(BigInt(n), 2); }
  head[0] = 0x81;
  return Buffer.concat([head, data]);
}
class Conn {
  constructor(sock) {
    this.sock = sock; this.buf = Buffer.alloc(0); this.alive = true; this.onmsg = null; this.onclose = null; this.frag = null;
    sock.on('data', d => this.feed(d));
    sock.on('close', () => this.end()); sock.on('error', () => this.end());
  }
  send(obj) { if (this.alive) try { this.sock.write(wsFrame(typeof obj === 'string' ? obj : JSON.stringify(obj))); } catch (e) { this.end(); } }
  raw(buf) { if (this.alive) try { this.sock.write(buf); } catch (e) { this.end(); } }
  end() { if (!this.alive) return; this.alive = false; try { this.sock.destroy(); } catch (e) { } if (this.onclose) this.onclose(); }
  feed(d) {
    this.buf = Buffer.concat([this.buf, d]);
    if (this.buf.length > 3 << 20) return this.end();
    for (;;) {
      const b = this.buf; if (b.length < 2) return;
      const fin = b[0] & 0x80, op = b[0] & 0x0f, masked = b[1] & 0x80;
      let len = b[1] & 0x7f, off = 2;
      if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
      if (len > 1000 * 1024) return this.end();
      if (!masked) return this.end();
      if (b.length < off + 4 + len) return;
      const mask = b.slice(off, off + 4), payload = Buffer.alloc(len);
      for (let i = 0; i < len; i++) payload[i] = b[off + 4 + i] ^ mask[i & 3];
      this.buf = b.slice(off + 4 + len);
      if (op === 0x8) { this.raw(Buffer.from([0x88, 0])); return this.end(); }
      if (op === 0x9) { this.raw(Buffer.concat([Buffer.from([0x8a, payload.length]), payload.slice(0, 125)])); continue; }
      if (op === 0xa) continue;
      if (op === 0x1 || op === 0x0) {
        this.frag = this.frag ? Buffer.concat([this.frag, payload]) : payload;
        if (fin) { const s = this.frag.toString('utf8'); this.frag = null; if (this.onmsg) this.onmsg(s); }
      }
    }
  }
}
server.on('upgrade', (req, sock) => {
  if ((req.url || '').split('?')[0] !== '/ws' || (req.headers.upgrade || '').toLowerCase() !== 'websocket') { sock.destroy(); return; }
  const key = req.headers['sec-websocket-key']; if (!key) { sock.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  sock.setNoDelay(true);
  onConnect(new Conn(sock));
});

// ------------------------------------------------------------------ helpers
const clean = (s, max) => String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, max);
const num = (v, lo, hi, d = 0) => (typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d);
const key = (s, max) => (/^[A-Za-z0-9_\-]+$/.test(String(s || '')) ? String(s).slice(0, max) : '');
const MODES = { money: ['shared', 'split'], office: ['shared', 'split'], quest: ['shared', 'split'] };
const QKEYS = ['st', 'fl', 'cl', 'rel', 'met', 'cs', 'rn', 'gn', 'gh'];
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';        // no 0/O/1/I
function newCode() {
  for (let n = 0; n < 50; n++) {
    let c = ''; for (let i = 0; i < 5; i++) c += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
    if (!rooms.has(c)) return c;
  }
  return null;
}

// ------------------------------------------------------------------ rooms
let nextId = 1;
const players = new Map();              // id -> player
const rooms = new Map();                // code -> room
// room = { code, host, opts:{money,office,quest}, members:Map(id->player), money:number|null, quest:{flags:{}, st:{}} , created }
// player = { id, c, room, name, rel, char, scene, x, y, s:[...], office, last, chatT, evT }

const pub = p => ({ id: p.id, name: p.name, rel: p.rel, char: p.char, office: p.office, host: p.room && p.room.host === p.id ? 1 : 0 });
function toRoom(room, obj, except) { const s = JSON.stringify(obj); for (const m of room.members.values()) if (m !== except) m.c.send(s); }
function officeOf(room, p) { return room.opts.office === 'shared' ? 'o0' : 'o' + p.id; }

function leave(p) {
  const room = p.room; if (!room) return;
  p.room = null; room.members.delete(p.id);
  if (!room.members.size) { room.empty = Date.now(); room.host = 0; return; }       // keep the room 90 s so the creator can reload the page into the game
  if (room.host === p.id) room.host = room.members.values().next().value.id;      // host leaves: hand over, room survives
  toRoom(room, { t: 'leave', id: p.id, host: room.host });
  sleepCheck(room);
}
function enter(p, room, m) {
  p.room = room; p.name = clean(m.name, 14) || 'ผู้เล่น' + p.id; p.rel = clean(m.rel, 24); p.char = key(m.char, 40);
  p.sleep = 0; p.scene = 'office'; p.x = 0; p.y = 0; p.s = [0, 0, 0]; p.office = officeOf(room, p);
  room.members.set(p.id, p);
  p.c.send({ t: 'room', code: room.code, you: p.id, host: room.host, opts: room.opts, money: room.money, quest: room.quest, clock: room.clock, biz: room.opts.office === 'shared' ? room.biz : null, players: [...room.members.values()].filter(o => o !== p).map(pub) });
  toRoom(room, { t: 'join', p: pub(p) }, p);
}

function sleepCheck(room) {                              // everyone must be asleep before the day skips to morning
  const all = [...room.members.values()]; if (!all.length) return;
  const z = all.filter(m => m.sleep);
  if (z.length === all.length && all.length > 0) { all.forEach(m => { m.sleep = 0; }); toRoom(room, { t: 'dawn' }); return; }
  toRoom(room, { t: 'sleepers', n: z.length, total: all.length, names: z.map(m => m.name), ids: z.map(m => m.id) });
}

function handle(p, m) {
  const now = Date.now();
  switch (m.t) {
    case 'create': {
      if (p.room) return;
      if (rooms.size >= MAX_ROOMS) return p.c.send({ t: 'err', msg: 'เซิร์ฟเวอร์เต็ม ลองใหม่ภายหลัง' });
      const o = m.opts || {}, opts = {};
      for (const k in MODES) opts[k] = MODES[k].includes(o[k]) ? o[k] : 'split';
      const code = newCode(); if (!code) return p.c.send({ t: 'err', msg: 'สร้างห้องไม่สำเร็จ' });
      const room = { code, host: p.id, opts, members: new Map(), money: opts.money === 'shared' ? num(m.money, 0, 1e12, 0) : null, quest: {}, clock: null, biz: {}, created: now, empty: 0 };
      rooms.set(code, room); enter(p, room, m); break;
    }
    case 'join': {
      if (p.room) return;
      const room = rooms.get(String(m.code || '').toUpperCase().trim());
      if (!room) return p.c.send({ t: 'err', msg: 'ไม่พบห้องนี้ ตรวจรหัสห้องอีกครั้ง' });
      if (!room.members.size) room.host = p.id;                 // first one back in becomes host
      if (room.members.size >= MAX_ROOM) return p.c.send({ t: 'err', msg: 'ห้องเต็มแล้ว (สูงสุด ' + MAX_ROOM + ' คน)' });
      enter(p, room, m); break;
    }
    case 'leave': leave(p); break;
    case 'st': {                                          // scene, x, y, + small animation tuple
      if (!p.room) return;
      p.scene = key(m.scene, 16) || p.scene; p.x = num(m.x, -5000, 5000, p.x); p.y = num(m.y, -5000, 5000, p.y);
      p.s = [num(m.row, 0, 7) | 0, num(m.col, 0, 7) | 0, m.flip ? 1 : 0];
      if (p.scene !== 'office') p.office = officeOf(p.room, p);
      break;
    }
    case 'chat': {
      if (!p.room || now - p.chatT < 1000) return;
      const text = clean(m.text, 120); if (!text) return; p.chatT = now;
      toRoom(p.room, { t: 'chat', id: p.id, name: p.name, text }); break;
    }
    case 'money': {                                       // shared money: clients send deltas, server keeps the pool
      const r = p.room; if (!r || r.opts.money !== 'shared') return;
      const d = num(m.d, -1e10, 1e10, 0); if (!d) return;
      r.money = Math.max(0, (r.money || 0) + d);
      toRoom(r, { t: 'money', v: r.money, by: p.id, d }); break;
    }
    case 'quest': {                                       // shared quests: relay changes of the game's quest tables (S.q.st / fl / cl ...)
      const r = p.room; if (!r || r.opts.quest !== 'shared') return;
      const k = QKEYS.includes(m.k) ? m.k : '', id = key(m.id, 40); if (!k || !id) return;
      let v = m.v === undefined ? null : m.v;
      if (v !== null) { let j; try { j = JSON.stringify(v); } catch (e) { return; } if (j.length > 800) return; }
      r.quest[k] = r.quest[k] || {};
      if (v === null) delete r.quest[k][id]; else r.quest[k][id] = v;
      toRoom(r, { t: 'quest', k, id, v, by: p.id }, p); break;
    }
    case 'ev': {                                          // cutscene / world event relayed to everyone who shares the office (or the same scene)
      if (!p.room || now - p.evT < 150) return; p.evT = now;
      const k = key(m.k, 24); if (!k) return;
      const ev = { t: 'ev', k, id: p.id, scene: p.scene, d: typeof m.d === 'object' && m.d ? JSON.parse(JSON.stringify(m.d).slice(0, 4000)) : null };
      for (const o of p.room.members.values()) if (o !== p && o.office === p.office && (p.scene !== 'office' ? o.scene === p.scene : true)) o.c.send(ev);
      break;
    }
    case 'clk': {                                         // host is the room clock; everybody else follows
      const r = p.room; if (!r || r.host !== p.id) return;
      const day = num(m.day, 0, 1e6, 0) | 0, tm = num(m.tm, 0, 3000, 0);
      r.clock = { day, tm }; toRoom(r, { t: 'clk', day, tm }, p); break;
    }
    case 'biz': {                                         // shared office: relay one top-level key of the business state
      const r = p.room; if (!r || r.opts.office !== 'shared') return;
      const k = key(m.k, 24); if (!k) return;
      let j; try { j = JSON.stringify(m.v); } catch (e) { return; } if (j === undefined || j.length > 400000) return;
      r.biz[k] = m.v; toRoom(r, { t: 'biz', k, v: m.v, by: p.id }, p); break;
    }
    case 'sleep': {
      const r = p.room; if (!r) return; p.sleep = m.v ? 1 : 0; sleepCheck(r); break;
    }
    case 'ping': p.c.send({ t: 'pong', at: m.at }); break;
  }
}

function onConnect(c) {
  const p = { id: nextId++, c, room: null, name: '', rel: '', char: '', scene: 'office', x: 0, y: 0, s: [0, 0, 0], office: '', last: Date.now(), chatT: 0, evT: 0, sleep: 0 };
  players.set(p.id, p);
  c.onclose = () => { players.delete(p.id); leave(p); };
  c.onmsg = s => {
    p.last = Date.now();
    let m; try { m = JSON.parse(s); } catch (e) { return; }
    if (m && typeof m === 'object') handle(p, m);
  };
}

// snapshots: each player sees the others who are in the same scene (and, inside the office, the same office)
setInterval(() => {
  for (const room of rooms.values()) {
    for (const p of room.members.values()) {
      const list = [];
      for (const o of room.members.values()) if (o !== p) list.push([o.id, o.scene, Math.round(o.x), Math.round(o.y), ...o.s, o.office]);
      p.c.send({ t: 'snap', list });          // client filters by its own scene/office; it also knows who is "away"
    }
  }
  const now = Date.now();
  for (const p of players.values()) if (now - p.last > 30000) p.c.end();
  for (const [code, room] of rooms) if (!room.members.size && now - room.empty > 90000) rooms.delete(code);
}, TICK_MS);

server.listen(PORT, () => {
  console.log(`\n  MY COMPANY TYCOON — Co-op server running`);
  console.log(`  เปิดเกมบนคอมนี้:   http://localhost:${PORT}\n  ปิดเซิร์ฟเวอร์: กด Ctrl+C\n`);
});
