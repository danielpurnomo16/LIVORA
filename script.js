/* ===== LIVORA - script.js ===== */

/* ---------- PENGATURAN GAMBAR ----------
   Taruh semua gambar di folder "images/" dengan nama:
   gambar_1 ... gambar_10. Jika ekstensi bukan .png ubah IMG_EXT di bawah. */
const IMG_DIR = 'images/';
const IMG_EXT = '.png';           // ganti ke '.jpg' / '.webp' bila perlu
const imgUrl = n => IMG_DIR + n + IMG_EXT;

function applyImages(root = document) {
  root.querySelectorAll('[data-src]').forEach(img => {
    img.onerror = () => { const s = document.createElement('span'); s.className = 'logo-fallback'; s.textContent = 'LIVORA'; img.replaceWith(s); };
    img.src = imgUrl(img.dataset.src);
  });
  root.querySelectorAll('[data-bg]').forEach(el => pickImg(el.dataset.bg, u => {
    el.style.backgroundImage = `url(${u})`;
    if (el.classList.contains('avatar') || el.classList.contains('ph') || el.classList.contains('ic')) el.style.fontSize = '0';
  }));
}
/* Di laptop (lebar >= 900px) dicoba dulu gambar_X_pc; jika tidak ada, dipakai gambar_X yang sama dengan HP */
const PC = matchMedia('(min-width:900px)');
function pickImg(n, ok) {
  const list = n.split(',').flatMap(x => PC.matches ? [x + '_pc', x] : [x]);
  (function next(i) { if (i >= list.length) return; const t = new Image(); t.onload = () => ok(imgUrl(list[i])); t.onerror = () => next(i + 1); t.src = imgUrl(list[i]); })(0);
}
PC.onchange = () => { applyImages(); if (typeof cur !== 'undefined' && cur) go(cur, false, true); };

/* ---------- NAVIGASI ---------- */
const $ = s => document.querySelector(s);
const NO_BAR = ['splash', 'login', 'dash'];
const NAV = ['dash', 'profile', 'logistik', 'price-tani', 'price-ternak'];
const NO_BG10 = ['splash', 'login', 'dash', 'profile'];
let stack = [], cur = null, flow = 'match', ctype = 'tani';

function go(id, reset = false, replace = false) {
  if (reset) stack = [];
  else if (cur && !replace && cur !== id) stack.push(cur);
  cur = id;
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  $('#topbar').classList.toggle('hidden', NO_BAR.includes(id));
  $('#bnav').classList.toggle('hidden', !NAV.includes(id));
  document.querySelectorAll('#bnav button').forEach(b => b.classList.toggle('on', b.dataset.n === id));
  const app = $('#app');
  if (!NO_BG10.includes(id)) pickImg(bgFor(id), u => { if (cur === id) { app.classList.add('has-bg'); app.style.backgroundImage = `url(${u})`; } });
  else { app.classList.remove('has-bg'); app.style.backgroundImage = ''; }
  window.scrollTo(0, 0);
}
function goBack() { stopTimers(); go(stack.length ? stack.pop() : 'dash', false, true); if (!stack.length && cur === 'dash') { /* ok */ } }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200); }
let timers = [];
function stopTimers() { timers.forEach(clearInterval); timers = []; }
const wait = (fn, ms) => { const i = setInterval(() => fn(i), ms); timers.push(i); return i; };

/* ---------- LOGIN ---------- */
function togglePass() { const p = $('#pass'); p.type = p.type === 'password' ? 'text' : 'password'; }
function doLogin(google) {
  const e = $('#email').value.trim(), p = $('#pass').value;
  if (!google && (!e || !p)) return toast('Mohon isi email dan password');
  if (e) { const n = e.split('@')[0]; $('#dash .uname').textContent = n.charAt(0).toUpperCase() + n.slice(1); }
  go('dash', true);
}
function logout() { go('login', true); toast('Anda telah keluar'); }

/* ---------- PILIH JENIS USAHA ---------- */
const FLOWS = {
  match: { ico: '🤝', t: 'AI Matching', d: 'Pencocokan otomatis antara produk Anda dengan mitra yang membutuhkan pasokan.', s: 'Tentukan jenis komoditas untuk memulai pencocokan mitra.', a: 'Cocokkan hasil tanaman seperti padi, cabai, jagung, sayuran, dan komoditas pertanian lainnya.', b: 'Cocokkan hasil peternakan seperti sapi, kambing, ayam, telur, susu, dan produk peternakan lainnya.' },
  fc: { ico: '📊', t: 'AI Production Forecasting', d: 'Prediksi jumlah produksi komoditas berbasis AI untuk mendukung perencanaan panen dan distribusi.', s: 'Tentukan jenis komoditas untuk memulai prediksi produksi.', a: 'Prediksi produksi tanaman seperti padi, cabai, jagung, sayuran, dan komoditas pertanian lainnya.', b: 'Prediksi produksi peternakan seperti sapi, kambing, ayam, telur, susu, dan produk peternakan lainnya.' },
  price: { ico: '⚖', t: 'Transparansi Harga', d: 'Pantau harga komoditas secara real-time di berbagai lokasi untuk transaksi yang lebih adil dan transparan.', s: 'Tentukan jenis komoditas untuk melihat informasi harga pasar.', a: 'Lihat dan bandingkan harga komoditas pertanian seperti padi, cabai, jagung, sayuran, dan lainnya di berbagai lokasi.', b: 'Lihat dan bandingkan harga produk peternakan seperti sapi, kambing, ayam, telur, susu, dan lainnya di berbagai lokasi.' },
  ag: { ico: '📦', t: 'Agregasi Pasokan', d: 'Penggabungan pasokan dari berbagai produsen untuk memenuhi kebutuhan mitra dalam skala besar.', s: 'Tentukan jenis komoditas untuk melakukan agregasi pasokan.', a: 'Gabungkan pasokan komoditas pertanian seperti padi, cabai, jagung, sayuran, dan lainnya dari berbagai produsen.', b: 'Gabungkan pasokan produk peternakan seperti sapi, kambing, ayam, telur, susu, dan lainnya dari berbagai produsen.' }
};
function startFlow(f) {
  flow = f; const c = FLOWS[f];
  $('#ch-ico').textContent = c.ico; $('#ch-title').textContent = c.t; $('#ch-desc').textContent = c.d;
  $('#ch-sub').textContent = c.s; $('#ch-tani').textContent = c.a; $('#ch-ternak').textContent = c.b;
  go('choose', NAV.includes(cur) && f === 'price' && cur !== 'dash' ? true : false);
}
function pickType(t) {
  ctype = t;
  if (flow === 'match') return openMatch(t);
  go({ fc: 'fc-', price: 'price-', ag: 'ag-' }[flow] + t);
  if (flow === 'price') t === 'tani' ? showPrice() : renderAnimal(0);
  if (flow === 'ag' && t === 'ternak') renderAggTabs();
}

/* ---------- AI MATCHING ---------- */
const MATCH = {
  tani: { kom: ['Cabai Merah', 'Padi', 'Jagung', 'Sayuran'], list: [['🛒', 'PT Segar Nusantara', 'Makassar (± 75 km)', 98, '10.000 kg', '20 – 22 Apr 2026'], ['🥬', 'CV Pangan Sejahtera', 'Maros (± 60 km)', 94, '8.000 kg', '18 – 21 Apr 2026'], ['🏪', 'Koperasi Tani Mandiri', 'Makassar (± 80 km)', 91, '12.000 kg', '21 – 24 Apr 2026']], best: ['AgriFresh Indonesia', 'Bandung, Jawa Barat', 95] },
  ternak: { kom: ['Sapi', 'Kambing', 'Ayam', 'Telur'], list: [['🐄', 'PT Ternak Makmur', 'Makassar (± 70 km)', 97, '40 ekor', '20 – 22 Apr 2026'], ['🍖', 'CV Daging Sejahtera', 'Maros (± 55 km)', 93, '25 ekor', '18 – 21 Apr 2026'], ['🏪', 'Koperasi Peternak Mandiri', 'Gowa (± 30 km)', 90, '30 ekor', '21 – 24 Apr 2026']], best: ['Prima Ternak Nusantara', 'Surabaya, Jawa Timur', 96] }
};
function openMatch(t) {
  const m = MATCH[t];
  $('#m-kom').innerHTML = m.kom.map(k => `<option>${k}</option>`).join('');
  $('#m-vol').value = t === 'tani' ? '10.000' : '40';
  $('#m-list').innerHTML = m.list.map(r => `<div class="res"><span class="ic">${r[0]}</span><div><b>${r[1]}</b><small>📍 ${r[2]}</small><small>📦 Kebutuhan: ${r[4]}</small><small>🚚 Pengiriman: ${r[5]}</small></div><div class="pc">Kecocokan<strong>${r[3]}%</strong><button class="btn sm" onclick="toast('Penawaran diajukan ke ${r[1]} ✔')">Ajukan Penawaran ›</button></div></div>`).join('');
  go('match-form');
}
function startSearch() {
  if (!$('#m-vol').value.trim()) return toast('Isi volume tersedia dulu');
  go('match-search'); let p = 0; const bar = $('#s-bar');
  bar.style.width = '0'; ['sd1', 'sd2', 'sd3'].forEach(i => $('#' + i).className = 'dot');
  $('#sd1').classList.add('cur');
  wait(i => {
    p += 2; bar.style.width = p + '%';
    if (p > 30) { $('#sd1').className = 'dot done'; $('#sd2').classList.add('cur'); }
    if (p > 70) { $('#sd2').className = 'dot done'; $('#sd3').classList.add('cur'); }
    if (p >= 100) {
      clearInterval(i); $('#sd3').className = 'dot done';
      const b = MATCH[ctype].best, v = $('#m-vol').value;
      $('#f-name').textContent = b[0]; $('#f-pc').textContent = '👍 ' + b[2] + '%';
      $('#f-prod').textContent = $('#m-kom').value; $('#f-vol').textContent = v + (ctype === 'tani' ? ' kg' : ' ekor');
      $('#saveBtn').textContent = '🔖 Simpan Mitra'; $('#saveBtn').classList.remove('saved');
      setTimeout(() => go('match-found', false, true), 400);
    }
  }, 100);
}
function cancelSearch() { stopTimers(); go('match-form', false, true); }
function saveMitra() { const b = $('#saveBtn'); const s = b.classList.toggle('saved'); b.textContent = s ? '✔ Mitra Tersimpan' : '🔖 Simpan Mitra'; toast(s ? 'Mitra disimpan' : 'Dihapus dari simpanan'); }

/* ---------- GRAFIK SVG ---------- */
function lineChart(vals, labels, fmt = v => v, unit = '') {
  const W = 320, H = 170, L = 36, R = 16, T = 26, B = 24;
  const mn = Math.min(...vals), mx = Math.max(...vals), pad = (mx - mn) * .25 || 1, lo = mn - pad, hi = mx + pad;
  const x = i => L + i * (W - L - R) / (vals.length - 1), y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  let g = ''; for (let k = 0; k < 4; k++) { const v = lo + (hi - lo) * k / 3; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e1ecd9"/><text x="${L - 4}" y="${y(v) + 3}" font-size="9" text-anchor="end" fill="#5d6b61">${fmt(v)}</text>`; }
  const step = Math.ceil(vals.length / 6);
  const xl = labels.map((l, i) => i % step === 0 || i === vals.length - 1 ? `<text x="${x(i)}" y="${H - 6}" font-size="9" text-anchor="middle" fill="#5d6b61">${l}</text>` : '').join('');
  const dots = vals.length <= 8 ? vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#fff" stroke="#2e8b2f" stroke-width="2"/>`).join('') : '';
  const lx = x(vals.length - 1), ly = y(vals.at(-1));
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${g}<polygon points="${L},${H - B} ${pts} ${lx},${H - B}" fill="rgba(63,165,53,.15)"/><polyline points="${pts}" fill="none" stroke="#2e8b2f" stroke-width="2.5"/>${dots}<circle cx="${lx}" cy="${ly}" r="5" fill="#14532d"/><rect x="${lx - 38}" y="${ly - 22}" width="60" height="16" rx="8" fill="#14532d"/><text x="${lx - 8}" y="${ly - 10}" font-size="9" fill="#fff" text-anchor="middle">${fmt(vals.at(-1))}${unit}</text></svg>`;
}

/* ---------- FORECASTING ---------- */
const YIELD = { 'Padi': [5.2, 120, '🌾'], 'Cabai Merah': [8, 110, '🌶'], 'Jagung': [6, 100, '🌽'] };
const fmtDate = d => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
function runForecast() {
  const c = $('#fc-crop').value, ha = parseFloat($('#fc-ha').value);
  if (!(ha > 0)) return toast('Masukkan luas lahan yang valid');
  const [y, d] = YIELD[c], ton = +(ha * y).toFixed(1);
  const dt = new Date(); dt.setDate(dt.getDate() + d);
  $('#r-crop').textContent = c; $('#r-ton').textContent = ton + ' Ton'; $('#r-date').textContent = fmtDate(dt);
  const f = [.7, .8, .9, 1].map(k => +(ton * k).toFixed(1));
  $('#r-chart').innerHTML = lineChart(f, ['Jan', 'Feb', 'Mar', 'Apr'], v => v.toFixed(1), ' T');
  go('fc-res');
}
function runTernak() {
  const w = parseFloat($('#t-w').value); if (!(w > 0)) return toast('Masukkan bobot awal');
  $('#t-w0').textContent = w + ' kg'; $('#t-w1').textContent = Math.round(w * 1.07) + ' kg';
  $('#t-bln').textContent = '24 – 30 bulan';
  const a = new Date(), b = new Date(); a.setMonth(a.getMonth() + 24); b.setMonth(b.getMonth() + 30);
  const m = d => d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  $('#t-tgl').textContent = m(a) + ' – ' + m(b);
  $('#t-res').classList.remove('hidden'); $('#t-res').scrollIntoView({ behavior: 'smooth' });
}

/* ---------- TRANSPARANSI HARGA ---------- */
const PRICE = { 'Cabai Merah': ['🌶', 28500, 6.3], 'Padi': ['🌾', 6750, 2.5], 'Jagung': ['🌽', 5400, -0.8] };
const rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
function series(base, n) { let s = 7, v = base * .9; return Array.from({ length: n }, (_, i) => { s = (s * 9301 + 49297) % 233280; v += (base * (1 - .1 * (1 - i / (n - 1))) - v) * .35 + (s / 233280 - .5) * base * .03; return Math.round(v); }); }
function showPrice(n = 7) {
  const k = $('#p-kom').value, [ic, p, c] = PRICE[k];
  $('#p-ic').textContent = ic; $('#p-name').textContent = k; $('#p-val').textContent = rp(p) + '/kg';
  const ch = $('#p-chg'); ch.textContent = (c >= 0 ? '▲ +' : '▼ ') + c.toString().replace('.', ',') + '%'; ch.className = c >= 0 ? 'up' : 'dn';
  const s = series(p, n), lab = s.map((_, i) => n === 7 ? (10 + i) + ' Apr' : 'H-' + (n - i));
  $('#p-chart').innerHTML = lineChart(s, lab, v => Math.round(v).toLocaleString('id-ID'), '/kg');
  const loc = [['Gowa, Sulsel', .96, -1.8], ['Makassar, Sulsel', 1, 4.2], ['Maros, Sulsel', 1.02, 6.3], ['Takalar, Sulsel', .98, 3.1]];
  $('#p-tbl').innerHTML = loc.map(l => `<tr><td>📍 ${l[0]}</td><td><b>${rp(p * l[1])}</b></td><td class="${l[2] > 0 ? 'up' : 'dn'}">${l[2] > 0 ? '▲ +' : '▼ '}${String(l[2]).replace('.', ',')}%</td><td class="ok">● Tersedia</td></tr>`).join('');
}
$('#p-pills').addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') return; [...e.currentTarget.children].forEach(b => b.classList.remove('on')); e.target.classList.add('on'); showPrice([7, 30, 90][[...e.currentTarget.children].indexOf(e.target)]); });
const ANIMAL = [['Sapi', '🐄', 60000, 2.5], ['Kambing', '🐐', 85000, 1.2], ['Ayam', '🐓', 32000, -0.6], ['Telur', '🥚', 28500, 1.9]];
function renderAnimal(i) {
  $('#a-tabs').innerHTML = ANIMAL.map((a, j) => `<button class="${j === i ? 'on' : ''}" onclick="renderAnimal(${j})"><span>${a[1]}</span>${a[0]}</button>`).join('');
  const a = ANIMAL[i]; $('#a-n').textContent = a[0]; $('#a-i').textContent = a[1]; $('#a-p').textContent = 'Rp ' + a[2].toLocaleString('id-ID');
  const c = $('#a-c'); c.textContent = (a[3] >= 0 ? '▲ +' : '▼ ') + String(a[3]).replace('.', ',') + '%'; c.className = a[3] >= 0 ? 'up' : 'dn';
  const R = [['Jawa Barat', 1, a[3]], ['Jawa Tengah', .997, 1.9], ['Jawa Timur', .99, -.6], ['Sumatera Utara', 1.013, 1.3]];
  $('#a-tbl').innerHTML = R.map(r => `<tr><td>${r[0]}</td><td><b>${Math.round(a[2] * r[1]).toLocaleString('id-ID')}</b></td><td class="${r[2] >= 0 ? 'up' : 'dn'}">${r[2] >= 0 ? '▲ +' : '▼ '}${String(r[2]).replace('.', ',')}%</td></tr>`).join('');
}

/* ---------- AGREGASI ---------- */
function startAgg() {
  go('ag-prog'); const bar = $('#g-bar'), li = [...document.querySelectorAll('#g-list li')], txt = ['Mengidentifikasi produsen', 'Mengumpulkan pasokan', 'Menggabungkan volume produksi', 'Menyiapkan hasil agregasi'];
  let p = 0; bar.style.width = '0'; $('#g-pc').textContent = '0%';
  wait(i => {
    p += 2; bar.style.width = p + '%'; $('#g-pc').textContent = p + '%';
    const st = Math.min(3, Math.floor(p / 25));
    li.forEach((l, k) => { l.className = k < st ? 'done' : k === st ? 'cur' : ''; l.textContent = (k < st ? '✔ ' : k === st ? '◐ ' : '○ ') + txt[k]; });
    if (p >= 100) { clearInterval(i); li[3].className = 'done'; li[3].textContent = '✔ ' + txt[3]; setTimeout(() => go('ag-done', false, true), 600); }
  }, 80);
}
const AG = { 0: ['Sapi', '🐄'], 1: ['Kambing', '🐐'], 2: ['Ayam', '🐓'], 3: ['Telur', '🥚'] };
let agSel = 0, agTot = 38, agFar = 12; const TARGET = 50;
function renderAggTabs() {
  $('#g-tabs').innerHTML = Object.values(AG).map((a, j) => `<button class="${j === agSel ? 'on' : ''}" onclick="agSel=${j};renderAggTabs()"><span>${a[1]}</span>${a[0]}</button>`).join('');
  const pc = Math.round(agTot / TARGET * 100), u = agSel === 3 ? 'butir' : 'ekor';
  $('#g-st').textContent = `${AG[agSel][0]} – Permintaan Pasar: ${TARGET} ${u} • Terkumpul ${agTot} ${u} (${pc}%)`;
  $('#gt-bar').style.width = pc + '%'; $('#gd1').textContent = agFar + ' peternak'; $('#gd2').textContent = agTot + ' ' + u;
}
function addSupply() {
  const n = parseInt($('#g-add').value); if (!(n > 0)) return toast('Masukkan jumlah yang valid');
  if (agTot >= TARGET) return toast('Target permintaan sudah terpenuhi 🎉');
  agTot = Math.min(TARGET, agTot + n); agFar++; renderAggTabs();
  toast(agTot >= TARGET ? 'Target terpenuhi! 🎉' : `+${n} bergabung ke agregasi ✔`);
}

/* ---------- LOGISTIK ---------- */
function trackTruck() {
  const t = $('#truck'), P = [[50, 38], [56, 30], [64, 40], [72, 56], [78, 58]]; let i = 0; toast('Melacak armada…');
  wait(k => { if (i >= P.length) return clearInterval(k); t.style.left = P[i][0] + '%'; t.style.top = P[i][1] + '%'; i++; }, 1200);
}

/* ---------- START ---------- */
applyImages();
go('splash', true);
setTimeout(() => cur === 'splash' && go('login', true), 2300);
