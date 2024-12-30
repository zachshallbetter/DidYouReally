import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('resumes').select('count');
    
    if (error) {
      console.error('Database connection error:', error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Database connection check failed:', err);
    return false;
  }
}