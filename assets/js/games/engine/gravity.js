/* ============================================================
   gravity.js — point-mass gravity with a leapfrog integrator.

   Leapfrog (kick-drift-kick) is symplectic: energy errors stay
   bounded instead of accumulating, so an orbit is still an
   orbit after ten thousand steps. Euler would spiral everything
   into the planet within a minute — ask me how I know.

   Bodies carry x, y, vx, vy, ax, ay. Call applyGravity once at
   spawn so the stored acceleration is valid, then leapfrog each
   step. Sources are { x, y, gm } — gm is G·M premultiplied.
   ============================================================ */

// softened inverse-square pull from every source, written into b.ax/ay
export function applyGravity(b, sources, eps2) {
  b.ax = 0;
  b.ay = 0;
  for (const s of sources) {
    const dx = s.x - b.x, dy = s.y - b.y;
    const d2 = dx * dx + dy * dy + eps2;
    const inv = s.gm / (d2 * Math.sqrt(d2));
    b.ax += dx * inv;
    b.ay += dy * inv;
  }
}

// one kick-drift-kick step; b.ax/ay must hold accel at b's position
export function leapfrog(b, sources, eps2, dt) {
  b.vx += b.ax * dt / 2;
  b.vy += b.ay * dt / 2;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  applyGravity(b, sources, eps2);
  b.vx += b.ax * dt / 2;
  b.vy += b.ay * dt / 2;
}

// put b on a circular orbit around c ({ x, y, gm }); dir +1 = CCW
export function setCircularOrbit(b, c, dir = 1) {
  const dx = b.x - c.x, dy = b.y - c.y;
  const r = Math.hypot(dx, dy);
  if (r < 1e-6) return;
  const v = Math.sqrt(c.gm / r) * dir;
  b.vx = (-dy / r) * v;
  b.vy = (dx / r) * v;
}
