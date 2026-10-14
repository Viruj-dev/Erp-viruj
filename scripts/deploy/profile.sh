# Verified on EC2 on 2026-10-14. Runtime secrets stay in the original checkout.
SERVICE=viruj-auth
ORIGINAL_ROOT=/home/ubuntu/Erp-viruj
SERVICE_SUBDIR=apps/server
ENTRYPOINT=src/dev.ts
HEALTH_URL=http://127.0.0.1:3002/
BUN_VERSION=1.4.2
