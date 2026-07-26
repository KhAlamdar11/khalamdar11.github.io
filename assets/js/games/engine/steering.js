/* ============================================================
   steering.js — the three moves every steering agent makes:
   head somewhere (force-limited), stay inside the world, and
   respect a speed envelope. Agents carry x, y, vx, vy and
   accumulate into ax, ay.
   ============================================================ */

// steer toward a desired direction at a desired speed, force-limited
export function steer(a, dx, dy, speed, force, w) {
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) return;
  let sx = (dx / d) * speed - a.vx;
  let sy = (dy / d) * speed - a.vy;
  const m = Math.hypot(sx, sy);
  if (m > force) { sx = (sx / m) * force; sy = (sy / m) * force; }
  a.ax += sx * w;
  a.ay += sy * w;
}

// soft walls — push grows linearly inside the margin
export function edgeAvoid(a, w, h, margin, force, weight) {
  if (a.x < margin) a.ax += ((margin - a.x) / margin) * force * weight;
  if (a.x > w - margin) a.ax -= ((a.x - (w - margin)) / margin) * force * weight;
  if (a.y < margin) a.ay += ((margin - a.y) / margin) * force * weight;
  if (a.y > h - margin) a.ay -= ((a.y - (h - margin)) / margin) * force * weight;
}

export function clampSpeed(a, vMin, vMax) {
  const sp = Math.hypot(a.vx, a.vy);
  if (sp > vMax) { a.vx = (a.vx / sp) * vMax; a.vy = (a.vy / sp) * vMax; }
  else if (sp < vMin && sp > 1e-6) { a.vx = (a.vx / sp) * vMin; a.vy = (a.vy / sp) * vMin; }
}
