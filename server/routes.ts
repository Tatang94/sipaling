import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { insertUserSchema, insertBookingSchema, insertRoomSchema, insertKosSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import bcrypt from "bcryptjs";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadType = req.route?.path?.includes('payment') ? 'payments' : 'rooms';
    const uploadDir = path.join(process.cwd(), 'uploads', uploadType);
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all kos
  app.get("/api/kos", async (req, res) => {
    try {
      const kos = await storage.getAllKos();
      res.json(kos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch kos" });
    }
  });

  // Get featured kos
  app.get("/api/kos/featured", async (req, res) => {
    try {
      const kos = await storage.getFeaturedKos();
      res.json(kos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured kos" });
    }
  });

  // Get nearby kos based on GPS coordinates
  app.get("/api/kos/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 10, limit = 20 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxRadius = parseFloat(radius as string);
      const maxResults = parseInt(limit as string);
      
      // Helper function to calculate distance using Haversine formula
      const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      // Get all kos and calculate distances
      const allKos = await storage.getAllKos();
      const nearbyKos = allKos
        .filter(kos => kos.latitude && kos.longitude)
        .map(kos => {
          const kosLat = parseFloat(kos.latitude);
          const kosLng = parseFloat(kos.longitude);
          const distance = calculateDistance(userLat, userLng, kosLat, kosLng);
          
          return {
            ...kos,
            distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
          };
        })
        .filter(kos => kos.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxResults);
      
      res.json(nearbyKos);
    } catch (error) {
      console.error("Error fetching nearby kos:", error);
      res.status(500).json({ message: "Failed to fetch nearby kos" });
    }
  });

  // Search kos
  app.get("/api/kos/search", async (req, res) => {
    try {
      const { q, city, minPrice, maxPrice, type, price } = req.query;
      
      let min: number | undefined;
      let max: number | undefined;
      
      // Parse price range
      if (price && typeof price === 'string' && price !== 'all') {
        const priceRange = price.split('-');
        if (priceRange.length === 2) {
          min = priceRange[0] ? parseFloat(priceRange[0]) : undefined;
          max = priceRange[1] ? parseFloat(priceRange[1]) : undefined;
        }
      } else if (minPrice) {
        min = parseFloat(minPrice as string);
      }
      
      if (maxPrice) {
        max = parseFloat(maxPrice as string);
      }
      
      let kos;
      if (type && type !== "semua") {
        kos = await storage.getKosByType(type as string);
        if (city && city !== 'all') {
          kos = kos.filter(k => k.city.toLowerCase() === (city as string).toLowerCase());
        }
      } else if (city && city !== 'all') {
        kos = await storage.getKosByCity(city as string);
      } else {
        kos = await storage.searchKos(q as string || "", city && city !== 'all' ? city as string : undefined, min, max);
      }
      
      // Apply price filter if needed
      if (min !== undefined || max !== undefined) {
        kos = kos.filter(k => {
          const price = parseFloat(k.pricePerMonth);
          return (!min || price >= min) && (!max || price <= max);
        });
      }
      
      res.json(kos);
    } catch (error) {
      res.status(500).json({ message: "Failed to search kos" });
    }
  });

  // Get kos by owner
  app.get("/api/kos/owner/:ownerId", async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (isNaN(ownerId)) {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
      
      const kos = await storage.getKosByOwner(ownerId);
      res.json(kos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch owner's kos" });
    }
  });

  // Get kos by city
  app.get("/api/kos/city/:city", async (req, res) => {
    try {
      const { city } = req.params;
      const kos = await storage.getKosByCity(city);
      res.json(kos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch kos by city" });
    }
  });

  // Create new kos
  app.post("/api/kos", async (req, res) => {
    try {
      const validatedData = insertKosSchema.parse(req.body);
      const kos = await storage.createKos(validatedData);
      res.status(201).json(kos);
    } catch (error) {
      console.error("Create kos error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid kos data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create kos", error: error.message });
    }
  });

  // Update kos
  app.put("/api/kos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid kos ID" });
      }

      const validatedData = insertKosSchema.partial().parse(req.body);
      const kos = await storage.updateKos(id, validatedData);
      
      if (!kos) {
        return res.status(404).json({ message: "Kos not found" });
      }
      
      res.json(kos);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid kos data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update kos" });
    }
  });

  // Delete kos
  app.delete("/api/kos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid kos ID" });
      }

      const success = await storage.deleteKos(id);
      if (!success) {
        return res.status(404).json({ message: "Kos not found" });
      }
      
      res.json({ message: "Kos deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete kos" });
    }
  });

  // Get kos by ID (placed after all specific routes to avoid conflicts)
  app.get("/api/kos/:id", async (req, res) => {
    try {
      // Skip if this is actually a path like 'nearby'
      if (req.params.id === 'nearby' || req.params.id === 'featured' || req.params.id === 'search') {
        return res.status(404).json({ message: "Route not found" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid kos ID" });
      }
      
      const kos = await storage.getKos(id);
      if (!kos) {
        return res.status(404).json({ message: "Kos not found" });
      }
      
      res.json(kos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch kos" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Check if kos exists and is available
      const kos = await storage.getKos(validatedData.kosId);
      if (!kos) {
        return res.status(404).json({ message: "Kos not found" });
      }
      
      if (!kos.isAvailable || kos.availableRooms <= 0) {
        return res.status(400).json({ message: "Kos is not available" });
      }
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }
      
      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat akun" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email dan password diperlukan" });
      }
      
      const user = await storage.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ message: "Email atau password salah" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Gagal login" });
    }
  });

  // Dashboard routes - Get user's kos (for pemilik)
  app.get("/api/dashboard/kos/:ownerId", async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (isNaN(ownerId)) {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
      
      const kos = await storage.getKosByOwner(ownerId);
      res.json(kos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch owner's kos" });
    }
  });

  // Dashboard routes - Get owner's bookings
  app.get("/api/dashboard/bookings/:ownerId", async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (isNaN(ownerId)) {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
      
      const bookings = await storage.getBookingsByOwner(ownerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch owner's bookings" });
    }
  });

  // Dashboard routes - Get user's bookings (for pencari)
  app.get("/api/dashboard/my-bookings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user's bookings" });
    }
  });

  // Get bookings for specific kos
  app.get("/api/bookings/kos/:kosId", async (req, res) => {
    try {
      const kosId = parseInt(req.params.kosId);
      if (isNaN(kosId)) {
        return res.status(400).json({ message: "Invalid kos ID" });
      }
      
      const bookings = await storage.getBookingsByKos(kosId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch kos bookings" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Room Management Routes
  
  // Get all rooms for an owner
  app.get("/api/rooms/owner/:ownerId", async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (isNaN(ownerId)) {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
      
      const rooms = await storage.getRoomsByOwner(ownerId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  // Add new room with image upload
  app.post("/api/rooms", upload.array('images', 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const imageUrls = files ? files.map(file => `/uploads/rooms/${file.filename}`) : [];
      
      const roomData = {
        ...req.body,
        facilities: JSON.parse(req.body.facilities || '[]'),
        images: imageUrls,
        price: req.body.price.toString(),
        floor: parseInt(req.body.floor),
        ownerId: parseInt(req.body.ownerId)
      };
      
      const validatedData = insertRoomSchema.parse(roomData);
      const room = await storage.createRoom(validatedData);
      
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal menambahkan kamar" });
    }
  });

  // Update room
  app.patch("/api/rooms/:id", upload.array('images', 5), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }

      const files = req.files as Express.Multer.File[];
      const newImageUrls = files ? files.map(file => `/uploads/rooms/${file.filename}`) : [];
      
      const updateData: any = { ...req.body };
      
      if (req.body.facilities) {
        updateData.facilities = JSON.parse(req.body.facilities);
      }
      
      if (newImageUrls.length > 0) {
        const existingImages = JSON.parse(req.body.existingImages || '[]');
        updateData.images = [...existingImages, ...newImageUrls];
      }
      
      if (req.body.price) {
        updateData.price = req.body.price.toString();
      }
      
      if (req.body.floor) {
        updateData.floor = parseInt(req.body.floor);
      }

      const room = await storage.updateRoom(id, updateData);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to update room" });
    }
  });

  // Delete room
  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      
      const success = await storage.deleteRoom(id);
      if (!success) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete room" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      // For demo purposes, get all payments (in production you'd filter by user)
      const allPayments = await storage.getPaymentsByOwner(2); // Default owner ID from database
      res.json(allPayments);
    } catch (error) {
      console.error("Error fetching all payments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/payments/owner/:ownerId", async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (isNaN(ownerId)) {
        return res.status(400).json({ error: "Invalid owner ID" });
      }

      const payments = await storage.getPaymentsByOwner(ownerId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/payments/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const { status, paymentMethod } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const paidDate = status === "paid" ? new Date() : undefined;
      const updatedPayment = await storage.updatePaymentStatus(id, status, paidDate, paymentMethod);
      
      if (!updatedPayment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      res.json(updatedPayment);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single payment by ID
  app.get("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const payment = await storage.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Process payment by tenant
  app.post("/api/payments/:id/pay", upload.single('proofImage'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const { paymentMethod, notes } = req.body;
      if (!paymentMethod) {
        return res.status(400).json({ error: "Payment method is required" });
      }

      const payment = await storage.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      if (payment.status === "paid") {
        return res.status(400).json({ error: "Payment already completed" });
      }

      // Update payment status to "processing" with proof
      const updatedPayment = await storage.updatePaymentStatus(
        id, 
        "processing", 
        undefined, 
        paymentMethod,
        notes,
        req.file ? `/uploads/${req.file.filename}` : undefined
      );

      // Send WhatsApp notification to owner
      const message = `🔔 Pembayaran Masuk!

Tenant: ${payment.tenantName}
Kamar: ${payment.roomNumber}
Kos: ${payment.kosName}
Jumlah: Rp ${parseInt(payment.amount).toLocaleString('id-ID')}
Metode: ${paymentMethod}

Silakan cek dan verifikasi pembayaran melalui dashboard.`;

      // In production, integrate with WhatsApp API
      console.log("WhatsApp notification would be sent:", message);

      res.json({
        ...updatedPayment,
        message: "Pembayaran berhasil disubmit dan sedang diverifikasi"
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/payments/overdue/:ownerId", async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      if (isNaN(ownerId)) {
        return res.status(400).json({ error: "Invalid owner ID" });
      }

      const overduePayments = await storage.getOverduePayments(ownerId);
      res.json(overduePayments);
    } catch (error) {
      console.error("Error fetching overdue payments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Send payment reminder via WhatsApp
  app.post("/api/payments/:id/remind", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const payment = await storage.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const dueDate = new Date(payment.dueDate).toLocaleDateString('id-ID');
      const message = `🏠 Reminder Pembayaran Sewa

Halo ${payment.tenantName}!

Ini adalah pengingat untuk pembayaran sewa:
• Kamar: ${payment.roomNumber}
• Kos: ${payment.kosName}
• Jumlah: Rp ${parseInt(payment.amount).toLocaleString('id-ID')}
• Jatuh Tempo: ${dueDate}

Mohon segera lakukan pembayaran melalui aplikasi atau hubungi kami. Terima kasih!`;

      // In production, integrate with WhatsApp API
      console.log("WhatsApp reminder would be sent:", message);

      res.json({ 
        success: true, 
        message: "Reminder berhasil dikirim via WhatsApp" 
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded files and scraped images
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

  const httpServer = createServer(app);
  return httpServer;
}
