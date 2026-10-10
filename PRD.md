# Product Requirements Document (PRD)
**Project Name:** Simple Personal To-Do (My Daily Focus)
**Target Audience:** Diri Sendiri (Single User)
**Tech Stack:** Next.js, Firebase (Firestore & Auth)
**Status:** Draft

## 1. Latar Belakang & Masalah
Seringkali pada malam hari atau saat memulai hari, pengguna tidak memiliki bayangan kegiatan yang jelas untuk dikerjakan (baik itu urusan pekerjaan kantor maupun pekerjaan rumah seperti mencuci baju). 

Aplikasi to-do list yang ada di pasaran saat ini (seperti Todoist, Notion, dll) cenderung terlalu kompleks (membutuhkan input tanggal, prioritas, tag, sub-task). Kompleksitas ini menimbulkan *friction* (hambatan) sehingga pengguna malas mencatat dan pada akhirnya aplikasi tidak terpakai. Pengguna membutuhkan sebuah wadah penampung (brain dump) yang sangat sederhana untuk merencanakan "Hari Ini" dan "Besok".

## 2. Tujuan (Goals)
Menciptakan aplikasi to-do list berbasis web yang:
1.  **Sangat minim gesekan (Frictionless):** Menambah tugas semudah mengetik lalu menekan 'Enter'.
2.  **Fokus pada Masa Kini:** Hanya membagi waktu menjadi "Hari Ini", "Besok", dan "Kapan-kapan (Brain Dump)".
3.  **Kategorisasi Dasar:** Bisa membedakan antara tugas "Kantor/Kerja" dan "Rumah/Pribadi" dengan satu klik.

## 3. Fitur Utama (Core Features)

### 3.1. Tampilan Tiga Kolom/Bagian Utama
Untuk mengatasi kebingungan "harus ngapain", aplikasi hanya akan menampilkan 3 daftar utama:
*   **Inbox / Kapan-kapan:** Tempat mencatat ide atau tugas acak yang terlintas di pikiran (misal: "benerin keran air", "bikin laporan Q3").
*   **Hari Ini (Today):** Daftar tugas yang *harus* diselesaikan hari ini.
*   **Besok (Tomorrow):** Daftar tugas yang direncanakan untuk esok hari (sangat berguna untuk perencanaan di malam hari).

### 3.2. Quick Add Task
*   Input teks sederhana di bagian atas layar.
*   Default masuk ke "Inbox" atau "Hari Ini".
*   Dua tombol kategori simpel (bisa berupa icon): 🏢 (Kantor) dan 🏠 (Rumah).

### 3.3. Task Management (Simple Action)
*   **Checkbox:** Klik untuk menandai selesai (tugas akan dicoret atau hilang dari daftar utama).
*   **Pindah Hari:** Tombol atau fungsi *drag-and-drop* sederhana untuk memindahkan tugas antara "Inbox", "Hari Ini", dan "Besok".
*   **Hapus:** Tombol *delete* (icon tong sampah) untuk menghapus tugas yang batal/tidak relevan.

### 3.4. Fitur Reset Tengah Malam (Opsional tapi disarankan)
*   Sistem secara otomatis (atau lewat satu tombol manual "Mulai Hari Baru") memindahkan semua tugas di daftar "Besok" menjadi "Hari Ini".
*   Tugas "Hari Ini" yang belum selesai bisa otomatis bertahan, atau dipindah kembali ke "Inbox".

## 4. Arsitektur & Teknologi

*   **Frontend (Next.js):** 
    *   Menggunakan App Router untuk kecepatan dan kemudahan *routing*.
    *   Tailwind CSS untuk styling yang cepat dan bersih.
    *   State management sederhana (React Context atau bawaan React saja cukup karena fiturnya sedikit).
*   **Database (Firebase Firestore):**
    *   Satu *collection* sederhana bernama `tasks`.
    *   Struktur dokumen (JSON):
        ```json
        {
          "id": "123",
          "title": "Antar laundry",
          "category": "home", // 'home' atau 'work'
          "status": "pending", // 'pending' atau 'completed'
          "timeframe": "today", // 'inbox', 'today', atau 'tomorrow'
          "createdAt": "timestamp"
        }
        ```
*   **Autentikasi (Firebase Auth):**
    *   Google Sign-In. Karena ini aplikasi pribadi, Anda bisa membatasi hanya email Anda yang bisa melihat atau memodifikasi database (melalui Firestore Security Rules).

## 5. Out of Scope (Apa yang TIDAK akan Dibuat)
Agar aplikasi tetap sederhana dan dijamin *terpakai*, fitur-fitur berikut **tidak boleh** dimasukkan di versi pertama:
*   Sub-tasks / tugas bercabang.
*   Pemilihan tanggal spesifik (kalender).
*   Jam pengingat / Reminder (Push Notifications).
*   Kolaborasi / Share ke orang lain.
*   Tingkat prioritas (Low, Medium, High).