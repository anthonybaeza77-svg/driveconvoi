/*
  # Optimize RLS Policies Performance

  ## Overview
  This migration optimizes Row Level Security policies to prevent re-evaluation of auth functions for each row.
  By wrapping auth functions in SELECT statements, the function is evaluated once per query instead of once per row.

  ## Changes

  ### 1. Optimize blog_posts RLS Policy
  - Replace `auth.role()` with `(select auth.role())`
  - Prevents function re-evaluation for each row
  - Improves query performance at scale

  ### 2. Optimize pricing_rates RLS Policy
  - Replace `auth.role()` with `(select auth.role())`
  - Prevents function re-evaluation for each row
  - Improves query performance at scale

  ## Performance Impact
  - Queries on large tables will execute significantly faster
  - Auth function is evaluated once per query instead of once per row
  - No change in security behavior, only performance optimization
*/

-- Optimize blog_posts policy
DROP POLICY IF EXISTS "Users can read published or all if authenticated" ON blog_posts;

CREATE POLICY "Users can read published or all if authenticated"
  ON blog_posts
  FOR SELECT
  USING (
    published = true 
    OR 
    ((select auth.role()) = 'authenticated')
  );

-- Optimize pricing_rates policy
DROP POLICY IF EXISTS "Users can view active or all if authenticated" ON pricing_rates;

CREATE POLICY "Users can view active or all if authenticated"
  ON pricing_rates
  FOR SELECT
  USING (
    is_active = true 
    OR 
    ((select auth.role()) = 'authenticated')
  );
