#!/usr/bin/env bash

set -Eeuo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
project_root=$(cd "$script_dir/.." && pwd)
manifest="$script_dir/protected-data-files.txt"

if [[ -f "$project_root/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$project_root/.env.local"
  set +a
fi

: "${DEPLOY_KEY:?DEPLOY_KEY is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"

[[ -f "$manifest" ]] || {
  echo "Backup failed: protected data manifest not found at $manifest." >&2
  exit 1
}

protected_data_files=()
while IFS= read -r file || [[ -n "$file" ]]; do
  [[ -z "$file" || "$file" == "#"* ]] && continue
  if [[ "$file" == /* || "$file" == *".."* ]]; then
    echo "Backup failed: unsafe protected data path '$file'." >&2
    exit 1
  fi
  protected_data_files+=("$file")
done < "$manifest"

if [[ "${#protected_data_files[@]}" -eq 0 ]]; then
  echo "Backup failed: protected data manifest is empty." >&2
  exit 1
fi

remote_target="$DEPLOY_USER@$DEPLOY_HOST"
remote_json_files=$(ssh -o BatchMode=yes -o ConnectTimeout=12 -i "$DEPLOY_KEY" "$remote_target" "find '$DEPLOY_PATH/src/data' -maxdepth 1 -type f -name '*.json' -printf 'src/data/%f\\n' | sort")

while IFS= read -r remote_file || [[ -n "$remote_file" ]]; do
  [[ -z "$remote_file" ]] && continue
  listed=false
  for protected_file in "${protected_data_files[@]}"; do
    if [[ "$remote_file" == "$protected_file" ]]; then
      listed=true
      break
    fi
  done

  if [[ "$listed" != true ]]; then
    echo "Backup failed: production data file $remote_file is not in the protected manifest." >&2
    exit 1
  fi
done <<< "$remote_json_files"

timestamp=$(date -u +"%Y%m%dT%H%M%SZ")
backup_root="$project_root/backups/live-data"
backup_dir="$backup_root/$timestamp"
mkdir -p "$backup_dir/src/data"
chmod 700 "$backup_root" "$backup_dir"

rsync_args=(
  -az
  -e "ssh -i $DEPLOY_KEY"
)

for file in "${protected_data_files[@]}"; do
  rsync_args+=(--include "${file#src/data/}")
done
rsync_args+=(--exclude "*")

remote_source="$remote_target:$DEPLOY_PATH/src/data/"
rsync "${rsync_args[@]}" "$remote_source" "$backup_dir/src/data/"

for file in "${protected_data_files[@]}"; do
  backup_file="$backup_dir/$file"
  if [[ ! -f "$backup_file" ]]; then
    echo "Backup failed: production file $file was not downloaded." >&2
    exit 1
  fi

  node -e '
    const fs = require("fs");
    const file = process.argv[1];
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error(file + " must contain a JSON array");
    }
  ' "$backup_file"
done

cp "$manifest" "$backup_dir/protected-data-files.txt"
chmod -R go-rwx "$backup_dir"
ln -sfn "$timestamp" "$backup_root/latest"

echo "Live data backup saved locally at $backup_dir"
