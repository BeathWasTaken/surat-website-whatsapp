# 💌 Surat Untuk Kamu

Surat interaktif ala WhatsApp chat. Satu halaman, tanpa build step, tanpa framework.

---

## 🚀 Cara menjalankan

### Cara cepat (disarankan)

Klik ganda **`MULAI.cmd`**. Browser terbuka ke `http://localhost:8000`.

Dipakai supaya `config.json` terbaca dan audio lokal bisa diputar.

### Cara manual

Klik ganda `index.html`.

> ⚠️ Browser melarang pembacaan `config.json` dan pemutaran audio lokal saat
> halaman dibuka lewat `file://`. Kalau begitu, situs memakai **pengaturan
> cadangan** yang ada di `assets/js/config.js`, dan muncul peringatan di
> Console browser (`F12`).
>
> **Artinya: kalau kamu edit `config.json`, edit-an itu tidak akan terlihat
> sampai kamu menjalankan lewat `MULAI.cmd`.**

---

## 📁 Struktur folder

```
Joki/
├── index.html                 Halaman (markup saja)
├── config.json                ★ SEMUA PENGATURAN DI SINI
├── MULAI.cmd                  Menjalankan server lokal
├── README.md
│
└── assets/
    ├── css/
    │   └── style.css          Tampilan
    ├── js/
    │   ├── config.js          Loader config.json + cadangan
    │   ├── core.js            Utilitas, audio, navigasi scene
    │   ├── lock.js            Layar passcode + dialog konfirmasi
    │   ├── chat.js            Bubble, reaksi, counter, composer
    │   ├── music.js           Kartu pemutar lagu
    │   ├── lightbox.js        Penampil foto layar penuh
    │   └── app.js             Titik masuk / bootstrap
    ├── audio/                 ★ TARUH FILE LAGU DI SINI
    │   └── README.md
    └── img/                   ★ TARUH FOTO, AVATAR, WALLPAPER DI SINI
        └── README.md
```

---

## ⚙️ Mengubah pengaturan

Semua ada di **`config.json`**. Edit, lalu muat ulang halaman.

| Kunci                  | Arti                                                    |
| ---------------------- | ------------------------------------------------------- |
| `passcode`             | Kode 6 digit untuk membuka surat                        |
| `hint`                 | Petunjuk yang muncul setelah 2× gagal                    |
| `nama_panggilan`       | Dipakai di `{nama}`                                     |
| `nama_pengirim`        | Nama di header, dan huruf awal avatar                    |
| `start_date`           | `YYYY-MM-DD` — buat counter "sudah bersama"              |
| `tanggal_lahir`        | `YYYY-MM-DD` — buat counter hari lived                    |
| `usia_ulang_tahun`     | Angka yang dihitung naik di halaman pertama              |
| `wa_number`            | Nomor WhatsApp tujuan, format `628...`                  |
| `wa_pesan`             | Pesan bawaan yang ikut terkirim                         |
| `avatar_src`           | Kosongkan saja kalau tidak ada                          |
| `wallpaper_src`        | Latar belakang, opsional                                |
| `ulang_lagu`           | `true` = muter lagu kalau cuma ada 1                    |
| `daftar_lagu`          | Lihat `assets/audio/README.md`                          |
| `foto_bareng`          | Foto galeri, boleh URL langsung                         |
| `halaman`              | Isi chat, dibaca berurutan                              |

### Contoh

```json
{
  "passcode": "140914",
  "nama_panggilan": "Sayang",
  "nama_pengirim": "Aku"
}
```

---

## 🎵 Menaruh lagu

1. Salin file `.mp3` ke **`assets/audio/`**
2. Daftarkan di `config.json`:

```json
"daftar_lagu": [
  { "src": "assets/audio/lagu1.mp3", "judul": "Lagu untuk kamu", "artis": "Aku", "cover": "" }
]
```

Detailnya ada di `assets/audio/README.md`.

---

## 📝 Menulis isi chat

Setiap halaman punya `items`. Tipe yang tersedia:

| `t`          | Isi                                                          |
| ------------ | ------------------------------------------------------------ |
| `text`       | Pesan biasa. Boleh pakai `{nama}`                            |
| `heartsText` | Pesan yang berubah ikut jumlah hati (`{hearts}`)             |
| `system`     | Baris "encrypted"-style di atas chat                          |
| `birthday`   | Kartu "ulang tahun ke"                                        |
| `days`       | Kartu "kita sudah bersama"                                    |
| `gallery`    | Galeri foto dari `foto_bareng`                                |
| `music`      | Kartu pemutar lagu                                            |
| `love`       | Hujan hati                                                    |
| `end`        | Tombol WhatsApp + "Baca dari awal"                            |
| `choice`     | Pilihan bercabang                                             |
| `image`      | Foto tunggal di dalam chat                                    |
| `voice`      | Pesan suara                                                    |

Contoh satu halaman:

```json
{
  "items": [
    { "t": "text", "text": "Selamat ulang tahun, {nama}." },
    { "t": "text", "text": "Ini untuk kamu.", "typing": 4000 },
    { "t": "heartsText", "zero": "Nggak ada ❤️ pun.", "many": "Kamu ngasih {hearts} hati." }
  ]
}
```

`typing` (milidetik) bersifat opsional — kalau tidak diisi, durasi ketik
dihitung otomatis dari panjang teks.

### Pilihan bercabang

```json
{
  "t": "choice",
  "options": [
    { "label": "Iya", "reply": "Iya, aku juga", "then": [ { "t": "text", "text": "Yeay." } ] },
    { "label": "Nggak dulu", "reply": "Yaudah nanti aja" }
  ]
}
```

---

## ✨ Interaksi

| Gestur                          | Hasil                          |
| ------------------------------- | ------------------------------ |
| Ketuk dua kali pesan            | Reaksi ❤️ (jumlahnya dihitung)  |
| Ketuk composer / `Enter`        | Kirim pesan otomatis           |
| Geser foto di galeri            | Geser galeri                   |
| Ketuk foto                      | Lightbox layar penuh           |
| Geser / panah / `Esc`           | Navigasi & tutup lightbox      |
| Ketuk "Tidak"                   | Tombolnya kabur terus          |
| Tombol 🎵                       | Matikan / nyalakan musik       |
| Panah ‹ di header               | Balik ke daftar chat — **hanya aktif setelah surat selesai**. Kalau lalu dibuka lagi, surat diputar dari awal |

### Layar daftar chat

Bentuknya mengikuti WhatsApp: judul "Chats" rata kiri dengan ikon **⋮** lalu
**+** di kanan, search bar pill di bawahnya, lalu deretan chip filter.

Ikon **⋮**, **+**, search bar, dan chip filter itu **murni hiasan** — tidak
melakukan apa-apa kalau diketuk. Semuanya dibungkus `aria-hidden="true"` dan
`pointer-events:none`, jadi tidak masuk urutan tab dan tidak bisa diklik.
Cuma baris chat-nya (`#openChat`) yang benar-benar berfungsi.

| Bagian    | Kelas             | Catatan                                            |
| --------- | ----------------- | -------------------------------------------------- |
| Ikon ⋮    | `.head-btn`       | Polos, warna teks biasa                            |
| Ikon +    | `.head-btn.is-fab`| Lingkaran hijau `--wa-accent` + bayangan lembut     |
| Chip aktif| `.chip.is-on`     | Latar hijau `--wa-accent`, teks putih              |
| Chip lain | `.chip`           | Latar `#f0f2f5`, teks `--ink`                      |

State "terpilih" ditandai kelas `is-on` di HTML, jadi **All** sudah aktif
secara default tanpa perlu JavaScript.

Kalau mau search bar atau chip-nya bisa diketuk beneran, ganti
`<div class="list-search">` dengan `<input class="list-search">` dan chip
`<span>` dengan `<button>`, lalu kembalikan `pointer-events:auto`. Untuk
mengganti chip aktif, pindahkan kelas `is-on` dan hook
`.list-filters` ke `chat.js`.

---

## 🎨 Menyesuaikan warna

Semua warna ada di `:root` pada `assets/css/style.css`. Semuanya **warna rata**
— sengaja tanpa gradient supaya tidak terlihat norak:

```css
:root{
  --wa-head:#008069;      /* warna header pekat  */
  --wa-accent:#00a884;    /* warna utama      */
  --bubble-in:#ffffff;   /* bubble masuk     */
  --bubble-out:#d9fdd3;   /* bubble keluar    */
  --chat-bg:#efeae2;      /* latar chat       */
  --head-glass:rgba(0,128,105,.82);  /* header frosted */
  --head-blur:blur(14px) saturate(165%);
  --foot-glass:rgba(240,242,245,.86); /* footer frosted */
  --ink:#111b21;          /* teks utama       */
  --ink-soft:#667781;     /* teks sekunder    */
  --tick:#53bdeb;         /* centang biru     */
  --avatar:#b4506b;       /* avatar           */
}
```

Ganti satu nilai itu sudah cukup — tidak perlu menyentuh HTML atau JS.

### Header & footer frosted (efek kaca buram ala iOS)

Header dan footer chat bukan lagi warna pekat, tapi lapisan semi transparan
di atas pola doodle, jadi isinya kelihatan **bebayang**:

```css
--head-glass  /* angka alpha = seberapa tembus. .82 = pekat, .6 = lebih bening */
--head-blur   /* blur() = seberapa buram, saturate() = warnanya makin kaya */
```

Pola doodle pindah ke `#scene-chat::before` (latar diam, menutupi satu
layar penuh). Ini penting: kalau polanya ikut ter-scroll bersama
`.messages`, yang di-blur header cuma warna beige rata sehingga efek kacanya
tidak kelihatan sama sekali.

Area `.messages` tetap transparan dan normal — isinya tidak pernah tertutup
header maupun footer, jadi tidak perlu padding atas khusus.

Efek kedalaman datang dari **opasitas bayangan**, bukan gradient.
Kalau ingin lebih kalem, turunkan angka setelah titik di `box-shadow`:

```css
.bubble{ box-shadow:0 1px .5px rgba(11,20,26,.07); }  /* .07 = sangat halus */
```

---

## 🚀 Deploy ke Vercel

Situs ini **statis murni** — tidak ada build step, tidak ada dependency.
Vercel langsung menyajikan berkasnya.

### Cara A — lewat GitHub (otomatis)

1. Upload folder ini ke repo GitHub.
2. Buka [vercel.com/new](https://vercel.com/new) → **Add New → Project**.
3. Pilih repo GitHub tadi, klik **Import**.
4. Vercel akan membaca `vercel.json` sendiri. Biarkan semua kolom
  _build Command_, _Output Directory_, dan _Install Command_ **kosong**.
5. Klik **Deploy**. Setelah ~30 detik situsnya live.

Setiap `git push` berikutnya otomatis deploy ulang.

> Pilih repo **private** di GitHub supaya tidak bisa diindex siapa saja.

### Cara B — lewat Vercel CLI

```bash
npm i -g vercel
vercel          # sekali, untuk login & menautkan project
vercel --prod   # deploy ke produksi
```

### ⚠️ Audio setelah deploy

File `.mp3` di `assets/audio/` **ikut ter-deploy**. Tapi cek ukuran GitHub:

| Ukuran total repo | Status |
| ----------------- | ------ |
| < 100 MB         | Aman |
| 100–500 MB        | GitHub memberi peringatan |
| > 500 MB / > 1 GB | GitHub **menolak** push |

Kalau lagunya besar, Jangan taruh di Git — pakai URL langsung di `config.json`:

```json
"daftar_lagu": [
  { "src": "https://drive.google.com/.../lagu1.mp3", "judul": "Lagu untuk kamu", "artis": "Aku", "cover": "" }
]
```

Alternatifnya taruh di folder publik (Dropbox/Google Drive/Cloudinary)
lalu pakai URL tersebut.

### 🛡️ Sudah diamankan

- `robots.txt` + `X-Robots-Tag: noindex` → tidak muncul di pencarian Google.
- Header keamanan: `nosniff`, `no-referrer`, `SAMEORIGIN`.
- `index.html` dan `config.json` pakai `no-cache`, jadi edit **`config.json`
  langsung terlihat** setelah muat ulang — tanpa perlu redeploy.
- Berkas CSS/JS di-cache 1 jam supaya cepat.

> ⚠️ Karena `X-Robots-Tag: noindex` aktif, situs hanya bisa dibuka lewat
> link langsung. Kalau nanti mau di-share, hapus baris `X-Robots-Tag`
> dari `vercel.json` **dan** isi ulang `robots.txt`.

---

## 🛠️ Troubleshooting

| Gejala                                      | Penyebab & solusi                                     |
| ------------------------------------------- | ---------------------------------------------------- |
| Layar putih kosong                          | Buka Console (`F12`), cek error                      |
| Musik tidak bunyi                           | Jalankan lewat `MULAI.cmd`, bukan klik ganda         |
| Edit `config.json` tidak berubah            | Masih pakai pengaturan cadangan; jalankan `MULAI.cmd` |
| "Kodenya belum tepat"                       | Cek `passcode` di `config.json`                      |
| Peringatan "config.json tidak bisa dibaca"  | Wajar saat `file://`; abaikan, atau pakai `MULAI.cmd` |
| Galeri tidak muncul                         | `foto_bareng` kosong atau semua `src` tidak terisi   |

---

## 🔒 Catatan privasi

- Tidak ada data yang dikirim ke mana pun.
- Foto dari `picsum.photos` hanya contoh — ganti dengan foto kalian sendiri.
- Kalau mau dipakai offline sepenuhnya, taruh fotonya di `assets/img/`
  lalu ubah `foto_bareng` menjadi path lokal.
