import { db } from "./db";
import {
  events,
  hijriOverrides,
  settings,
  type InsertEvent,
  type InsertHijriOverride,
  type InsertSetting,
  type Event,
  type HijriOverride,
  type Setting
} from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Events
  getEvents(start?: Date, end?: Date): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Hijri Overrides
  getHijriOverrides(): Promise<HijriOverride[]>;
  saveHijriOverride(override: InsertHijriOverride): Promise<HijriOverride>;
  deleteHijriOverride(id: number): Promise<void>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // Events
  async getEvents(start?: Date, end?: Date): Promise<Event[]> {
    if (start && end) {
      return await db
        .select()
        .from(events)
        .where(and(gte(events.startDate, start), lte(events.startDate, end)));
    }
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event> {
    const [updated] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Hijri Overrides
  async getHijriOverrides(): Promise<HijriOverride[]> {
    return await db.select().from(hijriOverrides);
  }

  async saveHijriOverride(override: InsertHijriOverride): Promise<HijriOverride> {
    // Check if exists for this month/year to update, or insert new
    const existing = await db.select().from(hijriOverrides).where(
      and(
        eq(hijriOverrides.hijriYear, override.hijriYear),
        eq(hijriOverrides.hijriMonth, override.hijriMonth)
      )
    );

    if (existing.length > 0) {
      const [updated] = await db
        .update(hijriOverrides)
        .set(override)
        .where(eq(hijriOverrides.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(hijriOverrides).values(override).returning();
    return created;
  }

  async deleteHijriOverride(id: number): Promise<void> {
    await db.delete(hijriOverrides).where(eq(hijriOverrides.id, id));
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async setSetting(setting: InsertSetting): Promise<Setting> {
    const [created] = await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: setting.value },
      })
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
