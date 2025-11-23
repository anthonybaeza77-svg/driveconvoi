/*
  # Create Admin Authentication and Content Management Tables

  1. New Tables
    - `homepage_content` - Stores editable homepage sections
      - `id` (uuid, primary key)
      - `section_key` (text, unique) - Identifier for the section (e.g., 'hero_title', 'hero_subtitle')
      - `content` (text) - The actual content
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `blog_posts` - Already exists, but we'll ensure it has all needed fields
  
  2. Security
    - Enable RLS on homepage_content table
    - Public can read homepage content
    - Only authenticated users can modify homepage content
    - Public can read published blog posts
    - Only authenticated users can create/update/delete blog posts
*/

CREATE TABLE IF NOT EXISTS homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read homepage content"
  ON homepage_content FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert homepage content"
  ON homepage_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update homepage content"
  ON homepage_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete homepage content"
  ON homepage_content FOR DELETE
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authenticated users can read all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO homepage_content (section_key, content) VALUES
  ('hero_title', 'Service de Convoyage Professionnel'),
  ('hero_subtitle', 'Faites confiance à nos experts pour le transport sécurisé de votre véhicule partout en France'),
  ('hero_cta', 'Demander un devis gratuit')
ON CONFLICT (section_key) DO NOTHING;