import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("pencari"), // "pencari" or "pemilik"
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kos = pgTable("kos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  pricePerMonth: decimal("price_per_month", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "putra", "putri", "campur"
  availableRooms: integer("available_rooms").notNull(),
  totalRooms: integer("total_rooms").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  facilities: text("facilities").array().notNull(),
  images: text("images").array().notNull(),
  ownerName: text("owner_name").notNull(),
  ownerPhone: text("owner_phone").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isAvailable: boolean("is_available").notNull().default(true),
  isPromoted: boolean("is_promoted").notNull().default(false),
  roomSize: text("room_size"),
  paymentType: text("payment_type").notNull().default("monthly"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  kosName: text("kos_name").notNull(),
  type: text("type").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  size: text("size").notNull(),
  floor: integer("floor").notNull(),
  description: text("description"),
  facilities: text("facilities").array().notNull(),
  images: text("images").array().notNull().default([]),
  isOccupied: boolean("is_occupied").notNull().default(false),
  tenantName: text("tenant_name"),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  kosId: integer("kos_id").references(() => kos.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email").notNull(),
  userId: integer("user_id").references(() => users.id),
  checkInDate: timestamp("check_in_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  role: z.enum(["pencari", "pemilik"]).default("pencari"),
  phone: z.string().optional(),
});

export const insertKosSchema = createInsertSchema(kos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  reviewCount: z.number().default(0),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  roomSize: z.string().nullable().optional(),
  paymentType: z.string().default("monthly"),
  isAvailable: z.boolean().default(true),
  isPromoted: z.boolean().default(false),
  ownerId: z.number().optional(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  price: z.string().transform((val) => val),
  isOccupied: z.boolean().default(false),
  tenantName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.string().default("pending"),
  notes: z.string().nullable().optional(),
  userId: z.number().optional(),
  checkInDate: z.string().transform((val) => new Date(val)),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedKos: many(kos, { relationName: "ownerKos" }),
  ownedRooms: many(rooms, { relationName: "ownerRooms" }),
  bookings: many(bookings),
}));

export const kosRelations = relations(kos, ({ many, one }) => ({
  bookings: many(bookings),
  owner: one(users, {
    fields: [kos.ownerId],
    references: [users.id],
    relationName: "ownerKos",
  }),
}));

export const roomsRelations = relations(rooms, ({ one }) => ({
  owner: one(users, {
    fields: [rooms.ownerId],
    references: [users.id],
    relationName: "ownerRooms",
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  kos: one(kos, {
    fields: [bookings.kosId],
    references: [kos.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertKos = z.infer<typeof insertKosSchema>;
export type Kos = typeof kos.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
