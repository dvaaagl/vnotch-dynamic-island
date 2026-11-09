# Alur Interaksi, Fisika Magnification, & Rencana Eksekusi (PLAN) — TASK BAR IOS

Dokumen ini merinci **Rumus Fisika Magnification Dock**, **State Machine**, **Alur Kerja Integrasi Windows**, serta **Tahapan Pembangunan (Implementation Plan)**.

---

## 1. Rumus Fisika Parabolic Magnification (macOS Dock Curve)

Saat kursor bergerak secara horizontal pada koordinat $x_{\text{mouse}}$, setiap ikon ke-$i$ memiliki titik pusat horizontal $x_i$.
Jarak antara kursor dan titik pusat ikon adalah:

$$d_i = x_{\text{mouse}} - x_i$$

Dalam jangkauan radius pengaruh $R = 140\text{ px}$:
* Jika $|d_i| \ge R$, maka ukuran ikon tetap pada ukuran dasar $S_{\text{base}} = 48\text{ px}$.
* Jika $|d_i| < R$, ukuran ikon diinterpolasi dari domain $[-140, 0, 140]$ ke rentang $[S_{\text{base}}, S_{\text{max}}, S_{\text{base}}]$ (di mana $S_{\text{max}} = 76\text{ px}$) dan diteruskan ke pegas *Spring* (`mass: 0.1`, `stiffness: 170`, `damping: 12`).

---

## 2. State Machine TASK BAR IOS

```mermaid
stateDiagram-v2
    [*] --> DockIdle : Aplikasi Dimulai (Bottom-Center)

    DockIdle --> DockMagnifying : Kursor Masuk ke Area Dock (mouseX aktif)
    DockMagnifying --> DockIdle : Kursor Keluar Area Dock (mouseX = Infinity)

    DockMagnifying --> PopoverOpen : Klik Launchpad / Control Center / Context Menu
    PopoverOpen --> DockIdle : Klik di Luar / Pilih Aplikasi

    DockIdle --> AutoHidden : Mode Auto-Hide Aktif & Kursor Keluar > 600ms
    AutoHidden --> DockIdle : Kursor Menyentuh Garis Sensor Bawah Layar (4px)
```

---

## 3. Alur Kerja (Sequence Diagrams)

### A. Alur Deteksi & Fokus Jendela Aplikasi Windows
```mermaid
sequenceDiagram
    participant Win as Windows OS (user32.dll)
    participant Svc as Win32TaskbarService.ts
    participant UI as React Dock (MacDock.tsx)

    loop Polling Ringan (Persistent Worker)
        Svc->>Win: Ambil daftar proses dengan MainWindowHandle != 0
        Win-->>Svc: Return PID, ProcessName, WindowTitle, HWND
    end
    Svc->>UI: Emit IPC 'dock:running-apps' (hanya saat daftar berubah)
    UI->>UI: Tampilkan titik menyala (Active Dot) di bawah ikon yang cocok
    UI->>Svc: Klik ikon aktif -> Emit IPC 'dock:focus-window' (PID, HWND)
    Svc->>Win: Jika minimized -> ShowWindow(HWND, SW_RESTORE) + SetForegroundWindow(HWND)
```

### B. Alur Pin Aplikasi Baru (Drag & Drop ke Dock)
```mermaid
sequenceDiagram
    participant User as Pengguna (Desktop / Explorer)
    participant UI as MacDock.tsx
    participant Store as useDockStore (localStorage)

    User->>UI: Drag file .exe / shortcut / folder ke dalam kapsul Dock (`onDrop`)
    UI->>UI: Ekstrak nama file & path lengkap (`file.path`)
    UI->>Store: Tambahkan item baru ke daftar `pinnedApps`
    Store->>Store: Simpan otomatis ke `localStorage` agar permanen
```

---

## 4. Rencana Tahapan Eksekusi (Step-by-Step Build Plan)

1. **Tahap 1 — Setup Proyek TypeScript di Folder `TASK BAR IOS`:**
   * Konfigurasi `package.json`, `tsconfig.json`, `tsconfig.electron.json`, `vite.config.ts`, dan Tailwind CSS.
2. **Tahap 2 — Pembuatan Window Bottom-Center & Smart Click-Through (`electron/main.ts`):**
   * Meletakkan window transparan tepat di tengah bawah layar utama (`Bottom-Center`), `alwaysOnTop` level `'screen-saver'`, dengan optimasi hemat RAM (`--max-old-space-size=64`).
3. **Tahap 3 — Layanan Integrasi Windows (`Win32TaskbarService.ts` & `AppLauncherService.ts`):**
   * Pembuatan *persistent worker* untuk membaca daftar aplikasi Windows yang sedang berjalan, memfokuskan/minimize jendela (`SetForegroundWindow` / `ShowWindow`), serta meluncurkan aplikasi/folder/Recycle Bin.
4. **Tahap 4 — Implementasi Komponen Inti macOS Dock (`MacDock.tsx` & `DockItem.tsx`):**
   * Pembuatan kontainer *Frosted Glassmorphism*, garis pemisah (*Divider*), fisika *Parabolic Magnification* 60 FPS, animasi *Bounce* saat klik, dan *Tooltip* melayang.
5. **Tahap 5 — Implementasi Popover (`LaunchpadModal.tsx`, `ControlCenter.tsx`, & Context Menu):**
   * Menu *Launchpad* bergaya iOS/macOS, *Control Center* (pengaturan *Auto-Hide*, ukuran Dock, monitor CPU/RAM/Baterai), dan dukungan *Drag-and-Drop Pinning*.
6. **Tahap 6 — Kompilasi, Pengujian, & Packaging `.exe`:**
   * Verifikasi kompilasi TypeScript dan pembungkusan menjadi file *standalone executable* (`iOSTaskbarDock.exe`).
