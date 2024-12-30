# DidYouReally

A scalable system for tracking resume interactions using **Supabase** and **Vercel**. This project automates tracking when resumes are opened, logs viewer details, and provides a management dashboard to analyze interactions.

## Database Schema

The application uses a robust schema management system with the following key components:

### Tables

1. **Resumes**
   - Tracks resume details and metadata
   - Includes fields for job title, company, tracking URL
   - Supports archiving and version control
   - Tracks performance metrics (views, locations, duration)

2. **Tracking Logs**
   - Records each resume view
   - Captures device, browser, and location data
   - Includes engagement metrics and bot detection
   - Implements data retention policies

3. **User Preferences**
   - Stores user-specific settings
   - Manages theme preferences
   - Controls notification settings
   - Customizes dashboard layout

4. **Application Tracking**
   - Monitors application status
   - Records company interactions
   - Tracks interview progress
   - Stores application notes and next steps

### Schema Management

The project includes a complete schema management system:

1. **Central Schema Definition** (`src/lib/schema/index.ts`)
   - Defines all tables, columns, and relationships
   - Uses TypeScript and Zod for type safety
   - Includes enums and validation rules

2. **Migration Generator** (`src/lib/schema/generate-migration.ts`)
   - Generates SQL for creating new tables
   - Generates SQL for altering existing tables
   - Handles indexes and triggers
   - Preserves existing data

3. **Migration Scripts**
   ```bash
   npm run migration:generate     # Create new full schema migration
   npm run migration:generate:alter # Create migration for schema changes
   ```

## Features

- Real-time resume tracking
- Detailed analytics dashboard
- Location and device tracking
- Bot detection
- Data retention policies
- Customizable notifications
- Theme support (light/dark/system)
- Application status tracking
- Performance insights
- Best practices recommendations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Generate and apply database migrations:
   ```bash
   npm run migration:generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run type-check` - Run TypeScript checks

## Tech Stack

- Next.js 15
- TypeScript
- Supabase
- Tailwind CSS
- Shadcn UI
- Chart.js
- React Hook Form
- Zod
- Vercel AI
- Vercel Edge Functions

## License

This project is licensed under the MIT License - see the LICENSE file for details.
