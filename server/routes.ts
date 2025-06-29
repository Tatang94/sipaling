import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
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

  // Get kos by ID
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

  // Search kos
  app.get("/api/kos/search", async (req, res) => {
    try {
      const { q, city, minPrice, maxPrice, type } = req.query;
      
      let kos;
      if (type && type !== "semua") {
        kos = await storage.getKosByType(type as string);
      } else if (city) {
        kos = await storage.getKosByCity(city as string);
      } else {
        const min = minPrice ? parseFloat(minPrice as string) : undefined;
        const max = maxPrice ? parseFloat(maxPrice as string) : undefined;
        kos = await storage.searchKos(q as string || "", city as string, min, max);
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

  const httpServer = createServer(app);
  return httpServer;
}
