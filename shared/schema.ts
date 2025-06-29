import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  kosId: integer("kos_id").references(() => kos.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email").notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.string().default("pending"),
  notes: z.string().nullable().optional(),
});

// Relations
export const kosRelations = relations(kos, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  kos: one(kos, {
    fields: [bookings.kosId],
    references: [kos.id],
  }),
}));

export type InsertKos = z.infer<typeof insertKosSchema>;
export type Kos = typeof kos.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
