/* ============================================================
   swarm.js — a tiny multi-agent system living in the background.
   Agents wander, maintain connectivity links with nearby
   neighbors, and are mildly curious about your cursor.
   λ₂ > 0, always.
   ============================================================ */
(() => {
  const canvas = document.getElementById('swarm-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const NODE = '125, 226, 209';   // teal
  const RELAY = '251, 191, 36';   // amber — every swarm needs a relay drone
  const LINK_DIST = 150;
  const MOUSE_DIST = 200;
  const MAX_SPEED = 0.45;

  let W = 0, H = 0, agents = [], rafId = null, running = false;
  const mouse = { x: -9999, y: -9999 };

  function spawn() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * MAX_SPEED,
      vy: (Math.random() - 0.5) * MAX_SPEED,
      r: 1.3 + Math.random() * 1.7,
      relay: Math.random() < 0.14
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.min(75, Math.max(26, Math.round((W * H) / 26000)));
    while (agents.length < target) agents.push(spawn());
    agents.length = target;
    if (reducedMotion) draw();
  }

  function step() {
    for (const a of agents) {
      // gentle wander
      a.vx += (Math.random() - 0.5) * 0.025;
      a.vy += (Math.random() - 0.5) * 0.025;

      // mild curiosity about the cursor
      const dx = mouse.x - a.x, dy = mouse.y - a.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_DIST * MOUSE_DIST && d2 > 900) {
        const d = Math.sqrt(d2);
        a.vx += (dx / d) * 0.012;
        a.vy += (dy / d) * 0.012;
      }

      // speed cap
      const sp = Math.hypot(a.vx, a.vy);
      if (sp > MAX_SPEED) {
        a.vx = (a.vx / sp) * MAX_SPEED;
        a.vy = (a.vy / sp) * MAX_SPEED;
      }

      a.x += a.vx;
      a.y += a.vy;

      // wrap around — agents that wander off rejoin the mission
      if (a.x < -20) a.x = W + 20;
      if (a.x > W + 20) a.x = -20;
      if (a.y < -20) a.y = H + 20;
      if (a.y > H + 20) a.y = -20;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // connectivity links
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      for (let j = i + 1; j < agents.length; j++) {
        const b = agents[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.32;
          ctx.strokeStyle = `rgba(${NODE}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // link to cursor — you are part of the network now
      const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
      const md2 = mdx * mdx + mdy * mdy;
      if (md2 < MOUSE_DIST * MOUSE_DIST) {
        const alpha = (1 - Math.sqrt(md2) / MOUSE_DIST) * 0.4;
        ctx.strokeStyle = `rgba(${RELAY}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // agents
    for (const a of agents) {
      const c = a.relay ? RELAY : NODE;
      ctx.fillStyle = `rgba(${c}, ${a.relay ? 0.85 : 0.65})`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    step();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reducedMotion) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('pointerleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  resize();
  reducedMotion ? draw() : start();
})();
