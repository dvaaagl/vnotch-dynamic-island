# Product Requirements Document (PRD) — VNotch Dynamic Island for Windows

## 1. Ringkasan Produk (Product Overview)
**VNotch Dynamic Island** adalah aplikasi desktop berbasis **Electron + React + TypeScript** untuk sistem operasi Windows yang menghadirkan pengalaman interaktif ala *Dynamic Island* iPhone tepat di **bagian tengah atas layar (Top-Center Screen)**. Aplikasi ini berfungsi sebagai pusat kendali mikro (*micro-control center*) yang menggabungkan kontrol media universal (Spotify, YouTube, Browser), pemantau sistem (CPU, RAM, Baterai), utilitas waktu/cuaca, serta keranjang file sementara (*File Dropzone/Shelf*) dengan animasi *spring physics* yang halus.

---

## 2. Tujuan & Sasaran (Goals & Objectives)
1. **Estetika & Animasi Cair (Fluid Morphing):** Memberikan transisi ukuran kapsul (*pill*) yang mulus menggunakan *spring physics* tanpa *frame drop* (60+ FPS).
2. **Non-Intrusif di Windows:** Mengambang (*Always on Top*) di tengah atas layar tanpa menghalangi klik kursor pada aplikasi di belakangnya di luar area *pill* aktif (*Smart Click-Through*).
3. **Integrasi Media Universal:** Mendeteksi dan mengontrol media dari aplikasi apa pun di Windows (Spotify Desktop, YouTube di Chrome/Edge/Brave/Firefox, Apple Music, VLC, dll.).
4. **Produktivitas Cepat:** Menyediakan *File Tray/Shelf* untuk *drag-and-drop* file sementara, *Timer/Stopwatch*, dan indikator kesehatan sistem secara *real-time*.

---

## 3. Spesifikasi Fitur Utama (Core Features)

### 3.1. Universal Media Controller (Spotify, YouTube, Browser, dll.)
* **Deteksi Otomatis via Windows SMTC:** Membaca sesi media aktif dari *Windows System Media Transport Controls* (SMTC).
* **Compact Media Mode:**
  * Menampilkan *Mini Album Art / Thumbnail* di sisi kiri *pill*.
  * Menampilkan *Animated Audio Waveform Visualizer* di sisi kanan *pill* yang bergerak mengikuti status *playing*.
* **Expanded Media Mode:**
  * Menampilkan judul lagu/video, nama artis/channel, dan *source badge* (ikon Spotify, YouTube, Chrome, dll.).
  * Progress bar durasi media (jika didukung oleh sesi sumber).
  * Tombol kontrol penuh: *Previous*, *Play/Pause*, *Next*.
  * Efek latar belakang *blurred ambient glow* yang menyesuaikan warna dominan dari *thumbnail/album art*.

### 3.2. System & Hardware Monitor + HUD Alerts
* **Monitoring Real-time:**
  * Persentase penggunaan **CPU** dan **RAM**.
  * Status **Baterai** (persentase & status *charging* / *discharging*).
  * Informasi jaringan singkat (status koneksi / kecepatan unggah-unduh).
* **Auto-Trigger HUD (Toast/Alert):**
  * Saat charger dicolokkan atau dilepas, VNotch otomatis melebar sejenak menampilkan animasi status pengisian daya (mirip indikator baterai iPhone).
  * Peringatan jika baterai lemah (< 20%) atau penggunaan RAM/CPU sangat tinggi.

### 3.3. Jam, Timer/Stopwatch, & Cuaca (Productivity Hub)
* **Idle Clock & Weather:** Menampilkan jam digital ringkas dan suhu cuaca lokal saat tidak ada aktivitas media.
* **Live Activity Timer / Stopwatch:**
  * Pengguna dapat menyalakan *Countdown Timer* atau *Stopwatch* dari mode *Expanded*.
  * Saat kembali ke mode *Compact*, *timer* tetap tampil berjalan (*Live Activity*) di dalam *pill* (bahkan bisa berdampingan dengan ikon media).
  * Notifikasi visual & suara saat waktu habis.

### 3.4. File Tray / Dropzone (Temporary File Shelf)
* **Auto-Expand on Drag:** Saat pengguna men-drag satu atau beberapa file menuju area atas tengah layar, VNotch otomatis membuka ruang *Dropzone*.
* **Penyimpanan Sementara (Shelf):**
  * Menyimpan referensi path file beserta ikon/preview dan nama file.
  * Pengguna dapat mengambil kembali (*drag out*) file tersebut ke aplikasi lain (misal dari File Explorer disimpan ke VNotch, lalu buka WhatsApp/Browser dan drag keluar dari VNotch).
  * Tombol *Clear All* atau hapus per item.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Spesifikasi |
| :--- | :--- |
| **Bahasa & Tech Stack** | **TypeScript** (Strict Mode), Electron (Low-Memory Tuned), React 18+, Vite, Tailwind CSS |
| **Performa UI** | Animasi 60 FPS menggunakan akselerasi CSS Compositor (`transform`, `opacity`) tanpa WebGL buffer berat |
| **Target Penggunaan RAM** | **Ultra-Ringan (< 50–70 MB Working Set saat Idle)**: Pembatasan V8 Heap (`max-old-space-size=64`), *Unmount-on-Collapse* untuk widget yang tidak tampil, dan *Zero Process Spawning* saat polling |
| **Penggunaan CPU** | **< 0.5% saat Idle**: *Adaptive Polling* (polling sistem melambat/pause otomatis saat mode *Compact*) |
| **Kompatibilitas OS** | Windows 10 & Windows 11 (mendukung pengaturan DPI / Scaling layar 100% - 200%) |
| **Keamanan Electron** | `contextIsolation: true`, `nodeIntegration: false`, `spellcheck: false`, komunikasi murni via Preload IPC |

---

## 5. Batasan & Cakupan Tahap Awal (MVP Scope)
* Fokus pada layar utama (*Primary Display*) dengan opsi berpindah monitor di pengaturan lanjutan.
* Kontrol media mengandalkan sesi media Windows (SMTC) dan/atau *fallback* pembacaan title window untuk aplikasi media populer.
* Tidak memodifikasi file sistem Windows (berjalan murni sebagai *user-level overlay window*).
