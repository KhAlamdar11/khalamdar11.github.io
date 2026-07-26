---
title: Sheepdog — Khawaja G. Alamdar
name: Sheepdog
tagline: You are the dog. The sheep have other plans — apply pressure until they don't. Against the clock.
year: 2026
tech: [herding, boids, canvas 2d]
status: playable
glyph: "∴"
order: 2
script: /assets/js/games/sheepdog.js
source: https://github.com/KhAlamdar11/khalamdar11.github.io/blob/main/assets/js/games/sheepdog.js
---

## the rules

Sheep are boids with one twist: **their flocking urge scales with fear**. A calm sheep barely acknowledges the flock — it grazes, drifts, keeps a little personal space. A frightened sheep urgently wants to be surrounded by other sheep. That's Hamilton's *selfish herd* in one line of code, and it's what makes herding possible at all: pressure doesn't just move sheep, it *consolidates* them.

You are the amber dart. Your only actuator is where you stand — sheep within ~130&nbsp;px flee directly away from you, harder the closer you are. Get all of them through the gate. The clock starts on your first move; your best time per flock size is kept in localStorage.

## how to herd

- **Push from behind the flock, opposite the gate.** Straight lines only exist if you make them.
- **Wide arcs beat direct charges.** Rush the middle of a flock and it splits — now you have two problems.
- **Ease off near the gate.** Panicked sheep overshoot; a slow squeeze funnels them through.
- The fence calms them — penned sheep stop caring about you entirely.

## what to look for

The pressure bubble in front of you, the flock re-fusing after a bad split, and the classic beginner's mistake: pinning the flock into a corner that isn't the pen. More sheep is genuinely harder — the flock gets fluid and leaks around your arc.

## notes

Changing the flock size resets the run — times are only comparable at fixed difficulty. Same engine as Bait Ball: fixed 60&nbsp;Hz steps, spatial hash for the flock neighborhood, seeded PRNG.
