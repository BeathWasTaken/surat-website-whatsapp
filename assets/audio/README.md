# 🎵 TARUH FILE LAGU DI FOLDER INI

Salin file `.mp3` / `.m4a` ke folder ini, lalu daftarkan di `config.json`:

```json
"daftar_lagu": [
  { "src": "assets/audio/lagu1.mp3", "judul": "Lagu untuk kamu", "artis": "Aku", "cover": "" }
]
```

| Kolom    | Wajib | Keterangan                                             |
| -------- | ----- | ------------------------------------------------------ |
| `src`    | ya    | Alamat file relatif, contoh `assets/audio/lagu1.mp3`   |
| `judul`  | tidak | Tampil di kartu pemutar. Kosongkan kalau tidak ada.    |
| `artis`  | tidak | Tampil di bawah judul.                                  |
| `cover`  | tidak | Gambar sampul, mis. `assets/img/cover.jpg`. Kosongkan. |

## Format yang disarankan

- **`.mp3`** atau **`.m4a**` — paling aman di semua browser & HP.
- Ukuran ideal **di bawah 8 MB** per lagu supaya tidak berat di HP.
- Sample rate 44.1 kHz, bitrate 128–192 kbps.

## Kalau nama file-nya berbeda

Cukup samakan. Contoh kalau filenya ` soundtrack.mp3`:

```json
"daftar_lagu": [
  { "src": "assets/audio/soundtrack.mp3", "judul": "Lagu Kita", "artis": "Aku", "cover": "" }
]
```

Atau pakai URL langsung (tidak perlu menaruh file di sini):

```json
"daftar_lagu": [
  { "src": "https://contoh.com/lagu.mp3", "judul": "Lagu Online", "artis": "Aku", "cover": "" }
]
```

> **Catatan:** kalau halamannya dibuka langsung (klik ganda `index.html`),
> browser tidak mengizinkan pemutaran file audio lokal dari `file://`.
> Jalankan lewat `MULAI.cmd` supaya semuanya berjalan normal.
