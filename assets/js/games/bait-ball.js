/* ============================================================
   bait-ball.js — a school of fish on purely local rules, and
   the predators that stress-test them.

   Every fish steers on information within a ~40 px bubble:
   separation, alignment, cohesion, fear. Nobody sees the whole
   tank, nobody is in charge — the school is the emergent part.
   λ₂ of this network is left as an exercise for the predators.
   ============================================================ */

import { createStage } from './engine/stage.js';
import { createLoop } from './engine/loop.js';
import { createGrid } from './engine/grid.js';
import { mulberry32, randomSeed } from './engine/rng.js';
import { slider, button, stat } from './engine/ui.js';

// ---------- tuning ------------------------------------------------

const FISH = {
  view: 42,      // alignment / cohesion neighborhood
  sepR: 15,      // personal space
  fear: 120,     // predator detection radius
  cursorR: 90,   // the pointer is a soft threat
  wSep: 1.5,
  wAlign: 1.0,
  wCoh: 0.85,
  wFlee: 3.2,
  wCursor: 1.9,
  wEdge: 1.7,
  vMin: 50,      // fish never stop swimming
  vMax: 155,
  force: 520,    // agile — fish out-turn predators
};

const PRED = {
  sight: 280,
  lungeR: 140,   // inside this: burst
  killR: 9,
  vCruise: 120,
  vMax: 210,     // faster in a straight line, clumsier in a turn
  vRest: 55,
  force: 300,
  restTime: 2.4, // satiated after a catch — the school reforms
  wSep: 1.2,
};

const EDGE = 46;             // soft wall margin
const CELL = 48;             // spatial hash cell ≥ FISH.view
const DEFAULTS = { fish: 260, preds: 3 };

// teal shade buckets — fish are batched per bucket into one path
const SHADES = ['rgba(125,226,209,0.85)', 'rgba(96,205,222,0.85)', 'rgba(166,238,221,0.85)'];
const AMBER = '251, 191, 36';

// ---------- state -------------------------------------------------

const canvas = document.getElementById('game-canvas');
const hudEl = document.getElementById('game-hud');
const ctrlEl = document.getElementById('game-controls');

let rng = mulberry32(randomSeed());
const fish = [];
const preds = [];
const plankton = [];
const fx = [];                       // catch rings
let catches = 0;
let time = 0;
const mouse = { x: -1e4, y: -1e4 };

const grid = createGrid(CELL);
let bgGrad = null;
let ready = false;   // guards syncDraw until stage + loop exist

const stage = createStage(canvas, (w, h) => {
  // getContext returns the same instance stage.ctx wraps — and this
  // callback first fires while `stage` is still being constructed
  bgGrad = canvas.getContext('2d').createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0c1a24');
  bgGrad.addColorStop(1, '#060a10');
  syncDraw();
});

// ---------- spawning ----------------------------------------------

function spawnFish(atEdge = false) {
  let x, y;
  if (atEdge) {
    // eaten fish rejoin from a random wall, heading inward
    const side = Math.floor(rng() * 4);
    x = side === 0 ? 4 : side === 1 ? stage.w - 4 : rng() * stage.w;
    y = side === 2 ? 4 : side === 3 ? stage.h - 4 : rng() * stage.h;
  } else {
    x = rng() * stage.w;
    y = rng() * stage.h;
  }
  const a = rng() * Math.PI * 2;
  const v = FISH.vMin + rng() * (FISH.vMax - FISH.vMin) * 0.5;
  return {
    x, y,
    vx: Math.cos(a) * v,
    vy: Math.sin(a) * v,
    s: 0.85 + rng() * 0.4,               // size variation
    shade: Math.floor(rng() * SHADES.length),
    dead: false,
  };
}

function spawnPred() {
  const a = rng() * Math.PI * 2;
  return {
    x: rng() * stage.w,
    y: rng() * stage.h,
    vx: Math.cos(a) * PRED.vCruise,
    vy: Math.sin(a) * PRED.vCruise,
    wa: a,                               // wander heading
    rest: 0,
    target: null,
    catches: 0,
  };
}

function setFishCount(n) {
  while (fish.length < n) fish.push(spawnFish());
  while (fish.length > n) fish.pop().dead = true;
  syncDraw();
}

function setPredCount(n) {
  while (preds.length < n) preds.push(spawnPred());
  preds.length = Math.min(preds.length, n);
  syncDraw();
}

function reset() {
  rng = mulberry32(randomSeed());
  const nf = fish.length, np = preds.length;
  for (const f of fish) f.dead = true;
  fish.length = 0;
  preds.length = 0;
  fx.length = 0;
  catches = 0;
  setFishCount(nf);
  setPredCount(np);
}

// ambient depth cue — not part of the simulation
function seedPlankton() {
  plankton.length = 0;
  const n = Math.round((stage.w * stage.h) / 26000);
  for (let i = 0; i < n; i++) {
    plankton.push({
      x: Math.random() * stage.w,
      y: Math.random() * stage.h,
      r: 0.7 + Math.random() * 1.1,
      vy: -(2 + Math.random() * 5),
      ph: Math.random() * Math.PI * 2,
    });
  }
}

// ---------- simulation --------------------------------------------

// steer toward a desired direction at a desired speed, force-limited
function steer(a, dx, dy, speed, force, w) {
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) return;
  let sx = (dx / d) * speed - a.vx;
  let sy = (dy / d) * speed - a.vy;
  const m = Math.hypot(sx, sy);
  if (m > force) { sx = (sx / m) * force; sy = (sy / m) * force; }
  a.ax += sx * w;
  a.ay += sy * w;
}

function edgeForce(a, force, w) {
  if (a.x < EDGE) a.ax += ((EDGE - a.x) / EDGE) * force * w;
  if (a.x > stage.w - EDGE) a.ax -= ((a.x - (stage.w - EDGE)) / EDGE) * force * w;
  if (a.y < EDGE) a.ay += ((EDGE - a.y) / EDGE) * force * w;
  if (a.y > stage.h - EDGE) a.ay -= ((a.y - (stage.h - EDGE)) / EDGE) * force * w;
}

function clampSpeed(a, vMin, vMax) {
  const sp = Math.hypot(a.vx, a.vy);
  if (sp > vMax) { a.vx = (a.vx / sp) * vMax; a.vy = (a.vy / sp) * vMax; }
  else if (sp < vMin && sp > 1e-6) { a.vx = (a.vx / sp) * vMin; a.vy = (a.vy / sp) * vMin; }
}

function step(dt) {
  time += dt;
  grid.rebuild(fish);

  // --- fish: one neighbor pass accumulates all three boids sums ---
  for (const f of fish) {
    f.ax = 0; f.ay = 0;
    let sepX = 0, sepY = 0;
    let aliX = 0, aliY = 0;
    let cohX = 0, cohY = 0;
    let n = 0;

    grid.forNeighbors(f.x, f.y, FISH.view, (o) => {
      if (o === f) return;
      const dx = f.x - o.x, dy = f.y - o.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > FISH.view * FISH.view) return;
      n++;
      aliX += o.vx; aliY += o.vy;
      cohX += o.x; cohY += o.y;
      if (d2 < FISH.sepR * FISH.sepR && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        sepX += (dx / d) * (1 - d / FISH.sepR);   // closer = pushier
        sepY += (dy / d) * (1 - d / FISH.sepR);
      }
    });

    if (n > 0) {
      if (sepX || sepY) steer(f, sepX, sepY, FISH.vMax, FISH.force, FISH.wSep);
      steer(f, aliX, aliY, FISH.vMax, FISH.force, FISH.wAlign);
      steer(f, cohX / n - f.x, cohY / n - f.y, FISH.vMax, FISH.force, FISH.wCoh);
    }

    // fear — few predators, direct loop beats the grid
    for (const p of preds) {
      const dx = f.x - p.x, dy = f.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < FISH.fear * FISH.fear && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        steer(f, dx, dy, FISH.vMax, FISH.force, FISH.wFlee * (1 - d / FISH.fear));
      }
    }

    // pointer — a soft threat you can herd them with
    const mdx = f.x - mouse.x, mdy = f.y - mouse.y;
    const md2 = mdx * mdx + mdy * mdy;
    if (md2 < FISH.cursorR * FISH.cursorR && md2 > 1e-6) {
      const d = Math.sqrt(md2);
      steer(f, mdx, mdy, FISH.vMax, FISH.force, FISH.wCursor * (1 - d / FISH.cursorR));
    }

    edgeForce(f, FISH.force, FISH.wEdge);

    f.vx += f.ax * dt;
    f.vy += f.ay * dt;
    clampSpeed(f, FISH.vMin, FISH.vMax);
    f.x += f.vx * dt;
    f.y += f.vy * dt;
  }

  // --- predators -----------------------------------------------
  for (const p of preds) {
    p.ax = 0; p.ay = 0;

    if (p.rest > 0) {
      // digesting — drift, ignore the buffet
      p.rest -= dt;
      p.target = null;
      steer(p, p.vx, p.vy, PRED.vRest, PRED.force * 0.5, 1);
    } else {
      // keep current target while plausible, else re-acquire nearest
      let t = p.target;
      if (t) {
        const d2 = (t.x - p.x) ** 2 + (t.y - p.y) ** 2;
        if (t.dead || d2 > (PRED.sight * 1.2) ** 2) t = null;
      }
      if (!t) {
        let best = PRED.sight * PRED.sight;
        grid.forNeighbors(p.x, p.y, PRED.sight, (f) => {
          const d2 = (f.x - p.x) ** 2 + (f.y - p.y) ** 2;
          if (d2 < best) { best = d2; t = f; }
        });
      }
      p.target = t;

      if (t) {
        const dx = t.x - p.x, dy = t.y - p.y;
        const d = Math.hypot(dx, dy);
        // pursuit with lead — aim where the fish is going
        const lead = Math.min(d / PRED.vMax, 0.4);
        const sp = d < PRED.lungeR ? PRED.vMax : PRED.vCruise;
        steer(p, dx + t.vx * lead, dy + t.vy * lead, sp, PRED.force, 1);

        if (d < PRED.killR) {
          // caught one
          catches++;
          p.catches++;
          p.rest = PRED.restTime;
          p.target = null;
          fx.push({ x: t.x, y: t.y, t: 0 });
          const nf = spawnFish(true);          // population stays fixed
          t.x = nf.x; t.y = nf.y; t.vx = nf.vx; t.vy = nf.vy;
        }
      } else {
        // no prey in sight — wander
        p.wa += (rng() - 0.5) * 3.0 * Math.sqrt(dt);
        steer(p, Math.cos(p.wa), Math.sin(p.wa), PRED.vCruise, PRED.force * 0.6, 1);
      }
    }

    // predators keep their distance from each other
    for (const o of preds) {
      if (o === p) continue;
      const dx = p.x - o.x, dy = p.y - o.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 80 * 80 && d2 > 1e-6) {
        steer(p, dx, dy, PRED.vCruise, PRED.force, PRED.wSep);
      }
    }

    edgeForce(p, PRED.force, 1.5);

    p.vx += p.ax * dt;
    p.vy += p.ay * dt;
    clampSpeed(p, 0, p.rest > 0 ? PRED.vRest : PRED.vMax);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }

  // ambient
  for (const pl of plankton) {
    pl.y += pl.vy * dt;
    if (pl.y < -4) { pl.y = stage.h + 4; pl.x = Math.random() * stage.w; }
  }
  for (let i = fx.length - 1; i >= 0; i--) {
    fx[i].t += dt;
    if (fx[i].t > 0.5) fx.splice(i, 1);
  }
}

// ---------- rendering ---------------------------------------------

// local dart shape -> world coords, given heading cos/sin
function dart(ctx, x, y, c, s, k, pts) {
  ctx.moveTo(x + (pts[0] * c - pts[1] * s) * k, y + (pts[0] * s + pts[1] * c) * k);
  for (let i = 2; i < pts.length; i += 2) {
    ctx.lineTo(x + (pts[i] * c - pts[i + 1] * s) * k, y + (pts[i] * s + pts[i + 1] * c) * k);
  }
  ctx.closePath();
}

const FISH_PTS = [6.5, 0, -4.5, 3.2, -2.5, 0, -4.5, -3.2];
const PRED_PTS = [16, 0, -11, 6.5, -6.5, 0, -11, -6.5];

function draw() {
  const { ctx } = stage;
  ctx.fillStyle = bgGrad || '#060a10';
  ctx.fillRect(0, 0, stage.w, stage.h);

  // plankton — drifting depth cue
  ctx.fillStyle = 'rgba(125, 226, 209, 0.13)';
  ctx.beginPath();
  for (const pl of plankton) {
    const tw = 0.6 + 0.4 * Math.sin(time * 1.7 + pl.ph);
    ctx.moveTo(pl.x + pl.r * tw, pl.y);
    ctx.arc(pl.x, pl.y, pl.r * tw, 0, Math.PI * 2);
  }
  ctx.fill();

  // fish, batched per shade bucket
  for (let b = 0; b < SHADES.length; b++) {
    ctx.fillStyle = SHADES[b];
    ctx.beginPath();
    for (const f of fish) {
      if (f.shade !== b) continue;
      const a = Math.atan2(f.vy, f.vx);
      dart(ctx, f.x, f.y, Math.cos(a), Math.sin(a), f.s, FISH_PTS);
    }
    ctx.fill();
  }

  // predators
  for (const p of preds) {
    const a = Math.atan2(p.vy, p.vx);
    const resting = p.rest > 0;
    ctx.fillStyle = `rgba(${AMBER}, ${resting ? 0.45 : 0.9})`;
    ctx.beginPath();
    dart(ctx, p.x, p.y, Math.cos(a), Math.sin(a), 1, PRED_PTS);
    ctx.fill();
  }

  // catch rings
  for (const e of fx) {
    const k = e.t / 0.5;
    ctx.strokeStyle = `rgba(${AMBER}, ${0.7 * (1 - k)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 4 + k * 26, 0, Math.PI * 2);
    ctx.stroke();
  }

  updateHud();
}

function syncDraw() {
  if (ready && !loop.running) draw();
}

// ---------- hud ----------------------------------------------------

const setFish = stat(hudEl, 'fish');
const setPreds = stat(hudEl, 'predators');
const setPhi = stat(hudEl, 'φ');            // polarization order parameter
const setCatches = stat(hudEl, 'catches');
let hudAt = 0;

function updateHud() {
  const now = performance.now();
  if (now - hudAt < 250) return;
  hudAt = now;

  // φ = |Σ v̂| / N — 1.0 is a perfectly aligned school, ~0 is milling
  let ux = 0, uy = 0;
  for (const f of fish) {
    const sp = Math.hypot(f.vx, f.vy);
    if (sp > 1e-6) { ux += f.vx / sp; uy += f.vy / sp; }
  }
  const phi = fish.length ? Math.hypot(ux, uy) / fish.length : 0;

  setFish(fish.length);
  setPreds(preds.length);
  setPhi(phi.toFixed(2));
  setCatches(catches);
}

// ---------- input & controls ---------------------------------------

canvas.addEventListener('pointermove', (e) => { mouse.x = e.offsetX; mouse.y = e.offsetY; });
canvas.addEventListener('pointerdown', (e) => { mouse.x = e.offsetX; mouse.y = e.offsetY; });
canvas.addEventListener('pointerup', () => { mouse.x = -1e4; mouse.y = -1e4; });
canvas.addEventListener('pointerleave', () => { mouse.x = -1e4; mouse.y = -1e4; });

const loop = createLoop({ step, draw });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

slider(ctrlEl, {
  label: 'fish', min: 20, max: 800, step: 10, value: DEFAULTS.fish,
  onInput: setFishCount,
});
slider(ctrlEl, {
  label: 'predators', min: 0, max: 8, value: DEFAULTS.preds,
  onInput: setPredCount,
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

button(ctrlEl, {
  label: 'reset', icon: 'redo',
  onClick: () => { reset(); syncDraw(); },
});

// ---------- go ------------------------------------------------------

setFishCount(DEFAULTS.fish);
setPredCount(DEFAULTS.preds);
seedPlankton();
ready = true;

if (reducedMotion) {
  draw();          // a still of the school; play is one tap away
} else {
  loop.start();
}
