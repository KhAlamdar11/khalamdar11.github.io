/* ============================================================
   fireflies.js — pulse-coupled oscillators, Mirollo–Strogatz
   style. Each firefly charges toward a threshold at its own
   slightly-wrong rate; when it fires, it flashes and nudges
   every neighbor within earshot a little closer to firing.
   That's the entire mechanism. From random phases, a common
   beat emerges — no conductor, no clock, no leader.

   Small coupling radius → traveling waves and synchronized
   patches. Large radius → the whole field locks step.
   ============================================================ */

import { createStage } from './engine/stage.js';
import { createLoop } from './engine/loop.js';
import { createGrid } from './engine/grid.js';
import { mulberry32, randomSeed } from './engine/rng.js';
import { slider, button, stat } from './engine/ui.js';

// ---------- tuning ------------------------------------------------

const PERIOD = 1.8;        // mean flash period, seconds
const JITTER = 0.12;       // ±12% natural frequency spread
const DRIFT = 11;          // px/s — fireflies mosey
const GLOW_DECAY = 6;      // flash brightness half-life ~0.12 s
const PERTURB_R = 90;      // click scrambles phases within this
const CELL = 60;
const DEFAULTS = { n: 150, eps: 0.05, radius: 110 };

const AMBER = '251, 191, 36';
const TEAL = '125, 226, 209';

// ---------- state -------------------------------------------------

const canvas = document.getElementById('game-canvas');
const hudEl = document.getElementById('game-hud');
const ctrlEl = document.getElementById('game-controls');

let rng = mulberry32(randomSeed());
const flies = [];
const fx = [];
let eps = DEFAULTS.eps;         // coupling strength
let radius = DEFAULTS.radius;   // coupling radius
let stepId = 0;                 // per-step flash guard for cascades

const grid = createGrid(CELL);
let bgGrad = null;
let ready = false;

const stage = createStage(canvas, (w, h) => {
  bgGrad = canvas.getContext('2d').createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0a0f1f');       // night
  bgGrad.addColorStop(1, '#04060c');
  syncDraw();
});

// ---------- spawning ----------------------------------------------

function spawnFly() {
  return {
    x: rng() * stage.w,
    y: rng() * stage.h,
    wa: rng() * Math.PI * 2,                       // wander heading
    f: (1 / PERIOD) * (1 + JITTER * (rng() * 2 - 1)),
    p: rng(),                                      // phase in [0, 1)
    glow: 0,
    flashedAt: -1,
  };
}

function setCount(n) {
  while (flies.length < n) flies.push(spawnFly());
  flies.length = Math.min(flies.length, n);
  syncDraw();
}

function reset() {
  rng = mulberry32(randomSeed());
  const n = flies.length;
  flies.length = 0;
  fx.length = 0;
  setCount(n);
}

// ---------- simulation --------------------------------------------

function step(dt) {
  stepId++;

  // drift and charge
  for (const b of flies) {
    b.wa += (rng() - 0.5) * 1.6 * Math.sqrt(dt);
    b.x += Math.cos(b.wa) * DRIFT * dt;
    b.y += Math.sin(b.wa) * DRIFT * dt;
    if (b.x < -4) b.x = stage.w + 4;
    if (b.x > stage.w + 4) b.x = -4;
    if (b.y < -4) b.y = stage.h + 4;
    if (b.y > stage.h + 4) b.y = -4;

    b.p += b.f * dt;
    b.glow *= Math.exp(-GLOW_DECAY * dt);
  }

  grid.rebuild(flies);

  // flash cascade — one firing can tip neighbors over the
  // threshold in the same instant, and those tip others: avalanches
  const queue = [];
  for (const b of flies) if (b.p >= 1) queue.push(b);

  while (queue.length) {
    const b = queue.pop();
    if (b.flashedAt === stepId) continue;
    b.flashedAt = stepId;      // one flash per step, no infinite loops
    b.p = 0;
    b.glow = 1;

    grid.forNeighbors(b.x, b.y, radius, (o) => {
      if (o === b || o.flashedAt === stepId) return;
      const dx = o.x - b.x, dy = o.y - b.y;
      if (dx * dx + dy * dy > radius * radius) return;
      // phase-dependent nudge — the closer to firing, the harder
      // the push (this convexity is what makes M–S converge)
      o.p += eps * (0.5 + o.p);
      if (o.p >= 1) queue.push(o);
    });
  }

  for (let i = fx.length - 1; i >= 0; i--) {
    fx[i].t += dt;
    if (fx[i].t > 0.6) fx.splice(i, 1);
  }
}

// ---------- rendering ---------------------------------------------

function draw() {
  const { ctx } = stage;
  ctx.fillStyle = bgGrad || '#04060c';
  ctx.fillRect(0, 0, stage.w, stage.h);

  // dark bodies — embers between flashes
  ctx.fillStyle = `rgba(${AMBER}, 0.09)`;
  ctx.beginPath();
  for (const b of flies) {
    ctx.moveTo(b.x + 1.4, b.y);
    ctx.arc(b.x, b.y, 1.4, 0, Math.PI * 2);
  }
  ctx.fill();

  // glows — per-fly alpha, so no batching here
  for (const b of flies) {
    if (b.glow < 0.02) continue;
    ctx.fillStyle = `rgba(${AMBER}, ${0.16 * b.glow})`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3.5 + 11 * b.glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${AMBER}, ${0.25 + 0.7 * b.glow})`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 1.8 + 1.2 * b.glow, 0, Math.PI * 2);
    ctx.fill();
  }

  // perturbation ripples
  for (const e of fx) {
    const k = e.t / 0.6;
    ctx.strokeStyle = `rgba(${TEAL}, ${0.6 * (1 - k)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 6 + k * PERTURB_R, 0, Math.PI * 2);
    ctx.stroke();
  }

  updateHud();
}

function syncDraw() {
  if (ready && !loop.running) draw();
}

// ---------- hud ----------------------------------------------------

const setCountStat = stat(hudEl, 'fireflies');
const setSync = stat(hudEl, 'sync r');
let hudAt = 0;

function updateHud() {
  const now = performance.now();
  if (now - hudAt < 250) return;
  hudAt = now;

  // Kuramoto order parameter: r = |Σ e^(i·2πφ)| / N.
  // Random phases read ~0; a single shared beat reads 1.
  let cx = 0, cy = 0;
  for (const b of flies) {
    cx += Math.cos(b.p * Math.PI * 2);
    cy += Math.sin(b.p * Math.PI * 2);
  }
  const r = flies.length ? Math.hypot(cx, cy) / flies.length : 0;

  setCountStat(flies.length);
  setSync(r.toFixed(2));
}

// ---------- input & controls ---------------------------------------

// click to scramble local phases — then watch the beat reassert itself
canvas.addEventListener('pointerdown', (e) => {
  const px = e.offsetX, py = e.offsetY;
  for (const b of flies) {
    const dx = b.x - px, dy = b.y - py;
    if (dx * dx + dy * dy < PERTURB_R * PERTURB_R) b.p = rng() * 0.9;
  }
  fx.push({ x: px, y: py, t: 0 });
  syncDraw();
});

const loop = createLoop({ step, draw });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

slider(ctrlEl, {
  label: 'fireflies', min: 20, max: 400, step: 10, value: DEFAULTS.n,
  onInput: setCount,
});
slider(ctrlEl, {
  label: 'coupling', min: 0, max: 0.2, step: 0.005, value: DEFAULTS.eps,
  onInput: (v) => { eps = v; },
});
slider(ctrlEl, {
  label: 'radius', min: 40, max: 260, step: 10, value: DEFAULTS.radius,
  onInput: (v) => { radius = v; },
});

const pauseBtn = button(ctrlEl, {
  label: reducedMotion ? 'play' : 'pause',
  icon: reducedMotion ? 'play' : 'pause',
  onClick: () => {
    if (loop.running) {
      loop.stop();
      pauseBtn.innerHTML = '<i class="fas fa-play"></i> play';
    } else {
      loop.start();
      pauseBtn.innerHTML = '<i class="fas fa-pause"></i> pause';
    }
  },
});

button(ctrlEl, { label: 'reset', icon: 'redo', onClick: () => { reset(); syncDraw(); } });

// ---------- go ------------------------------------------------------

setCount(DEFAULTS.n);
ready = true;

if (reducedMotion) {
  draw();
} else {
  loop.start();
}
