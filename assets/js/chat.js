/* =========================================================
   chat.js — bubble, reaksi, counter, composer, orkestrasi
   ========================================================= */
window.Joki = window.Joki || {};

(function (J) {
  'use strict';

  const { $, state, goTo, sleep, reduced, fill, fillHearts, hhmm, blip, buzz, scenes } = J.core;

  const box = $('#messages'), statusEl = $('#status');
  const composer = $('#composer'), chips = $('#chips'), composerText = $('#composerText');

  let lastSender = null, runId = 0, timers = [], voiceAudio = null;
  let advBusy = false, advAction = null, advMsg = '';
  let loveTimer = 0, loveCount = 0;

  const scrollDown = () => requestAnimationFrame(() =>
    box.scrollTo({ top: box.scrollHeight, behavior: reduced ? 'auto' : 'smooth' }));
  const setStatus = s => { statusEl.textContent = s; };

  const svg = (html, cls) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', cls); s.innerHTML = html; return s;
  };
  const LOCK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  /* ---------- bubble primitives ---------- */
  function appendPill(text, note) {
    const p = document.createElement('div');
    p.className = 'pill' + (note ? ' note' : '');
    if (note) p.insertAdjacentHTML('beforeend', LOCK_ICON);
    const span = document.createElement('span'); span.textContent = text; p.appendChild(span);
    box.appendChild(p); lastSender = null; scrollDown();
  }

  function makeMeta(kind) {
    const m = document.createElement('span'); m.className = 'meta';
    m.appendChild(document.createTextNode(hhmm()));
    if (kind === 'out') {
      const t = svg('<path d="M1 5.8 4.2 9 10.8 1.6"/><path class="t2" d="M5.5 5.8 8.7 9 15.3 1.6"/>', 'tick');
      t.setAttribute('viewBox', '0 0 17 11'); t.dataset.s = '1'; m.appendChild(t);
    }
    return m;
  }

  function appendBubble(kind, cls, build) {
    const row = document.createElement('div');
    row.className = 'row ' + kind + (lastSender !== kind ? ' first' : '');
    const b = document.createElement('div');
    b.className = 'bubble pop' + (cls ? ' ' + cls : '');
    build(b);
    row.appendChild(b); box.appendChild(row);
    lastSender = kind;
    if (kind === 'in') enableReact(row, b);
    scrollDown();
    return { row, b };
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'row in' + (lastSender !== 'in' ? ' first' : '');
    row.innerHTML = '<div class="bubble typing pop" aria-label="typing"><i></i><i></i><i></i></div>';
    box.appendChild(row); setStatus('sedang mengetik…'); scrollDown();
    return row;
  }
  const hideTyping = row => { row.remove(); setStatus('online'); };

  /* ---------- reaksi cinta (double-tap) ---------- */
  function enableReact(row, b) {
    let last = 0;
    b.addEventListener('click', () => {
      const now = Date.now();
      if (now - last < 330) { toggleReact(row, b); last = 0; } else { last = now; }
    });
  }
  function toggleReact(row, b) {
    const has = b.querySelector('.react');
    if (has) { has.remove(); row.classList.remove('has-react'); state.hearts = Math.max(0, state.hearts - 1); return; }
    const r = document.createElement('span'); r.className = 'react'; r.textContent = '❤️'; b.appendChild(r);
    row.classList.add('has-react'); state.hearts++;
    for (let i = 0; i < 4; i++) {
      const h = document.createElement('span'); h.className = 'fly-heart'; h.textContent = '♥';
      h.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px');
      h.style.animationDelay = (i * 90) + 'ms';
      b.appendChild(h); setTimeout(() => h.remove(), 1400);
    }
    blip('react'); buzz(14); scrollDown();
  }

  function addText(text) {
    return appendBubble('in', '', b => {
      const s = document.createElement('span'); s.className = 'txt'; s.textContent = text;
      b.appendChild(s); b.appendChild(makeMeta('in'));
    });
  }

  /* ---------- counter tanggal ---------- */
  function parseDate(s) {
    if (!s) return null;
    const p = String(s).split('-').map(Number);
    const d = new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
    return isNaN(d) || d > new Date() ? null : d;
  }
  const startDate = () => parseDate(J.CONFIG.start_date);
  const birthDate = () => parseDate(J.CONFIG.tanggal_lahir);

  function ymd(s, n) {
    let y = n.getFullYear() - s.getFullYear(), m = n.getMonth() - s.getMonth(), d = n.getDate() - s.getDate();
    if (d < 0) { m--; d += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y, m, d };
  }
  function since(ms) {
    const days = Math.floor(ms / 864e5), r = ms - days * 864e5;
    return {
      days,
      clock: Math.floor(r / 36e5) + ' jam ' + String(Math.floor(r % 36e5 / 6e4)).padStart(2, '0') +
        ' menit ' + String(Math.floor(r % 6e4 / 1e3)).padStart(2, '0') + ' detik'
    };
  }
  function countUp(el, total, dur) {
    if (reduced) { el.textContent = total.toLocaleString('id-ID'); return; }
    const t0 = performance.now();
    const step = now => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      el.textContent = Math.round(total * (1 - Math.pow(1 - k, 3))).toLocaleString('id-ID');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function addDays() {
    const s = startDate();
    return appendBubble('in', 'days', b => {
      b.innerHTML = '<div class="d-label">Kita sudah bersama</div>' +
        '<div class="d-num"><b>0</b><span>hari</span></div>' +
        '<div class="d-sub"></div><div class="d-live"></div>';
      b.appendChild(makeMeta('in'));
      const num = b.querySelector('b'), sub = b.querySelector('.d-sub'), live = b.querySelector('.d-live');
      const compute = () => {
        const n = new Date(), ms = n - s, p = ymd(s, n);
        const parts = [p.y && p.y + ' tahun', p.m && p.m + ' bulan', p.d && p.d + ' hari'].filter(Boolean);
        sub.textContent = parts.length ? parts.join(' ') : 'Baru mulai';
        live.textContent = '+ ' + since(ms).clock + ', dan terus bertambah';
        return Math.floor(ms / 864e5);
      };
      countUp(num, compute(), 1500);
      timers.push(setInterval(compute, 1000));
    });
  }

  function addBirthday() {
    const s = birthDate();
    if (!s) return;
    appendBubble('in', 'days bd', b => {
      b.innerHTML = '<div class="d-label">Hari ini ulang tahun ke</div>' +
        '<div class="d-num"><b>0</b><span>tahun</span></div>' +
        '<div class="d-sub"></div><div class="d-live"></div>';
      b.appendChild(makeMeta('in'));
      const num = b.querySelector('b'), sub = b.querySelector('.d-sub'), live = b.querySelector('.d-live');
      const compute = () => {
        const ms = new Date() - s, p = ymd(s, new Date());
        sub.textContent = 'Sejak ' + s.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) +
          ' · ' + [p.y && p.y + ' tahun', p.m && p.m + ' bulan', p.d && p.d + ' hari'].filter(Boolean).join(' ');
        live.textContent = 'Sudah ' + since(ms).days.toLocaleString('id-ID') + ' hari hidup, dan masih nambah';
      };
      compute();
      timers.push(setInterval(compute, 1000));
      countUp(num, J.CONFIG.usia_ulang_tahun, 900);
    });
  }

  /* ---------- galeri di dalam chat ---------- */
  function addGallery() {
    const photos = J.CONFIG.foto_bareng;
    if (!photos.length) return;
    let strip, hint;
    appendBubble('in', 'gal', b => {
      strip = document.createElement('div');
      strip.className = 'gal-scroll';
      photos.forEach((p, i) => {
        const fig = document.createElement('figure');
        fig.className = 'gal-item';
        const img = document.createElement('img');
        img.src = p.src; img.alt = p.caption || 'Foto'; img.loading = 'lazy';
        img.addEventListener('click', e => { e.stopPropagation(); J.lightbox.open(photos, i); });
        fig.appendChild(img);
        if (p.caption) {
          const c = document.createElement('figcaption');
          c.className = 'gal-cap'; c.textContent = fill(p.caption);
          fig.appendChild(c);
        }
        strip.appendChild(fig);
      });
      b.appendChild(strip);
      hint = document.createElement('div');
      hint.className = 'gal-hint';
      b.appendChild(hint);
      b.appendChild(makeMeta('in'));
      b.querySelector('.meta').style.cssText = 'float:none;display:flex;justify-content:flex-end;margin:.1rem .3rem 0;';
      strip.addEventListener('scroll', scrollDown, { passive: true });
    });

    const MIN = 128, MAX = 264, GAP = 6.4, PAD = 8;
    const layout = () => {
      const avail = strip.clientWidth;
      if (!avail || !strip.isConnected) return;
      const room = Math.max(avail - PAD, 1);
      const per = Math.max(1, Math.min(photos.length, Math.floor((room + GAP) / (MIN + GAP))));
      const w = Math.min(MAX, (room - (per - 1) * GAP) / per);
      strip.style.setProperty('--gw', w.toFixed(2) + 'px');
      strip.style.setProperty('--gh', (w * 0.75).toFixed(2) + 'px');
      strip.style.justifyContent = photos.length <= per ? 'center' : 'flex-start';
      if (strip.scrollWidth <= strip.clientWidth + 2) hint.remove();
      else hint.textContent = '⟨ geser ke kanan ⟩';
    };
    requestAnimationFrame(layout);
    if (window.ResizeObserver) new ResizeObserver(layout).observe(strip);
  }

  /* ---------- voice note ---------- */
  function addVoice(item) {
    return appendBubble('in', 'voice', b => {
      const N = 30, bars = [];
      let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      b.innerHTML =
        '<div class="v-row"><button class="v-play" aria-label="Putar pesan suara">' +
        '<svg class="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
        '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></button>' +
        '<div class="v-wave"></div></div><span class="v-dur"></span>';
      const wave = b.querySelector('.v-wave'), dur = b.querySelector('.v-dur'), btn = b.querySelector('.v-play');
      for (let i = 0; i < N; i++) { const bar = document.createElement('i'); bar.style.height = (18 + rnd() * 82) + '%'; wave.appendChild(bar); bars.push(bar); }
      dur.textContent = item.duration || '0:00';
      const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
      const audio = new Audio(item.src); audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', () => { if (isFinite(audio.duration)) dur.textContent = fmt(audio.duration); });
      audio.addEventListener('timeupdate', () => {
        const k = audio.duration ? audio.currentTime / audio.duration : 0;
        bars.forEach((x, i) => x.classList.toggle('on', i / N < k));
        dur.textContent = fmt(audio.currentTime);
      });
      audio.addEventListener('ended', () => {
        btn.classList.remove('playing'); bars.forEach(x => x.classList.remove('on'));
        dur.textContent = isFinite(audio.duration) ? fmt(audio.duration) : (item.duration || '0:00');
      });
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (audio.paused) {
          if (voiceAudio && voiceAudio !== audio) voiceAudio.pause();
          voiceAudio = audio; audio.play().catch(() => {}); btn.classList.add('playing');
        } else { audio.pause(); btn.classList.remove('playing'); }
      });
      audio.addEventListener('pause', () => btn.classList.remove('playing'));
      b.appendChild(makeMeta('in'));
      b.querySelector('.meta').style.cssText = 'float:none;display:flex;justify-content:flex-end;margin:-.75rem 0 0;';
    });
  }

  function addImage(item) {
    return appendBubble('in', 'media', b => {
      const img = document.createElement('img');
      img.src = item.src; img.alt = item.caption || 'Foto';
      img.addEventListener('load', scrollDown);
      img.addEventListener('click', e => { e.stopPropagation(); J.lightbox.open([{ src: item.src, caption: item.caption }], 0); });
      b.appendChild(img);
      if (item.caption) { const c = document.createElement('span'); c.className = 'cap'; c.textContent = fill(item.caption); b.appendChild(c); }
      b.appendChild(makeMeta('in'));
    });
  }

  /* ---------- kirim pesan keluar ---------- */
  function sendOut(text, id) {
    const { b } = appendBubble('out', '', bb => {
      const s = document.createElement('span'); s.className = 'txt'; s.textContent = text;
      bb.appendChild(s); bb.appendChild(makeMeta('out'));
    });
    const tick = b.querySelector('.tick');
    blip('out'); buzz(8);
    setTimeout(() => { if (id === runId) tick.dataset.s = '2'; }, 450);
    setTimeout(() => { if (id === runId) tick.dataset.s = '3'; }, 1300);
    return sleep(1300);
  }

  /* ---------- pilihan ---------- */
  function askChoice(item) {
    return new Promise(resolve => {
      composer.hidden = true; chips.hidden = false; chips.className = 'chips'; chips.innerHTML = '';
      item.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'chip'; btn.textContent = fill(opt.label);
        btn.addEventListener('click', () => { chips.hidden = true; composer.hidden = false; resolve(opt); });
        chips.appendChild(btn);
      });
      scrollDown();
    });
  }

  /* ---------- hujan hati ---------- */
  const HEART_COLORS = ['#e5567a', '#ff8fa8', '#f4b6c2', '#ff6b8b', '#e0245e'];
  function spawnHearts(n) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        if (!scenes.chat.classList.contains('active')) return;
        const h = document.createElement('span');
        h.className = 'fly';
        loveCount++;
        h.textContent = loveCount % 5 === 0 ? '❤️' : '♥';
        h.style.left = (Math.random() * 100) + '%';
        h.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
        h.style.color = HEART_COLORS[loveCount % HEART_COLORS.length];
        h.style.fontSize = ((12 + Math.random() * 24) / 16) + 'rem';
        h.style.animationDuration = (3 + Math.random() * 2.6) + 's';
        scenes.chat.appendChild(h);
        setTimeout(() => h.remove(), 6200);
      }, i * 115);
    }
  }
  function loveRain() {
    if (loveTimer) return;
    spawnHearts(40);
    loveTimer = setInterval(() => spawnHearts(12), 1400);
  }
  function stopRain() { if (loveTimer) { clearInterval(loveTimer); loveTimer = 0; } }

  /* ---------- composer (ketik otomatis) ---------- */
  function resetComposer() {
    composer.classList.remove('ready', 'sent');
    composerText.textContent = 'Type a message';
  }
  function showAdvancer(msg, action) {
    advMsg = msg; advAction = action;
    composer.hidden = false; chips.hidden = true;
    resetComposer();
    setStatus('online'); scrollDown();

    const type = async () => {
      for (let i = 1; i <= msg.length; i++) {
        if (advAction !== action) return;
        if (i === 1) composer.classList.add('ready');
        composerText.textContent = msg.slice(0, i);
        await sleep(reduced ? 0 : 45);
      }
    };
    type();
  }
  async function submitAdv() {
    if (advBusy || !advAction) return;
    advBusy = true;
    const action = advAction; advAction = null;
    composer.classList.add('sent');
    await sleep(220);
    await sendOut(advMsg, runId);

    resetComposer();
    await sleep(700);
    advBusy = false;
    action();
  }

  function showEnd() {
    chips.className = 'chips center'; chips.innerHTML = '';
    if (J.CONFIG.wa_number) {
      const a = document.createElement('a');
      a.className = 'chip primary'; a.textContent = 'Balas lewat WhatsApp';
      a.href = 'https://wa.me/' + J.CONFIG.wa_number + '?text=' + encodeURIComponent(J.CONFIG.wa_pesan);
      a.target = '_blank'; a.rel = 'noopener';
      chips.appendChild(a);
      chips.hidden = false;
    } else chips.hidden = true;
    showAdvancer('Baca dari awal', () => playPage(0));
  }

  function showNext(i) {
    chips.hidden = true; chips.innerHTML = '';
    showAdvancer('Selanjutnya', () => playPage(i + 1));
  }

  /* ---------- orkestrasi ---------- */
  async function play(items, id) {
    for (const item of items) {
      if (id !== runId) return;
      await runItem(item, id);
    }
  }

  async function runItem(item, id) {
    const C = J.CONFIG;
    switch (item.t) {
      case 'system': appendPill(fill(item.text)); await sleep(700); return;
      case 'love': loveRain(); return;
      case 'gallery': addGallery(); blip('in'); await sleep(1100); return;
      case 'music':
        if (J.music.muted) { addText('Musik aku matiin dulu, biar nggak ganggu. Bisa dinyalain lagi dari tombol nota di atas.'); await sleep(1000); return; }
        J.music.addBubble(); await sleep(1400); return;
      case 'end': showEnd(); return;
      case 'choice': {
        const opt = await askChoice(item);
        if (id !== runId) return;
        await sendOut(fill(opt.reply || opt.label), id);
        if (id !== runId) return;
        await sleep(500);
        await play(opt.then || [], id);
        return;
      }
    }
    if (item.t === 'image' && !item.src) return;
    if (item.t === 'voice' && !item.src) return;
    if (item.t === 'music' && !C.daftar_lagu.length) return;
    if (item.t === 'days' && !startDate()) return;
    if (item.t === 'birthday' && !birthDate()) return;

    let text = null;
    if (item.t === 'text') text = fill(item.text);
    if (item.t === 'heartsText') {
      text = state.hearts === 0 ? fill(item.zero) : fillHearts(item.many);
    }

    const typingMs = item.typing != null ? item.typing
      : text ? Math.min(2600, Math.max(800, 500 + text.length * 24)) : 1100;
    if (typingMs > 0) {
      const row = showTyping();
      await sleep(typingMs);
      hideTyping(row);
      if (id !== runId) return;
    }

    if (text != null) addText(text);
    else if (item.t === 'days') addDays();
    else if (item.t === 'birthday') addBirthday();
    else if (item.t === 'image') addImage(item);
    else if (item.t === 'voice') addVoice(item);
    blip('in'); buzz(10);

    await sleep(text ? 350 + text.length * 14 : 1000);
  }

  function resetChat() {
    runId++;
    timers.forEach(clearInterval); timers = [];
    if (voiceAudio) { voiceAudio.pause(); voiceAudio = null; }
    stopRain();
    scenes.chat.querySelectorAll('.fly').forEach(h => h.remove());
    box.innerHTML = ''; lastSender = null;
    chips.hidden = true; chips.innerHTML = ''; composer.hidden = false;
    resetComposer();
    advAction = null; advBusy = false;
    setStatus('online');
  }

  async function playPage(i) {
    const pages = J.CONFIG.halaman;
    if (i < 0 || i >= pages.length) return;
    const replacing = box.children.length > 0;
    if (replacing && !reduced) {
      box.classList.add('swap-out');
      await sleep(300);
    }
    resetChat();
    box.classList.remove('swap-out');
    if (replacing) {
      box.classList.add('swap-in');
      setTimeout(() => box.classList.remove('swap-in'), 460);
    }
    const id = runId;
    appendPill('Hari ini');
    if (i > 0) appendPill(fill('Lanjut lagi ya, {nama}.'), true);
    setTimeout(() => {
      if (id !== runId) return;
      play(pages[i].items, id).then(() => {
        if (id !== runId) return;
        if (i < pages.length - 1) showNext(i);
      });
    }, 900);
  }

  function init() {
    $('#openChat').addEventListener('click', () => {
      J.core.initAudio();
      goTo('chat');
      if (!state.started) { state.started = true; setTimeout(() => playPage(0), 750); }
    });

    composer.addEventListener('click', submitAdv);
    document.addEventListener('keydown', e => {
      if (state.current === 'chat' && (e.key === 'Enter' || e.key === ' ') && advAction && !advBusy) {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault(); submitAdv();
      }
    });
  }

  J.chat = { init, playPage, addText, appendBubble, makeMeta, setStatus, scrollDown, stopRain };
})(window.Joki);
