/* ============================================================
   loop.js — fixed-timestep simulation loop.
   Physics steps at a constant hz regardless of display refresh,
   so a run is deterministic and a 144 Hz monitor doesn't make
   the fish faster. Auto-pauses on hidden tabs.
   ============================================================ */

export function createLoop({ step, draw, hz = 60 }) {
  const dt = 1 / hz;
  const MAX_FRAME = 0.25; // clamp after long stalls — no spiral of death
  let acc = 0, last = 0, rafId = null, running = false;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const t = now / 1000;
    acc += Math.min(t - last, MAX_FRAME);
    last = t;
    while (acc >= dt) {
      step(dt);
      acc -= dt;
    }
    draw();
  }

  const api = {
    start() {
      if (running) return;
      running = true;
      last = performance.now() / 1000;
      acc = 0;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
    get running() { return running; },
  };

  // hidden tab: stop burning cycles; resume only if we were running
  let wasRunning = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      wasRunning = running;
      api.stop();
    } else if (wasRunning) {
      api.start();
    }
  });

  return api;
}
