Product Requirements Document (PRD): Kudil Schedule
Versi: 1.0 (MVP)
Status: Ready for Development
Tech Stack: Svelte 5 (Runes API) + SvelteKit + Tailwind CSS v4 + Supabase
Tema Visual: Fun Neobrutalism (Primary Accent: Biru Dongker / Navy Blue)

1. Ringkasan Eksekutif & Tujuan Produk
Kudil Schedule adalah aplikasi manajemen jadwal berbasis timeline/pipeline yang fleksibel, dirancang untuk menampilkan dan menyusun agenda harian secara cepat, ringan, dan menyenangkan.
Berbeda dari aplikasi kalender konvensional yang terasa kaku dan padat grid waktu, Kudil Schedule mengadopsi pendekatan Sequential Pipeline: pengguna cukup memasukkan kegiatan satu per satu, dan setiap kegiatan langsung tersusun rapi ke dalam alur vertikal yang bisa diurutkan ulang secara fleksibel kapan saja.
Goals Utama
    1. Ultra-Cepat & Ringan: Time-to-interactive instan, zero heavy calendar libraries, serta pembaruan antarmuka secara optimistic (respons < 50ms).
    2. Fleksibel: Urutan pipeline tidak terkunci secara kaku—pengguna bisa menyusun berdasarkan alur kerja manual (geser atas/bawah) atau mengurutkan otomatis berdasarkan jam mulai.
    3. Menyenangkan (Fun & Approachable): Mengurangi stres perencanaan harian melalui gaya visual Fun Neobrutalism yang tegas, ekspresif, dan ramah.

2. Arsitektur & Tech Stack
Lapisan	Teknologi	Alasan Pemilihan
Frontend Framework	Svelte 5 (Latest)	Kompilasi tanpa Virtual DOM, ukuran bundle sangat kecil, serta manajemen state reaktif presisi tinggi menggunakan Runes ($state, $derived, $effect).
Meta-Framework	SvelteKit	Routing ringan, SSR/CSR hibrida, dan integrasi API/Environment yang bersih.
Styling	Tailwind CSS v4	Utilitas cepat untuk membangun hard shadows, thick borders, dan layout responsif.
Backend & Database	Supabase (PostgreSQL)	Penyimpanan persisten cepat, SDK TypeScript ringan, Row Level Security (RLS), serta dukungan Realtime opsional untuk sinkronisasi lintas perangkat.


3. Sistem Desain (Fun Neobrutalism)
3.1 Palet Warna
    • Primary Accent (Biru Dongker / Navy Blue):
        ◦ Deep Navy: #162B52 (Tombol CTA utama, badge nomor pipeline aktif, badge jam mulai, header modal)
        ◦ Royal Navy: #1E3A8A (Hover state, aksen interaksi)
    • Canvas & Surface:
        ◦ Warm Cream Background: #FFFDF7 dengan tekstur subtle dot-grid
        ◦ Card Surface: #FFFFFF
    • Ink, Borders & Hard Shadows:
        ◦ Deep Ink: #0F172A (3px solid #0F172A, hard offset shadow 5px 5px 0px #0F172A tanpa blur)
    • Supporting Fun Accents (Harmonis dengan Biru Dongker):
        ◦ Butter Yellow: #FDE047 (Stiker badge, callout Helper Text)
        ◦ Sky Pop: #7DD3FC (Aksen ilustrasi & tombol utilitas)
        ◦ Mint Pop: #86EFAC (Status selesai / progress bar)
        ◦ Soft Coral: #FCA5A5 (Aksi hapus / reset)
3.2 Tipografi & Mikro-Interaksi
    • Heading & Display / Badge Waktu: Space Grotesk (Bold / ExtraBold)
    • Body & Form Copy: Plus Jakarta Sans (Regular, Medium, SemiBold)
    • Tactile Pressable Feel: Tombol bergeser ke kanan-bawah saat ditekan/di-hover sehingga hard shadow menyusut layaknya tombol fisik.

4. Spesifikasi Fitur Inti (MVP)
4.1 Header Ringkas & Navigasi Cepat
    • Menampilkan identitas Kudil Schedule beserta maskot mini dan stiker versi (v1.0 • Pipeline Mode).
    • Live Counter Pill: Menampilkan total kegiatan & jumlah kegiatan selesai secara real-time.
    • Primary CTA: Tombol + Tambah Schedule berwarna Biru Dongker yang selalu mudah dijangkau.
    • Utility Action: Tombol Muat Contoh (saat kosong untuk eksplorasi cepat) atau Reset Semua (saat jadwal terisi).
4.2 Empty State yang Lucu & Ramah
    • Ditampilkan secara otomatis ketika daftar schedule masih berjumlah 0.
    • Memuat ilustrasi maskot Kudil (karakter jam/kalender ramah yang melambai disertai sparkles).
    • Copywriting santai dan suportif: "Wah, jadwalmu masih kosong melompong!".
    • Menyediakan CTA utama + Tambah Schedule Pertama dan tombol sekunder Coba Isi Contoh Jadwal.
4.3 Modal Tambah & Edit Schedule
Muncul ketika pengguna menekan tombol tambah atau tombol edit pada kartu pipeline. Terdiri dari field:
Field	Tipe Input	Wajib?	Keterangan & Perilaku
Nama Kegiatan	Text Input	Ya	Judul utama agenda (maks. 120 karakter).
Jam Mulai	Time Picker (HH:mm)	Ya	Waktu mulai agenda + quick time chips opsional untuk input cepat.
Keterangan	Textarea	Tidak	Deskripsi singkat, lokasi, atau rincian agenda.
Helper Text	Text Input	Tidak	Catatan pengingat cepat (misal: "Bawa charger & catatan") yang tampil sebagai callout pill mencolok di kartu timeline.

4.4 Flexible Vertical Pipeline Timeline
    • Aturan Penambahan Sequential:
        ◦ Data pertama yang disimpan langsung masuk ke Pipeline #01 (paling atas).
        ◦ Setiap data baru berikutnya otomatis masuk ke Pipeline berikutnya di bawahnya (#02, #03, dst.) dengan animasi pop-in.
    • Struktur Visual Setiap Node:
        ◦ Left Rail: Garis vertikal tebal penghubung antar node dengan badge angka urut (01, 02, ...) berwarna Biru Dongker (berubah menjadi hijau Mint Pop dengan ikon centang saat selesai).
        ◦ Kartu Agenda: Menampilkan badge Jam Mulai, Nama Kegiatan, Keterangan, dan blok sorotan Helper Text (jika diisi).
    • Kontrol Fleksibel pada Kartu & Toolbar:
        ◦ Toggle Selesai: Menandai kegiatan telah rampung + memperbarui progress bar.
        ◦ Reorder (Naik / Turun): Memindahkan posisi kegiatan di pipeline secara fleksibel.
        ◦ Edit & Hapus: Mengubah data melalui modal atau menghapus kartu (disertai notifikasi Toast dengan opsi Urungkan / Undo).
        ◦ Urutkan Jam: Satu klik untuk menyusun ulang seluruh pipeline secara kronologis berdasarkan jam_mulai.
        ◦ Quick Add Footer: Tombol + Tambah ke Pipeline #0X langsung di ujung bawah garis pipeline.

5. Skema Database Supabase (PostgreSQL)
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

-- Index untuk pembacaan timeline harian yang ultra-cepat
create index idx_schedules_user_date_pos
  on public.schedules (user_id, schedule_date, position asc);

-- Aktifkan Row Level Security (RLS)
alter table public.schedules enable row level security;

create policy "Users can manage their own schedules"
  on public.schedules
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
Struktur State Svelte 5 (Runes Pattern)
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

class ScheduleStore {
  items = $state<ScheduleItem[]>([]);
  completedCount = $derived(this.items.filter((i) => i.is_completed).length);
  progressPercent = $derived(
    this.items.length === 0 ? 0 : Math.round((this.completedCount / this.items.length) * 100)
  );
}

6. Kriteria Penerimaan & Roadmap
Acceptance Criteria (MVP)
    • ☐ Halaman depan menampilkan empty state ramah ketika data kosong.
    • ☐ Modal validasi mencegah penyimpanan jika Nama Kegiatan atau Jam Mulai kosong.
    • ☐ Item baru selalu masuk ke urutan pipeline paling akhir (position = max + 1) secara instan (optimistic).
    • ☐ Responsif penuh di layar mobile (360px+) hingga desktop (1440px+) tanpa horizontal scroll.
    • ☐ Seluruh interaksi utama dapat dijalankan via keyboard (termasuk Esc menutup modal).
Roadmap Fase Berikutnya (v1.1+)
    1. Drag-and-Drop Reorder: Seret kartu langsung di sepanjang garis pipeline.
    2. Supabase Realtime Sync: Perubahan jadwal otomatis tersinkronisasi di tab/perangkat lain.
    3. Multi-Day Switcher & Template: Menyimpan pipeline favorit sebagai template harian.
    4. Shareable Public Link: Membagikan rundown timeline dalam mode read-only.
