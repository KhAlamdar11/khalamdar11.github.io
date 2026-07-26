/* ============================================================
   sheepdog.js — you are the dog.

   Sheep are boids with a twist: their flocking urge scales with
   fear (the selfish herd — a scared sheep wants to be a middle
   sheep). Calm sheep graze and drift apart; pressured sheep
   bunch and flow. Your only actuator is where you stand.
   Get them all through the gate. The clock is running.
   ============================================================ */

import { createStage } from './engine/stage.js';
import { createLoop } from './engine/loop.js';
import { createGrid } from './engine/grid.js';
import { mulberry32, randomSeed } from './engine/rng.js';
import { slider, button, stat } from './engine/ui.js';
import { steer, edgeAvoid, clampSpeed } from './engine/steering.js';

// ---------- tuning ------------------------------------------------

const SHEEP = {
  view: 46,      // flock neighborhood
  sepR: 14,      // personal space
  flee: 130,     // dog pressure radius
  wSep: 1.4,
  wFlee: 2.6,
  wEdge: 1.5,
  vGraze: 24,    // amble
  vMax: 135,     // full panic
  force: 380,
};

const DOG = {
  vMax: 300,     // much faster than sheep — position is your skill
  force: 1100,
  arrive: 90,    // decelerate near the pointer
};

const CELL = 48;
const DEFAULTS = { sheep: 24 };

const WOOL = ['rgba(236,240,245,0.95)', 'rgba(220,227,235,0.95)', 'rgba(242,240,231,0.95)'];
const HEAD = 'rgba(27,35,45,0.92)';
const AMBER = '251, 191, 36';
const TEAL = '125, 226, 209';

// ---------- state -------------------------------------------------

const canvas = document.getElementById('game-canvas');
const hudEl = document.getElementById('game-hud');
const ctrlEl = document.getElementById('game-controls');

let rng = mulberry32(randomSeed());
const sheep = [];
const dog = { x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0 };
const fx = [];
const tufts = [];                    // static grass marks
let sheepTarget = DEFAULTS.sheep;
let time = 0;
let started = false;                 // clock starts on first pointer input
let won = false;
let best = 0;
const mouse = { x: -1e4, y: -1e4 };

const grid = createGrid(CELL);
let bgGrad = null;
let ready = false;

const stage = createStage(canvas, (w, h) => {
  bgGrad = canvas.getContext('2d').createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0c1a13');       // pasture, after dark
  bgGrad.addColorStop(1, '#060d09');
  tufts.length = 0;
  for (let i = 0; i < Math.round((w * h) / 18000); i++) {
    tufts.push({ x: Math.random() * w, y: Math.random() * h, a: Math.random() * Math.PI });
  }
  syncDraw();
});

// ---------- the pen -----------------------------------------------

// computed from stage size so it survives resizes and phones
function pen() {
  const pw = Math.min(190, Math.max(115, stage.w * 0.2));
  const ph = Math.min(175, Math.max(110, stage.h * 0.32));
  const x0 = stage.w - pw - Math.max(24, stage.w * 0.04);
  const y0 = (stage.h - ph) / 2;
  const gate = Math.min(64, ph * 0.42);
  return {
    x0, y0, x1: x0 + pw, y1: y0 + ph,
    gy0: y0 + (ph - gate) / 2,
    gy1: y0 + (ph + gate) / 2,
  };
}

// three solid walls, plus two segments around the gate on the left
function walls(p) {
  return [
    [p.x0, p.y0, p.x1, p.y0],
    [p.x0, p.y1, p.x1, p.y1],
    [p.x1, p.y0, p.x1, p.y1],
    [p.x0, p.y0, p.x0, p.gy0],
    [p.x0, p.gy1, p.x0, p.y1],
  ];
}

// push a sheep out of a wall segment and kill its inward velocity
function resolveWall(s, seg, r) {
  const [x1, y1, x2, y2] = seg;
  const ex = x2 - x1, ey = y2 - y1;
  const len2 = ex * ex + ey * ey;
  let t = ((s.x - x1) * ex + (s.y - y1) * ey) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + ex * t, qy = y1 + ey * t;
  const dx = s.x - qx, dy = s.y - qy;
  const d = Math.hypot(dx, dy);
  if (d >= r || d < 1e-6) return;
  const nx = dx / d, ny = dy / d;
  s.x = qx + nx * r;
  s.y = qy + ny * r;
  const into = s.vx * nx + s.vy * ny;
  if (into < 0) { s.vx -= into * nx; s.vy -= into * ny; }
}

function insidePen(s, p, m) {
  return s.x > p.x0 + m && s.x < p.x1 - m && s.y > p.y0 + m && s.y < p.y1 - m;
}

// ---------- spawning / reset ---------------------------------------

function spawnSheep() {
  return {
    x: stage.w * (0.08 + rng() * 0.35),        // flock starts field-left
    y: stage.h * (0.2 + rng() * 0.6),
    vx: 0, vy: 0, ax: 0, ay: 0,
    ga: rng() * Math.PI * 2,                   // graze heading
    panic: 0,
    penned: false,
    s: 0.85 + rng() * 0.35,
    wool: Math.floor(rng() * WOOL.length),
  };
}

function loadBest() {
  try { return Number(localStorage.getItem('sheepdog-best-' + sheepTarget)) || 0; }
  catch { return 0; }
}

function saveBest(t) {
  try { localStorage.setItem('sheepdog-best-' + sheepTarget, String(t)); }
  catch { /* private browsing — the sheep won't remember you */ }
}

function reset() {
  rng = mulberry32(randomSeed());
  sheep.length = 0;
  for (let i = 0; i < sheepTarget; i++) sheep.push(spawnSheep());
  dog.x = stage.w * 0.5;
  dog.y = stage.h - 30;
  dog.vx = dog.vy = 0;
  fx.length = 0;
  time = 0;
  started = false;
  won = false;
  best = loadBest();
  syncDraw();
}

// ---------- simulation ---------------------------------------------

function step(dt) {
  if (started && !won) time += dt;
  const p = pen();
  const W = walls(p);
  grid.rebuild(sheep);

  // --- dog: arrive at the pointer --------------------------------
  dog.ax = 0; dog.ay = 0;
  if (mouse.x > -1e3) {
    const dx = mouse.x - dog.x, dy = mouse.y - dog.y;
    const d = Math.hypot(dx, dy);
    const sp = DOG.vMax * Math.min(1, d / DOG.arrive);
    steer(dog, dx, dy, sp, DOG.force, 1);
  } else {
    dog.vx *= Math.exp(-4 * dt);               // pointer gone — settle
    dog.vy *= Math.exp(-4 * dt);
  }
  dog.vx += dog.ax * dt;
  dog.vy += dog.ay * dt;
  clampSpeed(dog, 0, DOG.vMax);
  dog.x = Math.max(4, Math.min(stage.w - 4, dog.x + dog.vx * dt));
  dog.y = Math.max(4, Math.min(stage.h - 4, dog.y + dog.vy * dt));

  // --- sheep -------------------------------------------------------
  for (const s of sheep) {
    s.ax = 0; s.ay = 0;

    let sepX = 0, sepY = 0, aliX = 0, aliY = 0, cohX = 0, cohY = 0, n = 0;
    grid.forNeighbors(s.x, s.y, SHEEP.view, (o) => {
      if (o === s) return;
      const dx = s.x - o.x, dy = s.y - o.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > SHEEP.view * SHEEP.view) return;
      n++;
      aliX += o.vx; aliY += o.vy;
      cohX += o.x; cohY += o.y;
      if (d2 < SHEEP.sepR * SHEEP.sepR && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        sepX += (dx / d) * (1 - d / SHEEP.sepR);
        sepY += (dy / d) * (1 - d / SHEEP.sepR);
      }
    });

    // fear of the dog — a fence is a wonderful anxiolytic
    let fear = 0;
    if (!s.penned) {
      const dx = s.x - dog.x, dy = s.y - dog.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < SHEEP.flee * SHEEP.flee && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        fear = 1 - d / SHEEP.flee;
        steer(s, dx, dy, SHEEP.vMax, SHEEP.force, SHEEP.wFlee * fear);
      }
    }
    s.panic = Math.max(s.panic * Math.exp(-1.6 * dt), fear);

    // the selfish herd: flocking urges scale with panic
    if (n > 0) {
      if (sepX || sepY) steer(s, sepX, sepY, SHEEP.vMax, SHEEP.force, SHEEP.wSep);
      steer(s, cohX / n - s.x, cohY / n - s.y, SHEEP.vMax, SHEEP.force, 0.25 + 1.1 * s.panic);
      if (s.panic > 0.05) steer(s, aliX, aliY, SHEEP.vMax, SHEEP.force, 0.8 * s.panic);
    }

    // graze — a slow, indifferent random walk
    s.ga += (rng() - 0.5) * 2.2 * Math.sqrt(dt);
    if (s.panic < 0.2) {
      steer(s, Math.cos(s.ga), Math.sin(s.ga), SHEEP.vGraze, SHEEP.force, 0.35);
    }

    edgeAvoid(s, stage.w, stage.h, 30, SHEEP.force, SHEEP.wEdge);

    // calm sheep bleed speed; panicked sheep don't
    const damp = Math.exp(-2 * dt * (1 - s.panic));
    s.vx = s.vx * damp + s.ax * dt;
    s.vy = s.vy * damp + s.ay * dt;
    clampSpeed(s, 0, SHEEP.vGraze + (SHEEP.vMax - SHEEP.vGraze) * s.panic);
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    for (const seg of W) resolveWall(s, seg, 6);
    s.x = Math.max(3, Math.min(stage.w - 3, s.x));
    s.y = Math.max(3, Math.min(stage.h - 3, s.y));

    if (!s.penned && insidePen(s, p, 10)) {
      s.penned = true;
      s.panic = 0;
      fx.push({ x: s.x, y: s.y, t: 0, big: false });
    }
    if (s.penned) {
      s.x = Math.max(p.x0 + 8, Math.min(p.x1 - 8, s.x));
      s.y = Math.max(p.y0 + 8, Math.min(p.y1 - 8, s.y));
    }
  }

  // --- win ----------------------------------------------------------
  if (started && !won && sheep.length && sheep.every((s) => s.penned)) {
    won = true;
    if (!best || time < best) { best = time; saveBest(time); }
    fx.push({ x: (p.x0 + p.x1) / 2, y: (p.y0 + p.y1) / 2, t: 0, big: true });
  }

  for (let i = fx.length - 1; i >= 0; i--) {
    fx[i].t += dt;
    if (fx[i].t > (fx[i].big ? 1.2 : 0.5)) fx.splice(i, 1);
  }
}

// ---------- rendering -----------------------------------------------

function draw() {
  const { ctx } = stage;
  ctx.fillStyle = bgGrad || '#060d09';
  ctx.fillRect(0, 0, stage.w, stage.h);

  // grass
  ctx.strokeStyle = 'rgba(125, 226, 209, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const t of tufts) {
    ctx.moveTo(t.x, t.y);
    ctx.lineTo(t.x + Math.cos(t.a) * 4, t.y - 3);
  }
  ctx.stroke();

  const p = pen();

  // pen interior
  ctx.fillStyle = 'rgba(125, 226, 209, 0.045)';
  ctx.fillRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);

  // sheep — bodies batched per wool shade, then heads in one pass
  for (let b = 0; b < WOOL.length; b++) {
    ctx.fillStyle = WOOL[b];
    ctx.beginPath();
    for (const s of sheep) {
      if (s.wool !== b) continue;
      ctx.moveTo(s.x + 4.2 * s.s, s.y);
      ctx.arc(s.x, s.y, 4.2 * s.s, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.fillStyle = HEAD;
  ctx.beginPath();
  for (const s of sheep) {
    const sp = Math.hypot(s.vx, s.vy);
    const a = sp > 4 ? Math.atan2(s.vy, s.vx) : s.ga;
    const hx = s.x + Math.cos(a) * 4.6 * s.s;
    const hy = s.y + Math.sin(a) * 4.6 * s.s;
    ctx.moveTo(hx + 1.9 * s.s, hy);
    ctx.arc(hx, hy, 1.9 * s.s, 0, Math.PI * 2);
  }
  ctx.fill();

  // dog — amber dart, same species as the site's relay agents
  {
    const a = Math.atan2(dog.vy, dog.vx) || 0;
    const c = Math.cos(a), sn = Math.sin(a);
    const pts = [12, 0, -8, 5, -5, 0, -8, -5];
    ctx.fillStyle = `rgba(${AMBER}, 0.95)`;
    ctx.beginPath();
    ctx.moveTo(dog.x + pts[0] * c - pts[1] * sn, dog.y + pts[0] * sn + pts[1] * c);
    for (let i = 2; i < pts.length; i += 2) {
      ctx.lineTo(dog.x + pts[i] * c - pts[i + 1] * sn, dog.y + pts[i] * sn + pts[i + 1] * c);
    }
    ctx.closePath();
    ctx.fill();
  }

  // pen walls over the animals — the fence is in front
  ctx.strokeStyle = `rgba(${TEAL}, 0.55)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const [x1, y1, x2, y2] of walls(p)) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  ctx.fillStyle = `rgba(${AMBER}, 0.9)`;          // gate posts
  ctx.beginPath();
  ctx.arc(p.x0, p.gy0, 2.5, 0, Math.PI * 2);
  ctx.arc(p.x0, p.gy1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // fx rings
  for (const e of fx) {
    const life = e.big ? 1.2 : 0.5;
    const k = e.t / life;
    ctx.strokeStyle = `rgba(${TEAL}, ${0.7 * (1 - k)})`;
    ctx.lineWidth = e.big ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 4 + k * (e.big ? 90 : 22), 0, Math.PI * 2);
    ctx.stroke();
  }

  // text layers
  ctx.textAlign = 'center';
  if (!started) {
    ctx.fillStyle = 'rgba(232, 237, 242, 0.55)';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillText('move the pointer — you are the dog', stage.w / 2, stage.h - 24);
  }
  if (won) {
    ctx.fillStyle = 'rgba(7, 9, 15, 0.72)';
    ctx.fillRect(stage.w / 2 - 170, stage.h / 2 - 46, 340, 92);
    ctx.fillStyle = `rgba(${TEAL}, 0.95)`;
    ctx.font = '600 21px "JetBrains Mono", monospace';
    ctx.fillText(`flock secured — ${time.toFixed(1)}s`, stage.w / 2, stage.h / 2 - 8);
    ctx.fillStyle = 'rgba(154, 167, 182, 0.9)';
    ctx.font = '400 13px "JetBrains Mono", monospace';
    ctx.fillText(`best ${best.toFixed(1)}s · reset to run it back`, stage.w / 2, stage.h / 2 + 22);
  }

  updateHud();
}

function syncDraw() {
  if (ready && !loop.running) draw();
}

// ---------- hud & controls ------------------------------------------

const setPenned = stat(hudEl, 'penned');
const setTime = stat(hudEl, 'time');
const setBest = stat(hudEl, 'best');
let hudAt = 0;

function updateHud() {
  const now = performance.now();
  if (now - hudAt < 100) return;
  hudAt = now;
  let n = 0;
  for (const s of sheep) if (s.penned) n++;
  setPenned(`${n}/${sheep.length}`);
  setTime(time.toFixed(1) + 's');
  setBest(best ? best.toFixed(1) + 's' : '—');
}

canvas.addEventListener('pointermove', (e) => {
  mouse.x = e.offsetX; mouse.y = e.offsetY;
  started = true;
});
canvas.addEventListener('pointerdown', (e) => {
  mouse.x = e.offsetX; mouse.y = e.offsetY;
  started = true;
});
canvas.addEventListener('pointerleave', () => { mouse.x = -1e4; mouse.y = -1e4; });

const loop = createLoop({ step, draw });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

slider(ctrlEl, {
  label: 'sheep', min: 6, max: 60, step: 2, value: DEFAULTS.sheep,
  onInput: (v) => { sheepTarget = v; reset(); },   // new flock, fresh clock
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

// ---------- go -------------------------------------------------------

reset();
ready = true;

if (reducedMotion) {
  draw();
} else {
  loop.start();
}
