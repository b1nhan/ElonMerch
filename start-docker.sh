#!/bin/bash

# ELon Merch - Docker Environment Setup

echo "🚀 Starting ELon Merch Dockerized Environment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Load environment variables from .env (create if doesn't exist)
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

# Create necessary directories
mkdir -p api frontend/dist

# Build and start containers
echo "🏗️  Building Docker images..."
docker-compose build

echo "▶️  Starting containers..."
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

echo ""
echo "✅ Environment is ready!"
echo ""
echo "📋 Services running:"
echo "   • Backend API: http://api.localhost (or http://localhost:80)"
echo "   • Frontend: http://localhost"
echo "   • phpMyAdmin: http://localhost:8080"
echo "   • MySQL: localhost:3306"
echo ""
echo "🔐 Database Credentials:"
echo "   • User: $(grep DB_USER .env | cut -d '=' -f2)"
echo "   • Password: $(grep DB_PASSWORD .env | cut -d '=' -f2)"
echo "   • Database: $(grep DB_NAME .env | cut -d '=' -f2)"
echo ""
echo "📝 Useful commands:"
echo "   • View logs: docker-compose logs -f [service-name]"
echo "   • Stop containers: docker-compose down"
echo "   • Rebuild: docker-compose build --no-cache"
echo ""
