/**
 * Paper Drift — A Peaceful Paper Airplane Drone-View Web Game
 */

(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  // UI Elements
  const hudTop = document.getElementById('hud-top');
  const breezeHints = document.getElementById('breeze-hints');
  const hintLeft = document.getElementById('hint-left');
  const hintRight = document.getElementById('hint-right');
  const titleScreen = document.getElementById('title-screen');
  const landingScreen = document.getElementById('landing-screen');

  const statDistance = document.getElementById('stat-distance');
  const statAltitude = document.getElementById('stat-altitude');
  const statThermals = document.getElementById('stat-thermals');

  const finalDistance = document.getElementById('final-distance');
  const finalThermals = document.getElementById('final-thermals');
  const finalBest = document.getElementById('final-best');
  const landingReason = document.getElementById('landing-reason');
  const newRecordBadge = document.getElementById('new-record-badge');
  const bestSummaryItem = document.getElementById('best-summary-item');

  const btnLaunch = document.getElementById('btn-launch');
  const btnRelaunch = document.getElementById('btn-relaunch');
  const btnBiome = document.getElementById('btn-biome');
  const biomeLabel = document.getElementById('biome-label');
  const btnZen = document.getElementById('btn-zen');
  const zenLabel = document.getElementById('zen-label');
  const btnTilt = document.getElementById('btn-tilt');
  const tiltLabel = document.getElementById('tilt-label');
  const btnAudio = document.getElementById('btn-audio');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const biomeChips = document.querySelectorAll('.biome-chip');

  // Biomes / Scenery Palettes
  const BIOMES = [
    {
      name: 'Golden Valley',
      groundBase: '#c8dcc0',
      meadowLight: '#d9e7c9',
      meadowDark: '#b2cca8',
      hillridge: '#9cb996',
      riverWater: '#5aa9b8',
      riverDeep: '#428e9e',
      riverFoam: 'rgba(255, 255, 255, 0.45)',
      sandBank: '#e8dfc5',
      treeLayers: ['#4f7756', '#618b64', '#79a377', '#94ba89'],
      autumnTreeLayers: ['#c96b43', '#de834d', '#eb9f5e', '#f3b978'],
      rockColor: '#8d9692',
      rockHighlight: '#b4bdb8',
      paperTop: '#fffdf8',
      paperLeft: '#f5efe2',
      paperRight: '#fcf8f0',
      paperCrease: '#dfd5c3',
      sunGlow: 'rgba(255, 218, 150, 0.22)',
      balloonColors: [
        ['#e06d53', '#f4b860'],
        ['#5296a5', '#f2e8cf'],
        ['#d97736', '#fff6e8']
      ],
      petalColor: '#fff9d6'
    },
    {
      name: 'Sakura Highlands',
      groundBase: '#d6e2d0',
      meadowLight: '#e3ecd9',
      meadowDark: '#bfd1ba',
      hillridge: '#a6beab',
      riverWater: '#68b2c7',
      riverDeep: '#4f97ad',
      riverFoam: 'rgba(255, 255, 255, 0.5)',
      sandBank: '#efe4d2',
      treeLayers: ['#d47a92', '#e594aa', '#f2b1c2', '#fcd0dc'],
      autumnTreeLayers: ['#5c826b', '#70987e', '#86af93', '#a0c4ab'],
      rockColor: '#91949c',
      rockHighlight: '#b8bbc2',
      paperTop: '#fffafb',
      paperLeft: '#f7e8ec',
      paperRight: '#fdf2f5',
      paperCrease: '#e2cdd3',
      sunGlow: 'rgba(255, 205, 222, 0.22)',
      balloonColors: [
        ['#de6b8b', '#fde2e9'],
        ['#7392b7', '#eef4fa'],
        ['#f3a683', '#fff5eb']
      ],
      petalColor: '#ffb8cc'
    },
    {
      name: 'Nordic Fjord',
      groundBase: '#9ab7ae',
      meadowLight: '#acc6bd',
      meadowDark: '#86a49b',
      hillridge: '#729088',
      riverWater: '#3c7889',
      riverDeep: '#2b5d6c',
      riverFoam: 'rgba(235, 250, 255, 0.42)',
      sandBank: '#c7cec9',
      treeLayers: ['#2d4c46', '#395e57', '#48726a', '#5b887f'],
      autumnTreeLayers: ['#b88b4a', '#cca05a', '#deb56d', '#edd092'],
      rockColor: '#697678',
      rockHighlight: '#8e9c9e',
      paperTop: '#ffffff',
      paperLeft: '#e9eff2',
      paperRight: '#f4f8fa',
      paperCrease: '#cad5da',
      sunGlow: 'rgba(200, 238, 255, 0.18)',
      balloonColors: [
        ['#d16047', '#f0dfd8'],
        ['#e09f3e', '#fff3d6'],
        ['#457b9d', '#f1faee']
      ],
      petalColor: '#e8f7ff'
    },
    {
      name: 'Starlight Dusk',
      groundBase: '#2f3e4e',
      meadowLight: '#374859',
      meadowDark: '#263341',
      hillridge: '#1e2936',
      riverWater: '#2b5876',
      riverDeep: '#1f435c',
      riverFoam: 'rgba(186, 230, 255, 0.35)',
      sandBank: '#4a5768',
      treeLayers: ['#1d2c3b', '#25394b', '#2f475c', '#3c5973'],
      autumnTreeLayers: ['#4f436e', '#625387', '#7866a1', '#9381bd'],
      rockColor: '#3a4452',
      rockHighlight: '#556273',
      paperTop: '#fffdf5',
      paperLeft: '#e6e2d6',
      paperRight: '#f5f1e6',
      paperCrease: '#cbc4b3',
      sunGlow: 'rgba(160, 195, 255, 0.16)',
      balloonColors: [
        ['#ff9f68', '#ffe3b3'],
        ['#d96b98', '#ffd6e7'],
        ['#6bc5d2', '#d9faff']
      ],
      petalColor: '#ffe999'
    }
  ];

  // Deterministic Value Noise for River & Terrain Contours
  function hash1D(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  function smoothNoise1D(x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash1D(i) * (1 - u) + hash1D(i + 1) * u;
  }

  function riverCenterAt(worldY) {
    // Returns horizontal world X of the meandering river at worldY (note: flight goes toward negative worldY)
    const n1 = Math.sin(worldY * 0.0011) * 340;
    const n2 = Math.cos(worldY * 0.0027 + 1.4) * 160;
    const n3 = (smoothNoise1D(worldY * 0.0006) - 0.5) * 420;
    return n1 + n2 + n3;
  }

  function riverWidthAt(worldY) {
    return 145 + Math.sin(worldY * 0.0019 + 0.7) * 38;
  }

  // Web Audio Generative Ambient Synthesizer
  class AmbientSoundscape {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.initialized = false;
      this.windGain = null;
      this.windFilter = null;
      this.padGain = null;
      this.nextChordTime = 0;
    }

    init() {
      if (this.initialized) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.initialized = true;

      // Master Gain
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.75;
      this.master.connect(this.ctx.destination);

      // Soft Filtered Pink/White Noise for Breeze
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.03;
        b6 = white * 0.115926;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.value = 320;
      this.windFilter.Q.value = 1.8;

      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0.08;

      noiseNode.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.master);
      noiseNode.start();
    }

    resume() {
      if (!this.initialized) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (!this.initialized) this.init();
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(this.muted ? 0 : 0.75, this.ctx.currentTime, 0.15);
      }
      return this.muted;
    }

    updateWind(speedRatio, breezeStrength) {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const targetFreq = 260 + speedRatio * 180 + breezeStrength * 340;
      const targetGain = 0.06 + speedRatio * 0.05 + breezeStrength * 0.14;
      this.windFilter.frequency.setTargetAtTime(targetFreq, now, 0.1);
      this.windGain.gain.setTargetAtTime(targetGain, now, 0.1);

      if (now > this.nextChordTime) {
        this.playAmbientPadNote();
        this.nextChordTime = now + 4.2 + Math.random() * 3.5;
      }
    }

    playBreezePuff(dir) {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      // Gentle pentatonic breath harmonic
      const notes = dir < 0 ? [293.66, 369.99, 440.0] : [329.63, 392.0, 493.88];
      const freq = notes[Math.floor(Math.random() * notes.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.03, now + 0.45);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.032, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);

      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.6);
    }

    playFlipSound() {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.06 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.06 + 1.4);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 1.5);
      });
    }

    playThermalChime() {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const scale = [523.25, 587.33, 659.25, 783.99, 987.77, 1046.5];
      for (let i = 0; i < 3; i++) {
        const freq = scale[(i * 2 + Math.floor(Math.random() * 2)) % scale.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.001, now + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.055, now + i * 0.09 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + i * 0.09 + 1.6);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 1.7);
      }
    }

    playGustLiftSound() {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      // Soft rising airy fifth + octave swell when catching a lifting wind gust
      const freqs = [329.63, 493.88, 659.25];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f * 0.96, now + idx * 0.05);
        osc.frequency.exponentialRampToValueAtTime(f * 1.06, now + idx * 0.05 + 0.85);
        gain.gain.setValueAtTime(0.0008, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.038, now + idx * 0.05 + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.05 + 1.25);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 1.3);
      });
    }

    playSoftBrushSound() {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      // Subtle, warm muted paper-brush tone when gently clipping an obstacle
      const freqs = [246.94, 196.0];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        osc.frequency.exponentialRampToValueAtTime(f * 0.92, now + idx * 0.08 + 0.45);
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.035, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.08 + 0.65);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.7);
      });
    }

    playAmbientPadNote() {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const padNotes = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0];
      const freq = padNotes[Math.floor(Math.random() * padNotes.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0005, now);
      gain.gain.linearRampToValueAtTime(0.028, now + 1.4);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 5.2);

      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 5.4);
    }
  }

  const audio = new AmbientSoundscape();

  // Game State
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let currentBiomeIndex = 0;
  let zenMode = false;
  let bestDistance = Number(localStorage.getItem('paper_drift_best') || 0);

  const STATE = {
    TITLE: 'TITLE',
    LAUNCHING: 'LAUNCHING',
    FLYING: 'FLYING',
    LANDING: 'LANDING'
  };

  let gameState = STATE.TITLE;
  let launchProgress = 0; // 0 -> 1 during the paper flip animation
  let steerCount = 0;

  // Airplane State
  const plane = {
    x: 0,
    y: 0,
    z: 42, // Altitude in meters (12 to 68)
    vx: 0,
    vy: -230,
    speed: 235,
    heading: 0, // Radians, 0 = straight up (-Y), negative = left, positive = right
    targetHeading: 0,
    bank: 0, // Roll angle in radians (-0.75 to +0.75, or up to PI when gently flipping over)
    pitch: 0, // Pitch animation during flip or thermal climb
    flipRoll: 0, // 0 = upright, Math.PI = gently flipped upside-down after brushing an obstacle
    flipTargetRoll: 0,
    flipPitch: 0, // Gentle nose-up/back pitch when brushing an obstacle
    tumbleVx: 0,
    tumbleVy: 0,
    tumbleYawRate: 0,
    tumbleTime: 0,
    hitObstacle: false,
    modalShown: false,
    breezeVel: 0, // Lateral breeze momentum
    distanceFlown: 0,
    thermalsCaught: 0,
    updraftTimer: 0, // Remaining time of upward air gust after collecting a circle
    inGustGlow: 0, // 0 -> 1 visual glow when being lifted by a circle's upward gust
    wingTrailLeft: [],
    wingTrailRight: [],
    invulnerableTimer: 0
  };

  // Camera State (Drone view following slightly behind & above)
  const camera = {
    x: 0,
    y: 0,
    zoom: 1,
    swayX: 0,
    swayY: 0
  };

  // Input State
  const input = {
    leftHeld: false,
    rightHeld: false,
    activePointers: new Map(), // pointerId -> 'left' | 'right'
    tiltEnabled: true,
    tiltListenerAttached: false,
    tiltRawAngle: 0, // Degrees: negative = left tilt, positive = right tilt
    tiltSteer: 0     // Normalized -1 to +1 steering input from phone tilt
  };

  function getBaseZoom() {
    // On narrow mobile screens, zoom out slightly so the player can see more of the valley & river ahead
    if (width < 640) {
      return Math.max(0.68, Math.min(0.92, width / 540));
    }
    return 1.0;
  }

  // World Entities
  let obstacles = [];
  let thermals = [];
  let groundDecor = []; // wildflowers, bridges, cottages, stones
  let birdFlocks = [];
  let windRibbons = [];
  let floatingPetals = [];
  let waterRipples = [];

  let spawnedUpToY = 400; // We generate world chunks ahead (as Y decreases)

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  // Initialize / Reset World
  function resetWorld() {
    plane.x = riverCenterAt(0) + 90;
    plane.y = 0;
    plane.z = 42;
    plane.speed = 235;
    plane.heading = 0;
    plane.targetHeading = 0;
    plane.bank = 0;
    plane.pitch = 0;
    plane.flipRoll = 0;
    plane.flipTargetRoll = 0;
    plane.flipPitch = 0;
    plane.tumbleVx = 0;
    plane.tumbleVy = 0;
    plane.tumbleYawRate = 0;
    plane.tumbleTime = 0;
    plane.hitObstacle = false;
    plane.modalShown = false;
    plane.breezeVel = 0;
    plane.distanceFlown = 0;
    plane.thermalsCaught = 0;
    plane.updraftTimer = 0;
    plane.inGustGlow = 0;
    plane.wingTrailLeft = [];
    plane.wingTrailRight = [];
    plane.invulnerableTimer = 0;

    camera.x = plane.x;
    camera.y = plane.y - 110;
    camera.zoom = getBaseZoom();

    obstacles = [];
    thermals = [];
    groundDecor = [];
    birdFlocks = [];
    windRibbons = [];
    floatingPetals = [];
    waterRipples = [];

    spawnedUpToY = 450;
    generateWorldUntil(plane.y - 1800);

    // Pre-populate ambient floating petals/dandelion seeds
    for (let i = 0; i < 45; i++) {
      floatingPetals.push({
        x: plane.x + (Math.random() - 0.5) * width * 1.4,
        y: plane.y - Math.random() * height * 1.4,
        z: 10 + Math.random() * 55,
        size: 2 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 18,
        vy: -15 - Math.random() * 25,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function generateWorldUntil(targetMinY) {
    while (spawnedUpToY > targetMinY) {
      const bandY = spawnedUpToY;
      const rCenter = riverCenterAt(bandY);
      const rWidth = riverWidthAt(bandY);

      // 1. Ground Decor (Wildflower clusters, river stones, occasional wooden footbridge)
      for (let i = 0; i < 6; i++) {
        const gx = plane.x + (Math.random() - 0.5) * 2100;
        const gy = bandY - Math.random() * 140;
        const distFromRiver = Math.abs(gx - riverCenterAt(gy));
        const rw = riverWidthAt(gy);

        if (distFromRiver > rw + 28) {
          groundDecor.push({
            type: Math.random() < 0.7 ? 'flowers' : 'shrub',
            x: gx,
            y: gy,
            radius: 12 + Math.random() * 24,
            seed: Math.random() * 100
          });
        } else if (distFromRiver < rw - 24 && Math.random() < 0.35) {
          waterRipples.push({
            x: gx,
            y: gy,
            radius: 6 + Math.random() * 12,
            phase: Math.random() * Math.PI * 2
          });
        }
      }

      // Occasional quaint arched stone/wooden bridge over the river
      if (Math.abs(bandY) > 400 && Math.floor(Math.abs(bandY) / 140) % 9 === 0 && Math.random() < 0.55) {
        const nextCenter = riverCenterAt(bandY - 40);
        const riverAngle = Math.atan2(nextCenter - rCenter, -40);
        groundDecor.push({
          type: 'bridge',
          x: rCenter,
          y: bandY,
          width: rWidth * 2.15,
          angle: riverAngle
        });
      }

      // 2. Obstacles (Tall Redwoods/Pines, Rocky Spires, Hot Air Balloons, Windmills)
      // Safe Zone near launch (bandY > -420 has fewer center obstacles)
      const isLaunchCorridor = bandY > -420;
      const obstacleCount = isLaunchCorridor ? 3 : 5 + Math.floor(Math.random() * 3);

      for (let i = 0; i < obstacleCount; i++) {
        const ox = plane.x + (Math.random() - 0.5) * 1950;
        const oy = bandY - Math.random() * 135;

        if (isLaunchCorridor && Math.abs(ox - plane.x) < 190) continue;

        const distRiver = Math.abs(ox - riverCenterAt(oy));
        const rw = riverWidthAt(oy);

        // Avoid overlapping existing obstacles
        let tooClose = false;
        for (let j = obstacles.length - 1; j >= 0 && j >= obstacles.length - 25; j--) {
          const other = obstacles[j];
          const dx = other.x - ox;
          const dy = other.y - oy;
          if (dx * dx + dy * dy < 115 * 115) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;

        const roll = Math.random();
        if (distRiver < rw + 16) {
          // Over the river: either a tall river monolith rock or a drifting hot air balloon
          if (roll < 0.22 && bandY < -500) {
            obstacles.push({
              type: 'balloon',
              x: ox,
              y: oy,
              baseX: ox,
              radius: 40,
              hitRadius: 34,
              height: 62,
              colorIdx: Math.floor(Math.random() * 3),
              swayPhase: Math.random() * Math.PI * 2,
              swaySpeed: 0.7 + Math.random() * 0.5
            });
          } else if (roll < 0.45 && distRiver < rw - 25) {
            obstacles.push({
              type: 'rock',
              x: ox,
              y: oy,
              radius: 30 + Math.random() * 14,
              hitRadius: 25,
              height: 54,
              seed: Math.random() * 10
            });
          }
        } else {
          // On the hills & meadows: Tall Pine/Sakura clusters, Autumn Groves, Stone Pillars, or Windmills
          if (roll < 0.68) {
            const isAutumn = Math.random() < 0.28;
            const treeRadius = 36 + Math.random() * 20;
            obstacles.push({
              type: 'tree',
              x: ox,
              y: oy,
              radius: treeRadius,
              hitRadius: treeRadius * 0.66,
              height: 58 + Math.random() * 18,
              isAutumn,
              swayPhase: Math.random() * Math.PI * 2
            });
          } else if (roll < 0.85) {
            obstacles.push({
              type: 'rock',
              x: ox,
              y: oy,
              radius: 34 + Math.random() * 16,
              hitRadius: 28,
              height: 56,
              seed: Math.random() * 10
            });
          } else if (roll < 0.94 && bandY < -450) {
            obstacles.push({
              type: 'windmill',
              x: ox,
              y: oy,
              radius: 38,
              hitRadius: 28,
              height: 64,
              bladeAngle: Math.random() * Math.PI * 2
            });
          } else if (bandY < -550) {
            obstacles.push({
              type: 'balloon',
              x: ox,
              y: oy,
              baseX: ox,
              radius: 42,
              hitRadius: 35,
              height: 64,
              colorIdx: Math.floor(Math.random() * 3),
              swayPhase: Math.random() * Math.PI * 2,
              swaySpeed: 0.6 + Math.random() * 0.5
            });
          }
        }
      }

      // 3. Swirling Wind Circles (Collecting a circle releases an upward gust of air that lifts the plane & prolongs flight)
      if (bandY < -200 && Math.random() < 0.65) {
        const tx = plane.x + (Math.random() - 0.5) * 820;
        const ty = bandY - Math.random() * 90;
        // Ensure circle isn't inside an obstacle
        let clear = true;
        for (let j = obstacles.length - 1; j >= 0 && j >= obstacles.length - 20; j--) {
          const ob = obstacles[j];
          if (Math.hypot(ob.x - tx, ob.y - ty) < ob.radius + 65) {
            clear = false;
            break;
          }
        }
        if (clear) {
          thermals.push({
            x: tx,
            y: ty,
            radius: 54,
            collected: false,
            collectAnim: 0,
            pulse: Math.random() * Math.PI * 2
          });
        }
      }

      // 4. Low-flying Bird Flocks (scenic V-formation below the drone & plane)
      if (Math.random() < 0.16) {
        birdFlocks.push({
          x: plane.x + (Math.random() - 0.5) * 1100,
          y: bandY - Math.random() * 100,
          vx: (Math.random() - 0.5) * 55,
          vy: -110 - Math.random() * 50,
          count: 3 + Math.floor(Math.random() * 4),
          flapPhase: Math.random() * Math.PI * 2
        });
      }

      spawnedUpToY -= 140;
    }
  }

  // Spawn a visual wind ribbon gust when the user taps/holds Left or Right
  function spawnBreezeRibbon(direction, isBurst = false) {
    // direction: -1 = steer left (breeze pushes from right to left), +1 = steer right (breeze pushes from left to right)
    const count = isBurst ? 5 : 1;
    for (let i = 0; i < count; i++) {
      const startOffsetSide = -direction * (70 + Math.random() * 120);
      const forwardDist = (Math.random() - 0.35) * 160;
      windRibbons.push({
        x: plane.x + startOffsetSide,
        y: plane.y + forwardDist,
        vx: direction * (240 + Math.random() * 110) + Math.sin(plane.heading) * plane.speed * 0.4,
        vy: -Math.cos(plane.heading) * plane.speed * 0.65 + (Math.random() - 0.5) * 40,
        length: 65 + Math.random() * 55,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.35,
        curveAmp: (Math.random() - 0.5) * 14,
        curveFreq: 6 + Math.random() * 5
      });
    }
  }

  // Trigger a discrete breeze puff on tap/click
  function applyBreezeTap(direction) {
    if (gameState !== STATE.FLYING) return;
    audio.resume();
    audio.playBreezePuff(direction);

    // Give immediate gentle angular & lateral breeze impulse
    plane.targetHeading += direction * 0.24;
    plane.targetHeading = Math.max(-1.18, Math.min(1.18, plane.targetHeading));
    plane.breezeVel += direction * 52;

    spawnBreezeRibbon(direction, true);
    steerCount++;
    if (steerCount >= 6) {
      breezeHints.style.opacity = '0';
    }
  }

  // Input Event Listeners (Mouse / Touch / Keyboard)
  function handlePointerDown(e) {
    if (gameState !== STATE.FLYING) return;
    if (e.target.closest('button')) return;

    const side = e.clientX < width * 0.5 ? 'left' : 'right';
    input.activePointers.set(e.pointerId, side);
    updatePointerHoldState();

    applyBreezeTap(side === 'left' ? -1 : 1);
  }

  function handlePointerMove(e) {
    if (!input.activePointers.has(e.pointerId)) return;
    const side = e.clientX < width * 0.5 ? 'left' : 'right';
    input.activePointers.set(e.pointerId, side);
    updatePointerHoldState();
  }

  function handlePointerUp(e) {
    if (input.activePointers.has(e.pointerId)) {
      input.activePointers.delete(e.pointerId);
      updatePointerHoldState();
    }
  }

  function updatePointerHoldState() {
    let left = false;
    let right = false;
    for (const side of input.activePointers.values()) {
      if (side === 'left') left = true;
      if (side === 'right') right = true;
    }
    input.leftHeld = left;
    input.rightHeld = right;
    const tiltLeft = input.tiltEnabled && input.tiltSteer < -0.15;
    const tiltRight = input.tiltEnabled && input.tiltSteer > 0.15;
    hintLeft.classList.toggle('active-gust', left || keysHeld.left || tiltLeft);
    hintRight.classList.toggle('active-gust', right || keysHeld.right || tiltRight);
  }

  canvas.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Device Orientation (Tilt Left / Right to Steer)
  function getScreenOrientationAngle() {
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number') {
      return window.screen.orientation.angle;
    }
    if (typeof window.orientation === 'number') {
      return window.orientation;
    }
    return 0;
  }

  function handleDeviceOrientation(e) {
    if (!input.tiltEnabled) {
      input.tiltRawAngle = 0;
      return;
    }
    if (e.gamma === null && e.beta === null) return;

    const angle = getScreenOrientationAngle();
    let tiltDeg = 0;
    if (angle === 90) {
      // Landscape (rotated counter-clockwise)
      tiltDeg = e.beta || 0;
    } else if (angle === -90 || angle === 270) {
      // Landscape (rotated clockwise)
      tiltDeg = -(e.beta || 0);
    } else if (angle === 180) {
      // Upside-down portrait
      tiltDeg = -(e.gamma || 0);
    } else {
      // Standard portrait
      tiltDeg = e.gamma || 0;
    }

    // Clamp to [-45, 45] degrees to avoid gimbal flip when phone is held nearly vertical
    input.tiltRawAngle = Math.max(-45, Math.min(45, tiltDeg));
  }

  function attachTiltListener() {
    if (input.tiltListenerAttached) return;
    if (typeof window.DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleDeviceOrientation, true);
      input.tiltListenerAttached = true;
    }
  }

  async function requestTiltPermissionIfNeeded() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const state = await DeviceOrientationEvent.requestPermission();
        if (state === 'granted') {
          attachTiltListener();
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    } else {
      attachTiltListener();
      return true;
    }
  }

  // Attach immediately for devices/browsers that do not require explicit iOS permission
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    attachTiltListener();
  }

  const keysHeld = { left: false, right: false };
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      if (!keysHeld.left) {
        keysHeld.left = true;
        applyBreezeTap(-1);
      }
      hintLeft.classList.add('active-gust');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      if (!keysHeld.right) {
        keysHeld.right = true;
        applyBreezeTap(1);
      }
      hintRight.classList.add('active-gust');
    } else if ((e.key === ' ' || e.key === 'Enter') && gameState !== STATE.FLYING && gameState !== STATE.LAUNCHING) {
      startFlight();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keysHeld.left = false;
      hintLeft.classList.remove('active-gust');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keysHeld.right = false;
      hintRight.classList.remove('active-gust');
    }
  });

  // UI Button Actions
  function startFlight() {
    if (input.tiltEnabled) {
      requestTiltPermissionIfNeeded();
    }
    audio.resume();
    audio.playFlipSound();
    resetWorld();
    launchProgress = 0;
    steerCount = 0;
    gameState = STATE.LAUNCHING;

    titleScreen.classList.remove('active');
    landingScreen.classList.remove('active');
    hudTop.classList.remove('hud-hidden');
    breezeHints.classList.remove('hud-hidden');
    breezeHints.style.opacity = '1';
  }

  function endFlight(reasonText, obstacleHit = null) {
    gameState = STATE.LANDING;
    const distMeters = Math.floor(plane.distanceFlown);
    const isNewRecord = distMeters > bestDistance && distMeters > 0;
    if (isNewRecord) {
      bestDistance = distMeters;
      localStorage.setItem('paper_drift_best', String(bestDistance));
    }
    plane.isNewRecord = isNewRecord;

    landingReason.textContent = reasonText;
    finalDistance.textContent = `${distMeters.toLocaleString()} m`;
    finalThermals.textContent = String(plane.thermalsCaught);
    finalBest.textContent = `${bestDistance.toLocaleString()} m`;

    if (newRecordBadge) {
      newRecordBadge.classList.toggle('hidden', !isNewRecord);
    }
    if (bestSummaryItem) {
      bestSummaryItem.classList.toggle('record-highlight', isNewRecord);
    }

    hudTop.classList.add('hud-hidden');
    breezeHints.classList.add('hud-hidden');

    if (obstacleHit) {
      // Gentle physical reaction: soft glance off the obstacle, slow flip-over & leaf-flutter settle
      plane.hitObstacle = true;
      plane.modalShown = false;
      plane.tumbleTime = 0;
      audio.playSoftBrushSound();

      const dx = plane.x - obstacleHit.x;
      const dy = plane.y - obstacleHit.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const nx = dx / dist;
      const ny = dy / dist;

      // Determine which way the wing clipped so it rolls naturally away from the contact side
      const forwardX = Math.sin(plane.heading);
      const forwardY = -Math.cos(plane.heading);
      const cross = forwardX * ny - forwardY * nx;
      const flipDir = cross >= 0 ? 1 : -1;

      plane.flipRoll = 0;
      plane.flipTargetRoll = flipDir * Math.PI; // Gently flips 180 degrees onto its back
      plane.flipPitch = -0.42; // Nose tilts gently upward/back as it catches the obstacle
      plane.tumbleYawRate = flipDir * 1.35;

      // Soft rebound + residual drift velocity
      plane.tumbleVx = nx * 58 + forwardX * (plane.speed * 0.22);
      plane.tumbleVy = ny * 58 + forwardY * (plane.speed * 0.22);

      // Rustle a few peaceful petals/leaves from the contact point
      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2 + Math.random() * 0.4;
        floatingPetals.push({
          x: plane.x + Math.cos(ang) * 10,
          y: plane.y + Math.sin(ang) * 10,
          z: plane.z,
          size: 2.8 + Math.random() * 2.2,
          vx: Math.cos(ang) * (24 + Math.random() * 25) + nx * 20,
          vy: Math.sin(ang) * (24 + Math.random() * 25) + ny * 20,
          phase: Math.random() * Math.PI * 2
        });
      }
    } else {
      plane.hitObstacle = false;
      plane.modalShown = true;
      if (isNewRecord) {
        audio.playThermalChime();
      }
      landingScreen.classList.add('active');
    }
  }

  btnLaunch.addEventListener('click', startFlight);
  btnRelaunch.addEventListener('click', startFlight);

  function setBiome(index) {
    currentBiomeIndex = (index + BIOMES.length) % BIOMES.length;
    biomeLabel.textContent = BIOMES[currentBiomeIndex].name;
    const envBtnName = document.getElementById('env-btn-name');
    if (envBtnName) envBtnName.textContent = BIOMES[currentBiomeIndex].name;
    biomeChips.forEach((chip, idx) => {
      chip.classList.toggle('active', idx === currentBiomeIndex);
    });
  }

  const btnChangeEnv = document.getElementById('btn-change-env');
  if (btnChangeEnv) {
    btnChangeEnv.addEventListener('click', () => setBiome(currentBiomeIndex + 1));
  }

  btnBiome.addEventListener('click', () => {
    setBiome(currentBiomeIndex + 1);
  });

  biomeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      setBiome(Number(chip.dataset.biome));
    });
  });

  btnZen.addEventListener('click', () => {
    zenMode = !zenMode;
    zenLabel.textContent = zenMode ? 'Zen: On' : 'Zen: Off';
    btnZen.classList.toggle('active-mode', zenMode);
  });

  function updateTiltUI() {
    if (!btnTilt || !tiltLabel) return;
    tiltLabel.textContent = input.tiltEnabled ? 'Tilt: On' : 'Tilt: Off';
    btnTilt.classList.toggle('active-mode', input.tiltEnabled);
  }
  updateTiltUI();

  if (btnTilt) {
    btnTilt.addEventListener('click', async () => {
      if (!input.tiltEnabled) {
        const granted = await requestTiltPermissionIfNeeded();
        input.tiltEnabled = granted;
      } else {
        input.tiltEnabled = false;
        input.tiltRawAngle = 0;
        input.tiltSteer = 0;
      }
      updateTiltUI();
      updatePointerHoldState();
    });
  }

  btnAudio.addEventListener('click', () => {
    const muted = audio.toggleMute();
    iconSoundOn.classList.toggle('hidden', muted);
    iconSoundOff.classList.toggle('hidden', !muted);
  });

  // Update Physics & World
  let ribbonSpawnTimer = 0;

  function update(dt, time) {
    if (gameState === STATE.TITLE) {
      // Idle scenic camera drift on the title screen
      plane.y -= 95 * dt;
      plane.x = riverCenterAt(plane.y) + Math.sin(time * 0.45) * 110;
      plane.heading = Math.sin(time * 0.45) * 0.25;
      plane.bank = Math.sin(time * 0.45) * 0.22;
      camera.x += (plane.x - camera.x) * 4 * dt;
      camera.y = plane.y - 110;
      generateWorldUntil(plane.y - 1600);
      cleanupWorldBehind(plane.y + 900);
      return;
    }

    if (gameState === STATE.LAUNCHING) {
      launchProgress += dt * 1.15;
      if (launchProgress >= 1) {
        launchProgress = 1;
        gameState = STATE.FLYING;
      }
      // Smooth arc during the hand-flip launch
      const ease = 1 - Math.pow(1 - launchProgress, 3);
      const baseZoom = getBaseZoom();
      plane.y -= plane.speed * (0.65 + 0.35 * ease) * dt;
      plane.z = 24 + Math.sin(launchProgress * Math.PI) * 28 + ease * 18;
      plane.pitch = Math.sin(launchProgress * Math.PI * 2) * 0.35 * (1 - ease);
      camera.zoom = baseZoom * (1.48 - 0.48 * ease);
      camera.x += (plane.x - camera.x) * 6 * dt;
      camera.y = plane.y - (65 + 75 * ease);

      if (Math.random() < 0.45) {
        spawnBreezeRibbon(Math.random() < 0.5 ? -1 : 1, false);
      }
      recordWingTrails();
      generateWorldUntil(plane.y - 1800);
      return;
    }

    if (gameState === STATE.LANDING) {
      if (plane.hitObstacle) {
        plane.tumbleTime += dt;
        // Gently flip over onto its back and flutter down like a real folded paper airplane
        plane.flipRoll += (plane.flipTargetRoll - plane.flipRoll) * Math.min(1, 3.4 * dt);
        plane.flipPitch *= Math.pow(0.22, dt);
        plane.bank *= Math.pow(0.15, dt);

        // Soft leaf-flutter sway as it settles
        const flutterSway = Math.sin(plane.tumbleTime * 5.2) * 18 * Math.max(0, 1 - plane.tumbleTime * 0.65);
        plane.x += (plane.tumbleVx + Math.cos(plane.heading) * flutterSway) * dt;
        plane.y += (plane.tumbleVy + Math.sin(plane.heading) * flutterSway) * dt;
        plane.tumbleVx *= Math.pow(0.16, dt);
        plane.tumbleVy *= Math.pow(0.16, dt);

        plane.heading += plane.tumbleYawRate * dt;
        plane.tumbleYawRate *= Math.pow(0.18, dt);

        plane.z = Math.max(5, plane.z - 22 * dt);

        // Update floating petals & wind ribbons so the scene stays alive while watching the flip
        for (let i = windRibbons.length - 1; i >= 0; i--) {
          const r = windRibbons[i];
          r.life += dt;
          r.x += r.vx * dt;
          r.y += r.vy * dt;
          if (r.life >= r.maxLife) windRibbons.splice(i, 1);
        }
        for (let i = 0; i < floatingPetals.length; i++) {
          const p = floatingPetals[i];
          p.phase += dt * 2.2;
          p.x += (p.vx + Math.sin(p.phase) * 14) * dt;
          p.y += p.vy * dt;
        }

        camera.x += (plane.x - camera.x) * 2.5 * dt;
        camera.y += (plane.y - 75 - camera.y) * 2.5 * dt;

        if (!plane.modalShown && plane.tumbleTime >= 1.55) {
          plane.modalShown = true;
          if (plane.isNewRecord) {
            audio.playThermalChime();
          }
          landingScreen.classList.add('active');
        }
      } else {
        // Gentle settle after meadow landing
        plane.speed = Math.max(0, plane.speed - 140 * dt);
        plane.y -= Math.cos(plane.heading) * plane.speed * dt;
        plane.x += Math.sin(plane.heading) * plane.speed * dt;
        plane.z = Math.max(4, plane.z - 25 * dt);
        plane.bank *= Math.pow(0.08, dt);
        camera.x += (plane.x - camera.x) * 3 * dt;
        camera.y += (plane.y - 90 - camera.y) * 3 * dt;
      }
      return;
    }

    // --- STATE.FLYING ---
    // Compute smoothed phone tilt steering (-1 to +1) with a comfortable deadzone
    let targetTiltSteer = 0;
    if (input.tiltEnabled) {
      const deadzone = 2.5; // degrees
      const maxTilt = 24.0; // degrees for full turn rate
      const absAngle = Math.abs(input.tiltRawAngle);
      if (absAngle > deadzone) {
        const normalized = Math.min(1, (absAngle - deadzone) / (maxTilt - deadzone));
        targetTiltSteer = Math.sign(input.tiltRawAngle) * normalized;
      }
    }
    input.tiltSteer += (targetTiltSteer - input.tiltSteer) * Math.min(1, 10 * dt);

    const leftActive = input.leftHeld || keysHeld.left;
    const rightActive = input.rightHeld || keysHeld.right;
    let netBreezeDir = 0;
    if (leftActive && !rightActive) {
      netBreezeDir = -1;
    } else if (rightActive && !leftActive) {
      netBreezeDir = 1;
    } else if (Math.abs(input.tiltSteer) > 0.02) {
      netBreezeDir = input.tiltSteer;
    }

    // Update breeze zone visual indicators for both touch/keys and tilt
    const showLeftGust = leftActive || (input.tiltEnabled && input.tiltSteer < -0.15);
    const showRightGust = rightActive || (input.tiltEnabled && input.tiltSteer > 0.15);
    hintLeft.classList.toggle('active-gust', showLeftGust);
    hintRight.classList.toggle('active-gust', showRightGust);

    if (Math.abs(input.tiltSteer) > 0.25 && steerCount < 6) {
      steerCount += dt * 1.5;
      if (steerCount >= 6) {
        breezeHints.style.opacity = '0';
      }
    }

    if (netBreezeDir !== 0) {
      plane.targetHeading += netBreezeDir * 1.55 * dt;
      plane.targetHeading = Math.max(-1.18, Math.min(1.18, plane.targetHeading));
      plane.breezeVel += netBreezeDir * 190 * dt;

      ribbonSpawnTimer += dt;
      const spawnInterval = 0.055 / Math.max(0.35, Math.abs(netBreezeDir));
      if (ribbonSpawnTimer > spawnInterval) {
        ribbonSpawnTimer = 0;
        spawnBreezeRibbon(Math.sign(netBreezeDir), false);
      }
    } else {
      // Slowly weathervane back toward a gentle forward canyon draft
      plane.targetHeading *= Math.pow(0.58, dt);
    }

    // Damp lateral breeze drift
    plane.breezeVel *= Math.pow(0.18, dt);

    // Smoothly interpolate heading & bank angle
    const headingDiff = plane.targetHeading - plane.heading;
    plane.heading += headingDiff * Math.min(1, 7.5 * dt);

    const desiredBank = Math.max(-0.78, Math.min(0.78, headingDiff * 2.1 + netBreezeDir * 0.38));
    plane.bank += (desiredBank - plane.bank) * Math.min(1, 9.0 * dt);
    plane.pitch *= Math.pow(0.15, dt);

    // Speed & Altitude Gliding Dynamics
    // Banking steeply trades a tiny bit of altitude for speed; thermals lift altitude back up
    const turnDrag = Math.abs(plane.bank) * 0.6;
    const targetSpeed = 238 + Math.sin(time * 0.8) * 8 + (42 - plane.z) * 0.9;
    plane.speed += (targetSpeed - plane.speed) * 2.5 * dt;

    // Sink rate in normal Mode (+50% faster descent), or buoyant in Zen Mode
    const sinkRate = zenMode ? 0.35 : (1.725 + turnDrag);
    plane.z -= sinkRate * dt;
    if (zenMode && plane.z < 36) {
      plane.z += (38 - plane.z) * 1.8 * dt;
    }
    plane.z = Math.max(0, Math.min(68, plane.z));

    // Advance Position
    const vx = Math.sin(plane.heading) * plane.speed + plane.breezeVel;
    const vy = -Math.cos(plane.heading) * plane.speed;
    plane.x += vx * dt;
    plane.y += vy * dt;
    plane.distanceFlown += Math.hypot(vx * dt, vy * dt) * 0.12;

    if (plane.invulnerableTimer > 0) {
      plane.invulnerableTimer -= dt;
    }

    // Update Ambient Wind Audio
    audio.updateWind(plane.speed / 260, Math.abs(netBreezeDir) * 0.8 + Math.abs(plane.bank) * 0.4);

    // Camera smoothly tracks ahead of the airplane
    const baseZoom = getBaseZoom();
    const lookAheadY = width < 640 ? Math.min(height * 0.26, 185) : Math.min(height * 0.22, 165);
    const targetCamX = plane.x + Math.sin(plane.heading) * 65;
    const targetCamY = plane.y - lookAheadY;
    camera.x += (targetCamX - camera.x) * Math.min(1, 5.2 * dt);
    camera.y += (targetCamY - camera.y) * Math.min(1, 8.0 * dt);
    const targetZoom = baseZoom * (0.96 + (68 - plane.z) * 0.0022);
    camera.zoom += (targetZoom - camera.zoom) * 3 * dt;

    // Record Wingtip Trails
    recordWingTrails();

    // Sustained Upward Gust of Air from collected circles
    if (plane.updraftTimer > 0) {
      plane.updraftTimer = Math.max(0, plane.updraftTimer - dt);
      const gustStrength = Math.sin((plane.updraftTimer / 1.65) * Math.PI * 0.5);
      // Smoothly lift the plane upward so each circle prolongs the journey
      plane.z = Math.min(68, plane.z + (16.5 * gustStrength + 6.5) * dt);
      plane.speed = Math.min(290, plane.speed + 36 * gustStrength * dt);
      plane.pitch = Math.min(0.28, plane.pitch + 0.8 * dt);
      plane.inGustGlow = Math.min(1, plane.inGustGlow + dt * 5);

      // Trailing upward wind ribbons rushing around the wings
      if (Math.random() < 0.45) {
        windRibbons.push({
          x: plane.x + (Math.random() - 0.5) * 52,
          y: plane.y + 12 + Math.random() * 34,
          vx: Math.sin(plane.heading) * 140 + (Math.random() - 0.5) * 40,
          vy: -Math.cos(plane.heading) * 285,
          length: 55 + Math.random() * 45,
          life: 0,
          maxLife: 0.45 + Math.random() * 0.25,
          curveAmp: (Math.random() - 0.5) * 12,
          curveFreq: 8
        });
      }
    } else {
      plane.inGustGlow = Math.max(0, plane.inGustGlow - dt * 2.5);
    }

    // Check Swirling Updraft Circles (collecting a circle triggers an upward gust of air!)
    for (let i = 0; i < thermals.length; i++) {
      const th = thermals[i];
      th.pulse += dt * 2.6;
      if (th.collected) {
        if (th.collectAnim < 1) {
          th.collectAnim = Math.min(1, th.collectAnim + dt * 1.8);
        }
        continue;
      }

      const dist = Math.hypot(plane.x - th.x, plane.y - th.y);
      if (dist < th.radius + 18) {
        th.collected = true;
        th.collectAnim = 0.01;
        plane.thermalsCaught++;
        // Immediate upward gust impulse + sustained upward draft timer
        plane.z = Math.min(68, plane.z + 8);
        plane.updraftTimer = Math.min(2.6, plane.updraftTimer + 1.65);
        plane.speed += 28;
        plane.pitch = 0.26;
        audio.playThermalChime();
        audio.playGustLiftSound();

        // Burst of rising wind ribbons & golden petals from the circle
        for (let r = 0; r < 6; r++) {
          const offsetSide = (r - 2.5) * 16;
          windRibbons.push({
            x: th.x + offsetSide,
            y: th.y + 20,
            vx: Math.sin(plane.heading) * 160 + (Math.random() - 0.5) * 35,
            vy: -Math.cos(plane.heading) * 300,
            length: 70 + Math.random() * 40,
            life: 0,
            maxLife: 0.55 + Math.random() * 0.25,
            curveAmp: (Math.random() - 0.5) * 14,
            curveFreq: 7
          });
        }
        for (let p = 0; p < 14; p++) {
          const ang = (p / 14) * Math.PI * 2;
          floatingPetals.push({
            x: th.x + Math.cos(ang) * 16,
            y: th.y + Math.sin(ang) * 16,
            z: plane.z,
            size: 3 + Math.random() * 2.5,
            vx: Math.cos(ang) * (45 + Math.random() * 40),
            vy: Math.sin(ang) * (45 + Math.random() * 40) - 60,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    // Update Dynamic Obstacles & Check Collisions
    for (let i = 0; i < obstacles.length; i++) {
      const ob = obstacles[i];
      if (ob.type === 'balloon') {
        ob.x = ob.baseX + Math.sin(time * ob.swaySpeed + ob.swayPhase) * 38;
      } else if (ob.type === 'windmill') {
        ob.bladeAngle += dt * 1.35;
      }

      if (!zenMode && plane.invulnerableTimer <= 0) {
        const dist = Math.hypot(plane.x - ob.x, plane.y - ob.y);
        if (dist < ob.hitRadius + 11) {
          const reasonMap = {
            tree: 'RESTED IN THE WHISPERING CANOPY',
            rock: 'SETTLED ON A SUNLIT CANYON CRAG',
            balloon: 'BRUSHED PAST A DRIFTING BALLOON',
            windmill: 'CAUGHT IN THE WINDMILL DRAFT'
          };
          endFlight(reasonMap[ob.type] || 'GENTLE LANDING IN THE VALLEY', ob);
          return;
        }
      }
    }

    // Check Soft Meadow Landing if Altitude reaches 0
    if (!zenMode && plane.z <= 2) {
      endFlight('GLIDED DOWN INTO THE SOFT MEADOW');
      return;
    }

    // When flying low (under 15m), gently rustle petals/ripples beneath the wings so low altitude is unmistakable
    if (plane.z < 15 && Math.random() < 0.25) {
      floatingPetals.push({
        x: plane.x + (Math.random() - 0.5) * 26,
        y: plane.y + 10,
        z: plane.z,
        size: 2.2 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 35,
        vy: -20 - Math.random() * 20,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Update Wind Ribbons
    for (let i = windRibbons.length - 1; i >= 0; i--) {
      const r = windRibbons[i];
      r.life += dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      if (r.life >= r.maxLife) {
        windRibbons.splice(i, 1);
      }
    }

    // Update Bird Flocks
    for (let i = birdFlocks.length - 1; i >= 0; i--) {
      const b = birdFlocks[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.flapPhase += dt * 9;
    }

    // Update Floating Petals / Dandelion Seeds
    for (let i = 0; i < floatingPetals.length; i++) {
      const p = floatingPetals[i];
      p.phase += dt * 2.2;
      p.x += (p.vx + Math.sin(p.phase) * 14 + plane.breezeVel * 0.25) * dt;
      p.y += p.vy * dt;

      // Wrap around camera view
      if (p.y > camera.y + height * 0.75) {
        p.y = camera.y - height * 0.75;
        p.x = camera.x + (Math.random() - 0.5) * width * 1.4;
      }
      if (p.x < camera.x - width * 0.8) p.x += width * 1.6;
      if (p.x > camera.x + width * 0.8) p.x -= width * 1.6;
    }

    // Generate new terrain ahead & prune behind
    const viewSpanY = height / Math.max(0.5, camera.zoom);
    generateWorldUntil(camera.y - viewSpanY * 1.35);
    cleanupWorldBehind(camera.y + viewSpanY * 0.95);

    // Update HUD
    statDistance.textContent = `${Math.floor(plane.distanceFlown).toLocaleString()} m`;
    statAltitude.textContent = `${Math.round(plane.z)} m`;
    statAltitude.parentElement.classList.toggle('low-altitude', plane.z < 15);
    statThermals.textContent = String(plane.thermalsCaught);
  }

  function recordWingTrails() {
    const wingSpan = 22;
    const cosH = Math.cos(plane.heading);
    const sinH = Math.sin(plane.heading);
    const bankCos = Math.cos(plane.bank * 0.75);

    // Left and right wingtips in world coordinates
    const tailBack = 12;
    const lx = plane.x - cosH * wingSpan * bankCos - sinH * tailBack;
    const ly = plane.y - sinH * wingSpan * bankCos + cosH * tailBack;
    const rx = plane.x + cosH * wingSpan * bankCos - sinH * tailBack;
    const ry = plane.y + sinH * wingSpan * bankCos + cosH * tailBack;

    plane.wingTrailLeft.push({ x: lx, y: ly });
    plane.wingTrailRight.push({ x: rx, y: ry });

    if (plane.wingTrailLeft.length > 34) plane.wingTrailLeft.shift();
    if (plane.wingTrailRight.length > 34) plane.wingTrailRight.shift();
  }

  function cleanupWorldBehind(cutoffY) {
    obstacles = obstacles.filter((o) => o.y < cutoffY);
    thermals = thermals.filter((t) => t.y < cutoffY);
    groundDecor = groundDecor.filter((g) => g.y < cutoffY);
    birdFlocks = birdFlocks.filter((b) => b.y < cutoffY);
    waterRipples = waterRipples.filter((w) => w.y < cutoffY);
  }

  // --- RENDERING (Drone-View 2.5D Oblique Top-Down Projection) ---
  function render(time) {
    const biome = BIOMES[currentBiomeIndex];

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Base Valley Ground Fill
    ctx.fillStyle = biome.groundBase;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Apply Drone Camera Transform (place plane slightly lower on mobile portrait for extra forward visibility)
    const anchorYRatio = width < 640 ? 0.62 : 0.56;
    ctx.translate(width * 0.5, height * anchorYRatio);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    const viewTop = camera.y - (height * 0.7) / camera.zoom - 160;
    const viewBottom = camera.y + (height * 0.6) / camera.zoom + 160;

    // 2. Topographic Rolling Meadow Contours
    drawTopographicHills(biome, viewTop, viewBottom);

    // 3. Winding River & Shimmering Currents
    drawMeanderingRiver(biome, viewTop, viewBottom, time);

    // 4. Ground-Level Details (Wildflowers, Shrubs, Bridges)
    drawGroundDecor(biome, time);

    // 5. Low-Flying Flocks of Birds (below the airplane)
    drawBirdFlocks(time);

    // 6. Swirling Updraft Wind Circles
    drawThermals(biome, time);

    // 7. Cast Shadow of the Paper Airplane on the Valley Floor
    drawAirplaneShadow();

    // 8. 3D-Projected Obstacles (Sorted back-to-front by depth/height for natural overlap)
    drawObstacles3D(biome, time);

    // 9. Wingtip Condensation Trails & Breeze Wind Ribbons
    drawWingTrails();
    drawWindRibbons();

    // 10. The Paper Airplane (3D Origami Projection with Sun Shading)
    drawPaperAirplane(biome);

    // 11. High-Altitude Drifting Petals / Dandelion Seeds
    drawFloatingPetals(biome);

    ctx.restore();

    // 12. Subtle Atmospheric Sun Glow in Upper Corner
    const sunGrad = ctx.createRadialGradient(width * 0.82, height * 0.12, 10, width * 0.82, height * 0.12, Math.max(width, height) * 0.65);
    sunGrad.addColorStop(0, biome.sunGlow);
    sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  function drawTopographicHills(biome, viewTop, viewBottom) {
    const step = 36;
    const startY = Math.floor(viewTop / step) * step;
    const endY = Math.ceil(viewBottom / step) * step;

    // Left and right rolling hill terraces flanking the river valley
    for (let layer = 0; layer < 2; layer++) {
      ctx.fillStyle = layer === 0 ? biome.meadowLight : biome.meadowDark;

      // Left terrace contour
      ctx.beginPath();
      for (let y = startY; y <= endY; y += step) {
        const rCenter = riverCenterAt(y);
        const offset = 260 + layer * 175 + Math.sin(y * 0.004 + layer * 2) * 75;
        const x = rCenter - offset;
        if (y === startY) ctx.moveTo(x - 1400, y);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(camera.x - 2200, endY);
      ctx.lineTo(camera.x - 2200, startY);
      ctx.closePath();
      ctx.fill();

      // Right terrace contour
      ctx.beginPath();
      for (let y = startY; y <= endY; y += step) {
        const rCenter = riverCenterAt(y);
        const offset = 260 + layer * 175 + Math.cos(y * 0.0038 + layer) * 80;
        const x = rCenter + offset;
        if (y === startY) ctx.moveTo(x + 1400, y);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(camera.x + 2200, endY);
      ctx.lineTo(camera.x + 2200, startY);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawMeanderingRiver(biome, viewTop, viewBottom, time) {
    const step = 28;
    const startY = Math.floor(viewTop / step) * step;
    const endY = Math.ceil(viewBottom / step) * step;

    const leftBank = [];
    const rightBank = [];
    const leftWater = [];
    const rightWater = [];
    const leftDeep = [];
    const rightDeep = [];

    for (let y = startY; y <= endY; y += step) {
      const cx = riverCenterAt(y);
      const rw = riverWidthAt(y);
      leftBank.push({ x: cx - rw - 18, y });
      rightBank.push({ x: cx + rw + 18, y });
      leftWater.push({ x: cx - rw, y });
      rightWater.push({ x: cx + rw, y });
      leftDeep.push({ x: cx - rw * 0.52, y });
      rightDeep.push({ x: cx + rw * 0.52, y });
    }

    const fillRibbon = (leftPts, rightPts, color) => {
      if (leftPts.length === 0) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(leftPts[0].x, leftPts[0].y);
      for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
      for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x, rightPts[i].y);
      ctx.closePath();
      ctx.fill();
    };

    fillRibbon(leftBank, rightBank, biome.sandBank);
    fillRibbon(leftWater, rightWater, biome.riverWater);
    fillRibbon(leftDeep, rightDeep, biome.riverDeep);

    // Animated water current lines & ripples
    ctx.strokeStyle = biome.riverFoam;
    ctx.lineWidth = 1.6;
    for (let i = 0; i < waterRipples.length; i++) {
      const wr = waterRipples[i];
      const pulse = Math.sin(time * 2.2 + wr.phase) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(wr.x, wr.y + ((time * 24) % 18), wr.radius * (0.6 + pulse * 0.5), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawGroundDecor(biome, time) {
    for (let i = 0; i < groundDecor.length; i++) {
      const d = groundDecor[i];
      if (d.type === 'flowers') {
        ctx.fillStyle = biome.meadowDark;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();

        // Tiny flower blossoms
        ctx.fillStyle = biome.petalColor;
        for (let k = 0; k < 5; k++) {
          const ang = d.seed + k * 1.25;
          const dist = (k * 0.19) * d.radius;
          ctx.beginPath();
          ctx.arc(d.x + Math.cos(ang) * dist, d.y + Math.sin(ang) * dist, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (d.type === 'shrub') {
        ctx.fillStyle = biome.hillridge;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'bridge') {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(-d.angle);

        // Bridge shadow on water
        ctx.fillStyle = 'rgba(15, 28, 32, 0.22)';
        ctx.fillRect(-d.width * 0.5, 6, d.width, 22);

        // Wooden plank deck
        ctx.fillStyle = '#b88c65';
        ctx.strokeStyle = '#876242';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-d.width * 0.5, -11, d.width, 22, 4);
        ctx.fill();
        ctx.stroke();

        // Plank lines
        ctx.strokeStyle = 'rgba(90, 60, 35, 0.35)';
        ctx.lineWidth = 1.2;
        for (let px = -d.width * 0.44; px <= d.width * 0.44; px += 12) {
          ctx.beginPath();
          ctx.moveTo(px, -10);
          ctx.lineTo(px, 10);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  function drawBirdFlocks(time) {
    ctx.strokeStyle = 'rgba(35, 50, 52, 0.55)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < birdFlocks.length; i++) {
      const f = birdFlocks[i];
      for (let b = 0; b < f.count; b++) {
        const bx = f.x + (b % 2 === 0 ? -1 : 1) * Math.ceil(b / 2) * 14;
        const by = f.y + Math.ceil(b / 2) * 12;
        const wing = Math.sin(f.flapPhase + b * 0.7) * 4;
        ctx.beginPath();
        ctx.moveTo(bx - 5, by + 3 + wing * 0.4);
        ctx.quadraticCurveTo(bx - 2, by - 2, bx, by);
        ctx.quadraticCurveTo(bx + 2, by - 2, bx + 5, by + 3 + wing * 0.4);
        ctx.stroke();
      }
    }
  }

  function drawThermals(biome, time) {
    for (let i = 0; i < thermals.length; i++) {
      const th = thermals[i];
      if (th.collected && th.collectAnim >= 1) continue;

      ctx.save();
      ctx.translate(th.x, th.y);

      if (th.collected) {
        // Expanding upward gust of air animation when the plane collects the circle
        const t = th.collectAnim;
        const alpha = (1 - t) * 0.75;
        const expandRadius = th.radius * (1 + t * 0.95);

        ctx.strokeStyle = `rgba(255, 250, 215, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 2.8 * (1 - t * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, expandRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(230, 252, 255, ${(alpha * 0.85).toFixed(3)})`;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, expandRadius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        continue;
      }

      // Soft warm golden updraft glow
      const grad = ctx.createRadialGradient(0, 0, th.radius * 0.2, 0, 0, th.radius * 1.25);
      grad.addColorStop(0, 'rgba(255, 226, 130, 0.32)');
      grad.addColorStop(0.7, 'rgba(255, 200, 95, 0.15)');
      grad.addColorStop(1, 'rgba(255, 200, 95, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, th.radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Rotating swirling wind arcs
      ctx.rotate(time * 1.2 + th.pulse);
      ctx.strokeStyle = 'rgba(255, 238, 170, 0.82)';
      ctx.lineWidth = 2.3;
      ctx.lineCap = 'round';
      for (let a = 0; a < 3; a++) {
        const startAngle = (a * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, th.radius * (0.72 + Math.sin(th.pulse) * 0.06), startAngle, startAngle + 1.35);
        ctx.stroke();
      }

      // Inner rising air ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < 2; a++) {
        const startAngle = a * Math.PI - time * 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, th.radius * 0.38, startAngle, startAngle + 1.1);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function drawObstacles3D(biome, time) {
    // Drone oblique parallax factor: taller features shift slightly outward from camera center
    // giving a genuine 3D drone-camera perspective from up above!
    for (let i = 0; i < obstacles.length; i++) {
      const ob = obstacles[i];
      const parallaxX = (ob.x - camera.x) * 0.0022;
      const parallaxY = (ob.y - camera.y) * 0.0022 - 0.35; // slight upward tilt

      if (ob.type === 'tree') {
        const palette = ob.isAutumn ? biome.autumnTreeLayers : biome.treeLayers;
        const sway = Math.sin(time * 1.6 + ob.swayPhase) * 2.5;

        // Ground shadow (cast to the lower-left by the high sun)
        ctx.fillStyle = 'rgba(18, 30, 28, 0.18)';
        ctx.beginPath();
        ctx.ellipse(ob.x - 16, ob.y + 18, ob.radius * 0.95, ob.radius * 0.82, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // 4 Stacked 3D canopy tiers rising toward the drone camera
        for (let tier = 0; tier < 4; tier++) {
          const h = (tier + 1) * (ob.height * 0.25);
          const tx = ob.x + parallaxX * h + sway * (tier * 0.35);
          const ty = ob.y + parallaxY * h;
          const r = ob.radius * (1 - tier * 0.19);

          ctx.fillStyle = palette[tier];
          ctx.beginPath();
          ctx.arc(tx, ty, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Subtle sunlit crown highlight
        const topH = ob.height;
        ctx.fillStyle = 'rgba(255, 255, 240, 0.18)';
        ctx.beginPath();
        ctx.arc(ob.x + parallaxX * topH + 3, ob.y + parallaxY * topH - 3, ob.radius * 0.24, 0, Math.PI * 2);
        ctx.fill();

      } else if (ob.type === 'rock') {
        // Shadow
        ctx.fillStyle = 'rgba(18, 30, 28, 0.20)';
        ctx.beginPath();
        ctx.ellipse(ob.x - 14, ob.y + 15, ob.radius * 0.95, ob.radius * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stepped rock spire
        for (let tier = 0; tier < 3; tier++) {
          const h = tier * 18;
          const rx = ob.x + parallaxX * h;
          const ry = ob.y + parallaxY * h;
          const rad = ob.radius * (1 - tier * 0.24);

          ctx.fillStyle = tier === 2 ? biome.rockHighlight : biome.rockColor;
          ctx.beginPath();
          for (let v = 0; v < 7; v++) {
            const ang = (v / 7) * Math.PI * 2 + ob.seed;
            const jag = rad * (0.82 + ((v % 2) * 0.22));
            const vx = rx + Math.cos(ang) * jag;
            const vy = ry + Math.sin(ang) * jag;
            if (v === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
          }
          ctx.closePath();
          ctx.fill();
        }

      } else if (ob.type === 'windmill') {
        // Shadow
        ctx.fillStyle = 'rgba(18, 30, 28, 0.20)';
        ctx.beginPath();
        ctx.arc(ob.x - 16, ob.y + 16, ob.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Stone tower rising in 3D
        const topX = ob.x + parallaxX * ob.height;
        const topY = ob.y + parallaxY * ob.height;

        ctx.fillStyle = '#e8dfd1';
        ctx.beginPath();
        ctx.arc(ob.x, ob.y, ob.radius * 0.58, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f5efe6';
        ctx.beginPath();
        ctx.arc(topX, topY, ob.radius * 0.42, 0, Math.PI * 2);
        ctx.fill();

        // Rotating wooden sails at the top
        ctx.save();
        ctx.translate(topX, topY);
        ctx.rotate(ob.bladeAngle);
        ctx.strokeStyle = '#755338';
        ctx.fillStyle = 'rgba(255, 250, 240, 0.85)';
        ctx.lineWidth = 2.2;
        for (let b = 0; b < 4; b++) {
          ctx.rotate(Math.PI * 0.5);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -ob.radius * 1.15);
          ctx.stroke();
          ctx.fillRect(2, -ob.radius * 1.1, 9, ob.radius * 0.78);
        }
        ctx.restore();

        // Conical roof cap
        ctx.fillStyle = '#b5593f';
        ctx.beginPath();
        ctx.arc(topX, topY, ob.radius * 0.26, 0, Math.PI * 2);
        ctx.fill();

      } else if (ob.type === 'balloon') {
        const h = ob.height;
        const bx = ob.x + parallaxX * h;
        const by = ob.y + parallaxY * h;
        const colors = biome.balloonColors[ob.colorIdx % biome.balloonColors.length];

        // Ground shadow far below
        ctx.fillStyle = 'rgba(15, 25, 28, 0.15)';
        ctx.beginPath();
        ctx.arc(ob.x - 26, ob.y + 28, ob.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Wicker basket slightly below envelope
        ctx.fillStyle = '#8c6239';
        ctx.fillRect(bx - 6, by + 6, 12, 10);

        // Hot air balloon envelope (seen from drone above: concentric striped dome)
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.arc(bx, by, ob.radius, 0, Math.PI * 2);
        ctx.fill();

        // Alternating decorative stripes
        ctx.fillStyle = colors[1];
        for (let s = 0; s < 4; s++) {
          const ang = (s * Math.PI) / 2 + time * 0.25;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.arc(bx, by, ob.radius, ang, ang + 0.55);
          ctx.closePath();
          ctx.fill();
        }

        // Crown ring
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.arc(bx, by, ob.radius * 0.26, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawAirplaneShadow() {
    ctx.save();
    // Shadow offset converges to 0 directly under the plane as altitude (plane.z) drops to 0
    const shadowOffset = Math.max(1.5, plane.z * 1.25);
    const shadowScale = Math.max(0.48, 0.92 - plane.z * 0.007);
    ctx.translate(plane.x - shadowOffset * 0.85, plane.y + shadowOffset);
    ctx.rotate(plane.heading);
    ctx.scale(shadowScale, shadowScale);

    ctx.fillStyle = `rgba(18, 30, 32, ${Math.max(0.10, 0.34 - plane.z * 0.0035).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-21, 16);
    ctx.lineTo(0, 9);
    ctx.lineTo(21, 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawWingTrails() {
    const drawStrip = (pts) => {
      if (pts.length < 3) return;
      for (let i = 1; i < pts.length; i++) {
        const alpha = (i / pts.length) * 0.34;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = (i / pts.length) * 2.2;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
    };
    drawStrip(plane.wingTrailLeft);
    drawStrip(plane.wingTrailRight);
  }

  function drawWindRibbons() {
    ctx.lineCap = 'round';
    for (let i = 0; i < windRibbons.length; i++) {
      const r = windRibbons[i];
      const progress = r.life / r.maxLife;
      const alpha = Math.sin(progress * Math.PI) * 0.65;

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 2.0 * (1 - progress * 0.4);

      const speedAngle = Math.atan2(r.vy, r.vx);
      const cosA = Math.cos(speedAngle);
      const sinA = Math.sin(speedAngle);

      ctx.beginPath();
      const segments = 10;
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const along = -t * r.length;
        const wave = Math.sin(t * r.curveFreq + r.life * 14) * r.curveAmp * Math.sin(t * Math.PI);
        const px = r.x + cosA * along - sinA * wave;
        const py = r.y + sinA * along + cosA * wave;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  function drawPaperAirplane(biome) {
    ctx.save();
    ctx.translate(plane.x, plane.y);
    ctx.rotate(plane.heading);

    // Subtle scale boost when higher in altitude (closer to the drone camera)
    const altScale = 0.88 + (plane.z / 42) * 0.24;
    ctx.scale(altScale, altScale);

    // Soft rising wind-gust halo when the plane is being lifted by a gust
    if (plane.inGustGlow > 0.01) {
      const glowGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 36);
      glowGrad.addColorStop(0, `rgba(230, 252, 255, ${(plane.inGustGlow * 0.48).toFixed(3)})`);
      glowGrad.addColorStop(1, 'rgba(230, 252, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3D Origami Geometry reacting to bank (roll), gentle flip-over (flipRoll), and pitch
    const totalRoll = plane.bank + plane.flipRoll;
    const cosRoll = Math.cos(totalRoll);
    const sinRoll = Math.sin(totalRoll);
    const pitch = plane.pitch + plane.flipPitch;

    const noseY = -28 + Math.abs(pitch) * 7 + (plane.flipPitch < 0 ? plane.flipPitch * 10 : 0);
    const tailY = 16 - (plane.flipPitch < 0 ? plane.flipPitch * 5 : 0);
    const leftWingSpan = -24 * cosRoll + (sinRoll > 0 ? -2.5 : 2.5);
    const rightWingSpan = 24 * cosRoll + (sinRoll < 0 ? 2.5 : -2.5);
    const leftWingTipY = 15 + sinRoll * 6.5;
    const rightWingTipY = 15 - sinRoll * 6.5;
    const centerShiftX = sinRoll * 5.0;

    if (cosRoll >= 0) {
      // Right-side up view (top of wings + inner center fold)
      ctx.fillStyle = sinRoll > 0.08 ? biome.paperTop : biome.paperLeft;
      ctx.beginPath();
      ctx.moveTo(0, noseY);
      ctx.lineTo(leftWingSpan, leftWingTipY);
      ctx.lineTo(centerShiftX - 3.5 * cosRoll, tailY - 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = biome.paperCrease;
      ctx.beginPath();
      ctx.moveTo(0, noseY);
      ctx.lineTo(centerShiftX - 3.5 * cosRoll, tailY - 2);
      ctx.lineTo(centerShiftX, tailY + 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#d3c8b4';
      ctx.beginPath();
      ctx.moveTo(0, noseY);
      ctx.lineTo(centerShiftX, tailY + 3);
      ctx.lineTo(centerShiftX + 3.5 * cosRoll, tailY - 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = sinRoll < -0.08 ? biome.paperLeft : biome.paperTop;
      ctx.beginPath();
      ctx.moveTo(0, noseY);
      ctx.lineTo(centerShiftX + 3.5 * cosRoll, tailY - 2);
      ctx.lineTo(rightWingSpan, rightWingTipY);
      ctx.closePath();
      ctx.fill();
    } else {
      // Gently flipped-over view (underside of wings + protruding central paper keel fold)
      const invCos = Math.abs(cosRoll);
      ctx.fillStyle = biome.paperLeft;
      ctx.beginPath();
      ctx.moveTo(0, noseY);
      ctx.lineTo(leftWingSpan, leftWingTipY);
      ctx.lineTo(centerShiftX, tailY - 1);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = biome.paperRight;
      ctx.beginPath();
      ctx.moveTo(0, noseY);
      ctx.lineTo(centerShiftX, tailY - 1);
      ctx.lineTo(rightWingSpan, rightWingTipY);
      ctx.closePath();
      ctx.fill();

      // Central folded keel ridge sticking up on the underside
      const keelOffset = (sinRoll >= 0 ? -1 : 1) * (3.5 + invCos * 2.5);
      ctx.fillStyle = biome.paperCrease;
      ctx.beginPath();
      ctx.moveTo(0, noseY);
      ctx.lineTo(centerShiftX, tailY + 2);
      ctx.lineTo(centerShiftX + keelOffset, tailY + 4);
      ctx.closePath();
      ctx.fill();
    }

    // Crisp Paper Edge Highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(leftWingSpan, leftWingTipY);
    ctx.lineTo(0, noseY);
    ctx.lineTo(rightWingSpan, rightWingTipY);
    ctx.stroke();

    ctx.restore();
  }

  function drawFloatingPetals(biome) {
    ctx.fillStyle = biome.petalColor;
    for (let i = 0; i < floatingPetals.length; i++) {
      const p = floatingPetals[i];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.phase);
      ctx.globalAlpha = 0.72;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Main Animation Loop
  let lastTime = performance.now();
  resetWorld();

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const elapsed = now * 0.001;

    update(dt, elapsed);
    render(elapsed);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
