// ═══════════════════════════════════════════
// CAMERA
// ═══════════════════════════════════════════

class Camera {
  constructor() {
    this.x   = 0; this.y   = 0;
    this.shk = 0;
    this.ox  = 0; this.oy  = 0;
  }

  follow(tx, ty, dt, canvasW, canvasH) {
    this.x   = lerp(this.x, tx - canvasW  / 2, dt * 8);
    this.y   = lerp(this.y, ty - canvasH / 2, dt * 8);
    this.shk = Math.max(0, this.shk - dt * 9);
    this.ox  = (Math.random() - 0.5) * this.shk * 14;
    this.oy  = (Math.random() - 0.5) * this.shk * 14;
  }

  apply(ctx) {
    ctx.translate(-this.x + this.ox, -this.y + this.oy);
  }

  shake(amount) {
    this.shk = Math.min(this.shk + amount, 5);
  }
}
