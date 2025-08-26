# MediClinic Pro - Système de Gestion Clinique

## Overview

MediClinic Pro is a comprehensive web-based clinic management system designed to digitize and streamline healthcare operations. The application handles patient management, appointments, consultations, pharmacy operations, billing, insurance processing, cashier functions, commissions, expenses, and reporting. Built with modern web technologies, it provides role-based access control for different healthcare professionals including supervisors, doctors, secretaries, pharmacists, cashiers, accountants, and external practitioners.

The system aims to automate insurance rules application, maintain precise inventory tracking, enable activity monitoring through reliable reports, and secure access through role-based permissions with complete operation tracing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a Single Page Application (SPA) using React 18 with TypeScript. The application leverages Vite as the build tool and development server for fast hot module replacement and optimized builds. The UI is constructed using shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface components.

The routing is handled by Wouter, a minimalist router that provides client-side navigation. State management relies on TanStack Query (React Query) for server state management, caching, and synchronization, eliminating the need for complex global state management solutions.

### Backend Architecture  
The backend follows a Node.js/Express.js architecture serving both API endpoints and static assets. The server implements session-based authentication using express-session with configurable session storage. API routes are organized in a RESTful pattern with proper HTTP methods and status codes.

The application uses a middleware-first approach for request processing, including authentication checks, request logging, and error handling. The server can run in both development mode with Vite integration and production mode serving pre-built static assets.

### Data Layer
Database operations are handled through Drizzle ORM, providing type-safe database interactions with PostgreSQL. The schema is defined using Drizzle's schema definition syntax with proper relations between entities. Database migrations are managed through Drizzle Kit with configuration for PostgreSQL dialect.

The data layer includes comprehensive entity modeling for patients, appointments, consultations, medications, invoices, payments, insurance, and audit logging. All database operations maintain referential integrity through foreign key relationships and support CRUD operations with appropriate validation.

### Authentication & Authorization
The system implements session-based authentication with role-based access control. User roles include superviseur, medecin, secretaire, pharmacien, caissier, comptable, and intervenant, each with specific permissions and access levels.

Authentication state is managed on both client and server sides, with automatic session validation and protected routes. The frontend auth hook provides reactive authentication state and handles login/logout operations with proper error handling.

### Component Architecture
The UI follows a component-based architecture with reusable form components, layout components, and feature-specific components. Forms are built using React Hook Form with Zod validation schemas for type-safe form handling and validation.

The component structure separates concerns between presentation components, business logic components, and data fetching components. Each major feature (patients, consultations, pharmacy, etc.) has its own component directory with associated forms and specialized components.

### Styling System
The application uses Tailwind CSS for utility-first styling with a custom design system. CSS variables are used for theming support with predefined color schemes and design tokens. The styling system supports responsive design patterns and consistent spacing/typography scales.

Custom CSS properties enable theme switching and design consistency across components. The build system includes PostCSS for CSS processing and optimization.

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database client with schema management and migrations

### UI Framework
- **React 18**: Frontend framework with hooks and concurrent features
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Low-level UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for styling

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking for JavaScript
- **ESBuild**: Fast JavaScript bundler for production builds

### State Management
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation library for forms and API data

### Authentication
- **express-session**: Session management for user authentication  
- **bcryptjs**: Password hashing and comparison utilities

### Runtime Environment
- **Node.js**: JavaScript runtime for backend services
- **Express.js**: Web application framework for API and static serving

### Additional Libraries
- **Wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional CSS class name utility
- **Lucide React**: Icon library for consistent iconography