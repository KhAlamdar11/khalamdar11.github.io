---
title: Fireflies — Khawaja G. Alamdar
name: Fireflies
tagline: Hundreds of pulse-coupled oscillators finding one beat with no conductor. Click to break the spell — it heals.
year: 2026
tech: [mirollo–strogatz, oscillators, canvas 2d]
status: playable
glyph: "✳"
order: 3
script: /assets/js/games/fireflies.js
source: https://github.com/KhAlamdar11/khalamdar11.github.io/blob/main/assets/js/games/fireflies.js
---

## the rule

Each firefly is a clock charging toward a threshold at its own slightly-wrong rate. When it reaches the threshold it flashes, resets, and gives every neighbor within the coupling radius a small nudge toward *their* threshold — a nudge that's bigger the closer the neighbor already is to firing. That convexity is the whole trick: it's what Mirollo &amp; Strogatz proved drives pulse-coupled oscillators to synchrony (SIAM J. Appl. Math., 1990).

Nobody hears a downbeat. Nobody is the conductor. Watch `sync r` in the HUD — the Kuramoto order parameter, |Σe<sup>iθ</sup>|/N. Random twinkling reads near 0; one shared beat reads 1.

## what to look for

- **From chaos to a beat** — at default settings, sync emerges from random phases in under a minute. The moment it "clicks" is visible: scattered sparks become breathing waves become one pulse.
- **Avalanches** — one flash tips a near-threshold neighbor, which tips another. Whole regions fire in a chain within a single frame.
- **Radius is topology** — small coupling radius gives traveling waves and local patches beating out of phase with each other; crank the radius and the patches merge into lockstep. This is the same story as any decentralized consensus: what you can agree on depends on who you can hear.
- **Coupling at 0** — pure independent clocks. Pretty, but forever incoherent. Even 0.02 changes everything, slowly.

## notes

Click anywhere to scramble the phases in that neighborhood, then watch the surrounding beat re-entrain the damage — the fun is in how *fast* order comes back. Real firefly species in Southeast Asia do this along entire riverbanks. All flashing is slow (~0.6&nbsp;Hz at full sync), far below photosensitivity thresholds.
