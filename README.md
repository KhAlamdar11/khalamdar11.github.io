# khalamdar11.github.io

Personal website of **Khawaja G. Alamdar** — researcher in multi-robot systems at LARICS, University of Zagreb.

Live at [khalamdar11.github.io](https://khalamdar11.github.io/).

## Design

A fully custom Jekyll site with a "ground control" aesthetic: dark mission-control theme,
and a live multi-agent swarm in the background (`assets/js/swarm.js`) whose agents maintain
connectivity links with their neighbors — and with your cursor. λ₂ > 0, always.

- `_layouts/default.html` — single page shell (nav, swarm canvas, footer, scroll-reveal)
- `assets/css/main.css` — the whole design system
- `index.md` — hero, about, mission log (news), experience, education, interests
- `publications.md` / `projects.md` — card lists; each file contains a commented template
  block for adding new entries

## Updating content

- **News**: add a `log-line` block at the top of the mission log in `index.md`
  (tags: `tag-pub`, `tag-role`, `tag-edu`, `tag-award`, `tag-talk`).
- **Publications / projects**: copy the commented template at the top of the respective file.
- **Links, email**: edit `_config.yml`.

## Local development

```bash
bundle install
bundle exec jekyll serve
```
