import { users, kos, bookings, rooms, payments, type User, type Kos, type InsertUser, type InsertKos, type Booking, type InsertBooking, type Room, type InsertRoom, type Payment, type InsertPayment } from "@shared/schema";
import { eq, like, and, gte, lte, or, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";

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
  
  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomsByOwner(ownerId: number): Promise<Room[]>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByKos(kosId: number): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByOwner(ownerId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPaymentsByOwner(ownerId: number): Promise<Payment[]>;
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string, paidDate?: Date, paymentMethod?: string, notes?: string, proofImagePath?: string): Promise<Payment | undefined>;
  getOverduePayments(ownerId: number): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  private db: any;
  
  constructor() {
    this.db = db;
  }
  
  // User operations
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [newUser] = await this.db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
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
    const [kosData] = await this.db.select().from(kos).where(eq(kos.id, id));
    return kosData || undefined;
  }

  async getAllKos(): Promise<Kos[]> {
    return await this.db.select().from(kos);
  }

  async getKosByCity(city: string): Promise<Kos[]> {
    return await this.db.select().from(kos).where(eq(kos.city, city.toLowerCase()));
  }

  async getKosByType(type: string): Promise<Kos[]> {
    if (type === "semua") return this.getAllKos();
    return await this.db.select().from(kos).where(eq(kos.type, type.toLowerCase()));
  }

  async getKosByOwner(ownerId: number): Promise<Kos[]> {
    return await this.db.select().from(kos).where(eq(kos.ownerId, ownerId));
  }

  async searchKos(query: string, city?: string, minPrice?: number, maxPrice?: number): Promise<Kos[]> {
    // For simplicity, we'll get all and filter in memory for complex queries
    const allKos = await this.db.select().from(kos);
    
    return allKos.filter((k: Kos) => {
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

  async getFeaturedKos(): Promise<Kos[]> {
    const allKos = await this.db.select().from(kos);
    return allKos
      .filter(k => k.isAvailable)
      .sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
  }

  async createKos(insertKos: InsertKos): Promise<Kos> {
    const [newKos] = await this.db
      .insert(kos)
      .values(insertKos)
      .returning();
    return newKos;
  }

  async updateKos(id: number, updateData: Partial<InsertKos>): Promise<Kos | undefined> {
    const [updatedKos] = await this.db
      .update(kos)
      .set(updateData)
      .where(eq(kos.id, id))
      .returning();
    return updatedKos || undefined;
  }

  async deleteKos(id: number): Promise<boolean> {
    const result = await this.db.delete(kos).where(eq(kos.id, id));
    return (result.rowCount || 0) > 0;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [newBooking] = await this.db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return newBooking;
  }

  async getBookingsByKos(kosId: number): Promise<Booking[]> {
    return await this.db.select().from(bookings).where(eq(bookings.kosId, kosId));
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await this.db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    const ownerKos = await this.getKosByOwner(ownerId);
    const kosIds = ownerKos.map(k => k.id);
    if (kosIds.length === 0) return [];
    
    return await this.db.select().from(bookings).where(
      or(...kosIds.map(id => eq(bookings.kosId, id)))
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await this.db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  // Room operations
  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [newRoom] = await this.db
      .insert(rooms)
      .values(insertRoom)
      .returning();
    return newRoom;
  }

  async getRoomsByOwner(ownerId: number): Promise<Room[]> {
    return await this.db.select().from(rooms).where(eq(rooms.ownerId, ownerId));
  }

  async updateRoom(id: number, updateData: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updatedRoom] = await this.db
      .update(rooms)
      .set(updateData)
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom || undefined;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const result = await this.db.delete(rooms).where(eq(rooms.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Payment operations
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await this.db.insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await this.db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByOwner(ownerId: number): Promise<Payment[]> {
    return await this.db.select()
      .from(payments)
      .where(eq(payments.ownerId, ownerId))
      .orderBy(payments.dueDate);
  }

  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await this.db.select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .orderBy(payments.dueDate);
  }

  async updatePaymentStatus(id: number, status: string, paidDate?: Date, paymentMethod?: string, notes?: string, proofImagePath?: string): Promise<Payment | undefined> {
    const updateData: any = { status };
    if (paidDate) updateData.paidDate = paidDate;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (notes) updateData.notes = notes;

    const [updatedPayment] = await this.db.update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    
    return updatedPayment;
  }

  async getOverduePayments(ownerId: number): Promise<Payment[]> {
    return await this.db.select()
      .from(payments)
      .where(
        and(
          eq(payments.ownerId, ownerId),
          eq(payments.status, "pending"),
          lte(payments.dueDate, new Date())
        )
      )
      .orderBy(payments.dueDate);
  }
}

export class MemStorage implements IStorage {
  private usersList: Map<number, User>;
  private kosList: Map<number, Kos>;
  private roomsList: Map<number, Room>;
  private bookingsList: Map<number, Booking>;
  private paymentsList: Map<number, Payment>;
  private currentUserId: number;
  private currentKosId: number;
  private currentRoomId: number;
  private currentBookingId: number;
  private currentPaymentId: number;

  constructor() {
    this.usersList = new Map();
    this.kosList = new Map();
    this.roomsList = new Map();
    this.bookingsList = new Map();
    this.paymentsList = new Map();
    this.currentUserId = 1;
    this.currentKosId = 1;
    this.currentRoomId = 1;
    this.currentBookingId = 1;
    this.currentPaymentId = 1;
    
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
      },
      // Complete Tasikmalaya kos data from Mamikos (15 kos from all districts)
      // Tawang District - Premium Area
      {
        name: "Kost Lashira State Tipe A",
        description: "Kos nyaman di Tawang dengan fasilitas lengkap dan lokasi strategis dekat pusat kota. Cocok untuk mahasiswa dan karyawan dengan akses 24 jam.",
        type: "campur",
        pricePerMonth: "850000",
        city: "tasikmalaya",
        address: "Jl. Tawang Raya No. 15, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3274",
        longitude: "108.2085",
        availableRooms: 1,
        totalRooms: 5,
        rating: "4.8",
        reviewCount: 45,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kasur", "Akses 24 Jam", "Lemari", "Meja Belajar"],
        images: ["/uploads/lashira1.jpg", "/uploads/lashira2.jpg", "/uploads/lashira3.jpg", "/uploads/lashira4.jpg", "/uploads/lashira5.jpg"],
        ownerName: "Ibu Lashira",
        ownerPhone: "+628123456789",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Akala Home Tipe Yale",
        description: "Kos premium dengan AC dan fasilitas mewah di Tawang. Lokasi strategis dengan kualitas terbaik untuk kenyamanan maksimal.",
        type: "campur", 
        pricePerMonth: "1600000",
        city: "tasikmalaya",
        address: "Jl. Kebon Tiwu 1 No. 25, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3268",
        longitude: "108.2078",
        availableRooms: 1,
        totalRooms: 3,
        rating: "4.9",
        reviewCount: 32,
        facilities: ["Kamar Mandi Dalam", "WiFi", "AC", "Kloset Duduk", "Kasur", "Akses 24 Jam", "Android TV", "Water Heater"],
        images: ["/uploads/akala1.jpg", "/uploads/akala2.jpg", "/uploads/akala3.jpg", "/uploads/akala4.jpg", "/uploads/akala5.jpg"],
        ownerName: "Bapak Akala",
        ownerPhone: "+628234567890",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost White House",
        description: "Kos putra dengan harga terjangkau di Tawang. Fasilitas standar dengan kebersihan terjaga dan suasana nyaman untuk mahasiswa.",
        type: "putra",
        pricePerMonth: "500000",
        city: "tasikmalaya", 
        address: "Jl. Tawang Indah No. 8, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3281",
        longitude: "108.2091",
        availableRooms: 3,
        totalRooms: 8,
        rating: "4.5",
        reviewCount: 28,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kasur", "Akses 24 Jam", "Lemari"],
        images: ["/uploads/whitehouse1.jpg", "/uploads/whitehouse2.jpg", "/uploads/whitehouse3.jpg", "/uploads/whitehouse4.jpg", "/uploads/whitehouse5.jpg"],
        ownerName: "Bapak Hendra",
        ownerPhone: "+628345678901",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Yeni Hernawati VVIP",
        description: "Kos putra VVIP dengan rating sempurna di Tawang. Fasilitas premium dengan pelayanan terbaik dan lokasi strategis dekat kampus.",
        type: "putra",
        pricePerMonth: "600000",
        city: "tasikmalaya",
        address: "Jl. Paledang No. 12, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3289",
        longitude: "108.2105", 
        availableRooms: 1,
        totalRooms: 4,
        rating: "5.0",
        reviewCount: 52,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kasur", "Meja Belajar", "Kursi", "Lemari"],
        images: ["/uploads/yeni1.jpg", "/uploads/yeni2.jpg", "/uploads/yeni3.jpg", "/uploads/yeni4.jpg", "/uploads/yeni5.jpg"],
        ownerName: "Ibu Yeni Hernawati",
        ownerPhone: "+628456789012",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost H Turyaman",
        description: "Kost dekat dengan UNSIL dan pusat kota, pelayanan dan fasilitasnya sangat baik, dan tentu saja terjangkau bagi mahasiswa.",
        type: "campur",
        pricePerMonth: "750000",
        city: "tasikmalaya",
        address: "Jl. H. Turyaman No. 45, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3295",
        longitude: "108.2098",
        availableRooms: 2,
        totalRooms: 10,
        rating: "4.7",
        reviewCount: 67,
        facilities: ["WiFi", "Kamar Mandi Dalam", "Kasur", "Akses 24 Jam", "Parkir Motor"],
        images: ["/uploads/turyaman1.jpg", "/uploads/turyaman2.jpg", "/uploads/turyaman3.jpg", "/uploads/turyaman4.jpg", "/uploads/turyaman5.jpg"],
        ownerName: "Bapak H. Turyaman",
        ownerPhone: "+628567890123",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Mekarsari 1",
        description: "Lokasi dekat dengan rumah makan, harga sesuai. Kos putra dengan fasilitas lengkap dan keamanan 24 jam.",
        type: "putra",
        pricePerMonth: "500000",
        city: "tasikmalaya",
        address: "Jl. Mekarsari 1 No. 20, Tawang, Tasikmalaya, Jawa Barat",
        latitude: "-7.3301",
        longitude: "108.2112",
        availableRooms: 4,
        totalRooms: 12,
        rating: "4.6",
        reviewCount: 89,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kasur", "Akses 24 Jam", "Dapur Bersama"],
        images: ["/uploads/mekarsari1.jpg", "/uploads/mekarsari2.jpg", "/uploads/mekarsari3.jpg", "/uploads/mekarsari4.jpg", "/uploads/mekarsari5.jpg"],
        ownerName: "Ibu Sari Mekarsari",
        ownerPhone: "+628678901234",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      // Cihideung District - Student Area
      {
        name: "Kost Jasmine Tipe A",
        description: "Kos putri eksklusif di Cihideung dengan fasilitas modern dan keamanan terjamin. Lingkungan bersih dan tenang untuk kenyamanan penghuni.",
        type: "putri",
        pricePerMonth: "850000",
        city: "tasikmalaya",
        address: "Jl. Cihideung Raya No. 30, Cihideung, Tasikmalaya, Jawa Barat", 
        latitude: "-7.3156",
        longitude: "108.2198",
        availableRooms: 2,
        totalRooms: 6,
        rating: "4.7",
        reviewCount: 38,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kloset Duduk", "Kasur", "Lemari", "AC"],
        images: ["/uploads/jasmine1.jpg", "/uploads/jasmine2.jpg", "/uploads/jasmine3.jpg", "/uploads/jasmine4.jpg", "/uploads/jasmine5.jpg"],
        ownerName: "Ibu Jasmine",
        ownerPhone: "+628789012345",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Eksklusif Bu Ira VVIP",
        description: "Bagus banget pemilik baik. Kos eksklusif dengan fasilitas premium dan keamanan 24 jam yang sangat nyaman.",
        type: "putra",
        pricePerMonth: "1200000",
        city: "tasikmalaya",
        address: "Jl. Cihideung Utara No. 15, Cihideung, Tasikmalaya, Jawa Barat",
        latitude: "-7.3142",
        longitude: "108.2205",
        availableRooms: 1,
        totalRooms: 5,
        rating: "4.9",
        reviewCount: 24,
        facilities: ["Kamar Mandi Dalam", "WiFi", "AC", "TV", "Kasur", "Lemari", "Kulkas", "Security 24 Jam"],
        images: ["/uploads/buira1.jpg", "/uploads/buira2.jpg", "/uploads/buira3.jpg", "/uploads/buira4.jpg", "/uploads/buira5.jpg"],
        ownerName: "Ibu Ira",
        ownerPhone: "+628890123456",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Annisa Tipe B",
        description: "Bersih, nyaman, cuma kadang ada bau yang tidak sedap. Kos putri dengan harga terjangkau dan fasilitas memadai.",
        type: "putri",
        pricePerMonth: "700000",
        city: "tasikmalaya",
        address: "Jl. Cihideung Selatan No. 22, Cihideung, Tasikmalaya, Jawa Barat",
        latitude: "-7.3168",
        longitude: "108.2183",
        availableRooms: 3,
        totalRooms: 8,
        rating: "4.3",
        reviewCount: 45,
        facilities: ["Kamar Mandi Dalam", "WiFi", "Kasur", "Lemari", "Dapur Bersama"],
        images: ["/uploads/annisa1.jpg", "/uploads/annisa2.jpg", "/uploads/annisa3.jpg", "/uploads/annisa4.jpg", "/uploads/annisa5.jpg"],
        ownerName: "Ibu Annisa",
        ownerPhone: "+628901234567",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Anugrah",
        description: "Enak, 24 jam, penghuni juga saling menghormati. Kos campur dengan suasana kekeluargaan yang hangat.",
        type: "campur",
        pricePerMonth: "650000",
        city: "tasikmalaya",
        address: "Jl. Anugrah No. 18, Cihideung, Tasikmalaya, Jawa Barat",
        latitude: "-7.3175",
        longitude: "108.2210",
        availableRooms: 5,
        totalRooms: 15,
        rating: "4.5",
        reviewCount: 78,
        facilities: ["WiFi", "Kasur", "Akses 24 Jam", "Kamar Mandi Luar", "Parkir Motor"],
        images: ["/uploads/anugrah1.jpg", "/uploads/anugrah2.jpg", "/uploads/anugrah3.jpg", "/uploads/anugrah4.jpg", "/uploads/anugrah5.jpg"],
        ownerName: "Bapak Anugrah",
        ownerPhone: "+629012345678",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost Jibes Tipe A",
        description: "Tinggal masuk aja, fasilitas standard kamar sudah ada dan cukup. Kos siap huni dengan fasilitas lengkap.",
        type: "campur",
        pricePerMonth: "800000",
        city: "tasikmalaya",
        address: "Jl. Jibes No. 7, Cihideung, Tasikmalaya, Jawa Barat",
        latitude: "-7.3189",
        longitude: "108.2195",
        availableRooms: 2,
        totalRooms: 6,
        rating: "4.6",
        reviewCount: 33,
        facilities: ["Kamar Mandi Dalam", "WiFi", "AC", "Kasur", "Lemari", "Meja Kursi"],
        images: ["/uploads/jibes1.jpg", "/uploads/jibes2.jpg", "/uploads/jibes3.jpg", "/uploads/jibes4.jpg", "/uploads/jibes5.jpg"],
        ownerName: "Ibu Jibes",
        ownerPhone: "+629123456789",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      // Cipedes District - Affordable Area
      {
        name: "Kost Indika",
        description: "Kamar nyaman serasa di rumah sendiri, cocok untuk istirahat bagi orang-orang yang habis kerja.",
        type: "putri",
        pricePerMonth: "750000",
        city: "tasikmalaya",
        address: "Jl. Cipedes Raya No. 45, Cipedes, Tasikmalaya, Jawa Barat",
        latitude: "-7.3405",
        longitude: "108.2156",
        availableRooms: 3,
        totalRooms: 10,
        rating: "4.8",
        reviewCount: 56,
        facilities: ["Kamar Mandi Dalam", "WiFi", "AC", "Kasur", "Lemari", "TV"],
        images: ["/uploads/indika1.jpg", "/uploads/indika2.jpg", "/uploads/indika3.jpg", "/uploads/indika4.jpg", "/uploads/indika5.jpg"],
        ownerName: "Ibu Indika",
        ownerPhone: "+629234567890",
        isAvailable: true,
        isPromoted: true,
        roomSize: "3x4 meter",
        paymentType: "monthly"
      },
      {
        name: "Kost H. Dadang",
        description: "Harga murah, fasilitas maksimal. Kos putra dengan value terbaik di Cipedes untuk mahasiswa.",
        type: "putra",
        pricePerMonth: "450000",
        city: "tasikmalaya",
        address: "Jl. H. Dadang No. 33, Cipedes, Tasikmalaya, Jawa Barat",
        latitude: "-7.3420",
        longitude: "108.2142",
        availableRooms: 6,
        totalRooms: 20,
        rating: "4.4",
        reviewCount: 92,
        facilities: ["WiFi", "Kasur", "Kamar Mandi Luar", "Parkir Motor", "Dapur Bersama"],
        images: ["/uploads/dadang1.jpg", "/uploads/dadang2.jpg", "/uploads/dadang3.jpg", "/uploads/dadang4.jpg", "/uploads/dadang5.jpg"],
        ownerName: "Bapak H. Dadang",
        ownerPhone: "+629345678901",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      // Mangkubumi District - Budget Friendly
      {
        name: "Kost Bu Haji",
        description: "Kos putri dengan harga sangat terjangkau di Mangkubumi. Cocok untuk mahasiswa dengan budget terbatas.",
        type: "putri",
        pricePerMonth: "401000",
        city: "tasikmalaya",
        address: "Jl. Mangkubumi No. 28, Mangkubumi, Tasikmalaya, Jawa Barat",
        latitude: "-7.3512",
        longitude: "108.2089",
        availableRooms: 8,
        totalRooms: 25,
        rating: "4.2",
        reviewCount: 67,
        facilities: ["Kasur", "Akses 24 Jam", "Kamar Mandi Luar", "Dapur Bersama"],
        images: ["/uploads/buhaji1.jpg", "/uploads/buhaji2.jpg", "/uploads/buhaji3.jpg", "/uploads/buhaji4.jpg", "/uploads/buhaji5.jpg"],
        ownerName: "Ibu Haji Aminah",
        ownerPhone: "+629456789012",
        isAvailable: true,
        isPromoted: false,
        roomSize: "3x3 meter",
        paymentType: "monthly"
      },
      // Siliwangi Area - Near University
      {
        name: "Kost Karmini Premium",
        description: "Dengan harga yang sangat worth it bisa dapat berbagai fasilitas yang membantu seperti mesin cuci dan pengering. Kebersihan mantap, keamanan jempol dengan satpam 24 jam.",
        type: "putri",
        pricePerMonth: "1150000",
        city: "tasikmalaya",
        address: "Jl. Siliwangi No. 67, dekat UNSIL, Tasikmalaya, Jawa Barat",
        latitude: "-7.3398",
        longitude: "108.2245",
        availableRooms: 1,
        totalRooms: 8,
        rating: "4.9",
        reviewCount: 145,
        facilities: ["Kamar Mandi Dalam", "WiFi", "AC", "Kloset Duduk", "Kasur", "Akses 24 Jam", "Mesin Cuci", "Pengering", "Gym", "Security 24 Jam"],
        images: ["/uploads/karmini1.jpg", "/uploads/karmini2.jpg", "/uploads/karmini3.jpg", "/uploads/karmini4.jpg", "/uploads/karmini5.jpg"],
        ownerName: "Ibu Karmini",
        ownerPhone: "+629567890123",
        isAvailable: true,
        isPromoted: true,
        roomSize: "4x5 meter",
        paymentType: "monthly"
      }
    ];

    sampleKos.forEach(kosData => {
      this.createKos(kosData);
    });

    // Create sample payments
    const samplePayments = [
      {
        bookingId: 1,
        tenantName: "Andi Pratama",
        roomNumber: "A101",
        kosName: "Kos Melati Hijau",
        amount: "1200000",
        dueDate: new Date(2025, 0, 15), // January 15, 2025
        status: "pending" as const,
        ownerId: 1,
      },
      {
        bookingId: 2,
        tenantName: "Sari Wulandari",
        roomNumber: "B205",
        kosName: "Kos Executive Plaza",
        amount: "2500000",
        dueDate: new Date(2025, 0, 10), // January 10, 2025
        status: "paid" as const,
        paidDate: new Date(2025, 0, 8),
        paymentMethod: "transfer",
        ownerId: 1,
      },
      {
        bookingId: 3,
        tenantName: "Budi Santoso",
        roomNumber: "C301",
        kosName: "Kos Putri Aman",
        amount: "1800000",
        dueDate: new Date(2024, 11, 30), // December 30, 2024 (overdue)
        status: "pending" as const,
        ownerId: 2,
      },
      {
        bookingId: 4,
        tenantName: "Maya Sari",
        roomNumber: "D104",
        kosName: "Kos Kampus Center",
        amount: "650000",
        dueDate: new Date(2025, 0, 20), // January 20, 2025
        status: "processing" as const,
        paymentMethod: "e-wallet",
        notes: "Menunggu verifikasi transfer GoPay",
        ownerId: 3,
      }
    ];

    samplePayments.forEach(paymentData => {
      this.createPayment(paymentData);
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

  // Room operations
  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = {
      id: this.currentRoomId++,
      number: insertRoom.number,
      kosName: insertRoom.kosName,
      type: insertRoom.type,
      price: insertRoom.price,
      size: insertRoom.size,
      floor: insertRoom.floor,
      description: insertRoom.description || null,
      facilities: insertRoom.facilities,
      images: insertRoom.images || [],
      isOccupied: insertRoom.isOccupied || false,
      tenantName: insertRoom.tenantName || null,
      ownerId: insertRoom.ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roomsList.set(room.id, room);
    return room;
  }

  async getRoomsByOwner(ownerId: number): Promise<Room[]> {
    return Array.from(this.roomsList.values()).filter(room => room.ownerId === ownerId);
  }

  async updateRoom(id: number, updateData: Partial<InsertRoom>): Promise<Room | undefined> {
    const room = this.roomsList.get(id);
    if (!room) {
      return undefined;
    }
    const updatedRoom: Room = {
      ...room,
      ...updateData,
      updatedAt: new Date(),
    };
    this.roomsList.set(id, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<boolean> {
    return this.roomsList.delete(id);
  }

  // Payment operations
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      id: this.currentPaymentId++,
      bookingId: insertPayment.bookingId,
      tenantName: insertPayment.tenantName,
      roomNumber: insertPayment.roomNumber,
      kosName: insertPayment.kosName,
      amount: insertPayment.amount,
      dueDate: new Date(insertPayment.dueDate),
      paidDate: null,
      status: insertPayment.status || "pending",
      paymentMethod: insertPayment.paymentMethod || null,
      notes: insertPayment.notes || null,
      proofImagePath: insertPayment.proofImagePath || null,
      ownerId: insertPayment.ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.paymentsList.set(payment.id, payment);
    return payment;
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    return this.paymentsList.get(id);
  }

  async getPaymentsByOwner(ownerId: number): Promise<Payment[]> {
    return Array.from(this.paymentsList.values())
      .filter(payment => payment.ownerId === ownerId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return Array.from(this.paymentsList.values())
      .filter(payment => payment.bookingId === bookingId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  async updatePaymentStatus(id: number, status: string, paidDate?: Date, paymentMethod?: string, notes?: string, proofImagePath?: string): Promise<Payment | undefined> {
    const payment = this.paymentsList.get(id);
    if (!payment) {
      return undefined;
    }
    const updatedPayment: Payment = {
      ...payment,
      status,
      paidDate: paidDate || payment.paidDate,
      paymentMethod: paymentMethod || payment.paymentMethod,
      notes: notes || payment.notes,
      proofImagePath: proofImagePath || payment.proofImagePath,
      updatedAt: new Date(),
    };
    this.paymentsList.set(id, updatedPayment);
    return updatedPayment;
  }

  async getOverduePayments(ownerId: number): Promise<Payment[]> {
    const now = new Date();
    return Array.from(this.paymentsList.values())
      .filter(payment => 
        payment.ownerId === ownerId &&
        payment.status === "pending" &&
        payment.dueDate < now
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }
}

// Use MemStorage - DNS resolution issues with Supabase, fallback to working memory storage
export const storage = new MemStorage();
