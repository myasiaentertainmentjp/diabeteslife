#!/bin/bash

# D-LIFE Next.js Deployment Script
# VPS: 162.43.76.7, Port: 3001
# IMPORTANT: This script does NOT touch /var/www/akabuy/

set -e

VPS_HOST="162.43.76.7"
VPS_USER="root"
DEPLOY_PATH="/var/www/diabeteslife-nextjs"
LOCAL_PATH=$(dirname "$0")

echo "=== D-LIFE Next.js Deployment ==="
echo "Target: $VPS_HOST:$DEPLOY_PATH"
echo ""

# Build locally
echo "1. Building Next.js app..."
cd "$LOCAL_PATH"
npm run build

# Create deployment archive (excluding node_modules and other dev files)
echo "2. Creating deployment archive..."
tar -czf /tmp/dlife-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next/cache' \
  --exclude='src_old' \
  --exclude='backup_*' \
  .

# Upload to VPS
echo "3. Uploading to VPS..."
scp /tmp/dlife-deploy.tar.gz "$VPS_USER@$VPS_HOST:/tmp/"

# Deploy on VPS
echo "4. Deploying on VPS..."
ssh "$VPS_USER@$VPS_HOST" << 'ENDSSH'
set -e

# Create log directory
mkdir -p /var/log/dlife-nextjs

# Create backup of current deployment if exists
if [ -d /var/www/diabeteslife-nextjs ]; then
  echo "   Backing up current deployment..."
  mv /var/www/diabeteslife-nextjs /var/www/diabeteslife-nextjs.bak.$(date +%Y%m%d_%H%M%S)
fi

# Extract new deployment
echo "   Extracting new deployment..."
mkdir -p /var/www/diabeteslife-nextjs
cd /var/www/diabeteslife-nextjs
tar -xzf /tmp/dlife-deploy.tar.gz

# Install dependencies
echo "   Installing dependencies..."
npm install --omit=dev

# Restart PM2
echo "   Restarting PM2..."
pm2 delete dlife-nextjs 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Cleanup
rm /tmp/dlife-deploy.tar.gz

echo "   Deployment complete!"
ENDSSH

# Cleanup local
rm /tmp/dlife-deploy.tar.gz

echo ""
echo "=== Deployment Complete ==="
echo "Site should be available at: http://$VPS_HOST:3001"
