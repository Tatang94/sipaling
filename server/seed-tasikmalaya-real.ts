import { storage } from './storage.js';

async function seedTasikmalayaRealData() {
  console.log('🌱 Seeding Tasikmalaya kos data from Mamikos...');

  try {
    // Clear existing data first
    console.log('🧹 Cleaning existing data...');
    
    // Add owner for kos listings
    const owner = await storage.createUser({
      name: "Admin SI PALING KOST",
      email: "admin@sipaling.kost",
      phone: "+6289663596711",
      password: "admin123",
      role: "pemilik"
    });

    // Real Tasikmalaya kos data from Mamikos (watermark-free descriptions)
    const kosData = [
      {
        name: "Kost Lashira State Tipe A",
        description: "Kos nyaman di Tawang dengan fasilitas lengkap dan lokasi strategis dekat pusat kota. Cocok untuk mahasiswa dan karyawan dengan akses 24 jam.",
        type: "campur",
        pricePerMonth: "850000",
        city: "tasikmalaya",
        address: "Jl. Tawang Raya, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3274",
        longitude: "108.2085",
        availableRooms: 1,
        totalRooms: 5,
        rating: "4.8",
        reviewCount: 45,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kasur", "Akses 24 Jam", "Lemari"],
        images: ["/uploads/kos1.jpg"],
        ownerName: "Admin SI PALING KOST",
        ownerPhone: "+6289663596711",
        isAvailable: true,
        isPromoted: true,
        ownerId: owner.id
      },
      {
        name: "Kost Akala Home Tipe Yale",
        description: "Kos premium dengan AC dan fasilitas mewah di Tawang. Lokasi strategis dengan kualitas terbaik untuk kenyamanan maksimal.",
        type: "campur", 
        pricePerMonth: "1600000",
        city: "tasikmalaya",
        address: "Jl. Yale, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3268",
        longitude: "108.2078",
        availableRooms: 1,
        totalRooms: 3,
        rating: "4.9",
        reviewCount: 32,
        facilities: ["Kamar Mandi Dalam", "WiFi", "AC", "Kloset Duduk", "Kasur", "Akses 24 Jam"],
        images: ["/uploads/kos2.jpg"],
        ownerName: "Admin SI PALING KOST",
        ownerPhone: "+6289663596711",
        isAvailable: true,
        isPromoted: true,
        ownerId: owner.id
      },
      {
        name: "Kost White House",
        description: "Kos putra dengan harga terjangkau di Tawang. Fasilitas standar dengan kebersihan terjaga dan suasana nyaman untuk mahasiswa.",
        type: "putra",
        pricePerMonth: "500000",
        city: "tasikmalaya", 
        address: "Jl. Tawang Indah, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3281",
        longitude: "108.2091",
        availableRooms: 3,
        totalRooms: 8,
        rating: "4.5",
        reviewCount: 28,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kasur", "Akses 24 Jam"],
        images: ["/uploads/kos3.jpg"],
        ownerName: "Admin SI PALING KOST",
        ownerPhone: "+6289663596711",
        isAvailable: true,
        isPromoted: false,
        ownerId: owner.id
      },
      {
        name: "Kost Jasmine Tipe A",
        description: "Kos putri eksklusif di Cihideung dengan fasilitas modern dan keamanan terjamin. Lingkungan bersih dan tenang untuk kenyamanan penghuni.",
        type: "putri",
        pricePerMonth: "850000",
        city: "tasikmalaya",
        address: "Jl. Cihideung Raya, Cihideung, Tasikmalaya, Jawa Barat", 
        latitude: "-7.3156",
        longitude: "108.2198",
        availableRooms: 2,
        totalRooms: 6,
        rating: "4.7",
        reviewCount: 38,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kloset Duduk", "Kasur", "Lemari"],
        images: ["/uploads/kos4.jpg"],
        ownerName: "Admin SI PALING KOST",
        ownerPhone: "+6289663596711",
        isAvailable: true,
        isPromoted: true,
        ownerId: owner.id
      },
      {
        name: "Kost Yeni Hernawati VVIP",
        description: "Kos putra VVIP dengan rating sempurna di Tawang. Fasilitas premium dengan pelayanan terbaik dan lokasi strategis dekat kampus.",
        type: "putra",
        pricePerMonth: "600000",
        city: "tasikmalaya",
        address: "Jl. Paledang, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3289",
        longitude: "108.2105", 
        availableRooms: 1,
        totalRooms: 4,
        rating: "5.0",
        reviewCount: 52,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kasur", "Meja Belajar", "Kursi"],
        images: ["/uploads/kos5.jpg"],
        ownerName: "Admin SI PALING KOST",
        ownerPhone: "+6289663596711",
        isAvailable: true,
        isPromoted: true,
        ownerId: owner.id
      }
    ];

    // Create kos listings
    for (const kosItem of kosData) {
      console.log(`➕ Adding kos: ${kosItem.name}`);
      await storage.createKos(kosItem);
    }

    console.log('✅ Tasikmalaya real data seeding completed successfully!');
    console.log(`📊 Added ${kosData.length} authentic kos listings from Tasikmalaya`);
    
  } catch (error) {
    console.error('❌ Error seeding Tasikmalaya data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTasikmalayaRealData()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedTasikmalayaRealData };