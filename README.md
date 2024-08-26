# Backend d'Enregistrement d'Entreprises

Backend de l'application d'Enregistrement d'Entreprises, construit avec AdonisJS.

## Prérequis

- Docker et Docker Compose
- Node.js (v14 ou supérieur)
- npm ou yarn

## Lancement rapide

1. Clonez le dépôt :
   ```
   git clone <url-du-repo-backend>
   cd <nom-du-dossier-backend>
   ```

2. Copiez et configurez le fichier d'environnement :
   ```
   cp .env.example .env
   ```
   Ajustez les variables dans `.env` si nécessaire.

3. Lancez les services Docker :
   ```
   docker-compose up -d
   ```

4. Installez les dépendances et démarrez l'application :
   ```
   npm install
   node ace migration:run
   node ace serve --watch
   ```

Le serveur sera accessible à `http://localhost:3333`.

## Services

- **Base de données**: PostgreSQL (port 5432)
- **Serveur mail**: Mailpit
  - SMTP: port 1025
  - Interface web: `http://localhost:8025`

## Développement

- Pour les emails, utilisez l'interface Mailpit à `http://localhost:8025`.
- Exécutez `node ace` pour voir la liste des commandes disponibles.

## Remarques

- Pour un déploiement en production, ajustez les configurations de base de données et d'email.
- Consultez la documentation d'AdonisJS pour plus de détails sur la configuration et le développement.
