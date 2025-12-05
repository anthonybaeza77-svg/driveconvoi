-- Création des tables pour l'application de convoyage

-- Table des demandes de convoyage
CREATE TABLE IF NOT EXISTS convoyage_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departure_location text NOT NULL,
  arrival_location text NOT NULL,
  vehicle_model text NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('citadine', 'berline', 'suv', 'utilitaire', 'luxe')),
  distance_km integer NOT NULL CHECK (distance_km > 0),
  calculated_price decimal(10,2) NOT NULL CHECK (calculated_price >= 0),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  company_name text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des articles de blog
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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_convoyage_status ON convoyage_requests(status);
CREATE INDEX IF NOT EXISTS idx_convoyage_created ON convoyage_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);

-- Activer RLS
ALTER TABLE convoyage_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies pour convoyage_requests
DROP POLICY IF EXISTS "Anyone can submit convoyage request" ON convoyage_requests;
CREATE POLICY "Anyone can submit convoyage request"
  ON convoyage_requests FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view convoyage requests" ON convoyage_requests;
CREATE POLICY "Anyone can view convoyage requests"
  ON convoyage_requests FOR SELECT
  TO anon
  USING (true);

-- Policies pour blog_posts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (published = true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_convoyage_requests_updated_at ON convoyage_requests;
CREATE TRIGGER update_convoyage_requests_updated_at
  BEFORE UPDATE ON convoyage_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertion des articles de blog d'exemple
INSERT INTO blog_posts (title, slug, excerpt, content, image_url, published, published_at)
VALUES
(
  'Comment choisir un service de convoyage professionnel',
  'choisir-service-convoyage-professionnel',
  'Découvrez les critères essentiels pour sélectionner un prestataire de convoyage fiable et sécurisé pour vos véhicules.',
  'Le choix d''un service de convoyage professionnel est crucial pour les concessions et agences de location. Voici les points à vérifier : l''assurance tous risques, l''expérience des chauffeurs, la réactivité du service, et la transparence des tarifs. Un bon prestataire doit également proposer un suivi en temps réel et garantir l''état du véhicule à la livraison.',
  'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg',
  true,
  now()
),
(
  'Les avantages du convoyage pour les concessions automobiles',
  'avantages-convoyage-concessions',
  'Pourquoi externaliser le transport de vos véhicules ? Analyse des bénéfices pour votre activité.',
  'Le convoyage professionnel offre de nombreux avantages aux concessions : gain de temps considérable, réduction des coûts de personnel, flexibilité dans la gestion des stocks, et sécurité optimale pour les véhicules. De plus, cela permet à vos équipes de se concentrer sur leur cœur de métier : la vente et le service client.',
  'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg',
  true,
  now() - interval '3 days'
),
(
  'Assurance et sécurité dans le convoyage de véhicules',
  'assurance-securite-convoyage',
  'Tout savoir sur les garanties et protections lors du transport de vos véhicules.',
  'La sécurité est primordiale dans le convoyage. Chaque véhicule doit être couvert par une assurance tous risques pendant tout le trajet. Nos chauffeurs sont formés aux meilleures pratiques de conduite et respectent scrupuleusement le code de la route. Un état des lieux détaillé est effectué au départ et à l''arrivée.',
  'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg',
  true,
  now() - interval '7 days'
),
(
  'Optimiser vos coûts de transport de véhicules',
  'optimiser-couts-transport-vehicules',
  'Stratégies et conseils pour réduire vos dépenses de convoyage tout en maintenant la qualité.',
  'Pour optimiser vos coûts de convoyage, planifiez vos transports à l''avance, regroupez plusieurs véhicules si possible, et établissez un partenariat durable avec un prestataire de confiance. La régularité des commandes permet souvent d''obtenir des tarifs préférentiels.',
  'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg',
  true,
  now() - interval '10 days'
),
(
  'Convoyage de véhicules de luxe : spécificités et précautions',
  'convoyage-vehicules-luxe',
  'Les véhicules haut de gamme nécessitent une attention particulière lors du transport.',
  'Le convoyage de véhicules de luxe demande une expertise spécifique. Nos chauffeurs expérimentés sont formés à la manipulation de ces véhicules d''exception. Protection renforcée, itinéraires optimisés, et suivi GPS en temps réel garantissent une prestation premium adaptée à la valeur de vos véhicules.',
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
  true,
  now() - interval '14 days'
),
(
  'Le convoyage en période hivernale : conseils et préparation',
  'convoyage-periode-hivernale',
  'Comment assurer un transport sécurisé de vos véhicules pendant les mois d''hiver.',
  'L''hiver présente des défis particuliers pour le convoyage. Nos chauffeurs sont équipés et formés pour affronter toutes les conditions météorologiques. Vérifications préalables renforcées, équipements adaptés, et temps de trajet ajustés assurent la sécurité des véhicules même par temps difficile.',
  'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg',
  true,
  now() - interval '18 days'
)
ON CONFLICT (slug) DO NOTHING;
