#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until node -e "
const net = require('net');
const c = net.createConnection({ host: 'db', port: 5432 });
c.on('connect', () => { c.end(); process.exit(0); });
c.on('error', () => process.exit(1));
" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready"

npx prisma migrate deploy
npx prisma generate

exec npm run dev
