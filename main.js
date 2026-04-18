// Main JavaScript — Async Arcade Portfolio

document.addEventListener('DOMContentLoaded', () => {
  populateStudioInfo();
  populateHomeSection();
  populateFeaturedGame();
  populateGamesSection();
  populateContactSection();
  initSpaceShooter();
  setupSmoothScrolling();
  setupMobileNav();
  setupScrollReveal();
  updateStatCount();
});

// ─── Studio Info ───────────────────────────────
function populateStudioInfo() {
  const name = CONFIG.studio.name;
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('nav-studio-name', name.toUpperCase());
  set('footer-studio-name', name);
}

// ─── Hero Section ──────────────────────────────
function populateHomeSection() {
  const { title, subtitle } = CONFIG.home;
  const { tagline, description } = CONFIG.studio;
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('home-title', title);
  set('home-tagline', subtitle || tagline);
  set('home-description', description);
}

function updateStatCount() {
  const el = document.getElementById('stat-games');
  if (el) el.textContent = CONFIG.games.length;
}

// ─── Featured Game ─────────────────────────────
function populateFeaturedGame() {
  const container = document.getElementById('featured-card');
  if (!container || !CONFIG.games.length) return;

  const game = CONFIG.games[0];

  container.innerHTML = `
    <div class="featured-image-side">
      <img src="${game.thumbnail}" alt="${game.title}"
           onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;font-size:5rem;\'>🎮</div>'">
      <div class="featured-image-overlay"></div>
      <div class="featured-image-badge">★ FEATURED GAME</div>
    </div>
    <div class="featured-info-side">
      <div class="featured-platform-row">
        ${game.platforms.map(p => `<span class="platform-pill">${p}</span>`).join('')}
      </div>
      <h2 class="featured-title">${game.title}</h2>
      <p class="featured-desc">${game.description}</p>
      <div class="featured-tags">
        ${game.tags.map(t => `<span class="feat-tag">${t}</span>`).join('')}
      </div>
      ${game.url ? `<a href="${game.url}" target="_blank" rel="noopener" class="featured-cta">PLAY NOW →</a>` : ''}
      <div class="featured-meta-bar">
        <div class="feat-meta-item">
          <span class="feat-meta-label">STATUS</span>
          <span class="feat-meta-value">${game.status}</span>
        </div>
        <div class="feat-meta-item">
          <span class="feat-meta-label">RELEASE</span>
          <span class="feat-meta-value">${game.releaseDate}</span>
        </div>
        <div class="feat-meta-item">
          <span class="feat-meta-label">PLATFORMS</span>
          <span class="feat-meta-value">${game.platforms.join(' · ')}</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Games Grid ────────────────────────────────
function populateGamesSection() {
  const grid = document.getElementById('games-grid');
  if (!grid) return;
  grid.innerHTML = '';
  CONFIG.games.forEach((game, i) => {
    grid.appendChild(createGameCard(game, i));
  });
}

function createGameCard(game, index) {
  const card = document.createElement('a');
  if (game.url) { card.href = game.url; card.target = '_blank'; card.rel = 'noopener'; }
  card.className = 'game-card reveal';
  card.style.transitionDelay = `${(index % 3) * 0.08}s`;

  let statusClass = 'released';
  if (game.status.toLowerCase().includes('development')) statusClass = 'development';
  else if (game.status.toLowerCase().includes('coming')) statusClass = 'coming-soon';

  const thumbnail = document.createElement('div');
  thumbnail.className = 'game-thumbnail';
  if (game.thumbnail) {
    const img = document.createElement('img');
    img.src = game.thumbnail;
    img.alt = game.title;
    img.loading = 'lazy';
    img.onerror = () => { thumbnail.textContent = '🎮'; };
    thumbnail.appendChild(img);
  } else {
    thumbnail.textContent = '🎮';
  }

  const info = document.createElement('div');
  info.className = 'game-info';
  info.innerHTML = `
    <h3 class="game-title">${game.title}</h3>
    <p class="game-description">${game.description}</p>
    <div class="game-meta">
      ${game.tags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
    <div class="status ${statusClass}">${game.status} · ${game.releaseDate}</div>
  `;

  card.appendChild(thumbnail);
  card.appendChild(info);
  return card;
}

// ─── Contact ───────────────────────────────────
function populateContactSection() {
  const { title, description, email, socials } = CONFIG.contact;
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('contact-title', title);
  set('contact-description', description);

  const emailEl = document.getElementById('contact-email');
  if (emailEl) { emailEl.textContent = email; emailEl.href = `mailto:${email}`; }

  const socialLinks = document.getElementById('social-links');
  if (socialLinks && socials && socials.length) {
    socialLinks.innerHTML = socials.map(s =>
      `<a href="${s.url}" class="social-link" target="_blank" rel="noopener">${s.icon} ${s.name}</a>`
    ).join('');
  }
}

// ─── Smooth Scrolling ──────────────────────────
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        document.getElementById('mobileMenu')?.classList.remove('open');
      }
    });
  });
}

// ─── Mobile Nav ────────────────────────────────
function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
}

// ─── Scroll Reveal ─────────────────────────────
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  // Observe articles and blog elements too
  setTimeout(() => {
    document.querySelectorAll('.reveal, .blog-article, .featured-card, .sidebar-widget').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }, 200);
}
