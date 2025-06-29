import { users, kos, bookings, type User, type Kos, type InsertUser, type InsertKos, type Booking, type InsertBooking } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, gte, lte, or, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  
  // Kos operations
  getKos(id: number): Promise<Kos | undefined>;
  getAllKos(): Promise<Kos[]>;
  getKosByCity(city: string): Promise<Kos[]>;
  getKosByType(type: string): Promise<Kos[]>;
  getKosByOwner(ownerId: number): Promise<Kos[]>;
  searchKos(query: string, city?: string, minPrice?: number, maxPrice?: number): Promise<Kos[]>;
  getFeaturedKos(): Promise<Kos[]>;
  createKos(kos: InsertKos): Promise<Kos>;
  updateKos(id: number, kos: Partial<InsertKos>): Promise<Kos | undefined>;
  deleteKos(id: number): Promise<boolean>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByKos(kosId: number): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByOwner(ownerId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Kos operations
  async getKos(id: number): Promise<Kos | undefined> {
    const [kosData] = await db.select().from(kos).where(eq(kos.id, id));
    return kosData || undefined;
  }

  async getAllKos(): Promise<Kos[]> {
    return await db.select().from(kos);
  }

  async getKosByCity(city: string): Promise<Kos[]> {
    return await db.select().from(kos).where(eq(kos.city, city.toLowerCase()));
  }

  async getKosByType(type: string): Promise<Kos[]> {
    if (type === "semua") return this.getAllKos();
    return await db.select().from(kos).where(eq(kos.type, type.toLowerCase()));
  }

  async getKosByOwner(ownerId: number): Promise<Kos[]> {
    return await db.select().from(kos).where(eq(kos.ownerId, ownerId));
  }

  async searchKos(query: string, city?: string, minPrice?: number, maxPrice?: number): Promise<Kos[]> {
    let queryBuilder = db.select().from(kos);
    
    // Apply filters based on parameters
    if (query || city || minPrice || maxPrice) {
      // For simplicity, we'll get all and filter in memory for complex queries
      const allKos = await db.select().from(kos);
      
      return allKos.filter(k => {
        const matchesQuery = !query || 
          k.name.toLowerCase().includes(query.toLowerCase()) ||
          k.description.toLowerCase().includes(query.toLowerCase()) ||
          k.address.toLowerCase().includes(query.toLowerCase());
        
        const matchesCity = !city || k.city.toLowerCase() === city.toLowerCase();
        
        const price = parseFloat(k.pricePerMonth);
        const matchesPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
        
        return matchesQuery && matchesCity && matchesPrice && k.isAvailable;
      });
    }
    
    return await queryBuilder;
  }

  async getFeaturedKos(): Promise<Kos[]> {
    const allKos = await db.select().from(kos);
    return allKos
      .filter(k => k.isAvailable)
      .sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
  }

  async createKos(insertKos: InsertKos): Promise<Kos> {
    const [newKos] = await db
      .insert(kos)
      .values(insertKos)
      .returning();
    return newKos;
  }

  async updateKos(id: number, updateData: Partial<InsertKos>): Promise<Kos | undefined> {
    const [updatedKos] = await db
      .update(kos)
      .set(updateData)
      .where(eq(kos.id, id))
      .returning();
    return updatedKos || undefined;
  }

  async deleteKos(id: number): Promise<boolean> {
    const result = await db.delete(kos).where(eq(kos.id, id));
    return (result.rowCount || 0) > 0;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return newBooking;
  }

  async getBookingsByKos(kosId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.kosId, kosId));
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    const ownerKos = await this.getKosByOwner(ownerId);
    const kosIds = ownerKos.map(k => k.id);
    if (kosIds.length === 0) return [];
    
    return await db.select().from(bookings).where(
      or(...kosIds.map(id => eq(bookings.kosId, id)))
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }
}

export class MemStorage implements IStorage {
  private usersList: Map<number, User>;
  private kosList: Map<number, Kos>;
  private bookingsList: Map<number, Booking>;
  private currentUserId: number;
  private currentKosId: number;
  private currentBookingId: number;

  constructor() {
    this.usersList = new Map();
    this.kosList = new Map();
    this.bookingsList = new Map();
    this.currentUserId = 1;
    this.currentKosId = 1;
    this.currentBookingId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  // User operations (stub implementations for MemStorage)
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      password: hashedPassword,
      phone: insertUser.phone || null,
      createdAt: new Date(),
    };
    this.usersList.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersList.values()).find(user => user.email === email);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.usersList.get(id);
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  private initializeData() {
    const sampleKos: InsertKos[] = [
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

    sampleKos.forEach(kosData => {
      this.createKos(kosData);
    });
  }

  async getKos(id: number): Promise<Kos | undefined> {
    return this.kosList.get(id);
  }

  async getAllKos(): Promise<Kos[]> {
    return Array.from(this.kosList.values());
  }

  async getKosByCity(city: string): Promise<Kos[]> {
    return Array.from(this.kosList.values()).filter(kos => 
      kos.city.toLowerCase() === city.toLowerCase()
    );
  }

  async getKosByType(type: string): Promise<Kos[]> {
    if (type === "semua") return this.getAllKos();
    return Array.from(this.kosList.values()).filter(kos => 
      kos.type.toLowerCase() === type.toLowerCase()
    );
  }

  async getKosByOwner(ownerId: number): Promise<Kos[]> {
    return Array.from(this.kosList.values()).filter(kos => kos.ownerId === ownerId);
  }

  async searchKos(query: string, city?: string, minPrice?: number, maxPrice?: number): Promise<Kos[]> {
    return Array.from(this.kosList.values()).filter(kos => {
      const matchesQuery = !query || 
        kos.name.toLowerCase().includes(query.toLowerCase()) ||
        kos.description.toLowerCase().includes(query.toLowerCase()) ||
        kos.address.toLowerCase().includes(query.toLowerCase());
      
      const matchesCity = !city || kos.city.toLowerCase() === city.toLowerCase();
      
      const price = parseFloat(kos.pricePerMonth);
      const matchesPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
      
      return matchesQuery && matchesCity && matchesPrice && kos.isAvailable;
    });
  }

  async getFeaturedKos(): Promise<Kos[]> {
    return Array.from(this.kosList.values())
      .filter(kos => kos.isAvailable)
      .sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
  }

  async createKos(insertKos: InsertKos): Promise<Kos> {
    const id = this.currentKosId++;
    const now = new Date();
    const kos: Kos = {
      ...insertKos,
      id,
      createdAt: now,
      updatedAt: now,
      reviewCount: insertKos.reviewCount || 0,
      latitude: insertKos.latitude || null,
      longitude: insertKos.longitude || null,
      roomSize: insertKos.roomSize || null,
      paymentType: insertKos.paymentType || "monthly",
      isAvailable: insertKos.isAvailable !== undefined ? insertKos.isAvailable : true,
      isPromoted: insertKos.isPromoted !== undefined ? insertKos.isPromoted : false,
      ownerId: insertKos.ownerId || null,
    };
    this.kosList.set(id, kos);
    return kos;
  }

  async updateKos(id: number, updateData: Partial<InsertKos>): Promise<Kos | undefined> {
    const existingKos = this.kosList.get(id);
    if (!existingKos) return undefined;
    
    const updatedKos: Kos = {
      ...existingKos,
      ...updateData,
      updatedAt: new Date(),
    };
    this.kosList.set(id, updatedKos);
    return updatedKos;
  }

  async deleteKos(id: number): Promise<boolean> {
    return this.kosList.delete(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
      status: insertBooking.status || "pending",
      notes: insertBooking.notes || null,
      userId: insertBooking.userId || null,
    };
    this.bookingsList.set(id, booking);
    return booking;
  }

  async getBookingsByKos(kosId: number): Promise<Booking[]> {
    return Array.from(this.bookingsList.values()).filter(booking => 
      booking.kosId === kosId
    );
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookingsList.values()).filter(booking => 
      booking.userId === userId
    );
  }

  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    const ownerKos = await this.getKosByOwner(ownerId);
    const kosIds = ownerKos.map(k => k.id);
    return Array.from(this.bookingsList.values()).filter(booking => 
      kosIds.includes(booking.kosId)
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookingsList.get(id);
    if (!booking) return undefined;
    
    const updatedBooking: Booking = {
      ...booking,
      status,
    };
    this.bookingsList.set(id, updatedBooking);
    return updatedBooking;
  }
}

export const storage = new DatabaseStorage();
