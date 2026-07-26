---
layout: default
title: Games — Khawaja G. Alamdar
permalink: /games/
swarm: false
---

<header class="page-header">
  <p class="page-eyebrow reveal"><span class="prompt">$</span> ls ~/games --playable</p>
  <h1 class="page-title reveal delay-1">Games<span class="accent-dot">.</span></h1>
  <p class="page-subtitle reveal delay-2">Multi-agent simulations and small games, all running in your browser. No install, no server &mdash; hit view-source on any of them.</p>
</header>

<div class="game-grid">

<!-- ===========================================
     To add a game: create _games/your-slug.md — that one file
     produces both the card here and the page at /games/your-slug/.
     Front matter it reads: name, tagline, year, tech[], thumb,
     glyph, status (playable|wip), order.
     =========================================== -->

  {% assign game_list = site.games | sort: 'order' | reverse %}
  {% for game in game_list %}
  <article class="game-card reveal">
    <a class="game-link" href="{{ game.url | relative_url }}">
      <div class="game-media">
        {% if game.thumb %}
        <img src="{{ game.thumb | relative_url }}" alt="{{ game.name }}">
        {% else %}
        <div class="game-glyph"><span>{{ game.glyph | default: '◈' }}</span></div>
        {% endif %}
        <span class="game-status {% if game.status == 'wip' %}is-wip{% endif %}">{{ game.status | default: 'playable' }}</span>
      </div>
      <div class="game-body">
        <p class="game-meta">{{ game.year }}{% if game.tech %} &middot; {{ game.tech | join: ' &middot; ' }}{% endif %}</p>
        <h3 class="game-name">{{ game.name }}</h3>
        <p class="game-desc">{{ game.tagline }}</p>
        <span class="game-cta">play <i class="fas fa-arrow-right"></i></span>
      </div>
    </a>
  </article>
  {% else %}
  <div class="game-empty reveal">
    <p class="empty-line"><span class="prompt">$</span> ls -1 ~/games</p>
    <p class="empty-out">total 0</p>
    <p class="empty-line"><span class="prompt">$</span> <span class="empty-caret"></span></p>
    <p class="empty-note">// nothing deployed here yet — the first simulation is on the bench.<br>// the agents drifting behind this page are, technically, already playable.</p>
  </div>
  {% endfor %}

</div>
