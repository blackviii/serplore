#!/usr/bin/env bash
set -euo pipefail

SSH_KEY="/Users/chengqianzhao/Projects/pricematch-system/internal-operations-dashboard/ssh-key-18.144.7.15.pem"
SERVER="root@18.144.7.15"
REMOTE_DIR="/home/serplore"
PROJECT_DIR="/Users/chengqianzhao/Projects/serplore"
DOMAIN="serplore.com"
WWW_DOMAIN="www.serplore.com"
PORT="3465"

echo "=== Serplore Deploy ==="

echo "[1/6] Building frontend..."
cd "$PROJECT_DIR/web"
npm run build

echo "[2/6] Preparing remote directory..."
ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "$SERVER" "
  set -e
  mkdir -p '$REMOTE_DIR/server' '$REMOTE_DIR/web/dist' '$REMOTE_DIR/data' '$REMOTE_DIR/backups'
  if [ -d '$REMOTE_DIR/server/src' ]; then
    tar -C '$REMOTE_DIR' -czf '$REMOTE_DIR/backups/app-$(date +%Y%m%d%H%M%S).tgz' server web 2>/dev/null || true
  fi
"

echo "[3/6] Uploading server code..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'data' \
  --exclude 'backups' \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$PROJECT_DIR/server/" "$SERVER:$REMOTE_DIR/server/"

echo "[4/6] Uploading frontend dist..."
rsync -avz --delete \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$PROJECT_DIR/web/dist/" "$SERVER:$REMOTE_DIR/web/dist/"

echo "[5/6] Installing dependencies and configuring service..."
ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "$SERVER" "
  set -e
  cd '$REMOTE_DIR/server'
  npm install --omit=dev

  tmp_env=\$(mktemp)
  {
    echo NODE_ENV=production
    echo HOST=127.0.0.1
    echo PORT=$PORT
    echo SITE_URL=https://$DOMAIN
    echo DATA_DIR=$REMOTE_DIR/data
    if [ -f /home/civrenadvisory/.env ]; then
      grep -E '^(DISCORD_WEBHOOK_URL|DISCORD_BOT_TOKEN|DISCORD_CHANNEL_ID)=' /home/civrenadvisory/.env || true
    fi
  } > \"\$tmp_env\"
  install -m 600 \"\$tmp_env\" '$REMOTE_DIR/server/.env'
  rm -f \"\$tmp_env\"

  nginx_conf=/www/server/panel/vhost/nginx/$DOMAIN.conf
  if [ -f \"\$nginx_conf\" ]; then
    cp \"\$nginx_conf\" \"\$nginx_conf.bak-serplore-\$(date +%Y%m%d%H%M%S)\"
    perl -0pi -e 's#proxy_pass\\s+http://127\\.0\\.0\\.1:\\d+;#proxy_pass http://127.0.0.1:3465;#g' \"\$nginx_conf\"
    tmp_nginx_conf=\$(mktemp)
    awk '
      /#PROXY-CONF-START/ {
        print
        print \"    location ^~ / {\"
        print \"      proxy_pass http://127.0.0.1:3465;\"
        print \"      proxy_set_header Host \$http_host;\"
        print \"      proxy_set_header X-Real-IP \$remote_addr;\"
        print \"      proxy_set_header X-Real-Port \$remote_port;\"
        print \"      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\"
        print \"      proxy_set_header X-Forwarded-Proto \$scheme;\"
        print \"      proxy_set_header X-Forwarded-Host \$host;\"
        print \"      proxy_set_header X-Forwarded-Port \$server_port;\"
        print \"      proxy_set_header REMOTE-HOST \$remote_addr;\"
        print \"      proxy_connect_timeout 60s;\"
        print \"      proxy_send_timeout 600s;\"
        print \"      proxy_read_timeout 600s;\"
        print \"      proxy_http_version 1.1;\"
        print \"      proxy_set_header Upgrade \$http_upgrade;\"
        print \"      proxy_set_header Connection \$connection_upgrade;\"
        print \"    }\"
        skip=1
        next
      }
      /#PROXY-CONF-END/ {
        skip=0
        print
        next
      }
      !skip { print }
    ' \"\$nginx_conf\" > \"\$tmp_nginx_conf\"
    cat \"\$tmp_nginx_conf\" > \"\$nginx_conf\"
    rm -f \"\$tmp_nginx_conf\"
  else
    cat > \"\$nginx_conf\" <<'NGINX'
server {
    listen 80;
    server_name serplore.com www.serplore.com;

    location / {
        proxy_pass http://127.0.0.1:3465;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
    }
}
NGINX
  fi

  nginx -t
  nginx -s reload
"

echo "[6/6] Restarting service..."
ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "$SERVER" "
  set -e
  cd '$REMOTE_DIR/server'
  node --check src/index.js
  pm2 delete serplore 2>/dev/null || true
  pm2 start src/index.js --name serplore --cwd '$REMOTE_DIR/server' --update-env
  pm2 save
  sleep 2
  pm2 status serplore
  curl -sS http://127.0.0.1:$PORT/health
"

echo ""
echo "=== Deploy complete! ==="
echo "URL: https://$DOMAIN"
