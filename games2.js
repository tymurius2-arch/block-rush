// Игры 21–45: аркады
(() => {
const A = G.add;

/* 21 ПВО */
A({ id: 'missile', name: 'ПВО', e: '💥', cat: 'arc', how: 'Нажимай на небо — туда летит ракета-перехватчик и взрывается. Защити города от падающих ракет.' }, k => {
  const { W, H } = k, gy = H - 40; let cities = [0, 1, 2, 3, 4, 5].map(i => ({ x: W * (i < 3 ? .1 + i * .13 : .64 + (i - 3) * .13), alive: true })), enemy = [], mine = [], booms = [], t = 1, wave = 0;
  return {
    down(x, y) { if (y > gy - 30) return; mine.push({ x: W / 2, y: gy - 20, tx: x, ty: y }); k.sfx('tap'); },
    update(dt) {
      wave += dt; t -= dt;
      if (t <= 0) { const live = cities.filter(c => c.alive); if (live.length) { const tg = k.pick(live), x = k.R(0, W); enemy.push({ x, y: 0, sx: x, tx: tg.x, ty: gy, sp: 40 + wave * 1.2 }); } t = Math.max(.35, 1.6 - wave * .02); }
      for (const m of mine) { const d = Math.hypot(m.tx - m.x, m.ty - m.y), s = 600 * dt; if (d <= s) { m.done = true; booms.push({ x: m.tx, y: m.ty, r: 0, g: 1 }); k.sfx('boom'); } else { m.x += (m.tx - m.x) / d * s; m.y += (m.ty - m.y) / d * s; } }
      mine = mine.filter(m => !m.done);
      for (const b of booms) { b.r += (b.g > 0 ? 90 : -60) * dt; if (b.r > 42) b.g = -1; }
      booms = booms.filter(b => b.r > 0);
      for (const e of enemy) {
        const d = Math.hypot(e.tx - e.x, e.ty - e.y), s = e.sp * dt; e.x += (e.tx - e.x) / d * s; e.y += (e.ty - e.y) / d * s;
        if (booms.some(b => Math.hypot(b.x - e.x, b.y - e.y) < b.r)) { e.dead = true; k.add(); k.sfx('pop'); continue; }
        if (e.y >= gy - 4) { e.dead = true; const c = cities.find(c => Math.abs(c.x - e.tx) < 2); if (c && c.alive) { c.alive = false; k.sfx('boom'); booms.push({ x: c.x, y: gy - 10, r: 5, g: 1 }); } }
      }
      enemy = enemy.filter(e => !e.dead);
      if (!cities.some(c => c.alive)) k.over('Города разрушены');
    },
    draw() {
      k.clear('#0a0820'); k.rect(0, gy, W, H - gy, '#4a3a20');
      cities.forEach(c => c.alive ? k.emo('🏙️', c.x, gy - 12, 30) : k.emo('🔥', c.x, gy - 10, 22));
      k.poly([[W / 2 - 20, gy], [W / 2, gy - 30], [W / 2 + 20, gy]], '#888');
      enemy.forEach(e => { k.line(e.sx, 0, e.x, e.y, 'rgba(255,90,90,.5)', 2); k.circ(e.x, e.y, 3, '#ff5d73'); });
      mine.forEach(m => { k.line(W / 2, gy - 20, m.x, m.y, 'rgba(120,220,255,.6)', 2); k.circ(m.tx, m.ty, 3, '#fff'); });
      booms.forEach(b => k.circ(b.x, b.y, b.r, `hsla(${(k.t * 600) % 360},90%,65%,.85)`));
    }
  };
});

/* 22 Пузыри */
A({ id: 'bubbles', name: 'Пузыри', e: '🫧', cat: 'arc', how: 'Веди пальцем, чтобы прицелиться, отпусти — выстрел. Собери 3+ одного цвета, чтобы лопнуть.' }, k => {
  const { W, H } = k, cols = 9, d = W / (cols + .5), rh = d * .866, maxR = Math.floor((H - d * 3) / rh), C = k.C.slice(0, 5);
  let grid = [], par = 0, shot = null, aim = null, cur = k.pick(C), nxt = k.pick(C), shots = 0, falling = [];
  for (let r = 0; r < 5; r++) grid.push(Array.from({ length: cols }, () => k.pick(C)));
  const odd = r => (r + par) % 2 === 1;
  const pos = (r, c) => [c * d + d / 2 + (odd(r) ? d / 2 : 0), r * rh + d / 2];
  const get = (r, c) => grid[r] && c >= 0 && c < cols ? grid[r][c] : null;
  const nb = (r, c) => { const o = odd(r) ? 0 : -1; return [[r, c - 1], [r, c + 1], [r - 1, c + o], [r - 1, c + o + 1], [r + 1, c + o], [r + 1, c + o + 1]]; };
  const sx = W / 2, sy = H - d * 1.2;
  function colorsLeft() { const s = new Set(); grid.forEach(row => row.forEach(v => v && s.add(v))); return s.size ? [...s] : C; }
  function snap(x, y) {
    let best = null, bd = 1e9;
    for (let r = 0; r <= Math.min(grid.length, maxR); r++) for (let c = 0; c < cols; c++) { if (get(r, c)) continue; const [px, py] = pos(r, c); if (r > 0 && !nb(r, c).some(([a, b]) => get(a, b))) continue; const dd = Math.hypot(px - x, py - y); if (dd < bd) { bd = dd; best = [r, c]; } }
    if (!best) return;
    const [r, c] = best; while (grid.length <= r) grid.push(Array(cols).fill(null)); grid[r][c] = shot.c;
    const same = flood(r, c, (a, b) => get(a, b) === shot.c);
    if (same.length >= 3) {
      same.forEach(([a, b]) => { falling.push({ p: pos(a, b), c: grid[a][b], vy: 0 }); grid[a][b] = null; });
      const keep = new Set(); for (let cc = 0; cc < cols; cc++) if (get(0, cc)) flood(0, cc, (a, b) => !!get(a, b)).forEach(([a, b]) => keep.add(a + ',' + b));
      let drop = 0; grid.forEach((row, a) => row.forEach((v, b) => { if (v && !keep.has(a + ',' + b)) { falling.push({ p: pos(a, b), c: v, vy: 0 }); grid[a][b] = null; drop++; } }));
      k.add(same.length + drop * 2); k.sfx('pop');
    } else k.sfx('hit');
    while (grid.length && grid[grid.length - 1].every(v => !v)) grid.pop();
    shots++;
    if (shots % 6 === 0) { grid.unshift(Array.from({ length: cols }, () => k.pick(colorsLeft()))); par ^= 1; }
    if (!grid.length) { k.add(50); k.toast('Чисто! +50', '#ffd84d'); for (let i = 0; i < 4; i++) grid.push(Array.from({ length: cols }, () => k.pick(C))); }
    if (grid.length > maxR) return k.over();
  }
  function flood(r, c, ok) { const seen = new Set([r + ',' + c]), st = [[r, c]], out = []; while (st.length) { const [a, b] = st.pop(); out.push([a, b]); for (const [x, y] of nb(a, b)) { const key = x + ',' + y; if (!seen.has(key) && ok(x, y)) { seen.add(key); st.push([x, y]); } } } return out; }
  const setAim = (x, y) => { aim = Math.atan2(Math.min(y, sy - 20) - sy, x - sx); aim = k.clamp(aim, -Math.PI + .15, -.15); };
  return {
    down(x, y) { if (!shot) setAim(x, y); }, move(x, y, p) { if (p && !shot) setAim(x, y); },
    up() { if (shot || aim === null) return; shot = { x: sx, y: sy, vx: Math.cos(aim) * 900, vy: Math.sin(aim) * 900, c: cur }; cur = nxt; const cl = colorsLeft(); nxt = k.pick(cl); if (!cl.includes(cur)) cur = k.pick(cl); aim = null; k.sfx('tap'); },
    update(dt) {
      falling.forEach(f => { f.vy += 1500 * dt; f.p[1] += f.vy * dt; }); falling = falling.filter(f => f.p[1] < H + 30);
      if (!shot) return;
      for (let i = 0; i < 4 && shot; i++) {
        shot.x += shot.vx * dt / 4; shot.y += shot.vy * dt / 4;
        if (shot.x < d / 2 || shot.x > W - d / 2) { shot.vx *= -1; shot.x = k.clamp(shot.x, d / 2, W - d / 2); }
        let hit = shot.y < d / 2;
        if (!hit) grid.forEach((row, r) => row.forEach((v, c) => { if (v) { const [px, py] = pos(r, c); if (Math.hypot(px - shot.x, py - shot.y) < d * .85) hit = true; } }));
        if (hit) { snap(shot.x, shot.y); shot = null; }
      }
    },
    draw() {
      k.clear('#1b1446');
      k.rect(0, maxR * rh, W, 2, 'rgba(255,90,90,.5)');
      const bub = (x, y, c) => { k.circ(x, y, d / 2 - 1, c); k.circ(x - d * .14, y - d * .14, d * .12, 'rgba(255,255,255,.5)'); };
      grid.forEach((row, r) => row.forEach((v, c) => { if (v) { const [x, y] = pos(r, c); bub(x, y, v); } }));
      falling.forEach(f => bub(f.p[0], f.p[1], f.c));
      if (aim !== null) { const c = k.ctx; c.setLineDash([6, 8]); k.line(sx, sy, sx + Math.cos(aim) * 260, sy + Math.sin(aim) * 260, 'rgba(255,255,255,.6)', 3); c.setLineDash([]); }
      if (shot) bub(shot.x, shot.y, shot.c);
      bub(sx, sy, cur); k.circ(sx + d * 1.4, sy + d * .2, d * .3, nxt);
    }
  };
});

/* 23 Тетрис */
A({ id: 'tetris', name: 'Тетрис', e: '🟦', cat: 'arc', how: 'Тяни пальцем влево-вправо — двигать. Нажми — повернуть. Быстро смахни вниз — уронить.' }, k => {
  const S = [[[0, 1], [1, 1], [2, 1], [3, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]]];
  const g = k.fit(10, 20, 0, 0, 8), cs = g.cs, ox = Math.max(4, Math.min(g.x, k.W - cs * 10 - cs * 4.5)); g.x = ox;
  let board = Array.from({ length: 20 }, () => Array(10).fill(null)), p, nx = k.RI(0, 6), acc = 0, lines = 0, dx0 = null, c0 = 0;
  const cells = q => q.b.map(([x, y]) => [x + q.x, y + q.y]);
  const ok = q => cells(q).every(([x, y]) => x >= 0 && x < 10 && y < 20 && (y < 0 || !board[y][x]));
  function spawn() { const t = nx; nx = k.RI(0, 6); p = { t, b: S[t].map(a => [...a]), x: 3, y: -1, c: k.C[t] }; if (!ok(p)) k.over(); }
  function lock() {
    cells(p).forEach(([x, y]) => { if (y >= 0) board[y][x] = p.c; });
    if (cells(p).some(([, y]) => y < 0)) return k.over();
    let n = 0; board = board.filter(r => { if (r.every(v => v)) { n++; return false; } return true; }); while (board.length < 20) board.unshift(Array(10).fill(null));
    if (n) { lines += n; k.add([0, 100, 300, 500, 800][n]); k.sfx('point'); } else k.sfx('hit');
    spawn();
  }
  spawn();
  const rot = () => { if (p.t === 1) return; const q = { ...p, b: p.b.map(([x, y]) => [2 - y, x]) }; for (const kick of [0, -1, 1, -2, 2]) { const r = { ...q, x: p.x + kick }; if (ok(r)) { p = r; k.sfx('tap'); return; } } };
  return {
    down(x) { dx0 = x; c0 = p.x; },
    move(x, y, pr) { if (!pr || dx0 === null) return; const want = c0 + Math.round((x - dx0) / (cs * .9)); while (p.x !== want) { const q = { ...p, x: p.x + Math.sign(want - p.x) }; if (!ok(q)) break; p = q; } },
    up() { dx0 = null; },
    tap() { rot(); },
    swipe(d) { if (d === 'D') { while (ok({ ...p, y: p.y + 1 })) p.y++; lock(); acc = 0; } else if (d === 'U') rot(); },
    update(dt) { acc += dt; const sp = Math.max(.08, .7 - Math.floor(lines / 8) * .06); if (acc >= sp) { acc = 0; const q = { ...p, y: p.y + 1 }; if (ok(q)) p = q; else lock(); } },
    draw() {
      k.clear(); k.rect(g.x - 3, g.y - 3, cs * 10 + 6, cs * 20 + 6, '#0e0b26', 6);
      for (let y = 0; y < 20; y++) for (let x = 0; x < 10; x++) board[y][x] ? k.block(g.x + x * cs + 1, g.y + y * cs + 1, cs - 2, board[y][x]) : k.rect(g.x + x * cs + 1, g.y + y * cs + 1, cs - 2, cs - 2, '#1a1545', 3);
      let gh = { ...p }; while (ok({ ...gh, y: gh.y + 1 })) gh.y++;
      cells(gh).forEach(([x, y]) => y >= 0 && k.srect(g.x + x * cs + 2, g.y + y * cs + 2, cs - 4, cs - 4, 'rgba(255,255,255,.3)', 2, 3));
      cells(p).forEach(([x, y]) => y >= 0 && k.block(g.x + x * cs + 1, g.y + y * cs + 1, cs - 2, p.c));
      const sx = g.x + cs * 10 + 10, s2 = cs * .7;
      k.text('Далее', sx + s2 * 2, g.y + 10, 14, k.P.dim);
      S[nx].forEach(([x, y]) => k.block(sx + x * s2, g.y + 30 + y * s2, s2 - 1, k.C[nx]));
      k.text('Линии', sx + s2 * 2, g.y + 110, 14, k.P.dim); k.text(lines, sx + s2 * 2, g.y + 132, 22);
    }
  };
});

/* 24 Пакмен */
A({ id: 'pacman', name: 'Пакмен', e: '👻', cat: 'arc', how: 'Проводи пальцем, чтобы повернуть. Ешь все точки. Большая точка — можно есть привидений!' }, k => {
  const M = ["###################", "#........#........#", "#o##.###.#.###.##o#", "#.................#", "#.##.#.#####.#.##.#", "#....#...#...#....#", "####.### # ###.####", "   #.#       #.#   ", "####.# ##### #.####", "    .  #   #  .    ", "####.# ##### #.####", "   #.#       #.#   ", "####.# ##### #.####", "#........#........#", "#.##.###.#.###.##.#", "#o.#.....P.....#.o#", "##.#.#.#####.#.#.##", "#....#...#...#....#", "#.######.#.######.#", "#.................#", "###################"];
  const RW = M.length, CL = 19, g = k.fit(CL, RW, 30, 0, 6), cs = g.cs;
  let dots, pac, ghosts, lives = 3, fright = 0, lvl = 1, want = null, dead = 0;
  const wall = (c, r) => { if (r < 0 || r >= RW) return true; c = (c + CL) % CL; return M[r][c] === '#'; };
  const D = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] };
  function reset(full) {
    if (full) { dots = M.map(r => [...r].map(ch => ch === '.' ? 1 : ch === 'o' ? 2 : 0)); }
    pac = { c: 9, r: 15, d: [0, 0], p: 0, sp: 6.5 };
    ghosts = [['#ff4b4b', 8], ['#ffb8ff', 9], ['#00e5ff', 10], ['#ffb852', 9]].slice(0, Math.min(4, 2 + lvl)).map(([col, c], i) => ({ c, r: 7, d: [i % 2 ? 1 : -1, 0], p: 0, sp: 4.6 + lvl * .3, col, home: c, eaten: false }));
    fright = 0; want = null;
  }
  reset(true);
  function step(e, dt, choose) {
    if (e.p === 0 && wall(e.c + e.d[0], e.r + e.d[1])) { choose(e); if (wall(e.c + e.d[0], e.r + e.d[1])) return; }
    e.p += e.sp * dt;
    while (e.p >= 1) {
      e.p -= 1; e.c = (e.c + e.d[0] + CL) % CL; e.r += e.d[1];
      choose(e);
      if (wall(e.c + e.d[0], e.r + e.d[1])) { e.p = 0; return; }
    }
    if (e.d[0] === 0 && e.d[1] === 0) e.p = 0;
  }
  const pacChoose = e => { if (want && !wall(e.c + want[0], e.r + want[1])) e.d = want; eat(); };
  function eat() { const v = dots[pac.r][pac.c]; if (v) { dots[pac.r][pac.c] = 0; k.add(v === 2 ? 5 : 1); if (v === 2) { fright = 7; ghosts.forEach(g => g.eaten = false); k.sfx('point'); } else if (k.score % 3 === 0) k.sfx('tap'); if (!dots.some(r => r.some(x => x))) { lvl++; k.toast('Уровень ' + lvl + '!', '#ffd84d'); k.sfx('win'); reset(true); } } }
  const ghostChoose = e => {
    const opts = Object.values(D).filter(d => !wall(e.c + d[0], e.r + d[1]) && !(d[0] === -e.d[0] && d[1] === -e.d[1]));
    if (!opts.length) { e.d = [-e.d[0], -e.d[1]]; return; }
    if (fright > 0 && !e.eaten) { e.d = k.pick(opts); return; }
    if (Math.random() < .7) { opts.sort((a, b) => Math.hypot(e.c + a[0] - pac.c, e.r + a[1] - pac.r) - Math.hypot(e.c + b[0] - pac.c, e.r + b[1] - pac.r)); e.d = opts[0]; } else e.d = k.pick(opts);
  };
  const posOf = e => [e.c + e.d[0] * e.p, e.r + e.d[1] * e.p];
  return {
    swipe(d) { want = D[d]; const w = want; if (w[0] === -pac.d[0] && w[1] === -pac.d[1] && (w[0] || w[1]) && pac.p > 0) { pac.c = (pac.c + pac.d[0] + CL) % CL; pac.r += pac.d[1]; pac.p = 1 - pac.p; pac.d = w; if (pac.p >= 1) pac.p = 0; } else if (pac.d[0] === 0 && pac.d[1] === 0 && !wall(pac.c + w[0], pac.r + w[1])) pac.d = w; },
    update(dt) {
      if (dead > 0) { dead -= dt; if (dead <= 0) { if (lives <= 0) return k.over(); reset(false); } return; }
      fright = Math.max(0, fright - dt);
      if (pac.p === 0 && want && !wall(pac.c + want[0], pac.r + want[1])) pac.d = want;
      step(pac, dt, pacChoose);
      ghosts.forEach(gh => { gh.sp = fright > 0 && !gh.eaten ? 3.2 : 4.6 + lvl * .3; if (gh.d[0] === 0 && gh.d[1] === 0) ghostChoose(gh); step(gh, dt, ghostChoose); });
      const [px, py] = posOf(pac);
      for (const gh of ghosts) { const [gx, gy] = posOf(gh); if (Math.abs(gx - px) + Math.abs(gy - py) < .8) { if (fright > 0 && !gh.eaten) { gh.eaten = true; gh.c = gh.home; gh.r = 7; gh.p = 0; k.add(20); k.sfx('point'); } else { lives--; dead = 1.2; k.sfx('over'); return; } } }
    },
    draw() {
      k.clear('#000');
      for (let r = 0; r < RW; r++) for (let c = 0; c < CL; c++) {
        const x = g.x + c * cs, y = g.y + r * cs;
        if (M[r][c] === '#') k.rect(x + 1, y + 1, cs - 2, cs - 2, '#2337c6', cs * .25);
        else if (dots[r][c] === 1) k.circ(x + cs / 2, y + cs / 2, cs * .1, '#ffd9b0');
        else if (dots[r][c] === 2 && Math.sin(k.t * 8) > -.3) k.circ(x + cs / 2, y + cs / 2, cs * .28, '#ffd9b0');
      }
      ghosts.forEach(gh => { const [c, r] = posOf(gh), x = g.x + c * cs + cs / 2, y = g.y + r * cs + cs / 2, col = fright > 0 && !gh.eaten ? (fright < 2 && Math.sin(k.t * 15) > 0 ? '#fff' : '#2d2dff') : gh.col; k.circ(x, y - cs * .05, cs * .42, col); k.rect(x - cs * .42, y - cs * .05, cs * .84, cs * .45, col); k.circ(x - cs * .15, y - cs * .1, cs * .12, '#fff'); k.circ(x + cs * .15, y - cs * .1, cs * .12, '#fff'); k.circ(x - cs * .12 + gh.d[0] * 2, y - cs * .1 + gh.d[1] * 2, cs * .06, '#00f'); k.circ(x + cs * .18 + gh.d[0] * 2, y - cs * .1 + gh.d[1] * 2, cs * .06, '#00f'); });
      const [c, r] = posOf(pac), x = g.x + c * cs + cs / 2, y = g.y + r * cs + cs / 2, a = Math.atan2(pac.d[1], pac.d[0] || (pac.d[1] ? 0 : 1)), m = dead > 0 ? (1.2 - dead) * 2.6 : Math.abs(Math.sin(k.t * 12)) * .7;
      const cx = k.ctx; cx.fillStyle = '#ffe000'; cx.beginPath(); cx.moveTo(x, y); cx.arc(x, y, cs * .45, a + m / 2, a - m / 2 + Math.PI * 2); cx.fill();
      for (let i = 0; i < lives; i++) k.emo('🟡', 16 + i * 22, 16, 14);
      k.text('Ур. ' + lvl, k.W - 30, 16, 14, k.P.dim);
    }
  };
});

/* 25 Захватчики */
A({ id: 'invaders', name: 'Захватчики', e: '👾', cat: 'arc', how: 'Двигай пушку пальцем, она стреляет сама. Сбей всех пришельцев, пока они не спустились.' }, k => {
  const { W, H } = k; let px = W / 2, al, dir = 1, sp, shots = [], bombs = [], cd = 0, wave = 0, lives = 3, inv = 0;
  function newWave() { wave++; al = []; const cw = Math.min(42, (W - 40) / 8); for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) al.push({ x: 20 + c * cw + cw / 2, y: 60 + r * 36 + wave * 10, e: ['👾', '👽', '👾', '🤖', '🤖'][r], pts: 5 - r }); sp = 30 + wave * 10; }
  newWave();
  return {
    down(x) { px = k.clamp(x, 20, W - 20); }, move(x, y, p) { if (p) px = k.clamp(x, 20, W - 20); },
    update(dt) {
      inv = Math.max(0, inv - dt);
      cd -= dt; if (cd <= 0 && shots.length < 2) { shots.push({ x: px, y: H - 70 }); cd = .38; }
      shots.forEach(s => s.y -= 560 * dt);
      const s2 = sp * (1 + (40 - al.length) * .04);
      let edge = false; al.forEach(a => { a.x += dir * s2 * dt; if (a.x < 18 || a.x > W - 18) edge = true; });
      if (edge) { dir *= -1; al.forEach(a => { a.y += 16; a.x += dir * 4; }); }
      for (const s of shots) for (const a of al) if (!a.dead && !s.dead && Math.abs(a.x - s.x) < 16 && Math.abs(a.y - s.y) < 14) { a.dead = s.dead = true; k.add(a.pts); k.sfx('pop'); }
      al = al.filter(a => !a.dead); shots = shots.filter(s => !s.dead && s.y > 0);
      if (Math.random() < dt * (1 + wave * .4) && al.length) { const a = k.pick(al); bombs.push({ x: a.x, y: a.y }); }
      bombs.forEach(b => b.y += 220 * dt);
      for (const b of bombs) if (!b.dead && inv <= 0 && Math.abs(b.x - px) < 18 && b.y > H - 70 && b.y < H - 40) { b.dead = true; lives--; inv = 1.2; k.sfx('boom'); if (lives <= 0) return k.over(); }
      bombs = bombs.filter(b => !b.dead && b.y < H);
      if (al.some(a => a.y > H - 90)) return k.over('Они приземлились!');
      if (!al.length) { k.sfx('win'); k.toast('Волна ' + (wave + 1)); newWave(); }
    },
    draw() {
      k.clear('#05030f');
      al.forEach(a => k.emo(a.e, a.x, a.y, 28));
      shots.forEach(s => k.rect(s.x - 2, s.y - 8, 4, 12, '#7dff8a', 2));
      bombs.forEach(b => k.rect(b.x - 2, b.y - 6, 4, 12, '#ff5d73', 2));
      if (inv <= 0 || Math.sin(k.t * 30) > 0) { k.rect(px - 20, H - 60, 40, 14, '#47d873', 4); k.rect(px - 4, H - 72, 8, 14, '#47d873', 2); }
      for (let i = 0; i < lives; i++) k.emo('💚', 18 + i * 22, 20, 15);
      k.text('Волна ' + wave, W - 40, 20, 14, k.P.dim);
    }
  };
});

/* 26 Гонки */
A({ id: 'racing', name: 'Гонки', e: '🏎️', cat: 'arc', how: 'Нажимай слева или справа, чтобы перестроиться. Объезжай машины!' }, k => {
  const { W, H } = k, lanes = 3, rw = Math.min(W * .8, 330), rx = (W - rw) / 2, lw = rw / lanes; let lane = 1, x = rx + lw * 1.5, cars = [], t = 0, sp = 300, d = 0, strip = 0;
  return {
    down(px) { lane = k.clamp(lane + (px < W / 2 ? -1 : 1), 0, 2); k.sfx('tap'); }, swipe() {},
    update(dt) {
      sp = 300 + d * .02; d += sp * dt; k.set(Math.floor(d / 50)); strip = (strip + sp * dt) % 60;
      x += (rx + lw * (lane + .5) - x) * Math.min(1, dt * 14);
      t -= dt; if (t <= 0) { const free = k.RI(0, 2); for (let l = 0; l < 3; l++) if (l !== free && Math.random() < .55) cars.push({ l, y: -80, v: k.R(.3, .6), e: k.pick(['🚗', '🚙', '🚕', '🚐', '🚚']) }); t = k.R(.6, 1.1) * 300 / sp + .25; }
      cars.forEach(c => c.y += sp * (1 - c.v) * dt); cars = cars.filter(c => c.y < H + 80);
      for (const c of cars) if (Math.abs(rx + lw * (c.l + .5) - x) < lw * .6 && Math.abs(c.y - (H - 110)) < 60) { k.sfx('boom'); return k.over('Авария!'); }
    },
    draw() {
      k.clear('#3a8f3a'); k.rect(rx, 0, rw, H, '#3b3b46');
      for (let l = 1; l < lanes; l++) for (let y = -60 + strip; y < H; y += 60) k.rect(rx + l * lw - 2, y, 4, 30, '#ddd');
      k.rect(rx - 6, 0, 6, H, '#fff'); k.rect(rx + rw, 0, 6, H, '#fff');
      const c = k.ctx; cars.forEach(o => { c.save(); c.translate(rx + lw * (o.l + .5), o.y); c.rotate(-Math.PI / 2); k.emo(o.e, 0, 0, lw * .75); c.restore(); });
      c.save(); c.translate(x, H - 110); c.rotate(Math.PI / 2); k.emo('🏎️', 0, 0, lw * .8); c.restore();
    }
  };
});

/* 27 Орбита */
A({ id: 'orbit', name: 'Орбита', e: '🪐', cat: 'arc', how: 'Спутник летает вокруг планеты. Нажимай, чтобы прыгать между внутренней и внешней орбитой. Собирай звёзды, избегай камней.' }, k => {
  const { W, H } = k, cx = W / 2, cy = H / 2, R1 = Math.min(W, H) * .2, R2 = Math.min(W, H) * .36; let a = 0, out = false, r = R1, items = [], t = 0, w = 1.6;
  const norm = x => ((x % 6.283) + 6.283) % 6.283;
  return {
    down() { out = !out; k.sfx('jump'); },
    update(dt) {
      w = 1.6 + k.score * .03; a += w * dt; r += ((out ? R2 : R1) - r) * Math.min(1, dt * 12);
      t -= dt; if (t <= 0) { items.push({ a: norm(a + Math.PI + k.R(-.8, .8)), o: Math.random() < .5, star: Math.random() < .4, life: 6 }); t = Math.max(.5, 1.2 - k.score * .02); }
      for (const it of items) { it.life -= dt; const ix = cx + Math.cos(it.a) * (it.o ? R2 : R1), iy = cy + Math.sin(it.a) * (it.o ? R2 : R1); if (Math.hypot(ix - (cx + Math.cos(a) * r), iy - (cy + Math.sin(a) * r)) < 22) { if (it.star) { it.life = 0; k.add(); k.sfx('point'); } else { k.sfx('boom'); return k.over(); } } }
      items = items.filter(i => i.life > 0);
    },
    draw() {
      k.clear('#07051a'); k.ring(cx, cy, R1, 'rgba(255,255,255,.18)', 2); k.ring(cx, cy, R2, 'rgba(255,255,255,.18)', 2);
      k.emo('🪐', cx, cy, R1 * .9);
      items.forEach(i => { const x = cx + Math.cos(i.a) * (i.o ? R2 : R1), y = cy + Math.sin(i.a) * (i.o ? R2 : R1); k.ctx.globalAlpha = Math.min(1, i.life); k.emo(i.star ? '⭐' : '🪨', x, y, 26); k.ctx.globalAlpha = 1; });
      k.circ(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 11, '#7df9ff'); k.circ(cx + Math.cos(a - .15) * r, cy + Math.sin(a - .15) * r, 6, 'rgba(125,249,255,.4)');
    }
  };
});

/* 28 Чеканка */
A({ id: 'keepy', name: 'Чеканка', e: '⚽', cat: 'arc', how: 'Нажимай на мяч, чтобы подбить его вверх. Не дай ему упасть на землю!' }, k => {
  const { W, H } = k, R = 30; let x = W / 2, y = H * .4, vx = 0, vy = 0, rot = 0, on = false;
  return {
    down(px, py) { if (Math.hypot(px - x, py - y) < R * 1.9) { on = true; vy = -Math.min(1000, 650 + k.score * 8); vx = (x - px) * 9 + k.R(-40, 40); k.add(); k.sfx('hit'); } },
    update(dt) {
      if (!on) return; vy += (1300 + k.score * 15) * dt; x += vx * dt; y += vy * dt; rot += vx * dt / R;
      if (x < R) { x = R; vx = Math.abs(vx); } if (x > W - R) { x = W - R; vx = -Math.abs(vx); } if (y < R) { y = R; vy = Math.abs(vy) * .5; }
      if (y > H - 40 - R) { k.sfx('bad'); k.over(); }
    },
    draw() {
      k.clear('#62b9f0'); k.rect(0, H - 40, W, 40, '#3e9b3a');
      const c = k.ctx; c.save(); c.translate(x, y); c.rotate(rot); k.emo('⚽', 0, 0, R * 2.1); c.restore();
      k.text(k.score, W / 2, H * .15, 64, 'rgba(255,255,255,.9)');
      if (!on) k.text('Нажми на мяч', W / 2, H * .6, 22);
    }
  };
});

/* 29 Джетпак */
A({ id: 'jetpack', name: 'Джетпак', e: '🎒', cat: 'arc', how: 'Держи палец — летишь вверх, отпусти — вниз. Собирай монеты и облетай лазеры.' }, k => {
  const { W, H } = k, px = W * .25, top = 30, bot = H - 30; let y = H / 2, vy = 0, hold = false, d = 0, obs = [], coins = [], t = 1.2, ct = .5, fl = [];
  return {
    down() { hold = true; }, up() { hold = false; },
    update(dt) {
      const sp = 260 + d * .012; d += sp * dt;
      vy += (hold ? -1700 : 1400) * dt; vy = k.clamp(vy, -480, 560); y += vy * dt;
      if (y < top + 18) { y = top + 18; vy = 0; } if (y > bot - 18) { y = bot - 18; vy = 0; }
      if (hold) fl.push({ x: px - 8, y: y + 18, l: .25 }); fl.forEach(f => { f.l -= dt; f.x -= sp * dt; f.y += 60 * dt; }); fl = fl.filter(f => f.l > 0);
      t -= dt; if (t <= 0) { const len = k.R(80, 160), ang = k.pick([0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]); obs.push({ x: W + 100, y: k.R(top + len / 2, bot - len / 2), len, ang, rs: d > 4000 && Math.random() < .3 ? k.R(-1.5, 1.5) : 0 }); t = k.R(.9, 1.6) * 260 / sp + .3; }
      ct -= dt; if (ct <= 0) { const yy = k.R(top + 40, bot - 60), n = k.RI(3, 6); for (let i = 0; i < n; i++) coins.push({ x: W + 40 + i * 28, y: yy + Math.sin(i) * 20 }); ct = k.R(1.5, 3); }
      for (const o of obs) { o.x -= sp * dt; o.ang += o.rs * dt; const dx = Math.cos(o.ang) * o.len / 2, dy = Math.sin(o.ang) * o.len / 2; if (segD(o.x - dx, o.y - dy, o.x + dx, o.y + dy, px, y) < 20) { k.sfx('boom'); return k.over('Лазер!'); } }
      for (const c of coins) { c.x -= sp * dt; if (!c.got && Math.hypot(c.x - px, c.y - y) < 26) { c.got = true; k.add(); k.sfx('pop'); } }
      obs = obs.filter(o => o.x > -120); coins = coins.filter(c => c.x > -20 && !c.got);
    },
    draw() {
      k.clear('#2b2f45'); for (let x = (-d * .5) % 80; x < W; x += 80) k.rect(x, top, 40, bot - top, 'rgba(255,255,255,.03)');
      k.rect(0, 0, W, top, '#1a1d2e'); k.rect(0, bot, W, H - bot, '#1a1d2e');
      coins.forEach(c => k.emo('🪙', c.x, c.y, 22));
      obs.forEach(o => { const dx = Math.cos(o.ang) * o.len / 2, dy = Math.sin(o.ang) * o.len / 2; k.line(o.x - dx, o.y - dy, o.x + dx, o.y + dy, 'rgba(255,60,80,.35)', 14); k.line(o.x - dx, o.y - dy, o.x + dx, o.y + dy, '#ff6b7f', 5); k.circ(o.x - dx, o.y - dy, 8, '#bbb'); k.circ(o.x + dx, o.y + dy, 8, '#bbb'); });
      fl.forEach(f => k.circ(f.x, f.y, 10 * f.l * 4, `rgba(255,${150 + f.l * 400},60,${f.l * 3})`));
      const c = k.ctx; c.save(); c.translate(px, y); c.scale(-1, 1); k.emo('🧑‍🚀', 0, 0, 36); c.restore();
    }
  };
  function segD(x1, y1, x2, y2, px, py) { const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy; let t = ((px - x1) * dx + (py - y1) * dy) / l; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - x1 - t * dx, py - y1 - t * dy); }
});

/* 30 Аэрохоккей */
A({ id: 'airhockey', name: 'Аэрохоккей', e: '🥅', cat: 'arc', how: 'Двигай свою биту пальцем и забивай шайбу в ворота сверху. Игра до 7 голов.' }, k => {
  const { W, H } = k, mr = Math.min(W, H) * .075, pr = mr * .7, gw = W * .38;
  let me = { x: W / 2, y: H * .8, vx: 0, vy: 0 }, ai = { x: W / 2, y: H * .2, vx: 0, vy: 0 }, pk, them = 0, pause = 0, tx = W / 2, ty = H * .8;
  const serve = up => { pk = { x: W / 2, y: up ? H * .4 : H * .6, vx: 0, vy: 0 }; pause = .7; };
  serve(false);
  function coll(m) { const dx = pk.x - m.x, dy = pk.y - m.y, d = Math.hypot(dx, dy); if (d < mr + pr && d > 0) { const nx = dx / d, ny = dy / d; pk.x = m.x + nx * (mr + pr); pk.y = m.y + ny * (mr + pr); const rel = (pk.vx - m.vx) * nx + (pk.vy - m.vy) * ny; if (rel < 0) { pk.vx -= 1.9 * rel * nx; pk.vy -= 1.9 * rel * ny; } const s = Math.hypot(pk.vx, pk.vy), mx = 1500; if (s > mx) { pk.vx *= mx / s; pk.vy *= mx / s; } k.sfx('hit'); } }
  return {
    down(x, y) { tx = x; ty = y; }, move(x, y, p) { if (p) { tx = x; ty = y; } },
    update(dt) {
      const ox = me.x, oy = me.y; me.x = k.clamp(tx, mr, W - mr); me.y = k.clamp(ty, H / 2 + mr, H - mr); me.vx = (me.x - ox) / dt; me.vy = (me.y - oy) / dt;
      const ax = ai.x, ay = ai.y, as = 260 + k.score * 25 + them * 10;
      let gx = pk.y < H / 2 ? pk.x : W / 2, gy = pk.y < H / 2 ? (pk.y < ai.y ? H * .08 : pk.y - mr) : H * .15;
      const dd = Math.hypot(gx - ai.x, gy - ai.y); if (dd > 1) { const s = Math.min(dd, as * dt); ai.x += (gx - ai.x) / dd * s; ai.y += (gy - ai.y) / dd * s; }
      ai.x = k.clamp(ai.x, mr, W - mr); ai.y = k.clamp(ai.y, mr, H / 2 - mr); ai.vx = (ai.x - ax) / dt; ai.vy = (ai.y - ay) / dt;
      if (pause > 0) { pause -= dt; return; }
      const n = 4; for (let i = 0; i < n; i++) {
        pk.x += pk.vx * dt / n; pk.y += pk.vy * dt / n;
        if (pk.x < pr) { pk.x = pr; pk.vx = Math.abs(pk.vx) * .9; } if (pk.x > W - pr) { pk.x = W - pr; pk.vx = -Math.abs(pk.vx) * .9; }
        const inGoal = Math.abs(pk.x - W / 2) < gw / 2;
        if (pk.y < pr && !inGoal) { pk.y = pr; pk.vy = Math.abs(pk.vy) * .9; } if (pk.y > H - pr && !inGoal) { pk.y = H - pr; pk.vy = -Math.abs(pk.vy) * .9; }
        if (pk.y < -pr) { k.add(); k.sfx('point'); if (k.score >= 7) return k.win('Победа ' + k.score + ':' + them + '!'); serve(true); return; }
        if (pk.y > H + pr) { them++; k.sfx('bad'); if (them >= 7) return k.over('Поражение ' + k.score + ':' + them); serve(false); return; }
        coll(me); coll(ai);
      }
      pk.vx *= .996; pk.vy *= .996;
    },
    draw() {
      k.clear('#dff3ff'); k.line(0, H / 2, W, H / 2, '#ff8a9a', 3); k.ring(W / 2, H / 2, 50, '#ff8a9a', 3);
      k.rect(W / 2 - gw / 2, 0, gw, 6, '#222'); k.rect(W / 2 - gw / 2, H - 6, gw, 6, '#222');
      k.circ(pk.x, pk.y, pr, '#222');
      [[me, '#2a7de1'], [ai, '#e12a4a']].forEach(([m, c]) => { k.circ(m.x, m.y, mr, c); k.circ(m.x, m.y, mr * .5, 'rgba(255,255,255,.35)'); });
      k.text(them, 20, H / 2 - 22, 26, '#e12a4a', 'left'); k.text(k.score, 20, H / 2 + 22, 26, '#2a7de1', 'left');
    }
  };
});

/* 31 Зигзаг */
A({ id: 'zigzag', name: 'Зигзаг', e: '↗️', cat: 'arc', how: 'Шарик катится по дорожке. Нажимай, чтобы сменить направление. Не упади с края!' }, k => {
  const { W, H } = k, w = 46; let pts = [[W / 2, 0]], dir = 1, bx = W / 2, by = 0, cam = -H * .7, gems = [], falling = 0;
  function extend() { while (pts[pts.length - 1][1] > by - H * 1.5) { const [x, y] = pts[pts.length - 1], nd = pts.length % 2 ? 1 : -1; let len = k.R(30, 160); const nx = k.clamp(x + nd * len, w, W - w); len = Math.abs(nx - x); if (len < 10) { pts.push([x - nd * 40, y - 40]); continue; } pts.push([nx, y - len]); if (Math.random() < .3) { const t = k.R(.2, .8); gems.push({ x: x + (nx - x) * t, y: y - len * t }); } } }
  extend();
  function pathX(y) { for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; if (y <= a[1] && y >= b[1]) { const t = (a[1] - y) / (a[1] - b[1] || 1); return a[0] + (b[0] - a[0]) * t; } } return null; }
  return {
    down() { if (!falling) { dir = -dir; k.add(); k.sfx('tap'); } },
    update(dt) {
      if (falling) { falling += dt; if (falling > .6) k.over(); return; }
      const sp = 170 + k.score * 1.5; bx += dir * sp * dt; by -= sp * dt;
      cam += ((by - H * .7) - cam) * Math.min(1, dt * 5);
      extend(); pts = pts.filter((p, i) => i >= pts.length - 2 || pts[i + 1][1] < cam + H + 50 || p[1] < cam + H + 50);
      const px = pathX(by); if (px === null || Math.abs(px - bx) > w / 2 + 4) { falling = .001; k.sfx('bad'); }
      for (const g of gems) if (!g.got && Math.hypot(g.x - bx, g.y - by) < 20) { g.got = true; k.add(3); k.sfx('point'); }
      gems = gems.filter(g => !g.got && g.y < cam + H + 30);
    },
    draw() {
      k.clear('#88d8e8'); const c = k.ctx; c.save(); c.translate(0, -cam);
      c.strokeStyle = '#4a5bd4'; c.lineWidth = w + 10; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
      c.strokeStyle = '#f2f4ff'; c.lineWidth = w; c.stroke();
      gems.forEach(g => k.emo('💎', g.x, g.y, 20));
      k.circ(bx, by + falling * 300, 11 * (1 - falling), '#ff5d73');
      c.restore();
      k.text(k.score, W / 2, 50, 44, '#fff');
    }
  };
});

/* 32 Гексагон */
A({ id: 'hexagon', name: 'Гексагон', e: '⬡', cat: 'arc', how: 'Держи палец слева или справа, чтобы крутиться вокруг центра. Проскальзывай в просветы стен.', fmt: v => (v / 10).toFixed(1) + 'с' }, k => {
  const { W, H } = k, cx = W / 2, cy = H / 2, pr = 50; let pa = 0, hold = 0, walls = [], t = 0, time = 0, rot = 0;
  return {
    down(x) { hold = x < W / 2 ? -1 : 1; }, move(x, y, p) { if (p) hold = x < W / 2 ? -1 : 1; }, up() { hold = 0; },
    update(dt) {
      time += dt; k.set(Math.floor(time * 10)); rot += dt * (.6 + Math.sin(time * .3) * .6);
      pa += hold * 6.5 * dt;
      const sp = 170 + time * 3; t -= dt;
      if (t <= 0) { const gap = k.RI(0, 5), pat = Math.random() < .5 ? [gap] : [gap, (gap + 3) % 6]; for (let s = 0; s < 6; s++) if (!pat.includes(s)) walls.push({ s, d: Math.max(W, H) * .75, th: 18 }); t = Math.max(.55, 1.1 - time * .01); }
      walls.forEach(w => w.d -= sp * dt); walls = walls.filter(w => w.d + w.th > 10);
      const sec = Math.floor(((pa % 6.283) + 6.283) % 6.283 / (Math.PI / 3));
      for (const w of walls) if (w.s === sec && pr + 6 > w.d && pr - 6 < w.d + w.th) { k.sfx('hit'); return k.over(); }
    },
    draw() {
      const hue = (time * 20) % 360; k.clear(`hsl(${hue},40%,12%)`); const c = k.ctx; c.save(); c.translate(cx, cy); c.rotate(rot);
      for (let s = 0; s < 6; s++) { const a0 = s * Math.PI / 3, a1 = a0 + Math.PI / 3; c.fillStyle = s % 2 ? `hsl(${hue},40%,16%)` : `hsl(${hue},40%,10%)`; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); c.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); c.fill(); }
      walls.forEach(w => { const a0 = w.s * Math.PI / 3, a1 = a0 + Math.PI / 3, r0 = Math.max(0, w.d), r1 = w.d + w.th; k.poly([[Math.cos(a0) * r0, Math.sin(a0) * r0], [Math.cos(a1) * r0, Math.sin(a1) * r0], [Math.cos(a1) * r1, Math.sin(a1) * r1], [Math.cos(a0) * r1, Math.sin(a0) * r1]], `hsl(${hue},80%,65%)`); });
      const hx = []; for (let i = 0; i < 6; i++) hx.push([Math.cos(i * Math.PI / 3) * 34, Math.sin(i * Math.PI / 3) * 34]); k.poly(hx, `hsl(${hue},80%,65%)`);
      c.rotate(pa); k.poly([[pr + 10, 0], [pr, -7], [pr, 7]], '#fff'); c.restore();
    }
  };
});

/* 33 Утки */
A({ id: 'ducks', name: 'Утки', e: '🦆', cat: 'arc', how: 'Стреляй по уткам, нажимая на них. Упустишь 5 уток — конец.' }, k => {
  const { W, H } = k; let ducks = [], t = 0, miss = 0, fx = [];
  return {
    down(x, y) { fx.push({ x, y, l: .15, s: '✳️' }); k.sfx('boom'); for (const d of ducks) if (!d.hit && Math.hypot(d.x - x, d.y - y) < 36) { d.hit = true; d.vy = 0; k.add(d.gold ? 3 : 1); k.sfx('point'); return; } },
    update(dt) {
      t -= dt; if (t <= 0) { const l = Math.random() < .5; ducks.push({ x: l ? -30 : W + 30, y: k.R(H * .15, H * .65), vx: (l ? 1 : -1) * (k.R(110, 170) + k.score * 3), vy: k.R(-40, 40), ph: k.R(0, 6), gold: Math.random() < .1 }); t = Math.max(.4, 1.2 - k.score * .015); }
      for (const d of ducks) { if (d.hit) { d.vy += 900 * dt; d.y += d.vy * dt; continue; } d.x += d.vx * dt; d.y += (d.vy + Math.sin(k.t * 4 + d.ph) * 60) * dt; if (d.y < 30 || d.y > H * .75) d.vy *= -1; if (d.x < -50 || d.x > W + 50) { d.gone = true; miss++; k.sfx('bad'); } }
      ducks = ducks.filter(d => !d.gone && d.y < H + 40);
      fx.forEach(f => f.l -= dt); fx = fx.filter(f => f.l > 0);
      if (miss >= 5) k.over();
    },
    draw() {
      k.clear('#8fd3ff'); k.rect(0, H * .8, W, H * .2, '#5fbf4a'); for (let x = 10; x < W; x += 34) k.emo('🌾', x, H * .8, 34);
      const c = k.ctx; ducks.forEach(d => { c.save(); c.translate(d.x, d.y); if (d.vx > 0) c.scale(-1, 1); if (d.hit) c.rotate(Math.PI); if (d.gold) c.filter = 'sepia(1) saturate(4)'; k.emo('🦆', 0, 0, 44); c.restore(); });
      fx.forEach(f => k.emo('💥', f.x, f.y, 30));
      k.text('Упущено: ' + miss + '/5', W / 2, 20, 16, '#234');
    }
  };
});

/* 34 Рыбки */
A({ id: 'fish', name: 'Рыбки', e: '🐟', cat: 'arc', how: 'Веди рыбку пальцем. Ешь рыб меньше себя и расти. Больших — избегай!' }, k => {
  const { W, H } = k; let x = W / 2, y = H / 2, tx = x, ty = y, size = 26, fish = [], t = 0, face = 1;
  const E = ['🐟', '🐠', '🐡', '🦐', '🐙', '🦈', '🐋'];
  return {
    down(px, py) { tx = px; ty = py; }, move(px, py, p) { if (p) { tx = px; ty = py; } },
    update(dt) {
      const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy), sp = 260; if (d > 2) { const s = Math.min(d, sp * dt); x += dx / d * s; y += dy / d * s; if (Math.abs(dx) > 2) face = dx > 0 ? 1 : -1; }
      t -= dt; if (t <= 0) { const l = Math.random() < .5, sz = Math.max(10, size * k.R(.4, 1.7)); fish.push({ x: l ? -sz : W + sz, y: k.R(30, H - 30), vx: (l ? 1 : -1) * k.R(50, 140), sz, e: sz > size * 1.25 ? k.pick(['🦈', '🐡', '🐋']) : k.pick(['🐟', '🐠', '🦐', '🐙']) }); t = k.R(.4, .9); }
      for (const f of fish) {
        f.x += f.vx * dt;
        if (Math.hypot(f.x - x, f.y - y) < (f.sz + size) * .38) {
          if (f.sz < size) { f.dead = true; k.add(Math.ceil(f.sz / 5)); size = Math.min(80, size + f.sz * .06); k.sfx('pop'); }
          else { k.sfx('bad'); return k.over('Тебя съели!'); }
        }
      }
      fish = fish.filter(f => !f.dead && f.x > -100 && f.x < W + 100);
    },
    draw() {
      const g = k.ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1fa2d6'); g.addColorStop(1, '#0a3a66'); k.ctx.fillStyle = g; k.ctx.fillRect(0, 0, W, H);
      const c = k.ctx; fish.forEach(f => { c.save(); c.translate(f.x, f.y); if (f.vx > 0) c.scale(-1, 1); k.emo(f.e, 0, 0, f.sz); c.restore(); if (f.sz >= size) k.ring(f.x, f.y, f.sz * .55, 'rgba(255,80,80,.5)', 2); });
      c.save(); c.translate(x, y); if (face > 0) c.scale(-1, 1); k.emo('🐟', 0, 0, size); c.restore(); k.ring(x, y, size * .55, 'rgba(255,255,255,.6)', 2);
    }
  };
});

/* 35 Трон */
A({ id: 'tron', name: 'Трон', e: '🏍️', cat: 'arc', how: 'Ты — синий. Проводи пальцем, чтобы повернуть. Не врезайся в стены и следы. Пусть красный врежется первым!' }, k => {
  const cols = 28, g = k.fit(cols, Math.floor(cols * (k.H - 30) / k.W), 30, 0, 4), rows = g.rows; let grid, me, ai, acc = 0, q = [], over = 0, msg = '';
  function round() { grid = Array.from({ length: rows }, () => Array(cols).fill(0)); me = { c: 4, r: Math.floor(rows / 2), d: [1, 0] }; ai = { c: cols - 5, r: Math.floor(rows / 2), d: [-1, 0] }; grid[me.r][me.c] = 1; grid[ai.r][ai.c] = 2; q = []; acc = 0; }
  round();
  const free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && !grid[r][c];
  function space(c, r) { const seen = new Set(), st = [[c, r]]; let n = 0; while (st.length && n < 120) { const [a, b] = st.pop(); const key = a * 1000 + b; if (seen.has(key) || !free(a, b)) continue; seen.add(key); n++; st.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]); } return n; }
  return {
    swipe(d) { const v = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] }[d], l = q.length ? q[q.length - 1] : me.d; if (v[0] !== -l[0] || v[1] !== -l[1]) q.push(v); },
    update(dt) {
      if (over) { over -= dt; if (over <= 0) round(); return; }
      acc += dt; if (acc < .085) return; acc = 0;
      if (q.length) me.d = q.shift();
      const opts = [ai.d, [ai.d[1], ai.d[0]], [-ai.d[1], -ai.d[0]]];
      let best = ai.d, bs = -1; for (const o of opts) { const s = space(ai.c + o[0], ai.r + o[1]) + (o === ai.d ? 2 : 0) + Math.random() * 3; if (s > bs) { bs = s; best = o; } } ai.d = best;
      const m2 = [me.c + me.d[0], me.r + me.d[1]], a2 = [ai.c + ai.d[0], ai.r + ai.d[1]];
      const mDead = !free(...m2) || (m2[0] === a2[0] && m2[1] === a2[1]), aDead = !free(...a2) || (m2[0] === a2[0] && m2[1] === a2[1]);
      if (mDead) { k.sfx('boom'); return k.over(aDead ? 'Ничья — оба разбились' : 'Ты врезался!'); }
      if (aDead) { k.add(); k.sfx('win'); k.toast('Раунд выигран!', '#7df9ff'); over = 1; }
      [me.c, me.r] = m2; grid[me.r][me.c] = 1; if (!aDead) { [ai.c, ai.r] = a2; grid[ai.r][ai.c] = 2; }
    },
    draw() {
      k.clear('#04030c'); const { cs, x, y } = g; k.srect(x - 2, y - 2, cs * cols + 4, cs * rows + 4, '#334', 2);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c]) k.rect(x + c * cs, y + r * cs, cs, cs, grid[r][c] === 1 ? '#35c2ff' : '#ff4b6b');
      k.rect(x + me.c * cs - 1, y + me.r * cs - 1, cs + 2, cs + 2, '#fff'); k.rect(x + ai.c * cs - 1, y + ai.r * cs - 1, cs + 2, cs + 2, '#ffd0d8');
      k.text('Побед: ' + k.score, k.W / 2, 16, 15, k.P.dim);
    }
  };
});

/* 36 Плинко */
A({ id: 'plinko', name: 'Плинко', e: '🔻', cat: 'arc', how: 'Нажми сверху, чтобы бросить шарик. Он отскакивает от гвоздиков и падает в лунку с очками. 10 шариков.' }, k => {
  const { W, H } = k, V = [50, 10, 5, 2, 1, 2, 5, 10, 50], bw = W / V.length, pegs = [], top = 90; let balls = [], left = 10, flash = [];
  const rows = 10, sp = (H - top - 120) / rows;
  for (let r = 0; r < rows; r++) { const n = r % 2 ? 8 : 9; for (let i = 0; i < n; i++) pegs.push([(i + (r % 2 ? 1 : .5)) * W / 9, top + 30 + r * sp]); }
  return {
    down(x, y) { if (left > 0 && y < top + 20 && balls.length < 3) { left--; balls.push({ x: k.clamp(x, 10, W - 10), y: 30, vx: k.R(-20, 20), vy: 0 }); k.sfx('tap'); } else if (left > 0 && balls.length < 3) { left--; balls.push({ x: k.clamp(x, 10, W - 10), y: 30, vx: k.R(-20, 20), vy: 0 }); k.sfx('tap'); } },
    update(dt) {
      for (const b of balls) {
        for (let s = 0; s < 3; s++) {
          b.vy += 900 * dt / 3; b.x += b.vx * dt / 3; b.y += b.vy * dt / 3;
          if (b.x < 8) { b.x = 8; b.vx = Math.abs(b.vx); } if (b.x > W - 8) { b.x = W - 8; b.vx = -Math.abs(b.vx); }
          for (const p of pegs) { const dx = b.x - p[0], dy = b.y - p[1], d = Math.hypot(dx, dy); if (d < 13 && d > 0) { const nx = dx / d, ny = dy / d; b.x = p[0] + nx * 13; b.y = p[1] + ny * 13; const dot = b.vx * nx + b.vy * ny; if (dot < 0) { b.vx = (b.vx - 1.5 * dot * nx) + k.R(-25, 25); b.vy = (b.vy - 1.5 * dot * ny) * .7; } if (Math.random() < .3) k.sfx('pop'); } }
        }
        if (b.y > H - 50) { b.done = true; const i = k.clamp(Math.floor(b.x / bw), 0, V.length - 1); k.add(V[i]); flash.push({ i, l: .6 }); k.sfx(V[i] >= 10 ? 'win' : 'point'); }
      }
      balls = balls.filter(b => !b.done); flash.forEach(f => f.l -= dt); flash = flash.filter(f => f.l > 0);
      if (left <= 0 && !balls.length) k.over('Шарики кончились');
    },
    draw() {
      k.clear('#1b1446'); k.rect(0, 0, W, top, 'rgba(255,255,255,.05)'); k.text('Шариков: ' + left, W / 2, 20, 16, k.P.dim);
      if (left) k.text('↓ нажми, чтобы бросить ↓', W / 2, 50, 15, 'rgba(255,255,255,.5)');
      pegs.forEach(p => k.circ(p[0], p[1], 5, '#cfc9ff'));
      V.forEach((v, i) => { const f = flash.find(f => f.i === i); k.rect(i * bw + 2, H - 50, bw - 4, 46, f ? '#fff' : k.C[Math.abs(4 - i) % 7], 8); k.text(v, i * bw + bw / 2, H - 27, bw > 40 ? 18 : 14, '#1a1347'); });
      balls.forEach(b => k.circ(b.x, b.y, 8, '#ffd84d'));
    }
  };
});

/* 37 Палочник */
A({ id: 'stick', name: 'Палочник', e: '🥢', cat: 'arc', how: 'Держи палец — палка растёт. Отпусти — она падает. Дотянись ровно до следующей платформы!' }, k => {
  const { W, H } = k, gy = H * .68; let plats, hero, stick = 0, ang = 0, st = 'idle', off = 0, walk = 0, fall = 0;
  function newPlat(x) { return { x, w: k.R(30, 90) }; }
  plats = [{ x: 0, w: 80 }]; plats.push(newPlat(80 + k.R(60, W * .55)));
  hero = 80 - 14;
  return {
    down() { if (st === 'idle') st = 'grow'; }, up() { if (st === 'grow') { st = 'drop'; k.sfx('tap'); } },
    update(dt) {
      if (st === 'grow') stick += 320 * dt;
      if (st === 'drop') { ang += 5 * dt; if (ang >= Math.PI / 2) { ang = Math.PI / 2; k.sfx('hit'); const p = plats[1], tip = plats[0].x + plats[0].w + stick; st = tip >= p.x && tip <= p.x + p.w ? 'walk' : 'walkfail'; if (st === 'walk' && Math.abs(tip - (p.x + p.w / 2)) < 6) { k.add(1); k.toast('Точно! +2', '#ffd84d'); } walk = st === 'walk' ? p.x + p.w - 14 : tip; } }
      if (st === 'walk' || st === 'walkfail') { hero += 260 * dt; if (hero >= walk) { hero = walk; if (st === 'walk') { k.add(); k.sfx('point'); st = 'shift'; off = plats[1].x; } else { st = 'fall'; } } }
      if (st === 'fall') { fall += 900 * dt; ang = Math.min(Math.PI, ang + 4 * dt); if (fall > H) k.over(); }
      if (st === 'shift') { const s = Math.min(off, 600 * dt); off -= s; plats.forEach(p => p.x -= s); hero -= s; if (off <= 0) { plats.shift(); const l = plats[0]; plats.push(newPlat(l.x + l.w + k.R(40, W * .55 - l.w))); stick = 0; ang = 0; st = 'idle'; } }
    },
    draw() {
      k.clear('#ffd7a8'); k.circ(W * .7, gy * .4, 50, '#ffecc8');
      plats.forEach(p => { k.rect(p.x, gy, p.w, H - gy, '#2a2238'); k.rect(p.x + p.w / 2 - 4, gy, 8, 4, '#ff3b5b'); });
      const c = k.ctx, sx = plats[0].x + plats[0].w; c.save(); c.translate(sx, gy); c.rotate(ang); k.rect(-2, -stick, 4, stick, '#3a2a1a'); c.restore();
      k.emo('🧍', hero, gy - 18 + fall, 34);
    }
  };
});

/* 38 Падение */
A({ id: 'falldown', name: 'Падение', e: '⬇️', cat: 'arc', how: 'Держи палец слева или справа, чтобы катить шарик. Проваливайся в дыры, не дай полу утащить тебя вверх!' }, k => {
  const { W, H } = k, r = 11; let x = W / 2, y = H * .3, vy = 0, hold = 0, rows = [], t = 0, sp = 70, passed = 0;
  for (let i = 1; i < 6; i++) rows.push(mk(H * .3 + i * 120));
  function mk(yy) { const gw = k.R(50, 70); return { y: yy, gx: k.R(0, W - gw), gw, done: false }; }
  return {
    down(px) { hold = px < W / 2 ? -1 : 1; }, move(px, py, p) { if (p) hold = px < W / 2 ? -1 : 1; }, up() { hold = 0; },
    update(dt) {
      sp = 70 + passed * 2; x = k.clamp(x + hold * 300 * dt, r, W - r);
      rows.forEach(rw => rw.y -= sp * dt);
      vy += 1400 * dt; let ny = y + vy * dt;
      for (const rw of rows) { const inGap = x - r > rw.gx - 2 && x + r < rw.gx + rw.gw + 2; if (!inGap && y + r <= rw.y + 2 && ny + r >= rw.y) { ny = rw.y - r; vy = 0; } if (!rw.done && y > rw.y) { rw.done = true; passed++; k.add(); k.sfx('tap'); } }
      y = Math.min(ny, H - r);
      if (rows[rows.length - 1].y < H + 10) rows.push(mk(rows[rows.length - 1].y + k.R(90, 130)));
      rows = rows.filter(rw => rw.y > -20);
      if (y < -r) { k.sfx('bad'); k.over(); }
    },
    draw() {
      k.clear('#16123a'); rows.forEach(rw => { k.rect(0, rw.y, rw.gx, 10, '#7b6bff', 3); k.rect(rw.gx + rw.gw, rw.y, W - rw.gx - rw.gw, 10, '#7b6bff', 3); });
      k.circ(x, y, r, '#ffde3d'); k.rect(0, 0, W, 6, 'rgba(255,60,90,.7)');
    }
  };
});

/* 39 Посадка */
A({ id: 'lander', name: 'Посадка', e: '🛸', cat: 'arc', how: 'Держи палец — включается двигатель. Палец левее корабля — летит вправо, правее — влево. Сядь мягко на площадку!' }, k => {
  const { W, H } = k; let s, lvl = 0, terr, pad, hold = null, msgT = 0;
  function level() { lvl++; s = { x: W * .2, y: 60, vx: 40, vy: 0, fuel: Math.max(40, 110 - lvl * 6) }; const n = 16; terr = []; for (let i = 0; i <= n; i++) terr.push([i * W / n, H - k.R(30, 140)]); const pi = k.RI(2, n - 3), pw = Math.max(1, 2 - Math.floor(lvl / 4)); pad = { x1: terr[pi][0], x2: terr[pi + pw][0], y: H - k.R(40, 120) }; for (let i = pi; i <= pi + pw; i++) terr[i][1] = pad.y; }
  level();
  const groundY = x => { for (let i = 1; i < terr.length; i++) if (x <= terr[i][0]) { const a = terr[i - 1], b = terr[i], t = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t; } return H; };
  return {
    down(x) { hold = x; }, move(x, y, p) { if (p) hold = x; }, up() { hold = null; },
    update(dt) {
      if (msgT > 0) { msgT -= dt; if (msgT <= 0) level(); return; }
      s.vy += 90 * dt;
      if (hold !== null && s.fuel > 0) { const hx = k.clamp((s.x - hold) / 120, -1, 1); s.vy -= 200 * dt; s.vx += hx * 110 * dt; s.fuel -= 12 * dt; }
      s.x += s.vx * dt; s.y += s.vy * dt; if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      const gyy = groundY(s.x);
      if (s.y + 16 >= gyy) {
        const onPad = s.x - 12 >= pad.x1 && s.x + 12 <= pad.x2;
        if (onPad && s.vy < 70 && Math.abs(s.vx) < 50) { const pts = 10 + Math.round(s.fuel / 5); k.add(pts); k.sfx('win'); k.toast('Посадка! +' + pts, '#7dff8a'); s.y = gyy - 16; msgT = 1.2; }
        else { k.sfx('boom'); k.over(onPad ? 'Слишком быстро!' : 'Мимо площадки!'); }
      }
    },
    draw() {
      k.clear('#060418'); for (let i = 0; i < 40; i++) k.rect((i * 97) % W, (i * 53) % (H * .6), 2, 2, 'rgba(255,255,255,.5)');
      k.poly([[0, H], ...terr, [W, H]], '#4b4466'); k.rect(pad.x1, pad.y - 3, pad.x2 - pad.x1, 6, '#47d873', 3);
      if (hold !== null && s.fuel > 0 && msgT <= 0) k.poly([[s.x - 6, s.y + 14], [s.x + 6, s.y + 14], [s.x, s.y + 30 + Math.random() * 10]], '#ffa53d');
      k.emo('🛸', s.x, s.y, 36);
      k.rect(10, 10, 100, 8, '#333', 4); k.rect(10, 10, s.fuel / Math.max(40, 110 - lvl * 6) * 100, 8, '#ffde3d', 4);
      const bad = s.vy > 70 || Math.abs(s.vx) > 50; k.text('Скорость ' + Math.round(Math.hypot(s.vx, s.vy)), W - 10, 16, 14, bad ? '#ff5d73' : '#7dff8a', 'right');
      k.text('Ур. ' + lvl, W / 2, 16, 14, k.P.dim);
    }
  };
});

/* 40 Бегун */
A({ id: 'runner3', name: 'Бегун', e: '🏃', cat: 'arc', how: 'Смахни влево/вправо — сменить дорожку, вверх — прыгнуть через барьер. Собирай монеты!' }, k => {
  const { W, H } = k, lw = Math.min(110, W / 3.4), x0 = W / 2 - lw * 1.5; let lane = 1, x = W / 2, jump = 0, obs = [], t = 0, d = 0, sp = 330;
  return {
    swipe(dd) { if (dd === 'L') lane = Math.max(0, lane - 1); if (dd === 'R') lane = Math.min(2, lane + 1); if (dd === 'U' && jump <= 0) { jump = .6; k.sfx('jump'); } },
    tap(px) { lane = k.clamp(lane + (px < W / 2 ? -1 : 1), 0, 2); },
    update(dt) {
      sp = 330 + d * .015; d += sp * dt; jump -= dt; x += (x0 + lw * (lane + .5) - x) * Math.min(1, dt * 15);
      t -= dt; if (t <= 0) { const kinds = []; const block = k.RI(0, 2); for (let l = 0; l < 3; l++) { const r = Math.random(); if (l === block) kinds.push({ l, k: 'train' }); else if (r < .35) kinds.push({ l, k: 'bar' }); else if (r < .7) kinds.push({ l, k: 'coin' }); } kinds.forEach(o => obs.push({ ...o, y: -60 })); t = k.R(.7, 1.2) * 330 / sp + .2; }
      const py = H - 120;
      for (const o of obs) { o.y += sp * dt; if (o.l === lane && !o.done && Math.abs(o.y - py) < (o.k === 'train' ? 60 : 24)) { if (o.k === 'coin') { o.done = true; k.add(1); k.sfx('pop'); } else if (o.k === 'bar' && jump > 0) { } else { k.sfx('boom'); return k.over(); } } }
      obs = obs.filter(o => o.y < H + 80 && !o.done);
    },
    draw() {
      k.clear('#7a5a3a'); k.rect(x0, 0, lw * 3, H, '#5b5b66');
      for (let l = 0; l <= 3; l++) k.rect(x0 + l * lw - 2, 0, 4, H, '#999');
      obs.forEach(o => { const cx = x0 + lw * (o.l + .5); if (o.k === 'train') { k.rect(cx - lw * .42, o.y - 60, lw * .84, 120, '#d63c3c', 10); k.rect(cx - lw * .3, o.y - 50, lw * .6, 26, '#9be3ff', 4); } else if (o.k === 'bar') { k.rect(cx - lw * .42, o.y - 8, lw * .84, 16, '#fff', 4); k.rect(cx - lw * .42, o.y - 8, lw * .84, 5, '#ff5d73', 3); } else k.emo('🪙', cx, o.y, 26); });
      const j = jump > 0 ? Math.sin((.6 - jump) / .6 * Math.PI) : 0;
      k.ctx.globalAlpha = .3; k.circ(x, H - 105, 14, '#000'); k.ctx.globalAlpha = 1;
      k.emo('🏃', x, H - 125 - j * 40, 44 + j * 12);
    }
  };
});

/* 41 Лыжник */
A({ id: 'ski', name: 'Лыжник', e: '⛷️', cat: 'arc', how: 'Двигай лыжника пальцем. Объезжай ёлки и камни, проезжай между флажками за бонус.' }, k => {
  const { W, H } = k, py = H * .3; let x = W / 2, tx = W / 2, objs = [], t = 0, d = 0, trail = [];
  return {
    down(px) { tx = px; }, move(px, pyy, p) { if (p) tx = px; },
    update(dt) {
      const sp = 220 + d * .01; d += sp * dt; x += k.clamp(tx - x, -300 * dt, 300 * dt);
      t -= dt; if (t <= 0) { if (Math.random() < .2) { const gx = k.R(60, W - 60); objs.push({ x: gx, y: H + 30, gate: true, w: 90 }); } else objs.push({ x: k.R(10, W - 10), y: H + 30, e: Math.random() < .75 ? '🌲' : '🪨' }); t = Math.max(.12, .45 - d / 20000); }
      for (const o of objs) {
        o.y -= sp * dt;
        if (o.gate && !o.done && o.y < py) { o.done = true; if (Math.abs(x - o.x) < o.w / 2) { k.add(5); k.sfx('point'); } }
        if (!o.gate && Math.abs(o.x - x) < 18 && Math.abs(o.y - py) < 18) { k.sfx('hit'); return k.over('Бум!'); }
      }
      objs = objs.filter(o => o.y > -40);
      trail.push([x, py + 14]); trail.forEach(p => p[1] -= sp * dt); trail = trail.filter(p => p[1] > -10);
      if (Math.floor(d / 100) > Math.floor((d - sp * dt) / 100)) k.add();
    },
    draw() {
      k.clear('#f5f9ff'); const c = k.ctx; c.strokeStyle = '#d4e2f2'; c.lineWidth = 3; c.beginPath(); trail.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
      objs.forEach(o => { if (o.gate) { k.emo('🚩', o.x - o.w / 2, o.y, 26); k.emo('🚩', o.x + o.w / 2, o.y, 26); } else k.emo(o.e, o.x, o.y, 36); });
      c.save(); c.translate(x, py); if (tx > x + 2) c.scale(-1, 1); k.emo('⛷️', 0, 0, 40); c.restore();
    }
  };
});

/* 42 Цветной мяч */
A({ id: 'colorball', name: 'Цветной мяч', e: '🔴', cat: 'arc', how: 'Нажимай, чтобы менять цвет мяча. Пропускай полоски только своего цвета!' }, k => {
  const { W, H } = k, C = [k.P.r, k.P.y, k.P.g, k.P.b], by = H * .75; let ci = 0, bars = [], t = 0, pulse = 0;
  return {
    down() { ci = (ci + 1) % 4; pulse = 1; k.sfx('tap'); },
    update(dt) {
      pulse = Math.max(0, pulse - dt * 4);
      const sp = 140 + k.score * 6; t -= dt; if (t <= 0) { bars.push({ y: -20, c: k.RI(0, 3) }); t = Math.max(.6, 1.4 - k.score * .02); }
      for (const b of bars) { b.y += sp * dt; if (!b.done && b.y >= by) { b.done = true; if (b.c === ci) { k.add(); k.sfx('point'); } else { k.sfx('bad'); return k.over('Не тот цвет!'); } } }
      bars = bars.filter(b => b.y < H + 20);
    },
    draw() {
      k.clear('#15122b'); bars.forEach(b => k.rect(0, b.y - 8, W, 16, b.done ? 'rgba(255,255,255,.1)' : C[b.c], 4));
      k.circ(W / 2, by, 26 + pulse * 6, C[ci]); k.ring(W / 2, by, 34, 'rgba(255,255,255,.3)', 2);
      C.forEach((c, i) => k.circ(W / 2 - 45 + i * 30, by + 60, i === ci ? 10 : 7, c));
    }
  };
});

/* 43 Дуэль */
A({ id: 'duel', name: 'Дуэль', e: '🤠', cat: 'arc', how: 'Жди сигнала «ОГОНЬ!» и нажимай как можно быстрее. Нажмёшь раньше — проиграешь. Противник с каждым раундом быстрее.' }, k => {
  const { W, H } = k; let st = 'wait', t = k.R(1.5, 4), shot = 0, ai = 0, my = 0, res = '';
  const round = () => { st = 'wait'; t = k.R(1.5, 4); res = ''; };
  return {
    down() {
      if (st === 'wait') { st = 'done'; res = 'Фальстарт!'; k.sfx('bad'); return k.over('Фальстарт!'); }
      if (st === 'fire') { my = shot; if (my < ai) { st = 'res'; res = 'Ты быстрее! ' + Math.round(my * 1000) + ' мс'; k.add(); k.sfx('boom'); k.after(1.6, round); } }
    },
    update(dt) {
      if (st === 'wait') { t -= dt; if (t <= 0) { st = 'fire'; shot = 0; ai = Math.max(.17, .45 - k.score * .025) + k.R(-.03, .05); k.sfx('point'); } }
      else if (st === 'fire') { shot += dt; if (shot >= ai) { st = 'done'; k.sfx('boom'); k.over('Противник быстрее: ' + Math.round(ai * 1000) + ' мс'); } }
    },
    draw() {
      k.clear(st === 'fire' ? '#ffcf4d' : '#d9894a'); k.rect(0, H * .7, W, H * .3, '#b5651d');
      const c = k.ctx; c.save(); c.translate(W * .25, H * .62); c.scale(-1, 1); k.emo('🤠', 0, 0, 70); c.restore(); k.emo('🦹', W * .75, H * .62, 70);
      if (st === 'wait') k.text('Жди...', W / 2, H * .3, 40, '#3a1d06');
      if (st === 'fire') k.text('ОГОНЬ!', W / 2, H * .3, 60, '#b0000f');
      if (st === 'res') k.text(res, W / 2, H * .3, 26, '#1d4a06');
      k.text('Побед: ' + k.score, W / 2, 30, 18, '#3a1d06');
    }
  };
});

/* 44 Рыбалка */
A({ id: 'fishing', name: 'Рыбалка', e: '🎣', cat: 'arc', how: 'Лодка плывёт сама. Нажми — забросить крючок. Лови рыбу подороже за 60 секунд. Ботинок — 0, акула — минус 10!' }, k => {
  const { W, H } = k, wl = H * .2; let bx = W / 2, bd = 1, hook = null, fish = [], left = 60, t = 0;
  const T = [['🐟', 1, 1], ['🐠', 3, 1], ['🐡', 5, 1.2], ['🦑', 8, 1.3], ['🦞', 10, .8], ['👢', 0, .6], ['🦈', -10, 1.6]];
  return {
    down() { if (!hook) { hook = { x: bx, y: wl, vy: 380, f: null }; k.sfx('tap'); } },
    update(dt) {
      left -= dt; if (left <= 0) { left = 0; return k.over('Время вышло!'); }
      if (!hook) { bx += bd * 90 * dt; if (bx < 30 || bx > W - 30) bd *= -1; }
      t -= dt; if (t <= 0) { const depth = k.R(wl + 40, H - 30), dl = (depth - wl) / (H - wl), ty = T[Math.min(T.length - 1, Math.floor(k.R(0, 1) * (2 + dl * 5)))], l = Math.random() < .5; fish.push({ x: l ? -30 : W + 30, y: depth, vx: (l ? 1 : -1) * k.R(40, 110) * ty[2], t: ty }); t = k.R(.3, .7); }
      fish.forEach(f => { if (f !== (hook && hook.f)) f.x += f.vx * dt; }); fish = fish.filter(f => f.x > -60 && f.x < W + 60);
      if (hook) {
        hook.y += hook.vy * dt;
        if (!hook.f && hook.vy > 0) for (const f of fish) if (Math.hypot(f.x - hook.x, f.y - hook.y) < 24) { hook.f = f; hook.vy = -420; k.sfx('hit'); break; }
        if (hook.y > H - 10) hook.vy = -500;
        if (hook.f) { hook.f.x = hook.x; hook.f.y = hook.y + 14; }
        if (hook.y <= wl) { if (hook.f) { const v = hook.f.t[1]; k.add(v); k.sfx(v > 0 ? 'point' : 'bad'); k.toast((v > 0 ? '+' : '') + v, v > 0 ? '#7dff8a' : '#ff5d73'); fish = fish.filter(f => f !== hook.f); } hook = null; }
      }
    },
    draw() {
      k.clear('#9fdcff'); const g = k.ctx.createLinearGradient(0, wl, 0, H); g.addColorStop(0, '#2c8bd0'); g.addColorStop(1, '#0b2a55'); k.ctx.fillStyle = g; k.ctx.fillRect(0, wl, W, H - wl);
      const c = k.ctx; fish.forEach(f => { c.save(); c.translate(f.x, f.y); if (f.vx > 0 && f !== (hook && hook.f)) c.scale(-1, 1); k.emo(f.t[0], 0, 0, 32); c.restore(); });
      if (hook) { k.line(hook.x, wl - 20, hook.x, hook.y, '#fff', 1.5); k.text('ʃ', hook.x, hook.y, 20, '#ddd'); }
      k.emo('🚣', hook ? hook.x : bx, wl - 16, 44);
      k.text(Math.ceil(left) + ' с', W / 2, 20, 18, '#134');
    }
  };
});

/* 45 Комета */
A({ id: 'comet', name: 'Комета', e: '☄️', cat: 'arc', how: 'Комета кружит вокруг звезды. Нажми, чтобы отпустить её по касательной. Долети до следующей звезды!' }, k => {
  const { W, H } = k, R = 46; let pins = [], cur, ang = Math.PI / 2, dir = 1, free = null, cam = 0, trail = [];
  pins.push({ x: W / 2, y: H * .7 }); for (let i = 1; i < 6; i++) addPin();
  function addPin() { const l = pins[pins.length - 1]; pins.push({ x: k.R(70, W - 70), y: l.y - k.R(150, 220) }); }
  cur = pins[0];
  const pos = () => free ? [free.x, free.y] : [cur.x + Math.cos(ang) * R, cur.y + Math.sin(ang) * R];
  return {
    down() { if (free) return; const w = (2.6 + k.score * .05) * dir; free = { x: cur.x + Math.cos(ang) * R, y: cur.y + Math.sin(ang) * R, vx: -Math.sin(ang) * w * R * 1.4, vy: Math.cos(ang) * w * R * 1.4 }; const s = Math.hypot(free.vx, free.vy); free.vx *= 330 / s; free.vy *= 330 / s; k.sfx('tap'); },
    update(dt) {
      if (!free) ang += (2.6 + k.score * .05) * dir * dt;
      else {
        free.x += free.vx * dt; free.y += free.vy * dt;
        for (const p of pins) if (p !== cur && p.y < cur.y + 5 && Math.hypot(p.x - free.x, p.y - free.y) < R + 14) { const cross = (free.x - p.x) * free.vy - (free.y - p.y) * free.vx; dir = cross > 0 ? 1 : -1; ang = Math.atan2(free.y - p.y, free.x - p.x); cur = p; free = null; k.add(); k.sfx('point'); while (pins.length < pins.indexOf(cur) + 6) addPin(); break; }
        if (free && (free.x < -20 || free.x > W + 20 || free.y > cam + H + 20 || free.y < cam - 200)) { k.sfx('bad'); return k.over('Улетела в космос'); }
      }
      cam += ((cur.y - H * .7) - cam) * Math.min(1, dt * 3);
      const [x, y] = pos(); trail.push([x, y, .5]); trail.forEach(p => p[2] -= dt); trail = trail.filter(p => p[2] > 0);
    },
    draw() {
      k.clear('#090620'); const c = k.ctx; c.save(); c.translate(0, -cam);
      for (let i = 0; i < 50; i++) k.rect((i * 131) % W, cam + ((i * 211 - cam * .3) % H + H) % H, 2, 2, 'rgba(255,255,255,.4)');
      pins.forEach(p => { k.ring(p.x, p.y, R, p === cur ? 'rgba(255,220,100,.35)' : 'rgba(255,255,255,.12)', 2); k.emo('⭐', p.x, p.y, 28); });
      trail.forEach(p => k.circ(p[0], p[1], 9 * p[2] * 2, `rgba(125,220,255,${p[2]})`));
      const [x, y] = pos(); k.circ(x, y, 9, '#e0faff');
      c.restore();
    }
  };
});
})();
