# TASK BAR IOS — macOS / iOS Floating Dock for Windows

**TASK BAR IOS** adalah aplikasi *floating dock* modern berbasis **TypeScript + Electron + React + Framer Motion** yang menghadirkan pengalaman taskbar bawah ala **macOS Sonoma / iOS Dock** di Windows dengan animasi *Parabolic Magnification* 60 FPS, deteksi aplikasi Windows yang sedang berjalan, serta arsitektur ultra-hemat RAM.

---

## Dokumentasi Perancangan & Rencana Kerja (PLAN)

1. **[Product Requirements Document (PRD)](./docs/PRD.md)**
   * Visi produk, spesifikasi 3 zona Dock (Pinned Apps, Active Running Windows Task Switcher, dan Stacks/Control Center/Recycle Bin), fitur *Drag & Drop Pinning*, *Smart Auto-Hide*, serta target performa hemat RAM.
2. **[Arsitektur Teknis & Optimasi RAM (ARCHITECTURE)](./docs/ARCHITECTURE.md)**
   * Diagram arsitektur *Main Process vs Preload vs Renderer*, teknik **Magnification 60 FPS Tanpa React Re-render** (`useMotionValue` + `useSpring`), jembatan Win32 (`user32.dll` `SetForegroundWindow` & `ShowWindow`), kontrak *interface* TypeScript (`src/shared/types.ts`), dan struktur direktori.
3. **[Alur Fisika Magnification, State Machine, & PLAN (FLOW & PLAN)](./docs/FLOW_AND_PLAN.md)**
   * Rumus matematika kurva pembesaran ikon, diagram *State Machine*, *sequence diagram* integrasi jendela Windows, serta 6 tahap *Roadmap* eksekusi.

---

## Tech Stack
* **Language:** TypeScript (Strict Mode)
* **Desktop Runtime:** Electron (Bottom-Center Overlay, Smart Click-Through, Low-RAM V8 Tuned)
* **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion + Zustand
