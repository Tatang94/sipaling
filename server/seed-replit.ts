import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users, kos } from '@shared/schema';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

// Use the provided Neon database URL
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_lyKI3SFjO6Bp@ep-curly-tree-a8n9sa6t-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('🔧 Using Replit PostgreSQL database...');

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool, schema: { users, kos } });

async function seedDatabase() {
  try {
    console.log('🌱 Seeding Tasikmalaya kos data to Replit PostgreSQL...');
    
    // Test connection first
    console.log('🔄 Testing database connection...');
    await db.select().from(users).limit(1);
    console.log('✅ Database connection successful!');
    
    // Create owner user
    console.log('👤 Creating owner user...');
    const [owner] = await db.insert(users).values({
      email: 'owner@tasikmalaya.com',
      name: 'Pemilik Kos Tasikmalaya',
      role: 'pemilik',
      phone: '081234567890',
      password: 'hashed_password'
    }).returning();

    // Seed Tasikmalaya kos data
    console.log('🏠 Adding Tasikmalaya kos listings...');
    
    const kosData = [
      {
        name: "Kost H. Dadang",
        description: "Harga mulai dari 500 ribu per bulan. Kost ini memiliki fasilitas yang lengkap seperti kamar mandi dalam, AC, dan area parkir. Berlokasi strategis di Jl. Cikurubuk No. 123, Tawang, Tasikmalaya, Jawa Barat. Kost ini sangat cocok untuk mahasiswa dan pekerja yang mencari hunian nyaman dengan harga terjangkau.",
        address: "Jl. Cikurubuk No. 123, Tawang, Tasikmalaya, Jawa Barat",
        city: "Tasikmalaya",
        latitude: -7.3274,
        longitude: 108.2207,
        pricePerMonth: 500000,
        type: "campuran",
        facilities: ["WiFi", "Kamar Mandi Dalam", "AC", "Parkir Motor", "Dapur Bersama"],
        images: [
          "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1631679706909-fad9376665bf?w=800&h=600&fit=crop"
        ],
        availableRooms: 8,
        totalRooms: 15,
        ownerName: "H. Dadang Hermawan",
        ownerPhone: "0812-3456-7890",
        ownerEmail: "hdadang@gmail.com",
        paymentType: "bulanan",
        rating: 4.5,
        reviewCount: 12,
        isActive: true,
        isFeatured: true,
        roomSize: "3x4 meter",
        ownerId: owner.id
      },
      {
        name: "Kos Putri Aman",
        description: "Kos khusus putri dengan keamanan 24 jam. Terletak di Jl. Cihideung Hilir No. 45, Cihideung, Tasikmalaya dengan harga mulai 600 ribu per bulan. Fasilitas lengkap termasuk WiFi, kamar mandi dalam, dan area jemuran. Lingkungan aman dan nyaman khusus untuk mahasiswi.",
        address: "Jl. Cihideung Hilir No. 45, Cihideung, Tasikmalaya, Jawa Barat",
        city: "Tasikmalaya",
        latitude: -7.3505,
        longitude: 108.2021,
        pricePerMonth: 600000,
        type: "putri",
        facilities: ["WiFi", "Kamar Mandi Dalam", "Keamanan 24 Jam", "Area Jemuran", "CCTV"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
        ],
        availableRooms: 5,
        totalRooms: 12,
        ownerName: "Ibu Sari Wulandari",
        ownerPhone: "0813-4567-8901",
        ownerEmail: "sariwulan@gmail.com",
        paymentType: "bulanan",
        rating: 4.7,
        reviewCount: 8,
        isActive: true,
        isFeatured: true,
        roomSize: "3x3 meter",
        ownerId: owner.id
      },
      {
        name: "Kos Executive Plaza",
        description: "Kos eksklusif di pusat kota Tasikmalaya dengan fasilitas premium. Berlokasi di Jl. Asia Afrika No. 78, Empang, Tasikmalaya. Harga mulai 1,2 juta per bulan dengan fasilitas lengkap seperti AC, WiFi kencang, gym, dan area coworking. Cocok untuk eksekutif muda dan profesional.",
        address: "Jl. Asia Afrika No. 78, Empang, Tasikmalaya, Jawa Barat",
        city: "Tasikmalaya",
        latitude: -7.3389,
        longitude: 108.2191,
        pricePerMonth: 1200000,
        type: "campuran",
        facilities: ["WiFi Premium", "AC", "Gym", "Area Coworking", "Parkir Mobil", "Rooftop Garden"],
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
        ],
        availableRooms: 3,
        totalRooms: 20,
        ownerName: "Bapak Anton Setiawan",
        ownerPhone: "0814-5678-9012",
        ownerEmail: "anton.executive@gmail.com",
        paymentType: "bulanan",
        rating: 4.8,
        reviewCount: 25,
        isActive: true,
        isFeatured: true,
        roomSize: "4x5 meter",
        ownerId: owner.id
      },
      {
        name: "Kos Mahasiswa Sejahtera",
        description: "Kos budget-friendly khusus mahasiswa dengan harga terjangkau mulai 450 ribu per bulan. Terletak di Jl. Raya Singaparna No. 234, Singaparna, Tasikmalaya. Fasilitas dasar lengkap dengan WiFi, kamar mandi bersama, dan dapur komunal. Lingkungan akademis yang mendukung.",
        address: "Jl. Raya Singaparna No. 234, Singaparna, Tasikmalaya, Jawa Barat",
        city: "Tasikmalaya",
        latitude: -7.3547,
        longitude: 108.1129,
        pricePerMonth: 450000,
        type: "putra",
        facilities: ["WiFi", "Kamar Mandi Bersama", "Dapur Komunal", "Area Belajar", "Parkir Motor"],
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop"
        ],
        availableRooms: 12,
        totalRooms: 25,
        ownerName: "Ibu Retno Maharani",
        ownerPhone: "0815-6789-0123",
        ownerEmail: "retno.kos@gmail.com",
        paymentType: "bulanan",
        rating: 4.3,
        reviewCount: 18,
        isActive: true,
        isFeatured: false,
        roomSize: "3x3 meter",
        ownerId: owner.id
      },
      {
        name: "Kos Modern Tasik",
        description: "Kos modern dengan desain kontemporer di Jl. Otto Iskandardinata No. 189, Tasikmalaya Kota. Harga mulai 800 ribu per bulan dengan fasilitas modern seperti smart lock, high-speed WiFi, dan interior minimalis. Cocok untuk generasi milenial yang mengutamakan kenyamanan dan style.",
        address: "Jl. Otto Iskandardinata No. 189, Tasikmalaya Kota, Jawa Barat",
        city: "Tasikmalaya",
        latitude: -7.3298,
        longitude: 108.2170,
        pricePerMonth: 800000,
        type: "campuran",
        facilities: ["WiFi High Speed", "Smart Lock", "Interior Modern", "Air Conditioner", "Laundry Service"],
        images: [
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
        ],
        availableRooms: 7,
        totalRooms: 18,
        ownerName: "Bapak Rizki Pratama",
        ownerPhone: "0816-7890-1234",
        ownerEmail: "rizki.modern@gmail.com",
        paymentType: "bulanan",
        rating: 4.6,
        reviewCount: 15,
        isActive: true,
        isFeatured: true,
        roomSize: "3x4 meter",
        ownerId: owner.id
      }
    ];

    for (const kosItem of kosData) {
      await db.insert(kos).values(kosItem);
      console.log(`✅ Added: ${kosItem.name}`);
    }

    console.log('🎉 Seeding completed successfully!');
    console.log(`📊 Total kos added: ${kosData.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();