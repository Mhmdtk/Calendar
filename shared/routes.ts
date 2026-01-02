import { z } from 'zod';
import { insertEventSchema, insertHijriOverrideSchema, insertSettingSchema, events, hijriOverrides, settings } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events',
      input: z.object({
        start: z.string().optional(), // ISO date string
        end: z.string().optional(),   // ISO date string
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events',
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/events/:id',
      input: insertEventSchema.partial(),
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  hijri: {
    listOverrides: {
      method: 'GET' as const,
      path: '/api/hijri/overrides',
      responses: {
        200: z.array(z.custom<typeof hijriOverrides.$inferSelect>()),
      },
    },
    saveOverride: {
      method: 'POST' as const,
      path: '/api/hijri/overrides',
      input: insertHijriOverrideSchema,
      responses: {
        200: z.custom<typeof hijriOverrides.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    deleteOverride: {
      method: 'DELETE' as const,
      path: '/api/hijri/overrides/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings/:key',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    set: {
      method: 'POST' as const,
      path: '/api/settings',
      input: insertSettingSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
