# VNotch Dynamic Island for Windows

**VNotch Dynamic Island** adalah aplikasi desktop interaktif berbasis **TypeScript + Electron + React + Framer Motion** yang menghadirkan pengalaman *Dynamic Island* ala iPhone tepat di **bagian tengah atas layar (Top-Center Screen)** Windows.

---

## Dokumentasi Perancangan & Alur Sistem

Sebelum dan selama pengembangan, seluruh spesifikasi mengacu pada dokumen berikut:

1. **[Product Requirements Document (PRD)](./docs/PRD.md)**
   * Visi produk, daftar fitur utama (Universal Media Controller untuk Spotify/YouTube/Browser, System & Battery HUD, Live Timer & Weather, serta Temporary File Dropzone/Shelf), dan kebutuhan non-fungsional.
2. **[Arsitektur Teknis & Kontrak TypeScript (ARCHITECTURE)](./docs/ARCHITECTURE.md)**
   * Diagram arsitektur *Main Process vs Preload vs Renderer*, mekanisme **Smart Click-Through** (`setIgnoreMouseEvents`), kontrak interface TypeScript (`src/shared/types.ts`), daftar channel IPC, dan struktur folder proyek.
3. **[Alur Interaksi & State Machine (FLOW & STATES)](./docs/FLOW_AND_STATES.md)**
   * Diagram *State Machine* kapsul (`Compact`, `Peek`, `Alert`, `Expanded`), tabel dimensi & fisika pegas (*Spring Physics*), *sequence diagram* deteksi media SMTC & drag-drop file, serta *Roadmap* tahapan implementasi.

---

## Tech Stack Utama
* **Language:** TypeScript (Strict Mode)
* **Desktop Runtime:** Electron (Frameless, Transparent, Always-on-Top, Smart Click-Through)
* **Frontend Framework:** React 18 + Vite
* **Animation Engine:** Framer Motion (Spring Physics Morphing)
* **State Management:** Zustand
* **Styling & Icons:** Tailwind CSS + Lucide React

---

## Cara Menjalankan (Setelah Setup Tahap 1)

```bash
# Install dependencies
npm install

# Jalankan dalam mode development (Vite + Electron)
npm run dev

# Build aplikasi untuk produksi
npm run build
```
