---
layout: default
title: Home
---

<section class="hero">
  <div class="hero-container">
    <div class="hero-left">
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

    <div class="hero-right">
      <div class="news-section">
        <h2 class="section-title">News</h2>
        <div class="news-list-scroll">
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
            <span class="news-date">Oct 2023</span>
            <p class="news-content">Joined University of Zagreb for aerial robotics specialization.</p>
          </div>
          <div class="news-item">
            <span class="news-date">Dec 2022</span>
            <p class="news-content">Presented at IEEE ROBIO 2022.</p>
          </div>
          <div class="news-item">
            <span class="news-date">Sep 2022</span>
            <p class="news-content">Started IFRoS Masters at University of Girona.</p>
          </div>
          <div class="news-item">
            <span class="news-date">Jun 2022</span>
            <p class="news-content">Graduated from <a href="https://habib.edu.pk/" target="_blank">Habib University</a> with Dean's Medal and Best Thesis Award.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="home-main">
  <div class="home-main-container">
    <!-- Experience Section -->
    <div class="content-section">
      <h2 class="section-title">Experience</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">Researcher</h3>
              <span class="timeline-date">Feb 2025 - Present</span>
            </div>
            <p class="timeline-org"><a href="https://larics.fer.hr/" target="_blank">LARICS</a>, University of Zagreb</p>
            <p class="timeline-desc">Research on multi-robot systems for search and rescue missions, focusing on connectivity maintenance and decentralized control for UAV swarms.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">Computer Vision Intern</h3>
              <span class="timeline-date">Jun 2023 - Aug 2023</span>
            </div>
            <p class="timeline-org"><a href="https://vicorob.udg.edu/" target="_blank">ViCOROB</a>, Universitat de Girona</p>
            <p class="timeline-desc">Improved weakly-supervised semantic segmentation for side scan sonar images. Created GUI tools for visualization and inspection of SSS transects.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">Teaching Assistant</h3>
              <span class="timeline-date">Fall 2019, Fall 2021</span>
            </div>
            <p class="timeline-org"><a href="https://habib.edu.pk/" target="_blank">Habib University</a></p>
            <p class="timeline-desc">TA for Programming Fundamentals & Feedback Control courses. Created assignment manuals, delivered supplementary sessions, and instructed students in labs.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Education Section -->
    <div class="content-section">
      <h2 class="section-title">Education</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">MSc Intelligent Field Robotic Systems</h3>
              <span class="timeline-date">Sep 2022 - Jun 2024</span>
            </div>
            <p class="timeline-org"><a href="https://ifrosmaster.org/" target="_blank">Erasmus Mundus Joint Master</a></p>
            <p class="timeline-desc">Universitat de Girona (Spain), University of Zagreb (Croatia), Eötvös Loránd University (Hungary). Specialization in aerial vehicles and multi-robot systems. Thesis grade: 9.3/10.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="timeline-title">BSc Electrical Engineering</h3>
              <span class="timeline-date">Aug 2018 - Jun 2022</span>
            </div>
            <p class="timeline-org"><a href="https://habib.edu.pk/" target="_blank">Habib University</a>, Pakistan</p>
            <p class="timeline-desc">Focus on robotics and computer vision. GPA: 3.86/4.00. Dean's Medal for highest academic achievement. Best Undergraduate Thesis Award.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Research Interests -->
    <div class="content-section">
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
</section>
