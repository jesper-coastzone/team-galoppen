/*
 * server.js — Express + Socket.io bootstrap.
 * Serverer /host, /screen, /team og statiske filer. Binder til 0.0.0.0 så andre
 * enheder på samme netværk (tablets, projektor) kan forbinde via maskinens LAN-IP.
 */
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const QRCode = require('qrcode');

const { PNG } = require('pngjs');

const { register } = require('./src/server/socketHandlers');
const gs = require('./src/server/gameState');
const { getLanIp } = require('./src/server/util');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

// Offentlig base-URL (virker bag proxy på fx Render).
function publicBase(req) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0];
  return `${proto}://${req.get('host')}`;
}

// Generér app-ikon (navy baggrund, guld kompas-disk) uden binære filer i repo'et.
function makeIcon(size) {
  const png = new PNG({ width: size, height: size });
  const navy = [31, 62, 99], gold = [201, 162, 39], cream = [250, 246, 234];
  const cx = size / 2, cy = size / 2, R = size * 0.34, dR = size * 0.30;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    let c = navy;
    const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= R) c = gold;
    if (Math.abs(dx) + Math.abs(dy) <= dR && dist <= R) c = cream;
    if (dist <= size * 0.05) c = navy;
    png.data[i] = c[0]; png.data[i + 1] = c[1]; png.data[i + 2] = c[2]; png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json({ limit: '5mb' }));
app.use(express.static(PUBLIC, { redirect: false }));

const page = (name) => (req, res) => res.sendFile(path.join(PUBLIC, name, 'index.html'));
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC, 'index.html')));
app.get('/host', page('host'));
app.get('/screen', page('screen'));
app.get('/team', page('team'));

// Netværksinfo til host (viser hvilke URL'er enhederne skal bruge).
app.get('/api/net', (req, res) => {
  const ip = getLanIp();
  res.json({ ip, port: PORT, base: `http://${ip}:${PORT}` });
});

// QR-kode til nem tablet-join (peger på det offentlige domæne).
app.get('/qr.png', async (req, res) => {
  try {
    const data = req.query.data || `${publicBase(req)}/team`;
    const buf = await QRCode.toBuffer(String(data), { width: 320, margin: 1, color: { dark: '#1F3E63', light: '#FAF6EA' } });
    res.type('png').send(buf);
  } catch (e) { res.status(500).end(); }
});

// App-ikon til PWA (installér på tablets).
app.get('/icon.png', (req, res) => {
  const size = Math.max(48, Math.min(1024, Number(req.query.size) || 512));
  try { res.type('png').send(makeIcon(size)); } catch (e) { res.status(500).end(); }
});

register(io);
gs.loadGamesFromDisk();

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLanIp();
  console.log('\n  🏇  Team Galoppen kører!');
  console.log('  ────────────────────────────────────────');
  console.log(`  Host   :  http://${ip}:${PORT}/host`);
  console.log(`  Skærm  :  http://${ip}:${PORT}/screen`);
  console.log(`  Tablet :  http://${ip}:${PORT}/team`);
  console.log('  (lokalt: brug http://localhost:' + PORT + '/…)');
  console.log('  ────────────────────────────────────────\n');
});
