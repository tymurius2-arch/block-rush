// Движок: меню, общий цикл игры, касания, звук, рекорды.
// Каждая игра: G.add({id,name,e,cat,how,low}, k => ({update(dt),draw(),down(x,y),move(x,y,pressed),up(x,y),tap(x,y),swipe(dir)}))
(() => {
const $ = s => document.querySelector(s);
const CATS = { all: 'Все', arc: 'Аркады', spo: 'Спорт', puz: 'Головоломки', brd: 'Настольные', brn: 'Мозг', rlx: 'Релакс' };
const PAL = { bg: '#14112e', fg: '#fff', dim: '#8a84b8', cell: '#2a2268', cell2: '#352c85', gold: '#ffd84d',
  r: '#ff5d73', o: '#ffa53d', y: '#ffde3d', g: '#47d873', b: '#35c2ff', p: '#7b6bff', m: '#e45cff' };
const COLS = [PAL.r, PAL.o, PAL.y, PAL.g, PAL.b, PAL.p, PAL.m];
const GAMES = [];
const cv = $('#cv'), ctx = cv.getContext('2d');
let meta = null, game = null, k = null, state = 'menu', last = 0, cat = 'all';
let sound = true, ac = null;

const ls = {
  get(key, d) { try { const v = localStorage.getItem('g100_' + key); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(key, v) { try { localStorage.setItem('g100_' + key, JSON.stringify(v)); } catch (e) {} }
};
sound = ls.get('sound', true);

/* ---------- звук ---------- */
function unlock() { if (!sound) return; try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state !== 'running') ac.resume(); } catch (e) {} }
function tone(f, t0, d, type, v) {
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + .03);
}
const SFX = {
  tap: () => tone(600, 0, .05, 'triangle', .07),
  hit: () => tone(220, 0, .08, 'square', .05),
  point: () => { tone(660, 0, .08, 'triangle', .09); tone(990, .06, .1, 'triangle', .08); },
  pop: () => tone(880 + Math.random() * 300, 0, .07, 'sine', .1),
  bad: () => tone(140, 0, .2, 'sawtooth', .06),
  win: () => [523, 659, 784, 1047].forEach((f, j) => tone(f, j * .1, .25, 'triangle', .1)),
  over: () => [392, 330, 262, 196].forEach((f, j) => tone(f, j * .15, .3, 'sine', .11)),
  jump: () => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'square'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(700, t + .12); g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .14); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .15); },
  boom: () => { const n = ac.sampleRate * .3, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2; const s = ac.createBufferSource(), g = ac.createGain(); g.gain.value = .25; s.buffer = b; s.connect(g); g.connect(ac.destination); s.start(); }
};
function sfx(n) { if (!sound || !ac) return; try { (SFX[n] || SFX.tap)(); } catch (e) {} }

/* ---------- набор инструментов для игр ---------- */
function makeKit() {
  const W = cv.clientWidth, H = cv.clientHeight;
  const K = {
    W, H, P: PAL, C: COLS, ctx, t: 0, score: 0,
    add(n = 1) { K.score += n; showScore(); },
    set(n) { K.score = n; showScore(); },
    over(msg) { finish(msg, false); },
    win(msg) { finish(msg, true); },
    sfx, toast,
    R: (a, b) => a + Math.random() * (b - a),
    RI: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: a => a[Math.floor(Math.random() * a.length)],
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    dist: (a, b, c, d) => Math.hypot(c - a, d - b),
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    load: (key, d) => ls.get(meta.id + '_' + key, d),
    save: (key, v) => ls.set(meta.id + '_' + key, v),
    clear(c = PAL.bg) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); },
    rect(x, y, w, h, c, r = 0) { ctx.fillStyle = c; if (r > 0 && w > 0 && h > 0) { ctx.beginPath(); rr(x, y, w, h, Math.min(r, w / 2, h / 2)); ctx.fill(); } else ctx.fillRect(x, y, w, h); },
    srect(x, y, w, h, c, lw = 2, r = 0) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); if (r) rr(x, y, w, h, Math.min(r, w / 2, h / 2)); else ctx.rect(x, y, w, h); ctx.stroke(); },
    circ(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); ctx.fill(); },
    ring(x, y, r, c, lw = 2) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); ctx.stroke(); },
    line(x1, y1, x2, y2, c, lw = 2) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); },
    poly(pts, c) { ctx.fillStyle = c; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); },
    text(s, x, y, sz = 20, c = '#fff', al = 'center', w = 800) { ctx.fillStyle = c; ctx.font = `${w} ${sz}px -apple-system,system-ui,sans-serif`; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); },
    emo(s, x, y, sz) { ctx.font = `${sz}px -apple-system,system-ui,"Apple Color Emoji",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(s, x, y); },
    block(x, y, s, c, r) { K.rect(x, y, s, s, c, r ?? s * .18); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x + s * .15, y + s * .08, s * .7, s * .1); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(x + s * .1, y + s * .84, s * .8, s * .1); },
    // раскладка сетки cols×rows в доступной области
    fit(cols, rows, top = 0, bottom = 0, pad = 12) {
      const cs = Math.floor(Math.min((W - 2 * pad) / cols, (H - top - bottom - 2 * pad) / rows));
      return { cs, cols, rows, x: Math.floor((W - cs * cols) / 2), y: Math.floor(top + (H - top - bottom - cs * rows) / 2) };
    },
    cell(g, x, y) { const c = Math.floor((x - g.x) / g.cs), r = Math.floor((y - g.y) / g.cs); return c >= 0 && r >= 0 && c < g.cols && r < g.rows ? [c, r] : null; },
    // кнопки на холсте
    btn(x, y, w, h, label, c = 'rgba(255,255,255,.14)', tc = '#fff', sz) { K.rect(x, y, w, h, c, 14); K.text(label, x + w / 2, y + h / 2 + 1, sz || Math.min(20, h * .45), tc); return { x, y, w, h }; },
    inb: (b, x, y) => b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h,
    after(sec, fn) { timers.push({ t: K.t + sec, fn }); },
  };
  let timers = [];
  K._tick = () => { const now = timers.filter(t => t.t <= K.t); timers = timers.filter(t => t.t > K.t); now.forEach(t => t.fn()); };
  return K;
}
function rr(x, y, w, h, r) { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

let toastT = 0;
function toast(s, c = '#fff') { const t = $('#toast'); t.textContent = s; t.style.color = c; t.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => t.style.opacity = 0, 900); }

/* ---------- рекорды ---------- */
const bestOf = m => ls.get('best_' + m.id, null);
function fmt(m, v) { return v === null || v === undefined ? '' : (m.fmt ? m.fmt(v) : String(v)); }
function showScore() { $('#sc').textContent = fmt(meta, k.score); }
function showBest() { const b = bestOf(meta); $('#bs').textContent = b === null ? '' : '👑 ' + fmt(meta, b); }

/* ---------- экраны ---------- */
function renderMenu() {
  $('#cats').innerHTML = '';
  Object.entries(CATS).forEach(([id, name]) => {
    const b = document.createElement('button'); b.textContent = name + (id === 'all' ? ' · ' + GAMES.length : '');
    if (id === cat) b.className = 'on';
    b.onclick = () => { cat = id; ls.set('cat', id); renderMenu(); };
    $('#cats').appendChild(b);
  });
  const list = $('#list'); list.innerHTML = '';
  GAMES.forEach((m, i) => {
    if (cat !== 'all' && m.cat !== cat) return;
    const b = document.createElement('button'); b.className = 'tile';
    const best = bestOf(m);
    b.innerHTML = `<span class="num">${i + 1}</span><span class="e">${m.e}</span><span class="n">${m.name}</span><span class="b">${best === null ? '' : '👑 ' + fmt(m, best)}</span>`;
    b.onclick = () => { unlock(); open(m); };
    list.appendChild(b);
  });
}
function sizeCanvas() {
  const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
  ctx.setTransform(d, 0, 0, d, 0, 0);
}
function open(m) {
  meta = m; $('#toast').style.opacity = 0; $('#menu').style.display = 'none'; $('#play').style.display = 'flex';
  $('#title').textContent = m.e + ' ' + m.name; $('#snd').textContent = sound ? '🔊' : '🔇';
  sizeCanvas(); newGame(); state = 'intro';
  card(`<div class="e">${m.e}</div><h2>${m.name}</h2><p>${m.how}</p><div class="row"><button class="go" id="b1">Играть</button></div>`);
  $('#b1').onclick = () => { unlock(); closeCard(); state = 'play'; };
  showBest();
}
function newGame() { k = makeKit(); game = meta.make(k) || {}; showScore(); draw(); }
function finish(msg, won) {
  if (state !== 'play') return;
  state = 'over';
  const prev = bestOf(meta), sc = k.score;
  const better = meta.low ? (won && (prev === null || sc < prev)) : (sc > 0 && (prev === null || sc > prev));
  if (better) ls.set('best_' + meta.id, sc);
  showBest();
  sfx(won ? 'win' : 'over');
  setTimeout(() => {
    if (state !== 'over') return;
    card(`<div class="e">${won ? '🏆' : meta.e}</div><h2>${msg || (won ? 'Победа!' : 'Игра окончена')}</h2>
      ${better && prev !== null ? '<div class="nb">👑 НОВЫЙ РЕКОРД!</div>' : ''}
      <div class="big">${fmt(meta, sc)}</div><p>Рекорд: <b>${fmt(meta, bestOf(meta)) || '—'}</b></p>
      <div class="row"><button class="alt" id="b2">Меню</button><button class="go" id="b1">Ещё раз</button></div>`);
    $('#b1').onclick = () => { closeCard(); newGame(); state = 'play'; };
    $('#b2').onclick = toMenu;
  }, 650);
}
function toMenu() { state = 'menu'; closeCard(); $('#play').style.display = 'none'; $('#menu').style.display = 'block'; renderMenu(); }
function card(html) { $('#card').innerHTML = html; $('#ov').classList.add('on'); }
function closeCard() { $('#ov').classList.remove('on'); }

/* ---------- цикл ---------- */
function draw() { try { ctx.save(); game.draw && game.draw(); ctx.restore(); } catch (e) { console.error(e); } }
function loop(t) {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
  if (state === 'menu') return;
  if (state === 'play') { k.t += dt; k._tick(); if (game.update) game.update(dt); }
  draw();
}

/* ---------- касания ---------- */
let pd = null;
function pt(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); unlock(); if (state !== 'play') return;
  const p = pt(e); pd = { x: p.x, y: p.y, t: performance.now() };
  try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  game.down && game.down(p.x, p.y);
});
cv.addEventListener('pointermove', e => { if (state !== 'play') return; const p = pt(e); game.move && game.move(p.x, p.y, !!pd); });
const pup = e => {
  if (!pd) return; const s = pd; pd = null; if (state !== 'play') return;
  const p = pt(e); game.up && game.up(p.x, p.y);
  if (state !== 'play') return;
  const dx = p.x - s.x, dy = p.y - s.y, d = Math.hypot(dx, dy), dt = performance.now() - s.t;
  if (d > 25 && dt < 600) game.swipe && game.swipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'));
  else if (d < 14) game.tap && game.tap(p.x, p.y);
};
cv.addEventListener('pointerup', pup); cv.addEventListener('pointercancel', pup);
document.addEventListener('touchmove', e => { if (state !== 'menu') e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
window.addEventListener('keydown', e => {
  if (state !== 'play') return;
  const m = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D' }[e.key];
  if (m && game.swipe) { game.swipe(m); e.preventDefault(); }
  if (e.key === ' ' && game.down) { game.down(k.W / 2, k.H / 2); game.up && game.up(k.W / 2, k.H / 2); }
});

/* ---------- старт ---------- */
window.G = {
  add(m, make) { m.make = make; GAMES.push(m); },
  list: GAMES,
  start() {
    cat = ls.get('cat', 'all'); if (!CATS[cat]) cat = 'all';
    renderMenu();
    $('#back').onclick = toMenu;
    $('#snd').onclick = () => { sound = !sound; ls.set('sound', sound); $('#snd').textContent = sound ? '🔊' : '🔇'; unlock(); };
    $('#rand').onclick = () => { unlock(); open(GAMES[Math.floor(Math.random() * GAMES.length)]); };
    window.addEventListener('resize', () => { if (state !== 'menu') { sizeCanvas(); if (state === 'intro') newGame(); } });
    requestAnimationFrame(loop);
    const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !standalone && !ls.get('hint', false)) $('#hint').classList.add('on');
    $('#hintok').onclick = () => { $('#hint').classList.remove('on'); ls.set('hint', true); };
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  },
  _test: { open: m => { open(m); unlock(); closeCard(); state = 'play'; }, state: () => state, kit: () => k, game: () => game, draw, toMenu }
};
})();
