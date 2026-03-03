// ═══════════════════════════════════════════
// LEVEL — seeded, BSP-based, no enclosed areas
// ═══════════════════════════════════════════

class Level {
  /**
   * @param {number} levelNum   — level number (1-based)
   * @param {string} globalSeed — player-entered seed string
   */
  constructor(levelNum, globalSeed) {
    this.levelNum = levelNum;
    const seedKey = String(globalSeed) + ':' + levelNum;
    this.rng = mkRng(strToSeed(seedKey));

    // Portrait canvas dimensions
    this.cols = clamp(10 + Math.floor(levelNum * 0.3), 10, 14);
    this.rows = clamp(18 + Math.floor(levelNum * 0.5), 18, 26);
    this.w = this.cols * CELL;
    this.h = this.rows * CELL;

    this.walls  = [];   // { x, y, w, h }
    this.exit   = null; // { x, y, w, h }  — only in level mode
    this.spawnPts = [];

    this._generate();
  }

  // ── internal RNG shortcuts ─────────────────
  _r(a, b)  { return a + this.rng() * (b - a); }
  _ri(a, b) { return Math.floor(a + this.rng() * (b - a + 1)); }

  // ── Main generation ────────────────────────
  _generate() {
    // We use a corridor-room approach so there is ALWAYS a path
    // between any two open cells. Strategy:
    //   1. Fill a grid with "wall" flags.
    //   2. Carve rooms using BSP splits.
    //   3. Connect rooms with corridors.
    //   4. Convert carve grid to wall rects.
    //   5. Trim border.

    const C = this.cols;
    const R = this.rows;
    // grid[row][col] = true means OPEN (walkable)
    const grid = Array.from({ length: R }, () => new Array(C).fill(false));

    // BSP tree
    const rooms = [];
    this._bsp(1, 1, C - 2, R - 2, 0, rooms, grid);

    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
      this._corridor(rooms[i], rooms[i + 1], grid);
    }

    // Convert grid to wall rectangles
    // Every grid cell that is NOT open → wall
    this.walls = [];
    // Border walls (always solid)
    this.walls.push({ x: 0, y: 0, w: this.w, h: CELL });
    this.walls.push({ x: 0, y: this.h - CELL, w: this.w, h: CELL });
    this.walls.push({ x: 0, y: 0, w: CELL, h: this.h });
    this.walls.push({ x: this.w - CELL, y: 0, w: CELL, h: this.h });

    // Interior: merge horizontal runs of closed cells per row
    for (let row = 1; row < R - 1; row++) {
      let runStart = -1;
      for (let col = 1; col < C - 1; col++) {
        if (!grid[row][col]) {
          if (runStart === -1) runStart = col;
        } else {
          if (runStart !== -1) {
            const len = col - runStart;
            this.walls.push({ x: runStart * CELL, y: row * CELL, w: len * CELL, h: CELL });
            runStart = -1;
          }
        }
      }
      if (runStart !== -1) {
        const len = (C - 1) - runStart;
        this.walls.push({ x: runStart * CELL, y: row * CELL, w: len * CELL, h: CELL });
      }
    }

    // Exit: top-right open corner — pick the rightmost room near the top
    const topRooms = rooms.filter(r => r.cy < R * 0.4).sort((a, b) => b.cx - a.cx);
    const exitRoom = topRooms[0] || rooms[0];
    const ex = Math.max(1, Math.min(C - 3, exitRoom.cx));
    const ey = Math.max(1, Math.min(R - 3, exitRoom.cy));
    this.exit = { x: ex * CELL, y: ey * CELL, w: CELL * 2, h: CELL * 2 };

    // Player spawn: bottom-left room
    const botRooms = rooms.slice().sort((a, b) => (b.cy - a.cy) || (a.cx - b.cx));
    const spawnRoom = botRooms[0] || rooms[rooms.length - 1];
    this.playerSpawn = {
      x: clamp(spawnRoom.cx, 2, C - 3) * CELL + CELL * 0.5,
      y: clamp(spawnRoom.cy, 2, R - 3) * CELL + CELL * 0.5
    };

    // Collect open cells for enemy spawns (excluding spawn area & exit area)
    this.spawnPts = [];
    for (let row = 1; row < R - 1; row++) {
      for (let col = 1; col < C - 1; col++) {
        if (!grid[row][col]) continue;
        const wx = col * CELL + CELL / 2;
        const wy = row * CELL + CELL / 2;
        if (Math.hypot(wx - this.playerSpawn.x, wy - this.playerSpawn.y) < CELL * 3) continue;
        if (wx > this.exit.x - CELL && wx < this.exit.x + this.exit.w + CELL &&
            wy > this.exit.y - CELL && wy < this.exit.y + this.exit.h + CELL) continue;
        this.spawnPts.push({ x: wx, y: wy });
      }
    }

    // Shuffle spawn points with seeded rng
    for (let i = this.spawnPts.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [this.spawnPts[i], this.spawnPts[j]] = [this.spawnPts[j], this.spawnPts[i]];
    }
  }

  // ── BSP recursive room carver ──────────────
  _bsp(x, y, w, h, depth, rooms, grid) {
    const MIN_ROOM = 3;
    const canSplitH = h >= MIN_ROOM * 2 + 2;
    const canSplitV = w >= MIN_ROOM * 2 + 2;

    if (depth >= 5 || (!canSplitH && !canSplitV)) {
      // Carve this leaf as a room
      const rx = x + this._ri(0, 1);
      const ry = y + this._ri(0, 1);
      const rw = Math.max(2, w - this._ri(0, 2));
      const rh = Math.max(2, h - this._ri(0, 2));
      const cx = Math.floor(rx + rw / 2);
      const cy = Math.floor(ry + rh / 2);
      for (let row = ry; row < ry + rh; row++)
        for (let col = rx; col < rx + rw; col++)
          if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length)
            grid[row][col] = true;
      rooms.push({ x: rx, y: ry, w: rw, h: rh, cx, cy });
      return;
    }

    const splitH = canSplitH && (!canSplitV || this.rng() > 0.5);
    if (splitH) {
      const split = MIN_ROOM + Math.floor(this.rng() * (h - MIN_ROOM * 2 - 1));
      this._bsp(x, y,          w, split,         depth + 1, rooms, grid);
      this._bsp(x, y + split,  w, h - split,     depth + 1, rooms, grid);
    } else {
      const split = MIN_ROOM + Math.floor(this.rng() * (w - MIN_ROOM * 2 - 1));
      this._bsp(x,         y, split,     h,       depth + 1, rooms, grid);
      this._bsp(x + split, y, w - split, h,       depth + 1, rooms, grid);
    }
  }

  // ── L-shaped corridor between room centers ─
  _corridor(a, b, grid) {
    let x = a.cx, y = a.cy;
    const R = grid.length, C = grid[0].length;
    const mark = (cx, cy) => {
      if (cy >= 0 && cy < R && cx >= 0 && cx < C) grid[cy][cx] = true;
      // Widen corridor by 1 for player passage
      if (cy + 1 < R && cx >= 0 && cx < C) grid[cy + 1][cx] = true;
      if (cy >= 0 && cx + 1 < C)           grid[cy][cx + 1] = true;
    };
    // Horizontal then vertical
    while (x !== b.cx) { mark(x, y); x += x < b.cx ? 1 : -1; }
    while (y !== b.cy) { mark(x, y); y += y < b.cy ? 1 : -1; }
    mark(x, y);
  }

  // ── Draw ───────────────────────────────────
  draw(ctx, isArcade) {
    const t = Date.now() / 1000;

    // Background
    ctx.fillStyle = '#080812';
    ctx.fillRect(0, 0, this.w, this.h);

    // Subtle scanlines
    for (let y = 0; y < this.h; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, y, this.w, 2);
    }

    // Grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    for (let gx = CELL; gx < this.w; gx += CELL) {
      for (let gy = CELL; gy < this.h; gy += CELL) {
        ctx.fillRect(gx - 1, gy - 1, 2, 2);
      }
    }

    // Exit glow (level mode only)
    if (!isArcade && this.exit) {
      const ex = this.exit;
      ctx.save();
      ctx.shadowColor = '#00ffaa';
      ctx.shadowBlur = 40;
      const grad = ctx.createRadialGradient(ex.x + ex.w / 2, ex.y + ex.h / 2, 0, ex.x + ex.w / 2, ex.y + ex.h / 2, ex.w);
      grad.addColorStop(0, 'rgba(0,255,170,0.18)');
      grad.addColorStop(1, 'rgba(0,255,170,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(ex.x - ex.w, ex.y - ex.h, ex.w * 3, ex.h * 3);
      ctx.strokeStyle = `rgba(0,255,170,${0.55 + Math.sin(t * 3.2) * 0.25})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);
      ctx.restore();
    }

    // Walls
    this.walls.forEach(w => {
      // Main face
      const grad = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.h);
      grad.addColorStop(0, '#1a1a32');
      grad.addColorStop(1, '#10101e');
      ctx.fillStyle = grad;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      // Edge highlight
      ctx.fillStyle = 'rgba(100,100,200,0.06)';
      ctx.fillRect(w.x, w.y, w.w, 2);
      ctx.fillRect(w.x, w.y, 2, w.h);
      // Edge shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(w.x, w.y + w.h - 2, w.w, 2);
      ctx.fillRect(w.x + w.w - 2, w.y, 2, w.h);
      // Border line
      ctx.strokeStyle = '#1e1e3a';
      ctx.lineWidth = 1;
      ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
    });
  }

  // ── Collision helpers ──────────────────────
  collidesCircle(cx, cy, cr) {
    return this.walls.some(w => circleInRect(cx, cy, cr, w.x, w.y, w.w, w.h));
  }

  // Push a circle out of any wall it overlaps
  resolveCircle(obj) {
    this.walls.forEach(w => {
      if (!circleInRect(obj.x, obj.y, obj.r, w.x, w.y, w.w, w.h)) return;
      // Find closest point on wall
      const nearX = clamp(obj.x, w.x, w.x + w.w);
      const nearY = clamp(obj.y, w.y, w.y + w.h);
      const dx = obj.x - nearX;
      const dy = obj.y - nearY;
      const d  = Math.hypot(dx, dy) || 0.01;
      const pen = obj.r - d;
      obj.x += (dx / d) * pen;
      obj.y += (dy / d) * pen;
      // Reflect velocity
      if (Math.abs(dx) > Math.abs(dy)) obj.vx *= -0.4;
      else                              obj.vy *= -0.4;
    });
  }
}
