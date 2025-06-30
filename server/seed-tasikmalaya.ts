import { db } from "./db";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";

async function seedTasikmalayaData() {
  try {
    console.log("Mulai seeding data Tasikmalaya...");

    // Clear existing data
    await db.delete(schema.payments);
    await db.delete(schema.bookings);
    await db.delete(schema.kos);
    await db.delete(schema.users);

    // Create users
    const users = [
      {
        email: "admin@sipatingkost.com",
        password: await bcrypt.hash("admin123", 10),
        name: "Admin User",
        phone: "08123456789",
        role: "admin" as const,
      },
      {
        email: "owner@sipatingkost.com", 
        password: await bcrypt.hash("owner123", 10),
        name: "Pemilik Kos Tasikmalaya",
        phone: "08123456790",
        role: "pemilik" as const,
      },
      {
        email: "user@sipatingkost.com",
        password: await bcrypt.hash("user123", 10),
        name: "Pencari Kos",
        phone: "08123456791",
        role: "pencari" as const,
      }
    ];

    const createdUsers = [];
    for (const user of users) {
      const [createdUser] = await db.insert(schema.users).values(user).returning();
      createdUsers.push(createdUser);
    }

    // Create kos with authentic Tasikmalaya data
    const kosData = [
      {
        name: "Kos Putri Cihideung Strategis",
        description: "Kos putri yang nyaman dengan lokasi strategis di pusat kota Tasikmalaya. Dekat dengan SMAN 5 Tasikmalaya dan fasilitas umum.",
        address: "Jl. Cihideung Udik No. 15, Cihideung, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "650000",
        type: "putri",
        availableRooms: 4,
        totalRooms: 12,
        rating: "4.3",
        reviewCount: 87,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Dapur Bersama", "Keamanan 24 Jam"],
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Ibu Dewi Sartika",
        ownerPhone: "+62 812 3456 7890",
        latitude: "-7.3274",
        longitude: "108.2207",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Putra Indihiang Business",
        description: "Kos putra strategis di kawasan bisnis Indihiang. Dekat dengan pusat konferensi dan kantor-kantor.",
        address: "Jl. Indihiang Raya No. 88, Indihiang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "700000",
        type: "putra",
        availableRooms: 6,
        totalRooms: 15,
        rating: "4.1",
        reviewCount: 62,
        facilities: ["WiFi", "AC", "Parkir Motor", "Laundry"],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Bapak Asep Suryadi",
        ownerPhone: "+62 813 9876 5432",
        latitude: "-7.3506",
        longitude: "108.2282",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Ciumbeng Indihiang Premium",
        description: "Kos premium dengan fasilitas lengkap di Ciumbeng. Lokasi strategis dekat fasilitas umum.",
        address: "Jl. Ciumbeng No. 42, Indihiang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "750000",
        type: "campur",
        availableRooms: 3,
        totalRooms: 10,
        rating: "4.5",
        reviewCount: 94,
        facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Dapur", "Parkir"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Ibu Rina Kusumawati",
        ownerPhone: "+62 814 5678 9012",
        latitude: "-7.3485",
        longitude: "108.2295",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Tawang University Area",
        description: "Kos nyaman dekat Universitas Siliwangi dan Universitas Perjuangan. Akses mudah ke ATM dan pusat perbelanjaan.",
        address: "Jl. Siliwangi No. 156, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "800000",
        type: "campur",
        availableRooms: 5,
        totalRooms: 18,
        rating: "4.4",
        reviewCount: 123,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Dekat Universitas", "Alfamart", "ATM"],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Bapak Dedi Hermawan",
        ownerPhone: "+62 815 2345 6789",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Putri Lengkongsari",
        description: "Kos putri di area Lengkongsari yang tenang dan aman. Cocok untuk mahasiswa.",
        address: "Jl. Lengkongsari No. 28, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "600000",
        type: "putri",
        availableRooms: 7,
        totalRooms: 16,
        rating: "4.2",
        reviewCount: 75,
        facilities: ["WiFi", "Dapur Bersama", "Ruang Belajar", "Keamanan"],
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Ibu Siti Nurjanah",
        ownerPhone: "+62 816 7890 1234",
        latitude: "-7.3298",
        longitude: "108.2156",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Empangsari Modern",
        description: "Kos modern di kawasan Empangsari dengan fasilitas terkini.",
        address: "Jl. Empangsari Indah No. 75, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "850000",
        type: "campur",
        availableRooms: 4,
        totalRooms: 12,
        rating: "4.6",
        reviewCount: 108,
        facilities: ["WiFi", "AC", "TV Kabel", "Laundry", "Parkir Luas"],
        images: [
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Bapak Irwan Setiawan",
        ownerPhone: "+62 817 3456 7890",
        latitude: "-7.3412",
        longitude: "108.2234",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Tamansari Asri",
        description: "Kos dengan suasana asri di kawasan Tamansari yang luas dan nyaman.",
        address: "Jl. Tamansari Raya No. 234, Tamansari, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "550000",
        type: "campur",
        availableRooms: 8,
        totalRooms: 20,
        rating: "4.0",
        reviewCount: 56,
        facilities: ["WiFi", "Taman", "Dapur Bersama", "Ruang TV"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Ibu Yayah Rokayah",
        ownerPhone: "+62 818 9012 3456",
        latitude: "-7.3156",
        longitude: "108.1987",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Sumelap Budget",
        description: "Kos ekonomis di kawasan Sumelap dengan fasilitas standar yang memadai.",
        address: "Jl. Sumelap No. 67, Tamansari, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "500000",
        type: "campur",
        availableRooms: 10,
        totalRooms: 24,
        rating: "3.8",
        reviewCount: 43,
        facilities: ["WiFi", "Kamar Mandi Bersama", "Dapur"],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Bapak Yusuf Hidayat",
        ownerPhone: "+62 819 4567 8901",
        latitude: "-7.3089",
        longitude: "108.1943",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Nagarawangi Executive",
        description: "Kos ekslusif di kawasan Nagarawangi untuk profesional muda.",
        address: "Jl. Nagarawangi No. 91, Cihideung, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "900000",
        type: "campur",
        availableRooms: 2,
        totalRooms: 8,
        rating: "4.7",
        reviewCount: 134,
        facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Gym", "Co-working Space"],
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Ibu Ratna Sari",
        ownerPhone: "+62 821 6789 0123",
        latitude: "-7.3321",
        longitude: "108.2198",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Putra Panyingkiran",
        description: "Kos putra di kawasan Panyingkiran yang strategis dan terjangkau.",
        address: "Jl. Panyingkiran No. 123, Indihiang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "650000",
        type: "putra",
        availableRooms: 6,
        totalRooms: 14,
        rating: "4.1",
        reviewCount: 68,
        facilities: ["WiFi", "Parkir Motor", "Warung Makan", "Mushola"],
        images: [
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Bapak Wahyu Santoso",
        ownerPhone: "+62 822 7890 1234",
        latitude: "-7.3567",
        longitude: "108.2345",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Putri Setiawargi",
        description: "Kos putri khusus di kawasan Setiawargi yang aman dan nyaman.",
        address: "Jl. Setiawargi No. 45, Tamansari, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "580000",
        type: "putri",
        availableRooms: 5,
        totalRooms: 12,
        rating: "4.3",
        reviewCount: 89,
        facilities: ["WiFi", "Keamanan 24 Jam", "Dapur Bersama", "Ruang Cuci"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Ibu Lilis Suryani",
        ownerPhone: "+62 823 9012 3456",
        latitude: "-7.3134",
        longitude: "108.2012",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Tugujaya Premium",
        description: "Kos premium di kawasan Tugujaya dengan fasilitas hotel berbintang.",
        address: "Jl. Tugujaya Raya No. 178, Cihideung, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "950000",
        type: "campur",
        availableRooms: 3,
        totalRooms: 10,
        rating: "4.8",
        reviewCount: 156,
        facilities: ["WiFi", "AC", "TV Smart", "Kulkas", "Room Service"],
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Bapak Hendra Wijaya",
        ownerPhone: "+62 824 3456 7890",
        latitude: "-7.3298",
        longitude: "108.2167",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x5 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Bungursari Ekonomis",
        description: "Kos ekonomis di kawasan Bungursari dengan akses mudah ke pusat kota.",
        address: "Jl. Bungursari No. 56, Purbaratu, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "550000",
        type: "campur",
        availableRooms: 9,
        totalRooms: 18,
        rating: "3.9",
        reviewCount: 52,
        facilities: ["WiFi", "Dapur Bersama", "Dekat Angkot", "Warung"],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Ibu Endang Susilawati",
        ownerPhone: "+62 825 4567 8901",
        latitude: "-7.3445",
        longitude: "108.2456",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Kahuripan Nyaman",
        description: "Kos dengan suasana homey di kawasan Kahuripan yang tenang.",
        address: "Jl. Kahuripan No. 89, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "620000",
        type: "campur",
        availableRooms: 6,
        totalRooms: 15,
        rating: "4.2",
        reviewCount: 71,
        facilities: ["WiFi", "Taman Kecil", "Dapur", "Tempat Jemuran Luas"],
        images: [
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Bapak Agus Supriyanto",
        ownerPhone: "+62 826 5678 9012",
        latitude: "-7.3387",
        longitude: "108.2145",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kos Argasari View",
        description: "Kos dengan pemandangan bagus di kawasan Argasari yang sejuk.",
        address: "Jl. Argasari Heights No. 112, Cihideung, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "780000",
        type: "campur",
        availableRooms: 4,
        totalRooms: 10,
        rating: "4.5",
        reviewCount: 95,
        facilities: ["WiFi", "AC", "View Pegunungan", "Balkon", "Parkir"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Ibu Maya Safitri",
        ownerPhone: "+62 827 6789 0123",
        latitude: "-7.3201",
        longitude: "108.2089",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x4 meter",
        paymentType: "monthly"
      }
    ];

    const createdKos = [];
    for (const kosItem of kosData) {
      const [createdKosItem] = await db.insert(schema.kos).values(kosItem).returning();
      createdKos.push(createdKosItem);
    }

    // Create sample bookings
    const sampleBookings = [
      {
        kosId: createdKos[0].id,
        customerName: "Ahmad Fauzi",
        customerEmail: "ahmad.fauzi@email.com",
        customerPhone: "+62 812 9876 5432",
        checkInDate: new Date("2025-01-15"),
        status: "confirmed"
      },
      {
        kosId: createdKos[3].id,
        customerName: "Sari Wulandari",
        customerEmail: "sari.wulandari@email.com",
        customerPhone: "+62 813 1234 5678",
        checkInDate: new Date("2025-02-01"),
        status: "pending"
      }
    ];

    const createdBookings = [];
    for (const booking of sampleBookings) {
      const [createdBooking] = await db.insert(schema.bookings).values(booking).returning();
      createdBookings.push(createdBooking);
    }

    // Create sample payments
    const samplePayments = [
      {
        bookingId: createdBookings[0].id,
        tenantName: "Ahmad Fauzi",
        roomNumber: "A-101",
        kosName: "Kos Putri Cihideung Strategis",
        amount: "650000",
        dueDate: new Date("2025-01-15"),
        status: "confirmed",
        paidDate: new Date("2025-01-10"),
        paymentMethod: "transfer_bank",
        ownerId: createdUsers[1].id
      },
      {
        bookingId: createdBookings[1].id,
        tenantName: "Sari Wulandari",
        roomNumber: "B-205",
        kosName: "Kos Tawang University Area",
        amount: "800000",
        dueDate: new Date("2025-02-01"),
        status: "pending",
        ownerId: createdUsers[1].id
      }
    ];

    for (const payment of samplePayments) {
      await db.insert(schema.payments).values(payment);
    }

    console.log("Data Tasikmalaya berhasil di-seed:");
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdKos.length} kos records`);
    console.log(`- ${createdBookings.length} bookings`);
    console.log(`- ${samplePayments.length} payments`);

  } catch (error) {
    console.error("Error seeding Tasikmalaya data:", error);
    throw error;
  }
}

// Run the seeding function
seedTasikmalayaData()
  .then(() => {
    console.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });