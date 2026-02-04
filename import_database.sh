#!/bin/bash

# Import script for Satun Province polygon data
# This script will import the database schema and polygon data into MySQL

echo "🌳 Satun Tree Map - Database Import Script"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Load database credentials from .env
source .env

# Check if MySQL is accessible
echo "📊 Checking MySQL connection..."
if ! mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to MySQL!"
    echo "Please make sure Docker MySQL container is running."
    exit 1
fi

echo "✅ MySQL connection successful!"

# Create database if not exists
echo "📦 Creating database: $DB_NAME"
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
echo "📝 Importing database schema..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < database_schema.sql
echo "✅ Schema imported!"

# Import districts polygon data
echo "🗺️  Importing districts polygon data..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < districts_polygon.sql
echo "✅ Districts imported!"

# Import tambons polygon data
echo "🗺️  Importing tambons (sub-districts) polygon data..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < tambons_polygon.sql
echo "✅ Tambons imported!"

# Import villages polygon data
echo "🗺️  Importing villages polygon data..."
if [ -f "satun_village_polygon.sql" ]; then
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < satun_village_polygon.sql
    echo "✅ Villages imported!"
else
    echo "⚠️  Warning: satun_village_polygon.sql not found, skipping villages import"
fi

# Verify import
echo ""
echo "🔍 Verifying import..."
echo "----------------------------------------"
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT 
    'Districts' as Layer, COUNT(*) as Count FROM districts_polygon
UNION ALL
SELECT 'Tambons' as Layer, COUNT(*) as Count FROM tambons_polygon
UNION ALL
SELECT 'Villages' as Layer, COUNT(*) as Count FROM villages_polygon
UNION ALL
SELECT 'Users' as Layer, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Trees' as Layer, COUNT(*) as Count FROM trees;
"

echo ""
echo "✨ Database import completed successfully!"
echo "🔐 Default admin account:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🚀 You can now run: npm run dev"
