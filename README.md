Secure Login with CAPTCHA System
Overview
This is a full-stack web application implementing a secure login system with CAPTCHA verification to prevent automated login attempts. The system uses a React frontend with Shadcn UI components, an Express backend API, and Drizzle ORM for database operations. The application demonstrates security best practices by implementing CAPTCHA protection against bots.

User Preferences
Preferred communication style: Simple, everyday language.

System Architecture
Frontend
Framework: React with TypeScript
UI Components: Shadcn UI component library (based on Radix UI primitives)
Styling: Tailwind CSS
State Management: React Hook Form for form state, React Query for server state
Routing: Wouter (lightweight router)
The frontend is organized with a component-based architecture following modern React patterns. Components are split into feature components and UI components, with the UI components following the Shadcn UI pattern of self-contained, styled components.

Backend
Framework: Express.js with TypeScript
API: RESTful API endpoints
Session Management: Express-session with memory store
CAPTCHA Generation: Server-side CAPTCHA generation using Canvas
The backend follows a RESTful API design pattern with clear separation of concerns between routes, storage logic, and security features.

Database
ORM: Drizzle ORM
Schema: Defined in shared/schema.ts with tables for users and CAPTCHA sessions
Validation: Zod schemas for type validation and data integrity
The database schema is written using Drizzle's schema definition language and is designed to be compatible with PostgreSQL.

Key Components
Frontend Components
LoginForm: Main form component that handles user authentication
CaptchaDisplay: Component for displaying and refreshing CAPTCHA images
UI Components: Set of reusable UI components from Shadcn UI
Backend Components
Express Server: Main server entry point in server/index.ts
Routes: API routes defined in server/routes.ts
Storage: Data storage abstraction in server/storage.ts
CAPTCHA Generation: CAPTCHA utilities in server/captcha.ts
Shared Components
Schema Definitions: Database schema and validation schemas in shared/schema.ts
Data Flow
Login Flow:

User visits the application
Backend generates a CAPTCHA and creates a session
Frontend displays the login form with CAPTCHA
User enters credentials and CAPTCHA solution
Backend verifies credentials and CAPTCHA solution
If valid, user is authenticated and redirected
If invalid, appropriate error messages are displayed
CAPTCHA Verification Flow:

CAPTCHA image is generated server-side using Canvas
CAPTCHA text is stored in session and database
User submits CAPTCHA text with login form
Server verifies CAPTCHA text against stored value
CAPTCHA session tracks attempts and verification status
External Dependencies
Frontend Dependencies
@radix-ui/: UI primitive components
@tanstack/react-query: Data fetching and caching
@hookform/resolvers: Form validation with Zod
class-variance-authority: Component styling utility
clsx: CSS class composition
wouter: Lightweight router
Backend Dependencies
express: Web framework
canvas: CAPTCHA image generation
@neondatabase/serverless: Database connectivity (for PostgreSQL)
drizzle-orm: ORM for database operations
drizzle-zod: Integration between Drizzle and Zod for validation
Deployment Strategy
The application is configured to be deployed on Replit with the following setup:

Development Mode: npm run dev using tsx to run the TypeScript code directly

Production Build:

Frontend: Vite builds the React application to static files
Backend: ESBuild bundles the server code
Combined deployment package stored in the dist directory
Runtime Configuration:

Application expects a DATABASE_URL environment variable
Session secret can be configured via SESSION_SECRET environment variable
Database Migration:

Drizzle handles database schema migrations
npm run db:push applies schema changes to the database
The deployment leverages Replit's capabilities with a configured run button that executes the development server and a proper deployment setup for production use.
