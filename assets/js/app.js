/* =========================================================
   app.js — titik masuk: muat config, lalu nyalakan modul
   ========================================================= */
window.Joki = window.Joki || {};

(function (J) {
  'use strict';

  function boot() {
    J.loadConfig().then(() => {
      const C = J.CONFIG;

      if (!C.passcode) {
        console.error('[Joki] passcode kosong di config.json — layar tidak bisa dibuka.');
        return;
      }
      if (!C.halaman.length) {
        console.error('[Joki] config.json > halaman kosong — tidak ada isi chat.');
        return;
      }

      J.core.applyProfile();
      J.lock.init();
      J.chat.init();
      J.music.init();
      J.lightbox.init();
      J.core.goTo('lock');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.Joki);
