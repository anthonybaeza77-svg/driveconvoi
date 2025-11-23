import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ConvoyageRequest {
  id?: string;
  departure_location: string;
  arrival_location: string;
  vehicle_brand: string;
  vehicle_model: string;
  license_plate: string;
  vin_number?: string;
  distance_km: number;
  customer_type: 'professional' | 'individual';
  calculated_price: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  company_name?: string;
  siret_number?: string;
  notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HomepageContent {
  id: string;
  section_key: string;
  content: string;
  created_at: string;
  updated_at: string;
}
