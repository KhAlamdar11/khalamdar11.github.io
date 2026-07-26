---
title: Kessler — Khawaja G. Alamdar
name: Kessler
tagline: A healthy constellation, one click, and a cascade that either fizzles or takes the whole shell. Density decides.
year: 2026
tech: [orbital debris, n-body, canvas 2d]
status: playable
glyph: "⋇"
order: 5
script: /assets/js/games/kessler.js
source: https://github.com/KhAlamdar11/khalamdar11.github.io/blob/main/assets/js/games/kessler.js
---

## the rules

The teal dots are satellites on tidy circular orbits — co-orbiting traffic with almost no relative velocity, which is why a crowded shell can be perfectly safe. Until it isn't.

**Click a satellite.** It fragments into debris with random velocity kicks, and that's the whole difference: fragments fly on eccentric orbits that *cross* the shell, meeting satellites at killing speed. Every satellite hit becomes more fragments. Whether the chain reaction dies out or consumes the constellation is not about the first explosion — it's about how much traffic the fragments can find.

## the experiment

The `satellites` slider is a control parameter and the cascade is a phase transition. Run the same click at 40 satellites and at 250:

- **sparse shell** — a burst of amber, a few unlucky hits, then the drag claims the debris and it's over
- **dense shell** — each generation of fragments finds targets faster than decay removes them, and the constellation unravels in a chain you can watch generation by generation

Somewhere in between is the critical density. Find it — it's sharper than you'd expect.

## notes

Kessler &amp; Cour-Palais predicted this regime in 1978; it's the reason debris mitigation rules exist. This is a toy: two dimensions, exaggerated collision cross-sections, and atmospheric drag compressed from decades to ~30 seconds (debris dims as it nears burn-up) — the compression is what lets you see the threshold in a minute. Collisions between co-orbiting neighbors are ignored below a relative-speed floor, which is also why the constellation is stable until you interfere. Orbits are leapfrog-integrated; fragments that dip too low burn up, and slingshots out of the shell are gone for good.
