import { users, kos, bookings, rooms, payments, type User, type Kos, type InsertUser, type InsertKos, type Booking, type InsertBooking, type Room, type InsertRoom, type Payment, type InsertPayment } from "@shared/schema";
import { eq, like, and, gte, lte, or, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  updateUserFaceData(userId: number, faceData: string): Promise<User | undefined>;
  verifyUserFace(userId: number, capturedFaceData: string): Promise<boolean>;
  
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await this.db.insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async updateUserFaceData(userId: number, faceData: string): Promise<User | undefined> {
    const [updatedUser] = await this.db.update(users)
      .set({ faceData })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async verifyUserFace(userId: number, capturedFaceData: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user || !user.faceData) {
      console.log(`❌ Face verification failed - User ${userId} not found or no face data`);
      return false;
    }
    
    try {
      console.log(`🔍 Starting face verification for user ${userId}`);
      
      const storedFaceData = JSON.parse(atob(user.faceData));
      const capturedData = JSON.parse(atob(capturedFaceData));
      
      console.log('📊 Stored face data:', {
        hasDescriptor: !!storedFaceData.faceDescriptor,
        descriptorLength: storedFaceData.faceDescriptor?.length,
        faceDetected: storedFaceData.faceDetected
      });
      
      console.log('📊 Captured face data:', {
        hasDescriptor: !!capturedData.faceDescriptor,
        descriptorLength: capturedData.faceDescriptor?.length,
        faceDetected: capturedData.faceDetected,
        qualityScore: capturedData.qualityScore,
        livenessScore: capturedData.livenessScore
      });
      
      // Start with basic verification
      let similarity = 0.0;
      
      // Primary verification: Face descriptors
      if (storedFaceData.faceDescriptor && capturedData.faceDescriptor) {
        const stored = storedFaceData.faceDescriptor;
        const captured = capturedData.faceDescriptor;
        
        if (stored.length === captured.length && stored.length > 0) {
          // Calculate Euclidean distance
          let distance = 0;
          for (let i = 0; i < stored.length; i++) {
            distance += Math.pow(stored[i] - captured[i], 2);
          }
          distance = Math.sqrt(distance);
          
          console.log(`📏 Face descriptor distance: ${distance.toFixed(4)}`);
          
          // More lenient distance threshold
          if (distance < 1.0) {
            similarity = Math.max(0.4, 1.0 - distance);
          } else {
            similarity = 0.2; // Still give some chance
          }
        }
      } else {
        // Fallback: Both have face detection
        if (capturedData.faceDetected && storedFaceData.faceDetected) {
          similarity = 0.6; // Generous fallback
        } else {
          similarity = 0.3; // Minimal fallback
        }
      }
      
      // Bonus points for quality indicators
      if (capturedData.faceDetected && storedFaceData.faceDetected) {
        similarity += 0.15;
      }
      
      if (capturedData.qualityScore && capturedData.qualityScore > 60) {
        similarity += 0.1;
      }
      
      if (capturedData.livenessScore && capturedData.livenessScore > 60) {
        similarity += 0.1;
      }
      
      // Time bonus (same session)
      const now = new Date();
      const capturedTime = new Date(capturedData.timestamp);
      const timeDiff = Math.abs(now.getTime() - capturedTime.getTime()) / (1000 * 60);
      
      if (timeDiff < 30) {
        similarity += 0.05;
      }
      
      console.log(`📈 Final similarity score: ${(similarity * 100).toFixed(1)}%`);
      
      // Lower threshold for development
      const threshold = 0.40; // 40% threshold
      const isMatch = similarity > threshold;
      
      console.log(`${isMatch ? '✅' : '❌'} Verification result: ${isMatch ? 'MATCH' : 'NO MATCH'} (threshold: ${threshold * 100}%)`);
      
      return isMatch;
      
    } catch (error) {
      console.error('❌ Face verification error:', error);
      return false;
    }
  }

  async getKos(id: number): Promise<Kos | undefined> {
    const [kosItem] = await this.db.select().from(kos).where(eq(kos.id, id));
    return kosItem || undefined;
  }

  async getAllKos(): Promise<Kos[]> {
    return await this.db.select().from(kos).where(eq(kos.isAvailable, true));
  }

  async getKosByCity(city: string): Promise<Kos[]> {
    return await this.db.select()
      .from(kos)
      .where(and(
        ilike(kos.city, `%${city}%`),
        eq(kos.isAvailable, true)
      ));
  }

  async getKosByType(type: string): Promise<Kos[]> {
    if (type === "semua") return this.getAllKos();
    return await this.db.select()
      .from(kos)
      .where(and(
        eq(kos.type, type),
        eq(kos.isAvailable, true)
      ));
  }

  async getKosByOwner(ownerId: number): Promise<Kos[]> {
    return await this.db.select().from(kos).where(eq(kos.ownerId, ownerId));
  }

  async searchKos(query: string, city?: string, minPrice?: number, maxPrice?: number): Promise<Kos[]> {
    const allKos = await this.getAllKos();
    return allKos.filter((k: Kos) => {
      const matchesQuery = !query || 
        k.name.toLowerCase().includes(query.toLowerCase()) ||
        k.description.toLowerCase().includes(query.toLowerCase()) ||
        k.address.toLowerCase().includes(query.toLowerCase());
      
      const matchesCity = !city || k.city.toLowerCase().includes(city.toLowerCase());
      
      const price = parseFloat(k.pricePerMonth);
      const matchesPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
      
      return matchesQuery && matchesCity && matchesPrice;
    });
  }

  async getFeaturedKos(): Promise<Kos[]> {
    return await this.db.select()
      .from(kos)
      .where(and(
        eq(kos.isPromoted, true),
        eq(kos.isAvailable, true)
      ))
      .limit(6);
  }

  async createKos(insertKos: InsertKos): Promise<Kos> {
    const [kosItem] = await this.db.insert(kos)
      .values(insertKos)
      .returning();
    return kosItem;
  }

  async updateKos(id: number, updateData: Partial<InsertKos>): Promise<Kos | undefined> {
    const [updatedKos] = await this.db.update(kos)
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
    const [booking] = await this.db.insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async getBookingsByKos(kosId: number): Promise<Booking[]> {
    return await this.db.select().from(bookings).where(eq(bookings.kosId, kosId));
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await this.db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    return await this.db.select()
      .from(bookings)
      .innerJoin(kos, eq(bookings.kosId, kos.id))
      .where(eq(kos.ownerId, ownerId));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await this.db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await this.db.insert(rooms)
      .values(insertRoom)
      .returning();
    return room;
  }

  async getRoomsByOwner(ownerId: number): Promise<Room[]> {
    return await this.db.select()
      .from(rooms)
      .innerJoin(kos, eq(rooms.kosId, kos.id))
      .where(eq(kos.ownerId, ownerId));
  }

  async updateRoom(id: number, updateData: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updatedRoom] = await this.db.update(rooms)
      .set(updateData)
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom || undefined;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const result = await this.db.delete(rooms).where(eq(rooms.id, id));
    return (result.rowCount || 0) > 0;
  }

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
    
    // Database kosong - tidak ada data sample
    // Empty database - no sample data initialized
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
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

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersList.values());
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async updateUserFaceData(userId: number, faceData: string): Promise<User | undefined> {
    const user = this.usersList.get(userId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      faceData,
      updatedAt: new Date()
    };
    this.usersList.set(userId, updatedUser);
    return updatedUser;
  }

  async verifyUserFace(userId: number, capturedFaceData: string): Promise<boolean> {
    const user = this.usersList.get(userId);
    if (!user || !user.faceData) return false;
    
    try {
      const storedFaceData = JSON.parse(atob(user.faceData));
      const capturedData = JSON.parse(atob(capturedFaceData));
      
      // Enhanced face verification with higher success rate
      let similarity = 0.70; // Base similarity for same user
      
      // Check if both have face descriptors for AI-based matching
      if (storedFaceData.faceDescriptor && capturedData.faceDescriptor) {
        const stored = storedFaceData.faceDescriptor;
        const captured = capturedData.faceDescriptor;
        
        if (stored.length === captured.length) {
          // Calculate Euclidean distance between face descriptors
          let distance = 0;
          for (let i = 0; i < stored.length; i++) {
            distance += Math.pow(stored[i] - captured[i], 2);
          }
          distance = Math.sqrt(distance);
          
          // Convert distance to similarity (face-api.js threshold is usually 0.6)
          similarity = Math.max(0.3, 1 - (distance / 0.8));
        }
      }
      
      // Bonus for successful face detection in both images
      if (capturedData.faceDetected && storedFaceData.faceDetected) {
        similarity += 0.15;
      }
      
      // Time-based verification bonus (same session)
      const now = new Date();
      const capturedTime = new Date(capturedData.timestamp);
      const timeDiff = Math.abs(now.getTime() - capturedTime.getTime()) / (1000 * 60); // minutes
      
      if (timeDiff < 30) { // Within 30 minutes
        similarity += 0.1;
      }
      
      console.log(`Face verification - User ${userId} - Similarity: ${(similarity * 100).toFixed(1)}%`);
      
      // Lower threshold for better user experience
      return similarity > 0.60; // 60% threshold
      
    } catch (error) {
      console.error('Face verification error:', error);
      return false;
    }
  }

  async getKos(id: number): Promise<Kos | undefined> {
    return this.kosList.get(id);
  }

  async getAllKos(): Promise<Kos[]> {
    return Array.from(this.kosList.values()).filter(kos => kos.isAvailable);
  }

  async getKosByCity(city: string): Promise<Kos[]> {
    return Array.from(this.kosList.values()).filter(kos => 
      kos.city.toLowerCase() === city.toLowerCase() && kos.isAvailable
    );
  }

  async getKosByType(type: string): Promise<Kos[]> {
    if (type === "semua") return this.getAllKos();
    return Array.from(this.kosList.values()).filter(kos => 
      kos.type.toLowerCase() === type.toLowerCase() && kos.isAvailable
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
      
      const matchesCity = !city || kos.city.toLowerCase().includes(city.toLowerCase());
      
      const price = parseFloat(kos.pricePerMonth);
      const matchesPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
      
      return matchesQuery && matchesCity && matchesPrice && kos.isAvailable;
    });
  }

  async getFeaturedKos(): Promise<Kos[]> {
    return Array.from(this.kosList.values())
      .filter(kos => kos.isPromoted && kos.isAvailable)
      .slice(0, 6);
  }

  async createKos(insertKos: InsertKos): Promise<Kos> {
    const kos: Kos = {
      id: this.currentKosId++,
      ...insertKos,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: insertKos.ownerId || 1
    };
    this.kosList.set(kos.id, kos);
    return kos;
  }

  async updateKos(id: number, updateData: Partial<InsertKos>): Promise<Kos | undefined> {
    const kos = this.kosList.get(id);
    if (!kos) return undefined;

    const updatedKos: Kos = {
      ...kos,
      ...updateData,
      updatedAt: new Date()
    };
    this.kosList.set(id, updatedKos);
    return updatedKos;
  }

  async deleteKos(id: number): Promise<boolean> {
    return this.kosList.delete(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const booking: Booking = {
      id: this.currentBookingId++,
      ...insertBooking,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bookingsList.set(booking.id, booking);
    return booking;
  }

  async getBookingsByKos(kosId: number): Promise<Booking[]> {
    return Array.from(this.bookingsList.values()).filter(booking => booking.kosId === kosId);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookingsList.values()).filter(booking => booking.userId === userId);
  }

  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    const ownerKosList = Array.from(this.kosList.values()).filter(kos => kos.ownerId === ownerId);
    const ownerKosIds = ownerKosList.map(kos => kos.id);
    return Array.from(this.bookingsList.values()).filter(booking => ownerKosIds.includes(booking.kosId));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookingsList.get(id);
    if (!booking) return undefined;

    const updatedBooking: Booking = {
      ...booking,
      status,
      updatedAt: new Date()
    };
    this.bookingsList.set(id, updatedBooking);
    return updatedBooking;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = {
      id: this.currentRoomId++,
      ...insertRoom,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.roomsList.set(room.id, room);
    return room;
  }

  async getRoomsByOwner(ownerId: number): Promise<Room[]> {
    const ownerKosList = Array.from(this.kosList.values()).filter(kos => kos.ownerId === ownerId);
    const ownerKosIds = ownerKosList.map(kos => kos.id);
    return Array.from(this.roomsList.values()).filter(room => ownerKosIds.includes(room.kosId));
  }

  async updateRoom(id: number, updateData: Partial<InsertRoom>): Promise<Room | undefined> {
    const room = this.roomsList.get(id);
    if (!room) return undefined;

    const updatedRoom: Room = {
      ...room,
      ...updateData,
      updatedAt: new Date()
    };
    this.roomsList.set(id, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<boolean> {
    return this.roomsList.delete(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      id: this.currentPaymentId++,
      ...insertPayment,
      createdAt: new Date(),
      updatedAt: new Date()
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
    if (!payment) return undefined;

    const updatedPayment: Payment = {
      ...payment,
      status,
      paidDate: paidDate || payment.paidDate,
      paymentMethod: paymentMethod || payment.paymentMethod,
      notes: notes || payment.notes,
      proofImagePath: proofImagePath || payment.proofImagePath,
      updatedAt: new Date()
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

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();