import { db } from "./db";
import { kos, bookings, payments, users, type InsertKos, type InsertBooking, type InsertPayment, type InsertUser } from "@shared/schema";

const sampleKosData: InsertKos[] = [
  {
    name: "Kos Melati Hijau",
    description: "Kos modern dengan fasilitas lengkap dekat Universitas Indonesia. Kamar nyaman dengan AC, WiFi, dan akses mudah ke transportasi umum.",
    address: "Jl. Margonda Raya No. 123, Depok",
    city: "jakarta",
    pricePerMonth: "1200000",
    type: "campur",
    availableRooms: 3,
    totalRooms: 20,
    rating: "4.8",
    reviewCount: 156,
    facilities: ["WiFi", "AC", "Parkir", "Dapur", "Laundry", "Keamanan 24/7"],
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    ],
    ownerName: "Ibu Sari",
    ownerPhone: "+62 812 3456 7890",
    latitude: "-6.3682",
    longitude: "106.8347",
    isAvailable: true,
    isPromoted: true,
    roomSize: "3x4 meter",
    paymentType: "monthly"
  },
  {
    name: "Kos Bintang Lima",
    description: "Kos premium di kawasan Dago dengan suasana sejuk dan fasilitas mewah. Cocok untuk mahasiswa dan pekerja muda.",
    address: "Jl. Dago No. 45, Bandung",
    city: "bandung",
    pricePerMonth: "950000",
    type: "putri",
    availableRooms: 2,
    totalRooms: 15,
    rating: "4.9",
    reviewCount: 89,
    facilities: ["WiFi", "AC", "Keamanan 24/7", "Laundry", "Dapur Bersama"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    ],
    ownerName: "Bapak Ahmad",
    ownerPhone: "+62 813 9876 5432",
    latitude: "-6.8951",
    longitude: "107.6084",
    isAvailable: true,
    isPromoted: false,
    roomSize: "3x3 meter",
    paymentType: "monthly"
  },
  {
    name: "Kos Mahasiswa Sentral",
    description: "Kos strategis dekat ITB Surabaya dengan harga terjangkau. Fasilitas lengkap dan lingkungan aman untuk mahasiswa.",
    address: "Jl. Raya ITS No. 87, Surabaya",
    city: "surabaya",
    pricePerMonth: "750000",
    type: "putra",
    availableRooms: 5,
    totalRooms: 25,
    rating: "4.6",
    reviewCount: 134,
    facilities: ["WiFi", "Kamar Mandi Dalam", "Parkir Motor", "Ruang Belajar"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    ],
    ownerName: "Ibu Rina",
    ownerPhone: "+62 815 2468 1357",
    latitude: "-7.2865",
    longitude: "112.7957",
    isAvailable: true,
    isPromoted: false,
    roomSize: "3x3 meter",
    paymentType: "monthly"
  },
  {
    name: "Kos Executive Plaza",
    description: "Kos mewah di pusat kota Yogyakarta dengan fasilitas premium. Dilengkapi gym, cafe, dan WiFi super cepat.",
    address: "Jl. Malioboro No. 234, Yogyakarta",
    city: "yogyakarta",
    pricePerMonth: "2500000",
    type: "campur",
    availableRooms: 1,
    totalRooms: 10,
    rating: "5.0",
    reviewCount: 45,
    facilities: ["WiFi 100Mbps", "AC", "Gym", "Cafe", "Laundry Premium", "Keamanan 24/7"],
    images: [
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    ],
    ownerName: "Pak Budi",
    ownerPhone: "+62 814 7890 1234",
    latitude: "-7.7956",
    longitude: "110.3695",
    isAvailable: true,
    isPromoted: true,
    roomSize: "4x5 meter",
    paymentType: "monthly"
  },
  {
    name: "Kos Putri Aman",
    description: "Kos khusus putri dengan keamanan tinggi di kawasan Sudirman Jakarta. Lingkungan bersih dan nyaman.",
    address: "Jl. Sudirman No. 567, Jakarta",
    city: "jakarta",
    pricePerMonth: "1800000",
    type: "putri",
    availableRooms: 4,
    totalRooms: 18,
    rating: "4.7",
    reviewCount: 92,
    facilities: ["Keamanan 24/7", "Khusus Putri", "Dapur Bersama", "WiFi", "AC"],
    images: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    ],
    ownerName: "Ibu Dewi",
    ownerPhone: "+62 816 5432 8765",
    latitude: "-6.2088",
    longitude: "106.8456",
    isAvailable: true,
    isPromoted: false,
    roomSize: "3x4 meter",
    paymentType: "monthly"
  },
  {
    name: "Kos Kampus Center",
    description: "Kos dekat UGM dengan jarak tempuh hanya 200 meter. Cocok untuk mahasiswa dengan budget terbatas.",
    address: "Jl. Kaliurang KM 5, Yogyakarta",
    city: "yogyakarta",
    pricePerMonth: "650000",
    type: "campur",
    availableRooms: 7,
    totalRooms: 30,
    rating: "4.5",
    reviewCount: 178,
    facilities: ["WiFi", "Ruang Belajar", "Parkir Motor", "Dapur Bersama"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    ],
    ownerName: "Pak Joko",
    ownerPhone: "+62 817 6543 2109",
    latitude: "-7.7459",
    longitude: "110.3779",
    isAvailable: true,
    isPromoted: false,
    roomSize: "3x3 meter",
    paymentType: "monthly"
  }
];

const sampleUsers: InsertUser[] = [
  {
    name: "Budi Santoso",
    email: "pemilik@kosku.com",
    password: "password123",
    role: "pemilik",
    phone: "+62 812 3456 7890"
  },
  {
    name: "Siti Nurhaliza",
    email: "siti@email.com",
    password: "password123",
    role: "pencari",
    phone: "+62 813 4567 8901"
  },
  {
    name: "Ahmad Rifai",
    email: "ahmad@email.com",
    password: "password123",
    role: "pencari",
    phone: "+62 814 5678 9012"
  }
];

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Check if data already exists
    const existingKos = await db.select().from(kos).limit(1);
    if (existingKos.length > 0) {
      console.log("Database already contains data. Skipping seed.");
      return;
    }
    
    // Insert sample users first
    const insertedUsers = await db.insert(users).values(sampleUsers).returning();
    const ownerId = insertedUsers.find(u => u.role === "pemilik")?.id;
    const tenantIds = insertedUsers.filter(u => u.role === "pencari").map(u => u.id);
    
    // Insert sample kos data with ownerId
    const kosWithOwner = sampleKosData.map(kos => ({
      ...kos,
      ownerId: ownerId || 1
    }));
    
    const insertedKos = await db.insert(kos).values(kosWithOwner).returning();
    
    // Create sample bookings
    const sampleBookings: InsertBooking[] = [
      {
        kosId: insertedKos[0].id,
        customerName: "Siti Nurhaliza",
        customerPhone: "+62 813 4567 8901",
        customerEmail: "siti@email.com",
        userId: tenantIds[0],
        checkInDate: new Date("2024-12-01"),
        status: "confirmed",
        notes: "Booking untuk semester baru"
      },
      {
        kosId: insertedKos[1].id,
        customerName: "Ahmad Rifai",
        customerPhone: "+62 814 5678 9012",
        customerEmail: "ahmad@email.com",
        userId: tenantIds[1],
        checkInDate: new Date("2024-11-15"),
        status: "confirmed",
        notes: "Booking untuk magang di Jakarta"
      }
    ];
    
    const insertedBookings = await db.insert(bookings).values(sampleBookings).returning();
    
    // Create sample payments
    const samplePayments: InsertPayment[] = [
      {
        bookingId: insertedBookings[0].id,
        tenantName: "Siti Nurhaliza",
        roomNumber: "A1",
        kosName: insertedKos[0].name,
        amount: "1200000",
        dueDate: new Date("2025-01-01"),
        status: "paid",
        paymentMethod: "transfer",
        notes: "Pembayaran bulan Januari 2025",
        ownerId: ownerId || 1
      },
      {
        bookingId: insertedBookings[0].id,
        tenantName: "Siti Nurhaliza",
        roomNumber: "A1",
        kosName: insertedKos[0].name,
        amount: "1200000",
        dueDate: new Date("2025-02-01"),
        status: "pending",
        notes: "Pembayaran bulan Februari 2025",
        ownerId: ownerId || 1
      },
      {
        bookingId: insertedBookings[1].id,
        tenantName: "Ahmad Rifai",
        roomNumber: "B2",
        kosName: insertedKos[1].name,
        amount: "1500000",
        dueDate: new Date("2024-12-25"),
        status: "overdue",
        notes: "Pembayaran bulan Desember 2024 - terlambat",
        ownerId: ownerId || 1
      },
      {
        bookingId: insertedBookings[1].id,
        tenantName: "Ahmad Rifai",
        roomNumber: "B2",
        kosName: insertedKos[1].name,
        amount: "1500000",
        dueDate: new Date("2025-01-01"),
        status: "pending",
        notes: "Pembayaran bulan Januari 2025",
        ownerId: ownerId || 1
      }
    ];
    
    await db.insert(payments).values(samplePayments);
    
    console.log(`Successfully seeded:`);
    console.log(`- ${insertedUsers.length} users`);
    console.log(`- ${insertedKos.length} kos records`);
    console.log(`- ${insertedBookings.length} bookings`);
    console.log(`- ${samplePayments.length} payments`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Auto-run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };