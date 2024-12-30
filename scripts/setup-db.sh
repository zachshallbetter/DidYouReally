#!/bin/bash

# Export database URL
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "Running migrations..."
npm run prisma:migrate

# Seed database
echo "Seeding database..."
npm run db:seed

echo "Database setup complete!" 