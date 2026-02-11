#!/usr/bin/env bash
set -e

# Working directory is packages/admin (Vercel Root Directory)
# Navigate to repo root for turbo builds
cd ../..

echo "=== Building Frontend ==="
npx turbo build --filter=@erp/frontend

echo "=== Building Admin (VITE_ADMIN_BASE=/admin) ==="
VITE_ADMIN_BASE=/admin npx turbo build --filter=@erp/admin --force

echo "=== Copying admin dist into frontend dist ==="
cp -r packages/admin/dist packages/frontend/dist/admin

echo "=== Creating 404.html fallback ==="
cp packages/frontend/dist/index.html packages/frontend/dist/404.html

echo "=== Build complete ==="
ls -la packages/frontend/dist/
