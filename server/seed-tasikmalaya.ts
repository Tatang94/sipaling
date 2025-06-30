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

    // Create kos with authentic Mamikos Tasikmalaya data
    const kosData = [
      {
        name: "Kost Lashira State Tipe A",
        description: "Kos campur dengan fasilitas lengkap di Tawang. Kamar mandi dalam, WiFi, kasur tersedia. Akses 24 jam untuk kenyamanan Anda.",
        address: "Jl. Tawang Raya, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "850000",
        type: "campur",
        availableRooms: 1,
        totalRooms: 15,
        rating: "4.8",
        reviewCount: 124,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur", "Akses 24 Jam"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2017-07-27/NzXAlm5C-240x320.jpg",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Kos Andalan",
        ownerPhone: "+62 812 3456 7890",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Akala Home Tipe Yale",
        description: "Kos campur eksklusif di Tawang dengan fasilitas premium. AC, WiFi, kamar mandi dalam dengan kloset duduk, dan akses 24 jam.",
        address: "Jl. Kebon Tiwu 1, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "1600000",
        type: "campur",
        availableRooms: 1,
        totalRooms: 8,
        rating: "4.6",
        reviewCount: 89,
        facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Kloset Duduk", "Kasur", "Akses 24 Jam"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2024-06-26/dltgmSbp.-240x320.jpg",
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Akala Home Management",
        ownerPhone: "+62 813 9876 5432",
        latitude: "-7.3298",
        longitude: "108.2167",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost White House",
        description: "Kos putra strategis di Tawang dengan fasilitas lengkap. Kamar mandi dalam, WiFi, kasur, dan akses 24 jam dengan harga terjangkau.",
        address: "Jl. Tawang Selatan No. 25, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "500000",
        type: "putra",
        availableRooms: 0,
        totalRooms: 12,
        rating: "4.2",
        reviewCount: 76,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur", "Akses 24 Jam"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2018-05-12/hvxPBn51-240x320.jpg",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "White House Management",
        ownerPhone: "+62 814 5678 9012",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: false,
        isPromoted: false,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Jasmine Tipe A",
        description: "Kos putri eksklusif di Cihideung dengan fasilitas premium. Kamar mandi dalam, WiFi, kloset duduk, dan kasur berkualitas.",
        address: "Jl. Cihideung Tengah No. 42, Cihideung, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "850000",
        type: "putri",
        availableRooms: 3,
        totalRooms: 10,
        rating: "4.7",
        reviewCount: 95,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kloset Duduk", "Kasur"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2025-04-11/g8tmOTWj-240x320.jpg",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Jasmine Kost Management",
        ownerPhone: "+62 815 2345 6789",
        latitude: "-7.3274",
        longitude: "108.2207",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Yeni Hernawati VVIP",
        description: "Kos putra VVIP di Tawang dengan rating sempurna. Kamar mandi dalam, WiFi, dan kasur berkualitas tinggi.",
        address: "Jl. Tawang Utara No. 67, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "600000",
        type: "putra",
        availableRooms: 2,
        totalRooms: 8,
        rating: "5.0",
        reviewCount: 127,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2018-07-08/pW6WUayQ-240x320.jpg",
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Yeni Hernawati",
        ownerPhone: "+62 816 7890 1234",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Annisa Tipe B",
        description: "Kos putri berkualitas di Cihideung dengan rating tinggi. Kamar mandi dalam, WiFi, kasur nyaman, dan lingkungan yang aman.",
        address: "Jl. Cihideung Hilir No. 89, Cihideung, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "700000",
        type: "putri",
        availableRooms: 0,
        totalRooms: 12,
        rating: "4.9",
        reviewCount: 143,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2022-01-03/oxuKISB9-240x320.jpg",
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Annisa Kost Management",
        ownerPhone: "+62 817 3456 7890",
        latitude: "-7.3274",
        longitude: "108.2207",
        isAvailable: false,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Alya IV",
        description: "Kos campur strategis di Cihideung dengan fasilitas lengkap. Kamar mandi dalam, WiFi, kasur, dan akses 24 jam untuk kenyamanan maksimal.",
        address: "Jl. Cihideung Raya No. 156, Cihideung, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "600000",
        type: "campur",
        availableRooms: 4,
        totalRooms: 15,
        rating: "4.3",
        reviewCount: 98,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur", "Akses 24 Jam"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2021-04-14/yPlpnHeM-240x320.jpg",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Alya Kost Management",
        ownerPhone: "+62 818 9012 3456",
        latitude: "-7.3274",
        longitude: "108.2207",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Mekarsari 1",
        description: "Kos putra berkualitas tinggi di Tawang dengan rating sempurna. Kamar mandi dalam, WiFi, kasur, dan akses 24 jam.",
        address: "Jl. Mekarsari No. 45, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "500000",
        type: "putra",
        availableRooms: 0,
        totalRooms: 10,
        rating: "5.0",
        reviewCount: 167,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur", "Akses 24 Jam"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2023-01-27/GpZNU87b-240x320.jpg",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Mekarsari Kost",
        ownerPhone: "+62 819 4567 8901",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: false,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Puri Mawar Tipe AC",
        description: "Kos putri premium di Tawang dengan AC dan fasilitas lengkap. Kamar mandi dalam, WiFi, kloset duduk, dan kasur berkualitas.",
        address: "Jl. Puri Mawar No. 34, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "600000",
        type: "putri",
        availableRooms: 0,
        totalRooms: 12,
        rating: "4.4",
        reviewCount: 112,
        facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Kloset Duduk", "Kasur"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2021-06-04/fTT1mUMd-240x320.jpg",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Puri Mawar Management",
        ownerPhone: "+62 821 6789 0123",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: false,
        isPromoted: false,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Permata Paledang",
        description: "Kos campur strategis di Tawang dengan rating baik. Kamar mandi dalam, WiFi, dan kasur nyaman dengan harga terjangkau.",
        address: "Jl. Paledang No. 78, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "650000",
        type: "campur",
        availableRooms: 3,
        totalRooms: 16,
        rating: "4.4",
        reviewCount: 156,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2020-08-31/p4USlxV8-240x320.jpg",
          "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Permata Kost",
        ownerPhone: "+62 822 7890 1234",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Salsabila",
        description: "Kos putra berkualitas di Tawang dengan fasilitas lengkap. Kamar mandi dalam, WiFi, kasur, dan akses 24 jam.",
        address: "Jl. Salsabila No. 92, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "700000",
        type: "putra",
        availableRooms: 0,
        totalRooms: 10,
        rating: "4.5",
        reviewCount: 134,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur", "Akses 24 Jam"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2021-08-03/evlXe1vb-240x320.jpg",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Salsabila Kost",
        ownerPhone: "+62 823 9012 3456",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: false,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Bu Haji",
        description: "Kos putri ekonomis di Mangkubumi dengan fasilitas dasar yang memadai. Kamar mandi dalam, kasur, dan akses 24 jam.",
        address: "Jl. Mangkubumi No. 123, Mangkubumi, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "401000",
        type: "putri",
        availableRooms: 6,
        totalRooms: 20,
        rating: "4.0",
        reviewCount: 87,
        facilities: ["Kamar Mandi Dalam", "Kasur", "Akses 24 Jam"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2021-08-16/jmeE3yRN-240x320.jpg",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Bu Haji",
        ownerPhone: "+62 824 3456 7890",
        latitude: "-7.3567",
        longitude: "108.2345",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Karmini Premium",
        description: "Kos putri premium di Tawang dengan fasilitas mewah. AC, WiFi, kamar mandi dalam dengan kloset duduk, kasur, dan akses 24 jam.",
        address: "Jl. Karmini Premium No. 56, Tawang, Tasikmalaya",
        city: "tasikmalaya",
        pricePerMonth: "1150000",
        type: "putri",
        availableRooms: 0,
        totalRooms: 8,
        rating: "4.8",
        reviewCount: 203,
        facilities: ["WiFi", "AC", "Kamar Mandi Dalam", "Kloset Duduk", "Kasur", "Akses 24 Jam"],
        images: [
          "https://static.mamikos.com/uploads/cache/data/style/2024-01-28/alTOmwcm.-240x320.jpg",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        ownerName: "Karmini Premium Management",
        ownerPhone: "+62 825 4567 8901",
        latitude: "-7.3374",
        longitude: "108.2183",
        isAvailable: false,
        isPromoted: true,
        roomSize: "4x5 meter",
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