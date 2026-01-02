import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Events Routes
  app.get(api.events.list.path, async (req, res) => {
    const start = req.query.start ? new Date(String(req.query.start)) : undefined;
    const end = req.query.end ? new Date(String(req.query.end)) : undefined;
    const events = await storage.getEvents(start, end);
    res.json(events);
  });

  app.post(api.events.create.path, async (req, res) => {
    try {
      const input = api.events.create.input.parse(req.body);
      const event = await storage.createEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.events.update.path, async (req, res) => {
    try {
      const input = api.events.update.input.parse(req.body);
      const event = await storage.updateEvent(Number(req.params.id), input);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.events.delete.path, async (req, res) => {
    await storage.deleteEvent(Number(req.params.id));
    res.status(204).end();
  });

  // Hijri Overrides Routes
  app.get(api.hijri.listOverrides.path, async (req, res) => {
    const overrides = await storage.getHijriOverrides();
    res.json(overrides);
  });

  app.post(api.hijri.saveOverride.path, async (req, res) => {
    try {
      const input = api.hijri.saveOverride.input.parse(req.body);
      const override = await storage.saveHijriOverride(input);
      res.json(override);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.hijri.deleteOverride.path, async (req, res) => {
    await storage.deleteHijriOverride(Number(req.params.id));
    res.status(204).end();
  });

  // Settings Routes
  app.get(api.settings.get.path, async (req, res) => {
    const setting = await storage.getSetting(req.params.key);
    if (!setting) return res.status(404).json({ message: "Setting not found" });
    res.json(setting);
  });

  app.post(api.settings.set.path, async (req, res) => {
    const input = api.settings.set.input.parse(req.body);
    const setting = await storage.setSetting(input);
    res.json(setting);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const events = await storage.getEvents();
  if (events.length === 0) {
    const today = new Date();
    await storage.createEvent({
      title: "بداية استخدام التطبيق",
      description: "تم تنصيب تطبيق الرزنامة بنجاح",
      startDate: today,
      endDate: today,
      isAllDay: true,
      calendarType: "gregorian",
      color: "#10b981", // Emerald
      recurrence: "none"
    });
    
    // Add a religious event example (e.g., Eid al-Fitr approximation or just a placeholder)
    // Note: In real app, we would add these dynamically based on Hijri
    await storage.createEvent({
      title: "ذكرى سنوية (مثال هجري)",
      description: "مناسبة تتكرر كل عام هجري",
      startDate: today, // User would pick the hijri date in UI, converted to gregorian here
      isAllDay: true,
      calendarType: "hijri",
      recurrence: "annual",
      color: "#8b5cf6" // Violet
    });
  }
}
