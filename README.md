# DidYouReally - Resume Tracking System

A scalable system for tracking resume interactions using **Prisma**, **Supabase**, and **Vercel**. This project automates tracking when resumes are opened, logs viewer details, and provides a management dashboard to analyze interactions.

## Prerequisites

- Node.js 18+
- npm (no yarn or pnpm)
- PostgreSQL (via Supabase)
- Supabase CLI (temporary)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/didyoureally.git
   cd didyoureally
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Update the environment variables in `.env.local`

4. **Database Setup**
   ```bash
   # Start Supabase (temporary)
   npm run supabase:start

   # Initialize Prisma
   npm run prisma:generate
   npm run prisma:migrate

   # Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Management

### Prisma Commands
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:deploy` - Deploy migrations
- `npm run prisma:studio` - Open Prisma Studio

### Supabase Commands (Legacy)
- `npm run supabase:start` - Start Supabase
- `npm run supabase:stop` - Stop Supabase

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/             # Utilities and configurations
│   ├── prisma.ts    # Prisma client
│   └── supabase.ts  # Supabase client (legacy)
└── types/           # TypeScript types
```

## Features

- Resume tracking and analytics
- Real-time view statistics
- Automated data cleanup
- Type-safe database operations
- Role-based access control
- Performance monitoring

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Database**: PostgreSQL, Prisma
- **Authentication**: Supabase Auth (temporary)
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
