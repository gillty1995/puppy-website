#!/usr/bin/env bash

set -Eeuo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
project_root=$(cd "$script_dir/.." && pwd)
manifest="$script_dir/protected-data-files.txt"
cd "$project_root"

: "${DEPLOY_KEY:?DEPLOY_KEY is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"

[[ -f "$manifest" ]] || {
  echo "Deploy safety check failed: protected data manifest not found." >&2
  exit 1
}

protected_data_files=()
while IFS= read -r file || [[ -n "$file" ]]; do
  [[ -z "$file" || "$file" == "#"* ]] && continue
  if [[ "$file" == /* || "$file" == *".."* ]]; then
    echo "Deploy safety check failed: unsafe protected data path '$file'." >&2
    exit 1
  fi
  protected_data_files+=("$file")
done < "$manifest"

if [[ "${#protected_data_files[@]}" -eq 0 ]]; then
  echo "Deploy safety check failed: protected data manifest is empty." >&2
  exit 1
fi

rsync_args=(
  -avz
  --delete
  -e "ssh -i $DEPLOY_KEY"
  --exclude "node_modules"
  --exclude ".git"
  --exclude "backups/"
  --exclude "public/uploads/"
  --exclude "/src/data/*.json"
  --filter "protect /src/data/*.json"
)

for file in "${protected_data_files[@]}"; do
  rsync_args+=(--exclude "/$file")
  rsync_args+=(--filter "protect /$file")
done

echo "Checking protected runtime data files before deploy..."
for file in "${protected_data_files[@]}"; do
  if [[ " ${rsync_args[*]} " != *" --exclude /$file "* ]]; then
    echo "Deploy safety check failed: $file is not excluded." >&2
    exit 1
  fi
done

remote_target="$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/"
dry_run_output=$(rsync "${rsync_args[@]}" --dry-run --itemize-changes ./ "$remote_target")

for file in "${protected_data_files[@]}"; do
  if grep -Fq "$file" <<<"$dry_run_output"; then
    echo "Deploy safety check failed: rsync would modify $file." >&2
    exit 1
  fi
done

if [[ "${DEPLOY_DRY_RUN:-false}" == "true" ]]; then
  echo "Dry run requested. No files were deployed."
  exit 0
fi

echo "Protected data check passed. Deploying application files..."
rsync "${rsync_args[@]}" ./ "$remote_target"

npm run push-images

ssh -i "$DEPLOY_KEY" "$DEPLOY_USER@$DEPLOY_HOST" \
  "cd '$DEPLOY_PATH' && bash scripts/install-data-backup-cron.sh && npm install --production && (pm2 restart textilepoms || pm2 start 'npm start' --name textilepoms)"
