# GitHub Actions → EC2 deployment

## Status

The pipeline files are implemented locally. **Automatic deployment is not activated yet.**
Push these files to GitHub, configure the production environment and SSH access below,
then enable the repository variable. No production services were changed while preparing this pipeline.

## Verified EC2 setup (14 October 2026)

| Setting | Value |
| --- | --- |
| AWS region | `ap-south-1` (Mumbai) |
| Instance | `i-036915a4843d996c6` |
| Public IPv4 at inspection | `13.203.209.125` |
| SSH user | `ubuntu` |
| systemd service | `viruj-auth.service` |
| Existing checkout | `/home/ubuntu/Erp-viruj` |
| Bun executable / version | `/home/ubuntu/.bun/bin/bun`, `1.4.2` |
| HTTP port | `3002` |
| Reverse proxy | Caddy |

Both servers run Bun directly under systemd; Docker is not installed. Auth and central
backend are separate repositories and separate EC2 instances. Each repository deploys
its own service. Vercel continues handling the UI independently; this does not make
Vercel and both backends an atomic coordinated release.

## What happens on each push

1. Pull requests and pushes to `main` install locked dependencies and run service
   type checks and regression tests. Auth also runs its production build. The backend
   generates Prisma Client before checking types and running tests.
2. The deployment job runs only after checks pass, on `main`, with
   `EC2_DEPLOY_ENABLED=true`. Manual workflow runs also require `main` and repeat CI.
3. Actions archives the exact checked-out commit and transfers it using OpenSSH.
   Environment files, private keys, backups, uploaded files and Git history are excluded.
   There is no repository token or AWS access key copied to EC2.
4. EC2 installs dependencies in a new directory before touching the live service.
   Bun must match the tested `1.4.2` version. Existing runtime dotenv files and backend
   storage are linked from the original checkout. Existing systemd `EnvironmentFile`
   directives, including the backend's AI and mobile-auth files, stay in effect.
5. A dedicated systemd drop-in changes the working directory and entry point to the
   release, then restarts only `viruj-auth`. The prior configuration is restored on a
   failed restart or health check. Other services, including `viruj-ai`, remain untouched.
6. A server lock and workflow concurrency prevent overlapping deployment changes;
   older workflow run numbers cannot overwrite newer successful releases.

A restart causes a short interruption; this is not zero-downtime deployment.
The backend checks `/ready` (including its database connection). Auth checks `/`,
which confirms HTTP startup but does not prove a complete sign-in flow.
Database integration suites are opt-in and skipped in this default CI; it uses no
production credentials. The separate payment application is not deployed by this workflow.

## One-time activation

### 1. Configure a dedicated SSH key

Create a separate key for this repository on your trusted machine:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-viruj-auth -C github-actions-viruj-auth -N ''
```

Using the existing AWS EC2 Instance Connect session for the instance above, add the
**public** `.pub` key to `/home/ubuntu/.ssh/authorized_keys`. Prefix the public key line
with `restrict ` to disable forwarding and PTY access; noninteractive SSH and SCP still
work. Keep `.ssh` at mode `700` and `authorized_keys` at `600`. Never paste the private
key into code, a chat message, or EC2 `authorized_keys`.

The deploy user needs noninteractive sudo for the systemd drop-in, daemon reload and
service restart. Ubuntu's existing sudo setup may already allow this; check `sudo -n true`.
This key lets the production workflow execute code as `ubuntu` and use its sudo rights.
Protect repository write access and restrict the production environment to `main`.
Do not add broad new security-group rules: SSH was already reachable at inspection.
If port 22 is restricted later, use a runner with an approved fixed source IP.

### 2. Record the trusted SSH host key

In the authenticated EC2 console terminal, run:

```bash
awk '{print "13.203.209.125 " $1 " " $2}' /etc/ssh/ssh_host_ed25519_key.pub
```

The output is the public server identity for `EC2_KNOWN_HOSTS`. Verify it through the
AWS console; do not blindly trust a fresh `ssh-keyscan` result in the workflow.
Neither instance had an Elastic IP at inspection. If its public IP changes after a
stop/start, update `EC2_HOST` and the hostname prefix in `EC2_KNOWN_HOSTS`.

### 3. Set GitHub configuration

In this repository, open **Settings → Environments → New environment**, name it
`production`, and restrict deployment branches to `main`. Add these environment secrets:

| Secret | Value |
| --- | --- |
| `EC2_HOST` | `13.203.209.125` (verify current IP first) |
| `EC2_SSH_KEY` | Full private key created for this repository |
| `EC2_KNOWN_HOSTS` | Verified host-key line from the console command above |

Under **Settings → Secrets and variables → Actions → Variables**, create the
**repository variable** `EC2_DEPLOY_ENABLED` with value `true` when ready for the first
restart. It must be a repository variable, not an environment variable: the job's
condition is evaluated before environment variables are available.

For completely automatic deployment, leave required reviewers disabled on `production`.
Branch protection should require the workflow's `check` job before merging.
No AWS root password or AWS access keys belong in GitHub Actions.

### 4. Run and verify the first deployment

Push the pipeline changes to `main` or use **Actions → auth CI and EC2 deployment → Run workflow**
after merging. Check that both `check` and `deploy` pass. On EC2:

```bash
systemctl is-active viruj-auth
systemctl show viruj-auth --property=WorkingDirectory --value
readlink -f /home/ubuntu/.local/share/viruj-deploy/viruj-auth/current
curl --fail http://127.0.0.1:3002/
```

Also verify a real login/API request through the public domain. This has not yet been
validated against production with the new release layout. If the existing unit has
path-specific sandbox rules, adapt them to allow the release directory before enabling.

## Runtime configuration, migrations and rollback

After the first deployment, systemd runs from
`/home/ubuntu/.local/share/viruj-deploy/viruj-auth/current`, not the original Git checkout.
Keep the original checkout: runtime dotenv files and backend uploads still live there.
Server-only untracked helper scripts are preserved there; they are not executed by CI.
Tracked emergency edits cause deployment to stop rather than overwrite them silently.

Database migrations are deliberately **not automatic**. This codebase uses multiple
databases, Prisma/Drizzle and standalone SQL changes. Apply reviewed, backward-compatible
schema migrations before code that requires them. Never run `db:push` or
`prisma migrate dev` against production from this workflow. Code rollback does not undo
schema changes or application writes. Keep backups and plan incompatible changes separately.

The deployer preserves the current and previous release and prunes older pipeline-created
release directories before staging a new one. Allow disk space for three releases during
an update; auth installs only the server workspace and its dependencies. Successful archive
uploads are removed after deployment; failed uploads under `incoming/` may need cleanup.

For manual rollback after a successful deployment, set `EC2_DEPLOY_ENABLED=false` first,
then, on EC2, verify `previous` points to the intended release:

```bash
cd /home/ubuntu/.local/share/viruj-deploy/viruj-auth
readlink -f previous
ln -sfn "$(readlink -f previous)" current.rollback
mv -Tf current.rollback current
sudo systemctl restart viruj-auth
curl --fail http://127.0.0.1:3002/
```

After the very first successful deployment there is no `previous` pipeline release.
To return to the original checkout, remove only this pipeline's drop-in:

```bash
sudo rm /etc/systemd/system/viruj-auth.service.d/99-github-deploy.conf
sudo systemctl daemon-reload
sudo systemctl restart viruj-auth
```

Re-enable deployments after fixing the issue. A new workflow run has a higher sequence
number; rerunning the already successful older run intentionally does not redeploy it.
Automatic rollback handles ordinary command failures and termination signals; power loss
or a forced kill can require the manual recovery above.

## Local pipeline checks

```bash
for script in scripts/deploy/*.sh scripts/test-ci.sh; do bash -n "$script"; done
shellcheck -x -P SCRIPTDIR scripts/deploy/deploy-ec2.sh scripts/deploy/send-release.sh scripts/test-ci.sh
python3 scripts/deploy/test_deployment.py
```

The deployment regression tests use temporary files and mocked systemd/Bun/HTTP commands;
they never contact EC2 or restart a real service. Run application tests in a clean checkout
without production `.env` files because Bun automatically loads dotenv files.

References: [GitHub deployment environments](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/deploy-to-environment),
[Bun frozen installs](https://bun.sh/docs/pm/cli/install),
[Bun workspace filtering](https://bun.sh/docs/pm/filter).
