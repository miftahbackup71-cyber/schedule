# Product Requirements Document (PRD): Kudil Schedule

- **Versi:** 1.1 (MVP — Mobile-First)
- **Status:** Ready for Development
- **Tech Stack:** Svelte 5 (Runes API) + SvelteKit + Tailwind CSS v4 + Supabase
- **Tema Visual:** Fun Neobrutalism (Aksen Utama: Biru Dongker / Navy Blue)
- **Fokus Perangkat:** Mobile-First (dioptimalkan untuk layar HP, responsif hingga tablet & desktop)

---

## 1. Ringkasan Eksekutif & Tujuan Produk

**Kudil Schedule** adalah aplikasi pencatat jadwal harian berbasis urutan timeline vertikal yang ringan, cepat, dan mudah dipakai.

Berbeda dari aplikasi kalender konvensional yang terasa penuh dan kaku dengan banyak kotak jam, Kudil Schedule menyusun kegiatan secara berurutan dari atas ke bawah. Pengguna cukup menambah kegiatan satu per satu, lalu mengatur urutannya secara fleksibel kapan saja—baik digeser manual (naik/turun) maupun diurutkan otomatis berdasarkan jam mulai.

### Tujuan Utama
1. **Cepat & Ringan:** Terbuka instan tanpa library kalender yang berat, dengan pembaruan tampilan langsung (*optimistic UI*, respons < 50ms).
2. **Fleksibel:** Urutan jadwal tidak kaku—pengguna bebas menukar urutan kegiatan sesuai kebutuhan atau merapikannya otomatis berdasarkan jam.
3. **Ramah & Mudah Dipahami:** Tampilan Fun Neobrutalism yang bersih, tegas, dan tidak membingungkan, dengan bahasa sehari-hari yang langsung dimengerti siapa saja.
4. **Nyaman di HP (Mobile-First):** Dirancang sejak awal agar mudah digunakan dengan satu tangan di layar ponsel.

---

## 2. Prinsip Wajib Produk & UX (Aturan Desain)

Seluruh antarmuka dan fitur **wajib** mengikuti 3 aturan utama berikut:

### 2.1 Copywriting Bahasa Indonesia Sederhana & Sehari-hari
- Gunakan bahasa Indonesia yang umum, santai, singkat, dan langsung dimengerti orang awam dalam percakapan sehari-hari.
- **Dilarang** menampilkan istilah teknis, bahasa Inggris yang tidak perlu, atau kata yang jarang dipakai pada teks tampilan pengguna (UI).
- Pesan error, konfirmasi, dan label form harus jelas dan solutif (misalnya: *"Gagal menyimpan jadwal. Coba lagi ya."* bukan *"Error 500: Failed to insert record"*).

| Hindari di UI | Gunakan di UI |
| --- | --- |
| `Pipeline`, `Pipeline Mode`, `Node` | `Urutan`, `Jadwal`, atau cukup tampilkan angka `1, 2, 3` |
| `+ Tambah Schedule` | `+ Tambah Jadwal` |
| `Helper Text` | `Pengingat` |
| `Urungkan` / `Undo` | `Batalkan` |
| `Reset Semua` | `Hapus Semua` |
| `Muat Contoh` / `Load Sample` | `Isi Contoh` |
| `Empty State` / `No Data` | `Belum ada jadwal hari ini` |

### 2.2 Tampilan Bersih — Tanpa Badge & Ikon yang Tidak Perlu
- **Dilarang** menambahkan badge, stiker, pill, tag, atau ikon di tempat yang tidak dibutuhkan hanya untuk hiasan, karena membuat layar penuh informasi (*too much information*) dan mengganggu fokus.
- Setiap ikon atau label visual **wajib punya fungsi jelas**: membantu memindai informasi penting dengan cepat atau menandai tombol aksi.
- **Contoh yang dilarang:**
  - Stiker versi atau mode di header (seperti `v1.0 • Pipeline Mode`).
  - Ikon dekoratif di setiap label input form atau di samping setiap baris teks.
  - Banyak pill/badge status menumpuk dalam satu kartu jadwal.
- **Contoh yang diperbolehkan (fungsional):**
  - Nomor urut di sisi kiri timeline (berubah jadi centang saat selesai).
  - Penanda jam mulai pada kartu jadwal agar mudah dipindai sekilas.
  - Ikon standar pada tombol aksi ringkas (centang, panah naik/turun, edit, hapus) yang jelas maknanya.

### 2.3 Mobile-First & Responsif di Semua Ukuran Layar
- **Mobile adalah fokus utama (`360px`–`430px`)**, lalu tampilan menyesuaikan secara proporsional untuk tablet (`640px+`) dan desktop (`1024px+`).
- **Tanpa scroll horizontal** di ukuran layar mana pun (`320px` hingga `1440px+`).
- **Ramah sentuhan (Thumb-Friendly):** Semua tombol dan area klik memiliki ukuran target sentuh minimal `44px × 44px` dengan jarak aman antar tombol agar tidak salah pencet.
- **Layout adaptif per ukuran layar:**
  - **Mobile (`< 640px`):**
    - Layout 1 kolom penuh dengan padding nyaman (`16px`).
    - Header dibuat sangat ringkas (maksimal judul/identitas + 1 info progres singkat); hindari menjejalkan banyak tombol di satu baris header.
    - Tombol utama `+ Tambah Jadwal` selalu mudah dijangkau oleh jempol (misalnya tombol tetap/melayang di bagian bawah layar saat daftar jadwal sudah terisi).
    - Modal Tambah/Edit tampil seperti *bottom sheet* (muncul dari bawah) dengan area form yang bisa di-scroll saat keyboard HP muncul, serta tombol `Simpan` yang selalu terlihat.
    - Ukuran font input minimal `16px` untuk mencegah *auto-zoom* otomatis di browser mobile (khususnya iOS Safari).
    - Ketebalan border (`2px`) dan hard shadow (`3px–4px`) dibuat proporsional agar tidak memakan ruang layar sempit.
  - **Tablet (`640px`–`1023px`) & Desktop (`>= 1024px`):**
    - Kontainer timeline terpusat dengan lebar maksimal ideal (`max-w-2xl` / ~672px) agar tetap nyaman dibaca tanpa baris teks yang terlalu panjang.
    - Tombol utama `+ Tambah Jadwal` dapat ditampilkan di header maupun di bagian bawah daftar.
    - Modal Tambah/Edit tampil terpusat di tengah layar dengan border `3px` dan hard shadow `5px`.

---

## 3. Arsitektur & Tech Stack

| Lapisan | Teknologi | Alasan Pemilihan |
| --- | --- | --- |
| Frontend Framework | Svelte 5 (Latest) | Kompilasi tanpa Virtual DOM, bundle sangat ringan, dan reaktivitas presisi dengan Runes (`$state`, `$derived`, `$effect`). |
| Meta-Framework | SvelteKit | Routing ringan, dukungan SSR/CSR, dan manajemen environment/API yang rapi. |
| Styling | Tailwind CSS v4 | Cepat untuk menyusun layout mobile-first responsif, thick borders, dan hard shadows konsisten. |
| Backend & Database | Supabase (PostgreSQL) | Database persisten cepat, SDK TypeScript ringan, Row Level Security (RLS), serta dukungan Auth & Realtime opsional. |

### Catatan Sesi Pengguna (MVP)
- Karena tabel `schedules` menggunakan RLS berbasis `auth.uid()`, MVP mendukung autentikasi sederhana melalui Supabase Auth (misalnya *Anonymous Sign-In* agar pengguna bisa langsung mencatat jadwal tanpa hambatan pendaftaran, atau login email sederhana saat dibutuhkan).
- Pembaruan antarmuka dilakukan secara *optimistic* (langsung tampil di layar), dan jika permintaan ke server gagal, perubahan dikembalikan (*rollback*) disertai pesan singkat: *"Gagal menyimpan perubahan. Periksa koneksi internetmu."*

---

## 4. Sistem Desain (Fun Neobrutalism)

### 4.1 Palet Warna
- **Aksen Utama (Biru Dongker / Navy Blue):**
  - `Deep Navy` `#162B52`: Tombol utama (`+ Tambah Jadwal`, `Simpan`), penanda nomor urut aktif, penanda jam mulai.
  - `Royal Navy` `#1E3A8A`: Hover/active state, aksen interaksi.
- **Latar & Permukaan:**
  - `Warm Cream` `#FFFDF7`: Latar halaman dengan pola titik (*dot-grid*) sangat halus.
  - `Card Surface` `#FFFFFF`: Permukaan kartu jadwal dan modal.
- **Teks, Garis & Bayangan:**
  - `Deep Ink` `#0F172A`: Warna teks utama, garis tepi tegas (`2px` di mobile / `3px` di desktop), dan *hard offset shadow* tanpa blur (`3px 3px 0px` di mobile, `5px 5px 0px` di desktop).
- **Aksen Pendukung (Dipakai Secukupnya & Fungsional):**
  - `Butter Yellow` `#FDE047`: Kotak sorotan untuk **Pengingat** (hanya muncul jika diisi).
  - `Sky Pop` `#7DD3FC`: Aksen ilustrasi maskot & tombol sekunder tertentu.
  - `Mint Pop` `#86EFAC`: Status kegiatan selesai & batang progres (*progress bar*).
  - `Soft Coral` `#FCA5A5`: Tombol atau konfirmasi aksi hapus.

### 4.2 Tipografi & Mikro-Interaksi
- **Judul, Angka Urut & Jam:** `Space Grotesk` (Bold / ExtraBold).
- **Teks Isi & Form:** `Plus Jakarta Sans` (Regular, Medium, SemiBold).
- **Efek Tekan Tombol (*Tactile Feel*):** Saat ditekan, tombol bergeser sedikit ke kanan-bawah sehingga bayangan memendek seperti tombol fisik. Efek tetap ringan dan tidak menghambat kecepatan tap di HP.

---

## 5. Spesifikasi Fitur Inti (MVP)

### 5.1 Header Ringkas
- Menampilkan nama **Kudil Schedule** dan maskot mini tanpa stiker versi atau badge tambahan.
- Saat daftar jadwal **sudah terisi**, tampilkan informasi ringkas progres (contoh teks sederhana: `2 dari 5 selesai`) beserta *progress bar* tipis di bawahnya.
- Aksi utilitas secukupnya:
  - Di desktop: tombol `+ Tambah Jadwal` dan `Hapus Semua` (hanya muncul jika ada jadwal).
  - Di mobile: header dijaga tetap lega—aksi tambahan yang jarang dipakai (seperti `Urutkan Jam` dan `Hapus Semua`) diletakkan rapi di toolbar kecil di atas daftar jadwal, sementara `+ Tambah Jadwal` berada di posisi mudah dijangkau jempol.

### 5.2 Tampilan Kosong (*Empty State*) yang Ramah
- Ditampilkan otomatis saat belum ada jadwal (`0` kegiatan).
- Menampilkan ilustrasi maskot Kudil yang ramah dan sederhana.
- Copywriting singkat & natural:
  - Judul: **"Belum ada jadwal hari ini"**
  - Deskripsi: **"Yuk, tambah kegiatan pertamamu biar harimu lebih teratur."**
- Tombol aksi:
  - Utama: `+ Tambah Jadwal`
  - Sekunder: `Isi Contoh` (untuk langsung melihat contoh susunan jadwal).

### 5.3 Modal Tambah & Ubah Jadwal
Muncul saat pengguna menekan `+ Tambah Jadwal` atau tombol `Ubah` pada kartu. Di mobile tampil sebagai *bottom sheet* yang nyaman diakses dengan ibu jari; di desktop tampil sebagai dialog di tengah layar.

| Label di UI | Nama Field DB | Tipe Input | Wajib? | Keterangan & Perilaku |
| --- | --- | --- | --- | --- |
| **Nama Kegiatan** | `title` | Text Input | Ya | Judul kegiatan (maks. 120 karakter). Contoh placeholder: *"Rapat tim pagi"* |
| **Jam Mulai** | `start_time` | Time Picker (`HH:mm`) | Ya | Waktu mulai kegiatan. Boleh sertakan beberapa pilihan jam cepat (mis. `08:00`, `10:00`, `13:00`, `16:00`) yang rapi dan tidak memenuhi layar. |
| **Keterangan** | `description` | Textarea | Tidak | Rincian singkat atau lokasi kegiatan. Placeholder: *"Lokasi atau detail singkat (opsional)"* |
| **Pengingat** | `helper_text` | Text Input | Tidak | Catatan kecil yang penting diingat (mis. *"Bawa charger & catatan"*). Jika diisi, tampil sebagai kotak sorotan kuning di kartu jadwal. |

- Validasi langsung dengan bahasa jelas jika kolom wajib kosong:
  - *"Nama kegiatan belum diisi."*
  - *"Pilih jam mulai dulu ya."*
- Tombol modal: `Batal` dan `Simpan` (atau `Simpan Perubahan` saat mode ubah).

### 5.4 Daftar Jadwal Berurutan (Timeline Vertikal)
- **Aturan Urutan Penambahan:**
  - Kegiatan pertama langsung berada di urutan `#1` (paling atas).
  - Setiap kegiatan baru otomatis masuk di urutan paling bawah (`#2`, `#3`, dst.) dengan animasi muncul yang halus.
- **Struktur Visual Setiap Kartu (Bersih & Mudah Dipindai):**
  - **Sisi Kiri (Garis Urutan):** Garis vertikal penghubung dengan lingkaran/kotak nomor urut (`1`, `2`, `3`, ...). Saat kegiatan selesai, berubah menjadi warna `Mint Pop` dengan tanda centang.
  - **Isi Kartu:**
    1. **Jam Mulai** (mis. `08:30`) — jelas dan mudah dibaca sekilas.
    2. **Nama Kegiatan** — teks utama tebal; diberi coretan halus (*line-through*) dan warna agak redup jika sudah selesai.
    3. **Keterangan** — hanya tampil jika diisi (maks. beberapa baris agar kartu tetap ringkas di layar HP).
    4. **Pengingat** — kotak sorotan kuning lembut tanpa ikon berlebihan, hanya tampil jika diisi.
- **Kontrol pada Kartu & Toolbar:**
  - **Tandai Selesai:** Satu ketukan pada tombol centang atau nomor urut untuk menandai selesai/belum selesai, langsung memperbarui progres.
  - **Geser Urutan (Naik / Turun):** Tombol panah atas & bawah untuk memindahkan posisi kegiatan. Tombol otomatis nonaktif pada item paling atas (naik) dan paling bawah (turun).
  - **Ubah & Hapus:**
    - `Ubah`: Membuka modal dengan data kegiatan terisi.
    - `Hapus`: Langsung menghapus kartu dari daftar dan menampilkan notifikasi singkat (*toast*) di bawah layar: **"Jadwal dihapus"** dengan tombol **`Batalkan`** (aktif 5 detik) sebelum penghapusan permanen.
  - **Urutkan Jam:** Satu ketukan di toolbar atas daftar untuk menyusun ulang semua kegiatan dari jam paling awal ke paling akhir.
  - **Hapus Semua:** Menampilkan dialog konfirmasi singkat (*"Hapus semua jadwal hari ini?"* dengan pilihan `Batal` / `Ya, Hapus`) agar tidak terhapus tidak sengaja di layar sentuh.
  - **Tombol Tambah di Bawah Daftar:** Tombol `+ Tambah Jadwal` di ujung bawah daftar (serta tombol melayang di mobile bila daftar panjang) agar pengguna tidak perlu scroll jauh ke atas.

### 5.5 Loading & Error State
- **Loading Awal:** Tampilkan 2–3 kartu kerangka (*skeleton*) sederhana sesuai bentuk kartu jadwal agar tampilan tidak meloncat.
- **Error Koneksi / Server:** Tampilkan notifikasi singkat dengan bahasa sederhana dan tombol `Coba Lagi` jika perlu.

---

## 6. Skema Database Supabase (PostgreSQL)

```sql
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 120),
  start_time time not null,
  description text default '',
  helper_text text default '',
  position integer not null default 0,
  is_completed boolean not null default false,
  schedule_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index untuk pembacaan jadwal harian yang cepat
create index idx_schedules_user_date_pos
  on public.schedules (user_id, schedule_date, position asc);

-- Trigger untuk memperbarui updated_at otomatis
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_schedules_updated_at
  before update on public.schedules
  for each row
  execute function public.set_updated_at();

-- Aktifkan Row Level Security (RLS)
alter table public.schedules enable row level security;

create policy "Users can manage their own schedules"
  on public.schedules
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Struktur State Svelte 5 (Runes Pattern)

```ts
// src/lib/stores/schedule.svelte.ts
export interface ScheduleItem {
  id: string;
  title: string;
  start_time: string; // "HH:mm"
  description: string;
  helper_text: string;
  position: number;
  is_completed: boolean;
}

export class ScheduleStore {
  items = $state<ScheduleItem[]>([]);
  isLoading = $state(false);
  errorMessage = $state<string | null>(null);

  completedCount = $derived(this.items.filter((i) => i.is_completed).length);
  progressPercent = $derived(
    this.items.length === 0 ? 0 : Math.round((this.completedCount / this.items.length) * 100)
  );
}
```

---

## 7. Kriteria Penerimaan (Acceptance Criteria) & Roadmap

### Acceptance Criteria (MVP)
- [ ] **Copywriting Sederhana:** Seluruh teks UI (tombol, label form, empty state, notifikasi, pesan error) memakai bahasa Indonesia sehari-hari tanpa istilah teknis/asing yang membingungkan.
- [ ] **Bebas Elemen Berlebihan:** Tidak ada badge versi, stiker dekoratif, atau ikon tanpa fungsi jelas di header, kartu, maupun form.
- [ ] **Mobile-First & Responsif:** Tampilan rapi dan nyaman dipakai di layar mobile (`360px`–`430px`), tablet, dan desktop (`1440px+`) tanpa *horizontal scroll*; semua tombol memiliki target sentuh minimal `44px × 44px`; modal nyaman digunakan saat keyboard mobile terbuka.
- [ ] **Empty State:** Halaman utama menampilkan tampilan kosong yang ramah saat belum ada jadwal, lengkap dengan opsi `+ Tambah Jadwal` dan `Isi Contoh`.
- [ ] **Validasi Form:** Modal mencegah penyimpanan jika *Nama Kegiatan* atau *Jam Mulai* kosong, dengan pesan kesalahan yang mudah dimengerti.
- [ ] **Penambahan & Pengaturan Urutan Instan:** Kegiatan baru langsung masuk ke urutan paling bawah (`position = max + 1`) secara *optimistic*; fitur naik/turun, selesai, ubah, hapus (dengan tombol `Batalkan`), dan `Urutkan Jam` bekerja mulus.
- [ ] **Aksesibilitas Keyboard:** Seluruh interaksi utama di desktop dapat dijalankan dengan keyboard (termasuk tombol `Esc` untuk menutup modal).

### Roadmap Fase Berikutnya (v1.1+)
1. **Geser dengan Seret (*Drag-and-Drop*):** Seret kartu langsung di sepanjang garis urutan (tetap nyaman di layar sentuh maupun mouse).
2. **Sinkronisasi Otomatis (*Realtime Sync*):** Perubahan jadwal langsung tersinkronisasi antar perangkat menggunakan Supabase Realtime.
3. **Pilih Tanggal & Template Harian:** Melihat jadwal untuk hari lain dan menyimpan daftar kegiatan rutin sebagai template.
4. **Bagikan Jadwal:** Membuat tautan publik hanya-baca (*read-only*) untuk membagikan susunan acara ke orang lain.
