// ═══════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════

class Particle {
  constructor(x, y, vx, vy, color, size, life, gravity = 0) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color; this.size = size;
    this.life = life; this.maxLife = life;
    this.gravity = gravity;
  }
  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.vy += this.gravity * dt;
    this.vx *= 0.87; this.vy *= 0.87;
    this.life -= dt;
  }
  draw(ctx) {
    const a = clamp(this.life / this.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.size * 2.2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * (0.4 + 0.6 * a), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() { this.list = []; }

  add(p) { this.list.push(p); }

  burst(x, y, color, count, speed, size, life, gravity = 0) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.add(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, color, size * (0.5 + Math.random() * 0.5), life, gravity));
    }
  }

  ring(x, y, color, radius, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const sp = speed * (0.7 + Math.random() * 0.6);
      this.add(new Particle(x + Math.cos(a) * radius, y + Math.sin(a) * radius, Math.cos(a) * sp, Math.sin(a) * sp, color, 2 + Math.random() * 2, 0.5 + Math.random() * 0.3));
    }
  }

  trail(x, y, color, dvx, dvy, size) {
    const a = Math.random() * Math.PI * 2;
    const s = 20 + Math.random() * 55;
    this.add(new Particle(
      x + rnd(-5, 5), y + rnd(-5, 5),
      Math.cos(a) * s - dvx * 0.12, Math.sin(a) * s - dvy * 0.12,
      color, size, 0.1 + Math.random() * 0.32
    ));
  }

  update(dt) {
    this.list = this.list.filter(p => { p.update(dt); return p.life > 0; });
  }

  draw(ctx) { this.list.forEach(p => p.draw(ctx)); }

  clear() { this.list = []; }
}
