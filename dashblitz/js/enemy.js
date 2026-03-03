// ═══════════════════════════════════════════
// ENEMIES — multiple types, varied behaviors
// ═══════════════════════════════════════════

/*
  Types:
    'runner'  — small, fast, dies in 1 dash hit, no slow
    'brute'   — medium, normal, dies in 1 dash hit, no slow
    'tank'    — large, slow, armored (needs wall-slam), no slow
    'ghost'   — medium, fast, SLOWS player on contact
    'slimer'  — medium-slow, slows player, 1 hit
*/

const ENEMY_DEFS = {
  runner: { r: 9,  baseSpd: 160, hpMult: 1, armor: false, slow: false, color: '#ee2222', core: '#cc0000', glow: '#ff3333', label: 'RUNNER' },
  brute:  { r: 14, baseSpd: 90,  hpMult: 1, armor: false, slow: false, color: '#dd2200', core: '#bb1100', glow: '#ff4422', label: 'BRUTE'  },
  tank:   { r: 20, baseSpd: 55,  hpMult: 2, armor: true,  slow: false, color: '#ff6622', core: '#cc4400', glow: '#ff8833', label: 'TANK'   },
  ghost:  { r: 12, baseSpd: 125, hpMult: 1, armor: false, slow: true,  color: '#9933ff', core: '#6600cc', glow: '#bb55ff', label: 'GHOST'  },
  slimer: { r: 15, baseSpd: 70,  hpMult: 1, armor: false, slow: true,  color: '#44bb00', core: '#228800', glow: '#66ee11', label: 'SLIMER' },
};

class Enemy {
  /**
   * @param {number} x
   * @param {number} y
   * @param {string} type — key in ENEMY_DEFS
   * @param {number} diffMult — 0 = easiest
   */
  constructor(x, y, type, diffMult = 0) {
    const def = ENEMY_DEFS[type] || ENEMY_DEFS.brute;
    this.type     = type;
    this.def      = def;
    this.x        = x; this.y = y;
    this.r        = def.r;

    // HP scales with difficulty for armored types, fixed otherwise
    this.maxHp    = def.armor ? Math.max(2, def.hpMult + Math.floor(diffMult * 0.55)) : 1;
    this.hp       = this.maxHp;

    // Speed scales with difficulty
    this.speed    = Math.min(def.baseSpd + diffMult * 10, def.baseSpd * 2.5) * (0.85 + Math.random() * 0.3);

    this.vx = 0; this.vy = 0;
    this.pushVx = 0; this.pushVy = 0;

    this.alive    = true;
    this.hitTimer = 0;
    this.wobble   = Math.random() * Math.PI * 2;
    this.aggro    = 200 + Math.random() * 150 + diffMult * 12;
    this.angle    = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;
    this.wanderDir   = { x: 0, y: 0 };
  }

  update(dt, player, level, ps) {
    if (!this.alive) return;
    this.wobble   += dt * (this.type === 'runner' ? 5 : 2.5);
    this.hitTimer  = Math.max(0, this.hitTimer - dt);

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const d  = Math.hypot(dx, dy) || 1;

    if (d < this.aggro) {
      // Chase
      this.vx = lerp(this.vx, (dx / d) * this.speed, dt * 4);
      this.vy = lerp(this.vy, (dy / d) * this.speed, dt * 4);
      this.angle = lerp(this.angle, Math.atan2(dy, dx), dt * 7);
    } else {
      // Wander
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        const a = Math.random() * Math.PI * 2;
        this.wanderDir  = { x: Math.cos(a), y: Math.sin(a) };
        this.wanderTimer = 0.8 + Math.random() * 1.5;
      }
      this.vx = lerp(this.vx, this.wanderDir.x * this.speed * 0.35, dt * 2);
      this.vy = lerp(this.vy, this.wanderDir.y * this.speed * 0.35, dt * 2);
    }

    // Apply push
    this.vx += this.pushVx;
    this.vy += this.pushVy;
    this.pushVx *= 0.72;
    this.pushVy *= 0.72;

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Wall collision — detect slam for armored enemies
    const oldPushSpd = Math.hypot(this.pushVx, this.pushVy);
    level.resolveCircle(this);
    const newPushSpd = Math.hypot(this.pushVx, this.pushVy);

    if (this.def.armor && oldPushSpd > 80 && newPushSpd < oldPushSpd - 30) {
      // Hit a wall while being pushed fast
      this.hp--;
      this.hitTimer = 0.35;
      ps.burst(this.x, this.y, this.def.glow, 8, 150, 4, 0.38);
      ps.ring(this.x, this.y, this.def.color, this.r + 4, 8, 80);
      if (this.hp <= 0) this._die(ps);
    }

    this.x = clamp(this.x, this.r + CELL, level.w - this.r - CELL);
    this.y = clamp(this.y, this.r + CELL, level.h - this.r - CELL);
  }

  // Called when player dashes into this enemy
  onDashHit(player, ps, cam) {
    if (!this.alive) return 0;

    //if (this.def.armor) {
      // Push strongly into a wall
      //const nd = norm({ x: this.x - player.x, y: this.y - player.y });
      //this.pushVx = nd.x * 680;
      //this.pushVy = nd.y * 680;
      //cam.shake(0.7);
      //ps.burst(player.x, player.y, this.def.glow, 8, 180, 3, 0.3);
      //this.hp *= 0.5;
      //return 0; // no score yet
    //} else {
      // Kill instantly
      this._die(ps);
      cam.shake(1.3);
      return 1; // killed
    //}
  }

  // Called when enemy touches player without dash
  onContactHit(player, ps) {
    const dmg = 10 + Math.floor(this.r * 0.4);
    return player.applyHit(dmg, ps, { slow: !!this.def.slow });
  }

  _die(ps) {
    this.alive = false;
    ps.burst(this.x, this.y, this.def.color, 22, 260, 5.5, 0.72);
    ps.burst(this.x, this.y, '#ffffff', 6, 160, 2.5, 0.28);
    ps.ring(this.x, this.y, this.def.glow, this.r + 2, 12, 90);
    Audio.killEnemy(this.def.armor ? 'strong' : 'normal');
  }

  draw(ctx) {
    if (!this.alive) return;
    const t   = Date.now() / 1000;
    const hit = this.hitTimer > 0;
    const wb  = Math.sin(this.wobble) * (this.type === 'runner' ? 2.5 : 1.8);

    ctx.save();
    ctx.translate(this.x, this.y);

    // Glow
    ctx.shadowColor = this.def.glow;
    ctx.shadowBlur  = 14 + Math.sin(t * 4 + this.wobble) * 4;
    if (this.def.armor) ctx.shadowBlur += 8;

    // Body
    ctx.beginPath();
    ctx.arc(wb, 0, this.r, 0, Math.PI * 2);
    ctx.fillStyle = hit ? '#ffffff' : this.def.color;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(wb, 0, this.r * 0.48, 0, Math.PI * 2);
    ctx.fillStyle = hit ? '#ffcccc' : this.def.core;
    ctx.fill();

    // HP pips (armored)
    if (this.def.armor) {
      for (let i = 0; i < this.maxHp; i++) {
        const a  = (i / this.maxHp) * Math.PI * 2 - Math.PI / 2;
        const pr = this.r + 7;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * pr, Math.sin(a) * pr, 3, 0, Math.PI * 2);
        ctx.fillStyle = i < this.hp ? this.def.glow : '#221100';
        ctx.fill();
      }
    }

    // Special: ghost pulsing opacity ring
    if (this.type === 'ghost') {
      ctx.globalAlpha = 0.3 + Math.sin(t * 6) * 0.15;
      ctx.beginPath(); ctx.arc(0, 0, this.r * 1.6, 0, Math.PI * 2);
      ctx.strokeStyle = this.def.glow; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Eye
    ctx.rotate(this.angle);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.arc(this.r * 0.44, 0, this.r * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(this.r * 0.48, 0, this.r * 0.1, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }
}

// ── Enemy spawn table per level ─────────────────────────
function buildEnemyPool(levelNum, diffMult) {
  // Progressive unlocking + weights
  const pool = [];
  const add = (type, weight) => { for (let i = 0; i < weight; i++) pool.push(type); };

  add('brute', 4);
  if (levelNum >= 1) add('runner', 3);
  if (levelNum >= 2) add('ghost', 2);
  if (levelNum >= 3) add('tank', 2);
  if (levelNum >= 4) add('slimer', 2);
  if (levelNum >= 6) add('runner', 2); // runners become more common
  if (levelNum >= 8) add('tank', 1);

  return pool;
}

function pickEnemyType(pool, rng) {
  return pool[Math.floor(rng() * pool.length)];
}
