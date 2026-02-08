// Main JavaScript - Populates content from config.js

document.addEventListener('DOMContentLoaded', () => {
  // Populate Studio Information
  populateStudioInfo();
  
  // Populate Home Section
  populateHomeSection();
  
  // Populate Games Section
  populateGamesSection();
  
  // Populate Contact Section
  populateContactSection();
  
  // Initialize Space Shooter Game
  initSpaceShooter();
  
  // Smooth scrolling for navigation
  setupSmoothScrolling();
});

function populateStudioInfo() {
  const studioName = CONFIG.studio.name;
  
  // Update navigation
  const navStudioName = document.getElementById('nav-studio-name');
  if (navStudioName) {
    navStudioName.textContent = studioName.toUpperCase();
  }
  
  // Update footer
  const footerStudioName = document.getElementById('footer-studio-name');
  if (footerStudioName) {
    footerStudioName.textContent = studioName;
  }
  
  // Update studio name display
  const studioNameDisplay = document.getElementById('studio-name-display');
  if (studioNameDisplay) {
    studioNameDisplay.textContent = studioName.toUpperCase();
  }
}

function populateHomeSection() {
  const { title, subtitle, ctaText } = CONFIG.home;
  const { tagline, description } = CONFIG.studio;
  
  // Update home title
  const homeTitle = document.getElementById('home-title');
  if (homeTitle) {
    homeTitle.textContent = title;
  }
  
  // Update tagline
  const homeTagline = document.getElementById('home-tagline');
  if (homeTagline) {
    homeTagline.textContent = subtitle || tagline;
  }
  
  // Update description
  const homeDescription = document.getElementById('home-description');
  if (homeDescription) {
    homeDescription.textContent = description;
  }
  
  // Update CTA button
  const homeCta = document.getElementById('home-cta');
  if (homeCta) {
    homeCta.textContent = ctaText;
  }
}

function populateGamesSection() {
  const gamesGrid = document.getElementById('games-grid');
  if (!gamesGrid) return;
  
  gamesGrid.innerHTML = '';
  
  CONFIG.games.forEach((game, index) => {
    const gameCard = createGameCard(game, index);
    gamesGrid.appendChild(gameCard);
  });
}

function createGameCard(game, index) {
  const card = document.createElement('div');
  card.className = 'game-card';
  card.style.animationDelay = `${index * 0.1}s`;
  
  // Determine status class
  let statusClass = 'released';
  if (game.status.toLowerCase().includes('development')) {
    statusClass = 'development';
  } else if (game.status.toLowerCase().includes('coming')) {
    statusClass = 'coming-soon';
  }
  
  // Create thumbnail
  const thumbnail = document.createElement('div');
  thumbnail.className = 'game-thumbnail';
  
  // If thumbnail exists, try to load it, otherwise show placeholder
  if (game.thumbnail && game.thumbnail !== 'assets/gameX.jpg') {
    const img = document.createElement('img');
    img.src = game.thumbnail;
    img.alt = game.title;
    img.onerror = () => {
      // If image fails to load, show placeholder
      thumbnail.textContent = '🎮';
    };
    thumbnail.appendChild(img);
  } else {
    // Show placeholder
    thumbnail.textContent = '🎮';
  }
  
  // Create game info
  const info = document.createElement('div');
  info.className = 'game-info';
  
  const title = document.createElement('h3');
  title.className = 'game-title';
  title.textContent = game.title;
  
  const description = document.createElement('p');
  description.className = 'game-description';
  description.textContent = game.description;
  
  const meta = document.createElement('div');
  meta.className = 'game-meta';
  
  // Add tags
  game.tags.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag';
    tagEl.textContent = tag;
    meta.appendChild(tagEl);
  });
  
  const status = document.createElement('div');
  status.className = `status ${statusClass}`;
  status.textContent = `${game.status} • ${game.releaseDate}`;
  
  const platforms = document.createElement('p');
  platforms.style.marginTop = '8px';
  platforms.style.fontSize = '0.9rem';
  platforms.style.opacity = '0.7';
  platforms.textContent = `Platforms: ${game.platforms.join(', ')}`;
  
  info.appendChild(title);
  info.appendChild(description);
  info.appendChild(meta);
  info.appendChild(status);
  info.appendChild(platforms);
  
  card.appendChild(thumbnail);
  card.appendChild(info);
  
  return card;
}

function populateContactSection() {
  const { title, description, email, socials } = CONFIG.contact;
  
  // Update contact title
  const contactTitle = document.getElementById('contact-title');
  if (contactTitle) {
    contactTitle.textContent = title;
  }
  
  // Update contact description
  const contactDescription = document.getElementById('contact-description');
  if (contactDescription) {
    contactDescription.textContent = description;
  }
  
  // Update email
  const contactEmail = document.getElementById('contact-email');
  if (contactEmail) {
    contactEmail.textContent = email;
    contactEmail.href = `mailto:${email}`;
  }
  
  // Populate social links
  const socialLinks = document.getElementById('social-links');
  if (socialLinks && socials) {
    socialLinks.innerHTML = '';
    
    socials.forEach(social => {
      const link = document.createElement('a');
      link.href = social.url;
      link.className = 'social-link';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = `${social.icon} ${social.name}`;
      socialLinks.appendChild(link);
    });
  }
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Add scroll animations
let observer;

function setupScrollAnimations() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });
  
  document.querySelectorAll('.game-card').forEach(card => {
    observer.observe(card);
  });
}

// Initialize scroll animations after a delay
setTimeout(setupScrollAnimations, 100);
