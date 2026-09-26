/* =========================================================
   config.js — pemuat konfigurasi
   Sumber kebenaran: /config.json
   ========================================================= */
window.Joki = window.Joki || {};

(function (J) {
  'use strict';

  /* Nilai cadangan dipakai hanya bila config.json gagal dibaca,
     mis. saat index.html dibuka langsung lewat klik ganda (file://).
     Isi dengan data yang sama seperti config.json. */
  const FALLBACK = {
    passcode: '140914',
    hint: 'Tanggal jadian kita (tanggal, bulan, 2 digit tahun).',
    nama_panggilan: 'Sayang',
    nama_pengirim: 'Aku',
    start_date: '2024-09-14',
    tanggal_lahir: '2006-09-14',
    usia_ulang_tahun: 20,
    wa_number: '6281234567890',
    wa_pesan: 'Aku juga sayang kamu ❤️',
    avatar_src: '',
    wallpaper_src: '',
    ulang_lagu: true,
    daftar_lagu: [
      { src: 'assets/audio/lagu1.mp3', judul: 'Lagu untuk kamu', artis: 'Aku', cover: '' },
      { src: 'assets/audio/lagu2.mp3', judul: 'Senyum Kedua', artis: 'Aku', cover: '' },
      { src: 'assets/audio/lagu3.mp3', judul: 'Hari-Hari Kita', artis: 'Aku', cover: '' }
    ],
    foto_bareng: [
      { src: 'https://picsum.photos/seed/kita01/700/900', caption: 'Yang pertama, dan paling aku suka.' },
      { src: 'https://picsum.photos/seed/kita02/700/900', caption: 'Sore itu, tempat paling ramai. Tapi kita nggak polio.' },
      { src: 'https://picsum.photos/seed/kita03/700/900', caption: 'Foto paling sepi, tapi paling senang.' },
      { src: 'https://picsum.photos/seed/kita04/700/900', caption: 'Kamu lagi ngambek. Tetap aku suka, kok.' },
      { src: 'https://picsum.photos/seed/kita05/700/900', caption: 'Dan ini, karena dua orang kompromis.' }
    ],
    halaman: [
      { items: [
        { t: 'system', text: 'Ketuk dua kali pada pesannya buat ngasih ❤️' },
        { t: 'text', text: 'Selamat ulang tahun, {nama}.' },
        { t: 'text', text: 'Aku tahu kamu nggak suka hadiah yang mepet. Tenang, ini bukan hadiah yang beli. Ini yang aku tulis, pelan-pelan.' },
        { t: 'birthday' },
        { t: 'text', text: 'Nah, ini yang bikin 20 tahun itu berarti.' },
        { t: 'text', text: 'Ini beberapa foto kita bareng. Geser ke samping buat lihat semuanya.' },
        { t: 'gallery' },
        { t: 'text', text: 'Kalau di antara foto-foto itu ada yang bikin kamu senyum, berarti aku nggak salah.' }
      ]},
      { items: [
        { t: 'text', text: 'Aku mau berhenti sebentar dan bicara jujur, boleh?' },
        { t: 'text', text: 'Terima kasih ya. Bukan cuma buat ulang tahun hari ini, tapi buat hari-hari biasa yang sering kita anggap sepele.' },
        { t: 'text', text: 'Makasih udah nemenin aku waktu aku capek, tanpa nanya alasan. Makasih udah sabar waktu aku suluk, tanpa ikut panik.' },
        { t: 'days' },
        { t: 'text', text: 'Kita sudah bareng selama itu. Dan kalau aku jujur, rasanya baru kemarin.' },
        { t: 'text', text: 'Makasih udah jadi bagian paling enak dari hari-hariku. Serius, itu bukan sekadar bahasa pemanis.' }
      ]},
      { items: [
        { t: 'text', text: 'Oke, ini bagian yang agak serius. Jadi dibaca pelan ya.' },
        { t: 'text', text: 'Permintaanku cuma satu: lanjut.' },
        { t: 'text', text: 'Kalau kamu mau cerita, aku siap dengerin sampai habis. Kalau kamu mau pelan-pelan, aku juga nggak keberatan. Aku cuma nggak mau kita berhenti diam-diam tanpa ngomong.' },
        { t: 'text', text: 'Aku pengen ada "kita" di masa depan. Di rumah yang sama, di kejadian yang sama, masih sambil pegang tangan seperti sekarang.' },
        { t: 'text', text: 'Kalau kamu mau, aku juga siap mulai mikir serius: bukan cuma hari ini, tapi lima tahun dan sepuluh tahun ke depan.' },
        { t: 'text', text: 'Itu doaku. Dan kamu tahu, doaku itu bukan cuma harapan. Itu rencana.' }
      ]},
      { items: [
        { t: 'text', text: 'Ada satu lagu yang mau aku dedicate buat kamu.' },
        { t: 'text', text: 'Aku pilih lagu ini karena liriknya banyak yang terasa, tapi nggak perlu dijelaskan.' },
        { t: 'music' },
        { t: 'text', text: 'Putar pelan-pelan ya. Sambil dengerin, mikirin wajah kamu ya.' }
      ]},
      { items: [
        { t: 'text', text: 'Terakhir, deh.' },
        { t: 'text', text: 'Semua yang di atas cuma buat bilang satu hal: aku sayang banget sama kamu.' },
        { t: 'text', text: 'Terima kasih udah jadi kamu. Terima kasih udah nemenin aku sampai sini.' },
        { t: 'heartsText', zero: 'Nggak ada ❤️ pun. Yaudah, nggak apa-apa. Aku tetap sayang, kok.', many: 'Dan kamu ngasih aku ❤️ {hearts} kali. Aku itung, lho.' },
        { t: 'text', text: 'Kalau kamu masih mau liat chat tadi, balas aja di bawah. Nanti aku ulangi dari awal.' },
        { t: 'love' },
        { t: 'end' }
      ]}
    ]
  };

  const BASE = {
    passcode: '',
    hint: '',
    nama_panggil: 'Sayang',
    nama_pengirim: 'Aku',
    start_date: '',
    tanggal_lahir: '',
    usia_ulang_tahun: 0,
    wa_number: '',
    wa_pesan: '',
    avatar_src: '',
    wallpaper_src: '',
    ulang_lagu: true,
    daftar_lagu: [],
    foto_bareng: [],
    halaman: []
  };

  function normalize(raw) {
    const c = Object.assign({}, BASE, raw || {});
    c.passcode = String(c.passcode || '').replace(/\D/g, '');
    c.daftar_lagu = (c.daftar_lagu || []).filter(l => l && l.src);
    c.foto_bareng = (c.foto_bareng || []).filter(f => f && f.src);
    c.halaman = (c.halaman || []).map(h => ({ items: (h && h.items) || [] }));
    return c;
  }

  J.CONFIG = normalize(FALLBACK);

  function viaFetch(url) {
    return fetch(url, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
  }

  /* Cadangan untuk browser/lingkungan yang tidak punya fetch. */
  function viaXHR(url) {
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open('GET', url + '?t=' + Date.now(), true);
      x.onload = () => {
        try { resolve(JSON.parse(x.responseText)); }
        catch (e) { reject(new Error('JSON rusak: ' + e.message)); }
      };
      x.onerror = () => reject(new Error('gagal dimuat'));
      x.send();
    });
  }

  J.loadConfig = function () {
    const url = 'config.json';
    const read = window.fetch ? viaFetch(url) : viaXHR(url);
    return read
      .then(json => {
        J.CONFIG = normalize(json);
        return J.CONFIG;
      })
      .catch(err => {
        console.warn(
          '[Joki] config.json tidak bisa dibaca (' + err.message + ').\n' +
          '             Memakai pengaturan cadangan yang ada di assets/js/config.js.\n' +
          '             Supaya edit config.json terpakai, jalankan lewat MULAI.cmd (server lokal).'
        );
        return J.CONFIG;
      });
  };
})(window.Joki);
