/* =========================================================
   lightbox.js — penampil foto layar penuh (swipe/drag)
   ========================================================= */
window.Joki = window.Joki || {};

(function (J) {
  'use strict';

  const { $, fill } = J.core;

  const lb = $('#lightbox'), lbTrack = $('#lbTrack'), lbCap = $('#lbCap'),
    lbCount = $('#lbCount'), lbPrev = $('#lbPrev'), lbNext = $('#lbNext'),
    lbClose = $('#lbClose');

  let lbList = [], lbIndex = 0;
  let lbDown = false, lbX = 0, lbDX = 0, lbMoved = false;

  function paint() {
    const p = lbList[lbIndex] || {};
    lbCap.textContent = fill(p.caption || '');
    lbCount.textContent = (lbIndex + 1) + ' / ' + lbList.length;
    const multi = lbList.length > 1;
    lbPrev.hidden = !multi; lbNext.hidden = !multi;
  }

  function go(i, dir) {
    if (!lbList.length) return;
    const next = Math.max(0, Math.min(i, lbList.length - 1));
    if (next === lbIndex) { lbTrack.style.setProperty('--dir', dir || 1); return; }
    const from = lbTrack.children[lbIndex];
    lbIndex = next;
    lbTrack.style.setProperty('--dir', dir || 1);
    if (from) { from.classList.remove('on'); from.classList.add('out'); }
    const to = lbTrack.children[lbIndex];
    if (to) {
      to.classList.remove('out');
      void to.offsetWidth;
      to.classList.add('on');
    }
    paint();
  }

  function open(list, index) {
    lbList = (Array.isArray(list) ? list : [{ src: list, caption: '' }]).filter(p => p && p.src);
    if (!lbList.length) return;
    lbTrack.innerHTML = '';
    lbList.forEach((p, i) => {
      const img = document.createElement('img');
      img.src = p.src; img.alt = p.caption || 'Foto ' + (i + 1);
      img.draggable = false;
      lbTrack.appendChild(img);
    });
    lbIndex = -1;
    go(Math.max(0, Math.min(index | 0, lbList.length - 1)), 1);
    lb.classList.add('show');
  }

  const close = () => {
    lb.classList.remove('show');
    lbTrack.classList.remove('dragging');
    lbDown = false; lbMoved = false; lbDX = 0;
  };

  function init() {
    lbTrack.addEventListener('pointerdown', e => {
      lbDown = true; lbMoved = false; lbX = e.clientX; lbDX = 0;
      lbTrack.classList.add('dragging');
    });
    window.addEventListener('pointermove', e => {
      if (!lbDown) return;
      lbDX = e.clientX - lbX;
      if (Math.abs(lbDX) > 6) lbMoved = true;
      const img = lbTrack.children[lbIndex];
      if (img) img.style.transform = 'translateX(' + lbDX + 'px)';
    });
    window.addEventListener('pointerup', () => {
      if (!lbDown) return;
      lbDown = false;
      lbTrack.classList.remove('dragging');
      const img = lbTrack.children[lbIndex];
      if (Math.abs(lbDX) > 45) go(lbIndex + (lbDX < 0 ? 1 : -1), lbDX < 0 ? 1 : -1);
      if (img) img.style.transform = '';
      lbDX = 0;
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', () => go(lbIndex - 1, -1));
    lbNext.addEventListener('click', () => go(lbIndex + 1, 1));

    lb.addEventListener('click', e => {
      if (lbMoved) return;
      if (e.target.closest('.lb-nav, .lb-close')) return;
      if (e.target.closest('.lb-track img')) return;
      close();
    });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(lbIndex - 1, -1);
      if (e.key === 'ArrowRight') go(lbIndex + 1, 1);
    });
  }

  J.lightbox = { init, open, close, go };
})(window.Joki);
