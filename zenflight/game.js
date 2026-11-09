/**
 * Zen Flight — A Peaceful Paper Airplane Drone-View Web Game
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

    playPluck(freq, dur = 0.9, vol = 0.04, type = 'sine') {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    }

    playCreatureSound(kind) {
      if (kind === 'fish') {
        this.playPluck(987.77, 0.6, 0.028);
        setTimeout(() => this.playPluck(1318.5, 0.7, 0.022), 90);
      } else {
        this.playPluck(329.63, 0.7, 0.03, 'triangle');
        setTimeout(() => this.playPluck(392.0, 0.8, 0.024, 'triangle'), 110);
      }
    }

    playRainbowSound() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        setTimeout(() => this.playPluck(f, 1.7, 0.032), i * 110);
      });
    }

    playWaterSkimSound() {
      if (!this.initialized || !this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const len = Math.floor(this.ctx.sampleRate * 0.55);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(2100, now + 0.5);
      filter.Q.value = 0.9;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      src.start(now);
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
  let creatures = [];     // deer / rabbits on meadows, fish in the river
  let wakeRipples = [];   // rings left on the water when skimming low
  let rainbows = [];      // rare Golden Valley rainbows
  let lastRainbowY = 0;
  let escort = null;      // friendly birds that fly alongside for a while
  let escortTimer = 14;
  let sightings = 0;      // creature groups greeted this flight
  let wakeTimer = 0;
  let wakeDist = 0;
  let skimSoundTimer = 0;
  let bloomLevels = loadBloom();
  let flightBiomeIdx = 0;
  let flightStartBloom = 0;
  let flightBloomBanked = 0;
  let flightBonusBloom = 0;
  let bankTimer = 0;
  let rainbowFound = false;
  let mists = [];            // Nordic Fjord mist banks
  let mistLevel = 0;         // 0..1 screen softening while inside mist
  let auroraLevel = 0.3;     // 0..1 brightness of the Nordic aurora
  let auroraAnnounced = false;
  let fireflies = [];        // Starlight Dusk ambient fireflies
  let fireflyFollowers = []; // fireflies trailing the plane
  let fireflyClusters = [];  // collectible clusters that light lanterns

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
    creatures = [];
    wakeRipples = [];
    rainbows = [];
    lastRainbowY = 0;
    escort = null;
    mists = [];
    mistLevel = 0;
    auroraAnnounced = false;
    fireflies = [];
    fireflyFollowers = [];
    fireflyClusters = [];
    escortTimer = 12 + Math.random() * 10;
    wakeTimer = 0;
    wakeDist = 0;

    spawnedUpToY = 450;
    generateWorldUntil(plane.y - 1800);

    // Pre-populate ambient floating petals/dandelion seeds
    const ambientPetalCount = 45 + Math.round((bloomLevels[currentBiomeIndex] || 0) * 40);
    for (let i = 0; i < ambientPetalCount; i++) {
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

      spawnLife(bandY);

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
    flightBiomeIdx = currentBiomeIndex;
    flightStartBloom = bloomLevels[flightBiomeIdx] || 0;
    flightBloomBanked = 0;
    flightBonusBloom = 0;
    bankTimer = 0;
    sightings = 0;
    rainbowFound = false;
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

    bankBloom();
    showEndBloom(!!obstacleHit);

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
    updateTitleBloom();
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
      updateLife(dt, time, false);
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
      updateLife(dt, time, false);
      return;
    }

    if (gameState === STATE.LANDING) {
      updateLife(dt, time, false);
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
      } else if (ob.type === 'tree') {
        updateTreeSway(ob, dt);
        checkBlossomGraze(ob);
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

    // Living world: wake petals, river ripples, creatures, rainbow & escort birds
    updateLife(dt, time, true);

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
    for (let i = floatingPetals.length - 1; i >= 0; i--) {
      const p = floatingPetals[i];
      p.phase += dt * 2.2;
      p.x += (p.vx + Math.sin(p.phase) * 14 + plane.breezeVel * 0.25) * dt;
      p.y += p.vy * dt;

      // Leaves and petals are nudged aside by the plane's passing air
      if (!p.seek) {
        const rx = p.x - plane.x;
        const ry = p.y - plane.y;
        const rd2 = rx * rx + ry * ry;
        if (rd2 < 150 * 150 && rd2 > 1) {
          const rd = Math.sqrt(rd2);
          const closeness = 1 - rd / 150;
          const altFactor = clampNum(1 - Math.abs((p.z || plane.z) - plane.z) / 45, 0.3, 1);
          const push = closeness * closeness * 300 * (plane.speed / 240) * altFactor;
          p.x += (rx / rd) * push * dt;
          p.y += (ry / rd) * push * dt;
        }
      }

      if (p.ttl !== undefined) {
        p.age += dt;
        p.vx *= Math.pow(0.5, dt);
        p.vy *= Math.pow(0.5, dt);
        if (p.seek) {
          // Riding the wind alongside the plane
          p.x += (plane.x + p.ox - p.x) * p.seek * dt;
          p.y += (plane.y + p.oy - p.y) * p.seek * dt;
        }
        if (p.age >= p.ttl) floatingPetals.splice(i, 1);
        continue;
      }

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
    creatures = creatures.filter((c) => c.y < cutoffY);
    mists = mists.filter((m) => m.y < cutoffY);
    fireflyClusters = fireflyClusters.filter((f) => f.y < cutoffY);
    rainbows = rainbows.filter((r) => r.y < cutoffY);
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
    drawWakeRipples(biome);

    // 4. Ground-Level Details (Wildflowers, Shrubs, Bridges)
    drawGroundDecor(biome, time);
    drawCreatures(biome, time);

    // 5. Low-Flying Flocks of Birds (below the airplane)
    drawBirdFlocks(time);

    // 6. Swirling Updraft Wind Circles
    drawThermals(biome, time);

    // 7. Cast Shadow of the Paper Airplane on the Valley Floor
    drawAirplaneShadow();

    // 8. 3D-Projected Obstacles (Sorted back-to-front by depth/height for natural overlap)
    drawObstacles3D(biome, time);

    drawRainbows(time);

    // 9. Wingtip Condensation Trails & Breeze Wind Ribbons
    drawWingTrails();
    drawWindRibbons();

    // 10. The Paper Airplane (3D Origami Projection with Sun Shading)
    drawPaperAirplane(biome);
    drawEscortBirds(time);
    drawFireflies(time);
    drawMists(time);

    // 11. High-Altitude Drifting Petals / Dandelion Seeds
    drawFloatingPetals(biome);

    ctx.restore();

    // 12. Subtle Atmospheric Sun Glow in Upper Corner
    const sunGrad = ctx.createRadialGradient(width * 0.82, height * 0.12, 10, width * 0.82, height * 0.12, Math.max(width, height) * 0.65);
    sunGrad.addColorStop(0, biome.sunGlow);
    sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, width, height);

    if (currentBiomeIndex === 2) drawAurora(time);
    if (mistLevel > 0.01) {
      ctx.fillStyle = `rgba(226, 240, 246, ${(mistLevel * 0.42).toFixed(3)})`;
      ctx.fillRect(0, 0, width, height);
    }

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
        const bloomNow = bloomLevels[currentBiomeIndex] || 0;
        const blossomCount = 5 + Math.round(bloomNow * 5);
        const fa = FAUNA[currentBiomeIndex];
        for (let k = 0; k < blossomCount; k++) {
          const ang = d.seed + k * 1.25;
          const dist = ((k % 5) * 0.19 + (k >= 5 ? 0.09 : 0)) * d.radius;
          ctx.fillStyle = (bloomNow > 0.2 && k % 2 === 1) ? fa.bloomColors[k % fa.bloomColors.length] : biome.petalColor;
          ctx.beginPath();
          ctx.arc(d.x + Math.cos(ang) * dist, d.y + Math.sin(ang) * dist, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (d.type === 'shrub') {
        ctx.fillStyle = biome.hillridge;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'lantern') {
        drawLantern(d, time);
      } else if (d.type === 'bloom') {
        drawBloomSpot(d, time);
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
        const sway = Math.sin(time * 1.6 + ob.swayPhase) * 2.5 + (ob.swayOff || 0);

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
      let petalAlpha = 0.72;
      if (p.ttl !== undefined) {
        const lifeT = p.age / p.ttl;
        petalAlpha *= lifeT < 0.15 ? lifeT / 0.15 : 1 - (lifeT - 0.15) / 0.85;
      }
      ctx.globalAlpha = Math.max(0, petalAlpha);
      ctx.fillStyle = p.color || biome.petalColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }


  // ===================================================================
  // LIVING WORLD — wake, ripples, creatures, rainbow, escort birds, bloom
  // ===================================================================
  const FAUNA = [
    { // Golden Valley
      land: 'deer', landColor: '#c99a64', landSpot: '#f3e3c4', antlers: false,
      fishColors: ['#ef7b45', '#fff3e0'], glow: false,
      bloom: 'flowers', bloomColors: ['#f6c453', '#f08a5d', '#fff6e8', '#c9a0dc'],
      greet: { land: 'A deer looks up', fish: 'Koi shimmer below' }
    },
    { // Sakura Highlands
      land: 'rabbit', landColor: '#eadbd6', landSpot: '#ffffff', antlers: false,
      fishColors: ['#ef8fa8', '#ffffff'], glow: false,
      bloom: 'petals', bloomColors: ['#ffc4d6', '#ffe3ec', '#ffffff', '#f7a8c4'],
      greet: { land: 'Rabbits scamper through the blossoms', fish: 'Koi ripple beneath you' }
    },
    { // Nordic Fjord
      land: 'deer', landColor: '#b9c0c4', landSpot: '#f4f7f8', antlers: true,
      fishColors: ['#e69a8d', '#d8e3e8'], glow: false,
      bloom: 'glints', bloomColors: ['#ffffff', '#cfeaff', '#e8f6ff'],
      greet: { land: 'A reindeer lifts its head', fish: 'Silver salmon flash by' }
    },
    { // Starlight Dusk
      land: 'rabbit', landColor: '#c9c3e0', landSpot: '#ffffff', antlers: false,
      fishColors: ['#6fd0e8', '#c4f4ff'], glow: true,
      bloom: 'lanterns', bloomColors: ['#ffd27a', '#ffb35c', '#ffe6a8'],
      greet: { land: 'Moon rabbits startle', fish: 'Glowfish scatter' }
    }
  ];

  const RAINBOW_COLORS = ['#ff8f8f', '#ffb88a', '#ffe08a', '#a8e6a1', '#8fd3f4', '#a9b4f5', '#d7a8ee'];

  function clampNum(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // --- Gentle whisper messages ---
  const whisperEl = document.getElementById('whisper');
  let whisperTimer = null;
  let lastWhisperAt = -10000;
  function whisper(text) {
    if (!whisperEl) return;
    const now = performance.now();
    if (now - lastWhisperAt < 2600) return;
    lastWhisperAt = now;
    whisperEl.textContent = text;
    whisperEl.classList.add('show');
    clearTimeout(whisperTimer);
    whisperTimer = setTimeout(() => whisperEl.classList.remove('show'), 2300);
  }

  // --- Bloom (persistent per environment) ---
  const bloomTitle = document.getElementById('bloom-title');
  const bloomPct = document.getElementById('bloom-pct');
  const bloomFill = document.getElementById('bloom-fill');
  const bloomNote = document.getElementById('bloom-note');
  const bloomMiniFill = document.getElementById('bloom-mini-fill');
  const bloomMiniText = document.getElementById('bloom-mini-text');

  function loadBloom() {
    try {
      const a = JSON.parse(localStorage.getItem('paper_drift_bloom'));
      if (Array.isArray(a) && a.length === 4) {
        return a.map((v) => clampNum(Number(v) || 0, 0, 1));
      }
    } catch (e) { /* storage unavailable */ }
    return [0, 0, 0, 0];
  }

  function saveBloom() {
    try {
      localStorage.setItem('paper_drift_bloom', JSON.stringify(bloomLevels));
    } catch (e) { /* storage unavailable */ }
  }

  function bloomEarned() {
    return plane.thermalsCaught * 0.01 + sightings * 0.01 + plane.distanceFlown * 0.00002 + flightBonusBloom;
  }

  function bankBloom() {
    const earned = bloomEarned();
    const delta = earned - flightBloomBanked;
    if (delta > 0) {
      bloomLevels[flightBiomeIdx] = Math.min(1, (bloomLevels[flightBiomeIdx] || 0) + delta);
      flightBloomBanked = earned;
      saveBloom();
    }
  }

  function updateTitleBloom() {
    if (!bloomMiniText) return;
    const pct = Math.round((bloomLevels[currentBiomeIndex] || 0) * 100);
    bloomMiniText.textContent = pct >= 100
      ? `${BIOMES[currentBiomeIndex].name} · in full bloom`
      : `${BIOMES[currentBiomeIndex].name} · ${pct}% in bloom`;
    if (bloomMiniFill) bloomMiniFill.style.width = pct + '%';
  }

  function showEndBloom(wasObstacle) {
    if (!bloomFill) return;
    const name = BIOMES[flightBiomeIdx].name;
    const startPct = Math.round(flightStartBloom * 100);
    const endPct = Math.round((bloomLevels[flightBiomeIdx] || 0) * 100);
    const gain = endPct - startPct;
    bloomTitle.textContent = endPct >= 100 ? `${name} is in full bloom` : `${name} in bloom`;
    bloomPct.textContent = endPct + '%';

    const bits = [];
    bits.push(gain > 0 ? `+${gain}% this flight` : 'Keep gliding to help it bloom');
    if (sightings > 0) bits.push(`${sightings} ${sightings === 1 ? 'friend' : 'friends'} greeted`);
    if (rainbowFound) bits.push('rainbow found');
    bloomNote.textContent = bits.join(' · ');

    bloomFill.style.transition = 'none';
    bloomFill.style.width = startPct + '%';
    void bloomFill.offsetWidth;
    setTimeout(() => {
      bloomFill.style.transition = '';
      bloomFill.style.width = endPct + '%';
    }, wasObstacle ? 1900 : 450);
    updateTitleBloom();
  }

  window.addEventListener('pagehide', () => {
    if (gameState === STATE.FLYING) bankBloom();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState === STATE.FLYING) bankBloom();
  });

  // --- Bloom spots on the ground ---
  function drawBloomSpot(d, time) {
    const fa = FAUNA[currentBiomeIndex];
    const cols = fa.bloomColors;
    if (fa.bloom === 'lanterns') {
      const pulse = 0.75 + Math.sin(time * 1.7 + d.seed) * 0.25;
      ctx.fillStyle = `rgba(255, 190, 110, ${(0.14 * pulse).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.radius + 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 205, 130, ${(0.3 * pulse).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.radius * 0.55 + 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cols[Math.floor(d.seed) % cols.length];
      ctx.beginPath(); ctx.arc(d.x, d.y, 3.2, 0, Math.PI * 2); ctx.fill();
    } else if (fa.bloom === 'glints') {
      const tw = Math.max(0, Math.sin(time * 1.9 + d.seed * 3));
      const r = 3 + d.radius * 0.3 * tw;
      ctx.strokeStyle = `rgba(235, 248, 255, ${(0.25 + tw * 0.65).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(d.x - r, d.y); ctx.lineTo(d.x + r, d.y);
      ctx.moveTo(d.x, d.y - r); ctx.lineTo(d.x, d.y + r);
      ctx.stroke();
    } else {
      const n = fa.bloom === 'petals' ? 7 : 6;
      for (let k = 0; k < n; k++) {
        const ang = d.seed + k * 1.9;
        const dist = (k / n) * d.radius;
        const sway = Math.sin(time * 1.4 + d.seed + k) * 0.8;
        ctx.fillStyle = cols[k % cols.length];
        ctx.beginPath();
        if (fa.bloom === 'petals') {
          ctx.ellipse(d.x + Math.cos(ang) * dist + sway, d.y + Math.sin(ang) * dist, 3, 1.8, ang, 0, Math.PI * 2);
        } else {
          ctx.arc(d.x + Math.cos(ang) * dist + sway, d.y + Math.sin(ang) * dist, 2.4, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
  }

  // --- Spawning creatures, bloom spots and rainbows as the world generates ---
  function spawnLife(bandY) {
    const fa = FAUNA[currentBiomeIndex];

    // Land creatures on the meadows
    if (Math.random() < 0.3) {
      const gx = plane.x + (Math.random() - 0.5) * 1500;
      const gy = bandY - Math.random() * 120;
      if (Math.abs(gx - riverCenterAt(gy)) > riverWidthAt(gy) + 50) {
        const grp = { counted: false };
        const n = fa.land === 'deer' ? 1 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n; k++) {
          creatures.push({
            kind: fa.land,
            x: gx + (Math.random() - 0.5) * 54,
            y: gy + (Math.random() - 0.5) * 44,
            vx: 0, vy: 0, h: 0,
            ang: Math.random() * Math.PI * 2,
            state: 'idle', t: 0, seed: Math.random() * 10, grp
          });
        }
      }
    }

    // Fish in the river
    if (Math.random() < 0.42) {
      const gy = bandY - Math.random() * 120;
      const rc = riverCenterAt(gy);
      const rw = riverWidthAt(gy);
      const grp = { counted: false };
      const n = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < n; k++) {
        const off = (Math.random() - 0.5) * rw * 1.1;
        creatures.push({
          kind: 'fish', off,
          x: rc + off, y: gy + (Math.random() - 0.5) * 34,
          vx: 0, vy: 0, h: 0, ang: Math.PI / 2,
          state: 'idle', t: 0, seed: Math.random() * 10, grp,
          colorIdx: Math.random() < 0.5 ? 0 : 1
        });
      }
    }

    // Bloom spots: the more an environment has bloomed, the more it sparkles
    const bloom = bloomLevels[currentBiomeIndex] || 0;
    if (bloom > 0) {
      const want = bloom * 5;
      const count = Math.floor(want) + (Math.random() < want - Math.floor(want) ? 1 : 0);
      for (let k = 0; k < count; k++) {
        const gx = plane.x + (Math.random() - 0.5) * 2000;
        const gy = bandY - Math.random() * 140;
        if (Math.abs(gx - riverCenterAt(gy)) > riverWidthAt(gy) + 30) {
          groundDecor.push({
            type: 'bloom', x: gx, y: gy,
            radius: 8 + Math.random() * 14,
            seed: Math.random() * 100
          });
        }
      }
    }

    // Nordic Fjord: drifting mist banks
    if (currentBiomeIndex === 2 && bandY < -600 && Math.random() < 0.07) {
      const mx = plane.x + (Math.random() - 0.5) * 700;
      const blobs = [];
      for (let k = 0; k < 6; k++) {
        blobs.push({ ox: (Math.random() - 0.5) * 220, oy: (Math.random() - 0.5) * 140, r: 90 + Math.random() * 60 });
      }
      mists.push({ x: mx, y: bandY, blobs, passed: false, phase: Math.random() * 6 });
    }

    // Starlight Dusk: firefly clusters that light lanterns when gathered
    if (currentBiomeIndex === 3 && bandY < -300 && Math.random() < 0.1) {
      const flies = [];
      for (let k = 0; k < 8; k++) {
        flies.push({ a: Math.random() * Math.PI * 2, d: 14 + Math.random() * 36, s: 0.5 + Math.random() * 0.8, seed: Math.random() * 10 });
      }
      fireflyClusters.push({
        x: plane.x + (Math.random() - 0.5) * 700, y: bandY - Math.random() * 100,
        radius: 58, flies, collected: false
      });
    }

    // A rare rainbow arching over the Golden Valley
    if (currentBiomeIndex === 0 && bandY < -1500 && lastRainbowY - bandY > 5000 && Math.random() < 0.007) {
      lastRainbowY = bandY;
      rainbows.push({
        x: plane.x + (Math.random() - 0.5) * 240,
        y: bandY, r: 230 + Math.random() * 60,
        phase: Math.random() * 6, glow: 0, passed: false
      });
    }
  }

  // --- Tree sway: trees lean away as you pass ---
  function updateTreeSway(ob, dt) {
    if (ob.swayOff === undefined) { ob.swayOff = 0; ob.swayVel = 0; }
    const dx = ob.x - plane.x;
    const dy = ob.y - plane.y;
    const d = Math.hypot(dx, dy);
    let kick = 0;
    if (gameState === STATE.FLYING && d < 190) {
      kick = Math.sign(dx || 1) * (1 - d / 190) * (plane.speed / 240) * 150;
    }
    ob.swayVel += (-22 * ob.swayOff - 2.4 * ob.swayVel + kick) * dt;
    ob.swayOff = clampNum(ob.swayOff + ob.swayVel * dt, -11, 11);

    // Shake a leaf loose when a tree is stirred
    if (Math.abs(ob.swayVel) > 28 && Math.random() < 2.2 * dt) {
      addWakePetal(ob.x + (Math.random() - 0.5) * ob.radius, ob.y + (Math.random() - 0.5) * ob.radius, null, 2.6);
    }
  }

  function addWakePetal(x, y, color, ttl) {
    if (floatingPetals.length > 420) return;
    floatingPetals.push({
      x, y, z: plane.z,
      size: 2.2 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 40,
      vy: -10 - Math.random() * 28,
      phase: Math.random() * Math.PI * 2,
      age: 0, ttl: ttl || 2.4 + Math.random() * 1.2,
      color: color || null
    });
  }

  // --- Main living-world update ---
  function updateLife(dt, time, interactive) {
    const biome = BIOMES[currentBiomeIndex];
    const fa = FAUNA[currentBiomeIndex];

    // Fade wake ripples
    for (let i = wakeRipples.length - 1; i >= 0; i--) {
      wakeRipples[i].age += dt;
      if (wakeRipples[i].age >= wakeRipples[i].maxAge) wakeRipples.splice(i, 1);
    }

    // Rainbow glow decay
    for (let i = 0; i < rainbows.length; i++) {
      rainbows[i].glow = Math.max(0, rainbows[i].glow - dt * 0.3);
    }

    if (interactive) {
      const lowFactor = clampNum((34 - plane.z) / 34, 0, 1);
      const rc = riverCenterAt(plane.y);
      const rw = riverWidthAt(plane.y);
      const overWater = Math.abs(plane.x - rc) < rw;
      const sinH = Math.sin(plane.heading);
      const cosH = Math.cos(plane.heading);

      if (lowFactor > 0 && !overWater) {
        // Petals swirl up in the wake when gliding low over the meadows
        wakeTimer -= dt;
        if (wakeTimer <= 0) {
          wakeTimer = 0.05 + (1 - lowFactor) * 0.16;
          const side = Math.random() < 0.5 ? -1 : 1;
          const px = plane.x + cosH * side * (6 + Math.random() * 16) - sinH * 12;
          const py = plane.y + sinH * side * 8 + cosH * 12;
          addWakePetal(px, py, null);
          if (lowFactor > 0.6) addWakePetal(px + side * 6, py + 6, null);
        }

        // Stir the wildflowers directly beneath the wings
        for (let i = 0; i < groundDecor.length; i++) {
          const gd = groundDecor[i];
          if ((gd.type === 'flowers' || gd.type === 'bloom') && (gd.stirT === undefined || time - gd.stirT > 6)) {
            if (Math.abs(gd.y - plane.y) < gd.radius + 16 && Math.abs(gd.x - plane.x) < gd.radius + 16) {
              gd.stirT = time;
              const cols = fa.bloomColors;
              for (let k = 0; k < 4; k++) {
                addWakePetal(gd.x + (Math.random() - 0.5) * gd.radius, gd.y + (Math.random() - 0.5) * gd.radius,
                  k % 2 ? cols[k % cols.length] : null, 3);
              }
            }
          }
        }
      }

      if (lowFactor > 0 && overWater && plane.z < 26) {
        // Skimming the river leaves soft rings behind each wingtip
        wakeDist += plane.speed * dt;
        if (wakeDist > 24) {
          wakeDist = 0;
          for (let side = -1; side <= 1; side += 2) {
            wakeRipples.push({
              x: plane.x + cosH * side * 13 - sinH * 10,
              y: plane.y + sinH * side * 8 + cosH * 10,
              age: 0, maxAge: 1.5 + Math.random() * 0.4, maxR: 34 + Math.random() * 12
            });
          }
          if (wakeRipples.length > 90) wakeRipples.splice(0, wakeRipples.length - 90);
        }
        skimSoundTimer -= dt;
        if (skimSoundTimer <= 0) {
          skimSoundTimer = 1.3;
          audio.playWaterSkimSound();
        }
      } else {
        wakeDist = 0;
      }
    }

    updateCreatures(dt, time, interactive);
    updateRainbows(interactive);
    updateEscort(dt, time, interactive);
    updateAtmosphere(dt, time, interactive);

    if (interactive) {
      bankTimer += dt;
      if (bankTimer > 8) {
        bankTimer = 0;
        bankBloom();
      }
    }
  }

  function greetCreature(c) {
    if (c.grp.counted) return;
    c.grp.counted = true;
    sightings++;
    const fa = FAUNA[currentBiomeIndex];
    whisper(c.kind === 'fish' ? fa.greet.fish : fa.greet.land);
    audio.playCreatureSound(c.kind);
  }

  function updateCreatures(dt, time, interactive) {
    for (let i = 0; i < creatures.length; i++) {
      const c = creatures[i];
      if (Math.abs(c.y - camera.y) > 1500) continue;

      const dxp = c.x - plane.x;
      const dyp = c.y - plane.y;
      const dp = Math.hypot(dxp, dyp) || 1;

      if (c.kind === 'fish') {
        if (c.state === 'idle') {
          const rc = riverCenterAt(c.y);
          const rw = riverWidthAt(c.y);
          c.off = clampNum(c.off + Math.sin(time * 0.7 + c.seed) * 6 * dt, -rw * 0.62, rw * 0.62);
          const tx = rc + c.off;
          const lateral = (tx - c.x) * 2.0;
          c.x += lateral * dt;
          c.y += 9 * dt;
          const targetAng = Math.atan2(9, lateral);
          c.ang += Math.atan2(Math.sin(targetAng - c.ang), Math.cos(targetAng - c.ang)) * Math.min(1, 4 * dt);
          if (interactive && gameState === STATE.FLYING && plane.z < 40 && dp < 95) {
            c.state = 'startled';
            c.t = 0;
            c.vx = dxp / dp;
            c.vy = dyp / dp;
            c.ang = Math.atan2(c.vy, c.vx);
            wakeRipples.push({ x: c.x, y: c.y, age: 0, maxAge: 1.6, maxR: 40 });
            greetCreature(c);
          }
        } else {
          c.t += dt;
          const sp = 150 * Math.pow(Math.max(0, 1 - c.t / 0.9), 2);
          c.x += c.vx * sp * dt;
          c.y += c.vy * sp * dt;
          if (c.t > 0.9) {
            c.state = 'idle';
            c.off = c.x - riverCenterAt(c.y);
          }
        }
      } else {
        if (c.state === 'idle') {
          if (interactive && gameState === STATE.FLYING && dp < 150) {
            c.state = 'startled';
            c.t = 0;
            c.vx = dxp / dp;
            c.vy = dyp / dp;
            c.ang = Math.atan2(c.vy, c.vx);
            greetCreature(c);
          }
        } else if (c.state === 'startled') {
          c.t += dt;
          let sp;
          if (c.kind === 'deer') {
            sp = 150 * Math.max(0, 1 - c.t / 2.0);
            c.h = sp > 8 ? Math.abs(Math.sin(c.t * 7)) * 7 : 0;
          } else {
            const cycle = Math.max(0, Math.sin(c.t * 10));
            sp = 110 * Math.max(0, 1 - c.t / 1.6) * cycle * 1.6;
            c.h = cycle * 5 * Math.max(0, 1 - c.t / 1.6);
          }
          c.x += c.vx * sp * dt;
          c.y += c.vy * sp * dt;
          if (c.t > 2.2) {
            c.state = 'calm';
            c.h = 0;
          }
        }
      }
    }
  }

  function drawWakeRipples(biome) {
    if (wakeRipples.length === 0) return;
    ctx.strokeStyle = biome.riverFoam;
    ctx.lineWidth = 1.8;
    for (let i = 0; i < wakeRipples.length; i++) {
      const w = wakeRipples[i];
      const t = w.age / w.maxAge;
      ctx.globalAlpha = Math.pow(1 - t, 1.4);
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, 4 + w.maxR * t, (4 + w.maxR * t) * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawCreatures(biome, time) {
    if (creatures.length === 0) return;
    const fa = FAUNA[currentBiomeIndex];
    const halfY = (height / camera.zoom) * 0.8 + 60;
    const halfX = (width / camera.zoom) * 0.7 + 60;

    for (let i = 0; i < creatures.length; i++) {
      const c = creatures[i];
      if (Math.abs(c.y - camera.y) > halfY || Math.abs(c.x - camera.x) > halfX) continue;
      const h = c.h || 0;

      ctx.save();
      if (c.kind !== 'fish') {
        // Soft ground shadow
        ctx.fillStyle = 'rgba(18, 30, 28, 0.2)';
        ctx.beginPath();
        ctx.ellipse(c.x - 2, c.y + 3, c.kind === 'deer' ? 11 : 6, c.kind === 'deer' ? 5 : 3.6, c.ang, 0, Math.PI * 2);
        ctx.fill();
      }
      if (fa.glow) {
        ctx.fillStyle = 'rgba(190, 230, 255, 0.13)';
        ctx.beginPath(); ctx.arc(c.x, c.y - h, c.kind === 'deer' ? 22 : 15, 0, Math.PI * 2); ctx.fill();
      }
      ctx.translate(c.x, c.y - h);
      ctx.rotate(c.ang);

      if (c.kind === 'deer') {
        ctx.fillStyle = fa.landColor;
        ctx.beginPath(); ctx.ellipse(0, 0, 11, 5.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(11.5, 0, 4.4, 3.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.ellipse(9.2, -2.9, 1.8, 1, -0.6, 0, Math.PI * 2);
        ctx.ellipse(9.2, 2.9, 1.8, 1, 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fa.landSpot;
        ctx.globalAlpha = 0.6;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath(); ctx.arc(-4 + k * 4, (k % 2 ? 1.6 : -1.6), 1.1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(-11.2, 0, 2, 0, Math.PI * 2); ctx.fill();
        if (fa.antlers) {
          ctx.strokeStyle = fa.landSpot;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(10.2, -2); ctx.lineTo(7.5, -6.5); ctx.moveTo(8.6, -4.6); ctx.lineTo(10.8, -7.4);
          ctx.moveTo(10.2, 2); ctx.lineTo(7.5, 6.5); ctx.moveTo(8.6, 4.6); ctx.lineTo(10.8, 7.4);
          ctx.stroke();
        }
      } else if (c.kind === 'rabbit') {
        ctx.fillStyle = fa.landColor;
        ctx.beginPath(); ctx.ellipse(0, 0, 6, 4.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6.2, 0, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4.8, -2, 3.6, 1.1, -0.35, 0, Math.PI * 2);
        ctx.ellipse(4.8, 2, 3.6, 1.1, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fa.landSpot;
        ctx.beginPath(); ctx.arc(-6.2, 0, 2, 0, Math.PI * 2); ctx.fill();
      } else {
        // Fish
        const col = fa.fishColors[c.colorIdx || 0];
        const wag = Math.sin(time * (c.state === 'startled' ? 16 : 6) + c.seed) * 0.5;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(0, 0, 8, 3.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(-13, -3.4 + wag * 3);
        ctx.lineTo(-13, 3.4 + wag * 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = fa.fishColors[1];
        ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.ellipse(1.5, 0, 3.2, 1.8, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- Rainbows ---
  function updateRainbows(interactive) {
    if (!interactive) return;
    for (let i = 0; i < rainbows.length; i++) {
      const r = rainbows[i];
      if (r.passed) continue;
      const dx = plane.x - r.x;
      const dy = plane.y - r.y;
      const dist = Math.hypot(dx, dy);
      const bw = 9;
      const ringMid = r.r - 3 * bw;
      if (dy < -0.1 * dist && Math.abs(dist - ringMid) < 3.5 * bw + 12) {
        r.passed = true;
        r.glow = 1;
        sightings++;
        rainbowFound = true;
        flightBonusBloom += 0.02;
        plane.z = Math.min(68, plane.z + 8);
        whisper('You flew through a rainbow');
        audio.playRainbowSound();
        for (let k = 0; k < 21; k++) {
          const ang = (k / 21) * Math.PI * 2;
          addWakePetal(plane.x + Math.cos(ang) * 14, plane.y + Math.sin(ang) * 14, RAINBOW_COLORS[k % 7], 3.6);
          const last = floatingPetals[floatingPetals.length - 1];
          if (last) {
            last.vx = Math.cos(ang) * (40 + Math.random() * 40);
            last.vy = Math.sin(ang) * (40 + Math.random() * 40) - 30;
            last.size = 3 + Math.random() * 2;
          }
        }
      }
    }
  }

  function drawRainbows(time) {
    if (rainbows.length === 0) return;
    const bw = 9;
    const lift = 90;
    for (let i = 0; i < rainbows.length; i++) {
      const r = rainbows[i];
      if (Math.abs(r.y - camera.y) > (height / camera.zoom) + 320) continue;
      const cx = r.x + (r.x - camera.x) * 0.0022 * lift;
      const cy = r.y + ((r.y - camera.y) * 0.0022 - 0.35) * lift;
      const alpha = Math.min(0.85, 0.3 + 0.05 * Math.sin(time * 0.8 + r.phase) + r.glow * 0.4);

      ctx.save();
      ctx.lineWidth = bw + 0.5;
      ctx.globalAlpha = alpha;
      for (let k = 0; k < 7; k++) {
        ctx.strokeStyle = RAINBOW_COLORS[k];
        ctx.beginPath();
        ctx.arc(cx, cy, r.r - k * bw, Math.PI * 1.04, Math.PI * 1.96);
        ctx.stroke();
      }
      // Soft mist where the rainbow meets the ground
      for (let side = -1; side <= 1; side += 2) {
        const mx = cx + side * (r.r - 3 * bw);
        const mg = ctx.createRadialGradient(mx, cy, 4, mx, cy, 52);
        mg.addColorStop(0, `rgba(255, 255, 255, ${(0.4 + r.glow * 0.3).toFixed(3)})`);
        mg.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(mx, cy, 52, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- Friendly escort birds (Golden Valley) ---
  function startEscort() {
    const side = Math.random() < 0.5 ? -1 : 1;
    const count = 5;
    const birds = [];
    for (let k = 0; k < count; k++) {
      const rank = Math.ceil(k / 2);
      birds.push({
        ox: side * 95 + (k % 2 ? 1 : -1) * rank * 16 * (k === 0 ? 0 : 1),
        oy: -30 + rank * 15,
        x: plane.x + side * 560 + k * 10,
        y: plane.y - 200 + k * 12,
        phase: Math.random() * 6
      });
    }
    escort = { t: 0, dur: 14 + Math.random() * 5, side, birds, greeted: false };
  }

  function updateEscort(dt, time, interactive) {
    if (!escort) {
      if (interactive && currentBiomeIndex === 0 && plane.distanceFlown > 150) {
        escortTimer -= dt;
        if (escortTimer <= 0) startEscort();
      }
      return;
    }
    escort.t += dt;
    // Peel away when the flight ends or the time is up
    if (!interactive && escort.t < escort.dur - 2.5) escort.t = escort.dur - 2.5;

    const leaving = escort.t > escort.dur - 2.5;
    for (let k = 0; k < escort.birds.length; k++) {
      const b = escort.birds[k];
      b.phase += dt * 9;
      const tx = leaving ? plane.x + escort.side * 640 : plane.x + b.ox + Math.sin(time * 0.9 + k) * 6;
      const ty = leaving ? plane.y - 320 : plane.y + b.oy + Math.cos(time * 1.1 + k) * 5;
      const ease = Math.min(1, (leaving ? 0.9 : 2.0) * dt);
      b.x += (tx - b.x) * ease;
      b.y += (ty - b.y) * ease;
    }

    if (!escort.greeted && escort.t > 2.5 && interactive) {
      escort.greeted = true;
      sightings++;
      whisper('Friendly birds join you');
      audio.playCreatureSound('land');
    }
    if (escort.t > escort.dur) {
      escort = null;
      escortTimer = 25 + Math.random() * 25;
    }
  }

  function drawEscortBirds(time) {
    if (!escort) return;
    ctx.strokeStyle = 'rgba(35, 50, 52, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    for (let k = 0; k < escort.birds.length; k++) {
      const b = escort.birds[k];
      const wing = Math.sin(b.phase) * 5;
      // faint shadow on the valley floor
      ctx.fillStyle = 'rgba(18, 30, 28, 0.12)';
      ctx.beginPath(); ctx.ellipse(b.x + 10, b.y + 24, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(b.x - 8, b.y + 4 + wing * 0.5);
      ctx.quadraticCurveTo(b.x - 3, b.y - 3, b.x, b.y);
      ctx.quadraticCurveTo(b.x + 3, b.y - 3, b.x + 8, b.y + 4 + wing * 0.5);
      ctx.stroke();
    }
  }


  // ===================================================================
  // ENVIRONMENT MOMENTS — Sakura blossoms, Nordic aurora & mist, Dusk fireflies
  // ===================================================================

  // --- Sakura Highlands: brush past a blossom tree and its petals ride along with you ---
  function checkBlossomGraze(ob) {
    if (currentBiomeIndex !== 1 || gameState !== STATE.FLYING || ob.grazed) return;
    if (Math.hypot(ob.x - plane.x, ob.y - plane.y) > ob.radius + 45) return;
    ob.grazed = true;
    flightBonusBloom += 0.005;
    const cols = FAUNA[1].bloomColors;
    for (let k = 0; k < 26; k++) {
      if (floatingPetals.length > 440) break;
      const ang = Math.random() * Math.PI * 2;
      floatingPetals.push({
        x: ob.x + Math.cos(ang) * ob.radius * 0.6,
        y: ob.y + Math.sin(ang) * ob.radius * 0.6,
        z: plane.z,
        size: 2.6 + Math.random() * 2.2,
        vx: Math.cos(ang) * 30, vy: Math.sin(ang) * 30 - 20,
        phase: Math.random() * Math.PI * 2,
        age: 0, ttl: 4.8 + Math.random() * 1.6,
        color: cols[k % cols.length],
        seek: 0.5 + Math.random() * 0.5,
        ox: (Math.random() - 0.5) * 120,
        oy: -20 + Math.random() * 90
      });
    }
    whisper('Blossoms swirl in your wake');
    audio.playPluck(659.25, 1.3, 0.028);
    setTimeout(() => audio.playPluck(880, 1.3, 0.02), 130);
  }

  // --- Nordic Fjord: aurora (brightens with distance) and mist banks ---
  function drawAurora(time) {
    const level = auroraLevel;
    if (level < 0.02) return;
    const bands = [
      { c: [52, 214, 138], off: 0.05 },
      { c: [36, 188, 196], off: 0.095 },
      { c: [138, 104, 236], off: 0.14 }
    ];
    ctx.save();
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      const top = [];
      const bottom = [];
      for (let x = 0; x <= width + 30; x += 30) {
        const y0 = height * b.off + Math.sin(x * 0.005 + time * 0.25 + i * 1.7) * height * 0.04;
        const len = height * (0.1 + 0.08 * Math.sin(x * 0.011 + time * 0.4 + i)) * (0.55 + level * 0.9);
        top.push([x, y0]);
        bottom.push([x, y0 + len]);
      }
      const g = ctx.createLinearGradient(0, 0, 0, height * 0.5);
      const a = (0.08 + level * 0.42).toFixed(3);
      g.addColorStop(0, `rgba(${b.c[0]}, ${b.c[1]}, ${b.c[2]}, ${a})`);
      g.addColorStop(1, `rgba(${b.c[0]}, ${b.c[1]}, ${b.c[2]}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(top[0][0], top[0][1]);
      for (let k = 1; k < top.length; k++) ctx.lineTo(top[k][0], top[k][1]);
      for (let k = bottom.length - 1; k >= 0; k--) ctx.lineTo(bottom[k][0], bottom[k][1]);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMists(time) {
    if (mists.length === 0) return;
    const halfY = (height / camera.zoom) * 0.8 + 260;
    for (let i = 0; i < mists.length; i++) {
      const m = mists[i];
      if (Math.abs(m.y - camera.y) > halfY) continue;
      for (let k = 0; k < m.blobs.length; k++) {
        const b = m.blobs[k];
        const bx = m.x + b.ox + Math.sin(time * 0.15 + m.phase + k) * 14;
        const by = m.y + b.oy;
        const g = ctx.createRadialGradient(bx, by, 4, bx, by, b.r);
        g.addColorStop(0, 'rgba(238, 247, 250, 0.55)');
        g.addColorStop(1, 'rgba(238, 247, 250, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --- Starlight Dusk: fireflies that follow you, clusters that light lanterns ---
  function drawLantern(d, time) {
    const lit = d.lit || 0;
    const pulse = 0.8 + Math.sin(time * 1.6 + d.seed) * 0.2;
    ctx.fillStyle = '#56657a';
    ctx.beginPath(); ctx.arc(d.x, d.y, 3.4, 0, Math.PI * 2); ctx.fill();
    if (lit > 0.01) {
      ctx.fillStyle = `rgba(255, 190, 110, ${(0.15 * lit * pulse).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 24 + lit * 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 206, 130, ${(0.32 * lit * pulse).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 236, 170, ${(0.95 * lit).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 3.4, 0, Math.PI * 2); ctx.fill();
    }
  }

  function joinFireflyTrail(n) {
    for (let k = 0; k < n; k++) {
      if (fireflyFollowers.length >= 30) fireflyFollowers.shift();
      fireflyFollowers.push({
        side: (Math.random() - 0.5) * 56,
        back: 14 + Math.random() * 60,
        x: plane.x + (Math.random() - 0.5) * 120,
        y: plane.y + (Math.random() - 0.5) * 120,
        seed: Math.random() * 10
      });
    }
  }

  function updateAtmosphere(dt, time, interactive) {
    // Nordic aurora brightens as the glide gets longer
    const flyingish = gameState === STATE.FLYING || gameState === STATE.LANDING;
    const auroraTarget = flyingish ? 0.15 + 0.85 * Math.min(1, plane.distanceFlown / 3000) : 0.3;
    auroraLevel += (auroraTarget - auroraLevel) * Math.min(1, 0.6 * dt);
    if (interactive && currentBiomeIndex === 2 && auroraLevel > 0.6 && !auroraAnnounced) {
      auroraAnnounced = true;
      whisper('The aurora brightens above');
    }

    // Mist banks soften the screen while you drift through
    let inMist = false;
    if (interactive && currentBiomeIndex === 2) {
      for (let i = 0; i < mists.length; i++) {
        const m = mists[i];
        if (Math.abs(m.y - plane.y) > 260) continue;
        for (let k = 0; k < m.blobs.length; k++) {
          const b = m.blobs[k];
          if (Math.hypot(plane.x - (m.x + b.ox), plane.y - (m.y + b.oy)) < b.r * 0.7) {
            inMist = true;
            if (!m.passed) {
              m.passed = true;
              flightBonusBloom += 0.005;
              whisper('Drifting through the mist');
            }
            break;
          }
        }
        if (inMist) break;
      }
    }
    mistLevel += ((inMist ? 1 : 0) - mistLevel) * Math.min(1, (inMist ? 2.2 : 0.9) * dt);

    // Starlight Dusk fireflies
    if (currentBiomeIndex !== 3) {
      if (fireflies.length || fireflyFollowers.length) { fireflies = []; fireflyFollowers = []; }
      return;
    }
    while (fireflies.length < 26) {
      fireflies.push({
        x: camera.x + (Math.random() - 0.5) * width * 1.3,
        y: camera.y + (Math.random() - 0.5) * height * 1.3,
        vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12,
        seed: Math.random() * 10
      });
    }
    const sinH = Math.sin(plane.heading);
    const cosH = Math.cos(plane.heading);
    for (let i = fireflies.length - 1; i >= 0; i--) {
      const f = fireflies[i];
      f.x += (f.vx + Math.sin(time * 0.8 + f.seed) * 10) * dt;
      f.y += (f.vy + Math.cos(time * 0.7 + f.seed) * 10) * dt;
      if (interactive) {
        const dx = plane.x - f.x;
        const dy = plane.y - f.y;
        const d = Math.hypot(dx, dy);
        if (d < 230) {
          f.x += (dx / (d || 1)) * (30 + (230 - d) * 0.25) * dt;
          f.y += (dy / (d || 1)) * (30 + (230 - d) * 0.25) * dt;
        }
        if (d < 34) {
          fireflies.splice(i, 1);
          joinFireflyTrail(1);
          continue;
        }
      }
      if (Math.abs(f.x - camera.x) > width * 0.85) f.x = camera.x - Math.sign(f.x - camera.x) * width * 0.8;
      if (Math.abs(f.y - camera.y) > height * 0.85) f.y = camera.y - Math.sign(f.y - camera.y) * height * 0.8;
    }

    for (let i = 0; i < fireflyFollowers.length; i++) {
      const f = fireflyFollowers[i];
      const tx = plane.x + cosH * f.side - sinH * f.back + Math.sin(time * 1.3 + f.seed) * 8;
      const ty = plane.y + sinH * f.side + cosH * f.back + Math.cos(time * 1.1 + f.seed) * 8;
      const ease = Math.min(1, 3 * dt);
      f.x += (tx - f.x) * ease;
      f.y += (ty - f.y) * ease;
    }

    // Clusters: gather them to light lanterns across the ground
    if (interactive) {
      for (let i = 0; i < fireflyClusters.length; i++) {
        const c = fireflyClusters[i];
        if (c.collected) continue;
        if (Math.hypot(plane.x - c.x, plane.y - c.y) < c.radius + 20) {
          c.collected = true;
          sightings++;
          joinFireflyTrail(c.flies.length);
          for (let k = 0; k < 10; k++) {
            const ang = (k / 10) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 70 + Math.random() * 90;
            groundDecor.push({
              type: 'lantern',
              x: c.x + Math.cos(ang) * dist, y: c.y + Math.sin(ang) * dist - 40,
              radius: 10, seed: Math.random() * 10, lit: 0, igniteAt: time + k * 0.12
            });
          }
          whisper('Fireflies gather, lanterns awaken');
          audio.playThermalChime();
        }
      }
    }
    for (let i = 0; i < groundDecor.length; i++) {
      const d = groundDecor[i];
      if (d.type === 'lantern' && d.lit < 1 && time >= d.igniteAt) {
        d.lit = Math.min(1, d.lit + dt * 0.9);
      }
    }
  }

  function drawFireflies(time) {
    if (currentBiomeIndex !== 3) return;
    const glow = (x, y, seed, scale) => {
      const pulse = 0.55 + 0.45 * Math.sin(time * 3 + seed * 2);
      ctx.fillStyle = `rgba(255, 233, 150, ${(0.16 * pulse * scale).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, 9 * scale, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 244, 190, ${(0.4 + 0.6 * pulse).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, 1.9 * scale, 0, Math.PI * 2); ctx.fill();
    };
    for (let i = 0; i < fireflies.length; i++) glow(fireflies[i].x, fireflies[i].y, fireflies[i].seed, 1);
    for (let i = 0; i < fireflyFollowers.length; i++) glow(fireflyFollowers[i].x, fireflyFollowers[i].y, fireflyFollowers[i].seed, 1.15);
    const halfY = (height / camera.zoom) * 0.8 + 100;
    for (let i = 0; i < fireflyClusters.length; i++) {
      const c = fireflyClusters[i];
      if (c.collected || Math.abs(c.y - camera.y) > halfY) continue;
      const aura = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.radius + 20);
      aura.addColorStop(0, 'rgba(255, 233, 150, 0.22)');
      aura.addColorStop(1, 'rgba(255, 233, 150, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.radius + 20, 0, Math.PI * 2); ctx.fill();
      for (let k = 0; k < c.flies.length; k++) {
        const f = c.flies[k];
        const ang = f.a + time * f.s;
        glow(c.x + Math.cos(ang) * f.d, c.y + Math.sin(ang) * f.d * 0.8, f.seed, 1.1);
      }
    }
  }

  updateTitleBloom();

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
