/*
  # Create Convoyage Requests Table

  1. New Tables
    - `convoyage_requests`
      - `id` (uuid, primary key)
      - `departure_location` (text) - Adresse de départ complète
      - `arrival_location` (text) - Adresse d'arrivée complète
      - `vehicle_model` (text) - Modèle du véhicule
      - `distance_km` (integer) - Distance calculée en km
      - `pricing_option` (text) - Option de tarification choisie
      - `calculated_price` (decimal) - Prix calculé en euros
      - `client_name` (text) - Nom du client
      - `client_email` (text) - Email du client
      - `client_phone` (text) - Téléphone du client
      - `company_name` (text, optional) - Nom de l'entreprise
      - `notes` (text, optional) - Notes additionnelles
      - `status` (text) - Statut de la demande
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Pricing Options
    - driver_only: 1.30€/km TTC (chauffeur uniquement, frais supplémentaires à prévoir)
    - all_inclusive: 1.50€/km TTC (tout inclus: chauffeur, carburant, péages)

  3. Security
    - Enable RLS on `convoyage_requests` table
    - Add policy for public to insert requests
    - Add policy for authenticated users to view all requests
*/

CREATE TABLE IF NOT EXISTS convoyage_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departure_location text NOT NULL,
  arrival_location text NOT NULL,
  vehicle_model text NOT NULL,
  distance_km integer NOT NULL CHECK (distance_km > 0),
  pricing_option text NOT NULL CHECK (pricing_option IN ('driver_only', 'all_inclusive')),
  calculated_price decimal(10, 2) NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  company_name text,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE convoyage_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a convoyage request"
  ON convoyage_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all requests"
  ON convoyage_requests
  FOR SELECT
  TO authenticated
  USING (true);
