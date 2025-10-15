import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Bet {
  id: string;
  user_id: string;
  event: string;
  category: string;
  odd: number;
  stake: number;
  result: 'win' | 'loss' | 'pending';
  profit: number;
  bet_date: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  is_admin: boolean;
  trial_ends_at: string;
  created_at: string;
  updated_at: string;
}
