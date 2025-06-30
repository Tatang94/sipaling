# SI PALING KOST - Platform Kos Indonesia

Platform modern untuk pencarian dan pengelolaan kos-kosan di Indonesia dengan dashboard pemilik yang canggih.

## ✨ Fitur Utama

### Untuk Pencari Kos
- 🏠 Pencarian kos dengan filter lokasi, harga, dan fasilitas
- 📱 Antarmuka responsif untuk mobile dan desktop
- ⭐ Rating dan review dari penghuni sebelumnya
- 💬 Kontak langsung dengan pemilik kos

### Untuk Pemilik Kos
- 📊 Dashboard modern dengan statistik real-time
- 🏢 Manajemen kamar dan fasilitas
- 👥 Kelola data penyewa dan pembayaran
- 💰 Tracking penghasilan dan laporan keuangan
- 🔔 Notifikasi pembayaran dan reminder

## 🛠️ Teknologi

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL dengan Drizzle ORM
- **Build**: Vite untuk development dan production
- **Deployment**: Siap deploy ke Vercel

## 🚀 Deploy ke Vercel

### Persiapan
1. Fork atau clone repository ini
2. Buat akun di [Vercel](https://vercel.com)
3. Buat database PostgreSQL (bisa pakai [Neon](https://neon.tech) atau [Supabase](https://supabase.com))

### Steps Deploy
1. **Import Project ke Vercel**
   - Buka [vercel.com](https://vercel.com) dan login
   - Klik "New Project" dan import dari GitHub repository
   - Vercel akan auto-detect sebagai static site

2. **Konfigurasi Build (Auto-detected)**
   ```
   Build Command: vite build
   Output Directory: dist/public
   Install Command: npm install
   ```

3. **Set Environment Variables (Opsional untuk fitur database)**
   Tambahkan di Vercel Dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=production
   ```

4. **Deploy**
   - Klik "Deploy" dan tunggu proses selesai
   - Frontend akan tersedia di domain `.vercel.app`
   - Dashboard pemilik kos dapat diakses langsung

### Database Setup
Setelah deploy, jalankan migrasi database:
```bash
# Push schema ke database production
npx drizzle-kit push

# Seed data (opsional untuk demo)
tsx server/seed.ts
```

## 📁 Struktur Project

```
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── pages/        # Route Pages
│   │   └── lib/          # Utilities
├── server/          # Backend Express
│   ├── routes.ts    # API Routes
│   ├── storage.ts   # Database Layer
│   └── seed.ts      # Database Seeding
├── shared/          # Shared Types & Schema
└── vercel.json      # Vercel Configuration
```

## 🌟 Dashboard Pemilik Kos

Dashboard modern dengan:
- **Sidebar Navigation**: Beranda, Kamar, Penyewa, Pembayaran, Pengaturan
- **Statistik Real-time**: Tingkat hunian, penghasilan, penyewa aktif
- **Tema Modern**: Desain biru-hijau yang profesional dan clean
- **Responsive**: Optimal di desktop dan mobile
- **Manajemen Lengkap**: Dari kamar hingga pembayaran

## 💡 Fitur Mendatang

- [ ] Sistem booking online
- [ ] Payment gateway integration
- [ ] Mobile app
- [ ] Multi-bahasa support
- [ ] Advanced analytics

## 📞 Dukungan

Untuk bantuan deployment atau pertanyaan teknis, hubungi tim development.

---

**SI PALING KOST** - Solusi modern untuk pengelolaan kos-kosan Indonesia 🇮🇩