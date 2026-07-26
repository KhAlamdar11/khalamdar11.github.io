/* ============================================================
   ui.js — tiny DOM helpers for #game-controls and #game-hud,
   so every game's chrome looks the same without repeating
   createElement boilerplate.
   ============================================================ */

export function slider(parent, { label, min, max, step = 1, value, onInput }) {
  const wrap = document.createElement('label');
  wrap.className = 'ctrl';

  const name = document.createElement('span');
  name.className = 'ctrl-label';
  name.textContent = label;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;

  const out = document.createElement('span');
  out.className = 'ctrl-value';
  out.textContent = value;

  input.addEventListener('input', () => {
    const v = Number(input.value);
    out.textContent = v;
    onInput(v);
  });

  wrap.append(name, input, out);
  parent.appendChild(wrap);
  return input;
}

export function button(parent, { label, icon, onClick }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-sm';
  btn.innerHTML = (icon ? `<i class="fas fa-${icon}"></i> ` : '') + label;
  btn.addEventListener('click', onClick);
  parent.appendChild(btn);
  return btn;
}

// HUD readout — returns a setter so the game can update it cheaply
export function stat(parent, label) {
  const box = document.createElement('div');
  box.className = 'hud-stat';
  const val = document.createElement('b');
  box.append(label + ' ', val);
  parent.appendChild(box);
  return (v) => { val.textContent = v; };
}
