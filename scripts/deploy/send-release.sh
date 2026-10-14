#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# shellcheck source=profile.sh
source scripts/deploy/profile.sh
: "${EC2_HOST:?Set the EC2_HOST environment secret}"
: "${EC2_SSH_KEY:?Set the EC2_SSH_KEY environment secret}"
: "${EC2_KNOWN_HOSTS:?Set the EC2_KNOWN_HOSTS environment secret}"
: "${GITHUB_SHA:?}" "${GITHUB_RUN_NUMBER:?}" "${GITHUB_RUN_ATTEMPT:?}"
[[ "$EC2_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || exit 1
[[ "$GITHUB_SHA" =~ ^[a-f0-9]{40}$ ]] || exit 1
[[ "$GITHUB_RUN_NUMBER" =~ ^[0-9]+$ && "$GITHUB_RUN_ATTEMPT" =~ ^[0-9]+$ ]] || exit 1
umask 077
scratch=$(mktemp -d)
trap 'rm -rf -- "$scratch"' EXIT
printf '%s\n' "$EC2_SSH_KEY" > "$scratch/key"
printf '%s\n' "$EC2_KNOWN_HOSTS" > "$scratch/known_hosts"
ssh-keygen -y -f "$scratch/key" > /dev/null
ssh_options=(-i "$scratch/key" -o BatchMode=yes -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$scratch/known_hosts"
  -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=4)
remote="ubuntu@$EC2_HOST"
run_id="$GITHUB_RUN_NUMBER-$GITHUB_RUN_ATTEMPT-$GITHUB_SHA"
incoming="/home/ubuntu/.local/share/viruj-deploy/$SERVICE/incoming/$run_id"
python3 scripts/deploy/package-release.py "$scratch/release.tar.gz"
cp scripts/deploy/{deploy-ec2.sh,profile.sh} "$scratch/"
(cd "$scratch" && sha256sum release.tar.gz deploy-ec2.sh profile.sh > SHA256SUMS)
# Values below are validated identifiers and intentionally expanded locally.
# shellcheck disable=SC2029
ssh "${ssh_options[@]}" "$remote" "umask 077; mkdir -p '$incoming'"
scp "${ssh_options[@]}" "$scratch/"{release.tar.gz,deploy-ec2.sh,profile.sh,SHA256SUMS} "$remote:$incoming/"
# GNU timeout sends TERM to the remote deployment, triggering its rollback trap.
# shellcheck disable=SC2029
ssh "${ssh_options[@]}" "$remote" "cd '$incoming' && sha256sum --check --status SHA256SUMS && timeout --signal=TERM --kill-after=120s 15m bash ./deploy-ec2.sh '$GITHUB_SHA' '$GITHUB_RUN_NUMBER' '$GITHUB_RUN_ATTEMPT'"
