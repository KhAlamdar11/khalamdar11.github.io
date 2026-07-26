---
title: Shepherd Moons — Khawaja G. Alamdar
name: Shepherd Moons
tagline: A planetary ring of thousands, sculpted by two small moons. The dog herds sheep; the moons herd rocks.
year: 2026
tech: [n-body, leapfrog, canvas 2d]
status: playable
glyph: "◎"
order: 4
script: /assets/js/games/shepherd-moons.js
source: https://github.com/KhAlamdar11/khalamdar11.github.io/blob/main/assets/js/games/shepherd-moons.js
---

## the rules

Every ring particle is a test mass on a Kepler orbit. It feels the planet and the moons — nothing else, and the particles never feel each other. The moons are tiny (mass ratio ~10⁻³) yet they own the ring: a particle drifting near a moon's orbit gets a gravitational tug every pass, the tugs accumulate, and the particle is either handed inward, handed outward, or thrown out of the system entirely.

Nobody draws the gaps. They're just where nothing can survive.

## play

**Drag a moon.** While you hold it you'll see its Hill sphere — the region where the moon's gravity beats the planet's. Drop it anywhere and it recircularizes into a prograde orbit at that radius; over the next minute the ring restructures around the new arrangement. Drag a moon slowly *through* the ring and watch the wake it plows.

## what to look for

- **gap clearing** — a lane opens along each moon's orbit, over a few orbital periods
- **wakes** — scalloped ripples at the gap edges, sharpest just ahead of and behind the moon (Saturn's F-ring shepherds, Prometheus and Pandora, do exactly this)
- **horseshoe survivors** — some particles co-orbit with a moon and flip between slightly-inside and slightly-outside orbits without ever being expelled
- **erosion** — the `ejected` and `accreted` counters are the ring's slow death by moon: every close encounter is a gravitational slingshot going somewhere

## notes

Integration is leapfrog (kick-drift-kick) — symplectic, so orbits stay orbits over thousands of steps instead of numerically spiraling in. The moon mass is exaggerated ~10⁶× over real shepherd moons so the sculpting takes a minute instead of a millennium; the `speed` slider stacks substeps if you're impatient anyway.
