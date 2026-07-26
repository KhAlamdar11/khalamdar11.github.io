/* ============================================================
   kessler.js — the cascade.

   A healthy constellation on tidy circular orbits. Click one
   satellite: it fragments, the fragments cross other orbits at
   killing speed, every hit makes more fragments. Whether the
   cascade fizzles or runs away depends on how crowded the shell
   is — it's a phase transition, and the satellites slider is
   the control parameter.

   Kessler & Cour-Palais called it in 1978. Here, decades of
   orbital decay are compressed into seconds so you can find
   the threshold yourself.
   ============================================================ */

import { createStage } from './engine/stage.js';
import { createLoop } from './engine/loop.js';
import { createGrid } from './engine/grid.js';
import { mulberry32, randomSeed } from './engine/rng.js';
import { slider, button, stat } from './engine/ui.js';
import { applyGravity, leapfrog, setCircularOrbit } from './engine/gravity.js';

// ---------- tuning ------------------------------------------------

const GM = 2.3e6;
const EPS2 = 9;
const PLANET_R = 20;
const BAND_IN = 82;         // constellation shell
const KILL_R = 3.4;         // collision radius
const MIN_REL = 25;         // px/s — co-orbiting neighbors don't count
const KICK_MIN = 15, KICK_MAX = 90;   // fragment Δv
const DEBRIS_TTL = 30;      // "atmospheric drag", years → seconds
const MAX_DEBRIS = 2600;    // sanity cap
const DT = 1 / 60;
const DEFAULTS = { sats: 120, frags: 10 };

const AMBER = '251, 191, 36';
const TEAL = '125, 226, 209';

// ---------- state -------------------------------------------------

const canvas = document.getElementById('game-canvas');
const hudEl = document.getElementById('game-hud');
const ctrlEl = document.getElementById('game-controls');

let rng = mulberry32(randomSeed());
const sats = [];
const debris = [];
const stars = [];
const fx = [];
let satTarget = DEFAULTS.sats;
let frags = DEFAULTS.frags;
let impacts = 0;
let touched = false;
let cx = 0, cy = 0;
let planetGrad = null;
let ready = false;

const grid = createGrid(16);           // fine cell — collision queries
const planet = { get x() { return cx; }, get y() { return cy; }, gm: GM };
const PLANET_SRC = [planet];

const stage = createStage(canvas, (w, h) => {
  const ocx = cx, ocy = cy;
  cx = w / 2;
  cy = h / 2;
  if (ocx || ocy) {
    const dx = cx - ocx, dy = cy - ocy;
    for (const s of sats) { s.x += dx; s.y += dy; }
    for (const d of debris) { d.x += dx; d.y += dy; }
  }
  const ctx = canvas.getContext('2d');
  planetGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, PLANET_R);
  planetGrad.addColorStop(0, '#16304a');
  planetGrad.addColorStop(1, '#081220');
  stars.length = 0;
  for (let i = 0; i < Math.round((w * h) / 14000); i++) {
    stars.push({ x: Math.random() * w, y: Math.random() * h, a: 0.04 + Math.random() * 0.09 });
  }
  syncDraw();
});

function bandOut() {
  return Math.max(BAND_IN + 50, Math.min(stage.w, stage.h) / 2 - 24);
}

// ---------- spawning ----------------------------------------------

function spawnSat() {
  const r = BAND_IN + rng() * (bandOut() - BAND_IN);
  const a = rng() * Math.PI * 2;
  const s = {
    x: cx + Math.cos(a) * r,
    y: cy + Math.sin(a) * r,
    vx: 0, vy: 0, ax: 0, ay: 0,
    dead: false,
  };
  setCircularOrbit(s, planet, 1);
  applyGravity(s, PLANET_SRC, EPS2);
  return s;
}

function explode(s) {
  impacts++;
  s.dead = true;
  fx.push({ x: s.x, y: s.y, t: 0 });
  const n = Math.min(frags, MAX_DEBRIS - debris.length);
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const kick = KICK_MIN + rng() * (KICK_MAX - KICK_MIN);
    const d = {
      x: s.x, y: s.y,
      vx: s.vx + Math.cos(a) * kick,
      vy: s.vy + Math.sin(a) * kick,
      ax: 0, ay: 0,
      ttl: DEBRIS_TTL * (0.6 + rng() * 0.8),
    };
    applyGravity(d, PLANET_SRC, EPS2);
    debris.push(d);
  }
}

function reset() {
  rng = mulberry32(randomSeed());
  sats.length = 0;
  debris.length = 0;
  fx.length = 0;
  impacts = 0;
  for (let i = 0; i < satTarget; i++) sats.push(spawnSat());
  syncDraw();
}

// ---------- simulation --------------------------------------------

function step(dt) {
  const rMax2 = (bandOut() * 1.8) ** 2;
  const rMin2 = (PLANET_R + 6) ** 2;

  // satellites — planet gravity only, then index for collisions
  for (let i = sats.length - 1; i >= 0; i--) {
    const s = sats[i];
    if (s.dead) {
      sats[i] = sats[sats.length - 1];
      sats.pop();
      continue;
    }
    leapfrog(s, PLANET_SRC, EPS2, DT);
  }
  grid.rebuild(sats);

  // debris — fly, decay, collide
  for (let i = debris.length - 1; i >= 0; i--) {
    const d = debris[i];
    leapfrog(d, PLANET_SRC, EPS2, DT);
    d.ttl -= dt;

    const dx = d.x - cx, dy = d.y - cy;
    const r2 = dx * dx + dy * dy;
    if (d.ttl <= 0 || r2 < rMin2 || r2 > rMax2) {
      debris[i] = debris[debris.length - 1];
      debris.pop();
      continue;
    }

    // hit anything?
    let hit = null, bestD2 = KILL_R * KILL_R;
    grid.forNeighbors(d.x, d.y, KILL_R, (s) => {
      if (s.dead) return;
      const ddx = s.x - d.x, ddy = s.y - d.y;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < bestD2) { bestD2 = d2; hit = s; }
    });
    if (hit) {
      const rvx = d.vx - hit.vx, rvy = d.vy - hit.vy;
      if (rvx * rvx + rvy * rvy > MIN_REL * MIN_REL) {
        explode(hit);                        // sat becomes fragments
        debris[i] = debris[debris.length - 1];
        debris.pop();                        // impactor is spent
      }
    }
  }

  for (let i = fx.length - 1; i >= 0; i--) {
    fx[i].t += dt;
    if (fx[i].t > 0.7) fx.splice(i, 1);
  }
}

// ---------- rendering ---------------------------------------------

function draw() {
  const { ctx } = stage;
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, stage.w, stage.h);

  ctx.fillStyle = 'rgba(226, 238, 242, 1)';
  for (const s of stars) {
    ctx.globalAlpha = s.a;
    ctx.fillRect(s.x, s.y, 1, 1);
  }
  ctx.globalAlpha = 1;

  // shell guides
  ctx.strokeStyle = `rgba(${TEAL}, 0.07)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, BAND_IN, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, bandOut(), 0, Math.PI * 2);
  ctx.stroke();

  // satellites — the working constellation
  ctx.fillStyle = `rgba(${TEAL}, 0.9)`;
  ctx.beginPath();
  for (const s of sats) ctx.rect(s.x - 1.2, s.y - 1.2, 2.4, 2.4);
  ctx.fill();

  // debris — fades out as drag claims it
  ctx.beginPath();
  ctx.fillStyle = `rgba(${AMBER}, 0.8)`;
  for (const d of debris) {
    if (d.ttl > 3) ctx.rect(d.x - 0.7, d.y - 0.7, 1.4, 1.4);
  }
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = `rgba(${AMBER}, 0.3)`;
  for (const d of debris) {
    if (d.ttl <= 3) ctx.rect(d.x - 0.7, d.y - 0.7, 1.4, 1.4);
  }
  ctx.fill();

  // planet
  ctx.fillStyle = planetGrad || '#081220';
  ctx.beginPath();
  ctx.arc(cx, cy, PLANET_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(${TEAL}, 0.35)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // impact flashes
  for (const e of fx) {
    const k = e.t / 0.7;
    ctx.strokeStyle = `rgba(255, 238, 200, ${0.85 * (1 - k)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 2 + k * 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${AMBER}, ${0.4 * (1 - k)})`;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 2 + k * 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (!touched) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(232, 237, 242, 0.55)';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillText('click a satellite', stage.w / 2, stage.h - 24);
  }

  updateHud();
}

function syncDraw() {
  if (ready && !loop.running) draw();
}

// ---------- hud ----------------------------------------------------

const setSats = stat(hudEl, 'satellites');
const setDebris = stat(hudEl, 'debris');
const setImpacts = stat(hudEl, 'impacts');
let hudAt = 0;

function updateHud() {
  const now = performance.now();
  if (now - hudAt < 250) return;
  hudAt = now;
  setSats(sats.length);
  setDebris(debris.length);
  setImpacts(impacts);
}

// ---------- input & controls ---------------------------------------

canvas.addEventListener('pointerdown', (e) => {
  let target = null, bestD2 = 26 * 26;
  for (const s of sats) {
    const dx = s.x - e.offsetX, dy = s.y - e.offsetY;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) { bestD2 = d2; target = s; }
  }
  if (target) {
    touched = true;
    explode(target);
    syncDraw();
  }
});

const loop = createLoop({ step, draw });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

slider(ctrlEl, {
  label: 'satellites', min: 20, max: 300, step: 10, value: DEFAULTS.sats,
  onInput: (v) => { satTarget = v; reset(); },   // density is the experiment
});
slider(ctrlEl, {
  label: 'fragments', min: 6, max: 20, value: DEFAULTS.frags,
  onInput: (v) => { frags = v; },
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

button(ctrlEl, { label: 'reset', icon: 'redo', onClick: reset });

// ---------- go ------------------------------------------------------

reset();
ready = true;

if (reducedMotion) {
  draw();
} else {
  loop.start();
}
