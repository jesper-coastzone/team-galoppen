/* util.js — små hjælpere: id'er, tid, random, netværk. */
const os = require('os');

let counter = 0;
function uid(prefix = 'id') {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

function now() { return Date.now(); }

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

// Deterministisk-nok tilfældighed (kan seedes senere). randomInt inkl. begge ender.
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randomInt(0, arr.length - 1)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Genererer en let læselig spilkode (undgår forvekslede tegn).
function gameCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += chars[randomInt(0, chars.length - 1)];
  return s;
}

// Find maskinens LAN-IP så tablets/skærm kan forbinde.
function getLanIp() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

module.exports = { uid, now, clamp, randomInt, pick, shuffle, gameCode, getLanIp };
