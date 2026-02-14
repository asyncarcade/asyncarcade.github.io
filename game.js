// Space Shooter Game
class SpaceShooter {
  constructor(canvasId, config) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.config = config;
    
    // Set canvas size
    this.canvas.width = config.canvasWidth;
    this.canvas.height = config.canvasHeight;
    
    // Game state
    this.gameRunning = false;
    this.score = 0;
    this.mouseX = config.canvasWidth / 2;
    
    // Game objects
    this.player = {
      x: config.canvasWidth / 2,
      y: config.canvasHeight - 60,
      width: 30,
      height: 40,
      speed: config.playerSpeed
    };
    
    this.bullets = [];
    this.asteroids = [];
    this.particles = [];
    
    this.frameCount = 0;
    this.lastShootTime = 0;
    this.shootCooldown = 15; // frames
    
    this.init();
  }
  
  init() {
      // Mouse movement
      //this.canvas.addEventListener('mousemove', (e) => {
          //  const rect = this.canvas.getBoundingClientRect();
          //  this.mouseX = e.clientX - rect.left;
          //    console.log(this.mouseX + " " + this.player.x + " " + rect.left + " " + rect.right);
          //});

      //  console.log("Canvas w: " + this.canvas.width + " " + this.player.width);

      this.canvas.addEventListener('mousemove', (e) => {
          const rect = this.canvas.getBoundingClientRect();

          const scaleX = this.canvas.width / rect.width;
          const scaleY = this.canvas.height / rect.height;

          this.mouseX = (e.clientX - rect.left) * scaleX;
      });


      // Auto-start game
      this.gameRunning = true;
      this.gameLoop();
  }
  
  gameLoop() {
    if (!this.gameRunning) return;
    
    this.update();
    this.draw();
    
    requestAnimationFrame(() => this.gameLoop());
  }
  
  update() {
    this.frameCount++;
    
    // Move player towards mouse
    const targetX = this.mouseX;
    const diff = targetX - this.player.x;
    this.player.x += diff * 0.15; // Smooth movement
    
    // Keep player in bounds
    this.player.x = Math.max(this.player.width / 2, 
                             Math.min(this.canvas.width - this.player.width / 2, 
                                     this.player.x));
    
    // Auto-shoot
    if (this.frameCount - this.lastShootTime > this.shootCooldown) {
      this.shoot();
      this.lastShootTime = this.frameCount;
    }
    
    // Update bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.y -= this.config.bulletSpeed;
      return bullet.y > 0;
    });
    
    // Spawn asteroids
    if (this.frameCount % this.config.asteroidSpawnRate === 0) {
      this.spawnAsteroid();
    }
    
    // Update asteroids
    this.asteroids = this.asteroids.filter(asteroid => {
      asteroid.y += this.config.asteroidSpeed;
      asteroid.rotation += asteroid.rotationSpeed;
      return asteroid.y < this.canvas.height + asteroid.radius;
    });
    
    // Check collisions
    this.checkCollisions();
    
    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
      return particle.life > 0;
    });
  }
  
  draw() {
    // Clear canvas (white background)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw score
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${this.score}`, 20, 35);
    
    // Draw player (triangle spaceship)
    this.drawPlayer();
    
    // Draw bullets
    this.bullets.forEach(bullet => {
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(bullet.x - 2, bullet.y - 6, 4, 12);
    });
    
    // Draw asteroids
    this.asteroids.forEach(asteroid => {
      this.drawAsteroid(asteroid);
    });
    
    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }
  
  drawPlayer() {
    const { x, y, width, height } = this.player;
    
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - height / 2); // Top point
    this.ctx.lineTo(x - width / 2, y + height / 2); // Bottom left
    this.ctx.lineTo(x + width / 2, y + height / 2); // Bottom right
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  drawAsteroid(asteroid) {
    this.ctx.save();
    this.ctx.translate(asteroid.x, asteroid.y);
    this.ctx.rotate(asteroid.rotation);
    
    this.ctx.strokeStyle = '#000000';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    
    this.ctx.beginPath();
    this.ctx.arc(0, 0, asteroid.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.restore();
  }
  
  shoot() {
    this.bullets.push({
      x: this.player.x,
      y: this.player.y - 20
    });
  }
  
  spawnAsteroid() {
    const sizes = [15, 20, 25, 30, 35];
    const radius = sizes[Math.floor(Math.random() * sizes.length)];
    
    this.asteroids.push({
      x: Math.random() * this.canvas.width,
      y: -radius,
      radius: radius,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    });
  }
  
  checkCollisions() {
    // Bullet-asteroid collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        const asteroid = this.asteroids[j];
        const dx = bullet.x - asteroid.x;
        const dy = bullet.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < asteroid.radius) {
          // Hit!
          this.bullets.splice(i, 1);
          this.asteroids.splice(j, 1);
          this.score += this.config.scoreMultiplier;
          
          // Create explosion particles
          this.createExplosion(asteroid.x, asteroid.y);
          break;
        }
      }
    }
  }
  
  createExplosion(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 2 + Math.random() * 2;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        life: 30,
        maxLife: 30,
        alpha: 1
      });
    }
  }
}

// Initialize game when DOM is ready
let game;

function initSpaceShooter() {
  if (typeof CONFIG !== 'undefined') {
    game = new SpaceShooter('spaceShooterCanvas', CONFIG.spaceShooter);
  }
}
