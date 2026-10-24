// Игры 89–100: тренировка мозга и отдых
(() => {
const A = G.add;

/* 89 Саймон */
A({ id: 'simon', name: 'Саймон', e: '🔊', cat: 'brn', how: 'Смотри, какие кнопки загораются, и повтори последовательность. Каждый раунд она длиннее на одну.' }, k => {
  const { W, H } = k, s = Math.min(W, H) * .42, cx = W / 2, cy = H / 2, COL = ['#2ecc71', '#e74c3c', '#f1c40f', '#3498db'], F = [392, 330, 262, 196];
  let seq = [], i = 0, st = 'show', lit = -1, litT = 0, t = .8;
  const addStep = () => { seq.push(k.RI(0, 3)); i = 0; st = 'show'; t = .7; };
  addStep();
  const beep = n => { k.sfx('tap'); };
  const pad = (x, y) => { const dx = x - cx, dy = y - cy; if (Math.hypot(dx, dy) > s || Math.hypot(dx, dy) < s * .3) return -1; return (dy < 0 ? 0 : 2) + (dx < 0 ? 0 : 1); };
  return {
    down(x, y) {
      if (st !== 'input') return; const p = pad(x, y); if (p < 0) return; lit = p; litT = .25; beep(p);
      if (p !== seq[i]) { k.sfx('bad'); st = 'over'; return k.over('Ошибка! Длина: ' + (seq.length - 1)); }
      i++; if (i >= seq.length) { k.set(seq.length); k.sfx('point'); st = 'wait'; k.after(.8, addStep); }
    },
    update(dt) {
      litT -= dt; if (litT <= 0) lit = -1;
      if (st === 'show') { t -= dt; if (t <= 0) { if (i >= seq.length) { st = 'input'; i = 0; return; } lit = seq[i]; litT = Math.max(.2, .5 - seq.length * .02); beep(seq[i]); i++; t = litT + .18; } }
    },
    draw() {
      k.clear('#1a1a2a'); const c = k.ctx;
      for (let p = 0; p < 4; p++) { const a0 = [Math.PI, -Math.PI / 2, Math.PI / 2, 0][p]; c.fillStyle = COL[p]; c.globalAlpha = lit === p ? 1 : .35; c.beginPath(); c.arc(cx, cy, s, a0 + .04, a0 + Math.PI / 2 - .04); c.arc(cx, cy, s * .32, a0 + Math.PI / 2 - .1, a0 + .1, true); c.fill(); }
      c.globalAlpha = 1; k.circ(cx, cy, s * .28, '#222'); k.text(st === 'input' ? 'Повтори' : st === 'show' ? 'Смотри' : '✓', cx, cy, 18);
      k.text('Длина: ' + seq.length, W / 2, 30, 20);
    }
  };
});

/* 90 Мемори */
A({ id: 'memory', name: 'Мемори', e: '🧠', cat: 'brn', how: 'Переворачивай по две карточки и ищи одинаковые пары. Найди все пары — и будет поле побольше.' }, k => {
  const E = ['🐶', '🐱', '🦊', '🐼', '🐸', '🐵', '🦁', '🐷', '🐙', '🦄', '🐝', '🐢', '🍕', '🍩', '⚽', '🚀', '🎸', '🌈'];
  let lvl = 0, C, R, cards, open = [], g, moves = 0, lock = 0;
  function level() { lvl++; [C, R] = [[3, 4], [4, 4], [4, 5], [4, 6], [5, 6], [6, 6]][Math.min(lvl - 1, 5)]; const n = C * R / 2, set = k.shuffle(E.slice()).slice(0, n); cards = k.shuffle([...set, ...set]).map(e => ({ e, up: false, done: false, f: 0 })); g = k.fit(C, R, 40, 10, 12); moves = 0; open = []; }
  level();
  return {
    tap(x, y) {
      if (lock) return; const c = k.cell(g, x, y); if (!c) return; const card = cards[c[1] * C + c[0]]; if (card.up || card.done) return;
      card.up = true; open.push(card); k.sfx('tap');
      if (open.length === 2) { moves++; const [a, b] = open; if (a.e === b.e) { a.done = b.done = true; open = []; k.add(1); k.sfx('point'); if (cards.every(c => c.done)) { k.sfx('win'); k.toast('Уровень ' + lvl + ' за ' + moves + ' ходов', '#ffd84d'); k.after(1.2, level); } } else { lock = .8; } }
    },
    update(dt) { cards.forEach(c => c.f += ((c.up || c.done ? 1 : 0) - c.f) * Math.min(1, dt * 12)); if (lock) { lock -= dt; if (lock <= 0) { lock = 0; open.forEach(c => c.up = false); open = []; } } },
    draw() {
      k.clear('#24305e'); const cs = g.cs;
      cards.forEach((c, i) => { const x = g.x + (i % C) * cs, y = g.y + Math.floor(i / C) * cs, w = (cs - 8) * Math.abs(c.f * 2 - 1); const front = c.f > .5; k.rect(x + cs / 2 - w / 2, y + 4, w, cs - 8, front ? (c.done ? '#c8f7c5' : '#fff') : '#f76c6c', 10); if (front) { k.ctx.save(); k.ctx.translate(x + cs / 2, y + cs / 2); k.ctx.scale(Math.max(.01, c.f * 2 - 1), 1); k.emo(c.e, 0, 0, cs * .55); k.ctx.restore(); } else if (w > 10) k.text('?', x + cs / 2, y + cs / 2, cs * .4, 'rgba(255,255,255,.6)'); });
      k.text('Уровень ' + lvl + ' · ходов ' + moves, k.W / 2, 22, 17);
    }
  };
});

/* 91 Таблица Шульте */
A({ id: 'schulte', name: 'Таблица Шульте', e: '#️⃣', cat: 'brn', low: true, fmt: v => (v / 10).toFixed(1) + 'с', how: 'Нажимай числа от 1 до 25 по порядку как можно быстрее. Тренирует внимание и периферийное зрение.' }, k => {
  const N = 5, g = k.fit(N, N, 60, 30, 14), cs = g.cs, nums = k.shuffle([...Array(25).keys()].map(i => i + 1)); let next = 1, time = 0, flash = null;
  return {
    tap(x, y) { const c = k.cell(g, x, y); if (!c) return; const v = nums[c[1] * N + c[0]]; if (v === next) { next++; k.sfx('tap'); flash = { i: c[1] * N + c[0], ok: true, t: .2 }; if (next > 25) { k.set(Math.round(time * 10)); k.win('Время: ' + time.toFixed(1) + ' с'); } } else { k.sfx('bad'); flash = { i: c[1] * N + c[0], ok: false, t: .3 }; } },
    update(dt) { time += dt; k.set(Math.round(time * 10)); if (flash) { flash.t -= dt; if (flash.t <= 0) flash = null; } },
    draw() {
      k.clear('#f2f2f2');
      nums.forEach((v, i) => { const x = g.x + (i % N) * cs, y = g.y + Math.floor(i / N) * cs; k.rect(x + 3, y + 3, cs - 6, cs - 6, flash && flash.i === i ? (flash.ok ? '#9be7a8' : '#ffb3b3') : '#fff', 8); k.srect(x + 3, y + 3, cs - 6, cs - 6, '#ccc', 1, 8); k.text(v, x + cs / 2, y + cs / 2, cs * .42, v < next ? '#bbb' : '#222'); });
      k.text('Найди: ' + Math.min(next, 25), k.W / 2, 30, 24, '#2a5bd7');
    }
  };
});

/* 92 Цвет слова */
A({ id: 'stroop', name: 'Цвет слова', e: '🌈', cat: 'brn', how: 'Нажми кнопку с ЦВЕТОМ, которым написано слово (а не с тем, что написано!). 30 секунд. Ошибка — минус очко.' }, k => {
  const N = ['КРАСНЫЙ', 'ЗЕЛЁНЫЙ', 'СИНИЙ', 'ЖЁЛТЫЙ'], C = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f']; let word, ink, left = 30, btns = [], fx = 0;
  const next = () => { word = k.RI(0, 3); do ink = k.RI(0, 3); while (ink === word && Math.random() < .8); };
  next();
  return {
    tap(x, y) { const b = btns.find(b => k.inb(b, x, y)); if (!b) return; if (b.i === ink) { k.add(); k.sfx('point'); fx = .15; } else { k.add(-1); k.sfx('bad'); fx = -.15; } next(); },
    update(dt) { left -= dt; if (left <= 0) { left = 0; k.over('Время вышло!'); } fx += (fx > 0 ? -dt : dt); if (Math.abs(fx) < .02) fx = 0; },
    draw() {
      k.clear(fx > 0 ? '#e8ffe8' : fx < 0 ? '#ffe8e8' : '#fafafa'); const { W, H } = k;
      k.text(N[word], W / 2, H * .3, Math.min(56, W / 7), C[ink]);
      btns = []; const bw = (W - 30) / 2, bh = 64; ['Красный', 'Зелёный', 'Синий', 'Жёлтый'].forEach((s, i) => { const b = k.btn(10 + (i % 2) * (bw + 10), H * .55 + Math.floor(i / 2) * (bh + 10), bw, bh, s, '#333', '#fff', 20); b.i = i; btns.push(b); });
      k.rect(0, 0, W * left / 30, 6, '#3498db'); k.text(Math.ceil(left) + ' с', W / 2, 24, 18, '#333');
    }
  };
});

/* 93 Быстрый счёт */
A({ id: 'mathquiz', name: 'Быстрый счёт', e: '➕', cat: 'brn', how: 'Реши пример и выбери правильный ответ, пока не кончилось время. С каждым примером быстрее и сложнее!' }, k => {
  let q, ans, opts, t, T, btns = [];
  function next() {
    const lv = k.score, op = k.pick(lv < 5 ? ['+', '−'] : lv < 12 ? ['+', '−', '×'] : ['+', '−', '×', '÷']); let a, b;
    if (op === '+') { a = k.RI(2, 10 + lv * 4); b = k.RI(2, 10 + lv * 4); ans = a + b; }
    if (op === '−') { a = k.RI(5, 15 + lv * 4); b = k.RI(1, a); ans = a - b; }
    if (op === '×') { a = k.RI(2, 5 + lv / 2); b = k.RI(2, 9); ans = a * b; }
    if (op === '÷') { b = k.RI(2, 9); ans = k.RI(2, 9 + lv / 4); a = b * ans; }
    q = a + ' ' + op + ' ' + b + ' = ?'; const s = new Set([ans]); while (s.size < 4) s.add(Math.max(0, ans + k.RI(-10, 10))); opts = k.shuffle([...s]); T = t = Math.max(2.2, 6 - lv * .15);
  }
  next();
  return {
    tap(x, y) { const b = btns.find(b => k.inb(b, x, y)); if (!b) return; if (b.v === ans) { k.add(); k.sfx('point'); next(); } else { k.sfx('bad'); k.over(q.replace('?', ans)); } },
    update(dt) { t -= dt; if (t <= 0) { k.sfx('bad'); k.over('Время! ' + q.replace('?', ans)); } },
    draw() {
      k.clear('#1e3a5f'); const { W, H } = k;
      k.rect(0, 0, W * t / T, 8, t / T < .3 ? '#ff5d73' : '#47d873'); k.text(q, W / 2, H * .28, Math.min(48, W / 8));
      btns = []; const bw = (W - 30) / 2, bh = 72; opts.forEach((v, i) => { const b = k.btn(10 + (i % 2) * (bw + 10), H * .5 + Math.floor(i / 2) * (bh + 12), bw, bh, v, 'rgba(255,255,255,.15)', '#fff', 30); b.v = v; btns.push(b); });
    }
  };
});

/* 94 Запомни число */
A({ id: 'numbermem', name: 'Запомни число', e: '💭', cat: 'brn', how: 'Запомни показанное число. Когда оно исчезнет — набери его. Каждый раз цифр на одну больше.' }, k => {
  let n = 3, num, st = 'show', t, inp = '', pad = [];
  const next = () => { num = ''; for (let i = 0; i < n; i++) num += i ? k.RI(0, 9) : k.RI(1, 9); st = 'show'; t = 1 + n * .55; inp = ''; };
  next();
  return {
    tap(x, y) {
      if (st !== 'input') return; const b = pad.find(b => k.inb(b, x, y)); if (!b) return; k.sfx('tap');
      if (b.v === 'del') inp = inp.slice(0, -1); else if (b.v === 'ok') { if (inp === num) { k.set(n); k.sfx('win'); n++; st = 'ok'; k.after(.7, next); } else { k.sfx('bad'); st = 'bad'; k.after(1.4, () => k.over('Было: ' + num)); } } else if (inp.length < n) inp += b.v;
    },
    update(dt) { if (st === 'show') { t -= dt; if (t <= 0) st = 'input'; } },
    draw() {
      k.clear('#2d1b4e'); const { W, H } = k, fs = Math.min(54, (W - 20) / (n * .65));
      if (st === 'show') { k.text(num, W / 2, H * .3, fs); k.rect(W * .2, H * .3 + 50, W * .6 * t / (1 + n * .55), 6, '#ffd84d', 3); }
      else { k.text(inp || '…', W / 2, H * .22, fs, st === 'bad' ? '#ff5d73' : st === 'ok' ? '#7dff8a' : '#fff'); if (st === 'bad') k.text(num, W / 2, H * .22 + fs, fs * .7, '#7dff8a'); }
      k.text('Цифр: ' + n, W / 2, 24, 16, k.P.dim);
      pad = []; if (st === 'input') { const bw = (W - 40) / 3, bh = Math.min(62, (H * .5) / 4 - 8), y0 = H - (bh + 8) * 4 - 10; ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].forEach((v, i) => { const b = k.btn(10 + (i % 3) * (bw + 10), y0 + Math.floor(i / 3) * (bh + 8), bw, bh, v === 'del' ? '⌫' : v === 'ok' ? '✓' : v, v === 'ok' ? '#47d873' : 'rgba(255,255,255,.14)', '#fff', 26); b.v = v; pad.push(b); }); }
    }
  };
});

/* 95 Запомни клетки */
A({ id: 'gridmem', name: 'Запомни клетки', e: '🟪', cat: 'brn', how: 'Запомни, какие клетки загорелись, и нажми на них. 3 ошибки — конец. С каждым уровнем клеток больше.' }, k => {
  let lvl = 0, N, cells, picked, st, t, lives = 3, g, wrong = [];
  function level() { lvl++; N = Math.min(3 + Math.floor(lvl / 3), 7); const cnt = Math.min(2 + lvl, N * N - 2); cells = new Set(k.shuffle([...Array(N * N).keys()]).slice(0, cnt)); picked = new Set(); wrong = []; st = 'show'; t = 1.2 + cnt * .1; g = k.fit(N, N, 60, 30, 20); }
  level();
  return {
    tap(x, y) {
      if (st !== 'input') return; const c = k.cell(g, x, y); if (!c) return; const i = c[1] * N + c[0]; if (picked.has(i) || wrong.includes(i)) return;
      if (cells.has(i)) { picked.add(i); k.sfx('pop'); if (picked.size === cells.size) { k.set(lvl); k.sfx('win'); st = 'ok'; k.after(.6, level); } }
      else { wrong.push(i); lives--; k.sfx('bad'); if (lives <= 0) { st = 'end'; k.after(.6, () => k.over('Уровень ' + lvl)); } }
    },
    update(dt) { if (st === 'show') { t -= dt; if (t <= 0) st = 'input'; } },
    draw() {
      k.clear('#16213e'); const cs = g.cs;
      for (let i = 0; i < N * N; i++) { const x = g.x + (i % N) * cs, y = g.y + Math.floor(i / N) * cs, on = (st === 'show' || st === 'end') && cells.has(i) || picked.has(i); k.rect(x + 4, y + 4, cs - 8, cs - 8, wrong.includes(i) ? '#ff5d73' : on ? '#7b6bff' : '#263459', 10); }
      k.text('Уровень ' + lvl + '  ' + '❤️'.repeat(lives), k.W / 2, 28, 18);
    }
  };
});

/* 96 Найди оттенок */
A({ id: 'oddcolor', name: 'Найди оттенок', e: '👁️', cat: 'brn', how: 'Все квадраты одного цвета, кроме одного — он чуть-чуть отличается. Найди его! 60 секунд, ошибка — минус 3 секунды.' }, k => {
  let N, odd, base, diff, g, left = 60, fx = 0;
  function next() { const s = k.score; N = Math.min(2 + Math.floor(s / 3), 8); odd = k.RI(0, N * N - 1); base = [k.RI(0, 359), k.RI(40, 80), k.RI(35, 65)]; diff = Math.max(3, 22 - s * .9); g = k.fit(N, N, 60, 20, 16); }
  next();
  return {
    tap(x, y) { const c = k.cell(g, x, y); if (!c) return; if (c[1] * N + c[0] === odd) { k.add(); k.sfx('point'); next(); } else { left -= 3; fx = .3; k.sfx('bad'); } },
    update(dt) { left -= dt; fx = Math.max(0, fx - dt); if (left <= 0) { left = 0; k.over('Время вышло!'); } },
    draw() {
      k.clear(fx ? '#3a1520' : '#15122b'); const cs = g.cs, [h, s, l] = base;
      for (let i = 0; i < N * N; i++) k.rect(g.x + (i % N) * cs + 3, g.y + Math.floor(i / N) * cs + 3, cs - 6, cs - 6, `hsl(${h},${s}%,${i === odd ? l + diff : l}%)`, cs * .15);
      k.rect(0, 0, k.W * left / 60, 6, '#ffd84d'); k.text(Math.ceil(left) + ' с', k.W / 2, 30, 20);
    }
  };
});

/* 97 Реакция */
A({ id: 'reaction', name: 'Реакция', e: '⚡', cat: 'brn', low: true, fmt: v => v + ' мс', how: 'Жди, пока экран станет зелёным, и сразу нажимай! 5 попыток, считается среднее время. Не нажимай раньше!' }, k => {
  let st = 'wait', t = k.R(1.5, 3.5), t0 = 0, res = [], last = '';
  return {
    down() {
      if (st === 'wait') { st = 'early'; k.sfx('bad'); last = 'Рано! Попробуй ещё'; k.after(1, () => { st = 'wait'; t = k.R(1.5, 3.5); }); return; }
      if (st === 'go') { const ms = Math.round((k.t - t0) * 1000); res.push(ms); last = ms + ' мс'; k.sfx('point'); st = 'res';
        if (res.length >= 5) { const avg = Math.round(res.reduce((a, b) => a + b) / res.length); k.set(avg); k.after(.6, () => k.win('Среднее: ' + avg + ' мс')); }
        else k.after(1, () => { st = 'wait'; t = k.R(1.5, 3.5); }); }
    },
    update(dt) { if (st === 'wait') { t -= dt; if (t <= 0) { st = 'go'; t0 = k.t; } } },
    draw() {
      const { W, H } = k; k.clear(st === 'go' ? '#2ecc71' : st === 'early' ? '#e67e22' : st === 'res' ? '#2a5bd7' : '#c0392b');
      k.text(st === 'go' ? 'ЖМИ!' : st === 'wait' ? 'Жди зелёного...' : last, W / 2, H * .4, st === 'go' ? 60 : 32);
      k.text('Попытка ' + Math.min(res.length + 1, 5) + '/5', W / 2, H * .4 + 60, 18, 'rgba(255,255,255,.8)');
      res.forEach((r, i) => k.text(r + ' мс', W / 2, H * .62 + i * 26, 18, 'rgba(255,255,255,.85)'));
    }
  };
});

/* 98 Чёт-нечет */
A({ id: 'evenodd', name: 'Чёт-нечет', e: '↔️', cat: 'brn', how: 'Появляется число. Чётное — нажми слева, нечётное — справа. Быстрее, пока полоска не кончилась!' }, k => {
  let n, t, T, fx = 0, fxc = '';
  const next = () => { n = k.RI(1, 30 + k.score * 5); T = t = Math.max(.8, 2.5 - k.score * .05); };
  next();
  return {
    down(x) { const even = x < k.W / 2; if ((n % 2 === 0) === even) { k.add(); k.sfx('point'); fx = .15; fxc = even ? 'L' : 'R'; next(); } else { k.sfx('bad'); k.over(n + ' — ' + (n % 2 ? 'нечётное' : 'чётное')); } },
    update(dt) { t -= dt; fx = Math.max(0, fx - dt); if (t <= 0) { k.sfx('bad'); k.over('Не успел!'); } },
    draw() {
      const { W, H } = k; k.rect(0, 0, W / 2, H, fx && fxc === 'L' ? '#4fd17a' : '#2a7d4f'); k.rect(W / 2, 0, W / 2, H, fx && fxc === 'R' ? '#5ab0ff' : '#2a5b8f');
      k.text('ЧЁТНОЕ', W / 4, H - 50, 20); k.text('НЕЧЁТНОЕ', W * .75, H - 50, 20);
      k.circ(W / 2, H * .4, 70, '#fff'); k.text(n, W / 2, H * .4, 56, '#222');
      k.rect(W / 2 - 80, H * .4 + 90, 160 * t / T, 8, '#ffd84d', 4);
    }
  };
});

/* 99 Песочница */
A({ id: 'sand', name: 'Песочница', e: '⏳', cat: 'rlx', how: 'Рисуй пальцем — сыплется песок. Выбирай материал внизу: песок, вода, камень, огонь, растение или ластик. Просто расслабься.' }, k => {
  const S = 5, PH = 64, Wc = Math.floor(k.W / S), Hc = Math.floor((k.H - PH) / S), grid = new Uint8Array(Wc * Hc), shade = new Uint8Array(Wc * Hc), life = new Uint8Array(Wc * Hc);
  const EMPTY = 0, SAND = 1, WATER = 2, STONE = 3, FIRE = 4, PLANT = 5, SMOKE = 6;
  const MAT = [[SAND, '🟨', 'Песок'], [WATER, '💧', 'Вода'], [STONE, '🪨', 'Камень'], [FIRE, '🔥', 'Огонь'], [PLANT, '🌱', 'Растение'], [EMPTY, '🧽', 'Ластик']];
  let mat = SAND, hold = null, hue = 40, frame = 0;
  const off = document.createElement('canvas'); off.width = Wc; off.height = Hc; const octx = off.getContext('2d'), img = octx.createImageData(Wc, Hc);
  const idx = (x, y) => y * Wc + x, inb = (x, y) => x >= 0 && y >= 0 && x < Wc && y < Hc;
  function paint(px, py) { const cx = Math.floor(px / S), cy = Math.floor(py / S), r = mat === EMPTY ? 4 : 2; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = cx + dx, y = cy + dy; if (!inb(x, y) || dx * dx + dy * dy > r * r) continue; if (mat === EMPTY) { grid[idx(x, y)] = 0; continue; } if (grid[idx(x, y)] && mat !== STONE) continue; if ((mat === SAND || mat === WATER) && Math.random() < .5) continue; grid[idx(x, y)] = mat; shade[idx(x, y)] = mat === SAND ? hue : k.RI(0, 30); life[idx(x, y)] = mat === FIRE ? k.RI(20, 50) : 0; } }
  function swap(a, b) { [grid[a], grid[b]] = [grid[b], grid[a]]; [shade[a], shade[b]] = [shade[b], shade[a]]; [life[a], life[b]] = [life[b], life[a]]; }
  function step() {
    frame++;
    for (let y = Hc - 1; y >= 0; y--) { const ltr = (frame + y) % 2; for (let i = 0; i < Wc; i++) { const x = ltr ? i : Wc - 1 - i, p = idx(x, y), m = grid[p]; if (!m || m === STONE || m === PLANT) { if (m === PLANT && Math.random() < .02) { const nx = x + k.RI(-1, 1), ny = y + k.RI(-1, 1); if (inb(nx, ny) && grid[idx(nx, ny)] === WATER) { grid[idx(nx, ny)] = PLANT; shade[idx(nx, ny)] = k.RI(0, 30); } } continue; }
      if (m === SAND) { const d = rand2(); for (const [dx, dy] of [[0, 1], [d, 1], [-d, 1]]) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && (grid[idx(nx, ny)] === EMPTY || grid[idx(nx, ny)] === WATER)) { swap(p, idx(nx, ny)); break; } } }
      else if (m === WATER) { const d = rand2(); for (const [dx, dy] of [[0, 1], [d, 1], [-d, 1], [d, 0], [-d, 0]]) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && grid[idx(nx, ny)] === EMPTY) { swap(p, idx(nx, ny)); break; } } }
      else if (m === FIRE || m === SMOKE) { if (--life[p] <= 0 || (life[p] > 200)) { grid[p] = m === FIRE && Math.random() < .5 ? SMOKE : EMPTY; life[p] = 30; continue; } if (m === FIRE) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue; const q = idx(nx, ny); if (grid[q] === PLANT && Math.random() < .3) { grid[q] = FIRE; life[q] = k.RI(20, 50); } if (grid[q] === WATER) { grid[p] = SMOKE; life[p] = 20; } }
        const nx = x + k.RI(-1, 1), ny = y - 1; if (inb(nx, ny) && grid[idx(nx, ny)] === EMPTY) swap(p, idx(nx, ny)); }
    } }
  }
  const rand2 = () => Math.random() < .5 ? 1 : -1;
  return {
    down(x, y) { if (y > k.H - PH) { const i = Math.floor(x / (k.W / MAT.length)); mat = MAT[i][0]; k.sfx('tap'); hold = null; return; } hold = [x, y]; hue = (hue + 7) % 60 + 25; },
    move(x, y, p) { if (p && hold) hold = [x, y]; }, up() { hold = null; },
    update() { if (hold) paint(hold[0], hold[1]); step(); },
    draw() {
      const d = img.data;
      for (let i = 0; i < grid.length; i++) { const m = grid[i], s = shade[i], o = i * 4; let r = 20, g2 = 18, b = 40; if (m === SAND) { r = 220 + (s % 10) * 3; g2 = 150 + s * 1.5; b = 70; } else if (m === WATER) { r = 40; g2 = 120 + s; b = 230; } else if (m === STONE) { r = g2 = b = 110 + s; } else if (m === FIRE) { r = 255; g2 = 80 + life[i] * 3; b = 20; } else if (m === PLANT) { r = 40; g2 = 160 + s * 2; b = 60; } else if (m === SMOKE) { r = g2 = b = 70 + life[i]; } d[o] = r; d[o + 1] = g2; d[o + 2] = b; d[o + 3] = 255; }
      octx.putImageData(img, 0, 0); k.ctx.imageSmoothingEnabled = false; k.clear('#141228'); k.ctx.drawImage(off, 0, 0, Wc * S, Hc * S);
      const bw = k.W / MAT.length; MAT.forEach(([m, e, n], i) => { k.rect(i * bw + 3, k.H - PH + 4, bw - 6, PH - 8, m === mat ? '#fff' : 'rgba(255,255,255,.12)', 10); k.emo(e, i * bw + bw / 2, k.H - PH + 24, 22); k.text(n, i * bw + bw / 2, k.H - 14, 10, m === mat ? '#222' : '#ddd', 'center', 600); });
    }
  };
});

/* 100 Кликер */
A({ id: 'clicker', name: 'Печенька', e: '🍪', cat: 'rlx', how: 'Нажимай на печеньку! Покупай улучшения — печенье будет печься само. Прогресс сохраняется.', fmt: v => v >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e4 ? (v / 1e3).toFixed(1) + 'K' : String(Math.floor(v)) }, k => {
  const UP = [['👆', 'Сильный палец', 15, 0, 1], ['👵', 'Бабушка', 100, 1, 0], ['🏠', 'Пекарня', 1100, 8, 0], ['🏭', 'Фабрика', 12000, 47, 0], ['🚀', 'Космо-печь', 130000, 260, 0], ['🧙', 'Магия', 1.4e6, 1400, 0]];
  let st = k.load('st', { c: 0, own: [0, 0, 0, 0, 0, 0] }), pop = 0, parts = [], btns = [], saveT = 0;
  const per = () => UP.reduce((a, u, i) => a + u[3] * st.own[i], 0), tapV = () => 1 + st.own[0];
  const cost = i => Math.ceil(UP[i][2] * Math.pow(1.15, st.own[i]));
  const fm = v => v >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e4 ? (v / 1e3).toFixed(1) + 'K' : String(Math.floor(v));
  k.set(Math.floor(st.c));
  const ck = () => ({ x: k.W / 2, y: k.H * .26, r: Math.min(k.W, k.H) * .2 });
  return {
    down(x, y) {
      const c = ck(); if (Math.hypot(x - c.x, y - c.y) < c.r) { st.c += tapV(); pop = 1; parts.push({ x, y, l: 1, v: '+' + tapV() }); k.sfx('pop'); k.set(Math.floor(st.c)); return; }
      const b = btns.find(b => k.inb(b, x, y)); if (b && st.c >= cost(b.i)) { st.c -= cost(b.i); st.own[b.i]++; k.sfx('point'); k.save('st', st); k.set(Math.floor(st.c)); }
    },
    update(dt) { st.c += per() * dt; k.set(Math.floor(st.c)); pop = Math.max(0, pop - dt * 5); parts.forEach(p => { p.l -= dt; p.y -= 60 * dt; }); parts = parts.filter(p => p.l > 0); saveT += dt; if (saveT > 2) { saveT = 0; k.save('st', st); } },
    draw() {
      k.clear('#3b2314'); const c = ck(); k.circ(c.x, c.y, c.r * 1.25, 'rgba(255,200,120,.08)');
      k.emo('🍪', c.x, c.y, c.r * 2 * (1 - pop * .08));
      k.text(fm(st.c) + ' печенек', k.W / 2, c.y + c.r + 26, 22); k.text('в секунду: ' + fm(per()) + ' · за нажатие: ' + tapV(), k.W / 2, c.y + c.r + 50, 13, '#e8c9a0');
      parts.forEach(p => k.text(p.v, p.x, p.y, 20, `rgba(255,255,255,${p.l})`));
      btns = []; const y0 = c.y + c.r + 70, bh = Math.min(56, (k.H - y0 - 10) / UP.length - 6);
      UP.forEach((u, i) => { const can = st.c >= cost(i), y = y0 + i * (bh + 6); k.rect(12, y, k.W - 24, bh, can ? 'rgba(255,220,150,.25)' : 'rgba(255,255,255,.06)', 12); k.emo(u[0], 36, y + bh / 2, bh * .55); k.text(u[1] + (st.own[i] ? ' ×' + st.own[i] : ''), 62, y + bh / 2 - 8, 15, can ? '#fff' : '#a88', 'left'); k.text(i ? '+' + fm(u[3]) + '/с' : '+1 за нажатие', 62, y + bh / 2 + 10, 12, '#d8b890', 'left', 600); k.text('🍪 ' + fm(cost(i)), k.W - 24, y + bh / 2, 15, can ? '#ffd84d' : '#a88', 'right'); btns.push({ x: 12, y, w: k.W - 24, h: bh, i }); });
    }
  };
});
})();
