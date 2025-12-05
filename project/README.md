# DriveConvoi

Site web professionnel pour service de convoyage automobile.

## Technologies

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (Base de données + Auth)
- Google Maps API

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à la racine avec :

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_supabase
VITE_GOOGLE_MAPS_API_KEY=votre_clé_google_maps
```

## Base de données

Exécuter les migrations dans l'ordre depuis le dossier `supabase/migrations/`

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Déploiement

Le site est configuré pour Netlify. Le fichier `netlify.toml` contient la configuration.

Déposer le dossier `dist` sur Netlify ou connecter le repository GitHub.
