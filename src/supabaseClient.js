import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzlpfvcdmnotoxgmomkf.supabase.co/rest/v1/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bHBmdmNkbW5vdG94Z21vbWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMzcyOTAsImV4cCI6MjEwMzcxMzI5MH0.IHj-aYK4tycu75bmfGtxsc3Vj9B-BQLPHs9gEfNB76s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);