# Events Calendar

## Overview

A bilingual (Arabic-focused) events calendar application that displays religious and national occasions using both Gregorian and Hijri (Islamic) calendar systems. The application allows users to manage events, configure Hijri date overrides for moon sighting accuracy, and export calendars to PDF.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Animations**: Framer Motion for smooth transitions
- **RTL Support**: Full right-to-left layout with Arabic fonts (Cairo, Tajawal)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints defined in shared routes contract
- **Validation**: Zod schemas for request/response validation
- **Build System**: Custom esbuild script for production bundling, Vite for development

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (connection via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema migrations (`npm run db:push`)

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod validation schemas
- `routes.ts`: API contract definitions with typed inputs/outputs

### Key Data Models
1. **Events**: Calendar events with support for Gregorian or Hijri date types, optional recurrence
2. **Hijri Overrides**: Manual corrections for Hijri month start dates based on moon sighting
3. **Settings**: Key-value store for application configuration

### Hijri Calendar Implementation
- Uses `moment-hijri` library for Hijri date calculations
- Supports manual overrides to adjust for local moon sighting differences
- Events can be marked as Gregorian or Hijri type to determine recurrence calculation

## External Dependencies

### Database
- PostgreSQL database (required)
- Connection configured via `DATABASE_URL` environment variable
- Session storage uses `connect-pg-simple` for PostgreSQL-backed sessions

### Third-Party Libraries
- **PDF Generation**: jsPDF with jspdf-autotable for table formatting
- **DOM Capture**: html2canvas for capturing calendar views
- **Date Handling**: date-fns, date-fns-tz for Gregorian dates; moment-hijri for Islamic calendar
- **Icons**: Lucide React icon set

### Development Tools
- Vite dev server with HMR
- Replit-specific plugins for development (cartographer, dev-banner, error overlay)