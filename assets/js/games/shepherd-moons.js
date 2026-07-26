/* ============================================================
   shepherd-moons.js — a planetary ring and the moons that
   sculpt it.

   Thousands of ring particles on Kepler orbits; each feels the
   planet and a couple of small moons, nothing else. Gaps open
   along the moons' orbits, wakes ripple off close encounters,
   edges sharpen — none of it drawn, all of it gravity.

   The dog herds sheep. The moons herd rocks. Same tab.
   ============================================================ */

import { createStage } from './engine/stage.js';
import { createLoop } from './engine/loop.js';
import { mulberry32, randomSeed } from './engine/rng.js';
import { slider, button, stat } from './engine/ui.js';
import { applyGravity, leapfrog, setCircularOrbit } from './engine/gravity.js';

// ---------- tuning ------------------------------------------------

const GM = 2.3e6;          // planet — period ≈ 10 s at r = 180 px
const MU = 0.0012;         // moon/planet mass ratio (a real shepherd
                           // is ~1e-9 — exaggerated so sculpting
                           // happens in a minute, not a millennium)
const EPS2 = 16;           // softening² — close encounters stay finite
const PLANET_R = 22;
const RING_IN = 78;
const DT = 1 / 60;
const DEFAULTS = { particles: 2500, moons: 2, speed: 2 };

const ICE = ['rgba(196,220,228,0.38)', 'rgba(196,220,228,0.6)', 'rgba(226,238,242,0.8)'];
const AMBER = '251, 191, 36';
const TEAL = '125, 226, 209';

// ---------- state -------------------------------------------------

const canvas = document.getElementById('game-canvas');
const hudEl = document.getElementById('game-hud');
const ctrlEl = document.getElementById('game-controls');

let rng = mulberry32(randomSeed());
const particles = [];
const moons = [];
const stars = [];
const fx = [];
let speed = DEFAULTS.speed;
let ejected = 0, accreted = 0;
let dragging = null;
let touched = false;               // hint until first drag
let cx = 0, cy = 0;
let planetGrad = null;
let ready = false;

const stage = createStage(canvas, (w, h) => {
  const ocx = cx, ocy = cy;
  cx = w / 2;
  cy = h / 2;
  if (ocx || ocy) {
    // keep the system centered through resizes
    const dx = cx - ocx, dy = cy - ocy;
    for (const p of particles) { p.x += dx; p.y += dy; }
    for (const m of moons) { m.x += dx; m.y += dy; }
  }
  const ctx = canvas.getContext('2d');
  planetGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, PLANET_R);
  planetGrad.addColorStop(0, '#1a2c3d');
  planetGrad.addColorStop(1, '#0a121c');
  stars.length = 0;
  for (let i = 0; i < Math.round((w * h) / 14000); i++) {
    stars.push({ x: Math.random() * w, y: Math.random() * h, a: 0.04 + Math.random() * 0.09 });
  }
  syncDraw();
});

const planet = { get x() { return cx; }, get y() { return cy; }, gm: GM };

function ringOut() {
  return Math.max(RING_IN + 60, Math.min(stage.w, stage.h) / 2 - 26);
}

function sources() {
  const s = [planet];
  for (const m of moons) s.push(m);
  return s;
}

// ---------- spawning ----------------------------------------------

function spawnParticle() {
  const r = RING_IN + rng() * (ringOut() - RING_IN);
  const a = rng() * Math.PI * 2;
  const p = {
    x: cx + Math.cos(a) * r,
    y: cy + Math.sin(a) * r,
    vx: 0, vy: 0, ax: 0, ay: 0,
    b: Math.floor(rng() * ICE.length),
  };
  setCircularOrbit(p, planet, 1);
  p.vx *= 1 + (rng() - 0.5) * 0.03;      // a whisper of eccentricity
  p.vy *= 1 + (rng() - 0.5) * 0.03;
  applyGravity(p, sources(), EPS2);
  return p;
}

function spawnMoon(frac) {
  const r = RING_IN + frac * (ringOut() - RING_IN);
  const a = rng() * Math.PI * 2;
  const m = {
    x: cx + Math.cos(a) * r,
    y: cy + Math.sin(a) * r,
    vx: 0, vy: 0, ax: 0, ay: 0,
    gm: GM * MU,
  };
  setCircularOrbit(m, planet, 1);
  applyGravity(m, [planet], EPS2);
  return m;
}

function setParticleCount(n) {
  while (particles.length < n) particles.push(spawnParticle());
  particles.length = Math.min(particles.length, n);
  syncDraw();
}

function setMoonCount(n) {
  while (moons.length < n) moons.push(spawnMoon(0.3 + 0.55 * rng()));
  if (moons.length > n) {
    if (dragging && moons.indexOf(dragging) >= n) dragging = null;
    moons.length = n;
  }
  syncDraw();
}

function reset() {
  rng = mulberry32(randomSeed());
  const np = particles.length, nm = moons.length;
  particles.length = 0;
  moons.length = 0;
  fx.length = 0;
  ejected = 0;
  accreted = 0;
  dragging = null;
  setMoonCount(nm || DEFAULTS.moons);
  setParticleCount(np || DEFAULTS.particles);
}

// ---------- simulation --------------------------------------------

function substep(dt) {
  // moons first — they only feel the planet
  for (const m of moons) {
    if (m === dragging) continue;        // pinned to the pointer
    leapfrog(m, [planet], EPS2, dt);
  }

  const src = sources();
  const rMax2 = (ringOut() * 1.7) ** 2;
  const rMin2 = (PLANET_R + 2) ** 2;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    leapfrog(p, src, EPS2, dt);
    const dx = p.x - cx, dy = p.y - cy;
    const r2 = dx * dx + dy * dy;
    if (r2 < rMin2) {                     // fell in
      accreted++;
      particles[i] = particles[particles.length - 1];
      particles.pop();
    } else if (r2 > rMax2) {              // slingshot out
      ejected++;
      particles[i] = particles[particles.length - 1];
      particles.pop();
    }
  }
}

function step(dt) {
  for (let s = 0; s < speed; s++) substep(DT);
  for (let i = fx.length - 1; i >= 0; i--) {
    fx[i].t += dt;
    if (fx[i].t > 0.5) fx.splice(i, 1);
  }
}

// ---------- rendering ---------------------------------------------

function draw() {
  const { ctx } = stage;
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, stage.w, stage.h);

  // stars
  ctx.fillStyle = 'rgba(226, 238, 242, 1)';
  for (const s of stars) {
    ctx.globalAlpha = s.a;
    ctx.fillRect(s.x, s.y, 1, 1);
  }
  ctx.globalAlpha = 1;

  // orbit guides — one faint circle per moon
  ctx.strokeStyle = `rgba(${TEAL}, 0.09)`;
  ctx.lineWidth = 1;
  for (const m of moons) {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.hypot(m.x - cx, m.y - cy), 0, Math.PI * 2);
    ctx.stroke();
  }

  // ring particles, batched per shade
  for (let b = 0; b < ICE.length; b++) {
    ctx.fillStyle = ICE[b];
    ctx.beginPath();
    for (const p of particles) {
      if (p.b === b) ctx.rect(p.x, p.y, 1.2, 1.2);
    }
    ctx.fill();
  }

  // planet
  ctx.fillStyle = planetGrad || '#0a121c';
  ctx.beginPath();
  ctx.arc(cx, cy, PLANET_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(${TEAL}, 0.3)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // moons — amber, with the Hill sphere shown while dragging
  for (const m of moons) {
    ctx.fillStyle = `rgba(${AMBER}, 0.95)`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    if (m === dragging) {
      const r = Math.hypot(m.x - cx, m.y - cy);
      const hill = r * Math.cbrt(MU / 3);
      ctx.strokeStyle = `rgba(${AMBER}, 0.4)`;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(m.x, m.y, hill, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // release rings
  for (const e of fx) {
    const k = e.t / 0.5;
    ctx.strokeStyle = `rgba(${TEAL}, ${0.5 * (1 - k)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 5 + k * 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (!touched) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(232, 237, 242, 0.55)';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillText('drag a moon — reshape the ring', stage.w / 2, stage.h - 24);
  }

  updateHud();
}

function syncDraw() {
  if (ready && !loop.running) draw();
}

// ---------- hud ----------------------------------------------------

const setParticles = stat(hudEl, 'particles');
const setEjected = stat(hudEl, 'ejected');
const setAccreted = stat(hudEl, 'accreted');
let hudAt = 0;

function updateHud() {
  const now = performance.now();
  if (now - hudAt < 250) return;
  hudAt = now;
  setParticles(particles.length);
  setEjected(ejected);
  setAccreted(accreted);
}

// ---------- input & controls ---------------------------------------

canvas.addEventListener('pointerdown', (e) => {
  let bestD2 = 26 * 26;
  for (const m of moons) {
    const dx = m.x - e.offsetX, dy = m.y - e.offsetY;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) { bestD2 = d2; dragging = m; }
  }
  if (dragging) { touched = true; canvas.setPointerCapture(e.pointerId); }
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  dragging.x = e.offsetX;
  dragging.y = e.offsetY;
  syncDraw();
});
function release() {
  if (!dragging) return;
  const m = dragging;
  dragging = null;
  // don't allow a release inside the planet — nudge out first
  const dx = m.x - cx, dy = m.y - cy;
  const r = Math.hypot(dx, dy);
  const rSafe = PLANET_R + 18;
  if (r < rSafe) {
    const k = r < 1e-6 ? 0 : rSafe / r;
    m.x = k ? cx + dx * k : cx + rSafe;
    m.y = k ? cy + dy * k : cy;
  }
  setCircularOrbit(m, planet, 1);        // recircularize, prograde
  applyGravity(m, [planet], EPS2);
  fx.push({ x: m.x, y: m.y, t: 0 });
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

const loop = createLoop({ step, draw });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

slider(ctrlEl, {
  label: 'particles', min: 500, max: 5000, step: 100, value: DEFAULTS.particles,
  onInput: setParticleCount,
});
slider(ctrlEl, {
  label: 'moons', min: 0, max: 4, value: DEFAULTS.moons,
  onInput: setMoonCount,
});
slider(ctrlEl, {
  label: 'speed', min: 1, max: 8, value: DEFAULTS.speed,
  onInput: (v) => { speed = v; },
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

setMoonCount(DEFAULTS.moons);
setParticleCount(DEFAULTS.particles);
ready = true;

if (reducedMotion) {
  draw();
} else {
  loop.start();
}
