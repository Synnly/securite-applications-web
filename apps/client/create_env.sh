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

# URL de l’API backend
VITE_APIURL="https://localhost:3000"

# URL de l’API bank
VITE_BANKURL="https://localhost:4000"
EOF

chmod 600 "$ENV_PATH" || true
echo "Fichier .env créé: $ENV_PATH"