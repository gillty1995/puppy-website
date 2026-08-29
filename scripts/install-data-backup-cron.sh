#!/usr/bin/env bash

set -Eeuo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
project_root=$(cd "$script_dir/.." && pwd)
backup_script="$script_dir/backup-live-data-on-server.sh"
backup_root="${TEXTILEPOMS_BACKUP_DIR:-$(dirname "$project_root")/textilepoms-data-backups}"
cron_marker="# textilepoms monthly live-data backup"
cron_schedule="${TEXTILEPOMS_BACKUP_CRON:-15 3 1 * *}"

[[ -f "$backup_script" ]] || {
  echo "Cron installation failed: $backup_script is missing." >&2
  exit 1
}

mkdir -p "$backup_root"
chmod 700 "$backup_root"

echo "Creating an immediate server and S3 data backup..."
bash "$backup_script"

cron_temp=$(mktemp)
trap 'rm -f "$cron_temp"' EXIT

crontab -l 2>/dev/null | grep -vF "$cron_marker" > "$cron_temp" || true
printf '%s /bin/bash %q >> %q 2>&1 %s\n' "$cron_schedule" "$backup_script" "$backup_root/backup.log" "$cron_marker" >> "$cron_temp"

crontab "$cron_temp"
echo "Monthly live-data backup cron installed: $cron_schedule UTC"
