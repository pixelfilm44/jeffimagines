// paperkit.js: the Cut-Paper Diorama medium for Zen Flight.
// Sheet-making functions (paperize, shadowDraw, compose, circPts, cutLines, makeTex) are the reference style's own;
// the rest turns them into game-speed pieces: pre-cut ground tiles, baked sprites, a per-frame "paper pass"
// for everything still drawn as vectors, and the lamp / vignette / grain finish.
(function () {
  'use strict';
  const H = window.H, TAU = Math.PI * 2;
  const PAPER = (window.PAPER = {});

  const poly = (c, pts) => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
  // scissor-cut circle: slightly faceted, slightly wobbly
  const circPts = (r, cx, cy, R, seg = 15, jit = 0.6) => {
    const n = Math.max(14, Math.round((TAU * R) / seg)), a0 = r() * TAU, out = [];
    for (let i = 0; i < n; i++) { const a = a0 + ((i + r.range(-0.2, 0.2)) / n) * TAU, rr = R + r.gauss() * jit; out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    return out;
  };
  const cutLines = (r, pts, seg = 22, jit = 0.7) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / seg));
      for (let k = 0; k < n; k++) { const u = k / n; out.push([ax + (bx - ax) * u + (k ? r.gauss() * jit : 0), ay + (by - ay) * u + (k ? r.gauss() * jit : 0)]); }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  const blobPath = (c, parts) => { c.beginPath(); parts.forEach((p) => poly(c, p)); };

  // tileable paper fibre texture (alpha-only light/dark flecks)
  const makeTex = (seed) => {
    const S = 512, cv = H.layer(S, S), x = cv.getContext('2d'), r = H.rng(seed), nz = H.makeNoise(seed + 1);
    const M = 64, mc = H.layer(M, M), mx = mc.getContext('2d'), mi = mx.createImageData(M, M), f = 5 / M;
    for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
      const n = (a, b) => nz.fbm2(a * f, b * f, 3);
      const v = (n(i, j) * (M - i) * (M - j) + n(i - M, j) * i * (M - j) + n(i, j - M) * (M - i) * j + n(i - M, j - M) * i * j) / (M * M);
      const k = (j * M + i) * 4, a = Math.min(255, Math.abs(v) * 120);
      mi.data[k] = mi.data[k + 1] = mi.data[k + 2] = v > 0 ? 255 : 0; mi.data[k + 3] = a;
    }
    mx.putImageData(mi, 0, 0);
    x.imageSmoothingEnabled = true;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) x.drawImage(mc, ox * S, oy * S, S, S);
    const g = x.getImageData(0, 0, S, S), d = g.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = r() - 0.5;
      if (r() < 0.5) continue;
      const a = Math.abs(n) * 60;
      const c = n > 0 ? 255 : 0, aa = a / 255, oa = d[i + 3] / 255, na = aa + oa * (1 - aa);
      if (na > 0) { d[i] = (c * aa + d[i] * oa * (1 - aa)) / na; d[i + 1] = d[i]; d[i + 2] = d[i]; d[i + 3] = na * 255; }
    }
    x.putImageData(g, 0, 0);
    x.lineCap = 'round';
    for (let n = 0; n < 1100; n++) {
      const px = r() * S, py = r() * S, len = r.range(4, 22), a = r() * TAU, bend = r.range(-5, 5);
      const light = r() < 0.55;
      x.strokeStyle = light ? `rgba(255,255,255,${r.range(0.08, 0.22)})` : `rgba(0,0,0,${r.range(0.05, 0.14)})`;
      x.lineWidth = r.range(0.4, 1.1);
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const sx = px + ox * S, sy = py + oy * S;
        if (sx < -30 || sx > S + 30 || sy < -30 || sy > S + 30) continue;
        x.beginPath(); x.moveTo(sx, sy);
        x.quadraticCurveTo(sx + Math.cos(a) * len * 0.5 - Math.sin(a) * bend, sy + Math.sin(a) * len * 0.5 + Math.cos(a) * bend, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
        x.stroke();
      }
    }
    return cv;
  };

  const PK = {};
  const cache = (k, f) => PK[k] || (PK[k] = f());
  const pkTex = () => PK.tex || (PK.tex = makeTex(77));
  let texPat = null;
  const pattern = () => texPat || (texPat = H.layer(1, 1).getContext('2d').createPattern(pkTex(), 'repeat'));

  // one paper sheet = shape + fibre texture + lit / dark cut edge
  const paperize = (w, h, paint, o = {}) => {
    const L = H.layer(Math.ceil(w), Math.ceil(h)), c = L.getContext('2d');
    c.save(); paint(c); c.restore(); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const r = H.rng(o.seed || 7), tex = o.tex ?? 1;
    if (tex > 0) {
      const pat = pattern();
      pat.setTransform(new DOMMatrix().translateSelf(r() * 512, r() * 512).rotateSelf(r.range(-30, 30)));
      c.save(); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = tex; c.fillStyle = pat; c.fillRect(0, 0, w, h); c.restore();
    }
    const edge = (col, dx, dy) => {
      const T = H.layer(L.width, L.height), tc = T.getContext('2d');
      tc.drawImage(L, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, w, h);
      tc.globalCompositeOperation = 'destination-out'; tc.drawImage(L, dx, dy);
      c.save(); c.globalCompositeOperation = 'source-atop'; c.drawImage(T, 0, 0); c.restore();
    };
    if (o.rim !== false) { edge(`rgba(255,247,232,${o.hi ?? 0.38})`, 1.3, 1.6); edge(`rgba(0,0,0,${o.lo ?? 0.28})`, -1.1, -1.3); }
    return L;
  };
  // two-part drop shadow onto the sheet behind; k scales the reference's pixel sizes to the target's resolution
  const shadowDraw = (ctx, img, x, y, d = 1, sa = 0.5, k = 1) => {
    ctx.save();
    if (d > 0) {
      ctx.shadowColor = `rgba(14,10,30,${sa})`; ctx.shadowBlur = (6 + d * 7) * k; ctx.shadowOffsetX = (1.5 + d * 2.4) * k; ctx.shadowOffsetY = (2 + d * 3.6) * k;
      ctx.drawImage(img, x, y);
      ctx.shadowColor = 'rgba(10,6,20,0.38)'; ctx.shadowBlur = 2.5 * k; ctx.shadowOffsetX = 0.8 * k; ctx.shadowOffsetY = 1.4 * k;
    }
    ctx.drawImage(img, x, y); ctx.restore();
  };

  // ---------- cardstock palettes: the game's four sceneries, re-cut in saturated card ----------
  const CREAM = '#f3ecdc', CORAL = '#e8604a', GOLD = '#f2b545', TEAL = '#58b0a6', INK = '#2b2d5a';
  const paperPlane = { paperTop: '#fbf6ea', paperLeft: '#e6dcc6', paperRight: '#f3ecdc', paperCrease: '#cdbf9f' };
  const PAL = [
    { groundBase: '#7fae6e', meadowLight: '#96c07c', terrace2: '#aed08c', meadowDark: '#6fa262', hillridge: '#5f9257', tuft: '#5f9257',
      riverWater: '#3f9aa6', riverDeep: '#2f7f86', sandBank: '#ecd9a8',
      treeLayers: ['#2f6b4f', '#3f8259', '#58a06a', '#7cba7a'], autumnTreeLayers: ['#c9552f', '#e8604a', '#f2924a', '#f2b545'],
      rockColor: '#8d9692', rockHighlight: '#b4bdb8', petalColor: '#fbf6ea',
      balloonColors: [[CORAL, GOLD], [TEAL, CREAM], ['#f2924a', '#fbf6ea']] },
    { groundBase: '#93bf9c', meadowLight: '#aad0ac', terrace2: '#c2debd', meadowDark: '#80b08c', hillridge: '#6fa27f', tuft: '#6fa27f',
      riverWater: '#58b0c0', riverDeep: '#3f97ad', sandBank: '#f1e3cf',
      treeLayers: ['#c2557a', '#d9708f', '#eb93aa', '#f7bccb'], autumnTreeLayers: ['#4f7f66', '#63967a', '#7dae90', '#9cc6a8'],
      rockColor: '#91949c', rockHighlight: '#b8bbc2', petalColor: '#f7bccb',
      balloonColors: [['#de6b8b', '#fde2e9'], ['#7392b7', CREAM], ['#f2924a', '#fbf6ea']] },
    { groundBase: '#5f8f86', meadowLight: '#73a398', terrace2: '#8ab6a9', meadowDark: '#528278', hillridge: '#467469', tuft: '#467469',
      riverWater: '#2f6f86', riverDeep: '#24566c', sandBank: '#c9d0c9',
      treeLayers: ['#1f4a44', '#2a5c54', '#397066', '#4c887b'], autumnTreeLayers: ['#b88b4a', '#cca05a', '#deb56d', '#edd092'],
      rockColor: '#697678', rockHighlight: '#93a2a4', petalColor: '#eaf3f4',
      balloonColors: [['#d16047', '#f0dfd8'], [GOLD, '#fbf6ea'], ['#457b9d', CREAM]] },
    { groundBase: '#2b2d5a', meadowLight: '#373c72', terrace2: '#444d88', meadowDark: '#25274e', hillridge: '#1f2148', tuft: '#1f2148',
      riverWater: '#26566a', riverDeep: '#1c4458', sandBank: '#4c5590',
      treeLayers: ['#171d40', '#212c58', '#2d3e72', '#3c538c'], autumnTreeLayers: ['#4f436e', '#625387', '#7866a1', '#9381bd'],
      rockColor: '#3a4462', rockHighlight: '#566384', petalColor: '#f6e7bf',
      balloonColors: [['#f2924a', '#f8d891'], ['#d96b98', '#ffd6e7'], [TEAL, CREAM]] },
  ];
  PAPER.PAL = PAL; PAPER.colors = { CREAM, CORAL, GOLD, TEAL, INK };
  PAPER.applyPalette = (biomes) => biomes.forEach((b, i) => Object.assign(b, PAL[i], paperPlane));

  // ---------- the valley floor as pre-cut tiles ----------
  // Water is the bottom sheet. Sand, the torn meadow banks (white core showing) and two terrace sheets are laid
  // over it. Every edge is a function of world y, so neighbouring tiles join without a seam.
  PAPER.makeGround = (riverC, riverW) => {
    const CH = 480, P = 48, HW = 1500, tiles = new Map(), nz = H.makeNoise(501);
    const hsh = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return s - Math.floor(s); };
    const TS = () => (window.innerWidth < 640 ? 0.6 : 0.75);
    const build = (bi, ci) => {
      const B = PAL[bi], ts = TS(), y0 = ci * CH - P, y1 = (ci + 1) * CH + P;
      const X0 = Math.round(riverC(ci * CH + CH / 2) / 64) * 64 - HW, X1 = X0 + HW * 2;
      const w = Math.ceil(HW * 2 * ts), h = Math.ceil((CH + 2 * P) * ts);
      const C = H.layer(w, h), c = C.getContext('2d');
      const sheet = (paint, d, o) => shadowDraw(c, paperize(w, h, (x) => { x.scale(ts, ts); x.translate(-X0, -y0); paint(x); }, { tex: 0, ...(o || {}) }), 0, 0, d, 0.42, ts * 1.25);
      const edge = (side, off, s, jit, sk) => {
        const pts = [];
        for (let k = Math.floor(y0 / s) - 2, k1 = Math.ceil(y1 / s) + 2; k <= k1; k++) { const y = k * s; pts.push([riverC(y) + side * off(y, side) + (hsh(k * 1.37 + sk + side * 9.1) - 0.5) * 2 * jit, y]); }
        return pts;
      };
      const both = (x, off, s, jit, sk) => {
        x.beginPath();
        poly(x, [...edge(-1, off, s, jit, sk), [X0 - 80, y1 + 200], [X0 - 80, y0 - 200]]);
        poly(x, [...edge(1, off, s, jit, sk), [X1 + 80, y1 + 200], [X1 + 80, y0 - 200]]);
        x.fill();
      };
      const tufts = (x, minOff, maxOff, col, sk) => {
        x.fillStyle = col; x.beginPath();
        const cell = 110;
        for (let gy = Math.floor(y0 / cell); gy <= Math.ceil(y1 / cell); gy++) for (let gx = Math.floor(X0 / cell); gx <= Math.ceil(X1 / cell); gx++) {
          const q = hsh(gx * 17.3 + gy * 91.7 + sk);
          if (q > 0.4) continue;
          const px = (gx + hsh(gx * 3.1 + gy * 7.7 + sk)) * cell, py = (gy + hsh(gx * 5.9 + gy * 2.3 + sk)) * cell;
          const off = Math.abs(px - riverC(py));
          if (off < minOff(py) || off > maxOff(py)) continue;
          const n = 2 + Math.floor(q * 7.4);
          for (let j = 0; j < n; j++) { const bx = px + j * 6; x.moveTo(bx, py); x.lineTo(bx + 2 + (hsh(bx + py) - 0.5) * 6, py - 8 - hsh(bx * 1.7 + py) * 9); x.lineTo(bx + 4.5, py); }
        }
        x.fill();
      };
      // 1 water (the backboard)
      c.fillStyle = B.riverWater; c.fillRect(0, 0, w, h);
      // 2 deep channel
      sheet((x) => { x.fillStyle = B.riverDeep; x.beginPath(); poly(x, [...edge(-1, (y) => riverW(y) * 0.42, 22, 1.2, 3), ...edge(1, (y) => riverW(y) * 0.42, 22, 1.2, 3).reverse()]); x.fill(); }, 0.2);
      // 3 sand
      sheet((x) => { x.fillStyle = B.sandBank; both(x, (y) => riverW(y), 20, 1.3, 7); }, 0.45);
      // 4 torn meadow banks: white fibrous core, then the green face set back from it
      const coreOff = (y, side) => riverW(y) + 20 + nz.fbm2(y * 0.03, side * 3.7, 4) * 5;
      const tornOff = (y, side) => coreOff(y, side) + 3.5 + Math.abs(nz.n2(y * 0.045, 3.1 + side)) * 8 + Math.abs(nz.n2(y * 0.3, 7.7 + side)) * 2;
      sheet((x) => {
        x.fillStyle = '#f5f0e5'; both(x, coreOff, 2.5, 0.6, 11);
        x.strokeStyle = 'rgba(248,244,236,0.95)'; x.lineCap = 'round';
        [-1, 1].forEach((side) => { for (let k = Math.floor(y0 / 2.5), k1 = Math.ceil(y1 / 2.5); k <= k1; k++) {
          const q = hsh(k * 0.731 + side);
          if (q > 0.55) continue;
          const y = k * 2.5, ex = riverC(y) + side * coreOff(y, side), a = (side < 0 ? 0 : Math.PI) + (hsh(k * 1.9 + side) - 0.5) * 1.8, l = 1.5 + q * 7;
          x.lineWidth = 0.4 + q; x.beginPath(); x.moveTo(ex + side, y); x.lineTo(ex + Math.cos(a) * l, y + Math.sin(a) * l); x.stroke();
        } });
        x.fillStyle = B.groundBase; both(x, tornOff, 2.5, 0, 13);
        tufts(x, (y) => riverW(y) + 60, () => 250, B.tuft, 1);
      }, 1.0);
      // 5 + 6 terraces: the meadow rising away from the river as stacked sheets
      const t1 = (y, side) => 260 + (side < 0 ? Math.sin(y * 0.004) * 75 : Math.cos(y * 0.0038) * 80);
      const t2 = (y, side) => 435 + (side < 0 ? Math.sin(y * 0.004 + 2) * 75 : Math.cos(y * 0.0038 + 1) * 80);
      sheet((x) => { x.fillStyle = B.meadowLight; both(x, t1, 26, 1.6, 17); tufts(x, (y) => 350, () => 400, B.meadowDark, 2); }, 0.55);
      sheet((x) => { x.fillStyle = B.terrace2; both(x, t2, 26, 1.6, 19); tufts(x, () => 540, () => 1e9, B.meadowLight, 3); }, 0.55);
      return { C, X0, ts, w, h };
    };
    const get = (bi, ci) => {
      const key = bi + ':' + ci + ':' + TS();
      let t = tiles.get(key);
      if (!t) {
        t = build(bi, ci); tiles.set(key, t);
        if (tiles.size > 16) { let far = null, fd = -1; for (const k of tiles.keys()) { const p = k.split(':'), d = +p[0] !== bi ? 1e9 : Math.abs(+p[1] - ci); if (d > fd) { fd = d; far = k; } } tiles.delete(far); }
      }
      return t;
    };
    return {
      draw(ctx, bi, viewTop, viewBottom, left, width) {
        ctx.fillStyle = PAL[bi].terrace2; ctx.fillRect(left, viewTop, width, viewBottom - viewTop);
        for (let ci = Math.floor(viewTop / CH); ci <= Math.floor(viewBottom / CH); ci++) {
          const t = get(bi, ci);
          ctx.drawImage(t.C, 0, P * t.ts, t.w, CH * t.ts, t.X0, ci * CH, HW * 2, CH + 0.6);
        }
      },
      // build at most one missing tile ahead of the flight so cutting never lands on a busy frame
      prewarm(bi, viewTop) { get(bi, Math.floor(viewTop / CH) - 1); },
      has(bi, ci) { return tiles.has(bi + ':' + ci + ':' + TS()); },
    };
  };
  // world-locked fibre over the whole floor (call inside the world transform)
  PAPER.fibre = (ctx, x, y, w, h) => {
    const pat = pattern(); pat.setTransform(new DOMMatrix().scaleSelf(1 / 1.5));
    ctx.fillStyle = pat; ctx.fillRect(x, y, w, h);
  };

  // ---------- baked sprites (texture + rim + drop shadow drawn once) ----------
  const SS = 1.5; // sprite pixels per world unit
  PAPER.SS = SS;
  const bake = (spr, d, sa = 0.45) => {
    const k = SS * 0.8, pad = Math.ceil((6 + d * 7) * k + (2 + d * 3.6) * k + 4);
    const C = H.layer(spr.width + pad * 2, spr.height + pad * 2);
    shadowDraw(C.getContext('2d'), spr, pad, pad, d, sa, k);
    return C;
  };
  // paint in world units centred on 0,0
  const cut = (size, paint, seed, o) => paperize(size * SS, size * SS, (c) => { c.translate(size * SS / 2, size * SS / 2); c.scale(SS, SS); paint(c); }, { seed, ...(o || {}) });
  // draw a baked sprite centred at x,y; s scales it
  PAPER.blit = (ctx, img, x, y, s = 1) => { const k = s / SS, w = img.width * k, h = img.height * k; ctx.drawImage(img, x - w / 2, y - h / 2, w, h); };

  // a tree from above = four stacked canopy sheets, each its own cut piece, drawn with parallax by the game
  PAPER.tree = (species, cols, Rb, variant) => cache('tree' + species + cols[0] + Rb + variant, () => {
    const r = H.rng(variant * 97 + Rb * 3 + species.length * 11), size = Rb * 2 + 14, tiers = [];
    for (let k = 0; k < 4; k++) {
      const rr = Rb * (1 - k * 0.23);
      let parts;
      if (species === 'conifer') {
        const n = 11 - k * 2, a0 = r() * TAU, pts = [];
        for (let j = 0; j < n * 2; j++) { const a = a0 + (j / (n * 2)) * TAU, q = (j % 2 ? rr * 0.6 : rr) + r.gauss() * 0.5; pts.push([Math.cos(a) * q, Math.sin(a) * q]); }
        parts = [pts];
      } else {
        const n = species === 'poplar' ? 5 : 8 - k, a0 = r() * TAU;
        parts = [circPts(r, 0, 0, rr * 0.72, 7, 0.35)];
        for (let j = 0; j < n; j++) { const a = a0 + (j / n) * TAU; parts.push(circPts(r, Math.cos(a) * rr * 0.62, Math.sin(a) * rr * 0.62, rr * r.range(0.34, 0.44), 6, 0.35)); }
      }
      const spr = cut(size, (c) => { c.fillStyle = cols[k]; blobPath(c, parts); c.fill(); }, 31 + k * 7 + variant);
      tiers.push({ img: bake(spr, k ? 0.6 : 1.5), hf: 0.3 + (0.7 * k) / 3, sw: k * 0.35 });
    }
    return tiers;
  });
  PAPER.rock = (cols, Rb, variant) => cache('rock' + cols[0] + Rb + variant, () => {
    const size = Rb * 2 + 10, tiers = [];
    for (let k = 0; k < 3; k++) {
      const rad = Rb * (1 - k * 0.24), pts = [];
      for (let v = 0; v < 7; v++) { const a = (v / 7) * TAU + variant * 0.9, q = rad * (0.82 + (v % 2) * 0.22); pts.push([Math.cos(a) * q, Math.sin(a) * q]); }
      tiers.push({ img: bake(cut(size, (c) => { c.fillStyle = k === 2 ? cols[1] : k === 1 ? H.rgba(H.mix(cols[0], cols[1], 0.4)) : cols[0]; c.beginPath(); poly(c, pts); c.fill(); }, 41 + k), k ? 0.5 : 1), h: k * 18 });
    }
    return tiers;
  });
  PAPER.windmill = (Rb) => cache('mill' + Rb, () => {
    const r = H.rng(5), size = Rb * 2.6 + 10;
    const disc = (rad, col, d, seed) => bake(cut(size, (c) => { c.fillStyle = col; c.beginPath(); poly(c, circPts(r, 0, 0, rad, 7, 0.35)); c.fill(); }, seed), d);
    const sails = bake(cut(size, (c) => {
      for (let b = 0; b < 4; b++) { c.rotate(Math.PI / 2); c.fillStyle = '#8a5a36'; c.fillRect(-1.4, -Rb * 1.15, 2.8, Rb * 1.15); c.fillStyle = '#fbf6ea'; c.fillRect(2, -Rb * 1.1, 9, Rb * 0.78); }
    }, 53), 0.6);
    return { base: disc(Rb * 0.58, '#e2d7bf', 1.2, 51), top: disc(Rb * 0.42, '#fbf6ea', 0.6, 52), sails, cap: disc(Rb * 0.26, CORAL, 0.4, 54) };
  });
  PAPER.balloon = (c1, c2, R) => cache('bal' + c1 + c2 + R, () => {
    const size = R * 2 + 10, r = H.rng(9);
    const C = H.layer(size * SS, size * SS), x = C.getContext('2d');
    shadowDraw(x, cut(size, (c) => { c.fillStyle = c1; c.beginPath(); poly(c, circPts(r, 0, 0, R, 8, 0.4)); c.fill(); }, 61), 0, 0, 0);
    shadowDraw(x, cut(size, (c) => { c.fillStyle = c2; for (let i = 0; i < 4; i++) { const a = (i * TAU) / 4 + 0.2; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R * 0.985, a, a + TAU / 8); c.closePath(); c.fill(); } }, 62), 0, 0, 0.25, 0.4, SS * 0.8);
    shadowDraw(x, cut(size, (c) => { c.fillStyle = c1; c.beginPath(); poly(c, circPts(r, 0, 0, R * 0.24, 5, 0.3)); c.fill(); }, 63), 0, 0, 0.35, 0.4, SS * 0.8);
    return bake(C, 1.2);
  });
  // wind ring: a gold annulus with three lighter swirl strips glued on (the swirl is its own piece so it can turn)
  PAPER.ring = () => cache('ring', () => {
    const r = H.rng(5), size = 100;
    const band = bake(cut(size, (c) => { c.fillStyle = GOLD; c.beginPath(); poly(c, circPts(r, 0, 0, 44, 6, 0.4)); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); poly(c, circPts(r, 0, 0, 33, 6, 0.4)); c.fill(); }, 71), 0.9, 0.5);
    const swirl = bake(cut(size, (c) => { c.strokeStyle = '#f8d891'; c.lineWidth = 5; c.lineCap = 'butt'; for (let i = 0; i < 3; i++) { const a = (i * TAU) / 3; c.beginPath(); c.arc(0, 0, 20, a, a + 1.25); c.stroke(); } }, 72), 0.4, 0.45);
    return { band, swirl, R: 44 };
  });
  PAPER.burst = () => cache('burst', () => bake(cut(150, (c) => { c.fillStyle = GOLD; c.beginPath(); for (let i = 0; i < 32; i++) { const a = (i / 32) * TAU, rr = i % 2 ? 42 : 70; i ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); }, 13), 0.7));
  PAPER.cloud = (variant) => cache('cloud' + variant, () => {
    const r = H.rng(60 + variant), parts = [], s = 100, w = 380, h = 260;
    [[-1.0, 0.1, 0.5], [-0.45, -0.2, 0.66], [0.2, -0.3, 0.74], [0.82, -0.05, 0.56], [0.3, 0.3, 0.6], [-0.4, 0.3, 0.52]].forEach(([bx, by, br]) => parts.push(circPts(r, w / 2 + bx * s, h / 2 + by * s, br * s * r.range(0.9, 1.1), 12, 0.5)));
    const spr = paperize(w, h, (c) => { c.fillStyle = '#f4efe6'; blobPath(c, parts); c.fill(); }, { seed: 60 + variant });
    const C = H.layer(w + 60, h + 70); shadowDraw(C.getContext('2d'), spr, 20, 20, 1.6, 0.3, 1.4);
    return C;
  });

  // ---------- paper pass: anything drawn as flat vectors between begin and end becomes one cut sheet ----------
  let passC = null, tmpC = null;
  PAPER.passBegin = (main) => {
    const w = main.canvas.width, h = main.canvas.height;
    if (!passC || passC.width !== w || passC.height !== h) { passC = H.layer(w, h); tmpC = H.layer(w, h); }
    const lc = passC.getContext('2d');
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalAlpha = 1; lc.globalCompositeOperation = 'source-over'; lc.shadowColor = 'transparent';
    lc.clearRect(0, 0, w, h);
    lc.setTransform(main.getTransform());
    return lc;
  };
  // o: depth (shadow height), k (device pixels per reference pixel), ax/ay (world point the fibre sticks to), rim
  PAPER.passEnd = (main, lc, o = {}) => {
    const w = passC.width, h = passC.height, k = o.k || 1, T = lc.getTransform();
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalAlpha = 1;
    const pat = pattern();
    pat.setTransform(T.translate(o.ax || 0, o.ay || 0).scale(1 / 1.5));
    lc.globalCompositeOperation = 'source-atop'; lc.fillStyle = pat; lc.fillRect(0, 0, w, h);
    if (o.rim !== false) {
      const tc = tmpC.getContext('2d');
      const edge = (col, dx, dy) => {
        tc.globalCompositeOperation = 'copy'; tc.drawImage(passC, 0, 0);
        tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, w, h);
        tc.globalCompositeOperation = 'destination-out'; tc.drawImage(passC, dx, dy);
        lc.drawImage(tmpC, 0, 0);
      };
      edge('rgba(255,247,232,0.38)', 1.3 * k, 1.6 * k); edge('rgba(0,0,0,0.28)', -1.1 * k, -1.3 * k);
    }
    lc.globalCompositeOperation = 'source-over';
    main.save(); main.setTransform(1, 0, 0, 1, 0, 0);
    shadowDraw(main, passC, 0, 0, o.depth ?? 0.5, o.sa ?? 0.45, k);
    main.restore();
  };

  // ---------- photo finish: lamp light, vignette, grain (reference strengths; grain from pre-made tiles at 12 fps) ----------
  let grains = null;
  const grainTiles = () => grains || (grains = [0, 1, 2, 3].map((i) => {
    const S = 256, C = H.layer(S, S), x = C.getContext('2d'), img = x.createImageData(S, S), d = img.data, r = H.rng(900 + i), amt = 0.03 * 255;
    for (let p = 0; p < d.length; p += 4) { const n = (r() - 0.5) * amt; d[p] = d[p + 1] = d[p + 2] = n > 0 ? 255 : 0; d[p + 3] = Math.abs(n) / 127 * 255; }
    x.putImageData(img, 0, 0);
    return x.createPattern(C, 'repeat');
  }));
  PAPER.finish = (ctx, w, h, time) => {
    const sx = w / 1280, sy = h / 720, s = Math.max(sx, sy);
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const lg = ctx.createRadialGradient(260 * sx, 60 * sy, 40 * s, 420 * sx, 200 * sy, 1100 * s);
    lg.addColorStop(0, 'rgba(255,236,200,1)'); lg.addColorStop(0.5, 'rgba(255,230,200,0.25)'); lg.addColorStop(1, 'rgba(0,0,20,0.6)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);
    const lp = ctx.createRadialGradient(w * 0.56, h * 0.46, 20 * s, w * 0.56, h * 0.46, 560 * s);
    lp.addColorStop(0, 'rgba(255,214,160,0.42)'); lp.addColorStop(1, 'rgba(255,214,160,0)');
    ctx.fillStyle = lp; ctx.fillRect(0, 0, w, h); ctx.restore();
    H.vignette(ctx, w, h, 0.42, '10,6,24');
    const f = Math.floor(time * 12), r = H.rng(9 + f), pat = grainTiles()[f & 3];
    pat.setTransform(new DOMMatrix().translateSelf(Math.floor(r() * 256), Math.floor(r() * 256)));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = pat; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
  };

  // fibre texture for the DOM cards (title, HUD tags, landing card)
  PAPER.textureURL = () => { try { return pkTex().toDataURL('image/png'); } catch (e) { return ''; } };
  Object.assign(PAPER, { poly, circPts, cutLines, paperize, shadowDraw, cache });
})();
