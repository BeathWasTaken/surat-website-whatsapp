/* =========================================================
   music.js â€” kartu pemutar lagu ala Spotify
   Sumber file: assets/audio/ (lihat config.json > daftar_lagu)
   ========================================================= */
window.Joki = window.Joki || {};

(function (J) {
  'use strict';

  const { $, fill, initAudio } = J.core;
  const { appendBubble, makeMeta, setStatus } = J.chat;

  const musicBtn = $('#musicBtn');
  const fmtTime = s => {
    if (!isFinite(s) || s < 0) s = 0;
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  };

  let song = null, muted = false, curIdx = -1;
  /* Dibaca lewat getter, bukan di-cache, supaya tetap sinkron
     setelah config.json selesai dimuat. */
  const LAGUS = () => J.CONFIG.daftar_lagu;
  const curLagu = () => LAGUS()[curIdx] || null;

  function ensureSong() {
    if (song || !LAGUS().length) return song;
    song = new Audio();
    song.preload = 'metadata';
    song.loop = J.CONFIG.ulang_lagu && LAGUS().length === 1;
    song.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.appendChild(song);
    return song;
  }
  function loadTrack(i, autoplay) {
    const a = ensureSong();
    if (!a) return;
    const k = Math.max(0, Math.min(i, LAGUS().length - 1));
    if (k === curIdx && a.src) return;
    curIdx = k;
    a.src = LAGUS()[k].src;
    a.load();
    if (autoplay) a.play().catch(() => {});
  }

  const ICON = {
    play: '<svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>',
    pause: '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h2.2v14H7zM19 5.6v12.8L9.6 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.8 5H17v14h-2.2zM5 5.6v12.8L14.4 12z"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 6h10M4 12h10M4 18h7M17 9.5v9M17 18.5h5"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 15.5V9.2l5-1v5.6"/><circle cx="8" cy="15.5" r="1.6"/><circle cx="13" cy="13.8" r="1.6"/></svg>'
  };

  function addBubble() {
    const a = ensureSong();
    if (!a) return;
    if (curIdx < 0) loadTrack(0, false);

    return appendBubble('in', 'music', b => {
      b.classList.add('rounded');

      const top = document.createElement('div');
      top.className = 'sp-top';
      const art = document.createElement('div');
      art.className = 'sp-art';
      const eq = document.createElement('span');
      eq.className = 'sp-eq'; eq.innerHTML = '<i></i><i></i><i></i><i></i>';
      const txt = document.createElement('div');
      txt.className = 'sp-txt';
      const ti = document.createElement('div'); ti.className = 'sp-title';
      const ar = document.createElement('div'); ar.className = 'sp-artist';
      txt.appendChild(ti); txt.appendChild(ar);
      const menu = document.createElement('button');
      menu.className = 'sp-menu'; menu.type = 'button';
      menu.setAttribute('aria-label', 'Pilih lagu lain');
      menu.innerHTML = ICON.list;
      top.appendChild(art); top.appendChild(txt); top.appendChild(menu);

      const bot = document.createElement('div');
      bot.className = 'sp-bot';
      const prev = document.createElement('button');
      prev.className = 'sp-btn'; prev.type = 'button';
      prev.setAttribute('aria-label', 'Lagu sebelumnya'); prev.innerHTML = ICON.prev;
      const play = document.createElement('button');
      play.className = 'sp-btn sp-play'; play.type = 'button';
      play.setAttribute('aria-label', 'Putar'); play.innerHTML = ICON.play;
      const next = document.createElement('button');
      next.className = 'sp-btn'; next.type = 'button';
      next.setAttribute('aria-label', 'Lagu berikutnya'); next.innerHTML = ICON.next;
      const seek = document.createElement('div');
      seek.className = 'sp-seek';
      const track = document.createElement('div');
      track.className = 'sp-track';
      const fillEl = document.createElement('div');
      fillEl.className = 'sp-fill';
      track.appendChild(fillEl);
      const time = document.createElement('div');
      time.className = 'sp-time';
      const tNow = document.createElement('span'); tNow.textContent = '0:00';
      const tEnd = document.createElement('span'); tEnd.textContent = '0:00';
      time.appendChild(tNow); time.appendChild(tEnd);
      seek.appendChild(track); seek.appendChild(time);
      bot.appendChild(prev); bot.appendChild(play); bot.appendChild(seek); bot.appendChild(next);

      const list = document.createElement('div');
      list.className = 'sp-list';
      const cap = document.createElement('div');
      cap.className = 'sp-list-cap';
      cap.textContent = 'Pilih lagu';
      list.appendChild(cap);
      const rows = LAGUS().map((l, i) => {
        const r = document.createElement('button');
        r.className = 'sp-item'; r.type = 'button';
        const ra = document.createElement('span');
        ra.className = 'sp-item-art';
        if (l.cover) {
          const im = document.createElement('img');
          im.src = l.cover; im.alt = ''; ra.appendChild(im);
        } else ra.innerHTML = ICON.note;
        const rt = document.createElement('span');
        rt.className = 'sp-item-txt';
        const rt1 = document.createElement('span');
        rt1.className = 'sp-item-t'; rt1.textContent = l.judul || 'Lagu ' + (i + 1);
        const rt2 = document.createElement('span');
        rt2.className = 'sp-item-a'; rt2.textContent = l.artis || '';
        rt.appendChild(rt1); rt.appendChild(rt2);
        const rn = document.createElement('span');
        rn.className = 'sp-item-n'; rn.textContent = String(i + 1);
        r.appendChild(ra); r.appendChild(rt); r.appendChild(rn);
        r.addEventListener('click', e => {
          e.stopPropagation();
          initAudio();
          const wasPlaying = !a.paused;
          loadTrack(i, false);
          if (wasPlaying || a.paused) a.play().catch(() => {});
        });
        list.appendChild(r);
        return r;
      });

      b.appendChild(top); b.appendChild(bot); b.appendChild(list);
      b.appendChild(makeMeta('in'));

      const paint = () => {
        const l = curLagu();
        if (l) {
          ti.textContent = l.judul || 'Lagu untuk kamu';
          ar.textContent = l.artis || '';
          if (l.cover && !art.firstElementChild?.classList.contains('sp-eq')) {
            art.innerHTML = ''; art.appendChild(eq);
            const im = document.createElement('img');
            im.src = l.cover; im.alt = ''; art.insertBefore(im, eq);
          } else if (!l.cover && !art.querySelector('svg:not(.sp-eq svg)')) {
            art.innerHTML = ''; art.appendChild(eq);
            art.insertAdjacentHTML('afterbegin', ICON.note);
          }
        }
        const d = a.duration, k = d ? a.currentTime / d : 0;
        fillEl.style.width = (k * 100) + '%';
        tNow.textContent = fmtTime(a.currentTime);
        tEnd.textContent = fmtTime(d);
        const playing = !a.paused;
        play.classList.toggle('playing', playing);
        play.innerHTML = playing ? ICON.pause : ICON.play;
        play.setAttribute('aria-label', playing ? 'Jeda' : 'Putar');
        art.classList.toggle('on', playing);
        const many = LAGUS().length > 1;
        prev.disabled = next.disabled = !many;
        rows.forEach((r, i) => r.classList.toggle('on', i === curIdx));
      };
      play.addEventListener('click', e => {
        e.stopPropagation();
        initAudio();
        if (a.paused) a.play().catch(() => {}); else a.pause();
      });
      prev.addEventListener('click', e => {
        e.stopPropagation();
        if (LAGUS().length < 2) return;
        loadTrack((curIdx - 1 + LAGUS().length) % LAGUS().length, !a.paused);
      });
      next.addEventListener('click', e => {
        e.stopPropagation();
        if (LAGUS().length < 2) return;
        loadTrack((curIdx + 1) % LAGUS().length, !a.paused);
      });
      menu.addEventListener('click', e => {
        e.stopPropagation();
        list.classList.toggle('show');
        menu.setAttribute('aria-expanded', String(list.classList.contains('show')));
      });
      const jump = ev => {
        const r = track.getBoundingClientRect();
        const k = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
        if (isFinite(a.duration)) a.currentTime = k * a.duration;
        paint();
      };
      track.addEventListener('click', e => { e.stopPropagation(); jump(e); });
      ['timeupdate', 'loadedmetadata', 'play', 'pause', 'ended', 'loadstart'].forEach(ev => a.addEventListener(ev, paint));
      paint();
    });
  }

  function syncBtn() { musicBtn.setAttribute('aria-pressed', String(!muted)); }

  /* Tombol musik di header daftar chat:
     klik pertama → putar lagu pertama, klik berikutnya → jeda / lanjutkan.
     Berbeda dari #musicBtn di footer yang cuma mute. */
  function initListBtn() {
    const btn = $('#listMusicBtn');
    if (!btn) return;
    const a = ensureSong();
    if (!a) { btn.hidden = true; return; }

    /* Status pakai flag sendiri, bukan a.paused — yang itu read-only
       dan tidak selalu sinkron di semua browser. */
    let on = false;
    const paint = () => {
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Jeda lagu' : 'Putar lagu');
    };
    a.addEventListener('play', () => { on = true; paint(); });
    a.addEventListener('pause', () => { on = false; paint(); });
    a.addEventListener('ended', () => { on = false; paint(); });

    btn.addEventListener('click', () => {
      initAudio();
      if (muted) { muted = false; syncBtn(); }
      if (on) {
        a.pause();
      } else {
        if (curIdx < 0) loadTrack(0, false);
        if (a.ended) a.currentTime = 0;
        a.play().then(() => { on = true; paint(); }, () => { on = false; paint(); });
      }
    });
    paint();
  }

  function init() {
    musicBtn.addEventListener('click', () => {
      muted = !muted;
      syncBtn();
      if (song) { if (muted) song.pause(); else song.play().catch(() => {}); }
    });
    syncBtn();
    initListBtn();
  }

  J.music = { init, addBubble, get muted() { return muted; }, get current() { return curLagu(); } };
})(window.Joki);
