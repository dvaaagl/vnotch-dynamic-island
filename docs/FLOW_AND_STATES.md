# Alur Interaksi & State Machine (Flow & States) — VNotch Dynamic Island

Dokumen ini memetakan **State Machine**, **Alur Interaksi Pengguna (User Flow)**, **Spesifikasi Dimensi & Animasi Spring**, serta **Tahapan Eksekusi Pembangunan (Roadmap)** agar implementasi berjalan terstruktur.

---

## 1. Diagram State Machine Kapsul (Island States)

```mermaid
stateDiagram-v2
    [*] --> Compact : Aplikasi Dimulai (Top-Center Screen)

    Compact --> Peek : Kursor Masuk (Mouse Hover < 300ms)
    Peek --> Compact : Kursor Keluar (Mouse Leave)
    Peek --> Expanded : Klik Kiri / Tahan Hover / Drag File Masuk

    Compact --> Expanded : Drag File Mendekati Area Atas
    Expanded --> Compact : Kursor Keluar Area Kapsul (Auto-Collapse Delay 350ms)

    Compact --> Alert : Event Sistem (Charger Masuk/Lepas, Timer Habis, Lagu Ganti)
    Alert --> Compact : Timeout Selesai (2.5 Detik)
    Alert --> Expanded : Pengguna Mengklik Alert
```

---

## 2. Spesifikasi Dimensi & Fisika Animasi (Spring Physics)

Untuk meniru rasa elastis (*fluid spring*) seperti di iOS, setiap perubahan *state* menggunakan `framer-motion` dengan konfigurasi *spring* (`stiffness: 380`, `damping: 28`, `mass: 0.8`):

| State Mode | Lebar (`width`) | Tinggi (`height`) | Border Radius | Konten yang Ditampilkan |
| :--- | :--- | :--- | :--- | :--- |
| **1. Compact (Idle)** | `180px` | `36px` | `20px` | Jam digital di kiri, indikator status baterai/CPU titik hijau di kanan. |
| **2. Compact (Media Active)** | `230px` | `36px` | `20px` | *Mini Album Art* berputar/statis di kiri, judul singkat di tengah, *Audio Waveform* bergerak di kanan. |
| **3. Compact (Media + Timer)** | `270px` | `36px` | `20px` | *Album Art* + *Waveform* di sisi kiri, *Countdown Timer* warna oranye di sisi kanan. |
| **4. Peek (Hovered)** | `310px` | `52px` | `26px` | Preview cepat lagu yang sedang diputar + tombol Play/Pause cepat + indikator tab. |
| **5. Alert / HUD Toast** | `320px` | `58px` | `29px` | Animasi ikon (misal: petir hijau saat *Charging*, lonceng saat *Timer Done*, atau *Track Changed*). |
| **6. Expanded (Full Panel)** | `460px` | `215px` | `34px` | Navigasi 4 Tab (**Media**, **System**, **Timer & Weather**, **File Shelf**) beserta isi widget lengkapnya. |

---

## 3. Alur Kerja Fitur Utama (Feature Flows)

### A. Alur Deteksi Media (Spotify, YouTube, Browser)
```mermaid
sequenceDiagram
    participant App as Spotify / YouTube (Browser)
    participant Win as Windows SMTC API
    participant Main as Electron Main (MediaService.ts)
    participant UI as React Renderer (Zustand + MediaWidget)

    App->>Win: Memutar lagu / video (Update Metadata & PlaybackStatus)
    loop Polling Ringan / Event Listener
        Main->>Win: Baca sesi GlobalSystemMediaTransportControls
        Win-->>Main: Return Title, Artist, AppId, Thumbnail, Status
    end
    Main->>UI: Emit IPC 'vnotch:media-update' (ketika state berubah)
    UI->>UI: Jika lagu baru -> Tampilkan 'Alert' singkat (2 detik) lalu kembali ke 'Compact Media'
    UI->>Main: Klik Play/Pause/Next -> Emit IPC 'vnotch:media-control'
    Main->>Win: Eksekusi TryTogglePlayPauseAsync() / TrySkipNextAsync()
```

### B. Alur File Tray / Dropzone (Drag & Drop Sementara)
```mermaid
sequenceDiagram
    participant User as Pengguna (File Explorer)
    participant UI as VNotch Island (FileShelfWidget)
    participant Main as Electron Main (FileShelfService.ts)
    participant Target as Aplikasi Tujuan (WhatsApp / Browser / Folder)

    User->>UI: Drag file ke arah Top-Center layar (`onDragEnter`)
    UI->>UI: Otomatis berubah ke state 'Expanded' -> Buka tab 'File Shelf'
    User->>UI: Lepas file (`onDrop`)
    UI->>UI: Simpan path, nama, ukuran file ke dalam daftar Shelf
    User->>UI: Buka aplikasi tujuan, lalu drag item keluar dari VNotch (`onDragStart`)
    UI->>Main: Panggil IPC 'vnotch:shelf-start-drag' (kirim filePath)
    Main->>Target: Native OS Drag (`webContents.startDrag`) menempel ke aplikasi tujuan
```

---

## 4. Roadmap Implementasi (Step-by-Step Execution Plan)

1. **Tahap 1 — Inisialisasi Proyek TypeScript & Konfigurasi Electron + Vite:**
   * Setup `package.json`, `tsconfig.json`, `vite.config.ts`, dan Tailwind CSS.
   * Membuat struktur folder `electron/`, `src/shared/`, `src/store/`, dan `src/components/`.
2. **Tahap 2 — Pembuatan Window Overlay & Smart Click-Through:**
   * Implementasi `electron/main.ts` untuk meletakkan window tepat di tengah atas layar utama (`Top-Center`), `alwaysOnTop` level `'screen-saver'`, transparan, dan mekanisme `setIgnoreMouseEvents`.
3. **Tahap 3 — Backend Services (TypeScript Main Process):**
   * `MediaService.ts`: Pembacaan sesi media Windows SMTC (Spotify, Chrome/YouTube, Edge, dll.) + kontrol *Play/Pause/Next/Prev*.
   * `SystemService.ts`: Perhitungan real-time penggunaan CPU, RAM, serta pembacaan status baterai & event colok/lepas charger (`powerMonitor`).
   * `FileShelfService.ts`: Handler native drag-and-drop keluar untuk File Tray.
4. **Tahap 4 — Frontend Core & Animasi Spring (`DynamicIsland.tsx`):**
   * State management dengan Zustand (`useIslandStore.ts`).
   * Implementasi cangkang kapsul dengan Framer Motion (`Compact`, `Peek`, `Alert`, `Expanded`) + *Audio Waveform Visualizer*.
5. **Tahap 5 — Implementasi 4 Widget Utama:**
   * `MediaWidget.tsx` (Spotify/YouTube controller + ambient glow).
   * `SystemWidget.tsx` (CPU/RAM/Battery gauges & quick stats).
   * `TimerWeatherWidget.tsx` (Live countdown timer, stopwatch, & cuaca).
   * `FileShelfWidget.tsx` (Dropzone keranjang file sementara).
6. **Tahap 6 — Pengujian & Penyempurnaan UI/UX:**
   * Verifikasi kompilasi TypeScript (`tsc --noEmit`), build, dan uji coba langsung di layar Windows.
