// ═══════════════════════════════════════════
// AUDIO — Web Audio API procedural sound engine
// ═══════════════════════════════════════════

const Audio = (() => {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let musicPlaying = false;
  let musicNodes = [];

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain(); masterGain.gain.value = 0.85; masterGain.connect(ctx.destination);
    musicGain  = ctx.createGain(); musicGain.gain.value  = 0.38; musicGain.connect(masterGain);
    sfxGain    = ctx.createGain(); sfxGain.gain.value    = 0.72; sfxGain.connect(masterGain);
  }

  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  // ── low-level helpers ──
  function osc(freq, type, startTime, dur, gainVal, dest, detune = 0) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
    o.connect(g); g.connect(dest);
    o.start(startTime); o.stop(startTime + dur + 0.05);
    return { o, g };
  }

  function noise(startTime, dur, gainVal, filterFreq, dest) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass'; flt.frequency.value = filterFreq; flt.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
    src.connect(flt); flt.connect(g); g.connect(dest);
    src.start(startTime); src.stop(startTime + dur + 0.05);
    return src;
  }

  // ── SFX ──────────────────────────────────
  function killEnemy(type) {
    resume();
    const t = ctx.currentTime;
    if (type === 'normal') {
      // Punchy zap
      osc(440, 'square', t,       0.04, 0.6, sfxGain);
      osc(220, 'sawtooth', t+0.03, 0.08, 0.5, sfxGain);
      noise(t, 0.12, 0.4, 800, sfxGain);
      osc(880, 'sine', t, 0.06, 0.35, sfxGain);
    } else {
      // Big boom for strong enemy
      osc(180, 'sawtooth', t, 0.06, 0.7, sfxGain);
      osc(90,  'square',  t+0.04, 0.18, 0.6, sfxGain);
      noise(t, 0.25, 0.55, 400, sfxGain);
      noise(t+0.05, 0.2, 0.4, 1200, sfxGain);
    }
  }

  function playerHurt() {
    resume();
    const t = ctx.currentTime;
    osc(160, 'sawtooth', t, 0.05, 0.6, sfxGain);
    osc(80,  'square',  t+0.03, 0.1, 0.55, sfxGain);
    noise(t, 0.18, 0.5, 600, sfxGain);
  }

  function playerSlowed() {
    resume();
    const t = ctx.currentTime;
    osc(200, 'sine', t, 0.04, 0.4, sfxGain, -200);
    osc(100, 'square', t+0.02, 0.12, 0.35, sfxGain);
  }

  function dashActivate() {
    resume();
    const t = ctx.currentTime;
    osc(660, 'sine', t, 0.04, 0.35, sfxGain);
    osc(880, 'sine', t+0.02, 0.06, 0.3, sfxGain);
  }

  function levelClear() {
    resume();
    const t = ctx.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => osc(f, 'sine', t + i * 0.1, 0.2, 0.45, sfxGain));
  }

  function waveStart() {
    resume();
    const t = ctx.currentTime;
    osc(220, 'sawtooth', t, 0.08, 0.5, sfxGain);
    osc(330, 'sine', t+0.1, 0.1, 0.45, sfxGain);
    noise(t, 0.15, 0.35, 1000, sfxGain);
  }

  // ── Background Music (procedural sequencer) ──────────────────
  const SCALE = [55, 58, 62, 65, 69, 73, 77, 82]; // A minor pentatonic + bass
  const BASS  = [55, 55, 58, 62, 58, 55, 62, 58];
  const BPM   = 148;
  const BEAT  = 60 / BPM;

  let seqInterval = null;
  let seqStep = 0;
  let musicStarted = false;

  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    resume();
    seqStep = 0;
    scheduleMusicLoop();
  }

  function stopMusic() {
    musicStarted = false;
    if (seqInterval) clearInterval(seqInterval);
    musicNodes.forEach(n => { try { n.stop && n.stop(); } catch(e){} });
    musicNodes = [];
  }

  function scheduleMusicLoop() {
    if (!musicStarted) return;
    const step = seqStep % 16;
    const t = ctx.currentTime;

    // Bass drum on 0, 8
    if (step === 0 || step === 8) {
      noise(t, 0.12, 0.7, 120, musicGain);
      osc(80, 'sine', t, 0.15, 0.8, musicGain);
    }
    // Snare on 4, 12
    if (step === 4 || step === 12) {
      noise(t, 0.18, 0.55, 2000, musicGain);
      osc(220, 'square', t, 0.06, 0.3, musicGain);
    }
    // Hi-hat every step
    noise(t, 0.05, step % 2 === 0 ? 0.18 : 0.1, 6000, musicGain);

    // Bass line
    if (step % 2 === 0) {
      const freq = BASS[Math.floor(step / 2)];
      osc(freq, 'sawtooth', t, BEAT * 1.8, 0.45, musicGain);
    }

    // Melody arp (higher octaves)
    const melPat = [0, 3, 5, 7, 5, 3, 0, 2, 4, 7, 4, 2, 0, 5, 7, 4];
    if (step % 1 === 0) {
      const noteIdx = melPat[step];
      const freq = SCALE[noteIdx % SCALE.length] * 4;
      osc(freq, 'square', t, BEAT * 0.4, 0.18, musicGain, rnd(-15, 15));
    }

    // Lead synth every 4 steps
    if (step % 4 === 0) {
      const li = Math.floor(step / 4);
      const leadFreqs = [220, 261, 293, 330];
      const f = leadFreqs[li % leadFreqs.length] * 2;
      osc(f, 'sawtooth', t, BEAT * 2.8, 0.22, musicGain);
      osc(f, 'square',   t, BEAT * 2.8, 0.12, musicGain, 8);
    }

    seqStep++;
    seqInterval = setTimeout(scheduleMusicLoop, BEAT * 1000 - 2);
  }

  return { init, resume, killEnemy, playerHurt, playerSlowed, dashActivate, levelClear, waveStart, startMusic, stopMusic };
})();
