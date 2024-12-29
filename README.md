# Resume Tracking System

A scalable system for tracking resume interactions using **Supabase** and **Next.js**. This project automates tracking when resumes are opened, logs viewer details, and provides a management dashboard to analyze interactions.

## Features

- 📊 Real-time tracking of resume views
- 📈 Analytics dashboard
- 🔒 Secure tracking implementation
- 📱 Responsive design
- 🚀 Built with modern technologies

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Vercel account (optional for deployment)

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/zachshallbetter/DidYouReally.git
   cd DidYouReally
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials in `.env.local`

4. **Set up Supabase database**
   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Table to store resume metadata
   create table resumes (
     id uuid primary key default uuid_generate_v4(),
     job_title text,
     company text,
     tracking_url text,
     created_at timestamp default now()
   );

   -- Table to store tracking logs
   create table tracking_logs (
     id uuid primary key default uuid_generate_v4(),
     resume_id uuid references resumes(id),
     ip_address text,
     user_agent text,
     timestamp timestamp default now()
   );
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

## Usage

1. **Upload Resume Details**

   ```bash
   curl -X POST http://localhost:3000/api/upload \
     -H "Content-Type: application/json" \
     -d '{"job_title":"Software Engineer","company":"Example Corp","tracking_url":"unique-identifier"}'
   ```

2. **Track Resume Views**
   Add a tracking pixel to your resume:

   ```html
   <img src="http://localhost:3000/api/track?unique_id=unique-identifier" style="display: none" alt="" />
   ```

3. **View Analytics**
   Visit the dashboard at `http://localhost:3000/dashboard`

## Deployment

1. **Deploy to Vercel**

   ```bash
   vercel
   ```

2. **Configure Environment Variables**
   Add your Supabase credentials to your Vercel project settings.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.