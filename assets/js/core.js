/* =========================================================
   core.js — utilitas bersama, audio, navigasi scene
   ========================================================= */
window.Joki = window.Joki || {};

(function (J) {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* Hearts sengaja TIDAK di-reset oleh resetChat() — dipakai di halaman penutup. */
  const state = { hearts: 0, current: 'lock', confirmOpen: false, started: false };

  function fill(s) {
    return String(s == null ? '' : s).split('{nama}').join(J.CONFIG.nama_panggilan);
  }
  function fillHearts(s) {
    return String(s == null ? '' : s).split('{hearts}').join(state.hearts);
  }
  const hhmm = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

  /* ---------- audio synthesized (tidak butuh file) ---------- */
  let ac = null, soundOn = true;
  function initAudio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
  }
  function blip(kind) {
    if (!soundOn || !ac) return;
    try {
      const f = { in: [740, 990], out: [520, 660], react: [880, 1320] }[kind];
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f[0], t);
      o.frequency.exponentialRampToValueAtTime(f[1], t + .07);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.07, t + .008);
      g.gain.exponentialRampToValueAtTime(.0001, t + .17);
      o.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + .2);
    } catch (e) {}
  }
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  /* ---------- navigasi scene ---------- */
  const scenes = {
    lock: $('#scene-lock'),
    confirm: $('#scene-confirm'),
    list: $('#scene-list'),
    chat: $('#scene-chat')
  };

  function goTo(name) {
    state.current = name;
    if (name !== 'confirm') state.confirmOpen = false;
    Object.entries(scenes).forEach(([k, el]) => {
      el.classList.toggle('active', k === name);
      el.inert = (k !== name);
    });
  }

  /* ---------- terapkan identitas dari config ---------- */
  function applyProfile() {
    const C = J.CONFIG;
    $$('[data-sender]').forEach(el => { el.textContent = C.nama_pengirim; });
    $$('[data-avatar]').forEach(el => {
      if (C.avatar_src) {
        el.style.backgroundImage = 'url("' + C.avatar_src + '")';
      } else {
        el.textContent = (Array.from(C.nama_pengirim.trim())[0] || 'A').toUpperCase();
      }
    });
    if (C.wallpaper_src) {
      $('#wallpaper').style.backgroundImage = 'url("' + C.wallpaper_src + '")';
    }
    $('#listPreview').textContent = fill('Ada yang mau aku ceritain, {nama}');
    $('#listTime').textContent = hhmm();
  }

  J.core = {
    $, $$, sleep, reduced, fill, fillHearts, hhmm, state, scenes, goTo,
    initAudio, blip, buzz, applyProfile,
    get soundOn() { return soundOn; },
    set soundOn(v) { soundOn = v; }
  };
})(window.Joki);
