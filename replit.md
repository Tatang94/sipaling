# Replit.md

## Overview
This is a modern full-stack web application for a kos (boarding house) rental platform called "KosKu". The application allows users to search, browse, and book kos accommodations across Indonesia. It features a React-based frontend with a Node.js/Express backend, using PostgreSQL for data storage and shadcn/ui for the component library.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for request/response validation

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Tables**: 
  - `kos` - Main accommodation listings
  - `bookings` - User booking records

## Key Components

### Data Layer
- **Drizzle ORM**: Type-safe database queries and schema definitions
- **Schema**: Centralized in `shared/schema.ts` with Zod validation schemas and relations
- **Storage Interface**: Abstract storage interface in `server/storage.ts` with PostgreSQL implementation
- **Database**: PostgreSQL with proper relations between kos and bookings tables

### Frontend Features
- **Home Page**: Hero section, featured listings, popular cities, promotional content
- **Search Page**: Advanced filtering by location, price, type, and amenities
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: shadcn/ui components for consistent UI
- **Toast Notifications**: User feedback for actions

### Backend Features
- **REST API**: CRUD operations for kos listings and bookings
- **Search Functionality**: Query-based search with filters
- **Error Handling**: Centralized error handling middleware
- **Development Logging**: Request/response logging for API endpoints

## Data Flow

### Client-Server Communication
1. Frontend makes HTTP requests to `/api/*` endpoints
2. Express server processes requests through route handlers
3. Storage layer (PostgreSQL with Drizzle ORM) handles data operations
4. Responses are formatted and sent back to the client
5. TanStack Query manages caching and state synchronization

### Search Flow
1. User inputs search criteria on frontend
2. Query parameters are constructed and sent to `/api/kos/search`
3. Backend filters data based on criteria (location, price, type)
4. Results are returned and displayed with filtering options

### Booking Flow
1. User selects a kos and clicks book
2. Toast notification shows owner contact information
3. Future implementation will handle booking creation via `/api/bookings`

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **@radix-ui**: Accessible UI primitives (via shadcn/ui)
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management

### Backend Dependencies
- **express**: Web application framework
- **drizzle-orm**: Type-safe ORM
- **@neondatabase/serverless**: PostgreSQL driver for Neon
- **zod**: Schema validation
- **tsx**: TypeScript execution for development

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: CSS framework
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Development Setup
- **Dev Server**: Vite dev server proxies API requests to Express
- **Hot Reload**: Both frontend and backend support hot reloading
- **Database**: Uses environment variable `DATABASE_URL` for connection

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production
- **Database**: PostgreSQL connection via environment variables

### Environment Configuration
- Development: `NODE_ENV=development` with local database
- Production: `NODE_ENV=production` with external database
- Database URL required via `DATABASE_URL` environment variable

## Changelog
- June 29, 2025: Initial setup with React frontend and in-memory storage
- June 29, 2025: Added PostgreSQL database integration with Drizzle ORM
- June 29, 2025: Migrated from MemStorage to DatabaseStorage implementation
- June 29, 2025: Successfully seeded database with sample kos data
- June 30, 2025: Added complete authentication system with login/register pages
- June 30, 2025: Implemented splash screen with "SI PALING KOST" branding
- June 30, 2025: Created onboarding flow with role selection (Pencari Kos/Pemilik Kos)
- June 30, 2025: Added comprehensive help/bantuan page with FAQ and contact info
- June 30, 2025: Fixed API routing conflicts between search and ID endpoints
- June 30, 2025: Completed migration to Replit with full authentication system
- June 30, 2025: Implemented user registration with role-based access (pencari/pemilik)
- June 30, 2025: Created dashboard for pemilik kos to manage properties and bookings
- June 30, 2025: Added dashboard for pencari kos to view booking history
- June 30, 2025: Implemented proper Rupiah currency formatting (IDR)
- June 30, 2025: Successfully migrated from Replit Agent to Replit environment
- June 30, 2025: Redesigned dashboard with modern UI/UX using teal-blue theme
- June 30, 2025: Added comprehensive sidebar navigation and statistics dashboard
- June 30, 2025: Implemented tenant management, room management, and payment tracking
- June 30, 2025: Created professional dashboard components with real-time data
- June 30, 2025: Fixed Vercel deployment configuration and resolved build output directory issues
- June 30, 2025: Finalized deployment setup with proper build command and output to dist/public
- June 30, 2025: Successfully migrated from Replit Agent to Replit environment
- June 30, 2025: Fixed routing to show home page instead of dashboard on root path
- June 30, 2025: Changed logo from "KosKu" to "SI PALING KOST" and made it clickable to splash screen
- June 30, 2025: Set up PostgreSQL database with proper schema and seeded sample data
- June 30, 2025: Optimized splash screen design with better proportions and 15-second duration
- June 30, 2025: Replaced Google and Facebook login with WhatsApp verification system
- June 30, 2025: Added WhatsApp verification modal with 6-digit code authentication
- June 30, 2025: Implemented functional "Book Now" buttons with login validation and booking system
- June 30, 2025: Redesigned dashboard with mobile-first responsive design for smartphone compatibility
- June 30, 2025: Created separate dashboard views for pencari kos and pemilik kos with appropriate features
- June 30, 2025: Added booking management system using localStorage for demo purposes
- June 30, 2025: Replaced "Beranda" button with "Profil" button in navigation
- June 30, 2025: Created comprehensive profile page with photo upload, email/password/WhatsApp editing
- June 30, 2025: Implemented profile photo management with 2MB file size limit and preview functionality

## User Preferences
Preferred communication style: Simple, everyday language.
Brand name: "SI PALING KOST" (not "Mamikos")
Design theme: Green and white color scheme
Language: 100% Indonesian interface