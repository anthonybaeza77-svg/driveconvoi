/*
  # Update Convoyage Requests - Customer Types

  1. Changes
    - Remove pricing_option column (no longer needed)
    - Add customer_type column to differentiate professionals and individuals
    - Add siret_number column for professional customers
  
  2. Customer Types
    - professional: 1.26€/km TTC (requires SIRET number)
    - individual: 1.51€/km TTC (no SIRET required)
  
  3. Notes
    - SIRET number is required for professional customers
    - Company name is now optional for both types
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'pricing_option'
  ) THEN
    ALTER TABLE convoyage_requests DROP COLUMN pricing_option;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'customer_type'
  ) THEN
    ALTER TABLE convoyage_requests 
    ADD COLUMN customer_type text NOT NULL CHECK (customer_type IN ('professional', 'individual')) DEFAULT 'individual';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'siret_number'
  ) THEN
    ALTER TABLE convoyage_requests 
    ADD COLUMN siret_number text;
  END IF;
END $$;
