import { createClient } from '@supabase/supabase-js';

// Vault Business Engine - Supabase
const SUPABASE_URL = 'https://czyzohfllffpgctslbwk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXpvaGZsbGZmcGdjdHNsYndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjU4MzEsImV4cCI6MjA4MzIwMTgzMX0.N1HiX0zrhikFletxPh7o_hXFkkeMtOPIWVkZUR50I1U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export { SUPABASE_URL, SUPABASE_ANON_KEY };
