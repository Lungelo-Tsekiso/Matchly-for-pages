document.addEventListener('DOMContentLoaded', function () {
 
  /*  (Light / Dark mode) */
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('matchly-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
 
  function updateThemeButton() {
    if (!themeToggle) return;
    // Sun icon when in dark mode (tap to go light), moon icon when in light mode (tap to go dark)
    themeToggle.innerHTML = currentTheme === 'dark' ? '&#9728;&#65039;' : '&#127769;';
    themeToggle.setAttribute(
      'aria-label',
      currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }
 
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeButton();
 
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('matchly-theme', currentTheme);
      updateThemeButton();
    });
  }
 
 
  /*  1. MOBILE NAVIGATION */
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-navigation');
 
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = primaryNav.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
 
    // Close the menu automatically when a link is tapped
    primaryNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        primaryNav.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
 
 
  /* 2. TABS */
  const tabLists = document.querySelectorAll('[role="tablist"]');
 
  tabLists.forEach(function (tabList) {
    const tabs = tabList.querySelectorAll('[role="tab"]');
 
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (otherTab) {
          otherTab.setAttribute('aria-selected', 'false');
          const otherPanel = document.getElementById(otherTab.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
        });
 
        tab.setAttribute('aria-selected', 'true');
        const activePanel = document.getElementById(tab.getAttribute('aria-controls'));
        if (activePanel) activePanel.hidden = false;
      });
    });
  });


  /* 4. TEAM SEARCH + SPORT FILTER (Teams page) */
  const teamSearchForm = document.getElementById('team-search-form');
  const teamSearchInput = document.getElementById('team-search-input');
  const filterTeamSport = document.getElementById('filter-team-sport');
  const teamCards = document.querySelectorAll('.team-card');
  const noResultsMessage = document.getElementById('no-results-message');

  function filterTeams() {
    if (!teamCards.length) return;
    const query = teamSearchInput ? teamSearchInput.value.trim().toLowerCase() : '';
    const sportValue = filterTeamSport ? filterTeamSport.value : 'all';
    let anyVisible = false;

    teamCards.forEach(function (card) {
      const teamName = (card.dataset.teamName || '').toLowerCase();
      const teamSport = card.dataset.sport || '';

      const nameMatches = teamName.includes(query);
      const sportMatches = sportValue === 'all' || teamSport === sportValue;
      const show = nameMatches && sportMatches;

      card.hidden = !show;
      if (show) anyVisible = true;
    });

    if (noResultsMessage) {
      noResultsMessage.hidden = anyVisible;
    }
  }

  if (teamSearchForm) {
    teamSearchForm.addEventListener('submit', function (e) {
      e.preventDefault(); // don't actually submit/reload the page
      filterTeams();
    });
  }
  if (teamSearchInput) {
    // Filter as the person types, too
    teamSearchInput.addEventListener('input', filterTeams);
  }
  if (filterTeamSport) {
    filterTeamSport.addEventListener('change', filterTeams);
  }


  /* 5. FIXTURES FILTERING (Sport + Competition + Team dropdowns) */
  const filterSport = document.getElementById('filter-sport');
  const filterCompetition = document.getElementById('filter-competition');
  const filterTeam = document.getElementById('filter-team');
  const fixturesTable = document.getElementById('fixtures-table');
  const noFixturesMessage = document.getElementById('no-fixtures-message');

  function filterFixtures() {
    if (!fixturesTable) return;
    const sportValue = filterSport ? filterSport.value : 'all';
    const competitionValue = filterCompetition ? filterCompetition.value : 'all';
    const teamValue = filterTeam ? filterTeam.value : 'all';
    const rows = fixturesTable.querySelectorAll('tbody tr');
    let anyVisible = false;

    rows.forEach(function (row) {
      const rowSport = row.dataset.sport;
      const rowCompetition = row.dataset.competition;
      const rowTeams = row.dataset.teams ? row.dataset.teams.split(' ') : [];

      const sportMatches = sportValue === 'all' || rowSport === sportValue;
      const competitionMatches = competitionValue === 'all' || rowCompetition === competitionValue;
      const teamMatches = teamValue === 'all' || rowTeams.indexOf(teamValue) !== -1;
      const show = sportMatches && competitionMatches && teamMatches;

      row.hidden = !show;
      if (show) anyVisible = true;
    });

    if (noFixturesMessage) {
      noFixturesMessage.hidden = anyVisible;
    }
  }

  if (filterSport) filterSport.addEventListener('change', filterFixtures);
  if (filterCompetition) filterCompetition.addEventListener('change', filterFixtures);
  if (filterTeam) filterTeam.addEventListener('change', filterFixtures);


  /* 6. ENQUIRY FORM VALIDATION */
  const enquiryForm = document.getElementById('enquiry-form');

  if (enquiryForm) {
    const successMessage = document.getElementById('enquiry-success-message');

    const fields = [
      {
        input: document.getElementById('enquiry-name'),
        error: document.getElementById('enquiry-name-error'),
        message: 'Please enter your full name.'
      },
      {
        input: document.getElementById('enquiry-email'),
        error: document.getElementById('enquiry-email-error'),
        message: 'Please enter a valid email address.',
        isEmail: true
      },
      {
        input: document.getElementById('enquiry-subject'),
        error: document.getElementById('enquiry-subject-error'),
        message: 'Please enter a subject.'
      },
      {
        input: document.getElementById('enquiry-message'),
        error: document.getElementById('enquiry-message-error'),
        message: 'Please enter a message.'
      }
    ];

    function looksLikeEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateField(field) {
      if (!field.input) return true; // field not on this page, skip
      const value = field.input.value.trim();
      let valid = value.length > 0;
      if (valid && field.isEmail) {
        valid = looksLikeEmail(value);
      }
      if (field.error) {
        field.error.textContent = valid ? '' : field.message;
      }
      return valid;
    }

    // Validate a field as soon as the person leaves it
    fields.forEach(function (field) {
      if (field.input) {
        field.input.addEventListener('blur', function () {
          validateField(field);
        });
      }
    });

    enquiryForm.addEventListener('submit', function (e) {
      e.preventDefault(); // this is a student demo - nothing is actually sent

      let allValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) {
          allValid = false;
        }
      });

      if (allValid) {
        if (successMessage) successMessage.hidden = false;
        enquiryForm.reset();
      } else if (successMessage) {
        successMessage.hidden = true;
      }
    });
  }


  /* 7. LIVE SCORES DEMONSTRATION */
  const liveGameCards = document.querySelectorAll('.live-game-card');

  liveGameCards.forEach(function (card) {
    const statusEl = card.querySelector('.live-status');
    const pointSpans = card.querySelectorAll('.live-points');

    // Count the clock down by one second, every second
    if (statusEl) {
      setInterval(function () {
        const match = statusEl.textContent.match(/(\d{2}):(\d{2})/);
        if (!match) return;

        let minutes = parseInt(match[1], 10);
        let seconds = parseInt(match[2], 10);

        if (minutes === 0 && seconds === 0) return; // stop at 00:00

        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }

        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(seconds).padStart(2, '0');
        statusEl.textContent = statusEl.textContent.replace(
          /\d{2}:\d{2}/,
          paddedMinutes + ':' + paddedSeconds
        );
      }, 1000);
    }

    // Every so often, nudge one team's score up a little
    if (pointSpans.length === 2) {
      setInterval(function () {
        const scoringTeamIndex = Math.random() < 0.5 ? 0 : 1;
        const span = pointSpans[scoringTeamIndex];
        const currentScore = parseInt(span.textContent, 10) || 0;
        const pointsToAdd = Math.random() < 0.5 ? 2 : 3;
        span.textContent = currentScore + pointsToAdd;
      }, 9000);
    }
  });

});

/*   MATCHLY SPORT BALLS BOUNCE ANIMATION SCRIPT */
document.addEventListener("DOMContentLoaded", () => {
  // Create canvas element dynamically
  const canvas = document.createElement("canvas");
  canvas.id = "sport-balls-canvas";
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Define  sports balls objects
  const ballTypes = [
    { type: 'basketball', color: '#E65C00', line: '#331a00' },
    { type: 'soccer', color: '#F8F9FA', line: '#212529' },
    { type: 'tennis', color: '#CCFF00', line: '#ffffff' },
    { type: 'rugby', color: '#8B4513', line: '#ffffff' }
  ];

  class BouncyBall {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = 14 + Math.random() * 14; // Cute varied sizes
      this.speedX = (Math.random() - 0.5) * 2.2;
      this.speedY = (Math.random() - 0.5) * 2.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;
      this.ballData = ballTypes[Math.floor(Math.random() * ballTypes.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      // Bounce off walls smoothly
      if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
        this.speedX *= -1;
      }
      if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
        this.speedY *= -1;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // Draw Ball Circle
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.ballData.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = this.ballData.line;
      ctx.stroke();

      // Draw sports patterns inside the balls
      ctx.beginPath();
      if (this.ballData.type === 'basketball') {
        ctx.moveTo(-this.radius, 0); ctx.lineTo(this.radius, 0);
        ctx.moveTo(0, -this.radius); ctx.lineTo(0, this.radius);
      } else if (this.ballData.type === 'soccer') {
        // Cute mini pentagon core
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
      } else if (this.ballData.type === 'tennis') {
        ctx.arc(0, 0, this.radius * 0.7, -Math.PI/4, Math.PI/4);
      } else if (this.ballData.type === 'rugby') {
        ctx.ellipse(0, 0, this.radius * 0.7, this.radius * 0.4, 0, 0, Math.PI * 2);
      }
      ctx.stroke();

      ctx.restore();
    }
  }

  // 16 cute bouncing balls
  const ballsArray = [];
  for (let i = 0; i < 16; i++) {
    ballsArray.push(new BouncyBall());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ballsArray.forEach(ball => {
      ball.update();
      ball.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
});

document.addEventListener("DOMContentLoaded", () => {
  // Automatically tag cards and sections for scroll reveal
  const elementsToReveal = document.querySelectorAll('.card-grid > *, .competition-card, .team-card, .match-card, .hero-text');
  elementsToReveal.forEach(el => el.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, { threshold: 0.15 });

  elementsToReveal.forEach(el => observer.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const gallerySections = document.querySelectorAll(".gallery-category-section");

  if (filterButtons.length > 0 && gallerySections.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");

        const filterValue = button.getAttribute("data-filter");

        gallerySections.forEach(section => {
          const category = section.getAttribute("data-category");
          
          if (filterValue === "all" || category === filterValue) {
            section.style.display = "block";
          } else {
            section.style.display = "none";
          }
        });
      });
    });
  }
});