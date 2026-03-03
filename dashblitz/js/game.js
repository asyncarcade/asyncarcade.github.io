// ═══════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════

class Game {
  constructor(canvas, mode, seed) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.mode    = mode;   // 'level' | 'arcade'
    //this.seed    = seed || String(Math.floor(Math.random() * 99999));
    this.levelNum   = seed || 1;
    this.seed = 328;

    console.log(`Game started: ${this.mode} mode, seed: ${this.seed}, level: ${this.levelNum}`);

    // State
    this.running    = false;
    this.dead       = false;
    this.phase      = 'playing'; // 'playing' | 'clearing' | 'fading' | 'dead'
    this.fadeAlpha  = 0;

    this.score      = 0;
    this.kills      = 0;
    this.timeLeft   = 0;
    this.timeMax    = 0;

    // Arcade specifics
    this.wave          = 1;
    this.waveTimer     = 0;
    this.waveCooldown  = 15;   // seconds between waves
    this.maxOnField    = 10;
    this.waveEnemyPool = [];

    // Objects
    this.level   = null;
    this.player  = null;
    this.enemies = [];
    this.ps      = new ParticleSystem();
    this.cam     = new Camera();
    this.floats  = []; // score floats in world space

    // Input
    this.dragStart = null;
    this.dragCur   = null;
    this.touchId   = null;

    this._then = 0;
    this._setupInput();
  }

  // ── Sizing ────────────────────────────────
  static resize(canvas) {
    const ASPECT = 9 / 16;
    const avW    = Math.min(window.innerWidth - 4, 440);
    const avH    = window.innerHeight - 136;
    let cW = avW, cH = Math.round(cW / ASPECT);
    if (cH > avH) { cH = avH; cW = Math.round(cH * ASPECT); }
    canvas.width  = cW;
    canvas.height = cH;
    canvas.style.width  = cW + 'px';
    canvas.style.height = cH + 'px';
    document.getElementById('shell').style.width = (cW + 4) + 'px';
  }

  // ── Difficulty ────────────────────────────
  get diffMult() { return (this.levelNum - 1) * 1.3; }
  get levelTime() { return Math.max(18, 90 - (this.levelNum - 1) * 5); }

  // ── Start / level init ─────────────────────
  start() {
    this.score = 0; this.kills = 0;
    this.dead = false; this.phase = 'playing'; this.fadeAlpha = 0;
    this.wave = 1; this.waveTimer = this.waveCooldown;
    this._initLevel();
    this.running = true;
    Audio.startMusic();
    HUD.setMode(this.mode);
    requestAnimationFrame(ts => this._loop(ts));
  }

  _initLevel() {
    this.level   = new Level(this.levelNum, this.seed);
    this.enemies = [];
    this.ps.clear();
    this.floats  = [];

    const sp = this.level.playerSpawn;
    this.player = new Player(sp.x, sp.y);

    // Level mode: fixed enemy set
    if (this.mode === 'level') {
      this.timeLeft = this.levelTime;
      this.timeMax  = this.timeLeft;
      let d = Math.max(1, Math.min(this.levelNum, 8));
      const rng = mkRng(strToSeed(this.seed + ':enemies:' + d));
      const pool = buildEnemyPool(this.levelNum, this.diffMult);
      const count = Math.min(3 + Math.floor(d * 2.3), this.level.spawnPts.length);
      for (let i = 0; i < count; i++) {
        const pt   = this.level.spawnPts[i];
        const type = pickEnemyType(pool, rng);
        this.enemies.push(new Enemy(pt.x, pt.y, type, this.diffMult));
      }
    } else {
      // Arcade: no time limit, no exit, spawn on wave timer
      this.timeLeft = 0;
      this._spawnWave();
    }

    // Snap camera
    this.cam.x = this.player.x - this.canvas.width  / 2;
    this.cam.y = this.player.y - this.canvas.height / 2;
  }

  // Arcade wave spawn
  _spawnWave() {
    const dm   = (this.wave - 1) * 0.8;
    const pool = buildEnemyPool(Math.ceil(this.wave / 2), dm);
    const rng  = mkRng(strToSeed(this.seed + ':wave:' + this.wave + ':' + Date.now()));
    const count = Math.min(3 + Math.floor(this.wave * 1.5), this.level.spawnPts.length, this.maxOnField);
    const pts   = this.level.spawnPts.slice().sort(() => rng() - 0.5);
    for (let i = 0; i < count; i++) {
      const pt   = pts[i % pts.length];
      const type = pickEnemyType(pool, rng);
      if (Math.hypot(pt.x - this.player.x, pt.y - this.player.y) > 120)
        this.enemies.push(new Enemy(pt.x, pt.y, type, dm));
    }
    Audio.waveStart();
    this._addFloat(this.player.x, this.player.y - 40, `WAVE ${this.wave}`, '#ffe033', 2);
    this.wave++;
    this.waveTimer = Math.max(5, this.waveCooldown - this.wave * 0.3);
  }

  // ── Main loop ─────────────────────────────
  _loop(ts) {
    if (!this.running) return;
    const dt = Math.min((ts - this._then) / 1000, 0.05);
    this._then = ts;
    this._update(dt);
    this._draw();
    requestAnimationFrame(ts => this._loop(ts));
  }

  // ── Update ────────────────────────────────
  _update(dt) {
    if (this.phase === 'dead') return;

    // Fade transitions
    if (this.phase === 'fading') {
      this.fadeAlpha += dt * 1.6;
      if (this.fadeAlpha >= 1) {
        this.fadeAlpha = 1;
        this.levelNum++;
        this._initLevel();
        this.phase = 'unfading';
      }
      this.ps.update(dt);
      return;
    }
    if (this.phase === 'unfading') {
      this.fadeAlpha -= dt * 1.6;
      if (this.fadeAlpha <= 0) {
        this.fadeAlpha = 0;
        this.phase = 'playing';
      }
      this.ps.update(dt);
      return;
    }

    if (!this.player) return;

    // Move direction from drag
    if (this.dragStart && this.dragCur) {
      const dx = this.dragCur.x - this.dragStart.x;
      const dy = this.dragCur.y - this.dragStart.y;
      const d  = Math.hypot(dx, dy);
      this.player.moveDir = d > 10 ? { x: dx / d, y: dy / d } : { x: 0, y: 0 };
    } else {
      this.player.moveDir = { x: 0, y: 0 };
    }

    this.player.update(dt, this.level, this.ps, this.mode === 'arcade');
    this.cam.follow(this.player.x, this.player.y, dt, this.canvas.width, this.canvas.height);

    // Timer (level mode)
    if (this.mode === 'level') {
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      this.canvas.classList.toggle('time-crit', this.timeLeft < 10 && this.timeLeft > 0);
      if (this.timeLeft <= 0) { this._triggerDeath('TIME UP!'); return; }
    }

    // Arcade: wave spawner
    if (this.mode === 'arcade') {
      const alive = this.enemies.filter(e => e.alive).length;
      if (alive === 0 || (alive < 4 && this.waveTimer <= 0)) {
        this.waveTimer = Math.max(5, this.waveCooldown - this.wave * 0.25);
        this._spawnWave();
      } else {
        this.waveTimer = Math.max(0, this.waveTimer - dt);
      }
    }

    // Enemy updates + player collision
    this.enemies.forEach(e => {
      if (!e.alive) return;
      e.update(dt, this.player, this.level, this.ps);
      const d    = dist(e, this.player);
      const comb = e.r + this.player.r;
      if (d >= comb) return;

      if (this.player.dashing) {
        const killed = e.onDashHit(this.player, this.ps, this.cam);
        if (killed) {
          const pts = this._scoreForKill(e);
          this.score += pts;
          this.kills++;
          this._addFloat(e.x, e.y, '+' + pts, '#ff4444', 1);
        }
      } else {
        const hurt = e.onContactHit(this.player, this.ps);
        if (hurt) {
          this.cam.shake(2);
          const dmg = 10 + Math.floor(e.r * 0.4);
          this._addFloat(this.player.x, this.player.y - 20, '-' + dmg, '#ff3333', 0.7);
        }
      }
    });

    this.enemies = this.enemies.filter(e => e.alive);

    // Level mode: check exit
    if (this.mode === 'level') {
      const aliveCount = this.enemies.length;
      if (aliveCount === 0 && this.phase === 'playing') {
        const ex = this.level.exit;
        if (ex &&
            this.player.x > ex.x && this.player.x < ex.x + ex.w &&
            this.player.y > ex.y && this.player.y < ex.y + ex.h) {
          this._completeLevelMode();
        }
      }
    }

    // Death check
    if (this.player.hp <= 0) { this._triggerDeath('ELIMINATED'); return; }

    this.ps.update(dt);

    // Float updates
    this.floats = this.floats.filter(f => {
      f.life -= dt;
      f.y    += f.vy * dt;
      return f.life > 0;
    });

    // HUD
    HUD.update({
      player:     this.player,
      score:      this.score,
      kills:      this.kills,
      levelNum:   this.levelNum,
      timeLeft:   this.timeLeft,
      timeMax:    this.timeMax,
      wave:       this.wave - 1,
      enemyCount: this.enemies.length,
      mode:       this.mode,
    });
  }

  _scoreForKill(e) {
    const base = e.def.armor ? 250 : (e.type === 'runner' ? 80 : 120);
    return base + this.levelNum * 15;
  }

  _addFloat(x, y, text, color, life = 1) {
    this.floats.push({ x, y, text, color, life, maxLife: life, vy: -60 });
  }

  _completeLevelMode() {
    this.phase = 'clearing';
    const tb    = Math.floor(this.timeLeft) * 18;
    const bonus = 500 + this.levelNum * 200 + tb;
    this.score += bonus;
    this._addFloat(this.player.x, this.player.y - 40, 'LEVEL CLEAR! +' + bonus.toLocaleString(), '#00ffaa', 2.5);
    this.ps.burst(this.player.x, this.player.y, '#00ffaa', 32, 220, 5, 0.9);
    this.ps.ring(this.player.x, this.player.y, '#ffe033', 32, 22, 100);
    this.cam.shake(2);
    Audio.levelClear();
    this.canvas.classList.remove('time-crit');
    // Start fade to black after 1.2s
    setTimeout(() => {
      if (this.running) this.phase = 'fading';
    }, 1200);
  }

  _triggerDeath(reason) {
    if (this.dead || this.phase === 'dead') return;
    this.dead  = true;
    this.phase = 'dead';
    this.ps.burst(this.player.x, this.player.y, '#ffe033', 36, 300, 8, 1.7);
    this.ps.burst(this.player.x, this.player.y, '#ff8844', 22, 200, 5, 1.2);
    this.cam.shake(5);
    this.canvas.classList.remove('time-crit');
    setTimeout(() => {
      this.running = false;
      Audio.stopMusic();
      if (typeof onGameOver === 'function') onGameOver(reason, this);
    }, 1400);
  }

  // ── Draw ──────────────────────────────────
  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#07070e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    this.cam.apply(ctx);

    // Level
    this.level.draw(ctx, this.mode === 'arcade');

    // Particles behind entities
    this.ps.draw(ctx);

    // Enemies
    this.enemies.forEach(e => e.draw(ctx));

    // Player
    if (this.player && this.player.hp > 0 && this.phase !== 'fading') {
      this.player.draw(ctx);
    }

    // Exit label (level mode)
    if (this.mode === 'level' && this.level.exit) {
      this._drawExitLabel(ctx);
    }

    // Score floats
    this._drawFloats(ctx);

    ctx.restore();

    // Screen-space effects
    this._drawScreenFX(ctx);
  }

  _drawExitLabel(ctx) {
    const ex  = this.level.exit;
    const t   = Date.now() / 1000;
    const alive = this.enemies.length;
    ctx.save();
    ctx.font       = 'bold 10px "Share Tech Mono"';
    ctx.textAlign  = 'center';
    if (alive === 0) {
      ctx.fillStyle = `rgba(0,255,170,${0.55 + Math.sin(t * 3.8) * 0.28})`;
      ctx.shadowColor = '#00ffaa'; ctx.shadowBlur = 8;
      ctx.fillText('EXIT',    ex.x + ex.w / 2, ex.y + ex.h / 2 - 5);
      ctx.fillText('▲', ex.x + ex.w / 2, ex.y + ex.h / 2 + 10);
    } else {
      ctx.fillStyle = 'rgba(255,80,80,0.38)';
      ctx.fillText(alive + ' LEFT', ex.x + ex.w / 2, ex.y + ex.h / 2 + 4);
    }
    ctx.restore();
  }

  _drawFloats(ctx) {
    this.floats.forEach(f => {
      ctx.save();
      ctx.globalAlpha = clamp(f.life / f.maxLife, 0, 1);
      ctx.font        = `bold ${f.text.length > 7 ? 10 : 14}px "Orbitron", monospace`;
      ctx.fillStyle   = f.color;
      ctx.shadowColor = f.color;
      ctx.shadowBlur  = 7;
      ctx.textAlign   = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    });
  }

  _drawScreenFX(ctx) {
    const W = this.canvas.width, H = this.canvas.height;

    // Fade overlay (level transitions)
    if (this.phase === 'fading' || this.phase === 'unfading') {
      ctx.save();
      ctx.globalAlpha = clamp(this.fadeAlpha, 0, 1);
      ctx.fillStyle   = '#000000';
      ctx.fillRect(0, 0, W, H);
      if (this.phase === 'fading' && this.fadeAlpha > 0.5) {
        ctx.globalAlpha = (this.fadeAlpha - 0.5) * 2;
        ctx.font = 'bold 36px "Orbitron", monospace';
        ctx.fillStyle = '#ffe033';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffe033'; ctx.shadowBlur = 24;
        ctx.fillText('LEVEL ' + (this.levelNum + 1), W / 2, H / 2);
      }
      ctx.restore();
    }

    // Drag indicator
    if (this.dragStart && this.dragCur) {
      const dx = this.dragCur.x - this.dragStart.x;
      const dy = this.dragCur.y - this.dragStart.y;
      const d  = Math.hypot(dx, dy);
      if (d > 10) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,224,51,0.18)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.moveTo(this.dragStart.x, this.dragStart.y);
        ctx.lineTo(this.dragCur.x, this.dragCur.y); ctx.stroke();
        ctx.beginPath(); ctx.arc(this.dragStart.x, this.dragStart.y, 7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,224,51,0.3)'; ctx.setLineDash([]); ctx.stroke();
        ctx.restore();
      }
    }

    // Low-HP vignette
    if (this.player && this.player.hp < 40) {
      const pulse = 0.5 + Math.sin(Date.now() * 0.009) * 0.2;
      const ii    = (1 - this.player.hp / 40) * 0.58 * pulse;
      const g     = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, H * 0.88);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, `rgba(200,0,0,${ii})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // Slow vignette
    if (this.player && this.player.slowTimer > 0) {
      const ii = clamp(this.player.slowTimer / 2.2, 0, 1) * 0.3;
      const g  = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, `rgba(100,0,200,${ii})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // Time critical red pulse border
    if (this.mode === 'level' && this.timeLeft > 0 && this.timeLeft < 10) {
      const pulse = 0.4 + Math.sin(Date.now() * 0.018) * 0.3;
      ctx.save();
      ctx.strokeStyle = `rgba(255,40,40,${pulse})`;
      ctx.lineWidth   = 5;
      ctx.strokeRect(0, 0, W, H);
      ctx.restore();
    }
  }

  // ── Input ─────────────────────────────────
  _setupInput() {
    const cv = this.canvas;

    window.addEventListener('keydown', e => {
      if (e.code === 'Space' && this.running) {
        e.preventDefault();
        this.player && this.player.startDash();
      }
    });

    const getXY = (e, r) => ({ x: e.clientX - r.left, y: e.clientY - r.top });
    const rc    = () => cv.getBoundingClientRect();

    cv.addEventListener('mousedown',  e => { this.dragStart = getXY(e, rc()); this.dragCur = { ...this.dragStart }; });
    cv.addEventListener('mousemove',  e => { if (this.dragStart) this.dragCur = getXY(e, rc()); });
    cv.addEventListener('mouseup',    () => { this.dragStart = null; this.dragCur = null; });
    cv.addEventListener('mouseleave', () => { this.dragStart = null; this.dragCur = null; });

    cv.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.changedTouches[0]; this.touchId = t.identifier;
      const r = rc(); this.dragStart = { x: t.clientX - r.left, y: t.clientY - r.top }; this.dragCur = { ...this.dragStart };
    }, { passive: false });

    cv.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this.touchId) {
          const r = rc(); this.dragCur = { x: t.clientX - r.left, y: t.clientY - r.top };
        }
      }
    }, { passive: false });

    cv.addEventListener('touchend', e => {
      for (const t of e.changedTouches) if (t.identifier === this.touchId) { this.dragStart = null; this.dragCur = null; this.touchId = null; }
    });

    const db = document.getElementById('dash-btn');
    if (db) {
      db.addEventListener('touchstart', e => { e.preventDefault(); db.classList.add('pr'); this.player && this.player.startDash(); });
      db.addEventListener('touchend',   () => db.classList.remove('pr'));
      db.addEventListener('click',      () => this.player && this.player.startDash());
    }
  }
}
