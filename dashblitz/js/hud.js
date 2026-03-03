// ═══════════════════════════════════════════
// HUD — updates DOM elements
// ═══════════════════════════════════════════

const HUD = (() => {
  let _mode = 'level';

  function setMode(mode) {
    _mode = mode;
    document.getElementById('hud-timer-wrap').style.display = mode === 'level' ? 'flex' : 'none';
    document.getElementById('hud-wave-wrap').style.display  = mode === 'arcade' ? 'flex' : 'none';
  }

  function update(state) {
    const { player, score, kills, levelNum, timeLeft, timeMax, wave, enemyCount, mode } = state;
    if (!player) return;

    // HP bar
    const hpPct = clamp(player.hp / player.maxHp * 100, 0, 100);
    document.getElementById('hp-fill').style.width = hpPct + '%';
    // Color shift: green → yellow → red
    const hpColor = hpPct > 50 ? `hsl(${120 - (100 - hpPct) * 2},90%,50%)` : `hsl(${hpPct * 2},90%,50%)`;
    document.getElementById('hp-fill').style.background = hpColor;
    document.getElementById('hp-fill').style.boxShadow  = `0 0 8px ${hpColor}`;

    // Dash bar
    document.getElementById('dash-fill').style.width = (player.dashEnergy * 100) + '%';

    // Score
    document.getElementById('hud-score').textContent = score.toLocaleString();
    document.getElementById('hud-kills').textContent = kills;
    document.getElementById('hud-level').textContent = String(levelNum).padStart(2, '0');

    // Slow indicator
    const slowEl = document.getElementById('hud-slow');
    if (slowEl) slowEl.style.opacity = player.slowTimer > 0 ? '1' : '0';

    if (mode === 'level') {
      // Timer ring
      const frac = clamp(timeLeft / Math.max(timeMax, 1), 0, 1);
      const CIRC = 150.8;
      const arc  = document.getElementById('timer-arc');
      if (arc) {
        arc.style.strokeDashoffset = CIRC * (1 - frac);
        const col = timeLeft < 10 ? '#ff3333' : timeLeft < 20 ? '#ff8833' : '#ffe033';
        arc.style.stroke = col;
        arc.style.filter = `drop-shadow(0 0 ${timeLeft < 10 ? 7 : 4}px ${col})`;
      }
      const tt = document.getElementById('timer-text');
      if (tt) { tt.textContent = Math.ceil(timeLeft); tt.style.color = timeLeft < 10 ? '#ff3333' : '#ffe033'; }
      document.getElementById('hud-enemies').textContent = enemyCount > 0 ? enemyCount + ' LEFT' : 'ALL CLEAR';
    } else {
      // Arcade wave
      const waveEl = document.getElementById('hud-wave-num');
      if (waveEl) waveEl.textContent = wave;
      document.getElementById('hud-enemies').textContent = enemyCount + ' ON FIELD';
    }
  }

  return { setMode, update };
})();
