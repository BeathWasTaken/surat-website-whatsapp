/* =========================================================
   lock.js — layar kunci (passcode) + dialog konfirmasi
   ========================================================= */
window.Joki = window.Joki || {};

(function (J) {
  'use strict';

  const { $, state, goTo, initAudio, blip, buzz } = J.core;

  const lockEl = J.core.scenes.lock, confirmEl = J.core.scenes.confirm;
  const dialog = $('#dialog');
  const pinDots = $('#pinDots'), lockMsg = $('#lockMsg'), lockSub = $('#lockSub');
  const yesBtn = $('#yesBtn'), noBtn = $('#noBtn'), noSlot = $('#noSlot');

  const SUB_DEFAULT = lockSub.textContent;
  let entered = '', fails = 0, lockBusy = false, flyer = null;

  /* ---------- dialog konfirmasi ---------- */
  function makeFlyer() {
    if (flyer) return flyer;
    const f = noBtn.cloneNode(true);
    f.removeAttribute('id');
    f.className = 'dlg-btn no-fly';
    f.setAttribute('aria-hidden', 'true');
    f.tabIndex = -1;
    confirmEl.appendChild(f);
    noSlot.classList.add('empty');
    flyer = f;
    return f;
  }
  function dropFlyer() {
    if (flyer) { flyer.remove(); flyer = null; }
    noSlot.classList.remove('empty');
  }
  function placeAt(cx, cy) {
    const sr = confirmEl.getBoundingClientRect();
    flyer.style.left = (cx - sr.left - flyer.offsetWidth / 2) + 'px';
    flyer.style.top = (cy - sr.top - flyer.offsetHeight / 2) + 'px';
  }
  function dodge() {
    const isNew = !flyer;
    const f = makeFlyer();
    const sr = confirmEl.getBoundingClientRect(), dlg = dialog.getBoundingClientRect();
    const r = noBtn.getBoundingClientRect();
    const fw = f.offsetWidth, fh = f.offsetHeight, pad = 16, gap = 18;
    const L = dlg.left - sr.left, T = dlg.top - sr.top, R = dlg.right - sr.left, B = dlg.bottom - sr.top;
    const zones = [
      { x: pad, y: pad, w: L - pad - gap, h: sr.height - pad * 2 },
      { x: R + gap, y: pad, w: sr.width - R - pad - gap, h: sr.height - pad * 2 },
      { x: L, y: pad, w: R - L, h: T - pad - gap },
      { x: L, y: B + gap, w: R - L, h: sr.height - B - pad - gap }
    ].filter(z => z.w >= fw && z.h >= fh);

    const from = isNew
      ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      : { x: parseFloat(flyer.style.left) + fw / 2, y: parseFloat(flyer.style.top) + fh / 2 };

    let next;
    if (zones.length) {
      const pick = () => {
        const z = zones[(Math.random() * zones.length) | 0];
        return { x: z.x + fw / 2 + Math.random() * (z.w - fw), y: z.y + fh / 2 + Math.random() * (z.h - fh) };
      };
      next = null;
      for (let i = 0; i < 40; i++) {
        const p = pick();
        if (Math.hypot(p.x - from.x, p.y - from.y) >= 90) { next = p; break; }
      }
      if (!next) next = pick();
    } else {
      next = {
        x: pad + fw / 2 + Math.random() * Math.max(sr.width - fw - pad * 2, 1),
        y: pad + fh / 2 + Math.random() * Math.max(sr.height - fh - pad * 2, 1)
      };
    }

    placeAt(from.x, from.y);
    requestAnimationFrame(() => placeAt(next.x, next.y));
  }

  function openConfirm() {
    state.confirmOpen = true;
    state.current = 'confirm';
    dropFlyer();
    confirmEl.classList.add('active'); confirmEl.inert = false;
    lockEl.classList.add('active'); lockEl.inert = true;
    dialog.focus({ preventScroll: true });
  }
  function closeConfirm() {
    state.confirmOpen = false;
    confirmEl.classList.remove('active'); confirmEl.inert = true;
    lockEl.inert = false;
    state.current = 'lock';
    entered = ''; fails = 0; renderPin();
    lockMsg.textContent = ''; lockBusy = false;
    resetSub();
  }

  /* ---------- passcode ---------- */
  function showHint() { lockSub.textContent = J.CONFIG.hint || 'Petunjuknya belum diisi di pengaturan.'; }
  function resetSub() { lockSub.textContent = SUB_DEFAULT; }
  const renderPin = () => Array.from(pinDots.children).forEach((d, i) => d.classList.toggle('filled', i < entered.length));

  function checkCode() {
    if (entered === J.CONFIG.passcode) {
      lockBusy = true;
      lockMsg.textContent = '';
      setTimeout(() => {
        openConfirm();
        setTimeout(() => { entered = ''; renderPin(); lockBusy = false; }, 500);
      }, 250);
    } else {
      fails++;
      lockMsg.textContent = 'Kodenya belum tepat.';
      if (fails >= 2 && J.CONFIG.hint) showHint();
      pinDots.classList.remove('shake'); void pinDots.offsetWidth; pinDots.classList.add('shake');
      setTimeout(() => { entered = ''; renderPin(); }, 420);
    }
  }
  function press(k) {
    if (state.current !== 'lock' || lockBusy) return;
    initAudio();
    if (k === 'del') { entered = entered.slice(0, -1); renderPin(); return; }
    if (entered.length >= J.CONFIG.passcode.length) return;
    entered += k; renderPin();
    if (entered.length === J.CONFIG.passcode.length) setTimeout(checkCode, 200);
  }

  function init() {
    const code = J.CONFIG.passcode;
    pinDots.innerHTML = '';
    for (let i = 0; i < code.length; i++) pinDots.appendChild(document.createElement('span'));

    $('#forgotBtn').addEventListener('click', showHint);
    $('#keypad').addEventListener('click', e => {
      const btn = e.target.closest('.key'); if (!btn) return;
      btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 130);
      press(btn.dataset.key);
    });
    document.addEventListener('keydown', e => {
      if (state.current !== 'lock') return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      if (e.key === 'Backspace') press('del');
    });

    noBtn.addEventListener('click', dodge);
    confirmEl.addEventListener('click', e => {
      if (e.target.closest('.no-fly')) dodge();
    });
    yesBtn.addEventListener('click', () => goTo('list'));
    confirmEl.addEventListener('pointerdown', e => { if (e.target === confirmEl) closeConfirm(); });
    document.addEventListener('keydown', e => {
      if (state.confirmOpen && e.key === 'Escape') { e.preventDefault(); closeConfirm(); }
    });

    /* tombol suara notifikasi */
    $('#soundBtn').addEventListener('click', e => {
      J.core.soundOn = !J.core.soundOn;
      e.currentTarget.setAttribute('aria-pressed', String(J.core.soundOn));
      if (J.core.soundOn) { initAudio(); blip('in'); }
    });
  }

  J.lock = { init, dodge, closeConfirm };
})(window.Joki);
