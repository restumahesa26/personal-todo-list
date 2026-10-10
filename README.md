# My Daily Focus (Simple Personal To-Do)

Aplikasi *to-do list* pribadi yang dirancang sesuai PRD: **minim gesekan (frictionless)**, **fokus pada masa kini**, **mobile-responsive**, dan **bisa di-install sebagai aplikasi (PWA)** tanpa tampilan *AI slop*.

---

## ✨ Fitur Utama

1. **Default Light Theme & Dark Mode Toggle:**
   - Tema bawaan adalah **Light Mode** yang bersih, minimalis, dan elegan.
   - Dapat beralih ke **Dark Mode** kapan saja dengan satu klik pada tombol tema di header.

2. **Pengalaman Mobile Responsif yang Intuitif:**
   - **Segmented Tab Control di Layar HP:** Pada perangkat mobile, pengguna dapat berpindah antar kolom secara cepat via tab bar:
     - `Hari Ini (Today)`
     - `Besok (Tomorrow)`
     - `Inbox (Brain Dump)`
     - `Semua (All)`
   - Pada layar laptop/desktop, ketiga kolom tetap tampil berdampingan (*side-by-side*).
   - Tombol pindah hari (`→ Hari Ini`, `→ Besok`, `→ Inbox`), tombol edit, dan tombol hapus dapat langsung disentuh di layar sentuh (*touch-friendly*) tanpa bergantung pada *hover mouse*.

3. **Progressive Web App (PWA) & Installable:**
   - Dapat di-install langsung sebagai aplikasi di Android (Chrome/Edge/Samsung Internet) dan iOS (Safari).
   - Dilengkapi **Service Worker (`sw.js`)** dan **Web App Manifest** lengkap dengan ikon maskable beresolusi tinggi (192px, 512px, Apple Touch Icon).
   - Bekerja secara *offline* saat tidak ada koneksi internet.

4. **Tiga Kolom Fokus Masa Kini:**
   - **Hari Ini (Today):** Daftar tugas utama yang harus diselesaikan hari ini.
   - **Besok (Tomorrow):** Rencana untuk esok hari (sangat praktis untuk perencanaan di malam hari).
   - **Inbox / Kapan-kapan:** Tempat mencatat ide atau tugas acak (*brain dump*) tanpa perlu dijadwalkan sekarang.

5. **Quick Add (Minim Gesekan):**
   - Cukup ketik tugas lalu tekan <kbd>Enter</kbd>.
   - Pilihan kategori instan: 🏢 **Kantor / Kerja** dan 🏠 **Rumah / Pribadi**.
   - Input tetap aktif untuk penulisan tugas berturut-turut tanpa jeda.

6. **Fitur "Mulai Hari Baru" (Start New Day / Midnight Reset - PRD 3.4):**
   - Tombol khusus di header untuk menyegarkan fokus:
     - Otomatis memindahkan semua tugas di daftar **Besok** menjadi **Hari Ini**.
     - Pilihan fleksibel untuk sisa tugas Hari Ini yang belum selesai: tetap dipertahankan atau dipindahkan kembali ke **Inbox**.

7. **Penyimpanan Ganda (Hybrid Offline-First + Firebase Firestore & Auth):**
   - **Mode Lokal (Offline):** Berjalan langsung di browser menggunakan `localStorage`. Tidak butuh setup atau internet.
   - **Firebase Terintegrasi:** Cukup isi `.env.local` untuk mengaktifkan sinkronisasi real-time Firestore dan Google Sign-In.

---

## 📱 Cara Install Sebagai Aplikasi di HP

### Di Android (Chrome / Brave / Edge):
1. Buka website di browser Chrome HP.
2. Banner otomatis **"Pasang Daily Focus"** akan muncul di bagian bawah layar.
3. Ketuk **Pasang** (atau via menu titik tiga `⋮` > **Instal Aplikasi** / **Tambahkan ke Layar Utama**).
4. Aplikasi akan terpasang di *app drawer* seperti aplikasi native.

### Di iPhone / iPad (Safari):
1. Buka website di Safari.
2. Ketuk tombol **Bagikan (Share)** (ikon kotak dengan panah ke atas di bagian bawah).
3. Gulir ke bawah lalu pilih **Tambah ke Layar Utama (Add to Home Screen)**.
4. Ketuk **Tambah**. Aplikasi akan muncul di *Home Screen* dan terbuka tanpa bilah alamat browser (*standalone*).

---

## 🚀 Cara Menjalankan

Jalankan perintah berikut di terminal:

```bash
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000).
