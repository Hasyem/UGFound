# UGFound — Sistem Lost & Found Universitas Gunadarma

> Platform web dinamis terpusat untuk pelaporan dan pencarian barang hilang (*lost*) dan barang temuan (*found*) di lingkungan kampus Universitas Gunadarma (Kampus A, B, C, D, dan E).

![Next.js](https://img.shields.io/badge/Next.js-16%2B-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

---

## 📌 Ringkasan Fitur (PRD P0 Wajib)

Sistem ini dibangun sesuai spesifikasi PRD Sistem Lost & Found Universitas Gunadarma:

1. **F-01 Autentikasi Sivitas Akademika:**
   - Registrasi & Login dengan email resmi Gunadarma (`@student.gunadarma.ac.id` atau `@gunadarma.ac.id`) untuk Mahasiswa dan Dosen.
   - Pendaftaran email pribadi khusus untuk staf kebersihan dan petugas satpam kampus.
   - Verifikasi email via OTP / Magic Link.
   - Kontrol akses: Pengunjung yang belum login dapat melihat feed, namun **wajib login** untuk membuat laporan dan melihat kontak pelapor/penemu.
   - Mode Simulasi 1-Klik: Switcher role langsung di bilah navbar untuk kemudahan evaluasi (*Mahasiswa*, *Satpam*, *Cleaning*, *Admin*).

2. **F-02 Beranda (Real-time Feed):**
   - Dua feed terpisah: **🔍 Ditemukan** (`found`) dan **🔎 Dicari** (`lost`), diurutkan dari yang terbaru.
   - Sinkronisasi real-time (otomatis diperbarui tanpa reload halaman).
   - Filter cepat berdasarkan kategori dan lokasi kampus.
   - Paginasi 20 laporan per halaman dengan tombol "Muat lebih banyak".

3. **F-03 Lapor Barang Ditemukan (Penemu):**
   - Unggah foto wajib (JPG/PNG/WebP, maks. 5 MB).
   - Panduan privasi: menyamarkan/sensor NIK dan NIM pada KTM/dokumen.
   - Lokasi ditemukan hierarkis: Kampus (A–E) ➜ Gedung ➜ Lantai, atau input Luar Kampus.
   - Validasi tanggal/waktu (tidak boleh di masa depan).
   - **Lokasi Barang Diamankan:** Menentukan titik temu/penitipan fisik (misal: *Pos Satpam Utama Margonda*).
   - **Ciri Khusus Tersembunyi (Rahasia):** Hanya bisa dilihat oleh pembuat laporan dan admin untuk verifikasi kepemilikan anti-klaim palsu!

4. **F-04 Lapor Barang Hilang (Pemilik):**
   - Deskripsi detail kehilangan, lokasi terakhir terlihat, foto referensi opsional.
   - Halaman **Laporan Saya** untuk memantau status barang sendiri.

5. **F-05 Pencarian dan Filter Terperinci:**
   - Pencarian kata kunci teks (case-insensitive) pada judul dan deskripsi.
   - Kombinasi filter: Jenis laporan, kategori, kampus, dan rentang tanggal.
   - Tampilan empty state yang ramah pengguna dengan tombol pintas *"Lapor Kehilangan"*.

6. **F-06 Klaim Sederhana & Instruksi Serah Terima:**
   - Menampilkan instruksi pengambilan fisik di pos satpam / titik penitipan.
   - Nomor WhatsApp/kontak penemu terlindungi dan hanya terlihat bagi pengguna yang login.
   - Pengingat verifikasi serah terima (wajib menunjukkan identitas dan menyebutkan ciri khusus rahasia).

7. **F-07 Siklus Hidup & Status Laporan:**
   - Status: `active`, `claim_in_progress`, `resolved`, `stored`, `hidden`.
   - Tombol **"Tandai Selesai"** bagi pembuat laporan / admin saat barang telah diserahterimakan (mencatat `resolved_at` untuk pengukuran KR 2).
   - Opsi membuka kembali (*reopen*) laporan dalam waktu 24 jam jika salah menandai.
   - Scheduled maintenance: Barang temuan aktif > 7 hari dialihkan statusnya menjadi `stored` (diamankan pihak keamanan).

8. **F-08 Laporkan Postingan (Flag/Moderasi Komunitas):**
   - Pengguna dapat melaporkan postingan yang mencurigakan, spam, atau mengandung data pribadi.
   - Pembatasan 1 pengguna hanya dapat melaporkan 1 postingan 1 kali.
   - **Auto-Hide:** Postingan yang dilaporkan oleh 3 pengguna berbeda disembunyikan otomatis oleh sistem sampai ditinjau admin.

9. **F-09 Panel Moderasi & Administrasi:**
   - Akses terbatas khusus peran `admin`.
   - Antrean moderasi postingan yang dilaporkan (Sembunyikan / Pulihkan / Hapus).
   - Manajemen akun pengguna (Nonaktifkan / Aktifkan akun).
   - Audit trail log atas setiap tindakan admin.
   - Dasbor analitik metrik pencapaian (KR 1: Resolution Rate > 85%, KR 2: Rata-rata waktu penyelesaian < 48 jam).

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Server & Client Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Supabase (Skema relasional lengkap dengan RLS, triggers, indexes, dan seed data)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Deployment:** Vercel

---

## 🚀 Panduan Menjalankan Proyek

### 1. Clone & Instal Dependensi
```bash
cd UGfound
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.local.example` ke `.env.local`:
```bash
cp .env.local.example .env.local
```

Isi variabel lingkungan berikut (opsional jika ingin menggunakan live Supabase):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> *Catatan: Aplikasi ini dilengkapi dengan fallback mock service bawaan, sehingga dapat langsung dijalankan dan diuji 100% interaksinya meskipun kredensial Supabase belum diisi.*

### 3. Migrasi Database Supabase (Opsional)
Jalankan skrip SQL di Supabase SQL Editor:
- Buka file `supabase/migrations/01_init_schema.sql`
- Copy dan Run di Supabase SQL Editor untuk membuat tabel, trigger auto-hide, indeks, dan data awal.

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser pada `http://localhost:3000`.

---

## 🌐 Panduan Deployment ke Vercel

1. Push repositori ini ke GitHub / GitLab.
2. Buka [Vercel Dashboard](https://vercel.com) dan klik **"Add New Project"**.
3. Import repositori `UGfound`.
4. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Klik **Deploy**. Vercel akan otomatis melakukan proses build Next.js dan menghasilkan URL produksi siap pakai.

---

## 🏢 Struktur Direktori

```
UGfound/
├── src/
│   ├── app/
│   │   ├── admin/page.tsx             # F-09: Panel Moderasi Admin & Analitik
│   │   ├── api/cron/store-expired/    # Cron API untuk barang temuan > 7 hari
│   │   ├── cari/page.tsx              # F-05: Halaman Pencarian & Filter
│   │   ├── lapor/page.tsx             # F-03 & F-04: Form Lapor Temuan & Hilang
│   │   ├── laporan/[id]/page.tsx      # F-06: Detail Laporan, Klaim, & Rahasia Ciri
│   │   ├── laporan-saya/page.tsx      # F-07: Dasbor Laporan Milik Pengguna
│   │   ├── login/page.tsx             # F-01: Autentikasi Gunadarma & Demo Login
│   │   ├── globals.css                # Style & tema kampus
│   │   ├── layout.tsx                 # Root layout dengan Navbar & Footer
│   │   └── page.tsx                   # F-02: Beranda Feed Real-Time & Live Stats
│   ├── components/
│   │   ├── layout/                    # Navbar & Footer
│   │   └── ui/                        # ReportCard, LocationPicker, PhotoUpload, Modals
│   ├── hooks/
│   │   └── useAuth.ts                 # Hook autentikasi & role switcher
│   ├── lib/
│   │   ├── constants.ts               # Data Kampus UG, Kategori, & Status
│   │   ├── data-service.ts            # Service data terpadu (Supabase + Local Fallback)
│   │   ├── mock-data.ts               # Dataset realistis Kampus Gunadarma
│   │   ├── utils.ts                   # Helper date-fns & formatting
│   │   └── supabase/                  # Supabase SSR client, server, & middleware
│   └── types/
│       └── database.ts                # TypeScript types & database schemas
└── supabase/
    └── migrations/
        └── 01_init_schema.sql         # Skrip SQL DDL, RLS, Trigger, & Seed data
```