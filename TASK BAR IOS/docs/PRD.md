# Product Requirements Document (PRD) — TASK BAR IOS / macOS Dock for Windows

## 1. Visi & Ringkasan Produk
**TASK BAR IOS (macOS Dock for Windows)** adalah aplikasi *floating dock* modern berbasis **TypeScript + Electron + React + Framer Motion** yang mengubah tampilan dan interaksi taskbar bawah Windows menjadi seperti **macOS Sonoma / iOS Dock**.

Aplikasi ini diletakkan tepat di **bagian tengah bawah layar (Bottom-Center Screen)** dengan efek kaca buram (*Frosted Glassmorphism*), animasi pembesaran ikon melengkung (*Parabolic Gaussian Magnification*) saat kursor melintas, indikator titik aplikasi aktif, serta fitur *Smart Auto-Hide* dan *Click-Through* yang sangat ringan di RAM.

---

## 2. Tujuan Utama (Key Objectives)
1. **Pengalaman Visual & Fisika Setara macOS / iOS:**
   * Menghadirkan efek *Parabolic Magnification* 60 FPS yang mulus ketika kursor digerakkan di sepanjang Dock.
   * Animasi *Bounce* (memantul ke atas) saat ikon aplikasi diklik untuk dibuka.
   * Desain ikon *Squircle* (sudut membulat khas iOS/macOS) dengan *Tooltip Pill* di atas ikon.
2. **Fungsi Taskbar Windows Nyata (Bukan Sekadar Kosmetik):**
   * Mendeteksi aplikasi yang sedang berjalan di Windows (*Running Windows Apps*) dan menampilkan titik aktif (*Active Indicator Dot*) di bawah ikon.
   * Klik ikon aplikasi yang sedang berjalan akan memfokuskan (*Bring to Front*) atau me-*minimize/restore* jendela aplikasi tersebut menggunakan Win32 API.
   * Mendukung penambahan aplikasi baru (*Pin to Dock*) cukup dengan **Drag & Drop** file `.exe`, `.lnk`, atau folder ke dalam Dock.
3. **Ultra-Hemat RAM & Non-Intrusif:**
   * Menggunakan arsitektur *Low-Memory V8* (< 50–70 MB RAM), *Zero Process-Spawning* saat polling jendela aktif, dan *Smart Click-Through* agar area di luar kapsul Dock tembus klik.

---

## 3. Spesifikasi Fitur Utama (Core Features)

### 3.1. Zona Kiri: Pinned Apps & Launcher
* **Default Pinned Apps:** Finder/File Explorer, Launchpad (Menu Cepat Aplikasi), Browser (Chrome/Edge), VS Code, Terminal/PowerShell, Spotify/Media, dan Windows Settings.
* **Custom Drag-and-Drop Pinning:** Pengguna dapat menarik file aplikasi (`.exe` / shortcut `.lnk`) ke dalam Dock untuk menyematkannya secara permanen (tersimpan di `localStorage`).
* **Klik Kanan (Context Menu pada Ikon):** Opsi *Open*, *New Window*, *Pin / Unpin from Dock*, atau *Close Window*.

### 3.2. Zona Tengah: Running Windows Applications (Live Task Switcher)
* Dipisahkan oleh garis vertikal tipis (*Dock Divider*).
* Secara otomatis mendeteksi aplikasi Windows yang memiliki jendela aktif di layar (selain aplikasi yang sudah di-pin).
* Mengklik ikon akan memanggil Win32 `SetForegroundWindow(hwnd)` atau `ShowWindow(hwnd, SW_RESTORE)` untuk menampilkan jendela aplikasi tersebut ke depan.

### 3.3. Zona Kanan: Stacks, Control Center, & Trash (macOS Utility Zone)
Dipisahkan oleh garis vertikal kedua di sisi kanan:
1. **Quick Folders Stack (Downloads & Documents):** Membuka folder *Downloads* atau *Documents* pengguna dengan satu klik.
2. **iOS/macOS Control Center Popover:** Menampilkan ringkasan status baterai, CPU/RAM, jam, dan tombol cepat untuk mengatur **Mode Auto-Hide Dock** serta ukuran ikon.
3. **Trash / Recycle Bin:** Membuka *Windows Recycle Bin* (`shell:RecycleBinFolder`) atau mengosongkan sampah.

### 3.4. Mode Auto-Hide & Dodge (Pintar Menyembunyikan Diri)
* **Always Visible Mode:** Dock selalu tampil mengambang di bawah layar.
* **Auto-Hide Mode:** Dock turun bersembunyi ke tepi bawah layar dan menyisakan sensor garis tipis (`4px`) di dasar layar. Saat kursor menyentuh bagian paling bawah layar, Dock meluncur naik secara elastis (*Spring Slide-Up*).

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Parameter | Target Spesifikasi |
| :--- | :--- |
| **Bahasa Pemrograman** | **TypeScript** (Strict Mode) di seluruh layer (Main, Preload, Renderer) |
| **Konsumsi RAM** | **< 55–70 MB Working Set** (`--max-old-space-size=64`, `webgl: false`, `spellcheck: false`) |
| **Konsumsi CPU Idle** | **< 0.5%** (Zero-spawn persistent Win32 worker & adaptive polling) |
| **Frame Rate Animasi** | **60 FPS** menggunakan `framer-motion` `useMotionValue` & `useSpring` (tanpa re-render React saat mouse bergerak!) |
| **Kompatibilitas** | Windows 10 & Windows 11 (Multi-DPI scaling support) |
