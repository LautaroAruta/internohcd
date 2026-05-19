import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvweiyfjruviqozqkwck.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2d2VpeWZqcnV2aXFvenFrd2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzMzODUsImV4cCI6MjA4ODc0OTM4NX0.L1dM57pNKHUSNYRW3UIE1VHTCzRMjHYOctrLoAI4yKQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
