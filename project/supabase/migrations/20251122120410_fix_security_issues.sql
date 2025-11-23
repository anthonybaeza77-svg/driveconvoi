/*
  # Fix Security Issues

  ## Overview
  This migration addresses multiple security concerns:
  1. Removes unused indexes on pricing_rates table
  2. Consolidates multiple permissive policies for blog_posts
  3. Consolidates multiple permissive policies for pricing_rates

  ## Changes

  ### 1. Remove Unused Indexes
  - Drop `idx_pricing_rates_customer_type` - not being used
  - Drop `idx_pricing_rates_active` - not being used

  ### 2. Fix Multiple Permissive Policies on blog_posts
  - Remove redundant policy "Anyone can read published blog posts"
  - Keep "Authenticated users can read all blog posts" which covers both authenticated and anonymous users

  ### 3. Fix Multiple Permissive Policies on pricing_rates
  - Remove redundant policy "Anyone can view active pricing rates"
  - Keep "Authenticated users can view all pricing rates" which covers both authenticated and anonymous users

  ## Security Impact
  - No functionality is lost
  - Policies are consolidated to avoid conflicts
  - Indexes are removed to reduce maintenance overhead
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_pricing_rates_customer_type;
DROP INDEX IF EXISTS idx_pricing_rates_active;

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON blog_posts;

-- Update the authenticated policy to allow public access to published posts
DROP POLICY IF EXISTS "Authenticated users can read all blog posts" ON blog_posts;

CREATE POLICY "Users can read published or all if authenticated"
  ON blog_posts
  FOR SELECT
  USING (
    published = true 
    OR 
    (auth.role() = 'authenticated')
  );

-- Fix pricing_rates policies
DROP POLICY IF EXISTS "Anyone can view active pricing rates" ON pricing_rates;

-- Update the authenticated policy to allow public access to active rates
DROP POLICY IF EXISTS "Authenticated users can view all pricing rates" ON pricing_rates;

CREATE POLICY "Users can view active or all if authenticated"
  ON pricing_rates
  FOR SELECT
  USING (
    is_active = true 
    OR 
    (auth.role() = 'authenticated')
  );
