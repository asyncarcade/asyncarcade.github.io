// ═══════════════════════════════════════════
// UTILS — math helpers, seeded RNG, constants
// ═══════════════════════════════════════════

const CELL = 56;

// ── Seeded RNG (mulberry32) ─────────────────
function strToSeed(s) {
  s = String(s);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h || 1;
}

function mkRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Math helpers ────────────────────────────
const lerp   = (a, b, t) => a + (b - a) * t;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist   = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const norm   = v => { const m = Math.hypot(v.x, v.y); return m ? { x: v.x / m, y: v.y / m } : { x: 0, y: 0 }; };
const rnd    = (a, b) => a + Math.random() * (b - a);
const rndInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));

// ── Rect collision helpers ──────────────────
function circleInRect(cx, cy, cr, rx, ry, rw, rh) {
  const nearX = clamp(cx, rx, rx + rw);
  const nearY = clamp(cy, ry, ry + rh);
  return Math.hypot(cx - nearX, cy - nearY) < cr;
}
