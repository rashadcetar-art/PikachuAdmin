# PikachuAdmin — Website Admin untuk Vercel + Supabase

Starter dashboard untuk fitur yang tertulis di petunjuk source Android: login admin, daftar perangkat, tambah Device ID, Approve, Reject, Check-in, pencarian, dan hapus perangkat.

## Arsitektur
- Vercel: hosting frontend statis (gratis pada paket Hobby sesuai batas pemakaian dan ketentuan Vercel).
- Supabase: Authentication + PostgreSQL database. Ini layanan terpisah; cek batas gratis dan ketentuan terbaru Supabase.
- APK Android: tetap membuka URL website admin melalui WebView. Setelah deployment berhasil, URL Vercel perlu dimasukkan ke `ADMIN_URL` di `MainActivity.java`, lalu APK dibangun ulang.

## 1. Buat database Supabase
1. Buat project di https://supabase.com/ dan simpan password database dengan aman.
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/schema.sql`.
3. Buka **Authentication → Users → Add user** untuk membuat akun admin dengan email dan password yang kuat.
4. Salin UUID user tersebut. Di SQL Editor jalankan perintah berikut dengan UUID milik akun admin:

```sql
insert into public.admin_users (user_id)
values ('GANTI-DENGAN-UUID-USER-ADMIN');
```

Jangan membuat endpoint pendaftaran publik untuk admin. Hanya pemilik project yang boleh menambahkan UUID admin ke tabel `admin_users`.

## 2. Hubungkan konfigurasi Supabase
Di Supabase buka **Project Settings → API** (atau **API Keys** pada tampilan baru). Salin Project URL dan **publishable/anon key**. Jangan pernah memakai `service_role` key di browser atau APK.

File `config.js` pada paket ini sudah diisi dengan Project URL dan publishable key yang diberikan. File tersebut dimuat sebelum `app.js`. Untuk website statis Vercel, ini adalah konfigurasi publik di sisi browser. Jangan pernah memasukkan `service_role`, `sb_secret_`, password database, atau token rahasia ke file ini. Jika key diputar/diganti, perbarui `config.js` lalu commit ulang.

## 3. Deploy ke Vercel
1. Upload/commit isi folder ini ke root repository GitHub `rashadcetar-art/PikachuAdmin` (jangan masukkan folder Android lama sebagai root website).
2. Di halaman Import Vercel: Project Name `pikachu-admin`, Root Directory `./`, Framework Preset `Other`.
3. Build Command dan Output Directory dikosongkan jika Vercel mendeteksi static files otomatis; jika diminta, gunakan Output Directory `.`.
4. Klik Deploy. Setelah selesai, buka URL `https://....vercel.app`.

## 4. Hubungkan APK Android
Di `PikachuAdminAndroid/app/src/main/java/com/pikachu/admin/MainActivity.java`, ubah:
```java
private static final String ADMIN_URL = "https://GANTI-DENGAN-DOMAIN-ANDA/verification/index.php";
```
menjadi URL deployment Vercel, misalnya:
```java
private static final String ADMIN_URL = "https://pikachu-admin.vercel.app/";
```
Build APK ulang dan pasang versi baru.

## Catatan keamanan & batasan
- Frontend hanya memakai publishable/anon key; RLS wajib aktif. Jangan pernah menaruh `service_role`, password database, atau secret di frontend, GitHub, maupun APK.
- Buat akun admin secara manual; tidak ada pendaftaran admin publik.
- Fitur yang dibuat berdasarkan daftar di `PETUNJUK-ID.txt`. Format Device ID spesifik, integrasi dengan aplikasi perangkat, dan protokol check-in otomatis belum didefinisikan di source yang tersedia. Tombol Check-in di dashboard ini mencatat waktu check-in secara manual.
- Belum ada koneksi otomatis ke sistem verifikasi perangkat eksternal. API/aturan perangkat perlu ditambahkan setelah spesifikasinya tersedia.
