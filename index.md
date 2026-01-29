---
layout: default
title: Home
---

<section class="hero">
  <div class="hero-container">
    <div class="hero-image">
      <img src="{{ site.avatar | relative_url }}" alt="{{ site.title }}" class="hero-avatar">
    </div>
    <div class="hero-content">
      <h1 class="hero-name">{{ site.title }}</h1>
      <p class="hero-title">{{ site.position }}</p>
      <p class="hero-affiliation">
        <a href="https://larics.fer.hr/" target="_blank">{{ site.affiliation }}</a>
      </p>
      <div class="hero-social">
        {% if site.google_scholar %}
        <a href="{{ site.google_scholar }}" class="social-link" target="_blank" title="Google Scholar">
          <i class="ai ai-google-scholar"></i>
        </a>
        {% endif %}
        {% if site.github_link %}
        <a href="{{ site.github_link }}" class="social-link" target="_blank" title="GitHub">
          <i class="fab fa-github"></i>
        </a>
        {% endif %}
        {% if site.linkedin %}
        <a href="{{ site.linkedin }}" class="social-link" target="_blank" title="LinkedIn">
          <i class="fab fa-linkedin-in"></i>
        </a>
        {% endif %}
        {% if site.cv_link %}
        <a href="{{ site.cv_link | relative_url }}" class="social-link" target="_blank" title="CV">
          <i class="ai ai-cv"></i>
        </a>
        {% endif %}
        <a href="mailto:{{ site.email }}" class="social-link" title="Email">
          <i class="fas fa-envelope"></i>
        </a>
      </div>
      <div class="about-text">
        <p>I am a researcher at the <a href="https://larics.fer.hr/" target="_blank">Laboratory for Robotics and Intelligent Control Systems (LARICS)</a>, FER, at the University of Zagreb, focusing on multi-robot systems for search and rescue missions. Last summer, I graduated with a Master's in <a href="https://ifrosmaster.org/" target="_blank">Intelligent Field Robotic Systems (IFRoS)</a> from the Erasmus Mundus program.</p>
        <p>I hold an undergraduate degree in Electrical Engineering, with a focus on robotics and computer vision, from <a href="https://habib.edu.pk/" target="_blank">Habib University</a> in 2022.</p>
      </div>
    </div>
  </div>
</section>

<section class="home-main">
  <div class="home-main-container">
    <div class="home-left">
      <!-- Research Interests -->
      <div>
        <h2 class="section-title">Research Interests</h2>
        <div class="interests-grid">
          <div class="interest-card">
            <h3 class="interest-title">Autonomous Systems</h3>
            <p class="interest-desc">Autonomous exploration, disaster robotics, and GPS-denied navigation for UAVs.</p>
          </div>
          <div class="interest-card">
            <h3 class="interest-title">Multi-Robot Systems</h3>
            <p class="interest-desc">Decentralized control, connectivity maintenance, and swarm coordination for UAV networks.</p>
          </div>
          <div class="interest-card">
            <h3 class="interest-title">Computer Vision</h3>
            <p class="interest-desc">Human detection and localization, SLAM, and perception for robotic systems.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="home-right">
      <!-- News Section -->
      <div class="news-section">
        <h2 class="section-title">News</h2>
        <div class="news-list">
          <div class="news-item">
            <span class="news-date">May 2025</span>
            <p class="news-content">Paper "Decentralized Battery-Aware Connectivity Maintenance for Multi-UAV Missions" accepted in <strong>IEEE Access</strong>.</p>
          </div>
          <div class="news-item">
            <span class="news-date">Feb 2025</span>
            <p class="news-content">Started as researcher at <a href="https://larics.fer.hr/" target="_blank">LARICS</a>.</p>
          </div>
          <div class="news-item">
            <span class="news-date">Jun 2024</span>
            <p class="news-content">Completed Master's in <a href="https://ifrosmaster.org/" target="_blank">IFRoS</a>.</p>
          </div>
          <div class="news-item">
            <span class="news-date">Mar 2024</span>
            <p class="news-content">Began thesis at LARICS on UAV network connectivity.</p>
          </div>
          <div class="news-item">
            <span class="news-date">Dec 2022</span>
            <p class="news-content">Presented at IEEE ROBIO 2022.</p>
          </div>
          <div class="news-item">
            <span class="news-date">Jun 2022</span>
            <p class="news-content">Graduated from <a href="https://habib.edu.pk/" target="_blank">Habib University</a> with highest academic achievement and best thesis award.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
