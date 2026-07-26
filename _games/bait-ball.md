---
title: Bait Ball — Khawaja G. Alamdar
name: Bait Ball
tagline: A few hundred fish, three local rules each, and a couple of predators to keep them honest. Classic boids under pursuit.
year: 2026
tech: [boids, canvas 2d, es modules]
status: playable
glyph: "≋"
order: 1
script: /assets/js/games/bait-ball.js
source: https://github.com/KhAlamdar11/khalamdar11.github.io/blob/main/assets/js/games/bait-ball.js
---

## the rules

No fish sees the school. Each one steers on what's inside a ~40&nbsp;px bubble around it:

- **separation** — don't crowd the neighbor in front of you
- **alignment** — swim roughly the way nearby fish are swimming
- **cohesion** — drift toward the local center of mass
- **fear** — anything big and amber within 120&nbsp;px overrides everything else

That's the whole controller. Nobody leads, nobody has a map, and the school you see is not programmed anywhere — it's what those four urges add up to.

Predators run pure pursuit with a velocity lead, lunging when close. They're faster than fish in a straight line but force-limited in turns, so the school's agility is its defense. After a catch they're satiated for a couple of seconds — which is exactly when the school reforms.

## what to look for

- **flash expansion** — a predator strikes into the school and it detonates radially around the strike point
- **fountain effect** — fish split around the attacker and regroup behind it, where it can't turn
- **the bait ball** — under sustained pressure the school packs into a dense, rolling ball
- **φ in the HUD** — the polarization order parameter, |Σv̂|/N. A perfectly aligned school reads 1.0; leaderless milling reads near 0. Set predators to zero and watch it climb; add them back and watch structure return.

## notes

The cursor is a soft threat — the fish would rather you kept your distance, which means you can herd them. Simulation steps at a fixed 60&nbsp;Hz with a seeded PRNG, so a run is reproducible; `reset` rerolls the seed. Neighbor queries go through a uniform spatial hash, which is the only reason 800 fish is a slider option and not a slideshow.
