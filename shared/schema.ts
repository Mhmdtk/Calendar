import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Stores events for the calendar
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isAllDay: boolean("is_all_day").default(true),
  // 'gregorian' or 'hijri' - determines how recurrence is calculated
  calendarType: text("calendar_type").notNull().default('gregorian'), 
  // Simple recurrence: 'none', 'annual'. For more complex, we might need full RRULE.
  recurrence: text("recurrence").default('none'),
  color: text("color").default('#2563eb'), // Default blue
  createdAt: timestamp("created_at").defaultNow(),
});

// Stores manual overrides for Hijri months
// This allows the admin to set the exact Gregorian start date for a specific Hijri month/year
export const hijriOverrides = pgTable("hijri_overrides", {
  id: serial("id").primaryKey(),
  hijriYear: integer("hijri_year").notNull(),
  hijriMonth: integer("hijri_month").notNull(), // 1-12
  gregorianDate: timestamp("gregorian_date").notNull(), // The date this Hijri month starts
  createdAt: timestamp("created_at").defaultNow(),
});

// General application settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., 'hijri_adjustment_method'
  value: jsonb("value").notNull(), // Flexible storage for settings
});

// === SCHEMAS ===

// Handle coercion for dates that might come in as strings from JSON bodies
export const insertEventSchema = createInsertSchema(events, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
}).omit({ id: true, createdAt: true });

export const insertHijriOverrideSchema = createInsertSchema(hijriOverrides, {
  gregorianDate: z.coerce.date(),
}).omit({ id: true, createdAt: true });

export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

// === TYPES ===

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type HijriOverride = typeof hijriOverrides.$inferSelect;
export type InsertHijriOverride = z.infer<typeof insertHijriOverrideSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// === API TYPES ===

export type CreateEventRequest = InsertEvent;
export type UpdateEventRequest = Partial<InsertEvent>;

export type CreateHijriOverrideRequest = InsertHijriOverride;
export type UpdateHijriOverrideRequest = Partial<InsertHijriOverride>;
