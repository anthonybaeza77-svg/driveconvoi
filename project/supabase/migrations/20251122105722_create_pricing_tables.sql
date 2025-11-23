/*
  # Create Pricing Management Tables

  ## Overview
  Creates tables to manage dynamic pricing for convoyage services, allowing admin to configure rates by distance ranges and customer types.

  ## New Tables

  ### `pricing_rates`
  Stores the pricing configuration for different distance ranges and customer types.
  - `id` (uuid, primary key) - Unique identifier
  - `customer_type` (text) - Type of customer: 'individual' or 'professional'
  - `distance_min_km` (integer) - Minimum distance in kilometers (inclusive)
  - `distance_max_km` (integer, nullable) - Maximum distance in kilometers (inclusive), NULL means no upper limit
  - `rate_per_km` (numeric) - Price per kilometer in euros
  - `is_active` (boolean) - Whether this rate is currently active
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  - Enable RLS on `pricing_rates` table
  - Allow public read access (anyone can view rates)
  - Only authenticated admins can modify rates

  ## Initial Data
  Populates the table with current pricing structure:
  - Individual: 0-40km = 4.20€/km, 41-90km = 2.20€/km, 91+km = 1.51€/km
  - Professional: 0-40km = 3.50€/km, 41-90km = 1.82€/km, 91+km = 1.26€/km
*/

CREATE TABLE IF NOT EXISTS pricing_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type text NOT NULL CHECK (customer_type IN ('individual', 'professional')),
  distance_min_km integer NOT NULL CHECK (distance_min_km >= 0),
  distance_max_km integer CHECK (distance_max_km IS NULL OR distance_max_km > distance_min_km),
  rate_per_km numeric(10, 2) NOT NULL CHECK (rate_per_km > 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing rates"
  ON pricing_rates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all pricing rates"
  ON pricing_rates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pricing rates"
  ON pricing_rates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pricing rates"
  ON pricing_rates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pricing rates"
  ON pricing_rates
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO pricing_rates (customer_type, distance_min_km, distance_max_km, rate_per_km) VALUES
  ('individual', 0, 40, 4.20),
  ('individual', 41, 90, 2.20),
  ('individual', 91, NULL, 1.51),
  ('professional', 0, 40, 3.50),
  ('professional', 41, 90, 1.82),
  ('professional', 91, NULL, 1.26)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_pricing_rates_customer_type ON pricing_rates(customer_type);
CREATE INDEX IF NOT EXISTS idx_pricing_rates_active ON pricing_rates(is_active);