/*
  # Update Vehicle Fields Structure

  1. Changes
    - Add `vehicle_brand` column to store vehicle brand/make (required)
    - Add `license_plate` column to store vehicle registration number (required)
    - Add `vin_number` column to store Vehicle Identification Number (optional)
    - Keep existing `vehicle_model` column for model name
    - Remove previously added optional vehicle fields that are no longer needed
  
  2. Notes
    - vehicle_brand, vehicle_model, and license_plate are required fields
    - vin_number is optional
    - This replaces the automatic API identification with manual entry
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'vehicle_brand'
  ) THEN
    ALTER TABLE convoyage_requests ADD COLUMN vehicle_brand text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'license_plate'
  ) THEN
    ALTER TABLE convoyage_requests ADD COLUMN license_plate text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'vin_number'
  ) THEN
    ALTER TABLE convoyage_requests ADD COLUMN vin_number text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'vehicle_year'
  ) THEN
    ALTER TABLE convoyage_requests DROP COLUMN vehicle_year;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'vehicle_fuel'
  ) THEN
    ALTER TABLE convoyage_requests DROP COLUMN vehicle_fuel;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'vehicle_power'
  ) THEN
    ALTER TABLE convoyage_requests DROP COLUMN vehicle_power;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'convoyage_requests' AND column_name = 'vehicle_color'
  ) THEN
    ALTER TABLE convoyage_requests DROP COLUMN vehicle_color;
  END IF;
END $$;