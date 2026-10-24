// Игры 66–88: головоломки и настольные игры против компьютера
(() => {
const A = G.add;

/* 66 Ханойская башня */
A({ id: 'hanoi', name: 'Ханойская башня', e: '🗼', cat: 'puz', how: 'Перенеси все диски на правый стержень. Нажми на стержень — взять верхний диск, нажми на другой — положить. Большой диск нельзя класть на маленький.' }, k => {
  const { W, H } = k; let n = 2, rods, held = null, moves = 0;
  const level = () => { n++; rods = [[...Array(n).keys()].map(i => n - i), [], []]; held = null; moves = 0; };
  level();
  const rx = i => W * (i * 2 + 1) / 6, by = H * .72, dh = Math.min(26, H * .4 / 8);
  return {
    tap(x) {
      const i = Math.floor(x / (W / 3));
      if (held === null) { if (rods[i].length) { held = i; k.sfx('tap'); } return; }
      if (i === held) { held = null; return; }
      const d = rods[held][rods[held].length - 1], top = rods[i][rods[i].length - 1];
      if (top && top < d) { k.sfx('bad'); held = null; return; }
      rods[i].push(rods[held].pop()); held = null; moves++; k.sfx('hit');
      if (rods[2].length === n) { k.add(n); k.sfx('win'); k.toast(n + ' дисков — готово! (' + moves + ' ходов)', '#ffd84d'); if (n >= 8) return k.win('Все уровни пройдены!'); k.after(1, level); }
    },
    draw() {
      k.clear('#1e2a3a'); k.rect(10, by, W - 20, 12, '#8a5a2b', 4);
      for (let i = 0; i < 3; i++) { k.rect(rx(i) - 4, by - dh * (n + 1.5), 8, dh * (n + 1.5), '#a8713a', 4); rods[i].forEach((d, j) => { const lift = held === i && j === rods[i].length - 1 ? -40 : 0, w = 24 + d * (W / 3 - 34) / 8; k.rect(rx(i) - w / 2, by - (j + 1) * dh + lift, w, dh - 2, k.C[d % 7], 8); }); }
      k.text('Дисков: ' + n + ' · ходов: ' + moves + ' · минимум: ' + (2 ** n - 1), W / 2, 30, 15, k.P.dim);
    }
  };
});

/* 67 Линии */
A({ id: 'lines', name: 'Линии', e: '🔵', cat: 'puz', how: 'Нажми на шарик, потом на пустую клетку — он перекатится, если есть путь. Собери 5 в линию (в т.ч. по диагонали). Иначе появятся 3 новых.' }, k => {
  const N = 9, g = k.fit(N, N, 70, 20, 8), cs = g.cs, C = k.C; let b = Array.from({ length: N }, () => Array(N).fill(-1)), sel = null, nxt = [], path = null;
  const empty = () => { const e = []; b.forEach((r, y) => r.forEach((v, x) => v < 0 && e.push([x, y]))); return e; };
  const gen = () => nxt = [0, 1, 2].map(() => k.RI(0, 6));
  function spawn() { for (const c of nxt) { const e = empty(); if (!e.length) break; const [x, y] = k.pick(e); b[y][x] = c; check(x, y); } gen(); if (!empty().length) k.over('Поле заполнено'); }
  function check(x, y) {
    const c = b[y][x]; if (c < 0) return false; const kill = new Set([y * N + x]);
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { const line = [[x, y]]; for (const s of [1, -1]) { let X = x + dx * s, Y = y + dy * s; while (X >= 0 && Y >= 0 && X < N && Y < N && b[Y][X] === c) { line.push([X, Y]); X += dx * s; Y += dy * s; } } if (line.length >= 5) line.forEach(([a, d]) => kill.add(d * N + a)); }
    if (kill.size >= 5) { kill.forEach(i => b[Math.floor(i / N)][i % N] = -1); k.add(kill.size * 2); k.sfx('win'); return true; } return false;
  }
  function route(a, t) { const prev = new Map([[a.join(), null]]), q = [a]; while (q.length) { const c = q.shift(); if (c[0] === t[0] && c[1] === t[1]) { const p = []; let k2 = c.join(); while (k2) { p.unshift(k2.split(',').map(Number)); k2 = prev.get(k2); } return p; } for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = c[0] + dx, Y = c[1] + dy, key = X + ',' + Y; if (X >= 0 && Y >= 0 && X < N && Y < N && b[Y][X] < 0 && !prev.has(key)) { prev.set(key, c.join()); q.push([X, Y]); } } } return null; }
  gen(); nxt = [0, 1, 2, 3, 4].map(() => k.RI(0, 6)); spawn();
  return {
    tap(x, y) {
      if (path) return; const c = k.cell(g, x, y); if (!c) return; const [cx, cy] = c;
      if (b[cy][cx] >= 0) { sel = c; k.sfx('tap'); return; }
      if (!sel) return; const p = route(sel, c); if (!p) { k.sfx('bad'); return; }
      path = { p, i: 0, c: b[sel[1]][sel[0]] }; b[sel[1]][sel[0]] = -1; sel = null;
    },
    update(dt) {
      if (!path) return; path.i += dt * 25;
      if (path.i >= path.p.length - 1) { const [x, y] = path.p[path.p.length - 1]; b[y][x] = path.c; path = null; k.sfx('hit'); if (!check(x, y)) spawn(); }
    },
    draw() {
      k.clear('#d9d4c7'); k.rect(g.x - 4, g.y - 4, cs * N + 8, cs * N + 8, '#8f8a7c', 6);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { k.rect(g.x + x * cs + 1, g.y + y * cs + 1, cs - 2, cs - 2, '#c2bcaa', 3); const v = b[y][x]; if (v >= 0) { const bounce = sel && sel[0] === x && sel[1] === y ? Math.abs(Math.sin(k.t * 8)) * cs * .12 : 0; k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2 - bounce, cs * .38, C[v]); k.circ(g.x + x * cs + cs * .4, g.y + y * cs + cs * .38 - bounce, cs * .1, 'rgba(255,255,255,.6)'); } }
      if (path) { const i = Math.floor(path.i), [x, y] = path.p[Math.min(i, path.p.length - 1)]; k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2, cs * .38, C[path.c]); }
      k.text('Далее:', k.W / 2 - 60, 34, 16, '#555'); nxt.forEach((c, i) => k.circ(k.W / 2 + i * 30, 34, 11, C[c]));
    }
  };
});

/* 68 Сортировка шариков */
A({ id: 'ballsort', name: 'Сортировка шариков', e: '🧪', cat: 'puz', how: 'Нажми на колбу — взять верхний шарик, нажми на другую — переложить. Класть можно на такой же цвет или в пустую колбу. Собери каждый цвет в свою колбу!' }, k => {
  const CAP = 4, COL = ['#ff5d73', '#ffa53d', '#ffde3d', '#47d873', '#35c2ff', '#7b6bff', '#e45cff', '#ffffff', '#8b5a2b', '#1abc9c']; let lvl = k.load('lvl', 0), tubes, sel = null, hist = [], bU, bR, start;
  function level() { const n = Math.min(3 + lvl, 10); const balls = []; for (let c = 0; c < n; c++) for (let i = 0; i < CAP; i++) balls.push(c); do k.shuffle(balls); while (balls.every((v, i) => i % CAP === 0 || v === balls[i - 1])); tubes = []; for (let t = 0; t < n; t++) tubes.push(balls.slice(t * CAP, t * CAP + CAP)); tubes.push([], []); start = JSON.stringify(tubes); hist = []; sel = null; }
  level();
  const done = () => tubes.every(t => !t.length || (t.length === CAP && t.every(v => v === t[0])));
  const layout = () => { const n = tubes.length, perRow = n > 7 ? Math.ceil(n / 2) : n, rows = Math.ceil(n / perRow), tw = Math.min(56, (k.W - 20) / perRow), th = Math.min(tw * 4.2, (k.H - 160) / rows - 20); return { n, perRow, tw, th, rows }; };
  const tubeAt = (x, y) => { const L = layout(); for (let i = 0; i < L.n; i++) { const r = Math.floor(i / L.perRow), c = i % L.perRow, cnt = Math.min(L.perRow, L.n - r * L.perRow), x0 = k.W / 2 - cnt * L.tw / 2 + c * L.tw, y0 = 70 + r * (L.th + 30); if (x >= x0 && x < x0 + L.tw && y >= y0 - 30 && y < y0 + L.th + 10) return i; } return -1; };
  return {
    tap(x, y) {
      if (k.inb(bU, x, y)) { if (hist.length) { tubes = JSON.parse(hist.pop()); sel = null; k.sfx('tap'); } return; }
      if (k.inb(bR, x, y)) { tubes = JSON.parse(start); hist = []; sel = null; return; }
      const i = tubeAt(x, y); if (i < 0) return;
      if (sel === null) { if (tubes[i].length) { sel = i; k.sfx('tap'); } return; }
      if (sel === i) { sel = null; return; }
      const from = tubes[sel], to = tubes[i], c = from[from.length - 1];
      if (to.length < CAP && (!to.length || to[to.length - 1] === c)) { hist.push(JSON.stringify(tubes)); while (from.length && from[from.length - 1] === c && to.length < CAP) to.push(from.pop()); k.sfx('pop'); sel = null; if (done()) { lvl++; k.save('lvl', lvl); k.add(1); k.sfx('win'); k.toast('Уровень ' + (lvl + 1) + '!', '#ffd84d'); k.after(.9, level); } }
      else { k.sfx('bad'); sel = tubes[i].length ? i : null; }
    },
    draw() {
      k.clear('#1d2340'); const L = layout(), br = L.tw * .36;
      tubes.forEach((t, i) => { const r = Math.floor(i / L.perRow), c = i % L.perRow, cnt = Math.min(L.perRow, L.n - r * L.perRow), x0 = k.W / 2 - cnt * L.tw / 2 + c * L.tw, y0 = 70 + r * (L.th + 30), cx = x0 + L.tw / 2;
        k.rect(cx - br - 4, y0, br * 2 + 8, L.th, 'rgba(255,255,255,.12)', br); k.srect(cx - br - 4, y0, br * 2 + 8, L.th, 'rgba(255,255,255,.35)', 2, br);
        const step = (L.th - 10) / CAP; t.forEach((v, j) => { const lift = sel === i && j === t.length - 1 ? -(y0 + L.th - 5 - step * (j + .5)) + y0 - 20 : 0; k.circ(cx, y0 + L.th - 5 - step * (j + .5) + lift, Math.min(br, step / 2 - 1), COL[v]); }); });
      k.text('Уровень ' + (lvl + 1), k.W / 2, 30, 18);
      bU = k.btn(k.W / 2 - 110, k.H - 60, 100, 46, '↶ Отмена'); bR = k.btn(k.W / 2 + 10, k.H - 60, 100, 46, '⟲ Заново');
    }
  };
});

/* 69 Точки-линии */
A({ id: 'dots', name: 'Точки-линии', e: '🟣', cat: 'puz', how: 'Веди пальцем по соседним точкам одного цвета (не по диагонали). Отпусти — они исчезнут. Замкни квадрат — исчезнут все точки этого цвета! 30 ходов.' }, k => {
  const N = 6, C = [k.P.r, k.P.y, k.P.g, k.P.b, k.P.p], g = k.fit(N, N, 60, 30, 20), cs = g.cs; let b = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ c: k.RI(0, 4), oy: 0 }))), chain = [], loop = false, moves = 30;
  const at = (x, y) => { const c = k.cell(g, x, y); if (!c) return null; const cx = g.x + c[0] * cs + cs / 2, cy = g.y + c[1] * cs + cs / 2; return Math.hypot(x - cx, y - cy) < cs * .42 ? c : null; };
  return {
    down(x, y) { const c = at(x, y); chain = c ? [c] : []; loop = false; if (c) k.sfx('tap'); },
    move(x, y, p) {
      if (!p || !chain.length || loop) return; const c = at(x, y); if (!c) return; const l = chain[chain.length - 1];
      if (c[0] === l[0] && c[1] === l[1]) return;
      if (chain.length > 1 && c[0] === chain[chain.length - 2][0] && c[1] === chain[chain.length - 2][1]) { chain.pop(); return; }
      if (Math.abs(c[0] - l[0]) + Math.abs(c[1] - l[1]) !== 1 || b[c[1]][c[0]].c !== b[l[1]][l[0]].c) return;
      if (chain.some(q => q[0] === c[0] && q[1] === c[1])) { if (chain.length >= 4) { loop = true; chain.push(c); k.sfx('win'); } return; }
      chain.push(c); k.sfx('pop');
    },
    up() {
      if (chain.length >= 2) {
        const col = b[chain[0][1]][chain[0][0]].c, kill = new Set(chain.map(([x, y]) => y * N + x));
        if (loop) b.forEach((r, y) => r.forEach((d, x) => d.c === col && kill.add(y * N + x)));
        k.add(kill.size);
        for (let x = 0; x < N; x++) {
          let w = N - 1;
          for (let y = N - 1; y >= 0; y--) if (!kill.has(y * N + x)) { const d = b[y][x]; d.oy += (w - y) * cs; b[w][x] = d; w--; }
          const fresh = w + 1;
          for (let y = w; y >= 0; y--) b[y][x] = { c: loop ? (col + k.RI(1, 4)) % 5 : k.RI(0, 4), oy: fresh * cs + cs };
        }
        moves--; if (moves <= 0) k.after(.4, () => k.over('Ходы кончились'));
      }
      chain = []; loop = false;
    },
    update(dt) { b.forEach(r => r.forEach(d => d.oy = Math.max(0, d.oy - dt * 900))); },
    draw() {
      k.clear('#fbfaf7'); const c = k.ctx;
      if (chain.length > 1) { c.strokeStyle = C[b[chain[0][1]][chain[0][0]].c]; c.lineWidth = cs * .14; c.lineCap = c.lineJoin = 'round'; c.beginPath(); chain.forEach(([x, y], i) => { const X = g.x + x * cs + cs / 2, Y = g.y + y * cs + cs / 2; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke(); }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const d = b[y][x]; k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2 - d.oy, cs * .22, C[d.c]); }
      if (loop) { c.globalAlpha = .12; k.clear(C[b[chain[0][1]][chain[0][0]].c]); c.globalAlpha = 1; }
      k.text('Ходов: ' + moves, k.W / 2, 30, 20, '#333');
    }
  };
});

/* 70 Парковка */
A({ id: 'parking', name: 'Парковка', e: '🚙', cat: 'puz', how: 'Двигай машины пальцем вдоль их направления. Освободи путь красной машине к выезду справа!' }, k => {
  const LV = ["BB.DE....DE.AA.D..FFHH......CC....GG", ".CC.D.EE..DHI.AADHIFF...BB.GG.......", ".LKKFFJLIII.JAA.BGDE.HBGDECHB.DEC.MM", "G..EE.G...HHGAACJD..BCJD..BCI.FF..I.", ".I.....I.BE.JAABE.JC.BGGHCFF..H..DDD", "GGDD.JLFF..JL..AAJ.II.HHB..CKKB..CEE", "..GGB.JJ.FBH.AAF.H..EE.H..CDDDIIC.KK", ".E..JJDEFFF.DAA.KLII.MKLCCCMBG.HHHBG", ".B.L...BJLEFAAJLEFKDDIIHK.C..HK.CGGG", "H.FFDLH.IEDLAAIE..CCJ.K...JBK.GG.B..", ".HHD..C..DIECAAJIEGBBJ.EGK.FF..K....", "MHDD..MH.IIBJ..AABJE.GGBJECFLLKKCF..", ".LLMMF..KK.FHAA..JH.IIIJH.GBCCDDGBEE"];
  let lvl = k.load('lvl', 0) % LV.length, b, drag = null, moves = 0, exitA = 0, g;
  const load = () => { b = LV[lvl].split(''); moves = 0; exitA = 0; g = k.fit(6, 6, 60, 40, 36); };
  load();
  const cellsOf = ch => b.map((v, i) => v === ch ? i : -1).filter(i => i >= 0);
  const CC = {}; 'BCDEFGHIJKLMNOP'.split('').forEach((ch, i) => CC[ch] = ['#ffa53d', '#ffde3d', '#47d873', '#35c2ff', '#7b6bff', '#e45cff', '#2ec4b6', '#f4a3c4', '#9aa5b1', '#c19a6b', '#5e8c31', '#4361ee', '#b5179e', '#ff9f1c', '#8d99ae'][i]);
  function range(ch) { const c = cellsOf(ch), h = c[1] - c[0] === 1, st = h ? 1 : 6; let lo = 0, hi = 0; let p = Math.min(...c) - st; while (p >= 0 && (!h || Math.floor(p / 6) === Math.floor(c[0] / 6)) && b[p] === '.') { lo--; p -= st; } p = Math.max(...c) + st; while (p < 36 && (!h || Math.floor(p / 6) === Math.floor(c[0] / 6)) && b[p] === '.') { hi++; p += st; } return { c, h, st, lo, hi }; }
  return {
    down(x, y) { if (exitA) return; const c = k.cell(g, x, y); if (!c) return; const ch = b[c[1] * 6 + c[0]]; if (ch === '.') return; drag = { ch, x, y, sh: 0, ...range(ch) }; },
    move(x, y, p) { if (!drag || !p) return; const d = drag.h ? x - drag.x : y - drag.y; drag.sh = k.clamp(Math.round(d / g.cs), drag.lo, drag.hi); drag.px = k.clamp(d, drag.lo * g.cs, drag.hi * g.cs); },
    up() {
      if (!drag) return; const d = drag; drag = null; if (!d.sh) return;
      d.c.forEach(i => b[i] = '.'); d.c.forEach(i => b[i + d.sh * d.st] = d.ch); moves++; k.sfx('hit');
      if (d.ch === 'A' && Math.max(...cellsOf('A')) % 6 === 5) { exitA = .001; k.add(); k.sfx('win'); }
    },
    update(dt) { if (exitA) { exitA += dt; if (exitA > .9) { lvl++; k.save('lvl', lvl % LV.length); if (lvl >= LV.length) { lvl = 0; return k.win('Все парковки пройдены!'); } k.toast('Уровень ' + (lvl + 1), '#ffd84d'); load(); } } },
    draw() {
      k.clear('#2d2d3a'); const cs = g.cs; k.rect(g.x - 8, g.y - 8, cs * 6 + 16, cs * 6 + 16, '#555566', 12); k.rect(g.x, g.y, cs * 6, cs * 6, '#c9c9d3', 6); k.rect(g.x + cs * 6, g.y + cs * 2 + 4, 12, cs - 8, '#c9c9d3');
      k.text('➜', g.x + cs * 6 + 20, g.y + cs * 2.5, 22, '#ff5d73');
      const seen = new Set();
      b.forEach((ch, i) => { if (ch === '.' || seen.has(ch)) return; seen.add(ch); const c = cellsOf(ch), h = c[1] - c[0] === 1, x0 = c[0] % 6, y0 = Math.floor(c[0] / 6); let ox = 0, oy = 0; if (drag && drag.ch === ch) { if (h) ox = drag.px || 0; else oy = drag.px || 0; } if (ch === 'A' && exitA) ox = exitA * cs * 8; const w = h ? c.length : 1, hh = h ? 1 : c.length; k.rect(g.x + x0 * cs + 4 + ox, g.y + y0 * cs + 4 + oy, w * cs - 8, hh * cs - 8, ch === 'A' ? '#ff3b5b' : CC[ch], 10); k.rect(g.x + x0 * cs + 10 + ox + (h ? (w * cs - 8) * .62 : 0), g.y + y0 * cs + 10 + oy + (h ? 0 : (hh * cs - 8) * .1), h ? cs * .22 : cs - 20, h ? cs - 20 : cs * .22, 'rgba(180,230,255,.75)', 4); });
      k.text('Уровень ' + (lvl + 1) + '/' + LV.length + ' · ходов ' + moves, k.W / 2, 30, 17);
    }
  };
});

/* 71 Лабиринт */
A({ id: 'maze', name: 'Лабиринт', e: '🌀', cat: 'puz', how: 'Проводи пальцем — шарик катится до поворота. Доберись до флажка! Каждый лабиринт больше.' }, k => {
  let lvl = 0, C, R, g, walls, p, anim = null, trail;
  function level() {
    lvl++; C = Math.min(5 + lvl * 2, 21); R = Math.min(Math.floor(C * (k.H - 60) / k.W), 31); g = k.fit(C, R, 40, 10, 10);
    walls = Array.from({ length: R }, () => Array.from({ length: C }, () => [1, 1, 1, 1]));
    const seen = new Set(['0,0']), st = [[0, 0]], D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    while (st.length) { const [x, y] = st[st.length - 1], o = [0, 1, 2, 3].filter(d => { const X = x + D[d][0], Y = y + D[d][1]; return X >= 0 && Y >= 0 && X < C && Y < R && !seen.has(X + ',' + Y); }); if (!o.length) { st.pop(); continue; } const d = k.pick(o), X = x + D[d][0], Y = y + D[d][1]; walls[y][x][d] = 0; walls[Y][X][(d + 2) % 4] = 0; seen.add(X + ',' + Y); st.push([X, Y]); }
    p = [0, 0]; trail = [[0, 0]];
  }
  level();
  const DI = { U: 0, R: 1, D: 2, L: 3 }, DV = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  return {
    swipe(d) {
      if (anim) return; const di = DI[d]; let [x, y] = p, steps = [];
      while (!walls[y][x][di]) { x += DV[di][0]; y += DV[di][1]; steps.push([x, y]); const open = walls[y][x].filter(w => !w).length; if (open !== 2 || (x === C - 1 && y === R - 1)) break; const nd = walls[y][x].findIndex((w, i) => !w && i !== (di + 2) % 4); if (nd !== di) break; }
      if (steps.length) { anim = { steps, i: 0 }; k.sfx('tap'); }
    },
    update(dt) {
      if (!anim) return; anim.i += dt * 30; while (anim && anim.i >= 1) { anim.i -= 1; p = anim.steps.shift(); trail.push(p); if (!anim.steps.length) anim = null; }
      if (!anim && p[0] === C - 1 && p[1] === R - 1) { k.add(); k.sfx('win'); k.toast('Лабиринт ' + (lvl + 1) + '!', '#ffd84d'); level(); }
    },
    draw() {
      k.clear('#f0ead8'); const cs = g.cs;
      trail.forEach(([x, y]) => k.rect(g.x + x * cs + cs * .3, g.y + y * cs + cs * .3, cs * .4, cs * .4, 'rgba(53,194,255,.25)', 3));
      k.emo('🏁', g.x + (C - .5) * cs, g.y + (R - .5) * cs, cs * .8);
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) { const w = walls[y][x], X = g.x + x * cs, Y = g.y + y * cs; if (w[0]) k.line(X, Y, X + cs, Y, '#3b2f5a', 3); if (w[3]) k.line(X, Y, X, Y + cs, '#3b2f5a', 3); if (y === R - 1 && w[2]) k.line(X, Y + cs, X + cs, Y + cs, '#3b2f5a', 3); if (x === C - 1 && w[1]) k.line(X + cs, Y, X + cs, Y + cs, '#3b2f5a', 3); }
      k.circ(g.x + p[0] * cs + cs / 2, g.y + p[1] * cs + cs / 2, cs * .32, '#ff3b5b');
      k.text('Лабиринт ' + lvl, k.W / 2, 22, 17, '#3b2f5a');
    }
  };
});

/* 72 Слияние */
A({ id: 'drop2048', name: 'Слияние', e: '🔽', cat: 'puz', how: 'Нажми на столбик, чтобы бросить число. Одинаковые числа рядом сливаются в удвоенное. Не дай столбикам переполниться!' }, k => {
  const C = 5, R = 7, g = k.fit(C, R, 90, 10, 14), cs = g.cs; let b = Array.from({ length: R }, () => Array(C).fill(0)), cur = 2, nxt = 4, maxV = 8, flash = [];
  const CO = v => `hsl(${(Math.log2(v) * 37) % 360},70%,${55 - Math.min(20, Math.log2(v))}%)`;
  const pickN = () => 2 ** k.RI(1, Math.max(1, Math.min(6, Math.log2(maxV) - 2)));
  function gravity() { for (let x = 0; x < C; x++) { const col = []; for (let y = R - 1; y >= 0; y--) if (b[y][x]) col.push(b[y][x]); for (let y = R - 1, i = 0; y >= 0; y--, i++) b[y][x] = col[i] || 0; } }
  function mergeAll(fx, fy) {
    let changed = true, guard = 0;
    while (changed && guard++ < 50) {
      changed = false;
      const order = []; for (let y = R - 1; y >= 0; y--) for (let x = 0; x < C; x++) if (b[y][x]) order.push([x, y]);
      if (fx !== undefined) order.sort((a, c) => (c[0] === fx && c[1] === fy) - (a[0] === fx && a[1] === fy));
      for (const [x, y] of order) {
        const v = b[y][x]; if (!v) continue; let n = 0;
        for (const [dx, dy] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < C && Y < R && b[Y][X] === v) { b[Y][X] = 0; n++; } }
        if (n) { b[y][x] = v * 2 ** n; k.add(b[y][x]); maxV = Math.max(maxV, b[y][x]); flash.push({ x, y, t: .3 }); k.sfx('pop'); gravity(); changed = true; fx = undefined; break; }
      }
    }
  }
  return {
    tap(x) {
      const c = Math.floor((x - g.x) / cs); if (c < 0 || c >= C) return;
      let y = R - 1; while (y >= 0 && b[y][c]) y--;
      if (y < 0) { if (b[0][c] === cur) { b[0][c] *= 2; k.add(b[0][c]); mergeAll(c, 0); } else { k.sfx('bad'); return; } }
      else { b[y][c] = cur; k.sfx('tap'); mergeAll(c, y); }
      cur = nxt; nxt = pickN();
      if (b[0].every((v, x) => v && v !== cur)) { let can = false; for (let x = 0; x < C; x++) if (!b[0][x]) can = true; if (!can) k.over('Столбики полны'); }
    },
    update(dt) { flash.forEach(f => f.t -= dt); flash = flash.filter(f => f.t > 0); },
    draw() {
      k.clear('#1c1838');
      for (let x = 0; x < C; x++) k.rect(g.x + x * cs + 3, g.y, cs - 6, cs * R, 'rgba(255,255,255,.05)', 10);
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) { const v = b[y][x]; if (!v) continue; const f = flash.find(f => f.x === x && f.y === y), s = f ? 1.1 : 1, X = g.x + x * cs + cs / 2, Y = g.y + y * cs + cs / 2, w = (cs - 8) * s; k.rect(X - w / 2, Y - w / 2, w, w, CO(v), 10); k.text(v >= 1e6 ? Math.round(v / 1e6) + 'M' : v >= 1e4 ? Math.round(v / 1e3) + 'K' : v, X, Y, cs * (v < 100 ? .4 : v < 1e4 ? .3 : .26), '#fff'); }
      k.rect(k.W / 2 - cs * .45, 20, cs * .9, cs * .9, CO(cur), 10); k.text(cur, k.W / 2, 20 + cs * .45, cs * .38, '#fff');
      k.text('след.', k.W / 2 + cs, 30, 12, k.P.dim); k.rect(k.W / 2 + cs * .75, 40, cs * .5, cs * .5, CO(nxt), 6); k.text(nxt, k.W / 2 + cs, 40 + cs * .25, cs * .22, '#fff');
    }
  };
});

/* 73 Сумма 10 */
A({ id: 'sum10', name: 'Сумма 10', e: '🔟', cat: 'puz', how: 'Выдели пальцем прямоугольник из чисел, сумма которых ровно 10 — они исчезнут. 2 минуты!' }, k => {
  const C = 8, R = 12, g = k.fit(C, R, 40, 10, 10), cs = g.cs; let b = Array.from({ length: R }, () => Array.from({ length: C }, () => k.RI(1, 9))), sel = null, left = 120;
  const rectOf = s => { const x1 = Math.min(s.a[0], s.b[0]), x2 = Math.max(s.a[0], s.b[0]), y1 = Math.min(s.a[1], s.b[1]), y2 = Math.max(s.a[1], s.b[1]); return [x1, y1, x2, y2]; };
  const sum = s => { const [x1, y1, x2, y2] = rectOf(s); let t = 0; for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) t += b[y][x]; return t; };
  const cl = (x, y) => [k.clamp(Math.floor((x - g.x) / cs), 0, C - 1), k.clamp(Math.floor((y - g.y) / cs), 0, R - 1)];
  return {
    down(x, y) { sel = { a: cl(x, y), b: cl(x, y) }; }, move(x, y, p) { if (p && sel) sel.b = cl(x, y); },
    up() { if (!sel) return; if (sum(sel) === 10) { const [x1, y1, x2, y2] = rectOf(sel); let n = 0; for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) if (b[y][x]) { b[y][x] = 0; n++; } k.add(n); k.sfx(n > 3 ? 'win' : 'point'); if (b.every(r => r.every(v => !v))) { k.add(50); k.win('Поле очищено!'); } } else if (sum(sel) > 0) k.sfx('bad'); sel = null; },
    update(dt) { left -= dt; if (left <= 0) { left = 0; k.over('Время вышло!'); } },
    draw() {
      k.clear('#e8f6e1'); const s = sel ? sum(sel) : 0;
      if (sel) { const [x1, y1, x2, y2] = rectOf(sel); k.rect(g.x + x1 * cs, g.y + y1 * cs, (x2 - x1 + 1) * cs, (y2 - y1 + 1) * cs, s === 10 ? 'rgba(71,216,115,.4)' : s > 10 ? 'rgba(255,93,115,.3)' : 'rgba(53,194,255,.3)', 8); }
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) { const v = b[y][x]; if (!v) continue; k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2, cs * .42, '#ff6b5b'); k.rect(g.x + x * cs + cs / 2 - 2, g.y + y * cs + 2, 4, cs * .16, '#3a8a2a', 2); k.text(v, g.x + x * cs + cs / 2, g.y + y * cs + cs / 2 + 2, cs * .45, '#fff'); }
      k.rect(0, 0, k.W * left / 120, 6, '#47d873'); k.text(sel ? 'Сумма: ' + s : Math.ceil(left) + ' с', k.W / 2, 24, 18, s === 10 ? '#1a8a3a' : '#333');
    }
  };
});

/* 74 Японский кроссворд */
A({ id: 'nonogram', name: 'Японский кроссворд', e: '🖼️', cat: 'puz', how: 'Числа сбоку и сверху — длины закрашенных отрезков в строке/столбце. Нажимай клетки, чтобы закрасить. Кнопка ✖ — режим крестиков.' }, k => {
  let lvl = 0, N, sol, cur, rc, cc, g, mark = false, btn;
  const clues = line => { const o = []; let n = 0; line.forEach(v => { if (v === 1) n++; else if (n) { o.push(n); n = 0; } }); if (n) o.push(n); return o.length ? o : [0]; };
  function level() { lvl++; N = [5, 5, 6, 7, 8, 10][Math.min(lvl - 1, 5)]; do { sol = Array.from({ length: N }, () => Array.from({ length: N }, () => Math.random() < .58 ? 1 : 0)); } while (sol.some(r => r.every(v => !v))); cur = sol.map(r => r.map(() => 0)); rc = sol.map(clues); cc = sol[0].map((_, x) => clues(sol.map(r => r[x]))); const m = Math.ceil(N / 2) + 1; g = k.fit(N + m * .6, N + m * .6, 20, 70, 8); g.ox = g.x + m * .6 * g.cs; g.oy = g.y + m * .6 * g.cs; g.cols = N; g.rows = N; }
  level();
  const solved = () => cur.every((r, y) => JSON.stringify(clues(r.map(v => v === 1 ? 1 : 0))) === JSON.stringify(rc[y])) && cur[0].every((_, x) => JSON.stringify(clues(cur.map(r => r[x] === 1 ? 1 : 0))) === JSON.stringify(cc[x]));
  return {
    tap(x, y) {
      if (k.inb(btn, x, y)) { mark = !mark; return; }
      const cx = Math.floor((x - g.ox) / g.cs), cy = Math.floor((y - g.oy) / g.cs); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      const v = cur[cy][cx]; cur[cy][cx] = mark ? (v === 2 ? 0 : 2) : (v === 1 ? 0 : 1); k.sfx('tap');
      if (solved()) { k.add(); k.sfx('win'); k.toast('Решено!', '#ffd84d'); k.after(.9, level); }
    },
    draw() {
      k.clear('#faf7f0'); const cs = g.cs, fs = Math.max(9, cs * .42);
      rc.forEach((cl, y) => { const done = JSON.stringify(clues(cur[y].map(v => v === 1 ? 1 : 0))) === JSON.stringify(cl); k.text(cl.join(' '), g.ox - 6, g.oy + y * cs + cs / 2, fs, done ? '#aaa' : '#333', 'right', 700); });
      cc.forEach((cl, x) => { const done = JSON.stringify(clues(cur.map(r => r[x] === 1 ? 1 : 0))) === JSON.stringify(cl); cl.forEach((n, i) => k.text(n, g.ox + x * cs + cs / 2, g.oy - 8 - (cl.length - 1 - i) * fs * 1.1, fs, done ? '#aaa' : '#333', 'center', 700)); });
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = g.ox + x * cs, Y = g.oy + y * cs, v = cur[y][x]; k.rect(X + 1, Y + 1, cs - 2, cs - 2, v === 1 ? '#2b2d42' : '#fff', 3); if (v === 2) { k.line(X + cs * .3, Y + cs * .3, X + cs * .7, Y + cs * .7, '#e33', 2); k.line(X + cs * .7, Y + cs * .3, X + cs * .3, Y + cs * .7, '#e33', 2); } }
      for (let i = 0; i <= N; i += 5) { k.line(g.ox + i * cs, g.oy, g.ox + i * cs, g.oy + N * cs, '#888', 2); k.line(g.ox, g.oy + i * cs, g.ox + N * cs, g.oy + i * cs, '#888', 2); }
      btn = k.btn(k.W / 2 - 90, k.H - 58, 180, 46, mark ? '✖ Ставлю крестики' : '■ Закрашиваю', mark ? '#e33' : '#2b2d42');
      k.text('Уровень ' + lvl + ' · ' + N + '×' + N, k.W / 2, 16, 14, '#888');
    }
  };
});

/* ---------- общие для настольных ---------- */
function turnText(k, s, y) { k.text(s, k.W / 2, y || 26, 18); }

/* 75 Крестики-нолики */
A({ id: 'ttt', name: 'Крестики-нолики', e: '❌', cat: 'brd', how: 'Ты — крестики. Поставь 3 в ряд раньше компьютера. Победа — очко, ничья — играем дальше, поражение — конец.' }, k => {
  const g = k.fit(3, 3, 60, 60, 30), cs = g.cs; let b, turn, msg = '', wait = 0, first = 0;
  const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const win = (b, p) => L.some(l => l.every(i => b[i] === p));
  function mm(b, p) { if (win(b, 2)) return 10; if (win(b, 1)) return -10; if (b.every(v => v)) return 0; const sc = []; for (let i = 0; i < 9; i++) if (!b[i]) { b[i] = p; sc.push(mm(b, 3 - p)); b[i] = 0; } return p === 2 ? Math.max(...sc) : Math.min(...sc); }
  function ai() { const free = b.map((v, i) => v ? -1 : i).filter(i => i >= 0); let mv; if (Math.random() < .22) mv = k.pick(free); else { let best = -99; for (const i of free) { b[i] = 2; const s = mm(b, 1); b[i] = 0; if (s > best) { best = s; mv = i; } } } b[mv] = 2; k.sfx('tap'); check(); }
  function check() { if (win(b, 1)) { k.add(); msg = 'Ты победил!'; k.sfx('win'); wait = 1.3; return true; } if (win(b, 2)) { msg = 'Компьютер победил'; k.after(.8, () => k.over('Компьютер победил')); turn = 0; return true; } if (b.every(v => v)) { msg = 'Ничья'; wait = 1.3; return true; } turn = turn === 1 ? 2 : 1; return false; }
  function round() { b = Array(9).fill(0); msg = ''; first ^= 1; turn = first ? 1 : 2; if (turn === 2) k.after(.5, ai); }
  round();
  return {
    tap(x, y) { if (turn !== 1 || wait) return; const c = k.cell(g, x, y); if (!c) return; const i = c[1] * 3 + c[0]; if (b[i]) return; b[i] = 1; k.sfx('tap'); if (!check()) { turn = 2; k.after(.45, ai); } },
    update(dt) { if (wait) { wait -= dt; if (wait <= 0) { wait = 0; round(); } } },
    draw() {
      k.clear('#173a5e'); for (let i = 1; i < 3; i++) { k.line(g.x + i * cs, g.y + 10, g.x + i * cs, g.y + cs * 3 - 10, '#fff', 5); k.line(g.x + 10, g.y + i * cs, g.x + cs * 3 - 10, g.y + i * cs, '#fff', 5); }
      b.forEach((v, i) => { const x = g.x + (i % 3) * cs + cs / 2, y = g.y + Math.floor(i / 3) * cs + cs / 2, r = cs * .3; if (v === 1) { k.line(x - r, y - r, x + r, y + r, '#ff5d73', 10); k.line(x + r, y - r, x - r, y + r, '#ff5d73', 10); } if (v === 2) k.ring(x, y, r, '#ffd84d', 10); });
      turnText(k, msg || (turn === 1 ? 'Твой ход (✕)' : 'Думаю...'));
      k.text('Побед: ' + k.score, k.W / 2, k.H - 30, 16, k.P.dim);
    }
  };
});

/* 76 4 в ряд */
A({ id: 'connect4', name: '4 в ряд', e: '🔴', cat: 'brd', how: 'Нажми на столбец, чтобы бросить фишку. Собери 4 в ряд (по горизонтали, вертикали или диагонали) раньше компьютера.' }, k => {
  const C = 7, R = 6, g = k.fit(C, R + 1, 40, 40, 10), cs = g.cs; let b, turn, msg, drop = null, wait = 0, first = 0;
  function line4(b, p) { for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { let n = 0; for (let i = 0; i < 4; i++) { const X = x + dx * i, Y = y + dy * i; if (X < 0 || Y < 0 || X >= C || Y >= R || b[Y][X] !== p) break; n++; } if (n === 4) return true; } return false; }
  const rowFor = (b, c) => { for (let y = R - 1; y >= 0; y--) if (!b[y][c]) return y; return -1; };
  function evalB(b) { let s = 0; for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { let a = 0, h = 0, ok = true; for (let i = 0; i < 4; i++) { const X = x + dx * i, Y = y + dy * i; if (X < 0 || Y < 0 || X >= C || Y >= R) { ok = false; break; } if (b[Y][X] === 2) a++; else if (b[Y][X] === 1) h++; } if (!ok || (a && h)) continue; s += [0, 1, 5, 40, 1000][a] - [0, 1, 6, 60, 1000][h]; } for (let y = 0; y < R; y++) if (b[y][3] === 2) s += 3; return s; }
  function search(b, d, p, al, be) { if (line4(b, 2)) return 100000 + d; if (line4(b, 1)) return -100000 - d; if (!d) return evalB(b); let best = p === 2 ? -1e9 : 1e9; for (const c of [3, 2, 4, 1, 5, 0, 6]) { const y = rowFor(b, c); if (y < 0) continue; b[y][c] = p; const s = search(b, d - 1, 3 - p, al, be); b[y][c] = 0; if (p === 2) { best = Math.max(best, s); al = Math.max(al, s); } else { best = Math.min(best, s); be = Math.min(be, s); } if (be <= al) break; } return best === 1e9 || best === -1e9 ? 0 : best; }
  function ai() { let bc = 3, bs = -1e10; for (const c of k.shuffle([0, 1, 2, 3, 4, 5, 6])) { const y = rowFor(b, c); if (y < 0) continue; b[y][c] = 2; const s = search(b, 3, 1, -1e9, 1e9) + k.R(0, 8); b[y][c] = 0; if (s > bs) { bs = s; bc = c; } } place(bc, 2); }
  function place(c, p) { const y = rowFor(b, c); if (y < 0) return false; drop = { c, y, p, t: 0 }; turn = 0; return true; }
  function round() { b = Array.from({ length: R }, () => Array(C).fill(0)); msg = ''; first ^= 1; turn = first ? 1 : 2; if (turn === 2) k.after(.5, ai); }
  round();
  return {
    tap(x) { if (turn !== 1 || wait) return; const c = Math.floor((x - g.x) / cs); if (c >= 0 && c < C) place(c, 1); },
    update(dt) {
      if (wait) { wait -= dt; if (wait <= 0) { wait = 0; round(); } return; }
      if (!drop) return; drop.t += dt * 7; if (drop.t < drop.y + 1) return;
      b[drop.y][drop.c] = drop.p; k.sfx('hit'); const p = drop.p; drop = null;
      if (line4(b, p)) { if (p === 1) { k.add(); msg = 'Ты победил!'; k.sfx('win'); wait = 1.5; } else { msg = 'Компьютер победил'; k.after(.8, () => k.over('Компьютер победил')); } return; }
      if (b[0].every(v => v)) { msg = 'Ничья'; wait = 1.5; return; }
      if (p === 1) { turn = 2; k.after(.2, ai); } else turn = 1;
    },
    draw() {
      k.clear('#16213e'); const y0 = g.y + cs;
      k.rect(g.x - 6, y0 - 6, cs * C + 12, cs * R + 12, '#2a5bd7', 14);
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) { const v = b[y][x]; k.circ(g.x + x * cs + cs / 2, y0 + y * cs + cs / 2, cs * .4, v === 1 ? '#ff4b5c' : v === 2 ? '#ffd84d' : '#16213e'); }
      if (drop) k.circ(g.x + drop.c * cs + cs / 2, y0 + Math.min(drop.t - 1, drop.y) * cs + cs / 2, cs * .4, drop.p === 1 ? '#ff4b5c' : '#ffd84d');
      turnText(k, msg || (turn === 1 ? 'Твой ход 🔴' : 'Думаю... 🟡'));
      k.text('Побед: ' + k.score, k.W / 2, k.H - 24, 16, k.P.dim);
    }
  };
});

/* 77 Реверси */
A({ id: 'reversi', name: 'Реверси', e: '⚫', cat: 'brd', how: 'Ты — чёрные. Ставь фишку так, чтобы зажать фишки соперника между своими — они перевернутся. Побеждает тот, у кого больше фишек.' }, k => {
  const N = 8, g = k.fit(N, N, 50, 50, 10), cs = g.cs; let b = Array.from({ length: N }, () => Array(N).fill(0)), turn = 1, msg = '';
  b[3][3] = b[4][4] = 2; b[3][4] = b[4][3] = 1;
  const WT = [[100, -20, 10, 5, 5, 10, -20, 100], [-20, -50, -2, -2, -2, -2, -50, -20], [10, -2, 1, 1, 1, 1, -2, 10], [5, -2, 1, 0, 0, 1, -2, 5], [5, -2, 1, 0, 0, 1, -2, 5], [10, -2, 1, 1, 1, 1, -2, 10], [-20, -50, -2, -2, -2, -2, -50, -20], [100, -20, 10, 5, 5, 10, -20, 100]];
  function flips(x, y, p) { if (b[y][x]) return []; const out = []; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { if (!dx && !dy) continue; const line = []; let X = x + dx, Y = y + dy; while (X >= 0 && Y >= 0 && X < N && Y < N && b[Y][X] === 3 - p) { line.push([X, Y]); X += dx; Y += dy; } if (line.length && X >= 0 && Y >= 0 && X < N && Y < N && b[Y][X] === p) out.push(...line); } return out; }
  const movesOf = p => { const m = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const f = flips(x, y, p); if (f.length) m.push([x, y, f]); } return m; };
  const count = p => b.flat().filter(v => v === p).length;
  function play(x, y, f, p) { b[y][x] = p; f.forEach(([X, Y]) => b[Y][X] = p); k.sfx('pop'); k.set(count(1)); }
  function next(p) {
    const o = 3 - p;
    if (movesOf(o).length) { turn = o; if (o === 2) k.after(.6, ai); return; }
    if (movesOf(p).length) { turn = p; msg = (o === 1 ? 'Тебе' : 'Компьютеру') + ' некуда ходить — пропуск'; if (p === 2) k.after(.8, ai); return; }
    const me = count(1), them = count(2); k.set(me); turn = 0;
    if (me > them) k.win('Победа ' + me + ':' + them + '!'); else k.over(me === them ? 'Ничья ' + me + ':' + them : 'Поражение ' + me + ':' + them);
  }
  function ai() { const m = movesOf(2); if (!m.length) return next(2); let best = null, bs = -1e9; for (const mv of m) { const s = WT[mv[1]][mv[0]] * 3 + mv[2].length + Math.random() * 4; if (s > bs) { bs = s; best = mv; } } play(best[0], best[1], best[2], 2); msg = ''; next(2); }
  return {
    tap(x, y) { if (turn !== 1) return; const c = k.cell(g, x, y); if (!c) return; const f = flips(c[0], c[1], 1); if (!f.length) { k.sfx('bad'); return; } play(c[0], c[1], f, 1); msg = ''; next(1); },
    draw() {
      k.clear('#1c3d27'); k.rect(g.x - 6, g.y - 6, cs * N + 12, cs * N + 12, '#3a2a1a', 8);
      const mv = turn === 1 ? movesOf(1) : [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { k.rect(g.x + x * cs + 1, g.y + y * cs + 1, cs - 2, cs - 2, '#2e8b4f'); const v = b[y][x]; if (v) { k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2 + 2, cs * .4, 'rgba(0,0,0,.3)'); k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2, cs * .4, v === 1 ? '#111' : '#f5f5f5'); } }
      mv.forEach(([x, y]) => k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2, cs * .1, 'rgba(0,0,0,.35)'));
      turnText(k, msg || (turn === 1 ? 'Твой ход ⚫' : turn === 2 ? 'Думаю... ⚪' : ''));
      k.text('⚫ ' + count(1) + '   ⚪ ' + count(2), k.W / 2, k.H - 24, 20);
    }
  };
});

/* 78 Шашки */
A({ id: 'checkers', name: 'Шашки', e: '⛀', cat: 'brd', how: 'Ты — белые (снизу). Нажми на шашку, потом на клетку. Бить обязательно, можно назад. Дошёл до края — дамка (ходит во все стороны).' }, k => {
  const N = 8, g = k.fit(N, N, 50, 40, 8), cs = g.cs; let b = Array.from({ length: N }, () => Array(N).fill(null)), turn = 1, sel = null, opts = [], msg = '', last = null;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if ((x + y) % 2) { if (y < 3) b[y][x] = { p: 2, king: false }; if (y > 4) b[y][x] = { p: 1, king: false }; }
  const inb = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
  function seqs(x, y, bd) {
    const pc = bd[y][x], out = [], fwd = pc.p === 1 ? -1 : 1;
    function jump(cx, cy, path, caps, king) { let any = false; for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const mx = cx + dx, my = cy + dy, tx = cx + dx * 2, ty = cy + dy * 2; if (!inb(tx, ty) || !bd[my][mx] || bd[my][mx].p === pc.p || caps.some(c => c[0] === mx && c[1] === my) || (bd[ty][tx] && !(tx === x && ty === y))) continue; any = true; const nk = king || (pc.p === 1 ? ty === 0 : ty === N - 1); jump(tx, ty, [...path, [tx, ty]], [...caps, [mx, my]], nk); } if (!any && caps.length) out.push({ from: [x, y], path, caps, king }); }
    jump(x, y, [], [], pc.king);
    if (out.length) return { caps: true, list: out };
    const list = []; for (const [dx, dy] of [[1, fwd], [-1, fwd], ...(pc.king ? [[1, -fwd], [-1, -fwd]] : [])]) { const tx = x + dx, ty = y + dy; if (inb(tx, ty) && !bd[ty][tx]) list.push({ from: [x, y], path: [[tx, ty]], caps: [], king: pc.king || (pc.p === 1 ? ty === 0 : ty === N - 1) }); }
    return { caps: false, list };
  }
  function allMoves(p, bd = b) { let caps = [], plain = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (bd[y][x] && bd[y][x].p === p) { const s = seqs(x, y, bd); if (s.caps) caps.push(...s.list); else plain.push(...s.list); } return caps.length ? caps : plain; }
  function apply(m, bd = b) { const [fx, fy] = m.from, pc = bd[fy][fx], [tx, ty] = m.path[m.path.length - 1]; bd[fy][fx] = null; m.caps.forEach(([x, y]) => bd[y][x] = null); bd[ty][tx] = { p: pc.p, king: m.king }; }
  const clone = () => b.map(r => r.map(c => c && { ...c }));
  function endCheck(p) { const o = 3 - p; if (!allMoves(o).length) { turn = 0; if (o === 2) k.win('Победа!'); else k.over('Компьютер победил'); return true; } return false; }
  function ai() {
    const ms = allMoves(2); if (!ms.length) return endCheck(1);
    let best = null, bs = -1e9;
    for (const m of ms) { const bd = clone(); apply(m, bd); let s = m.caps.length * 10 + (m.king ? 6 : 0) + Math.random() * 2; const reply = allMoves(1, bd); const maxCap = Math.max(0, ...reply.map(r => r.caps.length)); s -= maxCap * 9; const [tx, ty] = m.path[m.path.length - 1]; s += ty * .3 + (tx === 0 || tx === 7 ? 1 : 0); if (s > bs) { bs = s; best = m; } }
    apply(best, b); last = best; k.sfx(best.caps.length ? 'boom' : 'hit'); if (!endCheck(2)) turn = 1;
  }
  return {
    tap(x, y) {
      if (turn !== 1) return; const c = k.cell(g, x, y); if (!c) return; const [cx, cy] = c;
      const pick = opts.find(m => { const [tx, ty] = m.path[m.path.length - 1]; return tx === cx && ty === cy; });
      if (pick) { apply(pick, b); last = pick; k.add(pick.caps.length); k.sfx(pick.caps.length ? 'boom' : 'hit'); sel = null; opts = []; if (!endCheck(1)) { turn = 2; k.after(.5, ai); } return; }
      if (b[cy][cx] && b[cy][cx].p === 1) { const all = allMoves(1); opts = all.filter(m => m.from[0] === cx && m.from[1] === cy); sel = opts.length ? c : null; if (!opts.length) { k.sfx('bad'); msg = all.some(m => m.caps.length) ? 'Нужно бить!' : ''; } else { k.sfx('tap'); msg = ''; } }
    },
    draw() {
      k.clear('#3b2616'); k.rect(g.x - 6, g.y - 6, cs * N + 12, cs * N + 12, '#2a170a', 6);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { k.rect(g.x + x * cs, g.y + y * cs, cs, cs, (x + y) % 2 ? '#8b5a2b' : '#f0d9b5'); const pc = b[y][x]; if (pc) { const X = g.x + x * cs + cs / 2, Y = g.y + y * cs + cs / 2; k.circ(X, Y + 2, cs * .38, 'rgba(0,0,0,.4)'); k.circ(X, Y, cs * .38, pc.p === 1 ? '#f8f4ea' : '#2b2b2b'); k.ring(X, Y, cs * .26, pc.p === 1 ? '#d8d0bc' : '#444', 2); if (pc.king) k.emo('👑', X, Y, cs * .4); } }
      if (sel) k.srect(g.x + sel[0] * cs + 2, g.y + sel[1] * cs + 2, cs - 4, cs - 4, '#ffd84d', 3);
      opts.forEach(m => { const [x, y] = m.path[m.path.length - 1]; k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2, cs * .15, '#47d873'); });
      if (last && turn === 1) { const [x, y] = last.path[last.path.length - 1]; k.srect(g.x + x * cs + 2, g.y + y * cs + 2, cs - 4, cs - 4, 'rgba(255,90,90,.7)', 2); }
      turnText(k, msg || (turn === 1 ? 'Твой ход ⚪' : turn === 2 ? 'Думаю...' : ''));
    }
  };
});

/* 79 5 в ряд */
A({ id: 'gomoku', name: '5 в ряд', e: '⭕', cat: 'brd', how: 'Ставь камни по очереди с компьютером. Первый, кто соберёт 5 в ряд (в любую сторону), побеждает.' }, k => {
  const N = 11, g = k.fit(N, N, 50, 40, 8), cs = g.cs; let b, turn, msg, wait = 0, lastM = null;
  const five = (p) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { let n = 0; while (n < 5) { const X = x + dx * n, Y = y + dy * n; if (X < 0 || Y < 0 || X >= N || Y >= N || b[Y][X] !== p) break; n++; } if (n === 5) return true; } return false; };
  function lineScore(x, y, p) { let total = 0; for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { let n = 1, open = 0; for (const s of [1, -1]) { let X = x + dx * s, Y = y + dy * s; while (X >= 0 && Y >= 0 && X < N && Y < N && b[Y][X] === p) { n++; X += dx * s; Y += dy * s; } if (X >= 0 && Y >= 0 && X < N && Y < N && !b[Y][X]) open++; } total += n >= 5 ? 1e6 : n === 4 ? (open === 2 ? 5e4 : open ? 4e3 : 0) : n === 3 ? (open === 2 ? 2e3 : open ? 150 : 0) : n === 2 ? (open === 2 ? 60 : open ? 10 : 0) : open; } return total; }
  function ai() { let best = null, bs = -1; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (b[y][x]) continue; let near = false; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < N && Y < N && b[Y][X]) { near = true; break; } } if (!near) continue; const s = lineScore(x, y, 2) * 1.1 + lineScore(x, y, 1) + Math.random() * 5; if (s > bs) { bs = s; best = [x, y]; } } if (!best) best = [5, 5]; put(best[0], best[1], 2); }
  function put(x, y, p) { b[y][x] = p; lastM = [x, y]; k.sfx('tap'); if (five(p)) { if (p === 1) { k.add(); msg = 'Ты победил!'; k.sfx('win'); wait = 1.6; turn = 0; } else { msg = 'Компьютер победил'; turn = 0; k.after(.9, () => k.over('Компьютер победил')); } return; } if (b.every(r => r.every(v => v))) { msg = 'Ничья'; wait = 1.5; turn = 0; return; } turn = 3 - p; if (turn === 2) k.after(.35, ai); }
  function round() { b = Array.from({ length: N }, () => Array(N).fill(0)); msg = ''; lastM = null; turn = 1; if (k.score % 2) { turn = 2; put(5, 5, 2); } }
  round();
  return {
    tap(x, y) { if (turn !== 1) return; const c = k.cell(g, x, y); if (!c || b[c[1]][c[0]]) return; put(c[0], c[1], 1); },
    update(dt) { if (wait) { wait -= dt; if (wait <= 0) { wait = 0; round(); } } },
    draw() {
      k.clear('#e3b778'); for (let i = 0; i < N; i++) { k.line(g.x + cs / 2, g.y + i * cs + cs / 2, g.x + (N - .5) * cs, g.y + i * cs + cs / 2, '#6b4a1e', 1); k.line(g.x + i * cs + cs / 2, g.y + cs / 2, g.x + i * cs + cs / 2, g.y + (N - .5) * cs, '#6b4a1e', 1); }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (b[y][x]) { k.circ(g.x + x * cs + cs / 2, g.y + y * cs + cs / 2, cs * .42, b[y][x] === 1 ? '#111' : '#fafafa'); }
      if (lastM) k.circ(g.x + lastM[0] * cs + cs / 2, g.y + lastM[1] * cs + cs / 2, cs * .1, '#e33');
      turnText(k, msg || (turn === 1 ? 'Твой ход ⚫' : 'Думаю...')); k.text('Побед: ' + k.score, k.W / 2, k.H - 22, 16, '#6b4a1e');
    }
  };
});

/* 80 Точки и квадраты */
A({ id: 'dotsboxes', name: 'Точки и квадраты', e: '✏️', cat: 'brd', how: 'По очереди проводите линии между соседними точками. Замкнул квадрат — он твой, и ходишь ещё раз. У кого больше квадратов — победил.' }, k => {
  const N = 4, g = k.fit(N, N, 60, 60, 36), cs = g.cs; let h = Array.from({ length: N + 1 }, () => Array(N).fill(0)), v = Array.from({ length: N }, () => Array(N + 1).fill(0)), box = Array.from({ length: N }, () => Array(N).fill(0)), turn = 1, them = 0;
  const sides = (x, y) => (h[y][x] ? 1 : 0) + (h[y + 1][x] ? 1 : 0) + (v[y][x] ? 1 : 0) + (v[y][x + 1] ? 1 : 0);
  const edges = () => { const e = []; for (let y = 0; y <= N; y++) for (let x = 0; x < N; x++) if (!h[y][x]) e.push(['h', x, y]); for (let y = 0; y < N; y++) for (let x = 0; x <= N; x++) if (!v[y][x]) e.push(['v', x, y]); return e; };
  const adj = ([t, x, y]) => t === 'h' ? [[x, y - 1], [x, y]].filter(([a, b]) => b >= 0 && b < N) : [[x - 1, y], [x, y]].filter(([a, b]) => a >= 0 && a < N);
  function take(e, p) { const [t, x, y] = e; (t === 'h' ? h : v)[y][x] = p; let got = 0; adj(e).forEach(([a, b]) => { if (sides(a, b) === 4 && !box[b][a]) { box[b][a] = p; got++; } }); if (p === 1) k.add(got); else them += got; k.sfx(got ? 'point' : 'tap'); if (!edges().length) { turn = 0; if (k.score > them) k.win('Победа ' + k.score + ':' + them); else k.over((k.score === them ? 'Ничья ' : 'Поражение ') + k.score + ':' + them); return true; } return got > 0; }
  function ai() {
    if (turn !== 2) return; const es = edges();
    const complete = es.find(e => adj(e).some(([a, b]) => sides(a, b) === 3));
    const safe = es.filter(e => adj(e).every(([a, b]) => sides(a, b) < 2));
    const e = complete || (safe.length ? k.pick(safe) : es.sort((a, b) => Math.max(...adj(a).map(([x, y]) => sides(x, y))) - Math.max(...adj(b).map(([x, y]) => sides(x, y))))[0]);
    const again = take(e, 2); if (turn === 0) return; if (again) k.after(.45, ai); else turn = 1;
  }
  return {
    tap(x, y) {
      if (turn !== 1) return; let best = null, bd = cs * .3;
      for (const e of edges()) { const [t, ex, ey] = e, mx = g.x + (t === 'h' ? ex + .5 : ex) * cs, my = g.y + (t === 'h' ? ey : ey + .5) * cs, d = Math.hypot(x - mx, y - my); if (d < bd) { bd = d; best = e; } }
      if (!best) return; const again = take(best, 1); if (turn === 0) return; if (!again) { turn = 2; k.after(.5, ai); }
    },
    draw() {
      k.clear('#fdfbf3');
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (box[y][x]) { k.rect(g.x + x * cs + 4, g.y + y * cs + 4, cs - 8, cs - 8, box[y][x] === 1 ? 'rgba(53,120,255,.3)' : 'rgba(255,90,90,.3)', 6); k.text(box[y][x] === 1 ? 'Я' : 'К', g.x + x * cs + cs / 2, g.y + y * cs + cs / 2, cs * .35, box[y][x] === 1 ? '#2a5bd7' : '#d33'); }
      for (let y = 0; y <= N; y++) for (let x = 0; x < N; x++) k.line(g.x + x * cs, g.y + y * cs, g.x + (x + 1) * cs, g.y + y * cs, h[y][x] === 1 ? '#2a5bd7' : h[y][x] === 2 ? '#d33' : '#e6e1d3', h[y][x] ? 6 : 3);
      for (let y = 0; y < N; y++) for (let x = 0; x <= N; x++) k.line(g.x + x * cs, g.y + y * cs, g.x + x * cs, g.y + (y + 1) * cs, v[y][x] === 1 ? '#2a5bd7' : v[y][x] === 2 ? '#d33' : '#e6e1d3', v[y][x] ? 6 : 3);
      for (let y = 0; y <= N; y++) for (let x = 0; x <= N; x++) k.circ(g.x + x * cs, g.y + y * cs, 7, '#333');
      k.text('Ты ' + k.score + ' : ' + them + ' Компьютер', k.W / 2, 26, 18, '#333'); k.text(turn === 1 ? 'Твой ход (синий)' : turn === 2 ? 'Ходит компьютер...' : '', k.W / 2, k.H - 26, 16, '#666');
    }
  };
});

/* 81 Спички */
A({ id: 'nim', name: 'Спички', e: '🔥', cat: 'brd', how: 'За ход бери любое количество спичек из ОДНОГО ряда: нажми на спичку — уберутся она и все правее. Кто возьмёт последнюю спичку — проиграл!' }, k => {
  let rows, turn, msg, wait = 0, memo = new Map(), round0 = 0;
  const key = r => r.slice().sort().join(',');
  function win(r) { if (r.every(v => !v)) return true; const kk = key(r); if (memo.has(kk)) return memo.get(kk); let res = false; for (let i = 0; i < r.length && !res; i++) for (let t = 1; t <= r[i]; t++) { const n = r.slice(); n[i] -= t; if (!win(n)) { res = true; break; } } memo.set(kk, res); return res; }
  function round() { rows = [1, 3, 5, 7]; msg = ''; round0++; turn = round0 % 2 ? 1 : 2; if (turn === 2) k.after(.8, ai); }
  round();
  function after(p) { if (rows.every(v => !v)) { if (p === 1) { msg = 'Ты взял последнюю — проиграл'; turn = 0; k.after(1, () => k.over('Ты взял последнюю спичку')); } else { k.add(); msg = 'Компьютер взял последнюю — ты победил!'; k.sfx('win'); turn = 0; wait = 1.8; } return; } turn = 3 - p; if (turn === 2) k.after(.8, ai); }
  function ai() { let mv = null; if (Math.random() > .25) for (let i = 0; i < rows.length && !mv; i++) for (let t = 1; t <= rows[i]; t++) { const n = rows.slice(); n[i] -= t; if (!win(n)) { mv = [i, t]; break; } } if (!mv) { const ne = rows.map((v, i) => v ? i : -1).filter(i => i >= 0), i = k.pick(ne); mv = [i, k.RI(1, rows[i])]; } rows[mv[0]] -= mv[1]; k.sfx('hit'); msg = 'Компьютер взял ' + mv[1]; after(2); }
  const lay = () => { const sw = Math.min(30, (k.W - 40) / 7), sh = sw * 3, top = k.H * .22; return { sw, sh, top, gap: Math.min(sh + 30, (k.H * .6) / 4) }; };
  return {
    tap(x, y) { if (turn !== 1) return; const L = lay(); for (let r = 0; r < 4; r++) { const y0 = L.top + r * L.gap; if (y < y0 - 10 || y > y0 + L.sh + 10) continue; const n = rows[r], x0 = k.W / 2 - n * L.sw / 2, i = Math.floor((x - x0) / L.sw); if (i >= 0 && i < n) { const t = n - i; rows[r] -= t; k.sfx('hit'); msg = ''; after(1); } } },
    update(dt) { if (wait) { wait -= dt; if (wait <= 0) { wait = 0; round(); } } },
    draw() {
      k.clear('#2a1b12'); const L = lay();
      rows.forEach((n, r) => { const y0 = L.top + r * L.gap, x0 = k.W / 2 - n * L.sw / 2; for (let i = 0; i < n; i++) { const X = x0 + i * L.sw + L.sw / 2; k.rect(X - 3, y0 + L.sh * .18, 6, L.sh * .82, '#f0d7a1', 2); k.ctx.fillStyle = '#d9342b'; k.ctx.beginPath(); k.ctx.ellipse(X, y0 + L.sh * .14, 5.5, 8, 0, 0, 7); k.ctx.fill(); } });
      turnText(k, msg || (turn === 1 ? 'Твой ход' : turn === 2 ? 'Думаю...' : ''), 40);
      k.text('Побед: ' + k.score, k.W / 2, k.H - 24, 16, k.P.dim);
    }
  };
});

/* 82 Морской бой */
A({ id: 'battleship', name: 'Морской бой', e: '🚢', cat: 'brd', low: true, how: 'Стреляй по полю противника (сверху). Попал — стреляешь ещё. Потопи все корабли раньше компьютера! Чем меньше выстрелов — тем лучше.' }, k => {
  const N = 10, top = 34, bigCs = Math.floor(Math.min((k.W - 20) / N, (k.H * .58 - top) / N)), smCs = Math.floor(Math.min((k.W - 20) / N * .55, (k.H * .38) / N)), gx = (k.W - bigCs * N) / 2, sy = top + bigCs * N + 30, sx = (k.W - smCs * N) / 2;
  const FLEET = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  function place() { for (;;) { const g = Array.from({ length: N }, () => Array(N).fill(0)), ships = []; let ok = true; for (const L of FLEET) { let placed = false; for (let t = 0; t < 200 && !placed; t++) { const h = Math.random() < .5, x = k.RI(0, h ? N - L : N - 1), y = k.RI(0, h ? N - 1 : N - L), cells = []; for (let i = 0; i < L; i++) cells.push([x + (h ? i : 0), y + (h ? 0 : i)]); if (cells.every(([a, b]) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = a + dx, Y = b + dy; if (X >= 0 && Y >= 0 && X < N && Y < N && g[Y][X]) return false; } return true; })) { const id = ships.length + 1; cells.forEach(([a, b]) => g[b][a] = id); ships.push({ cells, hits: 0 }); placed = true; } } if (!placed) { ok = false; break; } } if (ok) return { g, ships, shot: Array.from({ length: N }, () => Array(N).fill(0)) }; } }
  let me = place(), en = place(), turn = 1, shots = 0, targets = [], msg = 'Твой выстрел';
  function fire(side, x, y) {
    const s = side.shot; if (s[y][x]) return null; const id = side.g[y][x];
    if (!id) { s[y][x] = 1; return 'miss'; }
    s[y][x] = 2; const sh = side.ships[id - 1]; sh.hits++;
    if (sh.hits === sh.cells.length) { sh.cells.forEach(([a, b]) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = a + dx, Y = b + dy; if (X >= 0 && Y >= 0 && X < N && Y < N && !s[Y][X]) s[Y][X] = 1; } }); return 'sunk'; }
    return 'hit';
  }
  const allSunk = side => side.ships.every(s => s.hits === s.cells.length);
  function ai() {
    let x, y; targets = targets.filter(([a, b]) => !me.shot[b][a]);
    if (targets.length) [x, y] = targets.shift(); else { const free = []; for (let b = 0; b < N; b++) for (let a = 0; a < N; a++) if (!me.shot[b][a] && (a + b) % 2 === 0) free.push([a, b]); if (!free.length) for (let b = 0; b < N; b++) for (let a = 0; a < N; a++) if (!me.shot[b][a]) free.push([a, b]); [x, y] = k.pick(free); }
    const r = fire(me, x, y);
    if (r === 'hit') { k.sfx('boom'); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < N && Y < N && !me.shot[Y][X]) targets.unshift([X, Y]); }); }
    if (r === 'sunk') { k.sfx('boom'); targets = []; }
    if (allSunk(me)) { turn = 0; return k.over('Компьютер потопил твой флот'); }
    if (r === 'miss') { turn = 1; msg = 'Твой выстрел'; k.sfx('tap'); } else k.after(.6, ai);
  }
  return {
    tap(x, y) {
      if (turn !== 1) return; const cx = Math.floor((x - gx) / bigCs), cy = Math.floor((y - top) / bigCs); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      const r = fire(en, cx, cy); if (!r) return; shots++; k.set(shots);
      if (r === 'miss') { k.sfx('tap'); msg = 'Мимо! Стреляет компьютер...'; turn = 2; k.after(.7, ai); }
      else { k.sfx('boom'); msg = r === 'sunk' ? 'Потопил! Стреляй ещё' : 'Попал! Стреляй ещё'; if (allSunk(en)) { turn = 0; k.win('Флот противника потоплен!'); } }
    },
    draw() {
      k.clear('#0d2a4a');
      const drawB = (side, x0, y0, cs, showShips) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x0 + x * cs, Y = y0 + y * cs, s = side.shot[y][x], ship = side.g[y][x]; k.rect(X + .5, Y + .5, cs - 1, cs - 1, (showShips && ship) ? '#7c8ea8' : '#1d5b8f'); if (s === 1) k.circ(X + cs / 2, Y + cs / 2, cs * .12, '#9cc8ec'); if (s === 2) { k.rect(X + .5, Y + .5, cs - 1, cs - 1, side.ships[ship - 1].hits === side.ships[ship - 1].cells.length ? '#7a1d1d' : '#d9342b'); k.line(X + cs * .25, Y + cs * .25, X + cs * .75, Y + cs * .75, '#fff', 2); k.line(X + cs * .75, Y + cs * .25, X + cs * .25, Y + cs * .75, '#fff', 2); } } };
      drawB(en, gx, top, bigCs, false); drawB(me, sx, sy, smCs, true);
      k.text(msg, k.W / 2, 16, 15); k.text('Твой флот', k.W / 2, sy - 12, 13, k.P.dim);
    }
  };
});

/* 83 Свинья */
A({ id: 'pig', name: 'Свинья (кости)', e: '🎲', cat: 'brd', how: 'Бросай кубик, очки за ход копятся. Выпала 1 — очки хода сгорают и ход переходит. Нажми «Хватит», чтобы забрать очки. Кто первым наберёт 50 — победил.' }, k => {
  let me = 0, ai = 0, turnPts = 0, turn = 1, die = 1, roll = 0, msg = 'Твой ход', bR, bH, wins = 0;
  const T = 50;
  function doRoll(p) { roll = .5; die = k.RI(1, 6); k.sfx('tap'); k.after(.5, () => { if (die === 1) { turnPts = 0; k.sfx('bad'); msg = p === 1 ? 'Выпала 1! Ход переходит' : 'У компьютера 1!'; k.after(.9, () => pass(p)); } else { turnPts += die; if (p === 2) k.after(.6, aiStep); } }); }
  function hold(p) { if (p === 1) me += turnPts; else ai += turnPts; turnPts = 0; k.sfx('point'); if (me >= T) { wins++; k.set(wins); msg = 'Ты победил!'; k.sfx('win'); k.after(1.5, reset); turn = 0; return; } if (ai >= T) { turn = 0; return k.over('Компьютер набрал ' + T); } pass(p); }
  function pass(p) { turnPts = 0; turn = 3 - p; msg = turn === 1 ? 'Твой ход' : 'Ходит компьютер...'; if (turn === 2) k.after(.7, aiStep); }
  function aiStep() { if (turn !== 2) return; if (turnPts >= (me > ai + 10 ? 22 : 16) || ai + turnPts >= T) return hold(2); doRoll(2); }
  function reset() { me = ai = turnPts = 0; turn = 1; msg = 'Твой ход'; }
  return {
    tap(x, y) { if (turn !== 1 || roll > 0) return; if (k.inb(bR, x, y)) doRoll(1); else if (k.inb(bH, x, y) && turnPts) hold(1); },
    update(dt) { roll = Math.max(0, roll - dt); },
    draw() {
      k.clear('#ffe7ef'); const { W, H } = k, ds = Math.min(W * .35, 140), dx = W / 2 - ds / 2, dy = H * .32;
      const shown = roll > 0 ? k.RI(1, 6) : die; k.rect(dx, dy, ds, ds, '#fff', 20); k.srect(dx, dy, ds, ds, '#d77', 3, 20);
      const P = { 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.25, .25], [.75, .25], [.25, .5], [.75, .5], [.25, .75], [.75, .75]] };
      P[shown].forEach(([a, b]) => k.circ(dx + a * ds, dy + b * ds, ds * .08, shown === 1 ? '#e33' : '#333'));
      k.text('🐷 Ты: ' + me, W * .27, 40, 22, '#a33'); k.text('🤖 Комп: ' + ai, W * .73, 40, 22, '#33a');
      [[me, '#e86', 70], [ai, '#68e', 82]].forEach(([v, c, y]) => { k.rect(20, y, W - 40, 8, '#f3c6d3', 4); k.rect(20, y, (W - 40) * Math.min(1, v / T), 8, c, 4); });
      k.text('За ход: ' + turnPts, W / 2, dy + ds + 36, 26, '#333'); k.text(msg, W / 2, dy - 30, 18, '#555');
      if (turn === 1) { bR = k.btn(W / 2 - 150, H - 90, 140, 56, '🎲 Бросить', '#ff6b8b'); bH = k.btn(W / 2 + 10, H - 90, 140, 56, '✋ Хватит', turnPts ? '#47b873' : '#bbb'); }
    }
  };
});

/* 84 21 очко */
A({ id: 'blackjack', name: '21 очко', e: '🃏', cat: 'brd', how: 'Набери ближе к 21, чем дилер, но не больше. Туз = 1 или 11, картинки = 10. Ставка 10 фишек. Кнопка «Забрать» — сохранить результат.' }, k => {
  let chips = 100, deck, me, dl, st = 'bet', msg = '', bet = 10, btns = {};
  k.set(chips);
  const S = ['♠', '♥', '♦', '♣'], V = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const newDeck = () => { deck = []; for (const s of S) for (const v of V) deck.push({ s, v }); k.shuffle(deck); };
  const val = h => { let t = 0, a = 0; h.forEach(c => { if (c.v === 'A') { a++; t += 11; } else t += 'JQK'.includes(c.v) ? 10 : +c.v; }); while (t > 21 && a) { t -= 10; a--; } return t; };
  const draw1 = () => { if (deck.length < 10) newDeck(); return deck.pop(); };
  newDeck();
  function deal() { bet = 10; chips -= bet; me = [draw1(), draw1()]; dl = [draw1(), draw1()]; st = 'play'; msg = ''; k.set(chips); k.sfx('tap'); if (val(me) === 21) { finish(); } }
  function finish() { st = 'dealer'; const step = () => { if (val(dl) < 17 && val(me) <= 21 && !(me.length === 2 && val(me) === 21)) { dl.push(draw1()); k.sfx('tap'); k.after(.5, step); } else settle(); }; k.after(.5, step); }
  function settle() {
    const m = val(me), d = val(dl); let win = 0;
    if (m > 21) msg = 'Перебор! −' + bet; else if (me.length === 2 && m === 21 && !(dl.length === 2 && d === 21)) { win = bet * 2.5; msg = 'Блэкджек! +' + bet * 1.5; } else if (d > 21 || m > d) { win = bet * 2; msg = 'Победа! +' + bet; } else if (m === d) { win = bet; msg = 'Ничья'; } else msg = 'Дилер выиграл −' + bet;
    chips += win; k.set(chips); k.sfx(win > bet ? 'win' : win ? 'tap' : 'bad'); st = 'bet';
    if (chips < 10) k.after(1, () => k.over('Фишки кончились'));
  }
  const card = (c, x, y, w, hidden) => { const h = w * 1.4; k.rect(x, y, w, h, hidden ? '#2a5bd7' : '#fff', 8); k.srect(x, y, w, h, '#999', 1, 8); if (hidden) { k.srect(x + 5, y + 5, w - 10, h - 10, '#fff', 2, 5); return; } const red = c.s === '♥' || c.s === '♦'; k.text(c.v, x + w * .27, y + h * .17, w * .3, red ? '#d22' : '#222'); k.text(c.s, x + w / 2, y + h * .58, w * .5, red ? '#d22' : '#222'); };
  return {
    tap(x, y) {
      if (st === 'bet') { if (k.inb(btns.deal, x, y)) deal(); else if (k.inb(btns.cash, x, y)) k.win('Ты забрал ' + chips + ' фишек'); return; }
      if (st !== 'play') return;
      if (k.inb(btns.hit, x, y)) { me.push(draw1()); k.sfx('tap'); if (val(me) >= 21) finish(); }
      else if (k.inb(btns.stand, x, y)) finish();
      else if (k.inb(btns.dbl, x, y) && me.length === 2 && chips >= bet) { chips -= bet; bet *= 2; k.set(chips); me.push(draw1()); finish(); }
    },
    draw() {
      k.clear('#0f5a35'); const { W, H } = k, cw = Math.min(64, W / 6);
      if (dl) { dl.forEach((c, i) => card(c, W / 2 - (dl.length * cw * .7) / 2 + i * cw * .7, H * .12, cw, i === 1 && st === 'play')); k.text('Дилер: ' + (st === 'play' ? '?' : val(dl)), W / 2, H * .1, 16); }
      if (me) { me.forEach((c, i) => card(c, W / 2 - (me.length * cw * .7) / 2 + i * cw * .7, H * .5, cw, false)); k.text('Ты: ' + val(me), W / 2, H * .48, 18); }
      k.text(msg, W / 2, H * .42, 22, '#ffd84d'); k.text('🪙 ' + chips, 50, 20, 18);
      btns = {};
      if (st === 'bet') { btns.deal = k.btn(W / 2 - 150, H - 80, 140, 54, 'Раздать (10)', '#ffd84d', '#1a1347', 17); btns.cash = k.btn(W / 2 + 10, H - 80, 140, 54, 'Забрать 🪙', 'rgba(255,255,255,.2)'); }
      if (st === 'play') { const bw = (W - 40) / 3; btns.hit = k.btn(10, H - 80, bw, 54, 'Ещё', '#47d873'); btns.stand = k.btn(20 + bw, H - 80, bw, 54, 'Хватит', '#ff5d73'); btns.dbl = k.btn(30 + bw * 2, H - 80, bw, 54, 'Удвоить', me.length === 2 && chips >= bet ? '#35c2ff' : '#555'); }
    }
  };
});

/* 85 Больше-меньше */
A({ id: 'higherlower', name: 'Больше-меньше', e: '🔼', cat: 'brd', how: 'Угадай, следующая карта будет больше или меньше текущей. Туз — самый старший. Ошибся — игра окончена. Равная карта — засчитывается.' }, k => {
  const V = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'], S = ['♠', '♥', '♦', '♣']; let cur = rnd(), nxt = null, show = 0, bU, bD, res = '';
  function rnd() { return { v: k.RI(0, 12), s: k.pick(S) }; }
  function guess(up) { if (show) return; nxt = rnd(); show = 1; const ok = nxt.v === cur.v || (up ? nxt.v > cur.v : nxt.v < cur.v); if (ok) { k.add(); k.sfx('point'); res = 'Верно!'; k.after(.9, () => { cur = nxt; nxt = null; show = 0; res = ''; }); } else { k.sfx('bad'); res = 'Не угадал'; k.after(.9, () => k.over('Серия: ' + k.score)); } }
  const card = (c, x, y, w) => { const h = w * 1.4; k.rect(x, y, w, h, '#fff', 12); const red = c.s === '♥' || c.s === '♦'; k.text(V[c.v], x + w * .22, y + h * .12, w * .2, red ? '#d22' : '#222'); k.text(c.s, x + w / 2, y + h / 2, w * .45, red ? '#d22' : '#222'); k.text(V[c.v], x + w / 2, y + h * .85, w * .16, red ? '#d22' : '#222'); };
  return {
    tap(x, y) { if (k.inb(bU, x, y)) guess(true); if (k.inb(bD, x, y)) guess(false); },
    draw() {
      k.clear('#253046'); const { W, H } = k, cw = Math.min(140, W * .38);
      card(cur, W / 2 - cw - 8, H * .2, cw);
      if (nxt) card(nxt, W / 2 + 8, H * .2, cw); else { k.rect(W / 2 + 8, H * .2, cw, cw * 1.4, '#2a5bd7', 12); k.text('?', W / 2 + 8 + cw / 2, H * .2 + cw * .7, cw * .5, '#fff'); }
      k.text(res, W / 2, H * .2 + cw * 1.4 + 34, 26, res === 'Верно!' ? '#7dff8a' : '#ff8a9a');
      bU = k.btn(W / 2 - 150, H - 90, 140, 58, '▲ Больше', '#47d873', '#fff', 20); bD = k.btn(W / 2 + 10, H - 90, 140, 58, '▼ Меньше', '#ff5d73', '#fff', 20);
      k.text('Серия: ' + k.score, W / 2, 30, 20);
    }
  };
});

/* 86 Код-взломщик */
A({ id: 'mastermind', name: 'Код-взломщик', e: '🔐', cat: 'brd', low: true, how: 'Угадай секретный код из 4 цветов (цвета могут повторяться). После проверки: ⚫ — цвет на своём месте, ⚪ — цвет есть, но не там. 10 попыток.' }, k => {
  const C = k.C.slice(0, 6), secret = [0, 1, 2, 3].map(() => k.RI(0, 5)); let rows = [], cur = [], pal = [], bOk, bDel;
  function fb(g) { let b = 0, w = 0; const s = secret.slice(), gg = g.slice(); for (let i = 0; i < 4; i++) if (gg[i] === s[i]) { b++; s[i] = gg[i] = -1; } for (let i = 0; i < 4; i++) if (gg[i] >= 0) { const j = s.indexOf(gg[i]); if (j >= 0) { w++; s[j] = -1; } } return [b, w]; }
  return {
    tap(x, y) {
      for (const p of pal) if (k.inb(p, x, y) && cur.length < 4) { cur.push(p.c); k.sfx('tap'); }
      if (k.inb(bDel, x, y)) cur.pop();
      if (k.inb(bOk, x, y) && cur.length === 4) { const f = fb(cur); rows.push([cur, f]); cur = []; k.set(rows.length); k.sfx(f[0] === 4 ? 'win' : 'hit'); if (f[0] === 4) k.win('Код взломан за ' + rows.length + '!'); else if (rows.length >= 10) k.over('Код не взломан'); }
    },
    draw() {
      k.clear('#3a2a1e'); const { W, H } = k, rh = Math.min(42, (H - 170) / 11), r = rh * .36, x0 = W / 2 - rh * 3;
      for (let i = 0; i < 10; i++) { const y = 20 + i * rh + rh / 2, row = rows[i], live = i === rows.length; k.rect(x0 - 10, y - rh / 2 + 2, rh * 6 + 20, rh - 4, live ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.2)', 8); for (let j = 0; j < 4; j++) { const c = row ? row[0][j] : live ? cur[j] : undefined; k.circ(x0 + j * rh + rh / 2, y, r, c === undefined ? 'rgba(0,0,0,.35)' : C[c]); } if (row) { const [b, w] = row[1]; for (let j = 0; j < 4; j++) k.circ(x0 + rh * 4.4 + (j % 2) * r * 1.1, y - r * .5 + Math.floor(j / 2) * r * 1.1, r * .4, j < b ? '#111' : j < b + w ? '#fff' : 'rgba(0,0,0,.25)'); } }
      pal = []; const pw = Math.min(54, (W - 20) / 6); C.forEach((c, i) => { const px = W / 2 - pw * 3 + i * pw + pw / 2, py = H - 110; k.circ(px, py, pw * .4, c); pal.push({ x: px - pw / 2, y: py - pw / 2, w: pw, h: pw, c: i }); });
      bDel = k.btn(W / 2 - 150, H - 62, 140, 48, '⌫ Стереть'); bOk = k.btn(W / 2 + 10, H - 62, 140, 48, '✓ Проверить', cur.length === 4 ? '#47d873' : '#555');
    }
  };
});

/* ---------- слова ---------- */
const W5 = 'акула арбуз багаж банан башня белка берег билет бочка брюки буква валун вагон ведро весна ветер вилка вишня волна ворон гараж герой глина голос город гроза груша дверь доска дрова дочка дятел жираф завод замок звено зебра земля зерно знамя игрок искра кабан камин каток кисть класс книга ковер козел комар кость кошка кровь крыса кукла лампа лапша лимон лодка ложка масло мачта мешок молот мороз мышка мячик налог народ нитка носок обувь овраг озеро океан олень осень отдых пакет палец парус пенал перец песок петух пирог плита повар поезд полка пчела птица пушка пятно радио рыбак ручей ручка салат сахар свеча сетка скала слива слово совет сокол спорт стена сумка тайна танец тапок театр тесто товар топор точка трава тропа туман тыква удача улица уголь ферма фокус фрукт хвост холод центр чайка шапка шарик школа щенок ягода якорь рынок бетон ветка жилет забор залив зверь канал карта кефир клоун кофта крыло лента марка место метро мираж моряк музей нефть омлет пилот пицца пламя пульт ранец рубль сапог север сосна сцена фильм хобби чашка шахта шторм экран вафля гусли диван'.split(' ').filter(w => /^[а-яё]{5}$/.test(w)).map(w => w.replace(/ё/g, 'е'));
const WL = W5.concat('самолет велосипед компьютер телевизор холодильник библиотека космонавт крокодил черепаха апельсин шоколад мороженое динозавр помидор огурец картошка бегемот кенгуру страус барабан гитара пианино фонарик карандаш учитель больница аптека магазин автобус трамвай вертолет ракета планета звезда комета вулкан пустыня водопад радуга снеговик подарок праздник каникулы путешествие чемодан паспорт вокзал аэропорт дорога светофор мотоцикл бабочка муравей кузнечик стрекоза пингвин медведь верблюд обезьяна попугай дельфин осьминог ромашка подсолнух виноград клубника малина кукуруза капуста морковь пирожок бутерброд котлета макароны'.split(' '));
const KB = ['йцукенгшщзхъ', 'фывапролджэ', 'ячсмитьбю'];
function keyboard(k, y0, state, onKey, extra) {
  const W = k.W, kw = Math.min(34, (W - 8) / 12), kh = kw * 1.3, keys = [];
  KB.forEach((row, r) => { const rw = row.length * kw + (r === 2 && extra ? kw * 3 : 0), x0 = (W - rw) / 2 + (r === 2 && extra ? kw * 1.5 : 0); [...row].forEach((ch, i) => { const s = state[ch], col = s === 2 ? '#47b873' : s === 1 ? '#e2b33a' : s === -1 ? '#3a3a48' : '#8d8da6'; const b = { x: x0 + i * kw + 1.5, y: y0 + r * (kh + 6), w: kw - 3, h: kh, ch }; k.rect(b.x, b.y, b.w, b.h, col, 6); k.text(ch.toUpperCase(), b.x + b.w / 2, b.y + b.h / 2, kw * .5, '#fff', 'center', 700); keys.push(b); }); });
  if (extra) extra.forEach((e, i) => { const b = { x: i ? W - kw * 1.6 - 4 : 4, y: y0 + 2 * (kh + 6), w: kw * 1.6, h: kh, ch: e }; k.rect(b.x, b.y, b.w, b.h, '#5b5b7a', 6); k.text(e === 'del' ? '⌫' : '✓', b.x + b.w / 2, b.y + b.h / 2, kw * .55); keys.push(b); });
  return keys;
}

/* 87 Виселица */
A({ id: 'hangman', name: 'Виселица', e: '🪢', cat: 'brd', how: 'Угадай слово по буквам. Нажимай буквы на клавиатуре. 7 ошибок — проиграл. Угадал — следующее слово.' }, k => {
  let word, got, bad, state, keys = [], wait = 0;
  function round() { word = k.pick(WL).replace(/ё/g, 'е'); got = new Set(); bad = 0; state = {}; }
  round();
  return {
    tap(x, y) {
      if (wait) return; const key = keys.find(b => k.inb(b, x, y)); if (!key || state[key.ch]) return;
      if (word.includes(key.ch)) { state[key.ch] = 2; got.add(key.ch); k.sfx('pop'); if ([...word].every(c => got.has(c))) { k.add(); k.sfx('win'); wait = 1.4; } }
      else { state[key.ch] = -1; bad++; k.sfx('bad'); if (bad >= 7) { wait = 99; k.after(.3, () => k.over('Слово: ' + word.toUpperCase())); } }
    },
    update(dt) { if (wait && wait < 50) { wait -= dt; if (wait <= 0) { wait = 0; round(); } } },
    draw() {
      k.clear('#f4efe4'); const { W, H } = k, s = Math.min(W, H * .4) * .5, x0 = W / 2 - s * .6, y0 = 30;
      const parts = [() => k.line(x0, y0 + s * 1.3, x0 + s * .8, y0 + s * 1.3, '#5a3a1a', 5), () => k.line(x0 + s * .2, y0 + s * 1.3, x0 + s * .2, y0, '#5a3a1a', 5), () => k.line(x0 + s * .2, y0, x0 + s * .8, y0, '#5a3a1a', 5), () => k.line(x0 + s * .8, y0, x0 + s * .8, y0 + s * .2, '#888', 3), () => k.ring(x0 + s * .8, y0 + s * .32, s * .12, '#333', 4), () => k.line(x0 + s * .8, y0 + s * .44, x0 + s * .8, y0 + s * .85, '#333', 4), () => { k.line(x0 + s * .8, y0 + s * .55, x0 + s * .62, y0 + s * .72, '#333', 4); k.line(x0 + s * .8, y0 + s * .55, x0 + s * .98, y0 + s * .72, '#333', 4); k.line(x0 + s * .8, y0 + s * .85, x0 + s * .65, y0 + s * 1.1, '#333', 4); k.line(x0 + s * .8, y0 + s * .85, x0 + s * .95, y0 + s * 1.1, '#333', 4); }];
      parts.slice(0, bad).forEach(f => f());
      const lw = Math.min(34, (W - 20) / word.length); [...word].forEach((c, i) => { const x = W / 2 - word.length * lw / 2 + i * lw; k.rect(x + 3, y0 + s * 1.3 + 50, lw - 6, 3, '#333'); if (got.has(c) || bad >= 7) k.text(c.toUpperCase(), x + lw / 2, y0 + s * 1.3 + 34, lw * .7, got.has(c) ? '#222' : '#d33'); });
      k.text('Ошибок: ' + bad + '/7 · Слов: ' + k.score, W / 2, y0 + s * 1.3 + 74, 15, '#777');
      keys = keyboard(k, H - (Math.min(34, (W - 8) / 12) * 1.3 + 6) * 3 - 10, state);
    }
  };
});

/* 88 Словле */
A({ id: 'wordle', name: 'Словле', e: '🟩', cat: 'brd', how: 'Угадай слово из 5 букв за 6 попыток. 🟩 — буква на месте, 🟨 — буква есть, но в другом месте, серый — буквы нет.' }, k => {
  let ans, rows, cur, state, keys = [], wait = 0, shake = 0;
  function round() { ans = k.pick(W5); rows = []; cur = ''; state = {}; }
  round();
  function score(g) { const res = Array(5).fill(0), a = [...ans]; for (let i = 0; i < 5; i++) if (g[i] === a[i]) { res[i] = 2; a[i] = null; } for (let i = 0; i < 5; i++) if (!res[i]) { const j = a.indexOf(g[i]); if (j >= 0) { res[i] = 1; a[j] = null; } else res[i] = -1; } return res; }
  return {
    tap(x, y) {
      if (wait) return; const key = keys.find(b => k.inb(b, x, y)); if (!key) return;
      if (key.ch === 'del') { cur = cur.slice(0, -1); return; }
      if (key.ch === 'ok') {
        if (cur.length < 5) { shake = .3; k.sfx('bad'); return; }
        const r = score(cur); rows.push([cur, r]); [...cur].forEach((c, i) => state[c] = Math.max(state[c] || -1, r[i])); k.sfx('hit');
        if (cur === ans) { k.add(); k.sfx('win'); k.toast(['Гений!', 'Блестяще!', 'Отлично!', 'Хорошо!', 'Неплохо', 'Уф!'][rows.length - 1], '#7dff8a'); wait = 1.8; }
        else if (rows.length >= 6) { wait = 99; k.after(.5, () => k.over('Слово: ' + ans.toUpperCase())); }
        cur = ''; return;
      }
      if (cur.length < 5) { cur += key.ch; k.sfx('tap'); }
    },
    update(dt) { shake = Math.max(0, shake - dt); if (wait && wait < 50) { wait -= dt; if (wait <= 0) { wait = 0; round(); } } },
    draw() {
      k.clear('#121213'); const { W, H } = k, kbH = (Math.min(34, (W - 8) / 12) * 1.3 + 6) * 3 + 20, cs = Math.min(58, (W - 40) / 5, (H - kbH - 40) / 6), x0 = W / 2 - cs * 2.5;
      for (let r = 0; r < 6; r++) for (let i = 0; i < 5; i++) { const row = rows[r], live = r === rows.length, ch = row ? row[0][i] : live ? cur[i] : '', st = row ? row[1][i] : 0, X = x0 + i * cs + (live ? Math.sin(shake * 60) * shake * 20 : 0), Y = 20 + r * cs; k.rect(X + 3, Y + 3, cs - 6, cs - 6, st === 2 ? '#538d4e' : st === 1 ? '#b59f3b' : st === -1 ? '#3a3a3c' : '#121213', 4); if (!row) k.srect(X + 3, Y + 3, cs - 6, cs - 6, ch ? '#888' : '#3a3a3c', 2, 4); if (ch) k.text(ch.toUpperCase(), X + cs / 2, Y + cs / 2 + 1, cs * .5); }
      keys = keyboard(k, H - kbH + 10, state, null, ['del', 'ok']);
    }
  };
});
})();
