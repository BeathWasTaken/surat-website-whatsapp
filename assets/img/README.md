# 🖼️ TARUH GAMBAR DI FOLDER INI

Folder ini untuk foto, avatar, dan wallpaper. Semuanya opsional.

## Daftar cepat

| Kebutuhan      | Contoh isi              | Dipakai lewat                            |
| --------------- | ----------------------- | ---------------------------------------- |
| Foto berdua     | `kita1.jpg`, `kita2.jpg` | `config.json` → `foto_bareng`          |
| Avatar pengirim | `avatar.jpg`            | `config.json` → `avatar_src`            |
| Wallpaper       | `kita.jpg`              | `config.json` → `wallpaper_src`         |
| Sampul lagu     | `cover-lagu1.jpg`       | `config.json` → `daftar_lagu` → `cover` |

## Contoh

```json
"avatar_src": "assets/img/avatar.jpg",
"wallpaper_src": "assets/img/kita.jpg",
"foto_bareng": [
  { "src": "assets/img/kita1.jpg", "caption": "Yang pertama, dan paling aku suka." }
],
"daftar_lagu": [
  { "src": "assets/audio/lagu1.mp3", "judul": "Lagu untuk kamu", "artis": "Aku", "cover": "assets/img/cover-lagu1.jpg" }
]
```

## Saran ukuran

| Jenis     | Ukuran ideal  | Tips                                  |
| --------- | ------------- | ------------------------------------- |
| Foto      | 1200 × 1600   | Potret 4:3, di bawah 500 KB          |
| Avatar    | 400 × 400     | Petak, di bawah 150 KB             |
| Wallpaper | 1080 × 1920   | Di bawah 800 KB                      |
| Sampul    | 600 × 600     | Petak, di bawah 200 KB               |

Kalau `avatar_src` dan `wallpaper_src` dikosongkan, halaman tetap jalan —
avatar akan memakai huruf awal nama pengirim.

Boleh juga pakai URL langsung, misalnya:

```json
"foto_bareng": [
  { "src": "https://picsum.photos/seed/kita01/700/900", "caption": "Sore itu." }
]
```
