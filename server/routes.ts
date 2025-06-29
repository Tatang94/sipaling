import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

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

  // Get kos by ID (placed after search to avoid route conflicts)
  app.get("/api/kos/:id", async (req, res) => {
    try {
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

  const httpServer = createServer(app);
  return httpServer;
}
