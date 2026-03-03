// ═══════════════════════════════════════════
// PLAYER
// ═══════════════════════════════════════════

class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.r = 13;
    this.vx = 0; this.vy = 0;

    this.hp    = 100;
    this.maxHp = 100;

    // Dash
    this.dashEnergy = 1;       // 0–1
    this.dashing    = false;
    this.dashTimer  = 0;
    this.dashMax    = 0.32;    // seconds
    this.dashSpeed  = 720;
    this.walkSpeed  = 260;
    this.dashDir    = { x: 0, y: -1 };
    this.invTimer   = 0;       // invincibility frames

    // Slow debuff
    this.slowTimer  = 0;
    this.SLOW_MULT  = 0.45;

    // Input
    this.moveDir = { x: 0, y: 0 };
    this.angle   = 0;

    // Visual
    this.pulsePhase = 0;
  }

  startDash() {
    if (this.dashEnergy >= 0.25 && !this.dashing) {
      this.dashing    = true;
      this.dashTimer  = this.dashMax;
      this.dashEnergy = Math.max(0, this.dashEnergy - 0.5);
      this.invTimer   = this.dashMax + 0.08;
      const m = norm(this.moveDir);
      if (m.x || m.y) this.dashDir = m;
      Audio.dashActivate();
      return true;
    }
    return false;
  }

  applyHit(dmg, ps, options = {}) {
    if (this.invTimer > 0) return false;
    this.hp      -= dmg;
    this.invTimer = 0.9;
    if (options.slow) {
      this.slowTimer = 2.2;
      Audio.playerSlowed();
    } else {
      Audio.playerHurt();
    }
    ps.burst(this.x, this.y, '#ff4444', 12, 200, 4, 0.45);
    if (options.slow) ps.burst(this.x, this.y, '#8844ff', 8, 120, 3, 0.5);
    return true;
  }

  update(dt, level, ps, arcadeHeal = false) {
    // Regen (arcade)
    if (arcadeHeal && !this.dashing) {
      this.hp = Math.min(this.maxHp, this.hp + 2 * dt);
    }

    // Timers
    if (this.invTimer > 0)  this.invTimer  -= dt;
    if (this.slowTimer > 0) this.slowTimer -= dt;
    if (!this.dashing)      this.dashEnergy = Math.min(1, this.dashEnergy + dt * 0.7);
    this.pulsePhase += dt * 5;

    const slow    = this.slowTimer > 0 ? this.SLOW_MULT : 1;
    const md      = norm(this.moveDir);

    if (this.dashing) {
      this.vx = this.dashDir.x * this.dashSpeed;
      this.vy = this.dashDir.y * this.dashSpeed;
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) { this.dashing = false; this.dashTimer = 0; }
      // Dash trail
      ps.trail(this.x, this.y, '#3399ff', this.vx, this.vy, 2 + Math.random() * 4);
      ps.trail(this.x, this.y, '#aaddff', this.vx, this.vy, 1 + Math.random() * 2);
    } else {
      const spd = this.walkSpeed * slow;
      this.vx = lerp(this.vx, md.x * spd, dt * 14);
      this.vy = lerp(this.vy, md.y * spd, dt * 14);
    }

    if (md.x || md.y) {
      this.dashDir = norm(this.moveDir);
      this.angle   = lerp(this.angle, Math.atan2(md.y, md.x) + Math.PI / 2, dt * 18);
    }

    // Move with wall collision
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    level.resolveCircle(this);

    this.x = clamp(this.x, this.r + CELL, level.w - this.r - CELL);
    this.y = clamp(this.y, this.r + CELL, level.h - this.r - CELL);
  }

  draw(ctx) {
    const t = Date.now() / 1000;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Slow aura
    if (this.slowTimer > 0) {
      const a = clamp(this.slowTimer / 2.2, 0, 1) * 0.35;
      ctx.save();
      ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r * 2.5);
      g.addColorStop(0, '#8844ff'); g.addColorStop(1, 'rgba(136,68,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, this.r * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Dash aura
    if (this.dashing) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r * 3.8);
      g.addColorStop(0, 'rgba(51,153,255,0.45)');
      g.addColorStop(1, 'rgba(51,153,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, this.r * 3.8, 0, Math.PI * 2); ctx.fill();
    }

    // Flicker when invincible (not dashing)
    if (this.invTimer > 0 && !this.dashing && Math.floor(t * 14) % 2 === 0) {
      ctx.restore(); return;
    }

    // Outer glow
    ctx.shadowColor = this.dashing ? '#3399ff' : (this.slowTimer > 0 ? '#8844ff' : '#ffe033');
    ctx.shadowBlur  = this.dashing ? 30 : 18;

    // Body
    ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fillStyle   = this.dashing ? '#88ccff' : (this.slowTimer > 0 ? '#bb88ff' : '#ffe033');
    ctx.fill();

    // Core
    ctx.beginPath(); ctx.arc(0, 0, this.r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = this.dashing ? '#ffffff' : '#fffacc';
    ctx.fill();

    // Direction pip
    ctx.rotate(this.angle);
    ctx.fillStyle = this.dashing ? '#0044aa' : '#996600';
    ctx.beginPath(); ctx.arc(0, -this.r * 0.64, 3, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }
}
