/* ============================================================
   stage.js — canvas sizing. CSS decides the box (the .game-stage
   aspect ratio), this matches the bitmap to it at device pixel
   ratio and keeps it matched through resizes.
   ============================================================ */

export function createStage(canvas, onResize) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;

  function resize() {
    // clientWidth/Height: content box, integer, excludes the border
    const nw = Math.max(1, canvas.parentElement.clientWidth);
    const nh = Math.max(1, canvas.parentElement.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bw = Math.round(nw * dpr);
    if (nw === w && nh === h && canvas.width === bw) return;
    w = nw;
    h = nh;
    canvas.width = bw;
    canvas.height = Math.round(nh * dpr);
    // pin the display size inline — the bitmap must never feed back
    // into the parent's measured size (that loop grows the canvas
    // past the browser limit and it renders as a blank white slab)
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (onResize) onResize(w, h);
  }

  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();

  return {
    ctx,
    get w() { return w; },
    get h() { return h; },
  };
}
