import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client with types based on schema
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'didyoureally'
      }
    }
  }
);

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Database connection error:', error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to check database connection:', err);
    return false;
  }
}

// Initialize database connection
export async function initializeDatabase() {
  let retries = 3;
  while (retries > 0) {
    const isConnected = await checkDatabaseConnection();
    if (isConnected) {
      console.log('Database connected successfully');
      return true;
    }
    console.log(`Database connection failed, retrying... (${retries} attempts left)`);
    retries--;
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
  }
  throw new Error('Failed to connect to database after multiple attempts');
}