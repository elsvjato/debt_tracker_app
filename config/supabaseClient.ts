import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpafgqkrdkjocsbkmpue.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYWZncWtyZGtqb2NzYmttcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Nzk5MjAsImV4cCI6MjA2NjQ1NTkyMH0.Y5fdXdRhq4IbzrK_kuMUeowjSnz1w9w0Ob82J4ThQtY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
}); 