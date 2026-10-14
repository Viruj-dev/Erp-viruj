#!/usr/bin/env bash
# Runs as ubuntu on EC2. Builds a separate release before touching the running service.
set -Eeuo pipefail
umask 077
script_dir=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=profile.sh
source "$script_dir/profile.sh"
sha=${1:?commit SHA required}
sequence=${2:?run number required}
attempt=${3:?run attempt required}
[[ "$sha" =~ ^[a-f0-9]{40}$ && "$sequence" =~ ^[0-9]+$ && "$attempt" =~ ^[0-9]+$ ]] || exit 1
[[ "$(id -un)" == ubuntu ]] || { echo 'Run as ubuntu' >&2; exit 1; }
export PATH="/home/ubuntu/.bun/bin:$PATH"
[[ "$(bun --version)" == "$BUN_VERSION" ]] || { echo "Expected Bun $BUN_VERSION" >&2; exit 1; }
base="/home/ubuntu/.local/share/viruj-deploy/$SERVICE"
mkdir -p "$base/releases"
exec 9> "$base/deploy.lock"
flock -w 60 9 || { echo 'Another deployment is running' >&2; exit 1; }
# Ignore runs that finish out of order, including retries of an older commit.
if [[ -f "$base/last-success" ]]; then
  read -r last_sequence last_attempt < "$base/last-success"
  if (( sequence < last_sequence || (sequence == last_sequence && attempt <= last_attempt) )); then
    echo 'A newer or identical workflow run is already deployed.'
    exit 0
  fi
fi
sudo -n true
systemctl is-active --quiet "$SERVICE"
[[ "$(systemctl show "$SERVICE" --property=User --value)" == ubuntu ]] || exit 1
[[ -d "$ORIGINAL_ROOT" ]] || exit 1
# Never overwrite emergency edits in the original checkout silently.
git -C "$ORIGINAL_ROOT" diff --quiet
git -C "$ORIGINAL_ROOT" diff --cached --quiet
release="$base/releases/$sequence-$attempt-$sha"
[[ ! -e "$release" ]] || { echo 'Release already exists; rerun the workflow for a new attempt.' >&2; exit 1; }
# Prune only retired pipeline releases, preserving the current and previous releases.
current=$(readlink -f "$base/current" || true)
previous=$(readlink -f "$base/previous" || true)
for old in "$base"/releases/*; do
  [[ -d "$old" && ! -L "$old" ]] || continue
  [[ "$old" == "$current" || "$old" == "$previous" ]] || rm -rf -- "$old"
done
mkdir "$release"
tar -xzf "$script_dir/release.tar.gz" -C "$release" --no-same-owner
cd "$release"
if [[ "$SERVICE" == viruj-auth ]]; then
  bun install --frozen-lockfile --filter server
  bun run --cwd apps/server build
else
  bun install --frozen-lockfile
  bun run prisma:generate
fi
# Only link runtime configuration after package lifecycle scripts and builds finish.
# Preserve dotenv precedence without reading secrets into logs or GitHub Actions.
link_env() {
  local source_dir=$1 target_dir=$2 name
  for name in .env .env.local .env.production .env.production.local; do
    if [[ -f "$source_dir/$name" ]]; then
      ln -s "$source_dir/$name" "$target_dir/$name"
    fi
  done
}
link_env "$ORIGINAL_ROOT" "$release"
if [[ "$SERVICE" == viruj-auth ]]; then
  [[ -f "$ORIGINAL_ROOT/apps/server/.env" ]] || { echo 'Auth .env is missing' >&2; exit 1; }
  link_env "$ORIGINAL_ROOT/apps/server" "$release/apps/server"
else
  [[ -f "$ORIGINAL_ROOT/.env" ]] || { echo 'Backend .env is missing' >&2; exit 1; }
  [[ -d "$ORIGINAL_ROOT/storage" ]] || { echo 'Persistent storage directory is missing' >&2; exit 1; }
  ln -s "$ORIGINAL_ROOT/storage" "$release/storage"
fi
# Existing systemd Environment/EnvironmentFile, sandboxing and Caddy config remain intact.
dropin_dir="/etc/systemd/system/$SERVICE.service.d"
dropin="$dropin_dir/99-github-deploy.conf"
rollback_dir=$(mktemp -d "$base/rollback.XXXXXX")
had_dropin=false
if sudo -n test -f "$dropin"; then
  # Redirect intentionally writes to an ubuntu-owned backup, not to /etc.
  # shellcheck disable=SC2024
  sudo -n cat "$dropin" > "$rollback_dir/previous.conf"
  had_dropin=true
fi
previous_current=$(readlink "$base/current" || true)
if [[ -e "$base/current" && ! -L "$base/current" ]]; then
  echo 'current must be a symlink' >&2
  exit 1
fi
health() {
  local count
  for ((count = 0; count < 30; count++)); do
    if systemctl is-active --quiet "$SERVICE" && curl --fail --silent --max-time 5 "$HEALTH_URL" > /dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}
rollback() {
  local status=$?
  trap - ERR INT TERM HUP
  set +e
  echo 'Deployment failed; restoring the previous service configuration.' >&2
  if [[ -n "$previous_current" ]]; then
    ln -sfn "$previous_current" "$base/current.restore"
    mv -Tf "$base/current.restore" "$base/current"
  else
    rm -f "$base/current"
  fi
  if "$had_dropin"; then
    sudo -n install -m 644 "$rollback_dir/previous.conf" "$dropin"
  else
    sudo -n rm -f "$dropin"
  fi
  sudo -n systemctl daemon-reload
  sudo -n systemctl restart "$SERVICE"
  if health; then
    echo 'Previous release restored.' >&2
  else
    echo 'ROLLBACK HEALTH CHECK FAILED. Inspect the service on EC2 immediately.' >&2
  fi
  exit "${status:-1}"
}
# All errors/signals after promotion starts must attempt rollback.
trap rollback ERR
trap 'false' INT TERM HUP
ln -sfn "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
cat > "$rollback_dir/next.conf" <<EOF
[Service]
WorkingDirectory=$base/current/$SERVICE_SUBDIR
ExecStart=
ExecStart=/home/ubuntu/.bun/bin/bun run $ENTRYPOINT
EOF
sudo -n mkdir -p "$dropin_dir"
sudo -n install -m 644 "$rollback_dir/next.conf" "$dropin"
sudo -n systemctl daemon-reload
sudo -n systemctl restart "$SERVICE"
health
# Allow fast crash loops to become visible before declaring success.
sleep 5
systemctl is-active --quiet "$SERVICE"
curl --fail --silent --max-time 5 "$HEALTH_URL" > /dev/null
if [[ -n "$previous_current" ]]; then
  ln -sfn "$previous_current" "$base/previous"
fi
printf '%s %s\n' "$sequence" "$attempt" > "$base/last-success.next"
mv -f "$base/last-success.next" "$base/last-success"
trap - ERR INT TERM HUP
rm -rf -- "$rollback_dir"
rm -f "$script_dir/release.tar.gz"
echo "Deployed $SERVICE at $sha; health check passed."
