#!/usr/bin/env bash
#
# Deploys topin.uz on the droplet. Not run by hand — .github/workflows/deploy.yml
# pipes this over SSH on every push to main:
#
#     ssh root@<host> 'bash -s' < scripts/deploy.sh
#
# Piping (rather than running the copy already on the server) means the deploy
# steps always match the commit being deployed.
set -euo pipefail

APP_DIR=${APP_DIR:-/var/www/topin-uz}
PM2_APP=${PM2_APP:-topin-platform}
# Checked directly on the Node port, not through nginx: this is testing whether
# the app came back up, not whether TLS and DNS work.
HEALTH_URL=${HEALTH_URL:-http://127.0.0.1:3000/api/shops?limit=1}
BACKUP_DIR=${BACKUP_DIR:-/root/deploy-backups}
KEEP_BACKUPS=10

log() { printf '\n=== %s\n' "$1"; }

# A non-interactive SSH session skips the shell profile, so nvm's PATH is often
# missing and pm2 appears not to exist. Load it before giving up.
if ! command -v pm2 >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$HOME/.nvm/nvm.sh"
fi
command -v pm2 >/dev/null 2>&1 || { echo "pm2 not found on PATH — aborting"; exit 1; }

cd "$APP_DIR"
PREV_SHA=$(git rev-parse HEAD)
log "currently deployed: $PREV_SHA"

# --- backup ----------------------------------------------------------------
# database.sqlite is gitignored, so nothing below could restore it. Snapshot it
# before the restart, because that is when initDb applies any schema change.
log "backing up the database"
mkdir -p "$BACKUP_DIR"
STAMP=$(date +%F-%H%M%S)
cp backend/database.sqlite "$BACKUP_DIR/database-$STAMP.sqlite"
ls -1t "$BACKUP_DIR"/database-*.sqlite 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f
echo "saved $BACKUP_DIR/database-$STAMP.sqlite (keeping the newest $KEEP_BACKUPS)"

# --- pull ------------------------------------------------------------------
# --ff-only on purpose. A hard reset here would revert the tracked files under
# frontend/uploads/; if someone has edited files on the server this stops and
# says so rather than guessing.
log "pulling origin/main"
git pull --ff-only origin main
NEW_SHA=$(git rev-parse HEAD)

if [ "$PREV_SHA" = "$NEW_SHA" ]; then
    echo "already at $NEW_SHA — restarting anyway to pick up any manual change"
fi

# --- dependencies ----------------------------------------------------------
if ! git diff --quiet "$PREV_SHA" "$NEW_SHA" -- backend/package.json; then
    log "backend/package.json changed — installing"
    npm --prefix backend install --omit=dev
fi

# --- restart ---------------------------------------------------------------
# Required, not optional: new routes, shops.html held in memory as _shopsHtml,
# the per-category API cache, and any schema change in initDb all need it.
log "restarting $PM2_APP"
pm2 restart "$PM2_APP" --update-env

# --- health check ----------------------------------------------------------
log "health check"
healthy=0
for i in $(seq 1 20); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL" || true)
    if [ "$code" = "200" ]; then
        healthy=1
        echo "healthy after ${i}s (HTTP 200)"
        break
    fi
    sleep 1
done

if [ "$healthy" != "1" ]; then
    log "UNHEALTHY — rolling back to $PREV_SHA"
    # Tracked files only. Untracked uploads under frontend/uploads/ are not
    # touched, and no `git clean` runs anywhere in this script.
    git reset --hard "$PREV_SHA"
    pm2 restart "$PM2_APP" --update-env
    sleep 5
    rb=$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL" || true)
    echo "after rollback: HTTP $rb"
    echo "the database backup from before this deploy is at $BACKUP_DIR/database-$STAMP.sqlite"
    echo "note: a schema change already applied by initDb is NOT undone by the rollback"
    exit 1
fi

log "deployed $NEW_SHA"
