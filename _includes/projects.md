<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Projects</title>
  <style>
    /* CSS for consistent image sizing */
    .teaser {
      max-width: 100%; /* Ensures responsive resizing */
      height: auto; /* Maintains aspect ratio */
      width: 300px; /* Fixed width for consistency */
      max-height: 200px; /* Prevents the GIF from exceeding frame height */
      object-fit: cover; /* Fills the frame while maintaining proportions */
    }

    /* Remove numbering from the ordered list */
    .bibliography {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .bibliography li {
      margin-bottom: 20px;
    }
  </style>
</head>

<body>
  <h2 id="projects" style="margin: 2px 0px -15px;">Projects</h2>

  <div class="projects">
  <ol class="bibliography">

  <li>
    <div class="pub-row">
      <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
        <img src="assets/project_imgs/explore.gif" class="teaser">
      </div>
      <div class="col-sm-9" style="position: relative;width: 100%;padding-right: 15px;padding-left: 20px;">
        <div class="title"><strong>Connectivity Maintenance in Ad-hoc UAV Networks for Multi-robot Missions</strong></div>
        <div class="affiliation"><em>Master’s Thesis - University of Zagreb (2024)</em></div>
        <div class="description">Modified a classic connectivity controller to include battery awareness and fault tolerance for a swarm of UAVs. Analyzed the feasibility of Graph Neural Networks (GNNs) for imitation learning. Demonstrated a full fleet management system using Bitcraze Crazyflie UAVs.</div>
        <div class="links">
          <a href="https://drive.google.com/file/d/1AOIqtehMHJ_R36bMlAusND14YsxL6YSP/view?usp=sharing" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Thesis</a>
        </div>
      </div>
    </div>
  </li>

  <br>

  <li>
    <div class="pub-row">
      <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
        <img src="assets/project_imgs/reynolds.gif" class="teaser">
      </div>
      <div class="col-sm-9" style="position: relative;width: 100%;padding-right: 15px;padding-left: 20px;">
        <div class="title"><strong>Flocking, Rendezvous and Formation Control of Multi Agent Systems</strong></div>
        <div class="affiliation"><em>University of Zagreb (2023)</em></div>
        <div class="description">Implemented Reynolds' rules to simulate decentralized flocking in Stage Simulator for unicycle dynamic agents. Developed consensus-based rendezvous and formation control in Stage Simulator.</div>
        <div class="links">
          <a href="https://github.com/KhAlamdar11/ReynoldsSwarmSim" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Code</a>
          <a href="https://youtube.com/playlist?list=PL_eKUkXsvo0Y0a8hcg0ggh9Zck--EYpBf&si=67LfecFRll7DdZa2" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Video</a>
        </div>
      </div>
    </div>
  </li>

  <br>

  <li>
    <div class="pub-row">
      <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
        <img src="assets/project_imgs/nak.gif" class="teaser">
      </div>
      <div class="col-sm-9" style="position: relative;width: 100%;padding-right: 15px;padding-left: 20px;">
        <div class="title"><strong>Autonomous Pick and Place using TurtleBot</strong></div>
        <div class="affiliation"><em>Universitat de Girona (2023)</em></div>
        <div class="description">Implemented multiple frontier selection and path planning algorithms with smoothing techniques. Integrated with self-implemented SLAM for mapping and localization, enabling fully autonomous pick-and-place.</div>
        <div class="links">
          <a href="https://youtube.com/playlist?list=PLwVnz1vBGxmIpFFC4FakAl2B1OGoyhWDm&si=KPjzlDpfqRWSE1MR" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Video</a>
        </div>
      </div>
    </div>
  </li>

  <br>

  <li>
      <div class="pub-row">
        <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
          <img src="assets/project_imgs/capstone1.gif" class="teaser img-fluid z-depth-1">
        </div>
        <div class="col-sm-9" style="position: relative;width: 100%;padding-right: 15px;padding-left: 20px;">
          <div class="title"><strong>Autonomous Mapping and Human Localization for Indoor Disaster Management UAVs</strong></div>
          <div class="periodical"><em>Bachelor’s Thesis - Habib University (2022)</em></div>
          <div class="description">Developed an exploration algorithm tailored for UAVs in GPS-denied environments. Implemented a module to detect and localize human survivors using YoloV3. Simulated using a PX4 quadrotor in disaster-like environments.</div>
          <div class="links">
            <a href="https://hira.habib.edu.pk/jspui/handle/123456789/476" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Thesis</a>
            <a href="https://www.youtube.com/watch?v=EyEW8sv9_-g" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Video</a>
          </div>
        </div>
      </div>
  </li>

  <br>

  <li>
      <div class="pub-row">
        <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
          <img src="assets/project_imgs/capstone1.gif" class="teaser img-fluid z-depth-1">
        </div>
        <div class="col-sm-9" style="position: relative;width: 100%;padding-right: 15px;padding-left: 20px;">
          <div class="title"><strong>Mathworks Minidrone Competition (EMEA ’21)</strong></div>
          <!-- <div class="periodical"><em>Bachelor’s Thesis - Habib University</em></div> -->
          <div class="description">Designed and implementated image processing and path planning algorithms to make parrot mambo mini-drone follow a line in Simulink simulation. A unique approach was used to make the drone follow the line on very steep turns.</div>
          <div class="links">
            <a href="https://github.com/mk04366/Mathworks_Line_Following_Drone" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Code</a>
            <a href="https://www.youtube.com/watch?v=9oJo_8JWI98" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Video</a>
          </div>
        </div>
      </div>
  </li>

  <br>

  <li>
      <div class="pub-row">
        <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
          <img src="assets/project_imgs/capstone1.gif" class="teaser img-fluid z-depth-1">
        </div>
        <div class="col-sm-9" style="position: relative;width: 100%;padding-right: 15px;padding-left: 20px;">
          <div class="title"><strong>WHEEL-E: A Self-Balancing Robot</strong></div>
          <div class="periodical"><em>Habib University (2020)</em></div>
          <div class="description">A self balancing robot developed as the final project for Principles of Feedback Control course in spring 2020 semester. The bot was capable of (modestly) balancing itself and maintaining upright position on 2 wheels. Arduino UNO R3 along with MPU6050, L298N motor driver and Pololu gear motors were used in this built. PID algorithm was implemented to balance the bot.</div>
          <div class="links">
            <a href="https://github.com/KhAlamdar11/WHEEL-E" role="button" target="_blank" style="font-size:12px;">Code</a>
            <a href="https://youtu.be/H8IEg2Rn4-M?si=s9FixfFCOtKjuyyL" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Video</a>
          </div>
        </div>
      </div>
  </li>

  <br>

  <li>
      <div class="pub-row">
        <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
          <img src="assets/project_imgs/capstone1.gif" class="teaser img-fluid z-depth-1">
        </div>
        <div class="col-sm-9" style="position: relative;width: 100%;padding-right: 15px;padding-left: 20px;">
          <div class="title"><strong>Mariana Trench Fishing</strong></div>
          <div class="periodical"><em>Habib University (2020)</em></div>
          <div class="description">A fishing game developed as the final project for the Object Oriented Programming (OOP) course in Spring 2020. Developed using C++ and SDL library.</div>
          <div class="links">
            <a href="https://www.youtube.com/watch?v=ITSI3_9rEnk" class="btn btn-primary btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Video</a>
          </div>
        </div>
      </div>
  </li>


  </ol>
  </div>
</body>



<!-- <li>
<div class="pub-row">
  <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
    <img src="assets/paper_imgs/p1.png" class="teaser img-fluid z-depth-1">
  </div>
  <div class="col-sm-9" style="position: relative;width: 100%;padding-right: 15px;padding-left: 20px;">
    <div class="title">Collaborative Multi-UAV Exploration for Search and Rescue</div>
    <div class="affiliation"><em>University of Girona</em></div>
    <div class="description">Implemented multi-UAV exploration strategy to achieve maximum coverage and localize humans. Developed a 'human-aware' exploration algorithm that improves the time taken to localize humans.</div>
  </div>
</div>
</li> -->