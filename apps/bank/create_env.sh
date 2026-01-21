#!/usr/bin/env bash
set -euo pipefail

# Crée un fichier .env par défaut s’il n’existe pas déjà.
# Usage: ./create_env.sh [chemin/vers/.env]
#
# Par défaut, cible: ./apps/api/.env (relatif à la racine du repo)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_ENV_PATH="${SCRIPT_DIR}/.env"
ENV_PATH="${1:-$DEFAULT_ENV_PATH}"

if [[ -f "$ENV_PATH" ]]; then
  echo "Le fichier existe déjà: $ENV_PATH"
  exit 0
fi

mkdir -p "$(dirname "$ENV_PATH")"

cat > "$ENV_PATH" <<'EOF'
# Fichier .env généré par create_env.sh

# URL de connexion à la base de données MongoDB
DATABASE_URL=mongodb://localhost:27017/bank

# URLS autorisées pour les requêtes CORS
# (séparées par des point-virgules)
CORS_URL=http://localhost:5173;https://localhost:3000

# Port d’écoute du serveur
PORT=4000

# Secrets pour la génération des tokens JWT
ACCESS_TOKEN_SECRET=CHANGE_ME
REFRESH_TOKEN_SECRET=CHANGE_ME

# Durée de vie des tokens (en minutes)
ACCESS_TOKEN_LIFESPAN_MINUTES=5
REFRESH_TOKEN_LIFESPAN_MINUTES=43200

# Secret pour la protection CSRF
CSRF_SECRET=CHANGE_ME

# Activer les logs formatés (true/false)
# Si faux, les logs seront en JSON
PRETTY_LOGS=true
EOF

chmod 600 "$ENV_PATH" || true
echo "Fichier .env créé: $ENV_PATH"