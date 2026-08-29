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

: "${S3_BUCKET:?S3_BUCKET is required for off-instance data backups}"

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

while IFS= read -r source_file; do
  runtime_file="src/data/$(basename "$source_file")"
  listed=false
  for protected_file in "${protected_data_files[@]}"; do
    if [[ "$runtime_file" == "$protected_file" ]]; then
      listed=true
      break
    fi
  done

  if [[ "$listed" != true ]]; then
    echo "Backup failed: production data file $runtime_file is not in the protected manifest." >&2
    exit 1
  fi
done < <(find "$project_root/src/data" -maxdepth 1 -type f -name "*.json" -print | sort)

timestamp=$(date -u +"%Y%m%dT%H%M%SZ")
backup_root="${TEXTILEPOMS_BACKUP_DIR:-$(dirname "$project_root")/textilepoms-data-backups}"
backup_dir="$backup_root/$timestamp"
backup_region="${AWS_REGION:-${S3_REGION:-us-east-2}}"
s3_prefix="s3://$S3_BUCKET/textilepoms-data-backups/$timestamp"

mkdir -p "$backup_dir"
chmod 700 "$backup_root" "$backup_dir"

for file in "${protected_data_files[@]}"; do
  source_file="$project_root/$file"
  backup_file="$backup_dir/$file"

  if [[ ! -f "$source_file" ]]; then
    echo "Backup failed: production file $file is missing." >&2
    exit 1
  fi

  mkdir -p "$(dirname "$backup_file")"
  cp -p "$source_file" "$backup_file"

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

aws s3 cp "$backup_dir/" "$s3_prefix/" --recursive --sse AES256 --only-show-errors --region "$backup_region"

ln -sfn "$timestamp" "$backup_root/latest"
echo "Live data backup saved at $backup_dir and $s3_prefix/"
