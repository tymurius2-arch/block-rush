// Игры 46–65: спорт и головоломки
(() => {
const A = G.add;
const secs = v => { v = Math.round(v); return Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0'); };

/* 46 Мини-гольф */
A({ id: 'golf', name: 'Мини-гольф', e: '⛳', cat: 'spo', low: true, how: 'Потяни от мяча назад и отпусти — удар. Загони мяч в лунку. 9 лунок, чем меньше ударов — тем лучше.' }, k => {
  const { W, H } = k; let hole = 0, ball, cup, walls, drag = null, strokes = 0, sink = 0, hs = 0;
  function level() {
    hole++; hs = 0; ball = { x: W / 2, y: H - 70, vx: 0, vy: 0 }; cup = { x: k.R(60, W - 60), y: k.R(60, 140) }; walls = [];
    const n = Math.min(1 + hole, 6);
    for (let i = 0; i < n; i++) { const w = k.R(60, W * .5), h = 18, x = k.R(10, W - w - 10), y = k.R(190, H - 160); walls.push({ x, y, w: i % 3 === 2 ? h : w, h: i % 3 === 2 ? k.R(60, 140) : h }); }
    if (hole > 3) walls.push({ x: k.R(20, W - 120), y: k.R(cup.y + 40, H * .45), w: 100, h: 16, m: k.R(60, 120) });
  }
  level();
  return {
    down(x, y) { if (Math.hypot(ball.vx, ball.vy) < 5 && !sink) drag = { x, y }; },
    move(x, y, p) { if (drag && p) { drag.cx = x; drag.cy = y; } },
    up(x, y) { if (!drag) return; const dx = drag.x - x, dy = drag.y - y, d = Math.min(180, Math.hypot(dx, dy)); if (d > 10) { const a = Math.atan2(dy, dx); ball.vx = Math.cos(a) * d * 6; ball.vy = Math.sin(a) * d * 6; strokes++; hs++; k.set(strokes); k.sfx('hit'); } drag = null; },
    update(dt) {
      if (sink) { sink -= dt; if (sink <= 0) { if (hole >= 9) return k.win('Все 9 лунок за ' + strokes + ' ударов!'); level(); } return; }
      walls.forEach(w => { if (w.m) { w.x += w.m * dt; if (w.x < 0 || w.x + w.w > W) w.m *= -1; } });
      const n = 4;
      for (let i = 0; i < n; i++) {
        ball.x += ball.vx * dt / n; ball.y += ball.vy * dt / n;
        if (ball.x < 8 || ball.x > W - 8) { ball.vx *= -1; ball.x = k.clamp(ball.x, 8, W - 8); k.sfx('tap'); }
        if (ball.y < 8 || ball.y > H - 8) { ball.vy *= -1; ball.y = k.clamp(ball.y, 8, H - 8); k.sfx('tap'); }
        for (const w of walls) if (ball.x + 8 > w.x && ball.x - 8 < w.x + w.w && ball.y + 8 > w.y && ball.y - 8 < w.y + w.h) {
          const ox = Math.min(ball.x + 8 - w.x, w.x + w.w - ball.x + 8), oy = Math.min(ball.y + 8 - w.y, w.y + w.h - ball.y + 8);
          if (ox < oy) { ball.vx *= -1; ball.x += ball.x < w.x + w.w / 2 ? -ox : ox; } else { ball.vy *= -1; ball.y += ball.y < w.y + w.h / 2 ? -oy : oy; }
          k.sfx('tap');
        }
      }
      const f = Math.pow(.35, dt); ball.vx *= f; ball.vy *= f; if (Math.hypot(ball.vx, ball.vy) < 6) ball.vx = ball.vy = 0;
      const d = Math.hypot(ball.x - cup.x, ball.y - cup.y), s = Math.hypot(ball.vx, ball.vy);
      if (d < 12 && s < 500) { sink = 1; k.sfx('win'); k.toast(hs === 1 ? 'С одного удара!' : 'В лунке! Ударов: ' + hs, '#ffd84d'); ball.x = cup.x; ball.y = cup.y; ball.vx = ball.vy = 0; }
      else if (d < 30 && s > 0) { ball.vx += (cup.x - ball.x) * 3 * dt; ball.vy += (cup.y - ball.y) * 3 * dt; }
    },
    draw() {
      k.clear('#3f9e4a'); for (let y = 0; y < H; y += 40) k.rect(0, y, W, 20, 'rgba(255,255,255,.04)');
      walls.forEach(w => k.rect(w.x, w.y, w.w, w.h, '#8a5a2b', 5));
      k.circ(cup.x, cup.y, 13, '#111'); k.line(cup.x, cup.y, cup.x, cup.y - 40, '#eee', 2); k.poly([[cup.x, cup.y - 40], [cup.x + 20, cup.y - 33], [cup.x, cup.y - 26]], '#ff3b5b');
      if (drag && drag.cx !== undefined) { const dx = drag.x - drag.cx, dy = drag.y - drag.cy, d = Math.min(180, Math.hypot(dx, dy)), a = Math.atan2(dy, dx); k.ctx.setLineDash([5, 6]); k.line(ball.x, ball.y, ball.x + Math.cos(a) * d * 1.2, ball.y + Math.sin(a) * d * 1.2, '#fff', 3); k.ctx.setLineDash([]); }
      if (!sink) { k.circ(ball.x + 2, ball.y + 3, 8, 'rgba(0,0,0,.25)'); k.circ(ball.x, ball.y, 8, '#fff'); }
      k.text('Лунка ' + hole + '/9', W / 2, 20, 16, 'rgba(255,255,255,.8)');
    }
  };
});

/* 47 Баскетбол */
A({ id: 'basket', name: 'Баскетбол', e: '🏀', cat: 'spo', how: 'Смахни мяч вверх к кольцу. Чем сильнее смахнёшь — тем дальше полетит. 3 промаха — конец.' }, k => {
  const { W, H } = k, R = 22, sx = W / 2, sy = H - 80; let b, hx = W / 2, hy = H * .3, hd = 1, start = null, misses = 0, scored = false, flash = 0;
  const rimW = 70; const reset = () => { b = { x: sx, y: sy, vx: 0, vy: 0, fly: false, s: 1 }; scored = false; };
  reset();
  return {
    down(x, y) { if (!b.fly && Math.hypot(x - b.x, y - b.y) < 90) start = { x, y, t: k.t }; },
    up(x, y) { if (!start) return; const dx = x - start.x, dy = y - start.y, dt = Math.max(.05, k.t - start.t); start = null; if (dy > -30) return; b.fly = true; b.vx = k.clamp(dx / dt * .5, -500, 500); b.vy = k.clamp(dy / dt * .7, -H * 1.9, -H * .9); k.sfx('jump'); },
    update(dt) {
      flash = Math.max(0, flash - dt);
      if (k.score >= 5) { hx += hd * (40 + k.score * 4) * dt; if (hx < rimW || hx > W - rimW) hd *= -1; }
      if (!b.fly) return;
      const oy = b.y; b.vy += H * 1.6 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.s = Math.max(.7, b.s - dt * .25);
      for (const rx of [hx - rimW / 2, hx + rimW / 2]) { const dx = b.x - rx, dy = b.y - hy, d = Math.hypot(dx, dy); if (d < R * b.s + 4 && b.vy > 0) { const nx = dx / d, ny = dy / d, dot = b.vx * nx + b.vy * ny; b.vx -= 1.6 * dot * nx; b.vy -= 1.6 * dot * ny; b.x = rx + nx * (R * b.s + 4); b.y = hy + ny * (R * b.s + 4); k.sfx('hit'); } }
      if (!scored && b.vy > 0 && oy < hy && b.y >= hy && Math.abs(b.x - hx) < rimW / 2 - 6) { scored = true; k.add(); k.sfx('point'); flash = .6; }
      if (b.y > H + 40 || b.x < -40 || b.x > W + 40) { if (!scored) { misses++; k.sfx('bad'); if (misses >= 3) return k.over(); } reset(); }
    },
    draw() {
      k.clear('#c9864a'); k.rect(0, H - 40, W, 40, '#a5683a');
      k.rect(hx - 55, hy - 90, 110, 75, '#fff', 4); k.srect(hx - 22, hy - 50, 44, 34, '#e33', 3);
      if (!(b.fly && b.vy > 0 && b.y > hy)) { k.emo('🏀', b.x, b.y, R * 2 * b.s); }
      k.line(hx - rimW / 2, hy, hx + rimW / 2, hy, '#ff4d1a', 5);
      for (let i = 0; i < 5; i++) k.line(hx - rimW / 2 + i * rimW / 4, hy, hx - rimW / 2 + 10 + i * (rimW - 20) / 4, hy + 34, 'rgba(255,255,255,.8)', 1.5);
      if (b.fly && b.vy > 0 && b.y > hy) k.emo('🏀', b.x, b.y, R * 2 * b.s);
      if (flash) k.text('ЧИСТО!', W / 2, H * .55, 36, '#fff');
      for (let i = 0; i < 3; i++) k.emo(i < 3 - misses ? '🏀' : '⚫', 20 + i * 24, 20, 16);
    }
  };
});

/* 48 Лучник */
A({ id: 'archery', name: 'Лучник', e: '🏹', cat: 'spo', how: 'Потяни пальцем назад от лучника и отпусти. Учитывай ветер и гравитацию. 10 стрел.' }, k => {
  const { W, H } = k, ax = 50, ay = H * .6; let tgt, wind, arrows = 10, arrow = null, drag = null, stuck = [], msg = '';
  const newT = () => { tgt = { x: W - k.R(40, 90), y: k.R(H * .25, H * .75), r: 40, vy: k.score > 15 ? k.R(30, 70) : 0 }; wind = k.R(-60, 60) * Math.min(1, k.score / 10); };
  newT();
  return {
    down(x, y) { if (!arrow) drag = { x, y, cx: x, cy: y }; }, move(x, y, p) { if (drag && p) { drag.cx = x; drag.cy = y; } },
    up() { if (!drag) return; const dx = drag.x - drag.cx, dy = drag.y - drag.cy, d = Math.min(160, Math.hypot(dx, dy)); if (d > 15) { const a = Math.atan2(dy, dx); arrow = { x: ax, y: ay, vx: Math.cos(a) * d * 5.5, vy: Math.sin(a) * d * 5.5 }; arrows--; k.sfx('tap'); } drag = null; },
    update(dt) {
      if (tgt.vy) { tgt.y += tgt.vy * dt; if (tgt.y < H * .2 || tgt.y > H * .8) tgt.vy *= -1; }
      if (!arrow) return;
      arrow.vy += 400 * dt; arrow.vx += wind * dt; arrow.x += arrow.vx * dt; arrow.y += arrow.vy * dt;
      if (arrow.x >= tgt.x - 6 && arrow.x <= tgt.x + 8 && Math.abs(arrow.y - tgt.y) < tgt.r) {
        const d = Math.abs(arrow.y - tgt.y), pts = d < 8 ? 10 : d < 20 ? 5 : d < 32 ? 3 : 1; k.add(pts); k.sfx(pts >= 5 ? 'point' : 'hit'); k.toast('+' + pts, pts === 10 ? '#ffd84d' : '#fff'); arrow = null; newT(); stuck = [];
      } else if (arrow.x > W + 20 || arrow.y > H + 20 || arrow.x < -20) { arrow = null; k.sfx('bad'); k.toast('Мимо', '#ff8a9a'); }
      if (!arrow && arrows <= 0) k.after(.4, () => k.over('Стрелы кончились'));
    },
    draw() {
      k.clear('#a6dcff'); k.rect(0, H * .85, W, H * .15, '#5fb04a');
      k.rect(tgt.x, tgt.y - tgt.r, 10, tgt.r * 2, '#fff', 3); [[32, '#3a7bd5'], [20, '#ff3b3b'], [8, '#ffd84d']].forEach(([r, c]) => k.rect(tgt.x, tgt.y - r, 10, r * 2, c, 3));
      k.emo('🏹', ax, ay, 40);
      if (drag) { const dx = drag.x - drag.cx, dy = drag.y - drag.cy, d = Math.min(160, Math.hypot(dx, dy)), a = Math.atan2(dy, dx); let x = ax, y = ay, vx = Math.cos(a) * d * 5.5, vy = Math.sin(a) * d * 5.5; for (let i = 0; i < 18; i++) { for (let j = 0; j < 3; j++) { vy += 400 * .01; vx += wind * .01; x += vx * .01; y += vy * .01; } k.circ(x, y, 2.5, 'rgba(0,0,0,.35)'); } }
      if (arrow) { const a = Math.atan2(arrow.vy, arrow.vx); k.line(arrow.x - Math.cos(a) * 30, arrow.y - Math.sin(a) * 30, arrow.x, arrow.y, '#5a3a1a', 3); k.circ(arrow.x, arrow.y, 3, '#555'); }
      k.text('Ветер ' + (wind > 0 ? '→' : '←') + ' ' + Math.abs(Math.round(wind / 6)), W / 2, 22, 16, '#134');
      k.text('Стрел: ' + arrows, 60, 22, 16, '#134');
    }
  };
});

/* 49 Боулинг */
A({ id: 'bowling', name: 'Боулинг', e: '🎳', cat: 'spo', how: 'Смахни шар вверх по дорожке. Направление смахивания — куда покатится шар. 10 фреймов по 2 броска.' }, k => {
  const { W, H } = k, lw = Math.min(W * .7, 260), lx = (W - lw) / 2, pr = 9; let pins, ball, frame = 1, roll = 1, start = null, wait = 0, downPins = 0;
  function setPins() { pins = []; const top = H * .15; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) pins.push({ x: W / 2 + (i - r / 2) * 30, y: top + (3 - r) * 26, vx: 0, vy: 0, down: false }); }
  const rb = () => ball = { x: W / 2, y: H - 60, vx: 0, vy: 0, go: false };
  setPins(); rb();
  return {
    down(x, y) { if (!ball.go && !wait) start = { x, y, t: k.t }; },
    move(x, y, p) { if (start && p && !ball.go) ball.x = k.clamp(x, lx + 14, lx + lw - 14); },
    up(x, y) { if (!start) return; const dx = x - start.x, dy = y - start.y, dt = Math.max(.05, k.t - start.t); start = null; if (dy > -40) return; const sp = k.clamp(-dy / dt, 500, 1500); const a = Math.atan2(dy, dx); ball.vx = Math.cos(a) * sp * .25; ball.vy = -sp; ball.go = true; k.sfx('hit'); },
    update(dt) {
      if (wait) { wait -= dt; if (wait <= 0) { wait = 0; next(); } return; }
      const all = ball.go ? [ball, ...pins] : pins;
      for (const p of pins) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.pow(.2, dt); p.vy *= Math.pow(.2, dt); if (p.x < lx || p.x > lx + lw) p.down = true; }
      if (ball.go) {
        ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        if (ball.x < lx + 10 || ball.x > lx + lw - 10) { ball.vx = 0; ball.x = k.clamp(ball.x, lx + 10, lx + lw - 10); }
        if (ball.y < -30) { ball.go = false; wait = 1.2; }
      }
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const a = all[i], b = all[j], r = (a === ball ? 16 : pr) + pr, dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy); if (d < r && d > 0) { const nx = dx / d, ny = dy / d, rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv < 0) { const ma = a === ball ? 5 : 1, imp = -2 * rv / (ma + 1); b.vx += nx * imp * ma; b.vy += ny * imp * ma; if (a !== ball) { a.vx -= nx * imp; a.vy -= ny * imp; } } b.down = true; if (a !== ball) a.down = true; if (Math.random() < .5) k.sfx('pop'); } }
    },
    draw() {
      k.clear('#2a1a10'); k.rect(lx - 14, 0, lw + 28, H, '#3a3a44'); k.rect(lx, 0, lw, H, '#e9c68f');
      for (let i = 1; i < 8; i++) k.rect(lx + i * lw / 8, 0, 1, H, 'rgba(0,0,0,.08)');
      pins.forEach(p => { if (p.down && (Math.hypot(p.vx, p.vy) < 5 || p.x < lx || p.x > lx + lw)) { k.ctx.globalAlpha = .35; } k.circ(p.x, p.y, pr, '#fff'); k.circ(p.x, p.y, pr * .45, '#e33'); k.ctx.globalAlpha = 1; });
      if (ball.y > -30) { k.circ(ball.x, ball.y, 16, '#2a3fb0'); k.circ(ball.x - 4, ball.y - 5, 2.5, '#111'); k.circ(ball.x + 3, ball.y - 6, 2.5, '#111'); }
      k.text('Фрейм ' + frame + '/10 · бросок ' + roll, W / 2, H - 16, 15, '#fff');
    }
  };
  function next() {
    const n = pins.filter(p => p.down).length;
    if (roll === 1) {
      if (n === 10) { k.add(20); k.toast('СТРАЙК!', '#ffd84d'); k.sfx('win'); return endFrame(); }
      k.add(n); downPins = n; roll = 2; pins = pins.filter(p => !p.down).map(p => ({ ...p, vx: 0, vy: 0 })); rb();
    } else {
      if (downPins + n === 10) { k.add(n + 5); k.toast('СПЭР!', '#7df9ff'); k.sfx('win'); } else k.add(n);
      endFrame();
    }
  }
  function endFrame() { if (frame >= 10) return k.over('Игра окончена'); frame++; roll = 1; downPins = 0; setPins(); rb(); }
});

/* 50 Дартс */
A({ id: 'darts', name: 'Дартс', e: '🎯', cat: 'spo', how: 'Прицел качается. Нажми, чтобы бросить дротик. Узкие кольца: внешнее ×2, внутреннее ×3. Центр — 50. 15 дротиков.' }, k => {
  const { W, H } = k, cx = W / 2, cy = H * .45, R = Math.min(W, H) * .4, N = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]; let left = 15, darts = [], ph = k.R(0, 6);
  function value(x, y) { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) / R; if (d > 1) return 0; if (d < .05) return 50; if (d < .11) return 25; let a = Math.atan2(dy, dx) * 180 / Math.PI + 90 + 9; a = ((a % 360) + 360) % 360; const n = N[Math.floor(a / 18)]; if (d > .58 && d < .65) return n * 3; if (d > .93) return n * 2; return n; }
  const aim = () => { const s = .7 + (15 - left) * .03; return [cx + Math.sin(k.t * 1.3 * s + ph) * R * .55 + Math.sin(k.t * 3.1) * R * .12, cy + Math.sin(k.t * 2.1 * s + ph) * R * .45 + Math.cos(k.t * 2.7) * R * .1]; };
  return {
    down() { if (left <= 0) return; const [x, y] = aim(), v = value(x, y); darts.push([x, y]); left--; k.add(v); k.sfx(v >= 40 ? 'win' : v ? 'hit' : 'bad'); k.toast(v ? '+' + v : 'Мимо', v >= 40 ? '#ffd84d' : '#fff'); if (darts.length > 3) darts.shift(); if (left <= 0) k.after(.8, () => k.over('Сумма очков')); },
    draw() {
      k.clear('#2b1e14'); const c = k.ctx;
      k.circ(cx, cy, R * 1.12, '#111');
      for (let i = 0; i < 20; i++) { const a0 = (i * 18 - 99) * Math.PI / 180, a1 = a0 + 18 * Math.PI / 180, alt = i % 2; [[1, alt ? '#e33' : '#2a2'], [.93, alt ? '#111' : '#f3e2c0'], [.65, alt ? '#e33' : '#2a2'], [.58, alt ? '#111' : '#f3e2c0']].forEach(([r, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R * r, a0, a1); c.fill(); }); k.text(N[i], cx + Math.cos((a0 + a1) / 2) * R * 1.06, cy + Math.sin((a0 + a1) / 2) * R * 1.06, 12, '#fff'); }
      k.circ(cx, cy, R * .11, '#2a2'); k.circ(cx, cy, R * .05, '#e33');
      darts.forEach(([x, y]) => { k.line(x, y, x + 10, y + 16, '#ffd84d', 3); k.circ(x, y, 3, '#fff'); });
      if (left > 0) { const [x, y] = aim(); k.ring(x, y, 12, '#fff', 2); k.line(x - 18, y, x + 18, y, '#fff', 1.5); k.line(x, y - 18, x, y + 18, '#fff', 1.5); }
      k.text('Дротиков: ' + left, W / 2, H - 30, 18);
    }
  };
});

/* 51 Пенальти */
A({ id: 'penalty', name: 'Пенальти', e: '🥅', cat: 'spo', how: 'Смахни от мяча в сторону ворот — туда полетит удар. Обмани вратаря! 3 промаха — конец.' }, k => {
  const { W, H } = k, gw = W * .8, gx = (W - gw) / 2, gy = H * .2, gh = H * .16; let ball, kp, start = null, res = 0, miss = 0, txt = '';
  const reset = () => { ball = { x: W / 2, y: H * .78, s: 1, go: false, t: 0 }; kp = { x: W / 2, y: gy + gh * .6, tx: W / 2, dive: 0 }; txt = ''; };
  reset();
  return {
    down(x, y) { if (!ball.go && !res) start = { x, y }; },
    up(x, y) { if (!start) return; const dx = x - start.x, dy = y - start.y; start = null; if (dy > -30) return; const tx = W / 2 + dx * (H * .58 / -dy), ty = gy + gh - Math.min(gh * 1.3, -dy * .35); ball = { ...ball, go: true, sx: ball.x, sy: ball.y, tx, ty, t: 0 }; const guess = Math.random() < .45 + Math.min(.25, k.score * .02) ? tx : k.R(gx + 20, gx + gw - 20); kp.tx = k.clamp(guess, gx + 25, gx + gw - 25); k.sfx('hit'); },
    update(dt) {
      if (res) { res -= dt; if (res <= 0) { res = 0; if (miss >= 3) return k.over(); reset(); } return; }
      kp.x += k.clamp(kp.tx - kp.x, -(260 + k.score * 10) * dt, (260 + k.score * 10) * dt);
      if (!ball.go) { kp.tx = W / 2 + Math.sin(k.t * 2) * gw * .15; return; }
      ball.t += dt * 1.8; const t = Math.min(1, ball.t); ball.x = ball.sx + (ball.tx - ball.sx) * t; ball.y = ball.sy + (ball.ty - ball.sy) * t - Math.sin(t * Math.PI) * 30; ball.s = 1 - t * .45;
      if (t >= 1) {
        const inGoal = ball.x > gx + 8 && ball.x < gx + gw - 8 && ball.y > gy + 6;
        const saved = Math.abs(ball.x - kp.x) < 42 && Math.abs(ball.y - kp.y) < 50;
        if (inGoal && !saved) { k.add(); k.sfx('point'); txt = 'ГОЛ!'; } else { miss++; k.sfx('bad'); txt = saved ? 'Вратарь взял!' : 'Мимо!'; }
        res = 1.2;
      }
    },
    draw() {
      k.clear('#3fa34d'); for (let y = 0; y < H; y += 50) k.rect(0, y, W, 25, 'rgba(255,255,255,.05)');
      k.rect(gx - 6, gy - 6, gw + 12, 6, '#fff'); k.rect(gx - 6, gy - 6, 6, gh + 6, '#fff'); k.rect(gx + gw, gy - 6, 6, gh + 6, '#fff');
      for (let x = gx; x < gx + gw; x += 14) k.line(x, gy, x, gy + gh, 'rgba(255,255,255,.3)', 1); for (let y = gy; y < gy + gh; y += 14) k.line(gx, y, gx + gw, y, 'rgba(255,255,255,.3)', 1);
      k.emo('🧤', kp.x, kp.y, 54);
      k.ctx.fillStyle = 'rgba(255,255,255,.7)'; k.ctx.beginPath(); k.ctx.ellipse(W / 2, H * .78 + 14, 30, 6, 0, 0, 7); k.ctx.fill();
      k.emo('⚽', ball.x, ball.y, 40 * ball.s);
      if (txt) k.text(txt, W / 2, H * .5, 40);
      for (let i = 0; i < 3; i++) k.emo(i < 3 - miss ? '⚽' : '❌', 20 + i * 24, H - 20, 16);
    }
  };
});

/* 52 Бумажка в урну */
A({ id: 'papertoss', name: 'В урну', e: '🗑️', cat: 'spo', how: 'Смахни бумажку вверх к урне. Учитывай ветер вентилятора! 3 промаха — конец.' }, k => {
  const { W, H } = k; let bin = { x: W / 2, y: H * .3 }, wind = 0, p, start = null, miss = 0, res = 0;
  const reset = () => { p = { x: W / 2, y: H * .85, go: false, t: 0 }; wind = k.score < 2 ? 0 : k.R(-1, 1) * Math.min(3, .5 + k.score * .25); bin.x = k.score < 4 ? W / 2 : k.R(W * .25, W * .75); };
  reset();
  return {
    down(x, y) { if (!p.go && !res) start = { x, y }; },
    up(x, y) { if (!start) return; const dx = x - start.x, dy = y - start.y; start = null; if (dy > -30) return; p.go = true; p.vx = dx / -dy; p.t = 0; k.sfx('tap'); },
    update(dt) {
      if (res) { res -= dt; if (res <= 0) { res = 0; if (miss >= 3) return k.over(); reset(); } return; }
      if (!p.go) return;
      p.t += dt * 1.1; const t = Math.min(1, p.t);
      p.x = W / 2 + p.vx * (H * .55) * t + wind * 40 * t * t; p.y = H * .85 - (H * .55) * t - Math.sin(t * Math.PI) * H * .18;
      if (t >= 1) { if (Math.abs(p.x - bin.x) < 26) { k.add(); k.sfx('point'); k.toast('Есть!', '#7dff8a'); } else { miss++; k.sfx('bad'); k.toast('Мимо', '#ff8a9a'); } res = .8; }
    },
    draw() {
      k.clear('#ece6da'); k.rect(0, H * .35, W, H * .65, '#cdbfa6');
      k.emo('🗑️', bin.x, bin.y, 64);
      if (wind) { k.emo('🌀', wind > 0 ? 30 : W - 30, H * .2, 40); k.text((wind > 0 ? '→ ' : '← ') + Math.abs(wind).toFixed(1), W / 2, 30, 20, '#345'); }
      const t = p.go ? Math.min(1, p.t) : 0; k.circ(p.x, p.y, 16 * (1 - t * .5), '#fff'); k.ring(p.x, p.y, 16 * (1 - t * .5), '#bbb', 2);
      for (let i = 0; i < 3; i++) k.emo(i < 3 - miss ? '📄' : '❌', 20 + i * 24, H - 20, 16);
    }
  };
});

/* 53 Точное время */
A({ id: 'timing', name: 'Точное время', e: '⏱️', cat: 'spo', how: 'Стрелка бегает туда-сюда. Нажми, когда она в зелёной зоне. С каждым разом сложнее!' }, k => {
  const { W, H } = k, bx = 30, bw = W - 60, by = H * .5; let pos = 0, dir = 1, z, sp = .6, fx = 0;
  const nz = () => { const w = Math.max(.05, .25 - k.score * .012); z = { a: k.R(0, 1 - w), w }; };
  nz();
  return {
    down() { if (pos >= z.a && pos <= z.a + z.w) { const perfect = Math.abs(pos - (z.a + z.w / 2)) < z.w * .15; k.add(perfect ? 2 : 1); k.sfx(perfect ? 'win' : 'point'); if (perfect) k.toast('Идеально!', '#ffd84d'); fx = .3; sp += .07; nz(); } else { k.sfx('bad'); k.over('Мимо!'); } },
    update(dt) { pos += dir * sp * dt; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } fx = Math.max(0, fx - dt); },
    draw() {
      k.clear(fx ? '#1f3d2a' : '#15122b'); k.rect(bx, by - 20, bw, 40, '#2a2268', 10);
      k.rect(bx + z.a * bw, by - 20, z.w * bw, 40, '#47d873', 6); k.rect(bx + (z.a + z.w * .35) * bw, by - 20, z.w * .3 * bw, 40, '#9bff8a', 4);
      k.rect(bx + pos * bw - 3, by - 34, 6, 68, '#fff', 3);
      k.text(k.score, W / 2, H * .3, 64);
    }
  };
});

/* 54 2048 */
A({ id: 'g2048', name: '2048', e: '🔢', cat: 'puz', how: 'Проводи пальцем в любую сторону — все плитки сдвигаются. Одинаковые числа сливаются. Собери 2048!' }, k => {
  const N = 4, g = k.fit(N, N, 60, 40, 16), cs = g.cs; let b = Array.from({ length: N }, () => Array(N).fill(0)), anim = [], won = false;
  const CO = { 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' };
  function add() { const e = []; b.forEach((r, y) => r.forEach((v, x) => { if (!v) e.push([x, y]); })); if (!e.length) return; const [x, y] = k.pick(e); b[y][x] = Math.random() < .9 ? 2 : 4; anim.push({ x, y, t: 0 }); }
  add(); add();
  function slide(row) { const a = row.filter(v => v), out = []; let gained = 0; for (let i = 0; i < a.length; i++) { if (a[i] === a[i + 1]) { out.push(a[i] * 2); gained += a[i] * 2; i++; } else out.push(a[i]); } while (out.length < N) out.push(0); return [out, gained]; }
  function canMove() { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (!b[y][x]) return true; if (x < N - 1 && b[y][x] === b[y][x + 1]) return true; if (y < N - 1 && b[y][x] === b[y + 1][x]) return true; } return false; }
  return {
    swipe(d) {
      const old = JSON.stringify(b); let gained = 0;
      for (let i = 0; i < N; i++) {
        let line = []; for (let j = 0; j < N; j++) line.push(d === 'L' ? b[i][j] : d === 'R' ? b[i][N - 1 - j] : d === 'U' ? b[j][i] : b[N - 1 - j][i]);
        const [o, gg] = slide(line); gained += gg;
        for (let j = 0; j < N; j++) { const v = o[j]; if (d === 'L') b[i][j] = v; else if (d === 'R') b[i][N - 1 - j] = v; else if (d === 'U') b[j][i] = v; else b[N - 1 - j][i] = v; }
      }
      if (JSON.stringify(b) === old) return;
      k.add(gained); k.sfx(gained ? 'pop' : 'tap'); add();
      if (!won && b.some(r => r.includes(2048))) { won = true; k.toast('2048! 🎉', '#ffd84d'); k.sfx('win'); }
      if (!canMove()) k.over('Нет ходов');
    },
    update(dt) { anim.forEach(a => a.t += dt * 6); anim = anim.filter(a => a.t < 1); },
    draw() {
      k.clear('#faf8ef'); k.rect(g.x - 8, g.y - 8, cs * N + 16, cs * N + 16, '#bbada0', 12);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const v = b[y][x], a = anim.find(a => a.x === x && a.y === y), s = a ? .5 + a.t * .5 : 1, pad = cs * .06 + (1 - s) * cs / 2;
        k.rect(g.x + x * cs + cs * .06, g.y + y * cs + cs * .06, cs * .88, cs * .88, '#cdc1b4', 8);
        if (v) { k.rect(g.x + x * cs + pad, g.y + y * cs + pad, cs - pad * 2, cs - pad * 2, CO[v] || '#3c3a32', 8); k.text(v, g.x + x * cs + cs / 2, g.y + y * cs + cs / 2, cs * (v < 100 ? .42 : v < 1000 ? .34 : .27) * s, v <= 4 ? '#776e65' : '#fff'); }
      }
      k.text('Проводи пальцем', k.W / 2, k.H - 20, 14, '#bbada0');
    }
  };
});

/* 55 Блоки 8×8 */
A({ id: 'blocks', name: 'Блоки 8×8', e: '🧩', cat: 'puz', how: 'Перетаскивай фигуры на поле. Заполни ряд или столбец целиком — он исчезнет. Не дай полю заполниться!' }, k => {
  const N = 8, RAW = ["X", "XX", "X\nX", "XXX", "X\nX\nX", "XXXX", "X\nX\nX\nX", "XXXXX", "X\nX\nX\nX\nX", "XX\nXX", "XX\nXX", "XXX\nXXX\nXXX", "XX\nX.", "XX\n.X", "X.\nXX", ".X\nXX", "XXX\nX..", "XXX\n..X", "X..\nXXX", "..X\nXXX", "XXX\n.X.", ".X.\nXXX", "X.\nXX\nX.", ".X\nXX\n.X", "XX.\n.XX", ".XX\nXX.", "XXX\nX..\nX..", "XXX\n..X\n..X", "X..\nX..\nXXX"];
  const SH = RAW.map(s => { const rows = s.split('\n'), c = []; rows.forEach((r, y) => [...r].forEach((ch, x) => ch === 'X' && c.push([x, y]))); return { c, w: Math.max(...rows.map(r => r.length)), h: rows.length }; });
  const g = k.fit(N, N, 10, k.H * .28, 14), cs = g.cs; let grid = Array.from({ length: N }, () => Array(N).fill(-1)), tray, drag = null, pops = [], streak = 0;
  const fits = (s, cx, cy) => s.c.every(([x, y]) => { const X = cx + x, Y = cy + y; return X >= 0 && Y >= 0 && X < N && Y < N && grid[Y][X] < 0; });
  const anyFit = s => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (fits(s, x, y)) return true; return false; };
  function newTray() { for (let t = 0; t < 30; t++) { tray = [0, 1, 2].map(() => ({ s: SH[k.RI(0, SH.length - 1)], c: k.pick(k.C) })); if (tray.some(p => anyFit(p.s))) break; } }
  newTray();
  const ty = k.H - k.H * .14, slotX = i => k.W * (i + .5) / 3;
  return {
    down(x, y) { if (y < ty - k.H * .12) return; const i = Math.floor(x / (k.W / 3)); if (tray[i]) drag = { i, x, y, pos: null }; },
    move(x, y, p) { if (!drag || !p) return; drag.x = x; drag.y = y; const s = tray[drag.i].s, fx = x - s.w * cs / 2, fy = y - s.h * cs - cs * 1.2, cx = Math.round((fx - g.x) / cs), cy = Math.round((fy - g.y) / cs); drag.pos = fits(s, cx, cy) ? [cx, cy] : null; },
    up() {
      if (!drag) return; const d = drag; drag = null; if (!d.pos) return;
      const p = tray[d.i]; p.s.c.forEach(([x, y]) => grid[d.pos[1] + y][d.pos[0] + x] = p.c); tray[d.i] = null; k.add(p.s.c.length);
      const rows = [], cols = []; for (let i = 0; i < N; i++) { if (grid[i].every(v => v >= 0)) rows.push(i); if (grid.every(r => r[i] >= 0)) cols.push(i); }
      const n = rows.length + cols.length;
      if (n) { streak++; rows.forEach(r => { for (let x = 0; x < N; x++) { pops.push({ x, y: r, c: grid[r][x], t: 0 }); } }); cols.forEach(c => { for (let y = 0; y < N; y++) pops.push({ x: c, y, c: grid[y][c], t: 0 }); }); rows.forEach(r => grid[r].fill(-1)); cols.forEach(c => grid.forEach(r => r[c] = -1)); k.add(n * n * 10 * streak); k.sfx('win'); if (n > 1 || streak > 1) k.toast(n > 1 ? ['', '', 'Отлично!', 'Супер!', 'Мега!'][Math.min(n, 4)] : 'Комбо x' + streak, '#ffd84d'); } else { streak = 0; k.sfx('hit'); }
      if (tray.every(t => !t)) newTray();
      if (!tray.some(t => t && anyFit(t.s))) k.over('Нет места');
    },
    update(dt) { pops.forEach(p => p.t += dt * 3); pops = pops.filter(p => p.t < 1); },
    draw() {
      k.clear('#1a1347'); k.rect(g.x - 6, g.y - 6, cs * N + 12, cs * N + 12, '#120d33', 12);
      let hl = new Set(), prev = null;
      if (drag && drag.pos) { const s = tray[drag.i].s, tmp = grid.map(r => r.slice()); s.c.forEach(([x, y]) => tmp[drag.pos[1] + y][drag.pos[0] + x] = 9); prev = tmp; for (let i = 0; i < N; i++) { if (tmp[i].every(v => v >= 0)) for (let x = 0; x < N; x++) hl.add(i * N + x); if (tmp.every(r => r[i] >= 0)) for (let y = 0; y < N; y++) hl.add(y * N + i); } }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const X = g.x + x * cs + 2, Y = g.y + y * cs + 2, v = grid[y][x], col = drag ? tray[drag.i].c : null;
        if (hl.has(y * N + x)) k.block(X, Y, cs - 4, col); else if (v >= 0) k.block(X, Y, cs - 4, v); else if (prev && prev[y][x] === 9) { k.ctx.globalAlpha = .45; k.block(X, Y, cs - 4, col); k.ctx.globalAlpha = 1; } else k.rect(X, Y, cs - 4, cs - 4, '#2a2268', 6);
      }
      pops.forEach(p => { const s = (cs - 4) * (1 - p.t); k.ctx.globalAlpha = 1 - p.t; k.block(g.x + p.x * cs + cs / 2 - s / 2, g.y + p.y * cs + cs / 2 - s / 2, s, p.c); k.ctx.globalAlpha = 1; });
      tray.forEach((p, i) => { if (!p || (drag && drag.i === i)) return; const s = Math.min(cs * .55, k.H * .14 / 5), ok = anyFit(p.s); k.ctx.globalAlpha = ok ? 1 : .35; p.s.c.forEach(([x, y]) => k.block(slotX(i) - p.s.w * s / 2 + x * s, ty - p.s.h * s / 2 + y * s, s - 2, p.c)); k.ctx.globalAlpha = 1; });
      if (drag) { const p = tray[drag.i], fx = drag.x - p.s.w * cs / 2, fy = drag.y - p.s.h * cs - cs * 1.2; p.s.c.forEach(([x, y]) => k.block(fx + x * cs + 2, fy + y * cs + 2, cs - 4, p.c)); }
    }
  };
});

/* 56 Три в ряд */
A({ id: 'match3', name: 'Три в ряд', e: '💎', cat: 'puz', how: 'Меняй соседние камни местами (проведи пальцем от камня). Собирай 3 и больше в ряд. 30 ходов.' }, k => {
  const N = 8, E = ['💎', '🍀', '🔥', '⭐', '🍇', '🌙'], g = k.fit(N, N, 50, 10, 10), cs = g.cs; let b, moves = 30, busy = 0, sel = null, startC = null, combo = 0;
  const rnd = () => ({ t: k.RI(0, 5), oy: 0 });
  function init() { b = Array.from({ length: N }, () => Array.from({ length: N }, rnd)); while (find().length) find().forEach(([x, y]) => b[y][x] = rnd()); if (!hasMove()) init(); }
  function find() { const s = new Set(); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const t = b[y][x].t; if (x < N - 2 && b[y][x + 1].t === t && b[y][x + 2].t === t) [0, 1, 2].forEach(i => s.add((x + i) + ',' + y)); if (y < N - 2 && b[y + 1][x].t === t && b[y + 2][x].t === t) [0, 1, 2].forEach(i => s.add(x + ',' + (y + i))); } return [...s].map(v => v.split(',').map(Number)); }
  function swap(a, c) { const t = b[a[1]][a[0]]; b[a[1]][a[0]] = b[c[1]][c[0]]; b[c[1]][c[0]] = t; }
  function hasMove() { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) { if (x + dx >= N || y + dy >= N) continue; swap([x, y], [x + dx, y + dy]); const ok = find().length > 0; swap([x, y], [x + dx, y + dy]); if (ok) return true; } return false; }
  init();
  function resolve() {
    const m = find(); if (!m.length) { combo = 0; if (moves <= 0) k.over('Ходы кончились'); else if (!hasMove()) { k.toast('Перемешиваю...'); init(); } return; }
    combo++; k.add(m.length * 10 * combo); k.sfx('pop'); if (combo > 1) k.toast('Каскад x' + combo, '#ffd84d');
    m.forEach(([x, y]) => b[y][x] = null);
    for (let x = 0; x < N; x++) { let w = N - 1; for (let y = N - 1; y >= 0; y--) if (b[y][x]) { const c = b[y][x]; b[y][x] = null; c.oy += (w - y) * cs; b[w][x] = c; w--; } for (let y = w; y >= 0; y--) { const c = rnd(); c.oy = (w + 1) * cs + 20; b[y][x] = c; } }
    busy = .35; k.after(.35, resolve);
  }
  function tryswap(a, c) { if (busy || moves <= 0) return; if (c[0] < 0 || c[1] < 0 || c[0] >= N || c[1] >= N) return; swap(a, c); if (find().length) { moves--; k.sfx('tap'); resolve(); } else { swap(a, c); k.sfx('bad'); } sel = null; }
  return {
    down(x, y) { startC = k.cell(g, x, y); },
    swipe(d) { if (!startC) return; const v = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] }[d]; tryswap(startC, [startC[0] + v[0], startC[1] + v[1]]); startC = null; },
    tap(x, y) { const c = k.cell(g, x, y); if (!c) return; if (sel && Math.abs(sel[0] - c[0]) + Math.abs(sel[1] - c[1]) === 1) tryswap(sel, c); else sel = c; },
    update(dt) { busy = Math.max(0, busy - dt); b.forEach(r => r.forEach(c => { if (c && c.oy > 0) c.oy = Math.max(0, c.oy - dt * 900); })); },
    draw() {
      k.clear('#22184f'); k.rect(g.x - 6, g.y - 6, cs * N + 12, cs * N + 12, '#170f3a', 12);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if ((x + y) % 2) k.rect(g.x + x * cs, g.y + y * cs, cs, cs, 'rgba(255,255,255,.04)'); const c = b[y][x]; if (c) k.emo(E[c.t], g.x + x * cs + cs / 2, g.y + y * cs + cs / 2 - c.oy, cs * .72); }
      if (sel) k.srect(g.x + sel[0] * cs + 2, g.y + sel[1] * cs + 2, cs - 4, cs - 4, '#fff', 3, 8);
      k.text('Ходов: ' + moves, k.W / 2, 24, 20, moves <= 5 ? k.P.r : '#fff');
    }
  };
});

/* 57 Сапёр */
A({ id: 'mines', name: 'Сапёр', e: '💣', cat: 'puz', low: true, fmt: secs, how: 'Открывай клетки. Цифра — сколько мин рядом. Кнопкой 🚩 внизу переключай режим флажков. Открой всё без мин!' }, k => {
  const C = 9, R = 12, M = 18, g = k.fit(C, R, 6, 70, 8), cs = g.cs; let b = null, flag = false, time = 0, started = false, lost = null, btn;
  const nb = (x, y) => { const o = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if ((dx || dy) && X >= 0 && Y >= 0 && X < C && Y < R) o.push([X, Y]); } return o; };
  function gen(sx, sy) { b = Array.from({ length: R }, () => Array.from({ length: C }, () => ({ m: false, o: false, f: false, n: 0 }))); let n = 0; while (n < M) { const x = k.RI(0, C - 1), y = k.RI(0, R - 1); if (b[y][x].m || (Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1)) continue; b[y][x].m = true; n++; } for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) b[y][x].n = nb(x, y).filter(([X, Y]) => b[Y][X].m).length; }
  function open(x, y) { const st = [[x, y]]; while (st.length) { const [a, c] = st.pop(), cell = b[c][a]; if (cell.o || cell.f) continue; cell.o = true; if (!cell.n && !cell.m) st.push(...nb(a, c)); } }
  return {
    tap(x, y) {
      if (k.inb(btn, x, y)) { flag = !flag; k.sfx('tap'); return; }
      const c = k.cell(g, x, y); if (!c || lost) return; const [cx, cy] = c;
      if (!b) { gen(cx, cy); started = true; }
      const cell = b[cy][cx];
      if (flag && !cell.o) { cell.f = !cell.f; k.sfx('tap'); return; }
      if (cell.f) return;
      if (cell.o && cell.n) { const fl = nb(cx, cy).filter(([X, Y]) => b[Y][X].f).length; if (fl === cell.n) for (const [X, Y] of nb(cx, cy)) { if (!b[Y][X].f && !b[Y][X].o) { if (b[Y][X].m) { lost = [X, Y]; k.sfx('boom'); return k.over('Бум!'); } open(X, Y); } } return; }
      if (cell.m) { lost = [cx, cy]; k.sfx('boom'); return k.over('Бум!'); }
      open(cx, cy); k.sfx('pop');
      if (b.every(r => r.every(c => c.o || c.m))) { k.set(Math.round(time)); k.win('Разминировано!'); }
    },
    update(dt) { if (started && !lost) { time += dt; k.set(Math.floor(time)); } },
    draw() {
      k.clear('#1c2533'); const NC = ['', '#4aa3ff', '#47d873', '#ff5d73', '#b07bff', '#ffa53d', '#35e0d0', '#fff', '#aaa'];
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
        const X = g.x + x * cs + 1, Y = g.y + y * cs + 1, c = b && b[y][x];
        if (c && c.o) { k.rect(X, Y, cs - 2, cs - 2, '#d8dee8', 4); if (c.n) k.text(c.n, X + cs / 2 - 1, Y + cs / 2, cs * .55, NC[c.n].replace('#fff', '#333')); }
        else { k.rect(X, Y, cs - 2, cs - 2, '#5b6b85', 4); k.rect(X, Y, cs - 2, 4, 'rgba(255,255,255,.2)', 2); if (c && c.f) k.emo('🚩', X + cs / 2, Y + cs / 2, cs * .6); }
        if (lost && c && c.m) k.emo('💣', X + cs / 2, Y + cs / 2, cs * .65);
      }
      btn = k.btn(k.W / 2 - 90, k.H - 60, 180, 48, flag ? '🚩 Ставлю флажки' : '⛏️ Открываю', flag ? '#ff5d73' : 'rgba(255,255,255,.15)');
      k.text('Мин: ' + M, 50, k.H - 36, 14, k.P.dim);
    }
  };
});

/* 58 Судоку */
A({ id: 'sudoku', name: 'Судоку', e: '9️⃣', cat: 'puz', low: true, fmt: secs, how: 'Выбери клетку и нажми цифру внизу. В каждой строке, столбце и квадрате 3×3 цифры 1–9 без повторов. 3 ошибки — конец.' }, k => {
  const g = k.fit(9, 9, 10, k.H * .22, 8), cs = g.cs; let sol, puz, cur, sel = null, mist = 0, time = 0, pad = [], bad = null;
  function solve(a, cnt) { for (let i = 0; i < 81; i++) if (!a[i]) { const r = Math.floor(i / 9), c = i % 9, nums = k.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]); let total = 0; for (const n of nums) { if (ok(a, r, c, n)) { a[i] = n; const res = solve(a, cnt); if (cnt) { total += res; if (total > 1) { a[i] = 0; return total; } } else if (res) return 1; a[i] = 0; } } return cnt ? total : 0; } return 1; }
  function ok(a, r, c, n) { for (let i = 0; i < 9; i++) { if (a[r * 9 + i] === n || a[i * 9 + c] === n) return false; } const br = r - r % 3, bc = c - c % 3; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) if (a[(br + y) * 9 + bc + x] === n) return false; return true; }
  sol = Array(81).fill(0); solve(sol, false);
  puz = sol.slice(); const order = k.shuffle([...Array(81).keys()]); let removed = 0;
  for (const i of order) { if (removed >= 46) break; const v = puz[i]; puz[i] = 0; if (solve(puz.slice(), true) !== 1) puz[i] = v; else removed++; }
  cur = puz.slice();
  return {
    tap(x, y) {
      const c = k.cell(g, x, y); if (c) { sel = c[1] * 9 + c[0]; k.sfx('tap'); return; }
      for (const p of pad) if (k.inb(p, x, y) && sel !== null && !puz[sel]) {
        if (p.n === 0) { cur[sel] = 0; return; }
        if (sol[sel] === p.n) { cur[sel] = p.n; k.sfx('pop'); if (cur.every((v, i) => v === sol[i])) { k.set(Math.round(time)); k.win('Решено!'); } }
        else { mist++; bad = { i: sel, n: p.n, t: .8 }; k.sfx('bad'); if (mist >= 3) k.over('3 ошибки'); }
      }
    },
    update(dt) { time += dt; k.set(Math.floor(time)); if (bad) { bad.t -= dt; if (bad.t <= 0) bad = null; } },
    draw() {
      k.clear('#f5f3ee'); const sv = sel !== null ? cur[sel] : 0;
      for (let i = 0; i < 81; i++) {
        const r = Math.floor(i / 9), c = i % 9, X = g.x + c * cs, Y = g.y + r * cs;
        let bg = '#fff'; if (sel !== null) { const sr = Math.floor(sel / 9), sc = sel % 9; if (r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3))) bg = '#e6ecf7'; if (sv && cur[i] === sv) bg = '#c9d8f5'; if (i === sel) bg = '#a9c3f5'; }
        k.rect(X, Y, cs, cs, bg);
        if (bad && bad.i === i) k.text(bad.n, X + cs / 2, Y + cs / 2 + 1, cs * .6, '#e33');
        else if (cur[i]) k.text(cur[i], X + cs / 2, Y + cs / 2 + 1, cs * .6, puz[i] ? '#222' : '#2a5bd7', 'center', puz[i] ? 800 : 600);
      }
      for (let i = 0; i <= 9; i++) { const w = i % 3 ? 1 : 2.5; k.line(g.x + i * cs, g.y, g.x + i * cs, g.y + cs * 9, '#333', w); k.line(g.x, g.y + i * cs, g.x + cs * 9, g.y + i * cs, '#333', w); }
      pad = []; const pw = (k.W - 24) / 5, py = g.y + cs * 9 + 16, ph = Math.min(54, (k.H - py - 20) / 2 - 6);
      for (let n = 1; n <= 10; n++) { const i = n - 1, x = 12 + (i % 5) * pw, y = py + Math.floor(i / 5) * (ph + 8), done = n < 10 && cur.filter(v => v === n).length === 9; const b = k.btn(x + 3, y, pw - 6, ph, n === 10 ? '⌫' : n, done ? '#ddd' : '#2a5bd7', done ? '#aaa' : '#fff', 24); b.n = n === 10 ? 0 : n; pad.push(b); }
      k.text('Ошибки: ' + mist + '/3', k.W - 12, g.y + cs * 9 + 6, 12, '#a33', 'right');
    }
  };
});

/* 59 Пятнашки */
A({ id: 'fifteen', name: 'Пятнашки', e: '🔲', cat: 'puz', low: true, how: 'Нажимай на фишки рядом с пустой клеткой, чтобы двигать. Расставь числа от 1 до 15 по порядку.' }, k => {
  const N = 4, g = k.fit(N, N, 40, 40, 16), cs = g.cs; let b = [...Array(15).keys()].map(i => i + 1).concat(0), moves = 0;
  const idx = v => b.indexOf(v);
  function mv(i) { const e = idx(0), er = Math.floor(e / N), ec = e % N, r = Math.floor(i / N), c = i % N; if (r === er && c !== ec) { const s = Math.sign(c - ec); for (let x = ec; x !== c; x += s) { b[r * N + x] = b[r * N + x + s]; } b[i] = 0; return true; } if (c === ec && r !== er) { const s = Math.sign(r - er); for (let y = er; y !== r; y += s) { b[y * N + c] = b[(y + s) * N + c]; } b[i] = 0; return true; } return false; }
  for (let i = 0; i < 300; i++) { const e = idx(0), opts = []; if (e % N) opts.push(e - 1); if (e % N < N - 1) opts.push(e + 1); if (e >= N) opts.push(e - N); if (e < N * N - N) opts.push(e + N); mv(k.pick(opts)); }
  return {
    tap(x, y) { const c = k.cell(g, x, y); if (!c) return; if (mv(c[1] * N + c[0])) { moves++; k.set(moves); k.sfx('tap'); if (b.slice(0, 15).every((v, i) => v === i + 1)) k.win('Собрано за ' + moves + ' ходов!'); } },
    draw() {
      k.clear('#2b2140'); k.rect(g.x - 8, g.y - 8, cs * N + 16, cs * N + 16, '#1a1330', 14);
      b.forEach((v, i) => { if (!v) return; const x = g.x + (i % N) * cs, y = g.y + Math.floor(i / N) * cs, okp = v === i + 1; k.rect(x + 4, y + 4, cs - 8, cs - 8, okp ? '#47d873' : '#ffa53d', 12); k.rect(x + 4, y + cs - 14, cs - 8, 10, 'rgba(0,0,0,.18)', 6); k.text(v, x + cs / 2, y + cs / 2, cs * .4, '#fff'); });
    }
  };
});

/* 60 Выключи свет */
A({ id: 'lightsout', name: 'Выключи свет', e: '💡', cat: 'puz', how: 'Нажатие переключает лампу и её соседей крестом. Выключи все лампы! Каждый уровень сложнее.' }, k => {
  const N = 5, g = k.fit(N, N, 60, 40, 20), cs = g.cs; let b, lvl = 0, moves = 0;
  const press = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < N && Y < N) b[Y][X] ^= 1; });
  function level() { lvl++; moves = 0; b = Array.from({ length: N }, () => Array(N).fill(0)); for (let i = 0; i < 2 + lvl * 2; i++) press(k.RI(0, N - 1), k.RI(0, N - 1)); if (b.every(r => r.every(v => !v))) press(2, 2); }
  level();
  return {
    tap(x, y) { const c = k.cell(g, x, y); if (!c) return; press(c[0], c[1]); moves++; k.sfx('tap'); if (b.every(r => r.every(v => !v))) { k.add(1); k.sfx('win'); k.toast('Уровень ' + lvl + ' пройден!', '#ffd84d'); k.after(.8, level); } },
    draw() {
      k.clear('#111020');
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const on = b[y][x], X = g.x + x * cs, Y = g.y + y * cs; if (on) k.circ(X + cs / 2, Y + cs / 2, cs * .55, 'rgba(255,220,80,.15)'); k.rect(X + 5, Y + 5, cs - 10, cs - 10, on ? '#ffd84d' : '#2a2840', 12); }
      k.text('Уровень ' + lvl + ' · ходов ' + moves, k.W / 2, 30, 18, k.P.dim);
    }
  };
});

/* 61 Заливка */
A({ id: 'flood', name: 'Заливка', e: '🌊', cat: 'puz', how: 'Нажимай цвет внизу — область из левого верхнего угла перекрашивается и растёт. Залей всё поле одним цветом за 22 хода!' }, k => {
  const N = 12, C = k.C.slice(0, 6), g = k.fit(N, N, 40, 90, 10), cs = g.cs; let b = Array.from({ length: N }, () => Array.from({ length: N }, () => k.RI(0, 5))), moves = 0, btns = [], lvl = 1;
  function fill(c) { const o = b[0][0]; if (o === c) return; const st = [[0, 0]], seen = new Set(); while (st.length) { const [x, y] = st.pop(), key = y * N + x; if (seen.has(key) || x < 0 || y < 0 || x >= N || y >= N || b[y][x] !== o) continue; seen.add(key); b[y][x] = c; st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); } }
  const done = () => b.every(r => r.every(v => v === b[0][0]));
  return {
    tap(x, y) { for (const bt of btns) if (k.inb(bt, x, y) && bt.c !== b[0][0]) { fill(bt.c); moves++; k.sfx('pop'); if (done()) { k.add(Math.max(1, 23 - moves)); k.sfx('win'); k.toast('Уровень пройден! +' + Math.max(1, 23 - moves), '#ffd84d'); lvl++; moves = 0; b = Array.from({ length: N }, () => Array.from({ length: N }, () => k.RI(0, 5))); } else if (moves >= 22) k.over('Ходы кончились'); } },
    draw() {
      k.clear('#1a1a2a');
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) k.rect(g.x + x * cs, g.y + y * cs, cs + .5, cs + .5, C[b[y][x]]);
      btns = []; const bw = Math.min(56, (k.W - 30) / 6);
      C.forEach((c, i) => { const bx = k.W / 2 - bw * 3 + i * bw + 3, by = k.H - 70; k.rect(bx, by, bw - 6, bw - 6, c, 12); if (i === b[0][0]) k.srect(bx - 2, by - 2, bw - 2, bw - 2, '#fff', 3, 14); btns.push({ x: bx, y: by, w: bw - 6, h: bw - 6, c: i }); });
      k.text('Уровень ' + lvl + ' · ход ' + moves + '/22', k.W / 2, 22, 18);
    }
  };
});

/* 62 Обвал */
A({ id: 'collapse', name: 'Обвал', e: '🟨', cat: 'puz', how: 'Нажимай на группы из 2+ одинаковых кубиков. Чем больше группа — тем больше очков. Очисти поле!' }, k => {
  const C = 10, R = 13, g = k.fit(C, R, 20, 10, 8), cs = g.cs, COL = [k.P.r, k.P.y, k.P.g, k.P.b]; let b = Array.from({ length: C }, () => Array.from({ length: R }, () => k.RI(0, 3))), hov = null;
  const get = (x, y) => b[x] && b[x][y] !== undefined ? b[x][y] : -1;
  function group(x, y) { const c = get(x, y); if (c < 0) return []; const st = [[x, y]], seen = new Set(), out = []; while (st.length) { const [a, d] = st.pop(), key = a * 100 + d; if (seen.has(key) || get(a, d) !== c) continue; seen.add(key); out.push([a, d]); st.push([a + 1, d], [a - 1, d], [a, d + 1], [a, d - 1]); } return out; }
  const cellAt = (x, y) => { const c = k.cell(g, x, y); return c ? [c[0], R - 1 - c[1]] : null; };
  function anyMove() { for (let x = 0; x < b.length; x++) for (let y = 0; y < b[x].length; y++) if (group(x, y).length > 1) return true; return false; }
  return {
    tap(x, y) {
      const c = cellAt(x, y); if (!c) return; const gr = group(c[0], c[1]); if (gr.length < 2) { k.sfx('bad'); return; }
      gr.sort((a, d) => d[1] - a[1]).forEach(([a, d]) => b[a].splice(d, 1)); b = b.filter(col => col.length);
      k.add((gr.length - 1) * (gr.length - 1) * 5); k.sfx('pop');
      if (!b.length) { k.add(500); return k.win('Поле чистое! +500'); }
      if (!anyMove()) k.over('Ходов нет');
    },
    draw() {
      k.clear('#13112a'); k.rect(g.x - 4, g.y - 4, cs * C + 8, cs * R + 8, '#0c0a1f', 8);
      b.forEach((col, x) => col.forEach((v, y) => k.block(g.x + x * cs + 1, g.y + (R - 1 - y) * cs + 1, cs - 2, COL[v])));
    }
  };
});

/* 63 Сокобан */
A({ id: 'sokoban', name: 'Сокобан', e: '📦', cat: 'puz', how: 'Проводи пальцем, чтобы ходить. Толкай ящики на отмеченные места. Тянуть ящики нельзя! Кнопки: ↶ отмена, ⟲ заново.' }, k => {
  const L = [
    ["#######", "#.  $ #", "#  @  #", "# $  .#", "#######"],
    ["####", "# .#", "#  ###", "#*@  #", "#  $ #", "#  ###", "####"],
    ["######", "#    #", "# #@ #", "# $* #", "# .* #", "#    #", "######"],
    ["  ####", "###  ####", "#     $ #", "# #  #$ #", "# . .#@ #", "#########"],
    ["########", "#      #", "# .**$@#", "#      #", "#####  #", "    ####"],
    [" #######", " #     #", " # .$. #", "## $@$ #", "#  .$. #", "#      #", "########"],
    ["########", "#  .   #", "# $#$  #", "#  . # #", "## $.  #", " # @   #", " #######"],
    ["#######", "#.    #", "# $$$ #", "#.$@ .#", "#  .  #", "#######"]
  ];
  let lvl = k.load('lvl', 0) % L.length, map, pl, boxes, hist, btnU, btnR, g, H2;
  function load() { const m = L[lvl]; H2 = m.length; const W2 = Math.max(...m.map(r => r.length)); g = k.fit(W2, H2, 40, 70, 10); map = []; boxes = []; hist = []; m.forEach((row, y) => { map.push([]); for (let x = 0; x < W2; x++) { const ch = row[x] || ' '; map[y][x] = ch === '#' ? '#' : '.+*'.includes(ch) ? 'g' : ' '; if ('$*'.includes(ch)) boxes.push([x, y]); if ('@+'.includes(ch)) pl = [x, y]; } }); }
  load();
  const boxAt = (x, y) => boxes.findIndex(b => b[0] === x && b[1] === y);
  const won = () => boxes.every(([x, y]) => map[y][x] === 'g');
  return {
    swipe(d) {
      const [dx, dy] = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] }[d], nx = pl[0] + dx, ny = pl[1] + dy;
      if (map[ny][nx] === '#') return; const bi = boxAt(nx, ny);
      if (bi >= 0) { const bx = nx + dx, by = ny + dy; if (map[by][bx] === '#' || boxAt(bx, by) >= 0) return; hist.push([pl.slice(), boxes.map(b => b.slice())]); boxes[bi] = [bx, by]; k.sfx('hit'); } else { hist.push([pl.slice(), boxes.map(b => b.slice())]); k.sfx('tap'); }
      pl = [nx, ny];
      if (won()) { k.add(); k.sfx('win'); lvl++; k.save('lvl', lvl % L.length); if (lvl >= L.length) { lvl = 0; return k.win('Все уровни пройдены!'); } k.toast('Уровень ' + (lvl + 1), '#ffd84d'); k.after(.6, load); }
    },
    tap(x, y) { if (k.inb(btnU, x, y) && hist.length) { const h = hist.pop(); pl = h[0]; boxes = h[1]; k.sfx('tap'); } if (k.inb(btnR, x, y)) load(); },
    draw() {
      k.clear('#2a2236'); const cs = g.cs;
      map.forEach((row, y) => row.forEach((c, x) => { const X = g.x + x * cs, Y = g.y + y * cs; if (c === '#') k.rect(X, Y, cs, cs, '#7a4f3a'); else { k.rect(X, Y, cs, cs, '#d9cbb0'); if (c === 'g') k.circ(X + cs / 2, Y + cs / 2, cs * .18, '#e33'); } }));
      boxes.forEach(([x, y]) => { const on = map[y][x] === 'g'; k.rect(g.x + x * cs + 3, g.y + y * cs + 3, cs - 6, cs - 6, on ? '#47d873' : '#c58a3a', 6); k.srect(g.x + x * cs + 7, g.y + y * cs + 7, cs - 14, cs - 14, 'rgba(0,0,0,.25)', 2, 3); });
      k.emo('🧑', g.x + pl[0] * cs + cs / 2, g.y + pl[1] * cs + cs / 2, cs * .8);
      k.text('Уровень ' + (lvl + 1) + '/' + L.length, k.W / 2, 22, 18);
      btnU = k.btn(k.W / 2 - 110, k.H - 60, 100, 46, '↶ Отмена'); btnR = k.btn(k.W / 2 + 10, k.H - 60, 100, 46, '⟲ Заново');
    }
  };
});

/* 64 Трубы */
A({ id: 'pipes', name: 'Трубы', e: '🔧', cat: 'puz', how: 'Нажимай на клетки, чтобы поворачивать трубы. Соедини все трубы с источником в центре!' }, k => {
  let lvl = 0, C, R, g, cells, src;
  const D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  function level() {
    lvl++; C = Math.min(4 + lvl, 8); R = Math.min(5 + lvl, 10); g = k.fit(C, R, 40, 20, 12);
    cells = Array.from({ length: R }, () => Array.from({ length: C }, () => [0, 0, 0, 0]));
    src = [Math.floor(C / 2), Math.floor(R / 2)];
    const seen = new Set([src.join()]), st = [src];
    while (st.length) { const cur = st[st.length - 1], opts = [0, 1, 2, 3].filter(d => { const x = cur[0] + D[d][0], y = cur[1] + D[d][1]; return x >= 0 && y >= 0 && x < C && y < R && !seen.has(x + ',' + y); }); if (!opts.length) { st.pop(); continue; } const d = k.pick(opts), nx = cur[0] + D[d][0], ny = cur[1] + D[d][1]; cells[cur[1]][cur[0]][d] = 1; cells[ny][nx][(d + 2) % 4] = 1; seen.add(nx + ',' + ny); st.push([nx, ny]); }
    cells.forEach(r => r.forEach((c, i) => { const n = k.RI(0, 3); for (let j = 0; j < n; j++) c.unshift(c.pop()); }));
    if (connected().size === C * R) level2();
  }
  function level2() { const c = cells[0][0]; c.unshift(c.pop()); }
  function connected() { const seen = new Set([src.join()]), st = [src]; while (st.length) { const [x, y] = st.pop(); for (let d = 0; d < 4; d++) { if (!cells[y][x][d]) continue; const nx = x + D[d][0], ny = y + D[d][1]; if (nx < 0 || ny < 0 || nx >= C || ny >= R) continue; if (!cells[ny][nx][(d + 2) % 4]) continue; const key = nx + ',' + ny; if (!seen.has(key)) { seen.add(key); st.push([nx, ny]); } } } return seen; }
  level();
  return {
    tap(x, y) { const c = k.cell(g, x, y); if (!c) return; const cell = cells[c[1]][c[0]]; cell.unshift(cell.pop()); k.sfx('tap'); if (connected().size === C * R) { k.add(); k.sfx('win'); k.toast('Готово!', '#7dff8a'); k.after(.8, level); } },
    draw() {
      k.clear('#16233a'); const on = connected(), cs = g.cs;
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
        const X = g.x + x * cs, Y = g.y + y * cs, cx = X + cs / 2, cy = Y + cs / 2, lit = on.has(x + ',' + y), col = lit ? '#35c2ff' : '#7c8aa5';
        k.rect(X + 2, Y + 2, cs - 4, cs - 4, '#22324f', 8);
        cells[y][x].forEach((v, d) => v && k.line(cx, cy, cx + D[d][0] * cs / 2, cy + D[d][1] * cs / 2, col, cs * .22));
        k.circ(cx, cy, cs * .14, col);
        if (x === src[0] && y === src[1]) k.circ(cx, cy, cs * .26, '#ffd84d');
      }
      k.text('Уровень ' + lvl, k.W / 2, 22, 18, k.P.dim);
    }
  };
});

/* 65 Колышки */
A({ id: 'peg', name: 'Колышки', e: '📌', cat: 'puz', how: 'Перепрыгни колышком через соседний на пустое место — перепрыгнутый убирается. Оставь как можно меньше колышков. Идеал — один!' }, k => {
  const g = k.fit(7, 7, 40, 30, 16), cs = g.cs; let b = [], sel = null;
  for (let y = 0; y < 7; y++) { b.push([]); for (let x = 0; x < 7; x++) b[y][x] = (x < 2 || x > 4) && (y < 2 || y > 4) ? -1 : 1; } b[3][3] = 0;
  const moves = () => { const m = []; for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) if (b[y][x] === 1) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const mx = x + dx, my = y + dy, tx = x + dx * 2, ty = y + dy * 2; if (tx >= 0 && ty >= 0 && tx < 7 && ty < 7 && b[my][mx] === 1 && b[ty][tx] === 0) m.push([x, y, tx, ty]); } return m; };
  return {
    tap(x, y) {
      const c = k.cell(g, x, y); if (!c || b[c[1]][c[0]] < 0) return; const [cx, cy] = c;
      if (b[cy][cx] === 1) { sel = c; k.sfx('tap'); return; }
      if (sel && b[cy][cx] === 0) { const dx = cx - sel[0], dy = cy - sel[1]; if ((Math.abs(dx) === 2 && !dy) || (Math.abs(dy) === 2 && !dx)) { const mx = sel[0] + dx / 2, my = sel[1] + dy / 2; if (b[my][mx] === 1) { b[sel[1]][sel[0]] = 0; b[my][mx] = 0; b[cy][cx] = 1; sel = null; k.add(); k.sfx('pop'); if (!moves().length) { const left = 32 - k.score; if (left === 1) { k.add(10); k.win('Остался один колышек!'); } else k.over('Осталось колышков: ' + left); } return; } } k.sfx('bad'); }
    },
    draw() {
      k.clear('#5b3a22'); k.circ(g.x + 3.5 * cs, g.y + 3.5 * cs, cs * 3.9, '#7a5233');
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) { const v = b[y][x]; if (v < 0) continue; const cx = g.x + x * cs + cs / 2, cy = g.y + y * cs + cs / 2; k.circ(cx, cy, cs * .2, '#3a2412'); if (v === 1) { k.circ(cx, cy, cs * .34, sel && sel[0] === x && sel[1] === y ? '#ffd84d' : '#e8e0d0'); k.circ(cx - cs * .08, cy - cs * .1, cs * .1, 'rgba(255,255,255,.7)'); } }
      k.text('Колышков: ' + (32 - k.score), k.W / 2, 24, 18);
    }
  };
});
})();
