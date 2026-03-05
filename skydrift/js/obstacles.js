// ════════════════════════════════════════
//  obstacles.js  —  obstacle spawning,
//  updating, drawing, and collision
//
//  All obstacles live in WORLD space (worldY).
//  They are drawn at Camera.toScreenY(worldY).
//  Obstacles spawn BELOW the camera's bottom edge
//  so the player always "falls into" them.
// ════════════════════════════════════════

const Obstacles = (() => {

  const TYPES = ['rock', 'crate', 'bird', 'door', 'cannon', 'laser'];
  let list = [];
  let destroyerRadius = 80;

  function getCanvas() { return document.getElementById('gameCanvas'); }
  function W()  { return getCanvas().width; }
  function H()  { return getCanvas().height; }

  // ── Helpers ────────────────────────────────────────
  function pastel() {
    return `hsl(${Math.floor(Math.random() * 360)},45%,72%)`;
  }

  // Spawn Y is always below the visible screen in world space
  function spawnWorldY() {
    return Camera.getWorldY() + H() * (0.85 + Math.random() * 0.4);
  }

  // ── Spawn ──────────────────────────────────────────
  function spawn() {
    const type  = TYPES[Math.floor(Math.random() * TYPES.length)];
    const speed = (55 + Math.random() * 120) * State.gameSpeed * (Math.random() < 0.5 ? 1 : -1);
    const fromLeft = Math.random() < 0.5;

    const base = {
      type,
      worldY: spawnWorldY(),
      x: fromLeft ? -60 : W() + 60,
      w: 40, h: 40,
      vx: speed,
      alive: true,
      timer: 0,
      phase: Math.random() * Math.PI * 2,
      color: pastel(),
    };

    if (type === 'laser') {
      Object.assign(base, {
        x: 0,
        w: W(), h: 12,
        vx: 0,
        on: false,
        laserTimer: 0,
        laserInterval: 0.85 + Math.random() * 1.2,
      });
    } else if (type === 'door') {
      Object.assign(base, {
        w: 64, h: 80,
        vx: (28 + Math.random() * 44) * (fromLeft ? 1 : -1) * State.gameSpeed,
        gapOpen: false,
        openTimer: 0,
        openInterval: 1.4 + Math.random() * 1.6,
      });
    } else if (type === 'cannon') {
      Object.assign(base, {
        vx: (18 + Math.random() * 42) * (fromLeft ? 1 : -1) * State.gameSpeed,
        shootTimer: 0,
        shootInterval: 1.8 + Math.random() * 2.2,
        projectiles: [],
      });
    } else if (type === 'bird') {
      base.vx = speed * 1.35;
    }

    list.push(base);
  }

  // ── Update ─────────────────────────────────────────
  function update(dt) {
    // Destroyer radius pulse
    destroyerRadius = 88 + Math.sin(Date.now() * 0.005) * 10;

    list.forEach(obs => {
      if (!obs.alive) return;
      obs.timer += dt;
      obs.x += obs.vx * dt;

      if (obs.type === 'door') {
        obs.openTimer += dt;
        if (obs.openTimer >= obs.openInterval) { obs.gapOpen = !obs.gapOpen; obs.openTimer = 0; }
      }

      if (obs.type === 'cannon') {
        obs.shootTimer += dt;
        if (obs.shootTimer >= obs.shootInterval) {
          obs.shootTimer = 0;
          Audio.sfx.cannon();
          obs.projectiles.push({
            x: obs.x,
            worldY: obs.worldY,
            vy: 190 + Math.random() * 110,
            alive: true, r: 6,
          });
        }
        obs.projectiles.forEach(p => {
          p.worldY += p.vy * dt;
          if (Camera.toScreenY(p.worldY) > H() + 30) p.alive = false;
        });
        obs.projectiles = obs.projectiles.filter(p => p.alive);
      }

      if (obs.type === 'laser') {
        obs.laserTimer += dt;
        if (obs.laserTimer >= obs.laserInterval) {
          obs.on = !obs.on;
          obs.laserTimer = 0;
          if (obs.on) Audio.sfx.laser();
        }
      }

      if (obs.type === 'bird') {
        obs.worldY += Math.sin(obs.timer * 2.2 + obs.phase) * 35 * dt;
      }

      // Cull far offscreen horizontally
      if (obs.type !== 'laser' && (obs.x < -220 || obs.x > W() + 220)) obs.alive = false;

      // Cull obstacles that scrolled far above camera (player passed them)
      if (Camera.toScreenY(obs.worldY) < -300) obs.alive = false;

      // Destroyer check
      if (Player.hasDestroyer() && obs.type !== 'laser' && obs.type !== 'door') {
        const dx = obs.x - Player.getX();
        const dy = Camera.toScreenY(obs.worldY) - Player.getScreenY();
        if (Math.sqrt(dx * dx + dy * dy) < destroyerRadius + obs.w / 2) {
          Particles.spawn(obs.x, Camera.toScreenY(obs.worldY), '#ab47bc', 12);
          obs.alive = false;
          State.addShake(5);
          Audio.sfx.destroy();
        }
      }
    });

    list = list.filter(o => o.alive || o.type === 'laser');
  }

  // ── Draw ───────────────────────────────────────────
  function draw(ctx) {
    list.forEach(obs => {
      if (!obs.alive) return;
      const sy = Camera.toScreenY(obs.worldY);

      // Skip if completely off screen
      if (sy < -100 || sy > H() + 100) return;

      ctx.save();

      if (obs.type === 'rock') {
        ctx.translate(obs.x, sy);
        ctx.rotate(obs.timer * 0.55);
        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const r = (obs.w / 2) * (0.75 + (i % 3 === 0 ? 0.25 : 0));
          i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
                  : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = obs.color; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 2; ctx.stroke();

      } else if (obs.type === 'crate') {
        ctx.translate(obs.x, sy);
        ctx.fillStyle = obs.color;
        ctx.fillRect(-obs.w / 2, -obs.h / 2, obs.w, obs.h);
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
        ctx.strokeRect(-obs.w / 2, -obs.h / 2, obs.w, obs.h);
        ctx.strokeStyle = 'rgba(0,0,0,0.14)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-obs.w / 2, 0); ctx.lineTo(obs.w / 2, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -obs.h / 2); ctx.lineTo(0, obs.h / 2); ctx.stroke();

      } else if (obs.type === 'bird') {
        ctx.translate(obs.x, sy);
        const wing = Math.sin(obs.timer * 9) * 11;
        ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-15, wing); ctx.quadraticCurveTo(0, -5, 15, wing); ctx.stroke();
        ctx.fillStyle = '#5d4037';
        ctx.beginPath(); ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff6f00';
        ctx.beginPath(); ctx.moveTo(7, -1); ctx.lineTo(11, 0); ctx.lineTo(7, 1); ctx.fill();

      } else if (obs.type === 'door') {
        ctx.translate(obs.x, sy);
        const gapH = obs.gapOpen ? 42 : 6;
        const panelH = (obs.h - gapH) / 2;
        // Top panel
        ctx.fillStyle = obs.color;
        ctx.fillRect(-obs.w / 2, -obs.h / 2, obs.w, panelH);
        // Bottom panel
        ctx.fillRect(-obs.w / 2, obs.h / 2 - panelH, obs.w, panelH);
        // Frame
        ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 2;
        ctx.strokeRect(-obs.w / 2, -obs.h / 2, obs.w, obs.h);
        // Warning stripes
        ctx.save(); ctx.globalAlpha = 0.28;
        ctx.fillStyle = '#f4dca8';
        for (let i = 0; i < 4; i++) ctx.fillRect(-obs.w / 2 + i * 15, -obs.h / 2, 8, panelH);
        ctx.restore();

      } else if (obs.type === 'cannon') {
        ctx.translate(obs.x, sy);
        ctx.fillStyle = '#78909c';
        ctx.fillRect(-obs.w / 2, -10, obs.w * 0.65, 20);
        ctx.beginPath(); ctx.arc(0, 0, obs.w / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#90a4ae'; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 2; ctx.stroke();
        // Projectiles (drawn in world-relative coords)
        obs.projectiles.forEach(p => {
          const psy = Camera.toScreenY(p.worldY);
          ctx.beginPath(); ctx.arc(p.x - obs.x, psy - sy, p.r, 0, Math.PI * 2);
          ctx.fillStyle = '#ff7043'; ctx.fill();
        });

      } else if (obs.type === 'laser') {
        if (obs.on) {
          const alpha = 0.55 + Math.sin(obs.timer * 22) * 0.28;
          ctx.fillStyle = `rgba(255,75,75,${alpha})`;
          ctx.fillRect(0, sy - obs.h / 2, W(), obs.h);
          // Glow
          const lg = ctx.createLinearGradient(0, sy - 22, 0, sy + 22);
          lg.addColorStop(0,   'rgba(255,75,75,0)');
          lg.addColorStop(0.5, `rgba(255,110,110,${alpha * 0.4})`);
          lg.addColorStop(1,   'rgba(255,75,75,0)');
          ctx.fillStyle = lg;
          ctx.fillRect(0, sy - 22, W(), 44);
        } else {
          ctx.globalAlpha = 0.12;
          ctx.fillStyle = 'rgba(255,80,80,0.35)';
          ctx.fillRect(0, sy - obs.h / 2, W(), obs.h);
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();
    });
  }

  // ── Collision detection ───────────────────────────
  function checkCollisions() {
    const px  = Player.getX();
    const psy = Player.getScreenY();
    const pr  = 16; // player collision radius

    for (const obs of list) {
      if (!obs.alive) continue;
      const sy = Camera.toScreenY(obs.worldY);
      let hit = false;

      if (obs.type === 'laser') {
        if (obs.on && Math.abs(psy - sy) < obs.h / 2 + pr) hit = true;

      } else if (obs.type === 'door') {
        const inX = px > obs.x - obs.w / 2 - pr && px < obs.x + obs.w / 2 + pr;
        if (inX) {
          if (obs.gapOpen) {
            const gapH  = 42;
            const panel = (obs.h - gapH) / 2;
            const topBot = sy - obs.h / 2 + panel;
            const botTop = sy + obs.h / 2 - panel;
            if (psy < topBot + pr || psy > botTop - pr) hit = true;
          } else {
            if (Math.abs(psy - sy) < obs.h / 2 + pr) hit = true;
          }
        }

      } else if (obs.type === 'cannon') {
        const dx = px - obs.x, dy = psy - sy;
        if (Math.sqrt(dx * dx + dy * dy) < pr + obs.w / 2) hit = true;
        if (!hit) {
          for (const p of obs.projectiles) {
            const pdy = psy - Camera.toScreenY(p.worldY);
            const pdx = px - p.x;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < pr + p.r) { hit = true; break; }
          }
        }

      } else {
        const dx = px - obs.x, dy = psy - sy;
        if (Math.abs(dx) < pr + obs.w / 2 && Math.abs(dy) < pr + obs.h / 2) hit = true;
      }

      if (hit) {
        handleHit(obs);
        return; // handle one hit per frame
      }
    }
  }

  function handleHit(obs) {
    if (Player.hasRocket()) {
      Particles.spawn(obs.x, Camera.toScreenY(obs.worldY), '#ff7043', 16);
      if (obs.type !== 'laser') obs.alive = false;
      State.addShake(10);
      Audio.sfx.destroy();
      return;
    }

    if (Player.hasShield()) {
      Particles.spawn(obs.x, Camera.toScreenY(obs.worldY), '#4fc3f7', 12);
      if (obs.type !== 'laser') obs.alive = false;
      State.addShake(7);
      Audio.sfx.destroy();
      Player.consumeShield();
      Game.updatePowerupHUD();
      return;
    }

    if (Player.hasDash()) {
      Particles.spawn(obs.x, Camera.toScreenY(obs.worldY), '#00e5ff', 14);
      if (obs.type !== 'laser') obs.alive = false;
      State.addShake(8);
      Audio.sfx.dash();
      // Dash away horizontally
      Player.addDrift(obs.x < Player.getX() ? 400 : -400);
      Player.consumeDash();
      Game.updatePowerupHUD();
      return;
    }

    // No protection — game over
    Audio.sfx.hit();
    Particles.spawn(Player.getX(), Player.getScreenY(), '#ff6b6b', 22);
    State.addShake(18);
    Game.triggerGameOver();
  }

  // ── Dash-shield proximity auto-dodge ─────────────
  function checkDashProximity() {
    if (!Player.hasDash()) return;
    const px  = Player.getX();
    const psy = Player.getScreenY();
    const detectR = 72;

    for (const obs of list) {
      if (!obs.alive || obs.type === 'laser') continue;
      const sy = Camera.toScreenY(obs.worldY);
      const dx = obs.x - px, dy = sy - psy;
      if (Math.sqrt(dx * dx + dy * dy) < detectR + obs.w / 2) {
        Particles.spawn(obs.x, sy, '#00e5ff', 14);
        obs.alive = false;
        State.addShake(8);
        Audio.sfx.dash();
        Player.addDrift(obs.x < px ? 380 : -380);
        break;
      }
    }
  }

  function reset() { list = []; }
  function getDestroyerRadius() { return destroyerRadius; }
  function getAll() { return list; }

  return { spawn, update, draw, checkCollisions, checkDashProximity, reset, getDestroyerRadius, getAll };
})();
