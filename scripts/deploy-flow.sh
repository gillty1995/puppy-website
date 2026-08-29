#!/usr/bin/env bash

set -Eeuo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
project_root=$(cd "$script_dir/.." && pwd)
cd "$project_root"

if [[ -f "$project_root/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$project_root/.env.local"
  set +a
fi

echo "Step 1/4: Backing up all live runtime data locally..."
bash scripts/backup-live-data-local.sh

echo "Step 2/4: Merging live adoption reviews into the local data file..."
npm run sync-reviews

echo "Step 3/4: Building the application..."
npm run build

echo "Step 4/4: Verifying protected data and deploying application code..."
bash scripts/deploy.sh
