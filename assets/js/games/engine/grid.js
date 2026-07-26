/* ============================================================
   grid.js — uniform spatial hash for radius neighbor queries.
   "Who is within r of me" is THE question in a multi-agent sim;
   this answers it in O(k) instead of O(n). Rebuild once per
   step, query as often as you like.
   ============================================================ */

export function createGrid(cellSize) {
  const map = new Map();
  // world is at most a few dozen cells wide — 10 bits per axis is plenty
  const keyOf = (cx, cy) => ((cx & 1023) << 10) | (cy & 1023);

  return {
    rebuild(items) {
      map.clear();
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const k = keyOf(Math.floor(it.x / cellSize), Math.floor(it.y / cellSize));
        let bucket = map.get(k);
        if (!bucket) map.set(k, bucket = []);
        bucket.push(it);
      }
    },

    // Visits everything in cells overlapping the circle (x, y, r).
    // Coarse by design — the callback does the exact distance check.
    forNeighbors(x, y, r, cb) {
      const cx0 = Math.floor((x - r) / cellSize);
      const cx1 = Math.floor((x + r) / cellSize);
      const cy0 = Math.floor((y - r) / cellSize);
      const cy1 = Math.floor((y + r) / cellSize);
      for (let cy = cy0; cy <= cy1; cy++) {
        for (let cx = cx0; cx <= cx1; cx++) {
          const bucket = map.get(keyOf(cx, cy));
          if (bucket) {
            for (let i = 0; i < bucket.length; i++) cb(bucket[i]);
          }
        }
      }
    },
  };
}
