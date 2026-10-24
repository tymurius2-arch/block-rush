// Игры 1–20: аркады
(() => {
const A = G.add;

/* 1 Птичка */
A({ id: 'flappy', name: 'Птичка', e: '🐦', cat: 'arc', how: 'Нажимай на экран — птичка подлетает. Пролетай между трубами.' }, k => {
  const { W, H } = k, gap = Math.max(150, H * .25), pw = 64, bx = W * .3, g = H * 1.7, flap = -H * .58;
  let y = H / 2, vy = 0, pipes = [], t = 0, on = false, gx = 0;
  return {
    down() { on = true; vy = flap; k.sfx('jump'); },
    update(dt) {
      if (!on) { y = H / 2 + Math.sin(k.t * 4) * 8; return; }
      vy += g * dt; y += vy * dt; t -= dt;
      if (t <= 0) { pipes.push({ x: W + pw, top: k.R(70, H - gap - 90), done: false }); t = 1.55; }
      const sp = W * .45 + k.score * 3; gx = (gx + sp * dt) % 40;
      for (const p of pipes) {
        p.x -= sp * dt;
        if (!p.done && p.x + pw < bx) { p.done = true; k.add(); k.sfx('point'); }
        if (bx + 13 > p.x && bx - 13 < p.x + pw && (y - 13 < p.top || y + 13 > p.top + gap)) { k.sfx('hit'); k.over(); }
      }
      pipes = pipes.filter(p => p.x > -pw);
      if (y < 12) { y = 12; vy = 0; }
      if (y > H - 50) { k.sfx('hit'); k.over(); }
    },
    draw() {
      k.clear('#55c4f5');
      k.circ(W * .8, H * .15, 40, '#fff3a0');
      for (const p of pipes) {
        k.rect(p.x, 0, pw, p.top, '#3cb34a'); k.rect(p.x - 5, p.top - 24, pw + 10, 24, '#4fd15d', 4);
        k.rect(p.x, p.top + gap, pw, H - p.top - gap, '#3cb34a'); k.rect(p.x - 5, p.top + gap, pw + 10, 24, '#4fd15d', 4);
      }
      k.rect(0, H - 40, W, 40, '#d9b26b');
      for (let x = -gx; x < W; x += 40) k.rect(x, H - 40, 20, 8, '#c49a52');
      const c = k.ctx; c.save(); c.translate(bx, y); c.rotate(k.clamp(vy / 900, -.5, 1)); c.scale(-1, 1); k.emo('🐦', 0, 0, 34); c.restore();
      if (!on) k.text('Нажми, чтобы взлететь', W / 2, H * .3, 22);
      k.text(k.score, W / 2, 60, 48, '#fff');
    }
  };
});

/* 2 Змейка */
A({ id: 'snake', name: 'Змейка', e: '🐍', cat: 'arc', how: 'Проводи пальцем вверх/вниз/влево/вправо, чтобы повернуть. Ешь яблоки, не врезайся.' }, k => {
  const cols = 15, gr = k.fit(cols, Math.floor(cols * (k.H - 20) / (k.W - 20)), 0, 0, 10), rows = gr.rows;
  let snake = [[7, Math.floor(rows / 2)], [6, Math.floor(rows / 2)], [5, Math.floor(rows / 2)]], dir = [1, 0], q = [], acc = 0, food;
  const place = () => { do food = [k.RI(0, cols - 1), k.RI(0, rows - 1)]; while (snake.some(s => s[0] === food[0] && s[1] === food[1])); };
  place();
  return {
    swipe(d) { const v = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] }[d]; const l = q.length ? q[q.length - 1] : dir; if (v[0] !== -l[0] || v[1] !== -l[1]) q.push(v); if (q.length > 3) q.shift(); },
    update(dt) {
      acc += dt; const step = Math.max(.06, .16 - k.score * .003);
      if (acc < step) return; acc = 0;
      if (q.length) dir = q.shift();
      const h = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
      if (h[0] < 0 || h[1] < 0 || h[0] >= cols || h[1] >= rows || snake.some(s => s[0] === h[0] && s[1] === h[1])) { k.sfx('hit'); return k.over(); }
      snake.unshift(h);
      if (h[0] === food[0] && h[1] === food[1]) { k.add(); k.sfx('pop'); place(); } else snake.pop();
    },
    draw() {
      k.clear(); const { cs, x, y } = gr;
      k.rect(x - 3, y - 3, cs * cols + 6, cs * rows + 6, '#1d1850', 8);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if ((r + c) % 2) k.rect(x + c * cs, y + r * cs, cs, cs, '#211b5a');
      k.emo('🍎', x + food[0] * cs + cs / 2, y + food[1] * cs + cs / 2, cs * .9);
      snake.forEach((s, i) => k.rect(x + s[0] * cs + 1, y + s[1] * cs + 1, cs - 2, cs - 2, i ? (i % 2 ? '#47d873' : '#3cc265') : '#9bff8a', cs * .3));
      const hd = snake[0]; k.circ(x + hd[0] * cs + cs / 2 + dir[0] * cs * .2 - dir[1] * cs * .18, y + hd[1] * cs + cs / 2 + dir[1] * cs * .2 - dir[0] * cs * .18, cs * .1, '#000');
    }
  };
});

/* 3 Арканоид */
A({ id: 'breakout', name: 'Арканоид', e: '🧱', cat: 'arc', how: 'Двигай платформу пальцем. Отбивай мяч и разбивай все кирпичи. 3 жизни.' }, k => {
  const { W, H } = k, pw = W * .24, ph = 14, py = H - 60, br = 8;
  let px = W / 2, ball, bricks = [], lives = 3, lvl = 0, parts = [];
  const resetBall = () => ball = { x: px, y: py - 20, vx: 0, vy: 0, stuck: true };
  function build() {
    lvl++; bricks = []; const cols = 7, bw = (W - 20) / cols, rows = Math.min(4 + lvl, 9);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (lvl < 2 || Math.random() > .12) bricks.push({ x: 10 + c * bw, y: 70 + r * 24, w: bw - 4, h: 20, c: k.C[r % 7], hp: r < lvl - 2 ? 2 : 1 });
    resetBall();
  }
  build();
  const mv = x => { px = k.clamp(x, pw / 2, W - pw / 2); };
  return {
    down(x) { mv(x); if (ball.stuck) { ball.stuck = false; const s = H * .55 + lvl * 25; ball.vx = s * .5; ball.vy = -s * .85; } },
    move(x, y, p) { if (p) mv(x); },
    update(dt) {
      if (ball.stuck) { ball.x = px; ball.y = py - br - 2; }
      const n = 3;
      for (let i = 0; i < n && !ball.stuck; i++) {
        ball.x += ball.vx * dt / n;
        if (ball.x < br || ball.x > W - br) { ball.vx *= -1; ball.x = k.clamp(ball.x, br, W - br); }
        for (const b of bricks) if (hit(b)) { ball.vx *= -1; ball.x += ball.vx * dt / n; dmg(b); break; }
        ball.y += ball.vy * dt / n;
        if (ball.y < br) { ball.vy = Math.abs(ball.vy); }
        for (const b of bricks) if (hit(b)) { ball.vy *= -1; ball.y += ball.vy * dt / n; dmg(b); break; }
        if (ball.vy > 0 && ball.y + br > py && ball.y < py + ph && Math.abs(ball.x - px) < pw / 2 + br) {
          const s = Math.hypot(ball.vx, ball.vy) * 1.01, a = (ball.x - px) / (pw / 2) * 1.05;
          ball.vx = s * Math.sin(a); ball.vy = -s * Math.cos(a); k.sfx('hit');
        }
        if (ball.y > H + 20) { lives--; k.sfx('bad'); if (lives <= 0) return k.over(); resetBall(); }
      }
      bricks = bricks.filter(b => b.hp > 0);
      if (!bricks.length) { k.toast('Уровень ' + (lvl + 1) + '!'); k.sfx('win'); build(); }
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.l -= dt; }); parts = parts.filter(p => p.l > 0);
    },
    draw() {
      k.clear();
      bricks.forEach(b => { k.rect(b.x, b.y, b.w, b.h, b.c, 5); if (b.hp > 1) k.srect(b.x + 2, b.y + 2, b.w - 4, b.h - 4, '#fff', 2, 4); });
      parts.forEach(p => k.rect(p.x, p.y, 4, 4, p.c));
      k.rect(px - pw / 2, py, pw, ph, '#fff', 7);
      k.circ(ball.x, ball.y, br, '#ffd84d');
      for (let i = 0; i < lives; i++) k.emo('❤️', 20 + i * 24, 30, 18);
      k.text('Ур. ' + lvl, W - 40, 30, 16, k.P.dim);
      if (ball.stuck) k.text('Нажми, чтобы запустить', W / 2, H * .62, 20);
    }
  };
  function hit(b) { return ball.x + br > b.x && ball.x - br < b.x + b.w && ball.y + br > b.y && ball.y - br < b.y + b.h; }
  function dmg(b) { b.hp--; k.sfx('pop'); if (b.hp <= 0) { k.add(); for (let i = 0; i < 6; i++) parts.push({ x: b.x + b.w / 2, y: b.y + 10, vx: k.R(-150, 150), vy: k.R(-200, 50), l: .6, c: b.c }); } }
});

/* 4 Пинг-понг */
A({ id: 'pong', name: 'Пинг-понг', e: '🏓', cat: 'arc', how: 'Двигай нижнюю ракетку пальцем. Забивай компьютеру. Пропустишь 3 мяча — проиграл.' }, k => {
  const { W, H } = k, pw = W * .26, ph = 12;
  let px = W / 2, ax = W / 2, b, lives = 3, wait = 1;
  const serve = d => { const s = H * .55 + k.score * 15; b = { x: W / 2, y: H / 2, vx: k.R(-.5, .5) * s, vy: s * d }; wait = .8; };
  serve(1);
  return {
    move(x, y, p) { if (p) px = k.clamp(x, pw / 2, W - pw / 2); }, down(x) { px = k.clamp(x, pw / 2, W - pw / 2); },
    update(dt) {
      const as = W * (1.1 + k.score * .12); ax += k.clamp((b.vy < 0 ? b.x : W / 2) - ax, -as * dt, as * dt);
      if (wait > 0) { wait -= dt; return; }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < 8 || b.x > W - 8) { b.vx *= -1; b.x = k.clamp(b.x, 8, W - 8); }
      if (b.vy > 0 && b.y > H - 50 - 8 && b.y < H - 50 + ph && Math.abs(b.x - px) < pw / 2 + 8) { const s = Math.hypot(b.vx, b.vy) * 1.04, a = (b.x - px) / (pw / 2); b.vx = s * Math.sin(a); b.vy = -s * Math.cos(a); k.sfx('hit'); }
      if (b.vy < 0 && b.y < 50 + ph + 8 && b.y > 50 && Math.abs(b.x - ax) < pw / 2 + 8) { b.vy *= -1.02; b.vx += k.R(-80, 80); k.sfx('hit'); }
      if (b.y < -10) { k.add(); k.sfx('point'); serve(1); }
      if (b.y > H + 10) { lives--; k.sfx('bad'); if (lives <= 0) return k.over(); serve(-1); }
    },
    draw() {
      k.clear('#123d2e');
      k.line(0, H / 2, W, H / 2, 'rgba(255,255,255,.25)', 3);
      k.rect(ax - pw / 2, 50, pw, ph, k.P.r, 6); k.rect(px - pw / 2, H - 50, pw, ph, k.P.b, 6);
      k.circ(b.x, b.y, 8, '#fff');
      for (let i = 0; i < lives; i++) k.emo('❤️', 20 + i * 24, H / 2 + 24, 16);
    }
  };
});

/* 5 Космобой */
A({ id: 'shooter', name: 'Космобой', e: '🚀', cat: 'arc', how: 'Веди пальцем корабль, он стреляет сам. Сбивай врагов и не сталкивайся с ними.' }, k => {
  const { W, H } = k; let sx = W / 2, sy = H - 90, shots = [], foes = [], st = 0, ft = 0, stars = [], booms = [], lx = 0, ly = 0;
  for (let i = 0; i < 60; i++) stars.push([k.R(0, W), k.R(0, H), k.R(20, 120)]);
  return {
    down(x, y) { lx = x; ly = y; },
    move(x, y, p) { if (!p) return; sx = k.clamp(sx + (x - lx) * 1.3, 20, W - 20); sy = k.clamp(sy + (y - ly) * 1.3, 60, H - 30); lx = x; ly = y; },
    update(dt) {
      stars.forEach(s => { s[1] += s[2] * dt; if (s[1] > H) { s[1] = 0; s[0] = k.R(0, W); } });
      st -= dt; if (st <= 0) { shots.push({ x: sx, y: sy - 24 }); st = .17; }
      ft -= dt; if (ft <= 0) { const t = k.pick(['👾', '👾', '🛸', '👽']); foes.push({ x: k.R(30, W - 30), y: -30, vy: k.R(90, 150) + k.score * 2, t, ph: k.R(0, 6), hp: t === '🛸' ? 3 : 1 }); ft = Math.max(.25, .9 - k.score * .01); }
      shots.forEach(s => s.y -= 600 * dt); shots = shots.filter(s => s.y > -10 && !s.dead);
      for (const f of foes) {
        f.y += f.vy * dt; if (f.t === '👽') f.x += Math.sin(k.t * 3 + f.ph) * 120 * dt;
        for (const s of shots) if (!s.dead && Math.abs(s.x - f.x) < 20 && Math.abs(s.y - f.y) < 20) { s.dead = true; if (--f.hp <= 0) { f.dead = true; k.add(); k.sfx('pop'); booms.push({ x: f.x, y: f.y, l: .4 }); } }
        if (!f.dead && Math.hypot(f.x - sx, f.y - sy) < 30) { k.sfx('boom'); return k.over(); }
      }
      foes = foes.filter(f => !f.dead && f.y < H + 40);
      booms.forEach(b => b.l -= dt); booms = booms.filter(b => b.l > 0);
    },
    draw() {
      k.clear('#07051a'); stars.forEach(s => k.rect(s[0], s[1], 2, 2, `rgba(255,255,255,${s[2] / 140})`));
      shots.forEach(s => k.rect(s.x - 2, s.y - 8, 4, 14, '#7df9ff', 2));
      foes.forEach(f => k.emo(f.t, f.x, f.y, 34));
      booms.forEach(b => k.emo('💥', b.x, b.y, 40 * (1.4 - b.l)));
      const c = k.ctx; c.save(); c.translate(sx, sy); c.rotate(-Math.PI / 4); k.emo('🚀', 0, 0, 40); c.restore();
    }
  };
});

/* 6 Астероиды */
A({ id: 'asteroids', name: 'Астероиды', e: '☄️', cat: 'arc', how: 'Нажимай туда, куда стрелять. Корабль в центре. Не дай камням долететь до тебя.' }, k => {
  const { W, H } = k, cx = W / 2, cy = H / 2; let ang = -Math.PI / 2, shots = [], rocks = [], t = 0;
  const spawn = (x, y, r) => { const a = x === undefined ? k.R(0, 6.28) : 0; if (x === undefined) { x = cx + Math.cos(a) * Math.max(W, H) * .7; y = cy + Math.sin(a) * Math.max(W, H) * .7; } const to = Math.atan2(cy - y, cx - x) + k.R(-.5, .5), s = k.R(40, 80) + k.score * 1.2; rocks.push({ x, y, r, vx: Math.cos(to) * s, vy: Math.sin(to) * s, rot: k.R(0, 6), pts: Array.from({ length: 9 }, () => k.R(.75, 1.15)) }); };
  return {
    down(x, y) { ang = Math.atan2(y - cy, x - cx); shots.push({ x: cx, y: cy, vx: Math.cos(ang) * 520, vy: Math.sin(ang) * 520, l: 1.3 }); k.sfx('tap'); },
    update(dt) {
      t -= dt; if (t <= 0) { spawn(undefined, undefined, k.pick([34, 34, 22])); t = Math.max(.6, 2 - k.score * .02); }
      shots.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.l -= dt; });
      for (const r of rocks) {
        r.x += r.vx * dt; r.y += r.vy * dt; r.rot += dt;
        for (const s of shots) if (s.l > 0 && Math.hypot(s.x - r.x, s.y - r.y) < r.r) { s.l = 0; r.dead = true; k.add(r.r > 30 ? 1 : 2); k.sfx('boom'); if (r.r > 30) { spawn(r.x, r.y, 18); spawn(r.x, r.y, 18); } break; }
        if (!r.dead && Math.hypot(r.x - cx, r.y - cy) < r.r + 14) return k.over();
      }
      shots = shots.filter(s => s.l > 0); rocks = rocks.filter(r => !r.dead);
    },
    draw() {
      k.clear('#07051a');
      for (const r of rocks) { const c = k.ctx; c.fillStyle = '#8c7b6b'; c.beginPath(); r.pts.forEach((p, i) => { const a = r.rot + i / r.pts.length * 6.283; c.lineTo(r.x + Math.cos(a) * r.r * p, r.y + Math.sin(a) * r.r * p); }); c.fill(); }
      shots.forEach(s => k.circ(s.x, s.y, 3, '#ffde3d'));
      const c = k.ctx; c.save(); c.translate(cx, cy); c.rotate(ang); k.poly([[18, 0], [-12, -11], [-6, 0], [-12, 11]], '#7df9ff'); c.restore();
    }
  };
});

/* 7 Прыгун */
A({ id: 'jumper', name: 'Прыгун', e: '🐸', cat: 'arc', how: 'Лягушка прыгает сама. Держи палец слева или справа, чтобы двигаться. Забирайся выше!' }, k => {
  const { W, H } = k; let x = W / 2, y = H - 100, vy = -700, cam = 0, plats = [], top = H, hold = 0, best = 0;
  const g = 1500, jv = -Math.min(820, Math.sqrt(2 * g * H * .3));
  for (let py = H - 40; py > -H; py -= 70) plats.push(mk(py));
  plats[0].x = W / 2 - 35;
  function mk(py) { const sc = Math.max(0, -py) / 1000; return { x: k.R(0, W - 70), y: py, w: 70, m: Math.random() < Math.min(.4, sc * .1) ? k.R(40, 90) : 0, br: Math.random() < Math.min(.25, sc * .05) }; }
  return {
    down(px) { hold = px < W / 2 ? -1 : 1; }, move(px, py, p) { if (p) hold = px < W / 2 ? -1 : 1; }, up() { hold = 0; },
    update(dt) {
      x += hold * W * 1.1 * dt; if (x < -15) x = W + 15; if (x > W + 15) x = -15;
      const oy = y; vy += g * dt; y += vy * dt;
      if (vy > 0) for (const p of plats) if (!p.gone && oy + 20 <= p.y && y + 20 >= p.y && x > p.x - 12 && x < p.x + p.w + 12) { if (p.br) { p.gone = true; continue; } vy = jv; y = p.y - 20; k.sfx('jump'); break; }
      plats.forEach(p => { if (p.m) { p.x += p.m * dt; if (p.x < 0 || p.x > W - p.w) p.m *= -1; } });
      if (y - cam < H * .4) cam = y - H * .4;
      const h = Math.floor((H - 100 - y) / 10); if (h > best) { best = h; k.set(best); }
      while (top > cam - 80) { top -= k.R(55, 70 + Math.min(40, best / 50)); plats.push(mk(top)); }
      plats = plats.filter(p => p.y < cam + H + 40);
      if (y - cam > H + 40) k.over();
    },
    draw() {
      k.clear('#f7f1de'); const c = k.ctx;
      c.strokeStyle = '#e5ddc4'; c.lineWidth = 1; for (let gy = (-cam) % 24; gy < H; gy += 24) { c.beginPath(); c.moveTo(0, gy); c.lineTo(W, gy); c.stroke(); }
      plats.forEach(p => !p.gone && k.rect(p.x, p.y - cam, p.w, 12, p.br ? '#b98a5a' : p.m ? '#35c2ff' : '#47d873', 6));
      k.emo('🐸', x, y - cam, 38);
    }
  };
});

/* 8 Башня */
A({ id: 'stack', name: 'Башня', e: '🏗️', cat: 'arc', how: 'Нажми, чтобы опустить блок. Лишнее отрезается. Ставь ровно — строй выше!' }, k => {
  const { W, H } = k, bh = 28; let stack = [{ x: W * .2, w: W * .6 }], cur, dir = 1, sp, cam = 0, falls = [];
  const next = () => { const l = stack[stack.length - 1]; sp = W * .5 + stack.length * 6; cur = { x: dir > 0 ? -l.w : W, w: l.w }; };
  next();
  const col = i => `hsl(${(i * 12) % 360},70%,60%)`;
  return {
    down() {
      const l = stack[stack.length - 1], a = Math.max(cur.x, l.x), b = Math.min(cur.x + cur.w, l.x + l.w);
      if (b - a <= 0) { falls.push({ ...cur, y: stack.length, vy: 0, i: stack.length }); k.sfx('bad'); return k.over(); }
      if (Math.abs(cur.x - l.x) < 5) { cur.x = l.x; k.toast('Идеально!', '#ffd84d'); k.sfx('point'); }
      else { k.sfx('hit'); const cx = cur.x < l.x ? cur.x : b, cw = cur.w - (b - a); falls.push({ x: cx, w: cw, y: stack.length, vy: 0, i: stack.length }); cur = { x: a, w: b - a }; }
      stack.push({ x: cur.x, w: cur.w }); k.add(); dir *= -1; next();
    },
    update(dt) {
      cur.x += dir * sp * dt; if (cur.x > W) dir = -1; if (cur.x + cur.w < 0) dir = 1;
      const target = Math.max(0, stack.length * bh - H * .5); cam += (target - cam) * Math.min(1, dt * 5);
      falls.forEach(f => { f.vy += 1500 * dt; f.y -= f.vy * dt / bh; });
      falls = falls.filter(f => f.y > -40);
    },
    draw() {
      k.clear('#1d1745'); const base = H - 60 + cam, yy = i => base - i * bh;
      stack.forEach((s, i) => k.rect(s.x, yy(i), s.w, bh - 2, col(i), 4));
      falls.forEach(f => k.rect(f.x, yy(f.y), f.w, bh - 2, col(f.i), 4));
      if (k.score >= 0) k.rect(cur.x, yy(stack.length), cur.w, bh - 2, col(stack.length), 4);
      k.text(k.score, W / 2, 70, 56);
    }
  };
});

/* 9 Динозаврик */
A({ id: 'dino', name: 'Динозаврик', e: '🦖', cat: 'arc', how: 'Нажимай, чтобы прыгать через кактусы и птиц. Чем дальше — тем быстрее.' }, k => {
  const { W, H } = k, gy = H * .7, dx = W * .18; let y = 0, vy = 0, obs = [], t = 1, sp = 300, d = 0, clouds = [];
  for (let i = 0; i < 4; i++) clouds.push([k.R(0, W), k.R(40, gy - 120)]);
  return {
    down() { if (y >= 0) { vy = -720; k.sfx('jump'); } },
    update(dt) {
      sp = 300 + d * .02; d += sp * dt; k.set(Math.floor(d / 40));
      vy += 2200 * dt; y += vy * dt; if (y > 0) { y = 0; vy = 0; }
      t -= dt; if (t <= 0) { const bird = d > 3000 && Math.random() < .25; obs.push(bird ? { x: W + 30, w: 34, h: 26, b: true, yy: gy - k.pick([30, 70]) } : { x: W + 30, w: 22 * k.RI(1, 3), h: k.R(36, 56) }); t = k.R(.7, 1.6) * 330 / sp + .35; }
      obs.forEach(o => o.x -= sp * dt); obs = obs.filter(o => o.x > -80);
      clouds.forEach(c => { c[0] -= sp * .2 * dt; if (c[0] < -60) c[0] = W + 60; });
      for (const o of obs) { const top = o.b ? o.yy - o.h / 2 : gy - o.h, bot = o.b ? o.yy + o.h / 2 : gy; if (dx + 14 > o.x && dx - 14 < o.x + o.w && gy + y - 4 > top && gy + y - 40 < bot) { k.sfx('hit'); return k.over(); } }
    },
    draw() {
      k.clear('#f4f1ea'); clouds.forEach(c => k.emo('☁️', c[0], c[1], 40));
      k.rect(0, gy, W, 3, '#555');
      for (const o of obs) if (o.b) { const c = k.ctx; c.save(); c.translate(o.x + o.w / 2, o.yy); c.scale(-1, 1); k.emo('🦅', 0, 0, 34); c.restore(); } else for (let i = 0; i < o.w / 22; i++) k.emo('🌵', o.x + 11 + i * 22, gy - o.h / 2, o.h);
      const c = k.ctx; c.save(); c.translate(dx, gy + y - 22); c.scale(-1, 1); k.emo('🦖', 0, 0, 44); c.restore();
      k.text(k.score, W - 20, 30, 22, '#555', 'right');
    }
  };
});

/* 10 Нарезка */
A({ id: 'ninja', name: 'Нарезка', e: '🍉', cat: 'arc', how: 'Проводи пальцем по фруктам, чтобы разрезать. Не трогай бомбы! Пропустишь 3 фрукта — конец.' }, k => {
  const { W, H } = k, F = ['🍉', '🍊', '🍎', '🍍', '🥝', '🍋', '🍑', '🍓']; let items = [], halves = [], trail = [], t = .5, lives = 3, last = null;
  return {
    down(x, y) { last = [x, y]; trail = [[x, y, k.t]]; },
    move(x, y, p) {
      if (!p || !last) return; trail.push([x, y, k.t]);
      for (const it of items) if (!it.cut && segDist(last[0], last[1], x, y, it.x, it.y) < 34) {
        it.cut = true;
        if (it.e === '💣') { k.sfx('boom'); return k.over('Бомба!'); }
        k.add(); k.sfx('pop'); halves.push({ ...it, vx: -100, r: 0 }, { ...it, vx: 100, r: 0 });
      }
      last = [x, y];
    },
    up() { last = null; },
    update(dt) {
      t -= dt;
      if (t <= 0) { const n = k.RI(1, 2 + Math.min(3, k.score / 15)); for (let i = 0; i < n; i++) { const x = k.R(W * .15, W * .85); items.push({ x, y: H + 30, vx: (W / 2 - x) * k.R(.3, .8), vy: -k.R(H * 1.05, H * 1.35), e: Math.random() < .13 + Math.min(.1, k.score / 300) ? '💣' : k.pick(F), r: 0 }); } t = k.R(.9, 1.5); }
      const g = H * 1.1;
      for (const it of [...items, ...halves]) { it.x += it.vx * dt; it.y += it.vy * dt; it.vy += g * dt; it.r += dt * 3; }
      for (const it of items) if (!it.cut && it.vy > 0 && it.y > H + 40) { it.cut = true; if (it.e !== '💣') { lives--; k.sfx('bad'); if (lives <= 0) return k.over(); } }
      items = items.filter(i => !i.cut); halves = halves.filter(h => h.y < H + 60);
      trail = trail.filter(p => k.t - p[2] < .15);
    },
    draw() {
      k.clear('#3b2414'); const c = k.ctx;
      for (let i = 0; i < 6; i++) k.rect(0, i * H / 6, W, 2, 'rgba(0,0,0,.25)');
      items.forEach(it => { c.save(); c.translate(it.x, it.y); c.rotate(it.r); k.emo(it.e, 0, 0, 52); c.restore(); });
      halves.forEach(h => { c.save(); c.translate(h.x, h.y); c.rotate(h.r * (h.vx > 0 ? 1 : -1)); c.globalAlpha = .7; c.beginPath(); c.rect(h.vx > 0 ? 0 : -30, -30, 30, 60); c.clip(); k.emo(h.e, 0, 0, 52); c.restore(); });
      if (trail.length > 1) { c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); trail.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }
      for (let i = 0; i < 3; i++) k.emo(i < lives ? '❤️' : '🖤', W - 20 - i * 26, 24, 20);
    }
  };
  function segDist(x1, y1, x2, y2, px, py) { const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy; let t = l ? ((px - x1) * dx + (py - y1) * dy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - x1 - t * dx, py - y1 - t * dy); }
});

/* 11 Кроты */
A({ id: 'moles', name: 'Кроты', e: '🐹', cat: 'arc', how: 'Бей по вылезающим кротам. Золотой — 3 очка. Не бей ёжиков! Пропустишь 5 кротов — конец.' }, k => {
  const g = k.fit(3, 4, 40, 0, 16); let holes = Array.from({ length: 12 }, () => null), t = .5, miss = 0, hits = [];
  return {
    down(x, y) {
      const c = k.cell(g, x, y); if (!c) return; const i = c[1] * 3 + c[0], h = holes[i];
      if (h && h.up > .3) { holes[i] = null; hits.push({ x: g.x + c[0] * g.cs + g.cs / 2, y: g.y + c[1] * g.cs + g.cs / 2, l: .3 });
        if (h.t === '🦔') { k.sfx('bad'); return k.over('Это был ёжик!'); } k.add(h.t === '🐿️' ? 3 : 1); k.sfx('pop'); }
    },
    update(dt) {
      t -= dt; const life = Math.max(.6, 1.6 - k.score * .015);
      if (t <= 0) { const free = holes.map((h, i) => h ? -1 : i).filter(i => i >= 0); if (free.length) { const r = Math.random(); holes[k.pick(free)] = { t: r < .12 ? '🦔' : r < .22 ? '🐿️' : '🐹', life, up: 0 }; } t = Math.max(.25, .8 - k.score * .01); }
      holes.forEach((h, i) => { if (!h) return; h.up += dt; if (h.up > h.life) { if (h.t !== '🦔') { miss++; k.sfx('bad'); } holes[i] = null; } });
      hits.forEach(h => h.l -= dt); hits = hits.filter(h => h.l > 0);
      if (miss >= 5) k.over();
    },
    draw() {
      k.clear('#4f9b3a');
      for (let i = 0; i < 12; i++) {
        const cx = g.x + (i % 3) * g.cs + g.cs / 2, cy = g.y + Math.floor(i / 3) * g.cs + g.cs / 2, h = holes[i];
        k.ctx.save(); k.ctx.beginPath(); k.ctx.rect(cx - g.cs / 2, cy - g.cs / 2, g.cs, g.cs * .62); k.ctx.clip();
        if (h) { const p = Math.min(1, h.up * 6, (h.life - h.up) * 6); k.emo(h.t, cx, cy + g.cs * .1 + (1 - p) * g.cs * .5, g.cs * .55); }
        k.ctx.restore();
        k.ctx.fillStyle = '#2e1a0e'; k.ctx.beginPath(); k.ctx.ellipse(cx, cy + g.cs * .14, g.cs * .38, g.cs * .1, 0, 0, 7); k.ctx.fill();
      }
      hits.forEach(h => k.emo('💥', h.x, h.y, 60));
      k.text('Промахи: ' + miss + '/5', k.W / 2, 22, 18);
    }
  };
});

/* 12 Пианино */
A({ id: 'piano', name: 'Пианино', e: '🎹', cat: 'arc', how: 'Нажимай только чёрные плитки снизу вверх. Не пропускай и не нажимай на белое!' }, k => {
  const { W, H } = k, cw = W / 4, th = H / 4.2; let tiles = [], sp = H * .45, off = 0, row = 0, fail = null, notes = [262, 294, 330, 349, 392, 440, 494, 523];
  for (let i = 0; i < 6; i++) tiles.push({ r: i + 1, c: k.RI(0, 3), hit: false });
  const ty = t => H - (t.r - off) * th;
  return {
    down(x, y) {
      if (fail) return; const t = tiles.find(t => !t.hit); if (!t) return;
      const yy = ty(t), c = Math.floor(x / cw);
      if (c === t.c && y > yy - 10 && y < yy + th + 10) { t.hit = true; k.add(); if (k.score === 1) row = 1; if (sound()) toneN(); }
      else { fail = { c, y }; k.sfx('bad'); k.over(); }
    },
    update(dt) {
      if (!row) return; sp = H * (.45 + k.score * .008); off += sp / th * dt;
      const last = tiles[tiles.length - 1]; if (ty(last) > -th) tiles.push({ r: last.r + 1, c: k.RI(0, 3), hit: false });
      const lo = tiles.find(t => !t.hit); if (lo && ty(lo) > H) { fail = { c: lo.c }; k.sfx('bad'); k.over(); }
      tiles = tiles.filter(t => ty(t) < H + th);
    },
    draw() {
      k.clear('#fafafa');
      for (let i = 1; i < 4; i++) k.rect(i * cw, 0, 1, H, '#ddd');
      tiles.forEach(t => { const y = ty(t); k.rect(t.c * cw + 1, y + 1, cw - 2, th - 2, t.hit ? '#cfcfe8' : '#15122b', 6); if (!row && t.r === 1) k.text('СТАРТ', t.c * cw + cw / 2, y + th / 2, 18, '#fff'); });
      if (fail && fail.y) k.rect(fail.c * cw, fail.y - 40, cw, 80, 'rgba(255,60,80,.6)');
      k.text(k.score, W / 2, 50, 44, k.P.r);
    }
  };
  function sound() { return true; }
  function toneN() { k.sfx('pop'); }
});

/* 13 Уклонись */
A({ id: 'dodge', name: 'Уклонись', e: '🟥', cat: 'arc', how: 'Двигай кубик пальцем и уворачивайся от падающих блоков. Очки — за время.' }, k => {
  const { W, H } = k; let x = W / 2, lx = 0, blocks = [], t = 0, time = 0;
  return {
    down(px) { lx = px; }, move(px, py, p) { if (p) { x = k.clamp(x + (px - lx) * 1.4, 16, W - 16); lx = px; } },
    update(dt) {
      time += dt; k.set(Math.floor(time * 10));
      t -= dt; if (t <= 0) { const w = k.R(30, 90); blocks.push({ x: k.R(0, W - w), y: -40, w, h: k.R(20, 40), vy: k.R(180, 280) + time * 8, c: k.pick(k.C) }); t = Math.max(.12, .5 - time * .006); }
      blocks.forEach(b => b.y += b.vy * dt); blocks = blocks.filter(b => b.y < H + 10);
      for (const b of blocks) if (x + 14 > b.x && x - 14 < b.x + b.w && H - 80 + 14 > b.y && H - 80 - 14 < b.y + b.h) { k.sfx('hit'); return k.over(); }
    },
    draw() { k.clear(); blocks.forEach(b => k.rect(b.x, b.y, b.w, b.h, b.c, 6)); k.rect(x - 14, H - 94, 28, 28, '#fff', 6); }
  };
});

/* 14 Корзинка */
A({ id: 'catch', name: 'Корзинка', e: '🧺', cat: 'arc', how: 'Двигай корзинку и лови фрукты. Бомбы не лови! Уронишь 3 фрукта — конец.' }, k => {
  const { W, H } = k, F = ['🍎', '🍐', '🍊', '🍌', '🍇', '🍒', '🍓']; let x = W / 2, items = [], t = 0, lives = 3;
  return {
    down(px) { x = px; }, move(px, py, p) { if (p) x = k.clamp(px, 30, W - 30); },
    update(dt) {
      t -= dt; if (t <= 0) { items.push({ x: k.R(20, W - 20), y: -20, vy: k.R(150, 230) + k.score * 4, e: Math.random() < .2 ? '💣' : k.pick(F) }); t = Math.max(.3, 1 - k.score * .015); }
      for (const it of items) {
        it.y += it.vy * dt;
        if (!it.done && it.y > H - 80 && it.y < H - 40 && Math.abs(it.x - x) < 40) { it.done = true; if (it.e === '💣') { k.sfx('boom'); return k.over('Поймал бомбу!'); } k.add(); k.sfx('pop'); }
        if (!it.done && it.y > H) { it.done = true; if (it.e !== '💣') { lives--; k.sfx('bad'); if (lives <= 0) return k.over(); } }
      }
      items = items.filter(i => !i.done);
    },
    draw() {
      k.clear('#7fd3ff'); k.rect(0, H - 30, W, 30, '#5cbf4c');
      items.forEach(i => k.emo(i.e, i.x, i.y, 38)); k.emo('🧺', x, H - 60, 64);
      for (let i = 0; i < 3; i++) k.emo(i < lives ? '❤️' : '🖤', 20 + i * 26, 24, 20);
    }
  };
});

/* 15 Шарики */
A({ id: 'balloons', name: 'Шарики', e: '🎈', cat: 'arc', how: 'Лопай шарики, пока они не улетели. Упустишь 5 — конец.' }, k => {
  const { W, H } = k; let bs = [], t = 0, miss = 0, pops = [];
  return {
    down(x, y) { for (let i = bs.length - 1; i >= 0; i--) { const b = bs[i]; if (Math.hypot(b.x - x, b.y - y) < b.r + 10) { bs.splice(i, 1); k.add(); k.sfx('pop'); pops.push({ x: b.x, y: b.y, l: .3 }); return; } } },
    update(dt) {
      t -= dt; if (t <= 0) { bs.push({ x: k.R(30, W - 30), y: H + 40, r: k.R(24, 34), vy: k.R(70, 120) + k.score * 2.5, c: k.pick(k.C), ph: k.R(0, 6) }); t = Math.max(.22, .9 - k.score * .012); }
      bs.forEach(b => { b.y -= b.vy * dt; b.x += Math.sin(k.t * 2 + b.ph) * 20 * dt; });
      const gone = bs.filter(b => b.y < -40); if (gone.length) { miss += gone.length; k.sfx('bad'); } bs = bs.filter(b => b.y >= -40);
      pops.forEach(p => p.l -= dt); pops = pops.filter(p => p.l > 0);
      if (miss >= 5) k.over();
    },
    draw() {
      k.clear('#9ad8ff');
      bs.forEach(b => { k.line(b.x, b.y + b.r, b.x + Math.sin(k.t * 3 + b.ph) * 4, b.y + b.r + 30, '#555', 1); k.ctx.fillStyle = b.c; k.ctx.beginPath(); k.ctx.ellipse(b.x, b.y, b.r * .85, b.r, 0, 0, 7); k.ctx.fill(); k.circ(b.x - b.r * .3, b.y - b.r * .4, b.r * .18, 'rgba(255,255,255,.6)'); });
      pops.forEach(p => k.emo('💥', p.x, p.y, 50));
      k.text('Упущено: ' + miss + '/5', W / 2, 22, 17, '#234');
    }
  };
});

/* 16 Меткость */
A({ id: 'aim', name: 'Меткость', e: '📍', cat: 'arc', how: 'Попадай по мишеням, пока они не исчезли. 30 секунд. Промах по пустому месту — минус очко.' }, k => {
  const { W, H } = k; let ts = [], t = 0, left = 30, fx = [];
  return {
    down(x, y) {
      for (let i = ts.length - 1; i >= 0; i--) { const m = ts[i], r = m.r * Math.min(1, m.l / m.L * 2.2); if (Math.hypot(m.x - x, m.y - y) < r + 6) { ts.splice(i, 1); const pts = Math.hypot(m.x - x, m.y - y) < r * .35 ? 3 : 1; k.add(pts); k.sfx(pts > 1 ? 'point' : 'pop'); fx.push({ x, y, s: '+' + pts, l: .5 }); return; } }
      k.add(-1); k.sfx('bad'); fx.push({ x, y, s: '−1', l: .5 });
    },
    update(dt) {
      left -= dt; if (left <= 0) { left = 0; return k.over('Время вышло!'); }
      t -= dt; if (t <= 0) { const L = Math.max(.9, 2 - (30 - left) * .03); ts.push({ x: k.R(40, W - 40), y: k.R(70, H - 40), r: k.R(24, 38), l: L, L }); t = Math.max(.3, .7 - (30 - left) * .01); }
      ts.forEach(m => m.l -= dt); ts = ts.filter(m => m.l > 0);
      fx.forEach(f => { f.l -= dt; f.y -= 40 * dt; }); fx = fx.filter(f => f.l > 0);
    },
    draw() {
      k.clear('#1d2b3a');
      ts.forEach(m => { const r = m.r * Math.min(1, m.l / m.L * 2.2); k.circ(m.x, m.y, r, '#fff'); k.circ(m.x, m.y, r * .7, k.P.r); k.circ(m.x, m.y, r * .4, '#fff'); k.circ(m.x, m.y, r * .2, k.P.r); });
      fx.forEach(f => k.text(f.s, f.x, f.y, 24, f.s[0] === '+' ? k.P.g : k.P.r));
      k.rect(0, 0, W * left / 30, 6, k.P.y); k.text(Math.ceil(left) + ' с', W / 2, 26, 20);
    }
  };
});

/* 17 Ножи */
A({ id: 'knife', name: 'Ножи', e: '🔪', cat: 'arc', how: 'Нажимай, чтобы бросить нож в крутящееся бревно. Не попади в другой нож!' }, k => {
  const { W, H } = k, cx = W / 2, cy = H * .32, R = Math.min(W, H) * .17; let rot = 0, sp = 2, knives = [], fly = null, left = 7, lvl = 1, apples = [], t = 0, dirT = 2, bounce = null;
  const newLog = () => { knives = []; left = 6 + lvl; apples = [k.R(0, 6.28)]; for (let i = 0; i < Math.min(lvl - 1, 3); i++) knives.push(k.R(0, 6.28)); };
  newLog();
  const norm = a => ((a % 6.283) + 6.283) % 6.283;
  return {
    down() { if (!fly && !bounce) { fly = { y: H - 90 }; k.sfx('tap'); } },
    update(dt) {
      t += dt;
      if (lvl % 3 === 0) { dirT -= dt; if (dirT < 0) { sp = -sp; dirT = k.R(1, 2.5); } }
      const s = lvl % 3 === 2 ? sp * (1 + Math.sin(t * 2) * .8) : sp; rot += s * dt;
      if (bounce) { bounce.y += 900 * dt; bounce.r += 12 * dt; if (bounce.y > H + 50) { bounce = null; k.over(); } return; }
      if (fly) {
        fly.y -= 2400 * dt;
        if (fly.y <= cy + R) {
          const a = norm(Math.PI / 2 - rot);
          if (knives.some(n => Math.abs(norm(n - a + Math.PI) - Math.PI) < .2)) { k.sfx('bad'); bounce = { y: cy + R, r: 0 }; fly = null; return; }
          apples = apples.filter(p => { if (Math.abs(norm(p - a + Math.PI) - Math.PI) < .25) { k.add(2); k.sfx('point'); return false; } return true; });
          knives.push(a); fly = null; left--; k.add(); k.sfx('hit');
          if (left <= 0) { lvl++; k.toast('Бревно ' + lvl + '!', '#ffd84d'); k.sfx('win'); sp = (Math.random() < .5 ? -1 : 1) * (2 + lvl * .25); newLog(); }
        }
      }
    },
    draw() {
      k.clear('#2a1d3f'); const c = k.ctx;
      c.save(); c.translate(cx, cy); c.rotate(rot);
      knives.forEach(a => { c.save(); c.rotate(a); c.translate(0, R); k.rect(-3, 0, 6, 30, '#ddd', 2); k.rect(-5, 30, 10, 34, '#6b3b1f', 3); c.restore(); });
      apples.forEach(a => { c.save(); c.rotate(a); k.emo('🍎', 0, R + 14, 26); c.restore(); });
      k.circ(0, 0, R, '#a8692f'); k.ring(0, 0, R * .7, '#8a5323', 4); k.ring(0, 0, R * .4, '#8a5323', 4); k.circ(0, 0, R * .12, '#8a5323');
      c.restore();
      const ky = fly ? fly.y : H - 90;
      if (!bounce) { k.rect(cx - 3, ky, 6, 30, '#ddd', 2); k.rect(cx - 5, ky + 30, 10, 34, '#6b3b1f', 3); }
      else { c.save(); c.translate(cx, bounce.y); c.rotate(bounce.r); k.rect(-3, -32, 6, 30, '#ddd', 2); k.rect(-5, -2, 10, 34, '#6b3b1f', 3); c.restore(); }
      for (let i = 0; i < left - 1; i++) k.rect(18, H - 30 - i * 22, 26, 6, '#ddd', 3);
      k.text('Бревно ' + lvl, W / 2, 24, 18, k.P.dim);
    }
  };
});

/* 18 Вертолёт */
A({ id: 'heli', name: 'Вертолёт', e: '🚁', cat: 'arc', how: 'Держи палец на экране — вертолёт поднимается. Отпусти — опускается. Не задевай стены.' }, k => {
  const { W, H } = k, seg = 20; let y = H / 2, vy = 0, hold = false, walls = [], d = 0, cTop = H * .15, cGap = H * .7, blocks = [], bt = 2, smoke = [];
  for (let x = 0; x <= W + seg; x += seg) walls.push({ top: cTop, gap: cGap });
  let off = 0;
  return {
    down() { hold = true; }, up() { hold = false; },
    update(dt) {
      const sp = 200 + d * .015; d += sp * dt; k.set(Math.floor(d / 10));
      vy += (hold ? -1300 : 1100) * dt; vy = k.clamp(vy, -400, 450); y += vy * dt;
      off += sp * dt;
      while (off >= seg) {
        off -= seg; walls.shift();
        const l = walls[walls.length - 1], g = Math.max(H * .38, cGap - d * .0006);
        let top = k.clamp(l.top + k.R(-14, 14), 10, H - g - 10); walls.push({ top, gap: g });
      }
      bt -= dt; if (bt <= 0) { const w = walls[walls.length - 1]; blocks.push({ x: W + 20, y: w.top + k.R(.2, .7) * w.gap, h: k.R(50, 90) }); bt = k.R(1.2, 2.2); }
      blocks.forEach(b => b.x -= sp * dt); blocks = blocks.filter(b => b.x > -40);
      smoke.push({ x: W * .25 - 20, y, l: .5 }); smoke.forEach(s => { s.x -= sp * dt; s.l -= dt; }); smoke = smoke.filter(s => s.l > 0);
      const hx = W * .25, wi = Math.floor((hx + off) / seg), w = walls[wi];
      if (y - 12 < w.top || y + 12 > w.top + w.gap) { k.sfx('boom'); return k.over(); }
      for (const b of blocks) if (hx + 18 > b.x && hx - 18 < b.x + 24 && y + 10 > b.y - b.h / 2 && y - 10 < b.y + b.h / 2) { k.sfx('boom'); return k.over(); }
    },
    draw() {
      k.clear('#0d2b1c');
      walls.forEach((w, i) => { const x = i * seg - off; k.rect(x, 0, seg + 1, w.top, '#3fae5a'); k.rect(x, w.top + w.gap, seg + 1, H, '#3fae5a'); });
      blocks.forEach(b => k.rect(b.x, b.y - b.h / 2, 24, b.h, '#3fae5a', 4));
      smoke.forEach(s => k.circ(s.x, s.y, 6 * s.l * 2, `rgba(255,255,255,${s.l * .4})`));
      const c = k.ctx; c.save(); c.translate(W * .25, y); c.rotate(vy / 1500); c.scale(-1, 1); k.emo('🚁', 0, 0, 38); c.restore();
      if (k.t < 2) k.text('Держи палец — вверх', W / 2, H * .85, 18);
    }
  };
});

/* 19 Гравитация */
A({ id: 'gravity', name: 'Гравитация', e: '🔄', cat: 'arc', how: 'Нажимай, чтобы перевернуть гравитацию: бегун прыгает на потолок и обратно. Избегай шипов.' }, k => {
  const { W, H } = k, top = H * .25, bot = H * .75, px = W * .22; let up = false, y = bot - 14, vy = 0, sp = 260, d = 0, obs = [], t = 1, onG = true;
  return {
    down() { if (onG) { up = !up; onG = false; k.sfx('jump'); } },
    update(dt) {
      sp = 260 + d * .015; d += sp * dt; k.set(Math.floor(d / 30));
      vy += (up ? -2600 : 2600) * dt; y += vy * dt;
      if (y > bot - 14) { y = bot - 14; vy = 0; onG = true; } if (y < top + 14) { y = top + 14; vy = 0; onG = true; }
      t -= dt; if (t <= 0) { const n = k.RI(1, 3); obs.push({ x: W + 20, w: 22 * n, top: Math.random() < .5 }); t = k.R(.45, 1.1) * 300 / sp + .2; }
      obs.forEach(o => o.x -= sp * dt); obs = obs.filter(o => o.x > -80);
      for (const o of obs) if (px + 11 > o.x + 3 && px - 11 < o.x + o.w - 3 && (o.top ? y - 14 < top + 22 : y + 14 > bot - 22)) { k.sfx('hit'); return k.over(); }
    },
    draw() {
      k.clear('#1a1240'); k.rect(0, 0, W, top, '#2c2270'); k.rect(0, bot, W, H - bot, '#2c2270');
      for (const o of obs) for (let i = 0; i < o.w / 22; i++) { const x = o.x + i * 22; if (o.top) k.poly([[x, top], [x + 22, top], [x + 11, top + 24]], k.P.r); else k.poly([[x, bot], [x + 22, bot], [x + 11, bot - 24]], k.P.r); }
      k.rect(px - 12, y - 12, 24, 24, k.P.y, 5); k.rect(px + (up ? -2 : 2), y + (up ? 2 : -6), 6, 6, '#000', 2);
    }
  };
});

/* 20 Переход */
A({ id: 'frog', name: 'Переход', e: '🐔', cat: 'arc', how: 'Нажми — шаг вперёд. Проведи влево/вправо — шаг в сторону. Перебегай дороги, не попади под машину!' }, k => {
  const { W, H } = k, cols = 9, cs = W / cols; let lanes = [], px = 4, py = 0, cam = 0, maxY = 0, hop = 0, idle = 0;
  const lane = i => { if (lanes[i]) return lanes[i]; const road = i > 1 && Math.random() < .65; const L = road ? { road, dir: Math.random() < .5 ? 1 : -1, sp: k.R(60, 140) + i * 1.5, cars: [] } : { road: false, trees: i > 0 ? [k.RI(0, cols - 1)].filter(c => c !== 4 || i > 2) : [] }; if (road) { let x = k.R(0, W); const n = k.RI(1, 3); for (let j = 0; j < n; j++) { L.cars.push({ x, w: cs * k.pick([1.2, 1.2, 2]), e: k.pick(['🚗', '🚕', '🚙', '🚌', '🚓']) }); x += W / n; } } lanes[i] = L; return L; };
  for (let i = 0; i < 30; i++) lane(i);
  const rowY = i => H - 80 - (i * cs) + cam;
  return {
    tap() { move(0, 1); }, swipe(d) { if (d === 'L') move(-1, 0); else if (d === 'R') move(1, 0); else if (d === 'U') move(0, 1); else move(0, -1); },
    update(dt) {
      for (let i = Math.max(0, py - 8); i < py + 20; i++) { const L = lane(i); if (L.road) L.cars.forEach(c => { c.x += L.dir * L.sp * dt; if (L.dir > 0 && c.x > W + 40) c.x = -c.w - 40; if (L.dir < 0 && c.x < -c.w - 40) c.x = W + 40; }); }
      const target = Math.max(0, py * cs - H * .35); cam += (target - cam) * Math.min(1, dt * 6);
      hop = Math.max(0, hop - dt * 6);
      const L = lane(py), x = px * cs;
      if (L.road && L.cars.some(c => x + cs * .8 > c.x && x + cs * .2 < c.x + c.w)) { k.sfx('hit'); return k.over('Сбили!'); }
      idle += dt; if (rowY(py) > H + 10) k.over('Слишком медленно!');
    },
    draw() {
      k.clear();
      for (let i = Math.max(0, py - 10); i < py + Math.ceil(H / cs) + 2; i++) {
        const L = lane(i), y = rowY(i);
        if (y < -cs || y > H) continue;
        k.rect(0, y, W, cs + 1, L.road ? '#3a3a4a' : (i % 2 ? '#5cc85a' : '#52bb50'));
        if (L.road) { for (let x = 0; x < W; x += 40) k.rect(x, y + cs - 2, 20, 2, '#777'); L.cars.forEach(c => { const g = k.ctx; g.save(); g.translate(c.x + c.w / 2, y + cs / 2); if (L.dir > 0) g.scale(-1, 1); k.emo(c.e, 0, 0, cs * .85); g.restore(); }); }
        else L.trees.forEach(t => k.emo('🌳', t * cs + cs / 2, y + cs / 2, cs * .85));
      }
      k.emo('🐔', px * cs + cs / 2, rowY(py) + cs / 2 - hop * 10, cs * .8);
    }
  };
  function move(dx, dy) { const nx = px + dx, ny = py + dy; if (nx < 0 || nx >= cols || ny < 0) return; if (!lane(ny).road && lane(ny).trees.includes(nx)) return; px = nx; py = ny; hop = 1; k.sfx('tap'); if (py > maxY) { maxY = py; k.set(maxY); } }
});
})();
